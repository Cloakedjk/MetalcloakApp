import { router } from 'expo-router';
import { View } from 'react-native';
import { AppText } from '../components/AppText';
import { Button, Screen } from '../components/ui';

export default function NotFoundScreen() {
  return (
    <Screen safeBottom>
      <View style={{ gap: 12 }}>
        <AppText variant="display">Page not in the app</AppText>
        <AppText variant="body" tone="muted">
          That screen isn’t part of the MetalCloak account app.
        </AppText>
        <Button label="Go to sign in" onPress={() => router.replace('/')} />
      </View>
    </Screen>
  );
}
