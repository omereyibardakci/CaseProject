import { useQuery } from '@apollo/client';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    View
} from 'react-native';

import { BookCard } from '@/components/BookCard';
import { useColorScheme } from '@/hooks/useColorScheme';
import { BOOKS_QUERY } from '@/services/graphql-service';
import { Book } from '@/types/graphql';

export default function BookListScreen() {
  const colorScheme = useColorScheme();
  const [refreshing, setRefreshing] = useState(false);

  // GraphQL query for books
  const { loading, error, data, refetch } = useQuery(BOOKS_QUERY);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (err) {
      console.error('Error refreshing books:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const renderBookItem = ({ item }: { item: Book }) => (
    <BookCard book={item} />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons 
        name="library-outline" 
        size={64} 
        color={colorScheme === 'dark' ? '#6b7280' : '#9ca3af'} 
      />
      <Text style={[
        styles.emptyStateText,
        { color: colorScheme === 'dark' ? '#6b7280' : '#9ca3af' }
      ]}>
        No books available
      </Text>
    </View>
  );

  if (loading && !data) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={[
          styles.loadingText,
          { color: colorScheme === 'dark' ? '#6b7280' : '#9ca3af' }
        ]}>
          Loading books...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons 
          name="alert-circle-outline" 
          size={64} 
          color="#ef4444" 
        />
        <Text style={styles.errorText}>
          Failed to load books
        </Text>
        <Text style={styles.errorSubtext}>
          {error.message}
        </Text>
      </View>
    );
  }

  const books = data?.books || [];

  return (
    <View style={[
      styles.container,
      { backgroundColor: colorScheme === 'dark' ? '#111827' : '#f9fafb' }
    ]}>
      <FlatList
        data={books}
        renderItem={renderBookItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#3b82f6']}
            tintColor={colorScheme === 'dark' ? '#6b7280' : '#9ca3af'}
          />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 32,
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#ef4444',
    textAlign: 'center',
  },
  errorSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
});
