import { graphQLService } from '@/services/graphql-service';

/**
 * API Testing Utilities
 * Use these functions to test your GraphQL API integration
 */

export class APITestUtils {
  /**
   * Test basic API connectivity
   */
  static async testBasicConnectivity() {
    try {
      console.log('🧪 Testing basic API connectivity...');
      
      // Test 1: Fetch books
      const books = await graphQLService.getBooks();
      console.log('✅ Books query successful:', books?.length || 0, 'books found');
      
      // Test 2: Fetch reservation policies
      const policies = await graphQLService.getReservationPolicies();
      console.log('✅ Policies query successful:', policies?.length || 0, 'policies found');
      
      return { success: true, books: books?.length || 0, policies: policies?.length || 0 };
    } catch (error) {
      console.error('❌ API connectivity test failed:', error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * Test user-related queries
   */
  static async testUserQueries(mockUserId: string) {
    try {
      console.log('🧪 Testing user queries...');
      
      // Test 1: Get user info
      const user = await graphQLService.getUser(mockUserId);
      console.log('✅ User query successful:', user ? 'User found' : 'User not found');
      
      // Test 2: Get user reservations
      const reservations = await graphQLService.getUserReservations(mockUserId);
      console.log('✅ User reservations query successful:', reservations?.length || 0, 'reservations found');
      
      // Test 3: Get all user reservations
      const allReservations = await graphQLService.getAllUserReservations(mockUserId);
      console.log('✅ All user reservations query successful:', allReservations?.length || 0, 'total reservations');
      
      return { 
        success: true, 
        user: !!user, 
        activeReservations: reservations?.length || 0,
        totalReservations: allReservations?.length || 0
      };
    } catch (error) {
      console.error('❌ User queries test failed:', error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * Test book filtering and search
   */
  static async testBookFilters() {
    try {
      console.log('🧪 Testing book filters...');
      
      // Test 1: Get all books
      const allBooks = await graphQLService.getBooks();
      console.log('✅ All books query successful:', allBooks?.length || 0, 'books found');
      
      // Test 2: Get available books only
      const availableBooks = await graphQLService.getBooksWithFilters(undefined, true);
      console.log('✅ Available books filter successful:', availableBooks?.length || 0, 'available books');
      
      // Test 3: Search books by title
      const searchResults = await graphQLService.getBooksWithFilters('the', true);
      console.log('✅ Book search successful:', searchResults?.length || 0, 'search results for "the"');
      
      return { 
        success: true, 
        totalBooks: allBooks?.length || 0,
        availableBooks: availableBooks?.length || 0,
        searchResults: searchResults?.length || 0
      };
    } catch (error) {
      console.error('❌ Book filters test failed:', error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * Test reservation creation (with mock data)
   */
  static async testReservationCreation(mockUserId: string, mockBookId: string) {
    try {
      console.log('🧪 Testing reservation creation...');
      
      // Calculate expiration date (7 days from now for testing)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      
      // Test: Create reservation
      const reservation = await graphQLService.createReservation(
        mockUserId, 
        mockBookId, 
        expiresAt.toISOString()
      );
      console.log('✅ Reservation creation successful:', reservation?.id);
      
      return { success: true, reservationId: reservation?.id };
    } catch (error) {
      console.error('❌ Reservation creation test failed:', error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * Test cache management
   */
  static async testCacheManagement() {
    try {
      console.log('🧪 Testing cache management...');
      
      // Test: Refresh cache
      await graphQLService.refreshCache();
      console.log('✅ Cache refresh successful');
      
      return { success: true };
    } catch (error) {
      console.error('❌ Cache management test failed:', error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * Run comprehensive API test suite
   */
  static async runFullTestSuite(mockUserId: string, mockBookId: string) {
    console.log('🚀 Starting comprehensive API test suite...\n');
    
    const results: any = {
      connectivity: await this.testBasicConnectivity(),
      userQueries: await this.testUserQueries(mockUserId),
      bookFilters: await this.testBookFilters(),
      cacheManagement: await this.testCacheManagement(),
    };
    
    // Only test reservation creation if we have valid IDs
    if (mockUserId && mockBookId) {
      results.reservationCreation = await this.testReservationCreation(mockUserId, mockBookId);
    }
    
    console.log('\n📊 Test Results Summary:');
    console.log('========================');
    Object.entries(results).forEach(([testName, result]) => {
      const status = (result as any).success ? '✅ PASS' : '❌ FAIL';
      console.log(`${status} ${testName}`);
      if (!(result as any).success) {
        console.log(`   Error: ${(result as any).error}`);
      }
    });
    
    const allPassed = Object.values(results).every((result: any) => result.success);
    console.log(`\n🎯 Overall Result: ${allPassed ? 'ALL TESTS PASSED' : 'SOME TESTS FAILED'}`);
    
    return results;
  }
}

/**
 * Quick test function for development
 */
export const quickAPITest = async () => {
  console.log('🧪 Running quick API test...');
  
  try {
    // Test basic connectivity
    const result = await APITestUtils.testBasicConnectivity();
    
    if (result.success) {
      console.log('✅ Quick test passed! API is working.');
      return true;
    } else {
      console.log('❌ Quick test failed:', result.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Quick test error:', error);
    return false;
  }
};
