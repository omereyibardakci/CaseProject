import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { LoginScreen } from './LoginScreen';
import { RegisterScreen } from './RegisterScreen';

/**
 * Authentication Navigator Component
 * Manages switching between login and registration screens
 */
export function AuthNavigator() {
  const [isLoginMode, setIsLoginMode] = useState(true);

  const switchToRegister = () => setIsLoginMode(false);
  const switchToLogin = () => setIsLoginMode(true);

  return (
    <View style={styles.container}>
      {isLoginMode ? (
        <LoginScreen onSwitchToRegister={switchToRegister} />
      ) : (
        <RegisterScreen onSwitchToLogin={switchToLogin} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
