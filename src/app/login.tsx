import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { sampleAccount } from '../api/mock/sampleData';
import { errorMessage } from '../api/errors';
import { useSession } from '../auth/AuthContext';
import { AppText } from '../components/AppText';
import { Button, Card, Logo, SampleBanner, Screen, TextField } from '../components/ui';
import { getConfig } from '../config';
import { colors } from '../theme';

export default function LoginScreen() {
  const { signIn } = useSession();
  const usingSample = getConfig().dataSource === 'mock';
  const [email, setEmail] = useState(usingSample ? sampleAccount.email : '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit(nextEmail: string, nextPassword: string) {
    setError(null);
    setSubmitting(true);
    try {
      await signIn(nextEmail, nextPassword);
      router.replace('/');
    } catch (caught) {
      setError(errorMessage(caught, 'Sign-in failed.'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen safeBottom>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.stack}>
        <View style={styles.rule} />
        <Logo large />
        <View style={styles.intro}>
          <AppText variant="display">Sign in</AppText>
          <AppText variant="body" tone="muted">
            Orders, shipments, and rewards for your MetalCloak account.
          </AppText>
        </View>
        <SampleBanner />
        <TextField
          label="Email"
          value={email}
          onChangeText={(value) => {
            setEmail(value);
            setError(null);
          }}
          autoComplete="email"
          keyboardType="email-address"
          textContentType="username"
          placeholder="you@email.com"
        />
        <TextField
          label="Password"
          value={password}
          onChangeText={(value) => {
            setPassword(value);
            setError(null);
          }}
          secureTextEntry
          autoComplete="password"
          textContentType="password"
          placeholder="Password"
        />
        {error ? (
          <View style={styles.error}>
            <AppText variant="micro" tone="bad">
              {error}
            </AppText>
          </View>
        ) : null}
        <Button
          label="Sign in"
          loading={submitting}
          onPress={() => void submit(email, password)}
        />
        {usingSample ? (
          <Card>
            <AppText variant="label" tone="muted">
              Sample account
            </AppText>
            <AppText variant="title">Alex Rivera</AppText>
            <AppText variant="micro" tone="muted">
              {sampleAccount.email}
            </AppText>
            <AppText variant="micro" tone="muted">
              Password {sampleAccount.password}
            </AppText>
            <Button
              label="Sign in as Alex"
              variant="secondary"
              loading={submitting}
              onPress={() => {
                setEmail(sampleAccount.email);
                setPassword(sampleAccount.password);
                void submit(sampleAccount.email, sampleAccount.password);
              }}
            />
          </Card>
        ) : (
          <AppText variant="micro" tone="dim">
            Uses your existing MetalCloak store login. Checkout stays on the website.
          </AppText>
        )}
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stack: { gap: 16 },
  rule: { height: 3, width: 48, backgroundColor: colors.accent, borderRadius: 2 },
  intro: { gap: 6 },
  error: {
    backgroundColor: colors.badSoft,
    borderRadius: 10,
    padding: 12,
  },
});
