import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme';

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    const t = setTimeout(() => navigation.replace('Welcome'), 1200);
    return () => clearTimeout(t);
  }, [navigation]);

  return (
    <View style={styles.wrap}>
      <View style={styles.logo}><Text style={styles.logoText}>EN</Text></View>
      <Text style={styles.title}>EventNest</Text>
      <Text style={styles.sub}>Discover. Book. Experience.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.navy, alignItems: 'center', justifyContent: 'center' },
  logo: { width: 88, height: 88, borderRadius: 24, backgroundColor: colors.purple, alignItems: 'center', justifyContent: 'center' },
  logoText: { color: '#fff', fontSize: 32, fontWeight: '800' },
  title: { color: colors.white, fontSize: 32, fontWeight: '800', marginTop: 18 },
  sub: { color: colors.muted, marginTop: 8, fontSize: 15 },
});
