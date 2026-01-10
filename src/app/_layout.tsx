import { ErrorBoundary } from '@/components';
import { Colors } from '@/theme';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);

  // Web-only font loading (native uses config plugin)
  const [fontsLoaded, fontError] = useFonts(
    Platform.OS === 'web'
      ? {
          'SF Pro Display': require('../../assets/fonts/SFProDisplay-Regular.otf'),
          'SFProDisplay-Regular': require('../../assets/fonts/SFProDisplay-Regular.otf'),
          'SFProDisplay-Medium': require('../../assets/fonts/SFProDisplay-Medium.otf'),
          'SFProDisplay-Bold': require('../../assets/fonts/SFProDisplay-Bold.otf'),
        }
      : {}
  );

  const isNative = Platform.OS !== 'web';
  const fontsReady = isNative || fontsLoaded || fontError;

  useEffect(() => {
    async function prepare() {
      if (!fontsReady) return;
      setAppIsReady(true);
      await SplashScreen.hideAsync();
    }
    prepare();
  }, [fontsReady]);

  if (!appIsReady) {
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
          </Stack>
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
