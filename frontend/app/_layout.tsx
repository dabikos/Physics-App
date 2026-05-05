import React, { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, Image, StyleSheet, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { ThemeProvider, useTheme } from '../src/context/ThemeContext';
import { LanguageProvider } from '../src/context/LanguageContext';
import { SubscriptionProvider } from '../src/context/SubscriptionContext';
import { usePushNotifications } from '../src/hooks/usePushNotifications';
import '../src/config/i18n';

const APP_LOGO = require('../assets/images/splash-logo.png');

function AppLoadingScreen() {
  return (
    <LinearGradient
      colors={['#10172F', '#312E81', '#0EA5E9']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.loadingScreen}
    >
      <View style={styles.glow} />
      <Image source={APP_LOGO} style={styles.loadingLogo} resizeMode="contain" />
      <Text style={styles.loadingTitle}>Физика AI</Text>
      <ActivityIndicator size="large" color="#FFFFFF" style={styles.loadingSpinner} />
    </LinearGradient>
  );
}

function RootLayoutNav() {
  const { user, loading } = useAuth();
  const { colors } = useTheme();
  const segments = useSegments();
  const router = useRouter();
  const [initialRouteDone, setInitialRouteDone] = useState(false);

  const pushEnabled = !!user;
  usePushNotifications(pushEnabled);

  useEffect(() => {
    if (loading) return;

    const routeSegments = segments as string[];
    const inAuthGroup = routeSegments[0] === '(auth)';
    const isWelcomeScreen = routeSegments[1] === 'welcome';

    // Keep splash loader while forcing first visible screen to welcome.
    if (!initialRouteDone) {
      if (!isWelcomeScreen) {
        router.replace('/(auth)/welcome');
        return;
      }

      setInitialRouteDone(true);
      return;
    }

    if (user && inAuthGroup && !isWelcomeScreen) {
      router.replace('/(tabs)');
    }
  }, [initialRouteDone, user, loading, segments, router]);

  if (loading || !initialRouteDone) {
    return <AppLoadingScreen />;
  }

  return (
    <>
      <StatusBar style={colors.statusBarStyle} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="lessons" options={{ headerShown: false }} />
        <Stack.Screen name="tasks" options={{ headerShown: false }} />
        <Stack.Screen name="tests" options={{ headerShown: false }} />
        <Stack.Screen name="formulas" options={{ headerShown: false }} />
        <Stack.Screen name="games" options={{ headerShown: false }} />
        <Stack.Screen name="notifications" options={{ headerShown: false }} />
        <Stack.Screen name="about" options={{ headerShown: false }} />
        <Stack.Screen name="subscription" options={{ headerShown: false }} />
        <Stack.Screen name="teacher/classes" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <SubscriptionProvider>
              <RootLayoutNav />
            </SubscriptionProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(125, 211, 252, 0.22)',
    shadowColor: '#67E8F9',
    shadowOpacity: 0.8,
    shadowRadius: 48,
  },
  loadingLogo: {
    width: 132,
    height: 132,
    borderRadius: 30,
  },
  loadingTitle: {
    marginTop: 22,
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  loadingSpinner: {
    marginTop: 28,
  },
});
