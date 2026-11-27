import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Alert } from 'react-native';
import { Button, IconButton } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyTickets, fetchTicketById } from '../store/slices/ticketsSlice';
import { cancelBooking } from '../store/slices/bookingSlice';
import { colors } from '../theme';

export default function QRTicketScreen({ route, navigation }) {
  const { id } = route.params;
  const dispatch = useDispatch();
  const ticket = useSelector((s) => s.tickets.current);

  useEffect(() => { dispatch(fetchTicketById(id)); }, [id]);

  if (!ticket) return <View style={styles.wrap}><Text style={styles.meta}>Loading ticket...</Text></View>;

  const confirmCancel = () => {
    Alert.alert('Cancel Booking', 'Are you sure you want to cancel this ticket?', [
      { text: 'Keep Ticket', style: 'cancel' },
      {
        text: 'Cancel Booking',
        style: 'destructive',
        onPress: async () => {
          const res = await dispatch(cancelBooking({ id: ticket._id, reason: 'User cancelled from app' }));
          if (res.meta.requestStatus === 'fulfilled') {
            dispatch(fetchMyTickets());
            navigation.goBack();
          } else {
            Alert.alert('Error', res.payload || 'Could not cancel');
          }
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.wrap}>
      <View style={styles.header}>
        <IconButton icon="arrow-left" iconColor={colors.white} onPress={() => navigation.goBack()} style={{ marginLeft: -8 }} />
        <Text style={styles.title}>QR Ticket</Text>
      </View>
      <View style={styles.card}>
        <View style={[styles.badge, ticket.status === 'CONFIRMED' ? styles.badgeOk : styles.badgeWarn]}>
          <Text style={styles.badgeText}>{ticket.isCheckedIn ? 'CHECKED IN' : ticket.status}</Text>
        </View>
        {ticket.qrCodeUrl ? <Image source={{ uri: ticket.qrCodeUrl }} style={styles.qr} /> : <Text style={styles.meta}>QR available after payment.</Text>}
        <Text style={styles.name}>{ticket.event?.title}</Text>
        <Text style={styles.meta}>{ticket.event?.startDate ? new Date(ticket.event.startDate).toDateString() : ''} · {ticket.event?.venue?.city}</Text>
        <Text style={styles.bookingId}>Booking ID: {ticket.bookingId}</Text>
        <Text style={styles.meta}>{ticket.ticketTypeName} × {ticket.quantity} · ₹{ticket.totalAmount}</Text>
        <Text style={styles.meta}>Check-in: {ticket.isCheckedIn ? `Verified (${new Date(ticket.checkedInAt).toLocaleString()})` : 'Not yet'}</Text>
        {ticket.qrToken ? (
          <View style={styles.tokenBox}>
            <Text style={styles.tokenLabel}>QR Token (for scanner / demo):</Text>
            <Text selectable style={styles.tokenValue}>{ticket.qrToken}</Text>
          </View>
        ) : null}
      </View>
      {ticket.status === 'CONFIRMED' && !ticket.isCheckedIn ? (
        <Button mode="outlined" textColor={colors.danger} style={styles.cancelBtn} onPress={confirmCancel}>Cancel booking</Button>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.navy },
  wrap: { padding: 18, paddingTop: 48, alignItems: 'center', paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start' },
  title: { color: colors.white, fontSize: 24, fontWeight: '800' },
  card: { backgroundColor: colors.card, padding: 20, borderRadius: 20, marginTop: 14, alignItems: 'center', width: '100%' },
  badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, marginBottom: 14 },
  badgeOk: { backgroundColor: 'rgba(34,197,94,0.18)' },
  badgeWarn: { backgroundColor: 'rgba(244,63,94,0.18)' },
  badgeText: { color: colors.white, fontWeight: '700', fontSize: 12 },
  qr: { width: 230, height: 230, backgroundColor: '#fff', borderRadius: 14 },
  name: { color: colors.white, fontWeight: '800', fontSize: 18, marginTop: 16, textAlign: 'center' },
  bookingId: { color: colors.purple, fontWeight: '700', marginTop: 8 },
  meta: { color: colors.muted, marginTop: 6, textAlign: 'center' },
  tokenBox: { marginTop: 14, backgroundColor: colors.navySoft, padding: 10, borderRadius: 10, width: '100%' },
  tokenLabel: { color: colors.muted, fontSize: 11, textAlign: 'center' },
  tokenValue: { color: colors.white, fontSize: 12, textAlign: 'center', marginTop: 4 },
  cancelBtn: { marginTop: 16, borderColor: colors.danger, borderRadius: 12, width: '100%' },
});
