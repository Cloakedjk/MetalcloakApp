import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '../../../components/AppText';
import { OrderCard } from '../../../components/OrderCard';
import { ErrorBlock, LoadingBlock, PageHeader, SampleBanner, Screen } from '../../../components/ui';
import { useAccountData } from '../../../data/AccountData';
import type { Order } from '../../../domain';
import { isOpenOrder } from '../../../format';
import { colors, radii } from '../../../theme';

type Filter = 'all' | 'open' | 'complete';

export default function OrdersScreen() {
  const { orders, loading, refreshing, error, refresh, customer } = useAccountData();
  const [filter, setFilter] = useState<Filter>('all');
  const visible = orders.filter((order) => matches(order, filter));

  return (
    <Screen refresh={{ refreshing, onRefresh: () => void refresh() }}>
      <PageHeader kicker="Garage file" title="Orders" subtitle="Past and current orders from your account." />
      <SampleBanner />
      {loading && !customer ? <LoadingBlock label="Loading orders" /> : null}
      {error && !customer ? <ErrorBlock message={error} onRetry={() => void refresh()} /> : null}
      {customer ? (
        <View style={styles.stack}>
          <View style={styles.filters}>
            <Chip label={`All ${orders.length}`} active={filter === 'all'} onPress={() => setFilter('all')} />
            <Chip
              label={`Open ${orders.filter(isOpenOrder).length}`}
              active={filter === 'open'}
              onPress={() => setFilter('open')}
            />
            <Chip
              label={`Complete ${orders.filter((order) => order.status === 'complete' || order.status === 'closed').length}`}
              active={filter === 'complete'}
              onPress={() => setFilter('complete')}
            />
          </View>
          {visible.map((order) => (
            <OrderCard key={order.number} order={order} />
          ))}
          {visible.length === 0 ? (
            <AppText variant="body" tone="muted">
              No orders in this view.
            </AppText>
          ) : null}
        </View>
      ) : null}
    </Screen>
  );
}

function matches(order: Order, filter: Filter): boolean {
  if (filter === 'open') return isOpenOrder(order);
  if (filter === 'complete') return order.status === 'complete' || order.status === 'closed';
  return true;
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={[styles.chip, active && styles.chipOn]}>
      <AppText variant="micro" tone={active ? 'onAccent' : 'text'}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  stack: { gap: 12 },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipOn: { backgroundColor: colors.accent, borderColor: colors.accent },
});
