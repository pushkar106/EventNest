import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Button, IconButton } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { createRazorpayOrder, mockPay } from '../store/slices/bookingSlice';
import { fetchMyTickets } from '../store/slices/ticketsSlice';
import { fetchNotifications } from '../store/slices/notificationsSlice';
import { colors } from '../theme';

export default function PaymentScreen({ route, navigation }) {
  const { bookingId } = route.params;
  const dispatch = useDispatch();
  const { loading, current } = useSelector((s) => s.booking);
  const [mode, setMode] = useState('mock');

  const payMock = async () => {
    setMode('mock');
    const res = await dispatch(mockPay(bookingId));
    if (res.meta.requestStatus === 'fulfilled') {
      dispatch(fetchMyTickets());
      dispatch(fetchNotifications());
      Alert.alert('Payment successful', 'Your QR ticket is ready.');
      navigation.replace('QRTicket', { id: res.payload._id });
    } else {
      Alert.alert('Payment failed', res.payload);
    }
  };

  const payRazorpay = async () => {
    setMode('razorpay');
    const res = await dispatch(createRazorpayOrder(bookingId));
    if (res.meta.requestStatus !== 'fulfilled') {
      Alert.alert('Order failed', res.payload);
      return;
    }
    if (res.payload.isMock) {
      Alert.alert('Demo Payment Mode', 'Razorpay keys not configured — completing via mock payment.');
      return payMock();
    }
    Alert.alert(
      'Razorpay TEST',
      `Order ${res.payload.orderId} created. Native checkout SDK is not bundled in Expo Go. Use mock payment fallback for demo?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Complete via Mock', onPress: payMock },
      ]
    );
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <IconButton icon="arrow-left" iconColor={colors.white} onPress={() => navigation.goBack()} style={{ marginLeft: -8 }} />
        <Text style={styles.title}>Payment</Text>
      </View>
      <Text style={styles.sub}>Booking {current?.bookingId} · Amount ₹{current?.totalAmount ?? '--'}</Text>
      <View style={styles.card}>
        <Text style={styles.name}>Mock payment (Demo)</Text>
        <Text style={styles.meta}>Completes instantly, generates a unique QR ticket, and saves to MongoDB.</Text>
        <Button mode="contained" loading={loading && mode === 'mock'} onPress={payMock} style={styles.btn}>Pay ₹{current?.totalAmount ?? 0} (Mock)</Button>
      </View>
      <View style={styles.card}>
        <Text style={styles.name}>Razorpay TEST</Text>
        <Text style={styles.meta}>Creates a real TEST order when keys are configured. Falls back to mock otherwise.</Text>
        <Button mode="outlined" loading={loading && mode === 'razorpay'} textColor={colors.white} onPress={payRazorpay} style={styles.outline}>Create Razorpay order</Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.navy, padding: 18, paddingTop: 48 },
  header: { flexDirection: 'row', alignItems: 'center' },
  title: { color: colors.white, fontSize: 24, fontWeight: '800' },
  sub: { color: colors.muted, marginVertical: 8 },
  card: { backgroundColor: colors.card, padding: 16, borderRadius: 16, marginTop: 14 },
  name: { color: colors.white, fontWeight: '700', fontSize: 16 },
  meta: { color: colors.muted, marginVertical: 8 },
  btn: { backgroundColor: colors.purple, borderRadius: 12 },
  outline: { borderColor: '#2A3654', borderRadius: 12 },
});
