import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { colors } from '../theme';

export default function WelcomeScreen({ navigation }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.kicker}>EVENTNEST</Text>
      <Text style={styles.title}>Events that feel{'\n'}worth showing up for.</Text>
      <Text style={styles.body}>Browse curated experiences, book tickets in seconds, and walk in with a QR pass.</Text>
      <Button mode="contained" style={styles.cta} onPress={() => navigation.navigate('Login')}>Sign in</Button>
      <Button mode="outlined" textColor={colors.white} style={styles.outline} onPress={() => navigation.navigate('Register')}>Create account</Button>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.navy, padding: 28, justifyContent: 'flex-end', paddingBottom: 48 },
  kicker: { color: colors.purple, letterSpacing: 3, fontWeight: '700', marginBottom: 12 },
  title: { color: colors.white, fontSize: 34, fontWeight: '800', lineHeight: 42 },
  body: { color: colors.muted, marginTop: 14, marginBottom: 32, fontSize: 16, lineHeight: 24 },
  cta: { backgroundColor: colors.purple, borderRadius: 14, paddingVertical: 6, marginBottom: 12 },
  outline: { borderColor: '#2A3654', borderRadius: 14, paddingVertical: 6 },
});
