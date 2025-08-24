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
      reserved_at
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
      order_by: { reserved_at: desc }
    ) {
      id
      book_id
      reserved_at
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
  mutation CreateReservation($userId: uuid!, $bookId: uuid!, $expiresAt: timestamptz!) {
    insert_reservations_one(object: {
      user_id: $userId,
      book_id: $bookId,
      expires_at: $expiresAt
    }) {
      id
      user_id
      book_id
      reserved_at
      expires_at
      status
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
      updated_at
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
      const { data } = await apolloClient.mutate({
        mutation: CREATE_RESERVATION_MUTATION,
        variables: { userId, bookId, expiresAt },
        refetchQueries: [
          { query: RESERVATIONS_QUERY, variables: { userId } },
          { query: BOOKS_QUERY },
        ],
      });
      return data.insert_reservations_one;
    } catch (error) {
      console.error('Error creating reservation:', error);
      throw new Error('Failed to create reservation');
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
}

// Export singleton instance
export const graphQLService = new GraphQLService();

