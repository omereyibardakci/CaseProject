import { useQuery } from '@apollo/client';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { RESERVATIONS_QUERY, graphQLService } from '@/services/graphql-service';
import { Reservation } from '@/types/graphql';

export default function ReservationsScreen() {
  const colorScheme = useColorScheme();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all');
  const [cancellingReservation, setCancellingReservation] = useState<string | null>(null);

  // Check if user is authenticated
  if (!user) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
        <Text style={styles.errorText}>User not found</Text>
        <Text style={styles.errorSubtext}>Please log in again</Text>
      </View>
    );
  }

  // GraphQL query for user reservations
  const { loading, error, data, refetch } = useQuery(RESERVATIONS_QUERY, {
    variables: { userId: user.id },
  });

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (err) {
      console.error('Error refreshing reservations:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const reservations = data?.reservations || [];

  const filteredReservations = selectedStatus === 'all' 
    ? reservations 
    : reservations.filter((reservation: any) => reservation.status === selectedStatus);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'completed': return '#6b7280';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return 'time-outline';
      case 'completed': return 'checkmark-circle-outline';
      case 'cancelled': return 'close-circle-outline';
      default: return 'help-circle-outline';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDaysRemaining = (dateString: string) => {
    const now = new Date();
    const expiryDate = new Date(dateString);
    const diffTime = expiryDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return 'Expired';
    } else if (diffDays === 0) {
      return 'Expires today';
    } else if (diffDays === 1) {
      return 'Expires tomorrow';
    } else {
      return `${diffDays} days left`;
    }
  };

  const renderReservationItem = ({ item }: { item: Reservation }) => (
    <View style={[
      styles.reservationCard,
      { 
        backgroundColor: colorScheme === 'dark' ? '#1f2937' : '#ffffff',
        borderColor: colorScheme === 'dark' ? '#374151' : '#e5e7eb',
      }
    ]}>
      <View style={styles.cardHeader}>
        <View style={styles.bookInfo}>
          <Text style={[
            styles.bookTitle,
            { color: colorScheme === 'dark' ? '#f9fafb' : '#111827' }
          ]}>
            {item.book?.title || 'Unknown Book'}
          </Text>
          <Text style={[
            styles.bookAuthor,
            { color: colorScheme === 'dark' ? '#9ca3af' : '#6b7280' }
          ]}>
            by {item.book?.author || 'Unknown Author'}
          </Text>
        </View>
        <View style={styles.statusContainer}>
          <Ionicons 
            name={getStatusIcon(item.status) as any} 
            size={20} 
            color={getStatusColor(item.status)} 
          />
          <Text style={[
            styles.statusText,
            { color: getStatusColor(item.status) }
          ]}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.dateRow}>
          <View style={styles.dateItem}>
            <Ionicons 
              name="time-outline" 
              size={16} 
              color={colorScheme === 'dark' ? '#9ca3af' : '#6b7280'} 
            />
            <Text style={[
              styles.dateLabel,
              { color: colorScheme === 'dark' ? '#9ca3af' : '#6b7280' }
            ]}>
              Expires:
            </Text>
            <Text style={[
              styles.dateValue,
              { color: getStatusColor(item.status) }
            ]}>
              {formatDate(item.expires_at)}
            </Text>
          </View>
          <View style={styles.dateItem}>
            <Ionicons 
              name="calendar-outline" 
              size={16} 
              color={colorScheme === 'dark' ? '#9ca3af' : '#6b7280'} 
            />
            <Text style={[
              styles.dateLabel,
              { color: colorScheme === 'dark' ? '#9ca3af' : '#6b7280' }
            ]}>
              Time Left:
            </Text>
            <Text style={[
              styles.dateValue,
              { color: getStatusColor(item.status) }
            ]}>
              {getDaysRemaining(item.expires_at)}
            </Text>
          </View>
        </View>
      </View>

      {item.status === 'active' && (
        <View style={styles.cardFooter}>
          <TouchableOpacity
            style={[
              styles.cancelButton,
              { 
                borderColor: colorScheme === 'dark' ? '#ef4444' : '#ef4444',
                opacity: cancellingReservation === item.id ? 0.6 : 1
              }
            ]}
            onPress={() => handleCancelReservation(item.id)}
            disabled={cancellingReservation === item.id}
          >
            {cancellingReservation === item.id ? (
              <View style={styles.cancelButtonLoading}>
                <ActivityIndicator size="small" color="#ef4444" />
                <Text style={styles.cancelButtonText}>Cancelling...</Text>
              </View>
            ) : (
              <Text style={styles.cancelButtonText}>Cancel Reservation</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons 
        name="bookmark-outline" 
        size={64} 
        color={colorScheme === 'dark' ? '#6b7280' : '#9ca3af'} 
      />
      <Text style={[
        styles.emptyStateText,
        { color: colorScheme === 'dark' ? '#6b7280' : '#9ca3af' }
      ]}>
        No reservations found
      </Text>
      <Text style={[
        styles.emptyStateSubtext,
        { color: colorScheme === 'dark' ? '#6b7280' : '#9ca3af' }
      ]}>
        {selectedStatus === 'all' 
          ? 'You haven\'t made any reservations yet.' 
          : `No ${selectedStatus} reservations found.`
        }
      </Text>
    </View>
  );

  const handleCancelReservation = async (reservationId: string) => {
    // Find the reservation to get book details
    const reservation = reservations.find((r: any) => r.id === reservationId);
    
    if (!reservation) {
      Alert.alert('Error', 'Reservation not found.');
      return;
    }
    
    if (reservation.status !== 'active') {
      Alert.alert('Cannot Cancel', `This reservation is already ${reservation.status}.`);
      return;
    }
    
    const bookTitle = reservation?.book?.title || 'this book';
    
    Alert.alert(
      'Cancel Reservation',
      `Are you sure you want to cancel your reservation for "${bookTitle}"?`,
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes, Cancel', 
          style: 'destructive',
          onPress: async () => {
            try {
              setCancellingReservation(reservationId);
              
              // Call the GraphQL service to cancel the reservation
              await graphQLService.cancelReservation(reservationId);
              
              // Show success message
              Alert.alert('Success', `Reservation for "${bookTitle}" has been cancelled successfully.`);
              
              // Refresh the reservations list
              await refetch();
            } catch (error) {
              console.error('Error cancelling reservation:', error);
              Alert.alert(
                'Error', 
                error instanceof Error ? error.message : 'Failed to cancel reservation. Please try again.'
              );
            } finally {
              setCancellingReservation(null);
            }
          }
        },
      ]
    );
  };

  if (loading && !data) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={[
          styles.loadingText,
          { color: colorScheme === 'dark' ? '#6b7280' : '#9ca3af' }
        ]}>
          Loading reservations...
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
          Failed to load reservations
        </Text>
        <Text style={styles.errorSubtext}>
          {error.message}
        </Text>
      </View>
    );
  }

  return (
    <View style={[
      styles.container,
      { backgroundColor: colorScheme === 'dark' ? '#111827' : '#f9fafb' }
    ]}>
      {/* Status Filter Tabs */}
      <View style={styles.filterContainer}>
        {(['all', 'active', 'completed', 'cancelled'] as const).map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterTab,
              selectedStatus === status && {
                backgroundColor: '#3b82f6',
                borderColor: '#3b82f6',
              }
            ]}
            onPress={() => setSelectedStatus(status)}
          >
            <Text style={[
              styles.filterTabText,
              selectedStatus === status && { color: '#ffffff' }
            ]}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredReservations}
        renderItem={renderReservationItem}
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
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
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
  emptyStateSubtext: {
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
  },
  reservationCard: {
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  bookInfo: {
    flex: 1,
    marginRight: 12,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    lineHeight: 22,
  },
  bookAuthor: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 80,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  cardBody: {
    marginBottom: 16,
  },
  dateRow: {
    gap: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateLabel: {
    fontSize: 12,
    fontWeight: '500',
    minWidth: 60,
  },
  dateValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 16,
    alignItems: 'flex-end',
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  cancelButtonText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '600',
  },
  cancelButtonLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
