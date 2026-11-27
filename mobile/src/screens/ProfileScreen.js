
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { Avatar, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../store/slices/authSlice';
import { colors } from '../theme';

export default function ProfileScreen({ navigation }) {
  const user = useSelector((s) => s.auth.user);
  const dispatch = useDispatch();

  const initials = (user?.fullName || 'U')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const verified = !!user?.isEmailVerified;

  const onLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to logout from your account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => dispatch(logoutUser()),
        },
      ]
    );
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={colors.navy} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>YOUR ACCOUNT</Text>
            <Text style={styles.title}>My Profile</Text>
            <Text style={styles.subtitle}>
              Manage your personal information
            </Text>
          </View>

          <TouchableOpacity
            style={styles.headerIcon}
            onPress={() => navigation.navigate('EditProfile')}
            activeOpacity={0.75}
          >
            <MaterialCommunityIcons
              name="cog-outline"
              size={23}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.cardGlow} />

          <View style={styles.profileTop}>
            <View style={styles.avatarWrap}>
              {user?.avatar ? (
                <Avatar.Image
                  size={76}
                  source={{ uri: user.avatar }}
                  style={styles.avatar}
                />
              ) : (
                <Avatar.Text
                  size={76}
                  label={initials}
                  style={styles.avatar}
                  labelStyle={styles.avatarLabel}
                />
              )}

              <View style={styles.onlineDot} />
            </View>

            <View style={styles.userInfo}>
              <Text style={styles.name} numberOfLines={1}>
                {user?.fullName || 'User'}
              </Text>
              <Text style={styles.email} numberOfLines={2}>
                {user?.email}
              </Text>
              <View style={styles.roleBadge}>
                <MaterialCommunityIcons
                  name="shield-account"
                  size={13}
                  color="#B7A2FF"
                />
                <Text style={styles.roleText}>
                  {user?.role || 'USER'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.cardDivider} />

          <View style={styles.verificationRow}>
            <View style={styles.verificationIcon}>
              <MaterialCommunityIcons
                name={verified ? 'check-decagram' : 'email-alert-outline'}
                size={20}
                color={verified ? '#42D6A4' : '#FFBE69'}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.verificationTitle}>
                {verified ? 'Email Verified' : 'Email Not Verified'}
              </Text>
              <Text style={styles.verificationSubtitle}>
                {verified
                  ? 'Your account is verified and secure'
                  : 'Please verify your email address'}
              </Text>
            </View>

            <View
              style={[
                styles.statusBadge,
                verified ? styles.verifiedBadge : styles.unverifiedBadge,
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  { color: verified ? '#42D6A4' : '#FFBE69' },
                ]}
              >
                {verified ? 'VERIFIED' : 'PENDING'}
              </Text>
            </View>
          </View>
        </View>

        {/* Personal Details */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <Text style={styles.sectionCaption}>ACCOUNT DETAILS</Text>
        </View>

        <View style={styles.detailsCard}>
          <DetailRow
            icon="account-outline"
            label="Full Name"
            value={user?.fullName || 'Not available'}
          />
          <View style={styles.detailDivider} />

          <DetailRow
            icon="email-outline"
            label="Email Address"
            value={user?.email || 'Not available'}
          />
          <View style={styles.detailDivider} />

          <DetailRow
            icon="phone-outline"
            label="Mobile Number"
            value={user?.mobile || 'No mobile added'}
          />
        </View>

        {/* Account Actions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          <Text style={styles.sectionCaption}>MANAGE ACCOUNT</Text>
        </View>

        <TouchableOpacity
          style={styles.actionCard}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <View style={styles.actionIcon}>
            <MaterialCommunityIcons
              name="account-edit-outline"
              size={23}
              color="#A78BFA"
            />
          </View>

          <View style={styles.actionInfo}>
            <Text style={styles.actionTitle}>Edit Profile</Text>
            <Text style={styles.actionSubtitle}>
              Update your name and mobile number
            </Text>
          </View>

          <MaterialCommunityIcons
            name="chevron-right"
            size={23}
            color="#8390AA"
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <View style={styles.actionIcon}>
            <MaterialCommunityIcons
              name="lock-reset"
              size={23}
              color="#A78BFA"
            />
          </View>

          <View style={styles.actionInfo}>
            <Text style={styles.actionTitle}>Password & Security</Text>
            <Text style={styles.actionSubtitle}>
              Change your account password
            </Text>
          </View>

          <MaterialCommunityIcons
            name="chevron-right"
            size={23}
            color="#8390AA"
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Tickets')}
        >
          <View style={styles.actionIcon}>
            <MaterialCommunityIcons
              name="ticket-confirmation-outline"
              size={23}
              color="#A78BFA"
            />
          </View>

          <View style={styles.actionInfo}>
            <Text style={styles.actionTitle}>My Tickets</Text>
            <Text style={styles.actionSubtitle}>
              View your bookings and event tickets
            </Text>
          </View>

          <MaterialCommunityIcons
            name="chevron-right"
            size={23}
            color="#8390AA"
          />
        </TouchableOpacity>

        {/* Logout */}
        <Button
          mode="outlined"
          icon="logout"
          textColor="#FF647C"
          style={styles.logoutButton}
          contentStyle={styles.logoutContent}
          labelStyle={styles.logoutLabel}
          onPress={onLogout}
        >
          Sign Out
        </Button>

        <Text style={styles.footer}>
          EVENTNEST  •  YOUR EVENTS, YOUR EXPERIENCE
        </Text>
      </ScrollView>
    </View>
  );
}

function DetailRow({ icon, label, value }) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailIcon}>
        <MaterialCommunityIcons
          name={icon}
          size={21}
          color="#A78BFA"
        />
      </View>

      <View style={styles.detailInfo}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue} numberOfLines={2}>
          {value}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.navy,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 35,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },

  eyebrow: {
    color: '#A78BFA',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 7,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 29,
    fontWeight: '900',
    letterSpacing: -0.7,
  },

  subtitle: {
    color: '#8793AD',
    fontSize: 12,
    marginTop: 5,
  },

  headerIcon: {
    height: 46,
    width: 46,
    borderRadius: 15,
    backgroundColor: '#19243A',
    borderWidth: 1,
    borderColor: '#303D58',
    alignItems: 'center',
    justifyContent: 'center',
  },

  profileCard: {
    backgroundColor: '#17233A',
    borderRadius: 24,
    padding: 19,
    borderWidth: 1,
    borderColor: '#34405A',
    overflow: 'hidden',
    marginBottom: 30,
  },

  cardGlow: {
    position: 'absolute',
    top: -75,
    right: -50,
    height: 180,
    width: 180,
    borderRadius: 100,
    backgroundColor: '#7955FF',
    opacity: 0.10,
  },

  profileTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatarWrap: {
    position: 'relative',
  },

  avatar: {
    backgroundColor: '#7657F8',
  },

  avatarLabel: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 26,
  },

  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    height: 15,
    width: 15,
    borderRadius: 10,
    backgroundColor: '#42D6A4',
    borderWidth: 3,
    borderColor: '#17233A',
  },

  userInfo: {
    flex: 1,
    marginLeft: 16,
  },

  name: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '800',
    marginBottom: 5,
  },

  email: {
    color: '#A5B2CB',
    fontSize: 12,
    lineHeight: 18,
  },

  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#34275F',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    marginTop: 9,
    gap: 5,
  },

  roleText: {
    color: '#C4B5FD',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },

  cardDivider: {
    height: 1,
    backgroundColor: '#35415B',
    marginVertical: 19,
  },

  verificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  verificationIcon: {
    height: 38,
    width: 38,
    borderRadius: 12,
    backgroundColor: '#24344A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },

  verificationTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },

  verificationSubtitle: {
    color: '#8492AC',
    fontSize: 10,
    marginTop: 4,
  },

  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
  },

  verifiedBadge: {
    backgroundColor: '#153F38',
  },

  unverifiedBadge: {
    backgroundColor: '#483722',
  },

  statusText: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  sectionHeader: {
    marginBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },

  sectionCaption: {
    color: '#7886A2',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1,
  },

  detailsCard: {
    backgroundColor: '#141F34',
    borderRadius: 19,
    borderWidth: 1,
    borderColor: '#293650',
    paddingHorizontal: 15,
    marginBottom: 29,
  },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },

  detailIcon: {
    height: 40,
    width: 40,
    backgroundColor: '#29254A',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  detailInfo: {
    flex: 1,
  },

  detailLabel: {
    color: '#8390AA',
    fontSize: 10,
    marginBottom: 5,
  },

  detailValue: {
    color: '#F2F4FA',
    fontSize: 13,
    fontWeight: '700',
  },

  detailDivider: {
    height: 1,
    backgroundColor: '#293650',
  },

  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#17233A',
    borderWidth: 1,
    borderColor: '#293650',
    borderRadius: 17,
    padding: 14,
    marginBottom: 11,
  },

  actionIcon: {
    height: 44,
    width: 44,
    borderRadius: 13,
    backgroundColor: '#29254A',
    alignItems: 'center',
    justifyContent: 'center',
  },

  actionInfo: {
    flex: 1,
    marginLeft: 13,
  },

  actionTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  actionSubtitle: {
    color: '#8793AD',
    fontSize: 10,
    marginTop: 5,
  },

  logoutButton: {
    borderColor: '#713B50',
    borderRadius: 15,
    marginTop: 19,
    backgroundColor: '#291D30',
  },

  logoutContent: {
    height: 49,
  },

  logoutLabel: {
    fontWeight: '800',
    fontSize: 13,
  },

  footer: {
    textAlign: 'center',
    color: '#586680',
    fontSize: 8,
    letterSpacing: 1.2,
    fontWeight: '800',
    marginTop: 25,
  },
});
