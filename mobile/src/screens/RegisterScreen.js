import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../store/slices/authSlice';
import { colors } from '../theme';

export default function RegisterScreen({ navigation }) {
  const dispatch = useDispatch();
  const { loading } = useSelector((s) => s.auth);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');

  const onRegister = async () => {
    const res = await dispatch(registerUser({ fullName, email, mobile, password }));
    if (res.meta.requestStatus === 'fulfilled') {
      navigation.navigate('OTP', { email, otpHint: res.payload.otp, purpose: 'VERIFY_EMAIL' });
    } else {
      Alert.alert('Registration failed', res.payload || 'Try again');
    }
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Create account</Text>
      <TextInput label="Full name" value={fullName} onChangeText={setFullName} style={styles.input} mode="outlined" />
      <TextInput label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" style={styles.input} mode="outlined" />
      <TextInput label="Mobile" value={mobile} onChangeText={setMobile} keyboardType="phone-pad" style={styles.input} mode="outlined" />
      <TextInput label="Password" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} mode="outlined" />
      <Button mode="contained" loading={loading} onPress={onRegister} style={styles.btn}>Register</Button>
      <Button onPress={() => navigation.navigate('Login')}>Already have an account?</Button>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.navy, padding: 24, paddingTop: 72 },
  title: { color: colors.white, fontSize: 28, fontWeight: '800', marginBottom: 12 },
  input: { marginTop: 10, backgroundColor: colors.card },
  btn: { marginTop: 18, backgroundColor: colors.purple, borderRadius: 12 },
});
