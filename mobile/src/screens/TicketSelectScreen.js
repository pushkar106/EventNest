import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Button, IconButton } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEventById } from '../store/slices/eventsSlice';
import { colors } from '../theme';

export default function TicketSelectScreen({ route, navigation }) {
  const { eventId } = route.params;
  const dispatch = useDispatch();
  const event = useSelector((s) => s.events.current);
  const [selected, setSelected] = useState(null);
  const [qty, setQty] = useState(1);

  useEffect(() => { if (!event || event._id !== eventId) dispatch(fetchEventById(eventId)); }, [eventId]);

  useEffect(() => {
    if (event?.ticketTypes?.length && !selected) {
      const firstAvail = event.ticketTypes.find((t) => t.isActive && t.totalCapacity - t.soldCount > 0);
      if (firstAvail) setSelected(firstAvail._id);
    }
  }, [event]);

  const ticket = (event?.ticketTypes || []).find((t) => t._id === selected);
  const remaining = ticket ? Math.max(0, ticket.totalCapacity - ticket.soldCount) : 0;
  const maxQty = ticket ? Math.max(1, Math.min(ticket.maxPerBooking || 10, remaining)) : 1;
  const subtotal = ticket ? ticket.price * qty : 0;
  const tax = subtotal > 0 ? Math.round(subtotal * 0.18 * 100) / 100 : 0;
  const fee = subtotal > 0 ? Math.round(subtotal * 0.02 * 100) / 100 : 0;
  const total = Math.round((subtotal + tax + fee) * 100) / 100;

  return (
    <ScrollView style={styles.wrap} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.header}>
        <IconButton icon="arrow-left" iconColor={colors.white} onPress={() => navigation.goBack()} style={{ marginLeft: -8 }} />
        <Text style={styles.title}>Choose tickets</Text>
      </View>
      {(event?.ticketTypes || []).map((t) => {
        const left = Math.max(0, t.totalCapacity - t.soldCount);
        const soldOut = left <= 0 || !t.isActive;
        return (
          <TouchableOpacity
            key={t._id}
            disabled={soldOut}
            style={[styles.row, selected === t._id && styles.active, soldOut && { opacity: 0.45 }]}
            onPress={() => { setSelected(t._id); setQty(1); }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={styles.name}>{t.name}</Text>
              <Text style={styles.price}>{t.price === 0 ? 'FREE' : `₹${t.price}`}</Text>
            </View>
            <Text style={styles.meta}>{t.description || `${left} remaining`} · Max {t.maxPerBooking || 10}/booking</Text>
          </TouchableOpacity>
        );
      })}
      <View style={styles.qty}>
        <Text style={styles.name}>Quantity</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Button mode="outlined" compact onPress={() => setQty(Math.max(1, qty - 1))}>-</Button>
          <Text style={styles.qtyText}>{qty}</Text>
          <Button mode="outlined" compact onPress={() => setQty(Math.min(maxQty, qty + 1))}>+</Button>
        </View>
      </View>
      <View style={styles.summary}>
        <Text style={styles.meta}>Subtotal: ₹{subtotal} · GST (18%): ₹{tax} · Fee (2%): ₹{fee}</Text>
        <Text style={styles.total}>Total: ₹{total}</Text>
      </View>
      <Button
        mode="contained"
        disabled={!selected || remaining <= 0}
        style={styles.btn}
        onPress={() => navigation.navigate('BookingConfirm', { eventId, ticketTypeId: selected, quantity: qty })}
      >
        Continue
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.navy, padding: 18, paddingTop: 48 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  title: { color: colors.white, fontSize: 24, fontWeight: '800' },
  row: { backgroundColor: colors.card, padding: 14, borderRadius: 14, marginBottom: 10, borderWidth: 1.5, borderColor: 'transparent' },
  active: { borderColor: colors.purple },
  name: { color: colors.white, fontWeight: '700', fontSize: 15 },
  price: { color: colors.purple, fontWeight: '800', fontSize: 15 },
  meta: { color: colors.muted, marginTop: 6, fontSize: 13 },
  qty: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 16, backgroundColor: colors.card, padding: 14, borderRadius: 14 },
  qtyText: { color: colors.white, fontSize: 20, fontWeight: '700', marginHorizontal: 14 },
  summary: { backgroundColor: colors.card, padding: 14, borderRadius: 14, marginBottom: 14 },
  total: { color: colors.white, fontSize: 18, fontWeight: '800', marginTop: 6 },
  btn: { backgroundColor: colors.purple, borderRadius: 12, paddingVertical: 4 },
});
