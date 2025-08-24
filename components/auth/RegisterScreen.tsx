import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface RegisterScreenProps {
  onSwitchToLogin: () => void;
}

/**
 * Registration Screen Component
 * Handles new user account creation
 */
export function RegisterScreen({ onSwitchToLogin }: RegisterScreenProps) {
  const { register, isLoading, error, clearError } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userType, setUserType] = useState<'student' | 'normal'>('student');
  
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  // Clear errors when switching between auth modes
  useEffect(() => {
    clearError();
  }, [clearError]);

  // Clear field errors when user types
  useEffect(() => {
    if (name) setNameError('');
    if (email) setEmailError('');
    if (password) passwordError && setPasswordError('');
    if (confirmPassword) confirmPasswordError && setConfirmPasswordError('');
  }, [name, email, password, confirmPassword]);

  /**
   * Validates form inputs
   * @returns Boolean indicating validity
   */
  const validateForm = (): boolean => {
    let isValid = true;

    // Validate name
    if (!name.trim()) {
      setNameError('Name is required');
      isValid = false;
    } else if (name.trim().length < 2) {
      setNameError('Name must be at least 2 characters');
      isValid = false;
    }

    // Validate email
    if (!email.trim()) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!isValidEmail(email)) {
      setEmailError('Please enter a valid email');
      isValid = false;
    }

    // Validate password
    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    }

    // Validate confirm password
    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password');
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      isValid = false;
    }

    return isValid;
  };

  /**
   * Validates email format
   * @param email - Email to validate
   * @returns Boolean indicating validity
   */
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  /**
   * Handles registration form submission
   */
  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      const success = await register(email.trim(), password, name.trim(), userType);
      
      if (!success) {
        // Error is already set in context
        return;
      }
      
      // Success - user will be automatically logged in and redirected
      Alert.alert('Success', 'Account created successfully! Welcome to the library.');
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };

  /**
   * Handles switching to login mode
   */
  const handleSwitchToLogin = () => {
    clearError();
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setNameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');
    onSwitchToLogin();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="person-add-outline" size={64} color="#3b82f6" />
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join our library community</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Name Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={20} color="#6b7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>
            {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
          </View>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color="#6b7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>
            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#6b7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Create a password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={true}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>
            {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
          </View>

          {/* Confirm Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color="#6b7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={true}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>
            {confirmPasswordError ? <Text style={styles.errorText}>{confirmPasswordError}</Text> : null}
          </View>

          {/* User Type Selection */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Account Type</Text>
            <View style={styles.userTypeContainer}>
              <TouchableOpacity
                style={[
                  styles.userTypeButton,
                  userType === 'student' && styles.userTypeButtonActive
                ]}
                onPress={() => setUserType('student')}
                disabled={isLoading}
              >
                <Ionicons 
                  name="school-outline" 
                  size={20} 
                  color={userType === 'student' ? '#ffffff' : '#6b7280'} 
                />
                <Text style={[
                  styles.userTypeText,
                  userType === 'student' && styles.userTypeTextActive
                ]}>
                  Student
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.userTypeButton,
                  userType === 'normal' && styles.userTypeButtonActive
                ]}
                onPress={() => setUserType('normal')}
                disabled={isLoading}
              >
                <Ionicons 
                  name="person-outline" 
                  size={20} 
                  color={userType === 'normal' ? '#ffffff' : '#6b7280'} 
                />
                <Text style={[
                  styles.userTypeText,
                  userType === 'normal' && styles.userTypeTextActive
                ]}>
                  Regular User
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.userTypeInfo}>
              {userType === 'student' 
                ? 'Students can reserve up to 5 books for 14 days'
                : 'Regular users can reserve up to 3 books for 7 days'
              }
            </Text>
          </View>

          {/* Error Display */}
          {error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={20} color="#ef4444" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Register Button */}
          <TouchableOpacity
            style={[styles.registerButton, isLoading && styles.registerButtonDisabled]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.registerButtonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          {/* Switch to Login */}
          <View style={styles.switchContainer}>
            <Text style={styles.switchText}>Already have an account? </Text>
            <TouchableOpacity onPress={handleSwitchToLogin} disabled={isLoading}>
              <Text style={styles.switchLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  userTypeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  userTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    gap: 8,
  },
  userTypeButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  userTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  userTypeTextActive: {
    color: '#ffffff',
  },
  userTypeInfo: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 8,
    fontStyle: 'italic',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginTop: 6,
    marginLeft: 4,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  registerButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  registerButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  registerButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchText: {
    fontSize: 16,
    color: '#6b7280',
  },
  switchLink: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '600',
  },
});
