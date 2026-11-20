import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';
import { useFontsLoaded } from '../../../components/AppText';
import { colors } from '../../../theme';

function tabColor(color: unknown): string {
  return typeof color === 'string' ? color : colors.muted;
}

export default function TabLayout() {
  const fonts = useFontsLoaded();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.bgRaised,
          borderTopColor: colors.line,
          borderTopWidth: 1,
          height: 62,
          paddingTop: 4,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          letterSpacing: 0.3,
          fontFamily: fonts ? 'Barlow_600SemiBold' : undefined,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" color={tabColor(color)} size={size} />,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarIcon: ({ color, size }) => <Ionicons name="cube" color={tabColor(color)} size={size} />,
        }}
      />
      <Tabs.Screen
        name="rewards"
        options={{
          title: 'Rewards',
          tabBarIcon: ({ color, size }) => <Ionicons name="ribbon" color={tabColor(color)} size={size} />,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarIcon: ({ color, size }) => <Ionicons name="person" color={tabColor(color)} size={size} />,
        }}
      />
    </Tabs>
  );
}
