import {
  Barlow_400Regular,
  Barlow_500Medium,
  Barlow_600SemiBold,
} from '@expo-google-fonts/barlow';
import { Oswald_500Medium, Oswald_600SemiBold } from '@expo-google-fonts/oswald';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useFonts } from 'expo-font';
import { useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useSession } from '../auth/AuthContext';
import { FontsProvider } from '../components/AppText';
import { colors } from '../theme';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Oswald_500Medium,
    Oswald_600SemiBold,
    Barlow_400Regular,
    Barlow_500Medium,
    Barlow_600SemiBold,
  });

  useEffect(() => {
    SystemUI.setBackgroundColorAsync('#000000').catch(() => undefined);
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.body.style.backgroundColor = '#000000';
    }
  }, []);

  return (
    <SafeAreaProvider>
      <FontsProvider loaded={loaded && !error}>
        <AuthProvider>
          <SplashGate fontsReady={loaded || !!error} />
          <View style={styles.root}>
            <View style={styles.column}>
              <StatusBar style="light" />
              <RootNavigator />
            </View>
          </View>
        </AuthProvider>
      </FontsProvider>
    </SafeAreaProvider>
  );
}

function SplashGate({ fontsReady }: { fontsReady: boolean }) {
  const { isLoading } = useSession();
  useEffect(() => {
    if (!isLoading && fontsReady) {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [isLoading, fontsReady]);
  return null;
}

function RootNavigator() {
  const { session, isLoading } = useSession();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Protected guard={!isLoading && !!session}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
      <Stack.Protected guard={!isLoading && !session}>
        <Stack.Screen name="login" />
      </Stack.Protected>
    </Stack>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000000', alignItems: 'center' },
  column: { flex: 1, width: '100%', maxWidth: 480, backgroundColor: colors.bg },
});
