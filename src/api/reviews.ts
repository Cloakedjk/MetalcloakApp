import type { OrderItem } from '../domain';

/** Magento 2 renders the review form in the element with id `reviews`. */
const REVIEW_ANCHOR = '#reviews';

export function productReviewUrl(
  item: Pick<OrderItem, 'productUrl' | 'urlKey' | 'sku'>,
  storeWebOrigin: string,
): string {
  if (item.productUrl) return withReviewAnchor(item.productUrl);
  const origin = storeWebOrigin.replace(/\/+$/, '');
  if (item.urlKey) {
    const key = item.urlKey.replace(/^\/+/, '').replace(/\.html$/i, '');
    return `${origin}/${key}.html${REVIEW_ANCHOR}`;
  }
  return `${origin}/catalogsearch/result/?q=${encodeURIComponent(item.sku)}${REVIEW_ANCHOR}`;
}

function withReviewAnchor(url: string): string {
  const hash = url.indexOf('#');
  const base = hash === -1 ? url : url.slice(0, hash);
  return `${base}${REVIEW_ANCHOR}`;
}
