import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, IconButton } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { forgotPassword } from '../store/slices/authSlice';
import { colors } from '../theme';

export default function ForgotPasswordScreen({ navigation }) {
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const onSend = async () => {
    setLoading(true);
    const res = await dispatch(forgotPassword(email));
    setLoading(false);
    if (res.meta.requestStatus === 'fulfilled') {
      navigation.navigate('OTP', {
        email,
        otpHint: res.payload?.data?.otp,
        purpose: 'FORGOT_PASSWORD',
      });
    } else {
      Alert.alert('Error', res.payload || 'Could not send OTP');
    }
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <IconButton icon="arrow-left" iconColor={colors.white} onPress={() => navigation.goBack()} style={{ marginLeft: -8 }} />
        <Text style={styles.title}>Reset password</Text>
      </View>
      <Text style={styles.sub}>We will send a 6-digit OTP to your email.</Text>
      <TextInput label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" style={styles.input} mode="outlined" />
      <Button mode="contained" loading={loading} onPress={onSend} style={styles.btn}>Send OTP</Button>
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
