import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { useColorScheme } from '@/hooks/useColorScheme';
import { graphQLService } from '@/services/graphql-service';
import { reservationService } from '@/services/reservation-policy-service';
import { Book } from '@/types/graphql';

interface BookCardProps {
  book: Book;
}

export function BookCard({ book }: BookCardProps) {
  const colorScheme = useColorScheme();
  const [reserving, setReserving] = useState(false);

  // Mock user data - in a real app, this would come from authentication context
  const mockUser = {
    id: 'user-123',
    email: 'student@example.com',
    name: 'John Doe',
    user_type: 'student' as const,
  };

  const handleReserve = async () => {
    if (book.available_copies === 0) {
      Alert.alert('Not Available', 'This book has no available copies.');
      return;
    }

    try {
      setReserving(true);

      // Get user's current reservations
      const currentReservations = await graphQLService.getUserReservations(mockUser.id);
      const reservationCount = currentReservations.length;

      // Check if user can reserve based on policy
      if (!reservationService.canUserReserve(mockUser, reservationCount)) {
        const maxReservations = reservationService.getMaxReservations(mockUser.user_type);
        Alert.alert(
          'Reservation Limit Reached',
          `You can only reserve up to ${maxReservations} books. Please return some books first.`
        );
        return;
      }

      // Calculate expiration date
      const expiresAt = reservationService.calculateExpirationDate(mockUser.user_type);

      // Create reservation
      await graphQLService.createReservation(mockUser.id, book.id, expiresAt);

      // Update book availability
      await graphQLService.updateBookAvailability(book.id, book.available_copies - 1);

      Alert.alert(
        'Success!',
        `"${book.title}" has been reserved successfully. It will expire in ${reservationService.getReservationDuration(mockUser.user_type)} days.`
      );
    } catch (error) {
      console.error('Reservation error:', error);
      Alert.alert('Error', 'Failed to reserve the book. Please try again.');
    } finally {
      setReserving(false);
    }
  };

  const getAvailabilityColor = () => {
    if (book.available_copies === 0) return '#ef4444';
    if (book.available_copies <= 2) return '#f59e0b';
    return '#10b981';
  };

  const getAvailabilityText = () => {
    if (book.available_copies === 0) return 'Out of Stock';
    if (book.available_copies === 1) return '1 copy left';
    return `${book.available_copies} copies available`;
  };

  return (
    <View style={[
      styles.card,
      { 
        backgroundColor: colorScheme === 'dark' ? '#1f2937' : '#ffffff',
        borderColor: colorScheme === 'dark' ? '#374151' : '#e5e7eb',
      }
    ]}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={[
            styles.title,
            { color: colorScheme === 'dark' ? '#f9fafb' : '#111827' }
          ]}>
            {book.title}
          </Text>
          <Text style={[
            styles.author,
            { color: colorScheme === 'dark' ? '#9ca3af' : '#6b7280' }
          ]}>
            by {book.author}
          </Text>
        </View>
        <View style={styles.availabilityContainer}>
          <View style={[styles.availabilityDot, { backgroundColor: getAvailabilityColor() }]} />
          <Text style={[
            styles.availabilityText,
            { color: getAvailabilityColor() }
          ]}>
            {getAvailabilityText()}
          </Text>
        </View>
      </View>

      {book.isbn && (
        <Text style={[
          styles.isbn,
          { color: colorScheme === 'dark' ? '#6b7280' : '#9ca3af' }
        ]}>
          ISBN: {book.isbn}
        </Text>
      )}

      <View style={styles.footer}>
        <View style={styles.copiesInfo}>
          <Ionicons 
            name="library-outline" 
            size={16} 
            color={colorScheme === 'dark' ? '#9ca3af' : '#6b7280'} 
          />
          <Text style={[
            styles.copiesText,
            { color: colorScheme === 'dark' ? '#9ca3af' : '#6b7280' }
          ]}>
            {book.available_copies} of {book.total_copies} copies available
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.reserveButton,
            { 
              backgroundColor: book.available_copies > 0 ? '#3b82f6' : '#9ca3af',
              opacity: reserving ? 0.7 : 1,
            }
          ]}
          onPress={handleReserve}
          disabled={book.available_copies === 0 || reserving}
        >
          {reserving ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={styles.reserveButtonText}>
              {book.available_copies > 0 ? 'Reserve' : 'Unavailable'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    lineHeight: 24,
  },
  author: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  availabilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 100,
  },
  availabilityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  availabilityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  isbn: {
    fontSize: 12,
    marginBottom: 16,
    fontFamily: 'monospace',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  copiesInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  copiesText: {
    fontSize: 12,
    marginLeft: 6,
  },
  reserveButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  reserveButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});
