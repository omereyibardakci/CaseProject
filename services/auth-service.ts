import { apolloClient } from '@/lib/apollo-client';
import { gql } from '@apollo/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';

// GraphQL mutations and queries
export const CREATE_USER_MUTATION = gql`
  mutation CreateUser($id: uuid!, $email: String!, $name: String!, $password: String!, $user_type: String!) {
    insert_users_one(object: {id: $id, email: $email, name: $name, password: $password, user_type: $user_type}) {
      id
      email
      name
      user_type
      created_at
    }
  }
`;

export const LOGIN_USER_QUERY = gql`
  query LoginUser($email: String!, $password: String!) {
    users(where: {email: {_eq: $email}, password: {_eq: $password}}) {
      id
      email
      name
      user_type
      created_at
    }
  }
`;

// User interface
export interface User {
  id: string;
  email: string;
  name: string;
  user_type: 'student' | 'normal';
  created_at: string;
}

// Authentication response types
export interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
}

// Session storage keys
const SESSION_KEYS = {
  USER_ID: 'user_id',
  USER_DATA: 'user_data',
  IS_AUTHENTICATED: 'is_authenticated',
} as const;

/**
 * Authentication Service following Single Responsibility Principle
 * Handles user registration, login, logout, and session management
 */
export class AuthService {
  private static instance: AuthService;
  private currentUser: User | null = null;

  private constructor() {}

  /**
   * Singleton pattern for AuthService
   */
  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Registers a new user
   * @param email - User's email address
   * @param password - User's password
   * @param name - User's full name
   * @param userType - User type (student or normal)
   * @returns Promise with authentication response
   */
  async registerUser(
    email: string,
    password: string,
    name: string,
    userType: 'student' | 'normal'
  ): Promise<AuthResponse> {
    try {
      // Validate input parameters
      if (!this.validateEmail(email)) {
        return { success: false, error: 'Invalid email format' };
      }

      if (!this.validatePassword(password)) {
        return { success: false, error: 'Password must be at least 6 characters' };
      }

      if (!this.validateName(name)) {
        return { success: false, error: 'Name must be at least 2 characters' };
      }

      // Generate unique UUID for user
      const userId = uuidv4();

      // Create user via GraphQL mutation
      const { data } = await apolloClient.mutate({
        mutation: CREATE_USER_MUTATION,
        variables: {
          id: userId,
          email: email.toLowerCase().trim(),
          name: name.trim(),
          password: password,
          user_type: userType,
        },
      });

      const newUser = data.insert_users_one;
      
      if (!newUser) {
        return { success: false, error: 'Failed to create user' };
      }

      // Automatically log in the user after successful registration
      return await this.loginUser(email, password);
    } catch (error) {
      console.error('Registration error:', error);
      
      // Handle specific GraphQL errors
      if (error instanceof Error) {
        if (error.message.includes('duplicate key')) {
          return { success: false, error: 'Email already exists' };
        }
        if (error.message.includes('violates')) {
          return { success: false, error: 'Invalid user type' };
        }
      }
      
      return { success: false, error: 'Registration failed. Please try again.' };
    }
  }

  /**
   * Authenticates user with email and password
   * @param email - User's email address
   * @param password - User's password
   * @returns Promise with authentication response
   */
  async loginUser(email: string, password: string): Promise<AuthResponse> {
    try {
      // Validate input parameters
      if (!this.validateEmail(email) || !this.validatePassword(password)) {
        return { success: false, error: 'Invalid email or password' };
      }

      // Query user from database
      const { data } = await apolloClient.query({
        query: LOGIN_USER_QUERY,
        variables: {
          email: email.toLowerCase().trim(),
          password: password,
        },
        fetchPolicy: 'no-cache', // Don't cache login attempts
      });

      const users = data.users;
      
      if (!users || users.length === 0) {
        return { success: false, error: 'Invalid email or password' };
      }

      const user = users[0];
      
      // Store user session
      await this.storeUserSession(user);
      
      // Update current user
      this.currentUser = user;
      
      return { success: true, user };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  }

  /**
   * Logs out the current user
   * @returns Promise indicating success
   */
  async logoutUser(): Promise<boolean> {
    try {
      // Clear session storage
      await AsyncStorage.multiRemove([
        SESSION_KEYS.USER_ID,
        SESSION_KEYS.USER_DATA,
        SESSION_KEYS.IS_AUTHENTICATED,
      ]);

      // Clear current user
      this.currentUser = null;

      // Clear Apollo Client cache
      await apolloClient.resetStore();

      return true;
    } catch (error) {
      console.error('Logout error:', error);
      return false;
    }
  }

  /**
   * Checks if user is currently authenticated
   * @returns Promise with boolean result
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const isAuth = await AsyncStorage.getItem(SESSION_KEYS.IS_AUTHENTICATED);
      return isAuth === 'true';
    } catch (error) {
      console.error('Authentication check error:', error);
      return false;
    }
  }

  /**
   * Gets current authenticated user
   * @returns Current user or null if not authenticated
   */
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  /**
   * Restores user session from storage
   * @returns Promise with boolean result
   */
  async restoreSession(): Promise<boolean> {
    try {
      const userId = await AsyncStorage.getItem(SESSION_KEYS.USER_ID);
      const userData = await AsyncStorage.getItem(SESSION_KEYS.USER_DATA);
      
      if (userId && userData) {
        const user = JSON.parse(userData) as User;
        this.currentUser = user;
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Session restoration error:', error);
      return false;
    }
  }

  /**
   * Stores user session in AsyncStorage
   * @param user - User object to store
   */
  private async storeUserSession(user: User): Promise<void> {
    try {
      await AsyncStorage.multiSet([
        [SESSION_KEYS.USER_ID, user.id],
        [SESSION_KEYS.USER_DATA, JSON.stringify(user)],
        [SESSION_KEYS.IS_AUTHENTICATED, 'true'],
      ]);
    } catch (error) {
      console.error('Session storage error:', error);
      throw new Error('Failed to store user session');
    }
  }

  /**
   * Validates email format
   * @param email - Email to validate
   * @returns Boolean indicating validity
   */
  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validates password strength
   * @param password - Password to validate
   * @returns Boolean indicating validity
   */
  private validatePassword(password: string): boolean {
    return password.length >= 6;
  }

  /**
   * Validates name format
   * @param name - Name to validate
   * @returns Boolean indicating validity
   */
  private validateName(name: string): boolean {
    return name.trim().length >= 2;
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();
