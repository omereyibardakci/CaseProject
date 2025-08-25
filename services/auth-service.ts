import { apolloClient } from '@/lib/apollo-client';
import { gql } from '@apollo/client';
import AsyncStorage from '@react-native-async-storage/async-storage';

// React Native compatible UUID generator
function generateUUID(): string {
  try {
    // Simple UUID v4 generator that works in React Native
    const hexDigits = '0123456789abcdef';
    let uuid = '';
    
    for (let i = 0; i < 36; i++) {
      if (i === 8 || i === 13 || i === 18 || i === 23) {
        uuid += '-';
      } else if (i === 14) {
        uuid += '4'; // Version 4
      } else if (i === 19) {
        uuid += hexDigits[(Math.random() * 4) | 8]; // Variant bits
      } else {
        uuid += hexDigits[(Math.random() * 16) | 0];
      }
    }
    
    // Validate the generated UUID
    if (uuid.length !== 36) {
      throw new Error(`Invalid UUID length: ${uuid.length}`);
    }
    
    return uuid;
  } catch (error) {
    console.error('Error generating UUID:', error);
    
    // Fallback: generate a simple unique ID using timestamp and random numbers
    const timestamp = Date.now().toString(16);
    const random = Math.random().toString(16).substring(2, 10);
    const fallbackId = `${timestamp}-${random}-4000-8000-${random}${timestamp}`;
    
    console.log('Using fallback ID generation:', fallbackId);
    return fallbackId;
  }
}

// Test function to verify UUID generation
function testUUIDGeneration(): void {
  console.log('Testing UUID generation...');
  for (let i = 0; i < 5; i++) {
    const uuid = generateUUID();
    console.log(`Generated UUID ${i + 1}:`, uuid);
    
    // Basic validation
    if (uuid.length !== 36) {
      console.error('Invalid UUID length:', uuid.length);
    }
    if (!uuid.match(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
      console.error('Invalid UUID format:', uuid);
    }
  }
}

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
      // Test UUID generation on first initialization
      testUUIDGeneration();
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
      console.log('Starting user registration:', { email, name, userType });
      
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
      const userId = generateUUID();
      console.log('Generated UUID for user:', userId);

      // Create user via GraphQL mutation
      console.log('Creating user with GraphQL mutation...');
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

      console.log('GraphQL mutation response:', data);
      const newUser = data.insert_users_one;
      
      if (!newUser) {
        console.error('No user data returned from mutation');
        return { success: false, error: 'Failed to create user' };
      }

      console.log('User created successfully:', newUser);

      // Automatically log in the user after successful registration
      console.log('Auto-login after registration...');
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
