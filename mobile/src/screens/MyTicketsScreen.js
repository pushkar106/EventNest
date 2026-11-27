
import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { fetchMyTickets } from '../store/slices/ticketsSlice';
import { colors } from '../theme';

const filters = [
  { label: 'All', value: 'ALL', icon: 'ticket-outline' },
  { label: 'Confirmed', value: 'CONFIRMED', icon: 'check-circle-outline' },
  { label: 'Checked In', value: 'CHECKED_IN', icon: 'qrcode-scan' },
  { label: 'Cancelled', value: 'CANCELLED', icon: 'close-circle-outline' },
];

export default function MyTicketsScreen({ navigation }) {
  const dispatch = useDispatch();
  const { list, loading } = useSelector((s) => s.tickets);
  const [filter, setFilter] = useState('ALL');

  useFocusEffect(
    useCallback(() => {
      dispatch(fetchMyTickets());
    }, [dispatch])
  );

  const filtered = list.filter((item) => {
    if (filter === 'ALL') return true;
    if (filter === 'CHECKED_IN') return item.isCheckedIn;
    return item.status === filter;
  });

  const getStatus = (item) => {
    if (item.isCheckedIn) return 'CHECKED IN';
    return item.status || 'PENDING';
  };

  const getStatusStyle = (item) => {
    if (item.isCheckedIn) return styles.checkedBadge;
    if (item.status === 'CONFIRMED') return styles.confirmedBadge;
    if (item.status === 'CANCELLED') return styles.cancelledBadge;
    return styles.pendingBadge;
  };

  const renderFilter = ({ item }) => {
    const active = filter === item.value;

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setFilter(item.value)}
        style={[
          styles.filterChip,
          active && styles.activeFilter,
        ]}
      >
        <MaterialCommunityIcons
          name={item.icon}
          size={16}
          color={active ? '#FFFFFF' : colors.muted}
        />

        <Text
          style={[
            styles.filterText,
            active && styles.activeFilterText,
          ]}
        >
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderTicket = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.ticketCard}
      onPress={() =>
        navigation.navigate('QRTicket', { id: item._id })
      }
    >
      <View style={styles.ticketTop}>
        <View style={styles.eventIcon}>
          <MaterialCommunityIcons
            name="ticket-confirmation-outline"
            size={23}
            color={colors.purple}
          />
        </View>

        <View style={styles.eventInfo}>
          <Text style={styles.eventName} numberOfLines={1}>
            {item.event?.title || 'Event'}
          </Text>

          <Text style={styles.bookingId} numberOfLines={1}>
            Booking ID: {item.bookingId}
          </Text>
        </View>

        <View style={[styles.badge, getStatusStyle(item)]}>
          <Text style={styles.badgeText}>
            {getStatus(item)}
          </Text>
        </View>
      </View>

      <View style={styles.separator} />

      <View style={styles.ticketDetails}>
        <View style={styles.detailItem}>
          <MaterialCommunityIcons
            name="ticket-outline"
            size={16}
            color={colors.muted}
          />
          <View>
            <Text style={styles.detailLabel}>Ticket type</Text>
            <Text style={styles.detailValue}>
              {item.ticketTypeName || 'General'}
            </Text>
          </View>
        </View>

        <View style={styles.detailItem}>
          <MaterialCommunityIcons
            name="account-group-outline"
            size={16}
            color={colors.muted}
          />
          <View>
            <Text style={styles.detailLabel}>Quantity</Text>
            <Text style={styles.detailValue}>
              {item.quantity || 1}
            </Text>
          </View>
        </View>

        <View style={styles.detailItem}>
          <MaterialCommunityIcons
            name="currency-inr"
            size={16}
            color={colors.muted}
          />
          <View>
            <Text style={styles.detailLabel}>Total amount</Text>
            <Text style={styles.price}>
              ₹{item.totalAmount ?? 0}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.dateInfo}>
          <MaterialCommunityIcons
            name="calendar-month-outline"
            size={15}
            color={colors.purple}
          />

          <Text style={styles.dateText}>
            {item.event?.startDate
              ? new Date(item.event.startDate).toDateString()
              : 'Date TBA'}
          </Text>
        </View>

        <View style={styles.locationInfo}>
          <MaterialCommunityIcons
            name="map-marker-outline"
            size={15}
            color={colors.muted}
          />

          <Text style={styles.locationText}>
            {item.event?.venue?.city || 'Location TBA'}
          </Text>
        </View>
      </View>

      <View style={styles.viewTicket}>
        <Text style={styles.viewTicketText}>View ticket</Text>
        <MaterialCommunityIcons
          name="arrow-right"
          size={17}
          color={colors.purple}
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>My Tickets</Text>
          <Text style={styles.subtitle}>
            All your bookings in one place
          </Text>
        </View>

        <View style={styles.headerIcon}>
          <MaterialCommunityIcons
            name="ticket-confirmation"
            size={24}
            color={colors.purple}
          />
        </View>
      </View>

      <View style={styles.filterSection}>
        <Text style={styles.sectionTitle}>My Bookings</Text>

        <FlatList
          horizontal
          data={filters}
          keyExtractor={(item) => item.value}
          renderItem={renderFilter}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
          extraData={filter}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id}
        renderItem={renderTicket}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshing={loading}
        onRefresh={() => dispatch(fetchMyTickets())}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <MaterialCommunityIcons
                name="ticket-outline"
                size={38}
                color={colors.purple}
              />
            </View>

            <Text style={styles.emptyTitle}>
              No tickets found
            </Text>

            <Text style={styles.emptyText}>
              Your bookings will appear here once you book an event.
            </Text>

            <TouchableOpacity
              style={styles.exploreButton}
              onPress={() => navigation.navigate('Explore')}
            >
              <Text style={styles.exploreText}>
                Explore Events
              </Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: colors.navy,
    paddingTop: 56,
    paddingHorizontal: 16,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },

  title: {
    color: colors.white,
    fontSize: 27,
    fontWeight: '800',
  },

  subtitle: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 5,
  },

  headerIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },

  filterSection: {
    marginBottom: 18,
  },

  sectionTitle: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
  },

  filterList: {
    paddingBottom: 5,
  },

  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 12,
    marginRight: 9,
    borderWidth: 1,
    borderColor: '#28344D',
    gap: 6,
  },

  activeFilter: {
    backgroundColor: colors.purple,
    borderColor: colors.purple,
  },

  filterText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
  },

  activeFilterText: {
    color: '#FFFFFF',
  },

  listContent: {
    paddingBottom: 25,
    flexGrow: 1,
  },

  ticketCard: {
    backgroundColor: colors.card,
    padding: 15,
    borderRadius: 17,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#222E46',
  },

  ticketTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  eventIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(124,92,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  eventInfo: {
    flex: 1,
    marginRight: 5,
  },

  eventName: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '800',
  },

  bookingId: {
    color: colors.muted,
    fontSize: 10,
    marginTop: 5,
  },

  badge: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
  },

  confirmedBadge: {
    backgroundColor: 'rgba(34,197,94,0.14)',
  },

  checkedBadge: {
    backgroundColor: 'rgba(59,130,246,0.15)',
  },

  cancelledBadge: {
    backgroundColor: 'rgba(244,63,94,0.14)',
  },

  pendingBadge: {
    backgroundColor: 'rgba(245,158,11,0.14)',
  },

  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },

  separator: {
    height: 1,
    backgroundColor: '#2A3650',
    marginVertical: 15,
  },

  ticketDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },

  detailLabel: {
    color: colors.muted,
    fontSize: 9,
    marginBottom: 4,
  },

  detailValue: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '700',
  },

  price: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '800',
  },

  footer: {
    borderTopWidth: 1,
    borderTopColor: '#2A3650',
    marginTop: 15,
    paddingTop: 12,
    gap: 8,
  },

  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  dateText: {
    color: colors.purple,
    fontSize: 11,
    fontWeight: '700',
  },

  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  locationText: {
    color: colors.muted,
    fontSize: 11,
  },

  viewTicket: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#2A3650',
    marginTop: 13,
    paddingTop: 12,
    gap: 7,
  },

  viewTicketText: {
    color: colors.purple,
    fontSize: 12,
    fontWeight: '800',
  },

  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 25,
    paddingVertical: 60,
  },

  emptyIcon: {
    width: 75,
    height: 75,
    borderRadius: 24,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },

  emptyTitle: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '800',
  },

  emptyText: {
    color: colors.muted,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 19,
    marginTop: 8,
  },

  exploreButton: {
    backgroundColor: colors.purple,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 20,
  },

  exploreText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
});
