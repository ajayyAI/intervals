import { ErrorBoundary } from '@/components';
import { useStore } from '@/store/useStore';
import { Colors } from '@/theme';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);
  const router = useRouter();
  const segments = useSegments();

  const hasHydrated = useStore((state) => state._hasHydrated);
  const onboardingCompleted = useStore((state) => state.settings.onboardingCompleted);

  // Load fonts - on native, expo-font plugin preloads them but we still need to call useFonts
  const [fontsLoaded, fontError] = useFonts({
    'SFProDisplay-Regular': require('../../assets/fonts/SFProDisplay-Regular.otf'),
    'SFProDisplay-Medium': require('../../assets/fonts/SFProDisplay-Medium.otf'),
    'SFProDisplay-Bold': require('../../assets/fonts/SFProDisplay-Bold.otf'),
  });

  useEffect(() => {
    async function prepare() {
      try {
        // Wait for fonts to load (or error)
        if (!fontsLoaded && !fontError) return;

        // Log any font errors for debugging
        if (fontError) {
          console.warn('Font loading error:', fontError);
        }
      } catch (e) {
        console.warn('Error during app preparation:', e);
      } finally {
        setAppIsReady(true);
      }
    }
    prepare();
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    if (appIsReady && hasHydrated) {
      SplashScreen.hideAsync();

      if (!onboardingCompleted) {
        router.replace('/onboarding');
      } else if (onboardingCompleted && segments[0] === 'onboarding') {
        router.replace('/(tabs)/home');
      }
    }
  }, [appIsReady, hasHydrated, onboardingCompleted, segments]);

  if (!appIsReady || !hasHydrated) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: Colors.bg.primary }}>
      <SafeAreaProvider>
        <ErrorBoundary>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
              animation: 'fade',
              contentStyle: { backgroundColor: Colors.bg.primary },
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
          </Stack>
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
