import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import type { Order } from '../domain';
import { formatDate, money, shipmentSummary } from '../format';
import { colors, radii } from '../theme';
import { AppText } from './AppText';
import { StatusPill } from './ui';

export function OrderCard({ order }: { order: Order }) {
  const extra = order.items.length - 1;
  const transit = shipmentSummary(order);
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push(`/order/${order.number}`)}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.row}>
        <AppText variant="micro" tone="muted" selectable>
          #{order.number}
        </AppText>
        <StatusPill status={order.status} label={order.statusLabel} />
      </View>
      <AppText variant="title" numberOfLines={2}>
        {order.items[0]?.name ?? 'Order'}
      </AppText>
      <View style={styles.row}>
        <AppText variant="micro" tone="muted" style={styles.meta} numberOfLines={2}>
          {formatDate(order.placedOn)}
          {extra > 0 ? ` · +${extra} more` : ''}
          {transit ? ` · ${transit}` : ''}
        </AppText>
        <AppText variant="micro" style={styles.price}>
          {money(order.totals.grandTotal, order.totals.currency)}
        </AppText>
      </View>
      <View style={styles.link}>
        <AppText variant="micro" tone="accent">
          View order
        </AppText>
        <Ionicons name="chevron-forward" size={16} color={colors.accent} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 16,
    gap: 8,
  },
  pressed: { opacity: 0.86 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  meta: { flex: 1 },
  price: { flexShrink: 0 },
  link: { flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 2 },
});
