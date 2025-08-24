import { authService, User } from '@/services/auth-service';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

// Authentication context interface
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string, userType: 'student' | 'normal') => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
  error: string | null;
}

// Create context with default values
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Props for AuthProvider
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Authentication Provider Component
 * Manages global authentication state and provides authentication methods
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check authentication status on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  /**
   * Checks if user is authenticated and restores session
   */
  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      
      // Check if user is authenticated
      const isAuth = await authService.isAuthenticated();
      
      if (isAuth) {
        // Try to restore user session
        const sessionRestored = await authService.restoreSession();
        
        if (sessionRestored) {
          const currentUser = authService.getCurrentUser();
          setUser(currentUser);
        }
      }
    } catch (error) {
      console.error('Auth status check error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles user login
   * @param email - User's email
   * @param password - User's password
   * @returns Promise with boolean result
   */
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setError(null);
      setIsLoading(true);

      const response = await authService.loginUser(email, password);

      if (response.success && response.user) {
        setUser(response.user);
        return true;
      } else {
        setError(response.error || 'Login failed');
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An unexpected error occurred');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles user registration
   * @param email - User's email
   * @param password - User's password
   * @param name - User's full name
   * @param userType - User type (student or normal)
   * @returns Promise with boolean result
   */
  const register = async (
    email: string,
    password: string,
    name: string,
    userType: 'student' | 'normal'
  ): Promise<boolean> => {
    try {
      setError(null);
      setIsLoading(true);

      const response = await authService.registerUser(email, password, name, userType);

      if (response.success && response.user) {
        setUser(response.user);
        return true;
      } else {
        setError(response.error || 'Registration failed');
        return false;
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('An unexpected error occurred');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles user logout
   */
  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      await authService.logoutUser();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, clear local state
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Clears any authentication errors
   */
  const clearError = () => {
    setError(null);
  };

  // Context value
  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    clearError,
    error,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook to use authentication context
 * @returns Authentication context
 * @throws Error if used outside AuthProvider
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}
