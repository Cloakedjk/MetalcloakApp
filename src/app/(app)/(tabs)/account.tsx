import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '../../../components/AppText';
import { Button, Card, ErrorBlock, LoadingBlock, SampleBanner, Screen } from '../../../components/ui';
import { getConfig } from '../../../config';
import { useSession } from '../../../auth/AuthContext';
import { useAccountData } from '../../../data/AccountData';
import { formatDate } from '../../../format';
import { colors, radii } from '../../../theme';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function AccountScreen() {
  const { signOut } = useSession();
  const { customer, loading, refreshing, error, refresh } = useAccountData();
  const [confirmingSignOut, setConfirmingSignOut] = useState(false);
  const config = getConfig();
  const version = Constants.expoConfig?.version ?? '1.0.0';
  const initials = customer ? `${customer.firstName.charAt(0)}${customer.lastName.charAt(0)}`.toUpperCase() : '';

  return (
    <Screen refresh={{ refreshing, onRefresh: () => void refresh() }} safeBottom>
      <SampleBanner />
      {loading && !customer ? <LoadingBlock label="Loading account" /> : null}
      {error && !customer ? <ErrorBlock message={error} onRetry={() => void refresh()} /> : null}
      {customer ? (
        <View style={styles.stack}>
          <View style={styles.identity}>
            <View style={styles.avatar}>
              <AppText variant="title" tone="onAccent">
                {initials}
              </AppText>
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <AppText variant="display" style={{ fontSize: 28, lineHeight: 34 }}>
                {customer.firstName} {customer.lastName}
              </AppText>
              <AppText variant="body" tone="muted">
                {customer.email}
              </AppText>
              {customer.createdAt ? (
                <AppText variant="micro" tone="dim">
                  Customer since {formatDate(customer.createdAt)}
                </AppText>
              ) : null}
            </View>
          </View>
          <Card>
            <AppText variant="label" tone="muted">
              Data source
            </AppText>
            <AppText variant="title">{config.dataSource === 'mock' ? 'Sample data' : 'Magento store'}</AppText>
            <AppText variant="micro" tone="muted">
              {config.dataSource === 'mock'
                ? 'A fictional account stands in until a store token is configured.'
                : config.magentoBaseUrl}
            </AppText>
          </Card>
          <View style={styles.links}>
            <Row label="Orders" onPress={() => router.push('/orders')} />
            <Row label="Rewards" onPress={() => router.push('/rewards')} />
            <Row label="Review your purchases" onPress={() => router.push('/reviews')} />
          </View>
          <AppText variant="micro" tone="dim">
            Read-only. Checkout and point redemption stay on metalcloak.com. Version {version}.
          </AppText>
          {confirmingSignOut ? (
            <Card>
              <AppText variant="title">Sign out?</AppText>
              <AppText variant="body" tone="muted">
                You can sign back in with your MetalCloak account.
              </AppText>
              <Button label="Sign out" variant="danger" onPress={() => void signOut()} />
              <Button label="Cancel" variant="secondary" onPress={() => setConfirmingSignOut(false)} />
            </Card>
          ) : (
            <Pressable accessibilityRole="button" onPress={() => setConfirmingSignOut(true)} style={styles.signOut}>
              <AppText variant="micro" tone="bad" style={styles.signOutLabel}>
                Sign out
              </AppText>
            </Pressable>
          )}
        </View>
      ) : null}
    </Screen>
  );
}

function Row({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.row}>
      <AppText variant="body">{label}</AppText>
      <Ionicons name="chevron-forward" size={18} color={colors.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  stack: { gap: 16 },
  identity: { flexDirection: 'row', gap: 14, alignItems: 'center' },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: radii.md,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  links: { gap: 8 },
  row: {
    backgroundColor: colors.card,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  signOut: {
    borderWidth: 1,
    borderColor: colors.bad,
    borderRadius: radii.md,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutLabel: { fontSize: 15 },
});
