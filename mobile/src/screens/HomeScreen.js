import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, RefreshControl } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEvents, fetchFeaturedEvents } from '../store/slices/eventsSlice';
import { colors } from '../theme';


function Card({ event, onPress }) {
  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={onPress}
    >
      <Image
        source={{ uri: event.bannerImage }}
        style={styles.img}
        resizeMode="cover"
      />

      <View style={styles.cardOverlay} />

      <View style={styles.cardContent}>
        <Text style={styles.cat}>
          {event.category || 'FEATURED'}
        </Text>

        <Text style={styles.cardTitle} numberOfLines={2}>
          {event.title}
        </Text>

        <View style={styles.featuredMeta}>
          <Text style={styles.meta}>
            📍 {event.venue?.city || 'Location'}
          </Text>
          <Text style={styles.meta}>
            ₹{event.minPrice ?? 0}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}


export default function HomeScreen({ navigation }) {
  const dispatch = useDispatch();
  const { featured, list } = useSelector((s) => s.events);
  const user = useSelector((s) => s.auth.user);

  const load = () => {
    dispatch(fetchFeaturedEvents());
    dispatch(fetchEvents({ limit: 8, sort: 'popular' }));
  };

  useEffect(() => { load(); }, []);

  return (
    <ScrollView style={styles.wrap} refreshControl={<RefreshControl refreshing={false} onRefresh={load} />}>
      {/* EventNext Logo */}
    <View style={styles.logoContainer}>
      <Image
        source={require('../assets/eventnext-logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
      <Text style={styles.hello}>Hello, {user?.fullName?.split(' ')[0] || 'there'}</Text>
      <Text style={styles.h1}>Find your next event</Text>
      <TouchableOpacity style={styles.search} onPress={() => navigation.navigate('Search')}>
        <Text style={styles.searchText}>Search events, cities, categories...</Text>
      </TouchableOpacity>
      <Text style={styles.section}>Featured</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {featured.map((e) => <Card key={e._id} event={e} onPress={() => navigation.navigate('EventDetails', { id: e._id })} />)}
      </ScrollView>
      <Text style={styles.section}>Popular now</Text>
      {list.map((e) => (
        <TouchableOpacity key={e._id} style={styles.row} onPress={() => navigation.navigate('EventDetails', { id: e._id })}>
          <Image source={{ uri: e.bannerImage }} style={styles.thumb} />
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle} numberOfLines={1}>{e.title}</Text>
            <Text style={styles.meta}>{new Date(e.startDate).toDateString()} · {e.venue?.city}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  // LOGO - SAME AS BEFORE
  logoContainer: {
    width: 200,
    height: 90,
    alignSelf: 'flex-start',
    marginLeft: -20,
    marginTop: -25,
    marginBottom: 5,
  },

  logo: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },

  // WRAP - SAME AS BEFORE
  wrap: {
    flex: 1,
    backgroundColor: colors.navy,
    padding: 10,
    paddingTop: 25,
  },

  hello: { color: colors.muted },

  h1: {
    color: colors.white,
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 16,
  },

  search: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 4,
  },

  searchText: { color: colors.muted },

  section: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 8,
  marginBottom: 6,
  },

  // NEW FEATURED CARD
  card: {
    width: 285,
    height: 190,
    backgroundColor: colors.card,
    borderRadius: 20,
    marginRight: 14,
    overflow: 'hidden',
  },

  img: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },

  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5, 10, 30, 0.48)',
  },

  cardContent: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 16,
  },

  cat: {
    color: '#FFFFFF',
    backgroundColor: '#7548D8',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    fontSize: 10,
    fontWeight: '800',
    overflow: 'hidden',
    marginBottom: 9,
  },

  featuredMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },

  cardTitle: {
    color: colors.white,
    fontSize: 19,
    fontWeight: '800',
    marginTop: 4,
  },

  meta: {
    color: '#D0D5E5',
    fontSize: 12,
    marginTop: 4,
  },

  // POPULAR NOW - SAME LAYOUT
  row: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 10,
    marginBottom: 10,
  },

  thumb: {
    width: 72,
    height: 72,
    borderRadius: 10,
  },
});
