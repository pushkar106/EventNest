
import React, { useCallback } from 'react';
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
import {
  fetchNotifications,
  markNotificationRead,
} from '../store/slices/notificationsSlice';
import { colors } from '../theme';

const getNotificationIcon = (type) => {
  switch (type) {
    case 'BOOKING':
      return 'ticket-confirmation-outline';
    case 'PAYMENT':
      return 'credit-card-check-outline';
    case 'EVENT':
      return 'calendar-star';
    case 'REMINDER':
      return 'bell-ring-outline';
    case 'CANCELLATION':
      return 'close-circle-outline';
    default:
      return 'information-outline';
  }
};

const getNotificationColor = (type) => {
  switch (type) {
    case 'BOOKING':
      return '#22C55E';
    case 'PAYMENT':
      return '#38BDF8';
    case 'EVENT':
      return '#A78BFA';
    case 'REMINDER':
      return '#FBBF24';
    case 'CANCELLATION':
      return '#F87171';
    default:
      return colors.purple;
  }
};

const formatDate = (date) => {
  if (!date) return '';

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return '';

  return parsed.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export default function NotificationsScreen() {
  const dispatch = useDispatch();

  const {
    list = [],
    unreadCount = 0,
    loading,
  } = useSelector((s) => s.notifications);

  useFocusEffect(
    useCallback(() => {
      dispatch(fetchNotifications());
    }, [dispatch])
  );

  const handleMarkAllRead = () => {
    if (unreadCount > 0) {
      dispatch(markNotificationRead('all'));
    }
  };

  const handleNotificationPress = (item) => {
    if (!item.isRead) {
      dispatch(markNotificationRead(item._id));
    }
  };

  const renderNotification = ({ item }) => {
    const iconColor = getNotificationColor(item.type);

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => handleNotificationPress(item)}
        style={[
          styles.card,
          !item.isRead && styles.unreadCard,
        ]}
      >
        <View style={styles.cardTop}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: `${iconColor}18` },
            ]}
          >
            <MaterialCommunityIcons
              name={getNotificationIcon(item.type)}
              size={23}
              color={iconColor}
            />
          </View>

          <View style={styles.content}>
            <View style={styles.titleRow}>
              <Text
                style={styles.notificationTitle}
                numberOfLines={2}
              >
                {item.title}
              </Text>

              {!item.isRead && (
                <View style={styles.unreadDot} />
              )}
            </View>

            <Text style={styles.message}>
              {item.message}
            </Text>

            <View style={styles.bottomRow}>
              <View style={styles.dateContainer}>
                <MaterialCommunityIcons
                  name="clock-outline"
                  size={13}
                  color={colors.muted}
                />

                <Text style={styles.dateText}>
                  {formatDate(item.createdAt)}
                </Text>
              </View>

              <Text
                style={[
                  styles.readStatus,
                  !item.isRead && styles.unreadStatus,
                ]}
              >
                {item.isRead ? 'READ' : 'NEW'}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.wrap}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Notifications</Text>

          <Text style={styles.subtitle}>
            Stay updated with your events
          </Text>
        </View>

        <View style={styles.headerIcon}>
          <MaterialCommunityIcons
            name="bell-badge-outline"
            size={25}
            color={colors.purple}
          />

          {unreadCount > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Notification Summary */}
      <View style={styles.summary}>
        <View>
          <Text style={styles.summaryTitle}>
            Your Updates
          </Text>

          <Text style={styles.summarySubtitle}>
            {unreadCount} unread notifications
          </Text>
        </View>

        {unreadCount > 0 && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleMarkAllRead}
            style={styles.markButton}
          >
            <MaterialCommunityIcons
              name="check-all"
              size={16}
              color={colors.purple}
            />

            <Text style={styles.markButtonText}>
              Mark all read
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Notification List */}
      <FlatList
        data={list}
        keyExtractor={(item) => item._id}
        renderItem={renderNotification}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshing={loading}
        onRefresh={() => dispatch(fetchNotifications())}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <MaterialCommunityIcons
                  name="bell-sleep-outline"
                  size={42}
                  color={colors.purple}
                />
              </View>

              <Text style={styles.emptyTitle}>
                All caught up!
              </Text>

              <Text style={styles.emptyText}>
                You don't have any notifications yet.
                We'll let you know when something happens.
              </Text>
            </View>
          ) : null
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
    alignItems: 'center',
    justifyContent: 'space-between',
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
    width: 47,
    height: 47,
    borderRadius: 15,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },

  countBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: colors.purple,
    minWidth: 19,
    height: 19,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },

  countText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },

  summary: {
    backgroundColor: colors.card,
    borderRadius: 15,
    padding: 15,
    marginBottom: 17,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#28344D',
  },

  summaryTitle: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '800',
  },

  summarySubtitle: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 5,
  },

  markButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(124,92,255,0.13)',
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderRadius: 10,
  },

  markButtonText: {
    color: colors.purple,
    fontSize: 10,
    fontWeight: '800',
  },

  listContent: {
    paddingBottom: 25,
    flexGrow: 1,
  },

  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#222E46',
  },

  unreadCard: {
    borderColor: 'rgba(124,92,255,0.5)',
    backgroundColor: '#1A2540',
  },

  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  iconContainer: {
    width: 45,
    height: 45,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  content: {
    flex: 1,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  notificationTitle: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '800',
    flex: 1,
    marginRight: 8,
  },

  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.purple,
  },

  message: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 19,
    marginTop: 7,
  },

  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 13,
  },

  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  dateText: {
    color: colors.muted,
    fontSize: 10,
  },

  readStatus: {
    color: colors.muted,
    fontSize: 9,
    fontWeight: '800',
  },

  unreadStatus: {
    color: colors.purple,
  },

  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 25,
    paddingVertical: 65,
  },

  emptyIcon: {
    width: 85,
    height: 85,
    borderRadius: 26,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },

  emptyTitle: {
    color: colors.white,
    fontSize: 19,
    fontWeight: '800',
  },

  emptyText: {
    color: colors.muted,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 19,
    marginTop: 8,
  },
});
