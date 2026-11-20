import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { productReviewUrl } from '../../../api/reviews';
import { AppText } from '../../../components/AppText';
import { BackButton, Button, Card, ErrorBlock, LoadingBlock, SampleBanner, Screen, StatusPill } from '../../../components/ui';
import { getConfig } from '../../../config';
import { useAccountData } from '../../../data/AccountData';
import { formatDate, formatQty, money, shipmentSummary } from '../../../format';
import { openExternal } from '../../../openExternal';
import { colors } from '../../../theme';

export default function OrderDetailScreen() {
  const params = useLocalSearchParams<{ number: string }>();
  const number = Array.isArray(params.number) ? params.number[0] : params.number;
  const { orders, loading, error, refresh, customer } = useAccountData();
  const order = orders.find((item) => item.number === number);
  const origin = getConfig().storeWebOrigin;

  return (
    <Screen safeBottom>
      <BackButton label="Orders" />
      <SampleBanner />
      {loading && !customer ? <LoadingBlock label="Loading order" /> : null}
      {error && !customer ? <ErrorBlock message={error} onRetry={() => void refresh()} /> : null}
      {!loading && customer && !order ? (
        <Card>
          <AppText variant="title">Order not found</AppText>
          <AppText variant="body" tone="muted">
            {number} is not on this account.
          </AppText>
        </Card>
      ) : null}
      {order ? (
        <View style={styles.stack}>
          <View style={styles.titleRow}>
            <View style={{ flex: 1, gap: 4 }}>
              <AppText variant="label" tone="accent">
                Order
              </AppText>
              <AppText variant="display" selectable>
                {order.number}
              </AppText>
              <AppText variant="micro" tone="muted">
                Placed {formatDate(order.placedOn)}
                {shipmentSummary(order) ? ` · ${shipmentSummary(order)}` : ''}
              </AppText>
            </View>
            <StatusPill status={order.status} label={order.statusLabel} />
          </View>

          <AppText variant="title">Items</AppText>
          {order.items.map((item) => (
            <Card key={item.sku}>
              <AppText variant="body">{item.name}</AppText>
              <AppText variant="micro" tone="muted">
                SKU {item.sku} · Qty {formatQty(item.quantity)}
              </AppText>
              <AppText variant="title">{money(item.rowTotal, item.currency)}</AppText>
              <Button
                label="Leave a review"
                variant="secondary"
                icon="open-outline"
                onPress={() => void openExternal(productReviewUrl(item, origin))}
              />
              <AppText variant="micro" tone="dim">
                Opens this product’s review section on metalcloak.com. The app does not post reviews.
              </AppText>
            </Card>
          ))}

          <AppText variant="title">Shipment</AppText>
          {order.shipments.length === 0 ? (
            <Card>
              <AppText variant="body" tone="muted">
                No tracking yet. It will show here once the store ships this order.
              </AppText>
            </Card>
          ) : (
            order.shipments.map((shipment) => (
              <Card key={shipment.id}>
                <AppText variant="body">{shipment.carrier}</AppText>
                <AppText variant="micro" tone="muted" selectable>
                  {shipment.trackingNumber}
                </AppText>
                {shipment.shippedAt ? (
                  <AppText variant="micro" tone="muted">
                    Shipped {formatDate(shipment.shippedAt)}
                  </AppText>
                ) : null}
                {shipment.deliveredAt ? (
                  <AppText variant="micro" tone="good">
                    Delivered {formatDate(shipment.deliveredAt)}
                  </AppText>
                ) : (
                  <AppText variant="micro" tone="warn">
                    In transit
                  </AppText>
                )}
                {shipment.trackingUrl ? (
                  <Button
                    label="Track shipment"
                    variant="secondary"
                    icon="navigate-outline"
                    onPress={() => void openExternal(shipment.trackingUrl!)}
                  />
                ) : null}
              </Card>
            ))
          )}

          {order.shippingAddress ? (
            <Card>
              <AppText variant="label" tone="muted">
                Ships to
              </AppText>
              <AppText variant="body">{order.shippingAddress.name}</AppText>
              {order.shippingAddress.street.map((line) => (
                <AppText key={line} variant="micro" tone="muted">
                  {line}
                </AppText>
              ))}
              <AppText variant="micro" tone="muted">
                {order.shippingAddress.city}, {order.shippingAddress.region} {order.shippingAddress.postcode}
              </AppText>
              {order.paymentMethod ? (
                <AppText variant="micro" tone="dim">
                  Paid with {order.paymentMethod}
                </AppText>
              ) : null}
            </Card>
          ) : null}

          <Card>
            <Total label="Subtotal" value={money(order.totals.subtotal, order.totals.currency)} />
            {order.totals.discount > 0 ? (
              <Total label="Rewards discount" value={`−${money(order.totals.discount, order.totals.currency)}`} />
            ) : null}
            <Total label="Shipping" value={money(order.totals.shipping, order.totals.currency)} />
            <Total label="Tax" value={money(order.totals.tax, order.totals.currency)} />
            <View style={styles.grand}>
              <AppText variant="title">Total</AppText>
              <AppText variant="title">{money(order.totals.grandTotal, order.totals.currency)}</AppText>
            </View>
          </Card>
        </View>
      ) : null}
    </Screen>
  );
}

function Total({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.total}>
      <AppText variant="micro" tone="muted">
        {label}
      </AppText>
      <AppText variant="micro">{value}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { gap: 12 },
  titleRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  total: { flexDirection: 'row', justifyContent: 'space-between' },
  grand: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: 10,
    marginTop: 4,
  },
});
