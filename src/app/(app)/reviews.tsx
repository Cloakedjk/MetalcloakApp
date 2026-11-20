import { StyleSheet, View } from 'react-native';
import { purchasedProducts } from '../../api/purchases';
import { productReviewUrl } from '../../api/reviews';
import { AppText } from '../../components/AppText';
import { BackButton, Button, Card, ErrorBlock, LoadingBlock, SampleBanner, Screen } from '../../components/ui';
import { getConfig } from '../../config';
import { useAccountData } from '../../data/AccountData';
import { formatDate } from '../../format';
import { openExternal } from '../../openExternal';

export default function ReviewsScreen() {
  const { orders, loading, error, refresh, customer } = useAccountData();
  const products = purchasedProducts(orders);
  const origin = getConfig().storeWebOrigin;

  return (
    <Screen safeBottom>
      <BackButton label="Back" />
      <View style={styles.intro}>
        <AppText variant="label" tone="accent">
          On the website
        </AppText>
        <AppText variant="display">Review your purchases</AppText>
        <AppText variant="body" tone="muted">
          Each button opens that product’s review section on metalcloak.com. This app does not write reviews.
        </AppText>
      </View>
      <SampleBanner />
      {loading && !customer ? <LoadingBlock label="Loading purchases" /> : null}
      {error && !customer ? <ErrorBlock message={error} onRetry={() => void refresh()} /> : null}
      {customer && products.length === 0 ? (
        <AppText variant="body" tone="muted">
          No purchased products on this account yet.
        </AppText>
      ) : null}
      {products.map((product) => (
        <Card key={product.item.sku || product.item.name}>
          <AppText variant="body">{product.item.name}</AppText>
          <AppText variant="micro" tone="muted">
            SKU {product.item.sku} · Last ordered {formatDate(product.lastOrdered)}
          </AppText>
          <AppText variant="micro" tone="dim">
            {product.orderNumbers.map((orderNumber) => `#${orderNumber}`).join(', ')}
          </AppText>
          <Button
            label="Leave a review"
            variant="secondary"
            icon="open-outline"
            onPress={() => void openExternal(productReviewUrl(product.item, origin))}
          />
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { gap: 6 },
});
