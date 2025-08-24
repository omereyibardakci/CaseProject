import { apolloClient } from '@/lib/apollo-client';
import { gql } from '@apollo/client';

// GraphQL queries and mutations - following clean code principles
export const BOOKS_QUERY = gql`
  query GetBooks {
    books {
      id
      title
      author
      isbn
      available
      total_copies
      available_copies
    }
  }
`;

export const BOOKS_WITH_FILTERS_QUERY = gql`
  query GetBooksWithFilters($searchTerm: String, $availableOnly: Boolean) {
    books(
      where: {
        _and: [
          { _or: [
            { title: { _ilike: $searchTerm } },
            { author: { _ilike: $searchTerm } }
          ] },
          { available: { _eq: $availableOnly } }
        ]
      }
      order_by: { title: asc }
    ) {
      id
      title
      author
      isbn
      available
      total_copies
      available_copies
    }
  }
`;

export const RESERVATIONS_QUERY = gql`
  query GetUserReservations($userId: uuid!) {
    reservations(where: { user_id: { _eq: $userId }, status: { _eq: "active" } }) {
      id
      book_id
      expires_at
      status
      book {
        id
        title
        author
      }
    }
  }
`;

export const ALL_RESERVATIONS_QUERY = gql`
  query GetAllUserReservations($userId: uuid!) {
    reservations(
      where: { user_id: { _eq: $userId } }
      order_by: { expires_at: desc }
    ) {
      id
      book_id
      expires_at
      status
      book {
        id
        title
        author
        isbn
      }
    }
  }
`;

export const CREATE_RESERVATION_MUTATION = gql`
  mutation CreateReservation($userId: uuid!, $bookId: uuid!, $expiresAt: timestamp!) {
    insert_reservations_one(object: {
      user_id: $userId,
      book_id: $bookId,
      expires_at: $expiresAt
    }) {
      id
      user_id
      book_id
      expires_at
      status
      created_at
    }
  }
`;

export const UPDATE_BOOK_AVAILABILITY_MUTATION = gql`
  mutation UpdateBookAvailability($bookId: uuid!, $availableCopies: Int!) {
    update_books_by_pk(
      pk_columns: { id: $bookId },
      _set: { available_copies: $availableCopies }
    ) {
      id
      available_copies
      available
    }
  }
`;

export const CANCEL_RESERVATION_MUTATION = gql`
  mutation CancelReservation($reservationId: uuid!) {
    update_reservations_by_pk(
      pk_columns: { id: $reservationId },
      _set: { status: "cancelled" }
    ) {
      id
      status
    }
  }
`;

export const GET_USER_QUERY = gql`
  query GetUser($userId: uuid!) {
    users_by_pk(id: $userId) {
      id
      email
      name
      user_type
      created_at
    }
  }
`;

export const GET_RESERVATION_POLICIES_QUERY = gql`
  query GetReservationPolicies {
    reservation_policies(where: { is_active: { _eq: true } }) {
      id
      user_type
      max_reservations
      reservation_duration_days
    }
  }
`;

// Simple test mutation to verify table structure
export const TEST_RESERVATION_MUTATION = gql`
  mutation TestReservation($userId: uuid!, $bookId: uuid!, $expiresAt: timestamp!) {
    insert_reservations_one(object: {
      user_id: $userId,
      book_id: $bookId,
      expires_at: $expiresAt
    }) {
      id
    }
  }
`;

// Query to check if reservations table exists and get its structure
export const CHECK_RESERVATIONS_TABLE_QUERY = gql`
  query CheckReservationsTable {
    reservations(limit: 1) {
      id
      user_id
      book_id
      expires_at
      status
      created_at
    }
  }
`;

// GraphQL Service class following Single Responsibility Principle
export class GraphQLService {
  /**
   * Fetches all available books
   * @returns Promise with books data
   */
  async getBooks() {
    try {
      const { data } = await apolloClient.query({
        query: BOOKS_QUERY,
        fetchPolicy: 'cache-first',
      });
      return data.books;
    } catch (error) {
      console.error('Error fetching books:', error);
      throw new Error('Failed to fetch books');
    }
  }

  /**
   * Fetches books with search and filter options
   * @param searchTerm - Optional search term for title or author
   * @param availableOnly - Filter for available books only
   * @returns Promise with filtered books data
   */
  async getBooksWithFilters(searchTerm?: string, availableOnly?: boolean) {
    try {
      const { data } = await apolloClient.query({
        query: BOOKS_WITH_FILTERS_QUERY,
        variables: { 
          searchTerm: searchTerm ? `%${searchTerm}%` : '%',
          availableOnly: availableOnly ?? true
        },
        fetchPolicy: 'cache-first',
      });
      return data.books;
    } catch (error) {
      console.error('Error fetching filtered books:', error);
      throw new Error('Failed to fetch filtered books');
    }
  }

  /**
   * Fetches user's active reservations
   * @param userId - The user's unique identifier
   * @returns Promise with reservations data
   */
  async getUserReservations(userId: string) {
    try {
      const { data } = await apolloClient.query({
        query: RESERVATIONS_QUERY,
        variables: { userId },
        fetchPolicy: 'cache-first',
      });
      return data.reservations;
    } catch (error) {
      console.error('Error fetching user reservations:', error);
      throw new Error('Failed to fetch user reservations');
    }
  }

  /**
   * Fetches all user reservations (active, completed, cancelled)
   * @param userId - The user's unique identifier
   * @returns Promise with all reservations data
   */
  async getAllUserReservations(userId: string) {
    try {
      const { data } = await apolloClient.query({
        query: ALL_RESERVATIONS_QUERY,
        variables: { userId },
        fetchPolicy: 'cache-first',
      });
      return data.reservations;
    } catch (error) {
      console.error('Error fetching all user reservations:', error);
      throw new Error('Failed to fetch all user reservations');
    }
  }

  /**
   * Fetches user information
   * @param userId - The user's unique identifier
   * @returns Promise with user data
   */
  async getUser(userId: string) {
    try {
      const { data } = await apolloClient.query({
        query: GET_USER_QUERY,
        variables: { userId },
        fetchPolicy: 'cache-first',
      });
      return data.users_by_pk;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw new Error('Failed to fetch user information');
    }
  }

  /**
   * Fetches reservation policies
   * @returns Promise with reservation policies data
   */
  async getReservationPolicies() {
    try {
      const { data } = await apolloClient.query({
        query: GET_RESERVATION_POLICIES_QUERY,
        fetchPolicy: 'cache-first',
      });
      return data.reservation_policies;
    } catch (error) {
      console.error('Error fetching reservation policies:', error);
      throw new Error('Failed to fetch reservation policies');
    }
  }

  /**
   * Creates a new book reservation
   * @param userId - The user's unique identifier
   * @param bookId - The book's unique identifier
   * @param expiresAt - When the reservation expires
   * @returns Promise with the created reservation
   */
  async createReservation(userId: string, bookId: string, expiresAt: string) {
    try {
      console.log('Creating reservation with variables:', { userId, bookId, expiresAt });
      
      const { data, errors } = await apolloClient.mutate({
        mutation: CREATE_RESERVATION_MUTATION,
        variables: { userId, bookId, expiresAt },
        refetchQueries: [
          { query: RESERVATIONS_QUERY, variables: { userId } },
          { query: BOOKS_QUERY },
        ],
      });
      
      console.log('Full mutation response:', { data, errors });
      
      // Check for GraphQL errors first
      if (errors && errors.length > 0) {
        console.error('GraphQL errors:', errors);
        throw new Error(`GraphQL errors: ${errors.map(e => e.message).join(', ')}`);
      }
      
      // Check if we have any data at all
      if (!data) {
        console.error('No data returned from mutation');
        throw new Error('No data returned from mutation');
      }
      
      // Log the entire data structure for debugging
      console.log('Mutation response data:', JSON.stringify(data, null, 2));
      
      // Check for the specific field we expect
      if (!data.insert_reservations_one) {
        console.error('No reservation data returned from mutation');
        console.error('Available data keys:', Object.keys(data));
        throw new Error('No reservation data returned from mutation');
      }
      
      const reservation = data.insert_reservations_one;
      console.log('Successfully created reservation:', reservation);
      
      return reservation;
    } catch (error) {
      console.error('Error creating reservation:', error);
      
      // Provide more specific error information
      if (error instanceof Error) {
        throw new Error(`Failed to create reservation: ${error.message}`);
      } else {
        throw new Error(`Failed to create reservation: ${String(error)}`);
      }
    }
  }

  /**
   * Updates book availability after reservation
   * @param bookId - The book's unique identifier
   * @param availableCopies - New number of available copies
   * @returns Promise with updated book data
   */
  async updateBookAvailability(bookId: string, availableCopies: number) {
    try {
      const { data } = await apolloClient.mutate({
        mutation: UPDATE_BOOK_AVAILABILITY_MUTATION,
        variables: { bookId, availableCopies },
        refetchQueries: [{ query: BOOKS_QUERY }],
      });
      return data.update_books_by_pk;
    } catch (error) {
      console.error('Error updating book availability:', error);
      throw new Error('Failed to update book availability');
    }
  }

  /**
   * Cancels a reservation
   * @param reservationId - The reservation's unique identifier
   * @returns Promise with the cancelled reservation data
   */
  async cancelReservation(reservationId: string) {
    try {
      const { data } = await apolloClient.mutate({
        mutation: CANCEL_RESERVATION_MUTATION,
        variables: { reservationId },
        refetchQueries: [{ query: BOOKS_QUERY }],
      });
      return data.update_reservations_by_pk;
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      throw new Error('Failed to cancel reservation');
    }
  }

  /**
   * Refreshes the Apollo Client cache
   * Useful for clearing stale data
   */
  async refreshCache() {
    try {
      await apolloClient.resetStore();
    } catch (error) {
      console.error('Error refreshing cache:', error);
      throw new Error('Failed to refresh cache');
    }
  }

  /**
   * Test method to verify reservation table structure and permissions
   * @param userId - The user's unique identifier
   * @param bookId - The book's unique identifier
   * @param expiresAt - When the reservation expires
   * @returns Promise with test result
   */
  async testReservation(userId: string, bookId: string, expiresAt: string) {
    try {
      console.log('Testing reservation creation with minimal fields...');
      
      const { data, errors } = await apolloClient.mutate({
        mutation: TEST_RESERVATION_MUTATION,
        variables: { userId, bookId, expiresAt },
      });
      
      console.log('Test mutation response:', { data, errors });
      
      if (errors && errors.length > 0) {
        return { success: false, errors: errors.map(e => e.message) };
      }
      
      if (data?.insert_reservations_one?.id) {
        return { success: true, id: data.insert_reservations_one.id };
      }
      
      return { success: false, message: 'No ID returned from test mutation' };
    } catch (error) {
      console.error('Test reservation error:', error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * Check if the reservations table exists and get its structure
   * @returns Promise with table check result
   */
  async checkReservationsTable() {
    try {
      console.log('Checking reservations table structure...');
      
      const { data, errors } = await apolloClient.query({
        query: CHECK_RESERVATIONS_TABLE_QUERY,
        fetchPolicy: 'no-cache', // Don't use cache for this check
      });
      
      console.log('Table check response:', { data, errors });
      
      if (errors && errors.length > 0) {
        return { success: false, errors: errors.map(e => e.message) };
      }
      
      if (data?.reservations) {
        return { 
          success: true, 
          tableExists: true,
          sampleData: data.reservations[0] || null,
          totalCount: data.reservations.length
        };
      }
      
      return { success: false, tableExists: false };
    } catch (error) {
      console.error('Table check error:', error);
      return { success: false, error: String(error) };
    }
  }
}

// Export singleton instance
export const graphQLService = new GraphQLService();

