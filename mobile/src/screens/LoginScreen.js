
import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, HelperText } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../store/slices/authSlice';
import { colors } from '../theme';

export default function LoginScreen({ navigation }) {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((s) => s.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Missing details', 'Please enter email and password.');
      return;
    }

    try {
      const res = await dispatch(
        loginUser({
          email: email.trim(),
          password,
        })
      );

      if (res.meta.requestStatus !== 'fulfilled') {
        Alert.alert('Login failed', res.payload || 'Try again');
      }
    } catch (err) {
      Alert.alert('Login error', err.message);
    }
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Welcome back</Text>

      <Text style={styles.sub}>
        Sign in to book tickets and manage your passes.
      </Text>

      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
        mode="outlined"
      />

      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
        mode="outlined"
      />

      {error ? (
        <HelperText type="error">{error}</HelperText>
      ) : null}

      <Button
        mode="contained"
        loading={loading}
        disabled={loading}
        onPress={onLogin}
        style={styles.btn}
      >
        Login
      </Button>

      <Button
        mode="outlined"
        disabled
        style={styles.outline}
      >
        Google Sign-In (Coming Soon)
      </Button>

      <Button onPress={() => navigation.navigate('ForgotPassword')}>
        Forgot password?
      </Button>

      <Button onPress={() => navigation.navigate('Register')}>
        New here? Create an account
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: colors.navy,
    padding: 24,
    paddingTop: 72,
  },
  title: {
    color: colors.white,
    fontSize: 28,
    fontWeight: '800',
  },
  sub: {
    color: colors.muted,
    marginVertical: 10,
  },
  input: {
    marginTop: 10,
    backgroundColor: colors.card,
  },
  btn: {
    marginTop: 18,
    backgroundColor: colors.purple,
    borderRadius: 12,
  },
  outline: {
    marginTop: 10,
    borderColor: '#2A3654',
    borderRadius: 12,
  },
});
