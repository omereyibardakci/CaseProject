import { User } from '@/types/graphql';

// Abstract base class following Open/Closed Principle
export abstract class ReservationPolicyBase {
  abstract canReserve(user: User, currentReservations: number): boolean;
  abstract getMaxReservations(): number;
  abstract getReservationDurationDays(): number;
}

// Concrete implementation for Student users
export class StudentReservationPolicy extends ReservationPolicyBase {
  canReserve(user: User, currentReservations: number): boolean {
    return user.user_type === 'student' && currentReservations < this.getMaxReservations();
  }

  getMaxReservations(): number {
    return 5; // Students can reserve up to 5 books
  }

  getReservationDurationDays(): number {
    return 14; // 2 weeks reservation period
  }
}

// Concrete implementation for Normal users
export class NormalUserReservationPolicy extends ReservationPolicyBase {
  canReserve(user: User, currentReservations: number): boolean {
    return user.user_type === 'normal' && currentReservations < this.getMaxReservations();
  }

  getMaxReservations(): number {
    return 3; // Normal users can reserve up to 3 books
  }

  getReservationDurationDays(): number {
    return 7; // 1 week reservation period
  }
}

// Policy factory following Factory Pattern
export class ReservationPolicyFactory {
  private static policies: Map<string, ReservationPolicyBase> = new Map();

  static {
    // Initialize default policies
    ReservationPolicyFactory.policies.set('student', new StudentReservationPolicy());
    ReservationPolicyFactory.policies.set('normal', new NormalUserReservationPolicy());
  }

  /**
   * Get the appropriate policy for a user type
   * @param userType - The type of user ('student' or 'normal')
   * @returns The reservation policy for that user type
   */
  static getPolicy(userType: string): ReservationPolicyBase {
    const policy = this.policies.get(userType);
    if (!policy) {
      throw new Error(`No policy found for user type: ${userType}`);
    }
    return policy;
  }

  /**
   * Register a new policy type (extensibility)
   * @param userType - The user type this policy handles
   * @param policy - The policy implementation
   */
  static registerPolicy(userType: string, policy: ReservationPolicyBase): void {
    this.policies.set(userType, policy);
  }
}

// Main reservation service that uses policies
export class ReservationService {
  /**
   * Check if a user can make a new reservation
   * @param user - The user attempting to make a reservation
   * @param currentReservations - Current number of active reservations
   * @returns True if the user can reserve, false otherwise
   */
  canUserReserve(user: User, currentReservations: number): boolean {
    const policy = ReservationPolicyFactory.getPolicy(user.user_type);
    return policy.canReserve(user, currentReservations);
  }

  /**
   * Get the maximum number of reservations allowed for a user
   * @param userType - The type of user
   * @returns Maximum number of reservations allowed
   */
  getMaxReservations(userType: string): number {
    const policy = ReservationPolicyFactory.getPolicy(userType);
    return policy.getMaxReservations();
  }

  /**
   * Get the reservation duration in days for a user type
   * @param userType - The type of user
   * @returns Reservation duration in days
   */
  getReservationDuration(userType: string): number {
    const policy = ReservationPolicyFactory.getPolicy(userType);
    return policy.getReservationDurationDays();
  }

  /**
   * Calculate when a reservation will expire
   * @param userType - The type of user
   * @returns ISO string of expiration date
   */
  calculateExpirationDate(userType: string): string {
    const duration = this.getReservationDuration(userType);
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + duration);
    return expirationDate.toISOString();
  }
}

// Export singleton instance
export const reservationService = new ReservationService();

