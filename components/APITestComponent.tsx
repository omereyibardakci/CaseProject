import { useAuth } from '@/contexts/AuthContext';
import { graphQLService } from '@/services/graphql-service';
import { APITestUtils, quickAPITest } from '@/utils/api-test-utils';
import React, { useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';

/**
 * API Test Component
 * Provides a simple interface to test GraphQL API integration
 */
export const APITestComponent: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const { user } = useAuth();

  const handleQuickTest = async () => {
    setIsLoading(true);
    try {
      const result = await quickAPITest();
      if (result) {
        Alert.alert('✅ Success', 'Quick API test passed! Your GraphQL API is working.');
      } else {
        Alert.alert('❌ Failed', 'Quick API test failed. Check the console for details.');
      }
    } catch (error) {
      Alert.alert('❌ Error', `Test error: ${String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFullTest = async () => {
    setIsLoading(true);
    try {
      // Use mock IDs for testing
      const mockUserId = '550e8400-e29b-41d4-a716-446655440000'; // Example UUID
      const mockBookId = '550e8400-e29b-41d4-a716-446655440001'; // Example UUID
      
      const results = await APITestUtils.runFullTestSuite(mockUserId, mockBookId);
      setTestResults(results);
      
      const allPassed = Object.values(results).every((result: any) => result.success);
      if (allPassed) {
        Alert.alert('🎯 All Tests Passed', 'Your GraphQL API integration is working perfectly!');
      } else {
        Alert.alert('⚠️ Some Tests Failed', 'Check the console and test results below for details.');
      }
    } catch (error) {
      Alert.alert('❌ Error', `Full test error: ${String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBasicConnectivity = async () => {
    setIsLoading(true);
    try {
      const result = await APITestUtils.testBasicConnectivity();
      setTestResults({ connectivity: result });
      
      if (result.success) {
        Alert.alert('✅ Success', `Basic connectivity test passed!\nBooks: ${result.books}\nPolicies: ${result.policies}`);
      } else {
        Alert.alert('❌ Failed', `Connectivity test failed: ${result.error}`);
      }
    } catch (error) {
      Alert.alert('❌ Error', `Connectivity test error: ${String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookFilters = async () => {
    setIsLoading(true);
    try {
      const result = await APITestUtils.testBookFilters();
      setTestResults({ bookFilters: result });
      
      if (result.success) {
        Alert.alert('✅ Success', `Book filters test passed!\nTotal: ${result.totalBooks}\nAvailable: ${result.availableBooks}\nSearch Results: ${result.searchResults}`);
      } else {
        Alert.alert('❌ Failed', `Book filters test failed: ${result.error}`);
      }
    } catch (error) {
      Alert.alert('❌ Error', `Book filters test error: ${String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testCreateReservation = async () => {
    try {
      setTestResults((prev: any) => ({ ...prev, reservationCreation: 'Testing...' }));
      
      if (!user) {
        setTestResults((prev: any) => ({ ...prev, reservationCreation: 'Error: No authenticated user' }));
        return;
      }

      // Test creating a reservation
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now
      
      const result = await graphQLService.createReservation(
        user.id,
        '550e8400-e29b-41d4-a716-446655440001', // Use the first book ID from your database
        expiresAt.toISOString()
      );
      
      setTestResults((prev: any) => ({ 
        ...prev, 
        reservationCreation: `Success: Reservation created with ID ${result?.id}` 
      }));
    } catch (error) {
      setTestResults((prev: any) => ({ 
        ...prev, 
        reservationCreation: `Error: ${String(error)}` 
      }));
    }
  };

  const testReservationTable = async () => {
    try {
      setTestResults((prev: any) => ({ ...prev, tableTest: 'Testing table structure...' }));
      
      if (!user) {
        setTestResults((prev: any) => ({ ...prev, tableTest: 'Error: No authenticated user' }));
        return;
      }

      // Test with minimal fields to check table structure
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      
      const result = await graphQLService.testReservation(
        user.id,
        '550e8400-e29b-41d4-a716-446655440001',
        expiresAt.toISOString()
      );
      
      if (result.success) {
        setTestResults((prev: any) => ({ 
          ...prev, 
          tableTest: `Table test passed: Reservation ID ${result.id}` 
        }));
      } else {
        setTestResults((prev: any) => ({ 
          ...prev, 
          tableTest: `Table test failed: ${result.message || result.error || 'Unknown error'}` 
        }));
      }
    } catch (error) {
      setTestResults((prev: any) => ({ 
        ...prev, 
        tableTest: `Table test error: ${String(error)}` 
      }));
    }
  };

  const checkTableStructure = async () => {
    try {
      setTestResults((prev: any) => ({ ...prev, tableStructure: 'Checking table structure...' }));
      
      const result = await graphQLService.checkReservationsTable();
      
      if (result.success && result.tableExists) {
        setTestResults((prev: any) => ({ 
          ...prev, 
          tableStructure: `Table exists with ${result.totalCount} records. Sample: ${JSON.stringify(result.sampleData)}` 
        }));
      } else if (result.success && !result.tableExists) {
        setTestResults((prev: any) => ({ 
          ...prev, 
          tableStructure: 'Table does not exist or is not accessible' 
        }));
      } else {
        setTestResults((prev: any) => ({ 
          ...prev, 
          tableStructure: `Check failed: ${result.error || result.errors?.join(', ') || 'Unknown error'}` 
        }));
      }
    } catch (error) {
      setTestResults((prev: any) => ({ 
        ...prev, 
        tableStructure: `Structure check error: ${String(error)}` 
      }));
    }
  };

  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' }}>
        🧪 GraphQL API Test Suite
      </Text>
      
      <Text style={{ fontSize: 16, marginBottom: 20, textAlign: 'center', color: '#666' }}>
        Test your Hasura GraphQL API integration
      </Text>

      {/* Test Buttons */}
      <View style={{ gap: 12, marginBottom: 20 }}>
        <TouchableOpacity
          style={{
            backgroundColor: '#007AFF',
            padding: 16,
            borderRadius: 8,
            alignItems: 'center'
          }}
          onPress={handleQuickTest}
          disabled={isLoading}
        >
          <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
            {isLoading ? '🔄 Testing...' : '🚀 Quick API Test'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: '#34C759',
            padding: 16,
            borderRadius: 8,
            alignItems: 'center'
          }}
          onPress={handleBasicConnectivity}
          disabled={isLoading}
        >
          <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
            {isLoading ? '🔄 Testing...' : '🔌 Test Basic Connectivity'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: '#FF9500',
            padding: 16,
            borderRadius: 8,
            alignItems: 'center'
          }}
          onPress={handleBookFilters}
          disabled={isLoading}
        >
          <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
            {isLoading ? '🔄 Testing...' : '📚 Test Book Filters'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: '#06B6D4',
            padding: 16,
            borderRadius: 8,
            alignItems: 'center'
          }}
          onPress={checkTableStructure}
          disabled={isLoading}
        >
          <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
            {isLoading ? '🔄 Checking...' : '📋 Check Table Structure'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: '#8B5CF6',
            padding: 16,
            borderRadius: 8,
            alignItems: 'center'
          }}
          onPress={testReservationTable}
          disabled={isLoading}
        >
          <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
            {isLoading ? '🔄 Testing...' : '🔍 Test Reservation Table'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: '#FF3B30',
            padding: 16,
            borderRadius: 8,
            alignItems: 'center'
          }}
          onPress={testCreateReservation}
          disabled={isLoading}
        >
          <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
            {isLoading ? '🔄 Testing...' : '📖 Test Create Reservation'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            backgroundColor: '#AF52DE',
            padding: 16,
            borderRadius: 8,
            alignItems: 'center'
          }}
          onPress={handleFullTest}
          disabled={isLoading}
        >
          <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
            {isLoading ? '🔄 Running Full Suite...' : '🎯 Run Full Test Suite'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Test Results */}
      {testResults && (
        <View style={{ marginTop: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>
            📊 Test Results:
          </Text>
          
          {Object.entries(testResults).map(([testName, result]: [string, any]) => (
            <View key={testName} style={{ 
              backgroundColor: typeof result === 'string' && result.includes('Success') ? '#E8F5E8' : '#FFEBEE',
              padding: 12,
              borderRadius: 8,
              marginBottom: 8
            }}>
              <Text style={{ 
                fontWeight: 'bold',
                color: typeof result === 'string' && result.includes('Success') ? '#2E7D32' : '#C62828'
              }}>
                {typeof result === 'string' && result.includes('Success') ? '✅' : '❌'} {testName}
              </Text>
              <Text style={{ color: typeof result === 'string' && result.includes('Success') ? '#2E7D32' : '#C62828', marginTop: 4 }}>
                {typeof result === 'string' ? result : JSON.stringify(result)}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Instructions */}
      <View style={{ marginTop: 20, padding: 16, backgroundColor: '#F0F0F0', borderRadius: 8 }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>
          📋 How to Use:
        </Text>
        <Text style={{ fontSize: 14, marginBottom: 4 }}>
          • <Text style={{ fontWeight: 'bold' }}>Quick Test:</Text> Basic API connectivity
        </Text>
        <Text style={{ fontSize: 14, marginBottom: 4 }}>
          • <Text style={{ fontWeight: 'bold' }}>Basic Connectivity:</Text> Test books and policies queries
        </Text>
        <Text style={{ fontSize: 14, marginBottom: 4 }}>
          • <Text style={{ fontWeight: 'bold' }}>Book Filters:</Text> Test search and filtering
        </Text>
        <Text style={{ fontSize: 14, marginBottom: 4 }}>
          • <Text style={{ fontWeight: 'bold' }}>Check Table Structure:</Text> Verify reservations table exists
        </Text>
        <Text style={{ fontSize: 14, marginBottom: 4 }}>
          • <Text style={{ fontWeight: 'bold' }}>Test Reservation Table:</Text> Test table structure and permissions
        </Text>
        <Text style={{ fontSize: 14, marginBottom: 4 }}>
          • <Text style={{ fontWeight: 'bold' }}>Create Reservation:</Text> Test reservation creation
        </Text>
        <Text style={{ fontSize: 14, marginBottom: 4 }}>
          • <Text style={{ fontWeight: 'bold' }}>Full Suite:</Text> Comprehensive testing
        </Text>
        <Text style={{ fontSize: 12, marginTop: 8, color: '#666' }}>
          Check the console for detailed test output and any error messages.
        </Text>
      </View>
    </ScrollView>
  );
};
