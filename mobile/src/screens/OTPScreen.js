import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, IconButton } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { resetPassword, sendOtp, verifyOtp } from '../store/slices/authSlice';
import { colors } from '../theme';

export default function OTPScreen({ route, navigation }) {
  const { email, otpHint, purpose } = route.params || {};
  const dispatch = useDispatch();
  const [otp, setOtp] = useState(otpHint || '');
  const [hint, setHint] = useState(otpHint || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onVerify = async () => {
    setLoading(true);
    if (purpose === 'FORGOT_PASSWORD') {
      const res = await dispatch(resetPassword({ email, otp, password }));
      setLoading(false);
      if (res.meta.requestStatus === 'fulfilled') {
        Alert.alert('Success', 'Password updated. You can login now.');
        navigation.navigate('Login');
      } else {
        Alert.alert('Error', res.payload);
      }
      return;
    }
    const res = await dispatch(verifyOtp({ email, otp }));
    setLoading(false);
    if (res.meta.requestStatus !== 'fulfilled') Alert.alert('Invalid OTP', res.payload);
  };

  const onResend = async () => {
    const res = await dispatch(sendOtp({ email, purpose: purpose || 'VERIFY_EMAIL' }));
    if (res.meta.requestStatus === 'fulfilled') {
      const newOtp = res.payload?.data?.otp;
      if (newOtp) { setHint(newOtp); setOtp(newOtp); }
      Alert.alert('OTP Sent', 'A new OTP has been sent to your email.');
    } else {
      Alert.alert('Error', res.payload || 'Could not resend OTP');
    }
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <IconButton icon="arrow-left" iconColor={colors.white} onPress={() => navigation.goBack()} style={{ marginLeft: -8 }} />
        <Text style={styles.title}>Verify OTP</Text>
      </View>
      <Text style={styles.sub}>Enter the code sent to {email}.{hint ? ` Dev OTP: ${hint}` : ''}</Text>
      <TextInput label="OTP" value={otp} onChangeText={setOtp} keyboardType="number-pad" style={styles.input} mode="outlined" />
      {purpose === 'FORGOT_PASSWORD' ? (
        <TextInput label="New password" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} mode="outlined" />
      ) : null}
      <Button mode="contained" loading={loading} onPress={onVerify} style={styles.btn}>Verify</Button>
      <Button onPress={onResend} style={{ marginTop: 8 }}>Resend OTP</Button>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.navy, padding: 24, paddingTop: 48 },
  header: { flexDirection: 'row', alignItems: 'center' },
  title: { color: colors.white, fontSize: 28, fontWeight: '800' },
  sub: { color: colors.muted, marginVertical: 10 },
  input: { marginTop: 10, backgroundColor: colors.card },
  btn: { marginTop: 18, backgroundColor: colors.purple, borderRadius: 12 },
});
