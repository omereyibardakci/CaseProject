import { AuthNavigator } from '@/components/auth/AuthNavigator';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { apolloClient } from '@/lib/apollo-client';
import { ApolloProvider } from '@apollo/client';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

// Main app component with authentication check
function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading screen while checking authentication
  if (isLoading) {
    return null; // You can add a proper loading screen here
  }

  // Show auth screens if not authenticated, otherwise show main app
  if (!isAuthenticated) {
    return <AuthNavigator />;
  }

  // Show main app with tabs
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

// Root layout with providers
export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ApolloProvider client={apolloClient}>
      <AuthProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <AppContent />
          <StatusBar style="auto" />
        </ThemeProvider>
      </AuthProvider>
    </ApolloProvider>
  );
}
