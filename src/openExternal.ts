import { Alert, Linking } from 'react-native';

export async function openExternal(url: string): Promise<void> {
  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert('Link unavailable', url);
  }
}
