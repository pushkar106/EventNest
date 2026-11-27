
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  StatusBar,
} from 'react-native';
import {
  TextInput,
  Button,
  IconButton,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import {
  changePassword,
  updateProfile,
} from '../store/slices/userSlice';
import { colors } from '../theme';

export default function EditProfileScreen({ navigation }) {
  const user = useSelector((s) => s.auth.user);
  const { loading } = useSelector((s) => s.user);
  const dispatch = useDispatch();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [mobile, setMobile] = useState(user?.mobile || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const save = async () => {
    if (!fullName.trim()) {
      Alert.alert('Invalid input', 'Please enter your full name.');
      return;
    }

    const res = await dispatch(
      updateProfile({
        fullName: fullName.trim(),
        mobile: mobile.trim(),
      })
    );

    if (res.meta.requestStatus === 'fulfilled') {
      Alert.alert('Success', 'Your profile has been updated.');
      navigation.goBack();
    } else {
      Alert.alert('Error', res.payload || 'Update failed');
    }
  };

  const updatePwd = async () => {
    if (!currentPassword || newPassword.length < 6) {
      Alert.alert(
        'Invalid input',
        'Enter current password and a new password (min 6 chars).'
      );
      return;
    }

    setPasswordLoading(true);

    try {
      const res = await dispatch(
        changePassword({ currentPassword, newPassword })
      );

      if (res.meta.requestStatus === 'fulfilled') {
        Alert.alert('Success', 'Your password has been changed.');
        setCurrentPassword('');
        setNewPassword('');
      } else {
        Alert.alert('Error', res.payload || 'Password change failed');
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  const inputTheme = {
    colors: {
      primary: '#A78BFA',
      outline: '#34425E',
      background: '#17233A',
      onSurface: '#FFFFFF',
      onSurfaceVariant: '#8D9AB4',
    },
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={colors.navy} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
      >
        {/* Header */}
        <View style={styles.header}>
          <IconButton
            icon="arrow-left"
            iconColor="#FFFFFF"
            size={23}
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          />

          <View style={{ flex: 1 }}>
            <Text style={styles.eyebrow}>ACCOUNT SETTINGS</Text>
            <Text style={styles.title}>Edit Profile</Text>
          </View>

          <View style={styles.headerIcon}>
            <MaterialCommunityIcons
              name="account-cog-outline"
              size={24}
              color="#A78BFA"
            />
          </View>
        </View>

        <Text style={styles.description}>
          Keep your personal information up to date.
        </Text>

        {/* Profile Information */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeading}>
            <View style={styles.sectionIcon}>
              <MaterialCommunityIcons
                name="account-outline"
                size={21}
                color="#A78BFA"
              />
            </View>

            <View>
              <Text style={styles.sectionTitle}>
                Personal Information
              </Text>
              <Text style={styles.sectionSubtitle}>
                Update your account details
              </Text>
            </View>
          </View>

          <Text style={styles.fieldLabel}>FULL NAME</Text>

          <TextInput
            mode="outlined"
            value={fullName}
            onChangeText={setFullName}
            placeholder="Enter your full name"
            placeholderTextColor="#77849D"
            autoCapitalize="words"
            textColor="#FFFFFF"
            outlineColor="#34425E"
            activeOutlineColor="#A78BFA"
            style={styles.input}
            theme={inputTheme}
            left={<TextInput.Icon icon="account-outline" color="#A78BFA" />}
          />

          <Text style={styles.fieldLabel}>MOBILE NUMBER</Text>

          <TextInput
            mode="outlined"
            value={mobile}
            onChangeText={setMobile}
            placeholder="Enter your mobile number"
            placeholderTextColor="#77849D"
            keyboardType="phone-pad"
            textColor="#FFFFFF"
            outlineColor="#34425E"
            activeOutlineColor="#A78BFA"
            style={styles.input}
            theme={inputTheme}
            left={<TextInput.Icon icon="phone-outline" color="#A78BFA" />}
          />

          <Button
            mode="contained"
            loading={loading}
            disabled={loading}
            onPress={save}
            icon="content-save-outline"
            style={styles.saveButton}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
            buttonColor="#7957F5"
          >
            Save Changes
          </Button>
        </View>

        {/* Security */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeading}>
            <View style={styles.sectionIcon}>
              <MaterialCommunityIcons
                name="shield-lock-outline"
                size={21}
                color="#A78BFA"
              />
            </View>

            <View>
              <Text style={styles.sectionTitle}>
                Security & Password
              </Text>
              <Text style={styles.sectionSubtitle}>
                Keep your account protected
              </Text>
            </View>
          </View>

          <View style={styles.securityNotice}>
            <MaterialCommunityIcons
              name="information-outline"
              size={20}
              color="#B7A2FF"
            />

            <Text style={styles.noticeText}>
              Choose a strong password with at least 6 characters.
            </Text>
          </View>

          <Text style={styles.fieldLabel}>CURRENT PASSWORD</Text>

          <TextInput
            mode="outlined"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder="Enter current password"
            placeholderTextColor="#77849D"
            secureTextEntry={!showCurrent}
            textColor="#FFFFFF"
            outlineColor="#34425E"
            activeOutlineColor="#A78BFA"
            style={styles.input}
            theme={inputTheme}
            left={<TextInput.Icon icon="lock-outline" color="#A78BFA" />}
            right={
              <TextInput.Icon
                icon={showCurrent ? 'eye-off-outline' : 'eye-outline'}
                color="#8D9AB4"
                onPress={() => setShowCurrent(!showCurrent)}
              />
            }
          />

          <Text style={styles.fieldLabel}>NEW PASSWORD</Text>

          <TextInput
            mode="outlined"
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Enter new password"
            placeholderTextColor="#77849D"
            secureTextEntry={!showNew}
            textColor="#FFFFFF"
            outlineColor="#34425E"
            activeOutlineColor="#A78BFA"
            style={styles.input}
            theme={inputTheme}
            left={<TextInput.Icon icon="lock-reset" color="#A78BFA" />}
            right={
              <TextInput.Icon
                icon={showNew ? 'eye-off-outline' : 'eye-outline'}
                color="#8D9AB4"
                onPress={() => setShowNew(!showNew)}
              />
            }
          />

          <Button
            mode="outlined"
            loading={passwordLoading}
            disabled={passwordLoading}
            onPress={updatePwd}
            icon="shield-check-outline"
            textColor="#FFFFFF"
            style={styles.passwordButton}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
          >
            Update Password
          </Button>
        </View>

        <View style={styles.bottomNote}>
          <MaterialCommunityIcons
            name="shield-check"
            size={17}
            color="#42D6A4"
          />
          <Text style={styles.bottomNoteText}>
            Your account information is securely managed.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.navy,
  },

  content: {
    paddingHorizontal: 19,
    paddingTop: 43,
    paddingBottom: 40,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  backButton: {
    backgroundColor: '#19243A',
    borderRadius: 13,
    marginLeft: -7,
    marginRight: 9,
  },

  eyebrow: {
    color: '#A78BFA',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.8,
    marginBottom: 5,
  },

  title: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: '900',
  },

  headerIcon: {
    width: 45,
    height: 45,
    backgroundColor: '#29254A',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },

  description: {
    color: '#8793AD',
    fontSize: 12,
    marginTop: 10,
    marginBottom: 25,
  },

  sectionCard: {
    backgroundColor: '#17233A',
    borderRadius: 21,
    borderWidth: 1,
    borderColor: '#303D58',
    padding: 17,
    marginBottom: 20,
  },

  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 23,
  },

  sectionIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: '#29254A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  sectionSubtitle: {
    color: '#8793AD',
    fontSize: 10,
    marginTop: 4,
  },

  fieldLabel: {
    color: '#AAB5CC',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.1,
    marginBottom: 8,
    marginTop: 12,
  },

  input: {
    backgroundColor: '#17233A',
    fontSize: 13,
    height: 56,
  },

  saveButton: {
    borderRadius: 13,
    marginTop: 22,
  },

  buttonContent: {
    height: 49,
  },

  buttonLabel: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#29254A',
    borderRadius: 12,
    padding: 12,
    gap: 9,
    marginBottom: 10,
  },

  noticeText: {
    flex: 1,
    color: '#C1B6E9',
    fontSize: 10,
    lineHeight: 16,
  },

  passwordButton: {
    marginTop: 21,
    borderRadius: 13,
    borderColor: '#7957F5',
  },

  bottomNote: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 5,
  },

  bottomNoteText: {
    color: '#8290A9',
    fontSize: 10,
  },
});
