
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEvents } from '../store/slices/eventsSlice';
import { colors } from '../theme';

const categories = [
  'all',
  'Technology',
  'Music',
  'Business',
  'Education',
  'Sports',
  'Workshops',
  'Entertainment',
  'Cultural',
  'Conferences',
  'Networking',
];

export default function ExploreScreen({ navigation }) {
  const dispatch = useDispatch();

  const { list, loading } = useSelector((s) => s.events);
  const [category, setCategory] = useState('all');

  useEffect(() => {
    dispatch(fetchEvents({ category, limit: 30 }));
  }, [category, dispatch]);

  const renderCategory = ({ item }) => {
    const selected = category === item;

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setCategory(item)}
        style={[
          styles.categoryChip,
          selected && styles.selectedChip,
        ]}
      >
        {selected && (
          <Text style={styles.checkIcon}>✓</Text>
        )}

        <Text
          style={[
            styles.categoryText,
            selected && styles.selectedCategoryText,
          ]}
        >
          {item === 'all' ? 'All Events' : item}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderEvent = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.card}
      onPress={() =>
        navigation.navigate('EventDetails', { id: item._id })
      }
    >
      <Image
        source={{ uri: item.bannerImage }}
        style={styles.img}
        resizeMode="cover"
      />

      <View style={styles.cardContent}>
        <Text style={styles.name} numberOfLines={1}>
          {item.title}
        </Text>

        <Text style={styles.meta} numberOfLines={1}>
          {item.venue?.city || 'Location TBA'} · From ₹
          {item.minPrice ?? 0}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Explore</Text>

      <Text style={styles.subtitle}>
        Discover events around you
      </Text>

      {/* Category Section */}
      <View style={styles.categorySection}>
        <FlatList
          horizontal
          data={categories}
          keyExtractor={(item) => item}
          renderItem={renderCategory}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
          extraData={category}
        />
      </View>

      {/* Events List */}
      <FlatList
        data={list}
        keyExtractor={(item) => item._id}
        renderItem={renderEvent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.eventsList}
        refreshing={loading}
        onRefresh={() =>
          dispatch(fetchEvents({ category, limit: 30 }))
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>
                No events found
              </Text>
              <Text style={styles.emptyText}>
                Try exploring another category.
              </Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          loading && list.length === 0 ? (
            <ActivityIndicator
              color={colors.purple}
              style={{ marginTop: 30 }}
            />
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: colors.navy,
    paddingTop: 56,
    paddingHorizontal: 16,
  },

  title: {
    color: colors.white,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  subtitle: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 5,
    marginBottom: 18,
  },

  categorySection: {
    marginBottom: 16,
  },

  categoryList: {
    paddingRight: 10,
    paddingBottom: 5,
  },

  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 9,
    borderWidth: 1,
    borderColor: '#28344D',
    minHeight: 40,
  },

  selectedChip: {
    backgroundColor: colors.purple,
    borderColor: colors.purple,
  },

  checkIcon: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    marginRight: 6,
  },

  categoryText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
  },

  selectedCategoryText: {
    color: '#FFFFFF',
  },

  eventsList: {
    paddingBottom: 20,
  },

  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 14,
  },

  img: {
    width: '100%',
    height: 150,
  },

  cardContent: {
    padding: 12,
  },

  name: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 13,
  },

  meta: {
    color: colors.muted,
    marginTop: 5,
    fontSize: 12,
  },

  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
  },

  emptyTitle: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },

  emptyText: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 7,
  },
});
