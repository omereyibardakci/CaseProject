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

export const RESERVATIONS_QUERY = gql`
  query GetUserReservations($userId: UUID!) {
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

export const CREATE_RESERVATION_MUTATION = gql`
  mutation CreateReservation($userId: UUID!, $bookId: UUID!, $expiresAt: timestamptz!) {
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
  mutation UpdateBookAvailability($bookId: UUID!, $availableCopies: Int!) {
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
}

// Export singleton instance
export const graphQLService = new GraphQLService();

