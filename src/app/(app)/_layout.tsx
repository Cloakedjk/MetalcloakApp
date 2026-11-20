import { Stack } from 'expo-router';
import { AccountDataProvider } from '../../data/AccountData';
import { colors } from '../../theme';

export default function AppLayout() {
  return (
    <AccountDataProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="order/[number]" />
        <Stack.Screen name="reviews" />
      </Stack>
    </AccountDataProvider>
  );
}
