import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { TextInput, Button, IconButton, Chip } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEvents } from '../store/slices/eventsSlice';
import { colors } from '../theme';

const categories = ['all', 'Technology', 'Music', 'Business', 'Education', 'Sports', 'Workshops'];

export default function SearchScreen({ navigation }) {
  const dispatch = useDispatch();
  const { list, loading } = useSelector((s) => s.events);
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [category, setCategory] = useState('all');

  const run = (cat = category) => dispatch(fetchEvents({ search, city, category: cat, limit: 40 }));

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <IconButton icon="arrow-left" iconColor={colors.white} onPress={() => navigation.goBack()} style={{ marginLeft: -8 }} />
        <Text style={styles.title}>Search & filters</Text>
      </View>
      <TextInput label="Keyword" value={search} onChangeText={setSearch} mode="outlined" style={styles.input} />
      <TextInput label="City" value={city} onChangeText={setCity} mode="outlined" style={styles.input} />
      <FlatList
        horizontal
        data={categories}
        keyExtractor={(c) => c}
        showsHorizontalScrollIndicator={false}
        style={{ marginTop: 10, maxHeight: 40 }}
        renderItem={({ item }) => (
          <Chip selected={category === item} onPress={() => { setCategory(item); run(item); }} style={{ marginRight: 6, backgroundColor: colors.card }}>{item}</Chip>
        )}
      />
      <Button mode="contained" loading={loading} onPress={() => run()} style={styles.btn}>Apply filters</Button>
      <FlatList
        data={list}
        keyExtractor={(i) => i._id}
        ListEmptyComponent={<Text style={styles.meta}>No matching events.</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('EventDetails', { id: item._id })}>
            <Text style={styles.name}>{item.title}</Text>
            <Text style={styles.meta}>{item.venue?.city} · {item.category} · ₹{item.minPrice ?? 0}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.navy, padding: 16, paddingTop: 48 },
  header: { flexDirection: 'row', alignItems: 'center' },
  title: { color: colors.white, fontSize: 24, fontWeight: '800' },
  input: { marginTop: 10, backgroundColor: colors.card },
  btn: { marginVertical: 14, backgroundColor: colors.purple, borderRadius: 12 },
  row: { backgroundColor: colors.card, padding: 14, borderRadius: 12, marginBottom: 8 },
  name: { color: colors.white, fontWeight: '700' },
  meta: { color: colors.muted, marginTop: 4 },
});
