import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Button, IconButton } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { createBooking } from '../store/slices/bookingSlice';
import { colors } from '../theme';

export default function BookingConfirmScreen({ route, navigation }) {
  const { eventId, ticketTypeId, quantity } = route.params;
  const dispatch = useDispatch();
  const event = useSelector((s) => s.events.current);
  const { loading } = useSelector((s) => s.booking);
  const ticket = (event?.ticketTypes || []).find((t) => t._id === ticketTypeId);
  const [busy, setBusy] = useState(false);

  const subtotal = ticket ? ticket.price * quantity : 0;
  const tax = subtotal > 0 ? Math.round(subtotal * 0.18 * 100) / 100 : 0;
  const fee = subtotal > 0 ? Math.round(subtotal * 0.02 * 100) / 100 : 0;
  const total = Math.round((subtotal + tax + fee) * 100) / 100;

  const onConfirm = async () => {
    setBusy(true);
    const res = await dispatch(createBooking({ eventId, ticketTypeId, quantity }));
    setBusy(false);
    if (res.meta.requestStatus === 'fulfilled') {
      navigation.navigate('Payment', { bookingId: res.payload._id });
    } else {
      Alert.alert('Booking failed', res.payload);
    }
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <IconButton icon="arrow-left" iconColor={colors.white} onPress={() => navigation.goBack()} style={{ marginLeft: -8 }} />
        <Text style={styles.title}>Confirm booking</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.name}>{event?.title}</Text>
        <Text style={styles.meta}>{ticket?.name} × {quantity} (₹{ticket?.price ?? 0} each)</Text>
        <Text style={styles.meta}>{event?.venue?.name}, {event?.venue?.city}</Text>
        <View style={styles.divider} />
        <Text style={styles.meta}>Subtotal: ₹{subtotal}</Text>
        <Text style={styles.meta}>GST (18%): ₹{tax}</Text>
        <Text style={styles.meta}>Convenience Fee (2%): ₹{fee}</Text>
        <Text style={styles.price}>Total Payable: ₹{total.toFixed(2)}</Text>
      </View>
      <Button mode="contained" loading={loading || busy} onPress={onConfirm} style={styles.btn}>Proceed to payment</Button>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.navy, padding: 18, paddingTop: 48 },
  header: { flexDirection: 'row', alignItems: 'center' },
  title: { color: colors.white, fontSize: 24, fontWeight: '800' },
  card: { backgroundColor: colors.card, padding: 18, borderRadius: 16, marginVertical: 18 },
  name: { color: colors.white, fontWeight: '700', fontSize: 17 },
  meta: { color: colors.muted, marginTop: 6 },
  divider: { height: 1, backgroundColor: '#25324D', marginVertical: 12 },
  price: { color: colors.purple, marginTop: 12, fontWeight: '800', fontSize: 18 },
  btn: { backgroundColor: colors.purple, borderRadius: 12, paddingVertical: 4 },
});
