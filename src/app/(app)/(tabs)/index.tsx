import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { purchasedProducts } from '../../../api/purchases';
import { AppText } from '../../../components/AppText';
import { OrderCard } from '../../../components/OrderCard';
import { PointsHero } from '../../../components/PointsHero';
import { Button, Card, ErrorBlock, LoadingBlock, Logo, SampleBanner, Screen } from '../../../components/ui';
import { useAccountData } from '../../../data/AccountData';

export default function HomeScreen() {
  const { customer, orders, rewards, loading, refreshing, error, refresh } = useAccountData();
  const products = purchasedProducts(orders);

  return (
    <Screen refresh={{ refreshing, onRefresh: () => void refresh() }}>
      <Logo />
      <SampleBanner />
      {loading && !customer ? <LoadingBlock label="Loading your account" /> : null}
      {error && !customer ? <ErrorBlock message={error} onRetry={() => void refresh()} /> : null}
      {customer && rewards ? (
        <View style={styles.stack}>
          <View style={styles.intro}>
            <AppText variant="label" tone="accent">
              Welcome back
            </AppText>
            <AppText variant="display">{customer.firstName}</AppText>
            <AppText variant="body" tone="muted">
              Orders, shipments, and rewards.
            </AppText>
          </View>
          {error ? (
            <AppText variant="micro" tone="bad">
              {error}
            </AppText>
          ) : null}
          <PointsHero rewards={rewards} onPress={() => router.push('/rewards')} />
          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <AppText variant="title">Recent orders</AppText>
              <Pressable accessibilityRole="button" onPress={() => router.push('/orders')} hitSlop={8}>
                <AppText variant="micro" tone="accent">
                  See all
                </AppText>
              </Pressable>
            </View>
            {orders.slice(0, 2).map((order) => (
              <OrderCard key={order.number} order={order} />
            ))}
            {orders.length === 0 ? (
              <AppText variant="body" tone="muted">
                No orders on this account yet.
              </AppText>
            ) : null}
          </View>
          <Card>
            <AppText variant="label" tone="muted">
              Reviews
            </AppText>
            <AppText variant="title">Review your purchases</AppText>
            <AppText variant="body" tone="muted">
              {products.length === 0
                ? 'Products you buy will show up here.'
                : `${products.length} products from your orders. Reviews are written on metalcloak.com.`}
            </AppText>
            <Button
              label="Review your purchases"
              variant="secondary"
              icon="open-outline"
              onPress={() => router.push('/reviews')}
            />
          </Card>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  stack: { gap: 18 },
  intro: { gap: 4 },
  section: { gap: 10 },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
