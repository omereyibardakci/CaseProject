// GraphQL response types following clean code principles
export interface Book {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  available: boolean;
  total_copies: number;
  available_copies: number;
}

export interface Reservation {
  id: string;
  user_id: string;
  book_id: string;
  expires_at: string;
  status: 'active' | 'completed' | 'cancelled';
  book?: Book;
}

export interface User {
  id: string;
  email: string;
  name: string;
  user_type: 'student' | 'normal';
}

export interface ReservationPolicy {
  id: string;
  user_type: 'student' | 'normal';
  max_reservations: number;
  reservation_duration_days: number;
  is_active: boolean;
}

// GraphQL query response types
export interface BooksQueryResponse {
  books: Book[];
}

export interface ReservationsQueryResponse {
  reservations: Reservation[];
}

export interface CreateReservationResponse {
  insert_reservations_one: Reservation;
}

export interface UpdateBookAvailabilityResponse {
  update_books_by_pk: Book;
}

// GraphQL mutation variables types
export interface CreateReservationVariables {
  userId: string;
  bookId: string;
  expiresAt: string;
}

export interface UpdateBookAvailabilityVariables {
  bookId: string;
  availableCopies: number;
}

