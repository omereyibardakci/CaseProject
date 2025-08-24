import { useQuery } from '@apollo/client';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { useColorScheme } from '@/hooks/useColorScheme';
import { RESERVATIONS_QUERY } from '@/services/graphql-service';
import { reservationService } from '@/services/reservation-policy-service';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const [refreshing, setRefreshing] = useState(false);

  // Mock user data - in a real app, this would come from authentication context
  const mockUser = {
    id: 'user-123',
    email: 'student@example.com',
    name: 'John Doe',
    user_type: 'student' as const,
  };

  // GraphQL query for user reservations
  const { loading, error, data, refetch } = useQuery(RESERVATIONS_QUERY, {
    variables: { userId: mockUser.id },
  });

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (err) {
      console.error('Error refreshing profile:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const reservations = data?.reservations || [];
  const activeReservations = reservations.filter((r: any) => r.status === 'active');
  const completedReservations = reservations.filter((r: any) => r.status === 'completed');
  const cancelledReservations = reservations.filter((r: any) => r.status === 'cancelled');

  const maxReservations = reservationService.getMaxReservations(mockUser.user_type);
  const reservationDuration = reservationService.getReservationDuration(mockUser.user_type);

  const getRoleIcon = () => {
    return mockUser.user_type === 'student' ? 'school-outline' : 'person-outline';
  };

  const getRoleColor = () => {
    return mockUser.user_type === 'student' ? '#3b82f6' : '#10b981';
  };

  const getRoleDescription = () => {
    return mockUser.user_type === 'student' 
      ? 'Student members can reserve up to 5 books for 14 days'
      : 'Regular members can reserve up to 3 books for 7 days';
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: () => {
            // TODO: Implement logout logic
            Alert.alert('Success', 'Logged out successfully.');
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
          Loading profile...
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
          Failed to load profile
        </Text>
        <Text style={styles.errorSubtext}>
          {error.message}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={[
        styles.container,
        { backgroundColor: colorScheme === 'dark' ? '#111827' : '#f9fafb' }
      ]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#3b82f6']}
          tintColor={colorScheme === 'dark' ? '#6b7280' : '#9ca3af'}
        />
      }
    >
      {/* Profile Header */}
      <View style={[
        styles.profileHeader,
        { backgroundColor: colorScheme === 'dark' ? '#1f2937' : '#ffffff' }
      ]}>
        <View style={styles.avatarContainer}>
          <View style={[
            styles.avatar,
            { backgroundColor: getRoleColor() }
          ]}>
            <Text style={styles.avatarText}>
              {mockUser.name.charAt(0).toUpperCase()}
            </Text>
          </View>
        </View>
        
        <View style={styles.profileInfo}>
          <Text style={[
            styles.userName,
            { color: colorScheme === 'dark' ? '#f9fafb' : '#111827' }
          ]}>
            {mockUser.name}
          </Text>
          <Text style={[
            styles.userEmail,
            { color: colorScheme === 'dark' ? '#9ca3af' : '#6b7280' }
          ]}>
            {mockUser.email}
          </Text>
        </View>

        <View style={styles.roleContainer}>
          <Ionicons 
            name={getRoleIcon()} 
            size={20} 
            color={getRoleColor()} 
          />
          <Text style={[
            styles.roleText,
            { color: getRoleColor() }
          ]}>
            {mockUser.user_type.charAt(0).toUpperCase() + mockUser.user_type.slice(1)}
          </Text>
        </View>
      </View>

      {/* Role Information */}
      <View style={[
        styles.section,
        { backgroundColor: colorScheme === 'dark' ? '#1f2937' : '#ffffff' }
      ]}>
        <Text style={[
          styles.sectionTitle,
          { color: colorScheme === 'dark' ? '#f9fafb' : '#111827' }
        ]}>
          Membership Details
        </Text>
        <Text style={[
          styles.roleDescription,
          { color: colorScheme === 'dark' ? '#9ca3af' : '#6b7280' }
        ]}>
          {getRoleDescription()}
        </Text>
        
        <View style={styles.membershipStats}>
          <View style={styles.statItem}>
            <Text style={[
              styles.statValue,
              { color: getRoleColor() }
            ]}>
              {maxReservations}
            </Text>
            <Text style={[
              styles.statLabel,
              { color: colorScheme === 'dark' ? '#9ca3af' : '#6b7280' }
            ]}>
              Max Reservations
            </Text>
          </View>
          
          <View style={styles.statItem}>
            <Text style={[
              styles.statValue,
              { color: getRoleColor() }
            ]}>
              {reservationDuration}
            </Text>
            <Text style={[
              styles.statLabel,
              { color: colorScheme === 'dark' ? '#9ca3af' : '#6b7280' }
            ]}>
              Days to Return
            </Text>
          </View>
        </View>
      </View>

      {/* Reservation Statistics */}
      <View style={[
        styles.section,
        { backgroundColor: colorScheme === 'dark' ? '#1f2937' : '#ffffff' }
      ]}>
        <Text style={[
          styles.sectionTitle,
          { color: colorScheme === 'dark' ? '#f9fafb' : '#111827' }
        ]}>
          Reservation Statistics
        </Text>
        
        <View style={styles.statsGrid}>
          <View style={[
            styles.statCard,
            { backgroundColor: colorScheme === 'dark' ? '#374151' : '#f3f4f6' }
          ]}>
            <Ionicons 
              name="time-outline" 
              size={24} 
              color="#3b82f6" 
            />
            <Text style={[
              styles.statCardValue,
              { color: colorScheme === 'dark' ? '#f9fafb' : '#111827' }
            ]}>
              {activeReservations.length}
            </Text>
            <Text style={[
              styles.statCardLabel,
              { color: colorScheme === 'dark' ? '#9ca3af' : '#6b7280' }
            ]}>
              Active
            </Text>
          </View>

          <View style={[
            styles.statCard,
            { backgroundColor: colorScheme === 'dark' ? '#374151' : '#f3f4f6' }
          ]}>
            <Ionicons 
              name="checkmark-circle-outline" 
              size={24} 
              color="#10b981" 
            />
            <Text style={[
              styles.statCardValue,
              { color: colorScheme === 'dark' ? '#f9fafb' : '#111827' }
            ]}>
              {completedReservations.length}
            </Text>
            <Text style={[
              styles.statCardLabel,
              { color: colorScheme === 'dark' ? '#9ca3af' : '#6b7280' }
            ]}>
              Completed
            </Text>
          </View>

          <View style={[
            styles.statCard,
            { backgroundColor: colorScheme === 'dark' ? '#374151' : '#f3f4f6' }
          ]}>
            <Ionicons 
              name="close-circle-outline" 
              size={24} 
              color="#ef4444" 
            />
            <Text style={[
              styles.statCardValue,
              { color: colorScheme === 'dark' ? '#f9fafb' : '#111827' }
            ]}>
              {cancelledReservations.length}
            </Text>
            <Text style={[
              styles.statCardLabel,
              { color: colorScheme === 'dark' ? '#9ca3af' : '#6b7280' }
            ]}>
              Cancelled
            </Text>
          </View>

          <View style={[
            styles.statCard,
            { backgroundColor: colorScheme === 'dark' ? '#374151' : '#f3f4f6' }
          ]}>
            <Ionicons 
              name="library-outline" 
              size={24} 
              color="#8b5cf6" 
            />
            <Text style={[
              styles.statCardValue,
              { color: colorScheme === 'dark' ? '#f9fafb' : '#111827' }
            ]}>
              {reservations.length}
            </Text>
            <Text style={[
              styles.statCardLabel,
              { color: colorScheme === 'dark' ? '#9ca3af' : '#6b7280' }
            ]}>
              Total
            </Text>
          </View>
        </View>
      </View>

      {/* Actions */}
      <View style={[
        styles.section,
        { backgroundColor: colorScheme === 'dark' ? '#1f2937' : '#ffffff' }
      ]}>
        <Text style={[
          styles.sectionTitle,
          { color: colorScheme === 'dark' ? '#f9fafb' : '#111827' }
        ]}>
          Account Actions
        </Text>
        
        <TouchableOpacity
          style={[
            styles.actionButton,
            { borderColor: colorScheme === 'dark' ? '#ef4444' : '#ef4444' }
          ]}
          onPress={handleLogout}
        >
          <Ionicons 
            name="log-out-outline" 
            size={20} 
            color="#ef4444" 
          />
          <Text style={styles.actionButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  profileHeader: {
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    fontWeight: '500',
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roleText: {
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  roleDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  membershipStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    gap: 8,
  },
  statCardValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statCardLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
  },
  bottomSpacing: {
    height: 32,
  },
});
