import type { Order, OrderAddress, OrderItem, OrderTotals, Shipment } from '../../domain';
import { normalizeStatus, roundMoney, statusLabel } from '../../format';
import { StoreError } from '../errors';
import { asRecord, dateOnly, numberOf, stringOf } from '../record';

export function mapGraphqlOrders(payload: unknown): Order[] {
  const root = asRecord(payload);
  const data = asRecord(root?.data) ?? root;
  const customer = asRecord(data?.customer);
  if (!customer) {
    throw new StoreError(
      'The store did not return customer orders. The customer token needs the GraphQL customer { orders } query (Magento 2.4.4+).',
    );
  }
  const orders = asRecord(customer.orders);
  const items = Array.isArray(orders?.items) ? orders.items : [];
  return sortOrders(items.map((item) => mapGraphqlOrder(item)));
}

export function mapRestOrders(payload: unknown): Order[] {
  const record = asRecord(payload);
  const items = Array.isArray(record?.items) ? record.items : Array.isArray(payload) ? payload : [];
  return sortOrders(items.map((item) => mapRestOrder(item)));
}

export function trackingUrl(carrier: string, trackingNumber: string): string | null {
  const number = trackingNumber.trim();
  if (!number) return null;
  const name = carrier.toLowerCase();
  const encoded = encodeURIComponent(number);
  if (name.includes('ups')) return `https://www.ups.com/track?tracknum=${encoded}`;
  if (name.includes('fedex') || name.includes('federal express')) {
    return `https://www.fedex.com/fedextrack/?trknbr=${encoded}`;
  }
  if (name.includes('usps')) return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${encoded}`;
  if (name.includes('dhl')) return `https://www.dhl.com/us-en/home/tracking.html?tracking-id=${encoded}`;
  return null;
}

function mapGraphqlOrder(raw: unknown): Order {
  const record = asRecord(raw);
  if (!record) throw new StoreError('The store returned an unreadable order.');
  const number = stringOf(record.number) ?? stringOf(record.order_number);
  if (!number) throw new StoreError('An order is missing its number.');
  const currency = currencyFromGraphql(record);
  const items = (Array.isArray(record.items) ? record.items : []).map((item) =>
    mapGraphqlItem(item, currency),
  );
  const status = normalizeStatus(stringOf(record.status) ?? 'unknown');
  return {
    id: stringOf(record.id) ?? number,
    number,
    placedOn: dateOnly(record.order_date ?? record.created_at),
    status,
    statusLabel: statusLabel(status),
    items,
    totals: mapGraphqlTotals(record.total, currency),
    shippingAddress: mapAddress(record.shipping_address),
    paymentMethod: paymentNames(record.payment_methods),
    shipments: mapGraphqlShipments(record.shipments),
  };
}

function mapRestOrder(raw: unknown): Order {
  const record = asRecord(raw);
  if (!record) throw new StoreError('The store returned an unreadable order.');
  const number = stringOf(record.increment_id) ?? stringOf(record.number);
  if (!number) throw new StoreError('An order is missing its increment id.');
  const currency = stringOf(record.order_currency_code) ?? 'USD';
  const rawItems = Array.isArray(record.items) ? record.items : [];
  const items = rawItems
    .filter((item) => {
      const row = asRecord(item);
      return row != null && row.parent_item_id == null;
    })
    .map((item) => mapRestItem(item, currency));
  const status = normalizeStatus(stringOf(record.status) ?? 'unknown');
  const discount = Math.abs(numberOf(record.discount_amount) ?? 0);
  return {
    id: stringOf(record.entity_id) ?? number,
    number,
    placedOn: dateOnly(record.created_at),
    status,
    statusLabel: statusLabel(status),
    items,
    totals: {
      subtotal: numberOf(record.subtotal) ?? 0,
      shipping: numberOf(record.shipping_amount) ?? 0,
      tax: numberOf(record.tax_amount) ?? 0,
      discount,
      grandTotal: numberOf(record.grand_total) ?? 0,
      currency,
    },
    shippingAddress: mapAddress(restShippingAddress(record) ?? record.billing_address),
    paymentMethod: paymentFromRest(record.payment),
    shipments: mapRestShipments(record),
  };
}

function mapGraphqlItem(raw: unknown, fallbackCurrency: string): OrderItem {
  const row = asRecord(raw) ?? {};
  const price = asRecord(row.product_sale_price);
  const currency = stringOf(price?.currency) ?? fallbackCurrency;
  const unit = numberOf(price?.value) ?? 0;
  const quantity = numberOf(row.quantity_ordered) ?? 0;
  return {
    sku: stringOf(row.product_sku) ?? '',
    name: stringOf(row.product_name) ?? 'Item',
    quantity,
    unitPrice: unit,
    rowTotal: roundMoney(unit * quantity),
    currency,
    urlKey: stringOf(row.product_url_key),
    productUrl: null,
  };
}

function mapRestItem(raw: unknown, currency: string): OrderItem {
  const row = asRecord(raw) ?? {};
  const quantity = numberOf(row.qty_ordered) ?? numberOf(row.qty) ?? 0;
  const unit = numberOf(row.price) ?? 0;
  return {
    sku: stringOf(row.sku) ?? '',
    name: stringOf(row.name) ?? 'Item',
    quantity,
    unitPrice: unit,
    rowTotal: numberOf(row.row_total) ?? roundMoney(unit * quantity),
    currency,
    urlKey: stringOf(row.url_key),
    productUrl: null,
  };
}

function mapGraphqlTotals(raw: unknown, currency: string): OrderTotals {
  const total = asRecord(raw);
  const discounts = Array.isArray(total?.discounts) ? total.discounts : [];
  const discount = discounts.reduce((sum, entry) => {
    const amount = asRecord(asRecord(entry)?.amount);
    return sum + (numberOf(amount?.value) ?? 0);
  }, 0);
  const grand = asRecord(total?.grand_total);
  return {
    subtotal: moneyValue(total?.subtotal) ?? 0,
    shipping: moneyValue(total?.total_shipping) ?? 0,
    tax: moneyValue(total?.total_tax) ?? 0,
    discount,
    grandTotal: moneyValue(total?.grand_total) ?? 0,
    currency: stringOf(grand?.currency) ?? currency,
  };
}

function mapAddress(raw: unknown): OrderAddress | null {
  const row = asRecord(raw);
  if (!row) return null;
  const streetRaw = row.street;
  const street = Array.isArray(streetRaw)
    ? streetRaw.filter((line): line is string => typeof line === 'string' && line.trim().length > 0)
    : typeof streetRaw === 'string' && streetRaw.trim()
      ? [streetRaw.trim()]
      : [];
  const name = [stringOf(row.firstname), stringOf(row.lastname)].filter(Boolean).join(' ');
  const city = stringOf(row.city) ?? '';
  if (!name && !city && street.length === 0) return null;
  return {
    name,
    street,
    city,
    region: stringOf(row.region) ?? stringOf(row.region_code) ?? '',
    postcode: stringOf(row.postcode) ?? '',
    country: stringOf(row.country_code) ?? stringOf(row.country_id) ?? '',
    telephone: stringOf(row.telephone),
  };
}

function mapGraphqlShipments(raw: unknown): Shipment[] {
  if (!Array.isArray(raw)) return [];
  const shipments: Shipment[] = [];
  raw.forEach((shipment, shipmentIndex) => {
    const row = asRecord(shipment);
    if (!row) return;
    const tracks = Array.isArray(row.tracking) ? row.tracking : [];
    const shipmentId = stringOf(row.id) ?? `shipment-${shipmentIndex}`;
    if (tracks.length === 0) {
      shipments.push({
        id: shipmentId,
        carrier: 'Carrier',
        trackingNumber: '',
        trackingUrl: null,
        shippedAt: null,
        deliveredAt: null,
      });
      return;
    }
    tracks.forEach((track, trackIndex) => {
      const mapped = mapTrack(track, `${shipmentId}-${trackIndex}`);
      if (mapped) shipments.push(mapped);
    });
  });
  return shipments;
}

function mapRestShipments(record: Record<string, unknown>): Shipment[] {
  const tracks: unknown[] = [];
  if (Array.isArray(record.tracks)) tracks.push(...record.tracks);
  const extension = asRecord(record.extension_attributes);
  collectTracks(extension?.shipments, tracks);
  const assignments = Array.isArray(extension?.shipping_assignments) ? extension.shipping_assignments : [];
  for (const assignment of assignments) {
    const shipping = asRecord(asRecord(assignment)?.shipping);
    if (Array.isArray(shipping?.tracks)) tracks.push(...shipping.tracks);
  }
  return tracks
    .map((track, index) => mapTrack(track, `track-${index}`))
    .filter((item): item is Shipment => item != null);
}

function collectTracks(raw: unknown, into: unknown[]): void {
  if (!Array.isArray(raw)) return;
  for (const shipment of raw) {
    const row = asRecord(shipment);
    if (!row) continue;
    if (Array.isArray(row.tracks)) into.push(...row.tracks);
    else into.push(row);
  }
}

function mapTrack(raw: unknown, id: string): Shipment | null {
  const row = asRecord(raw);
  if (!row) return null;
  const carrier = stringOf(row.title) ?? stringOf(row.carrier) ?? stringOf(row.carrier_code) ?? 'Carrier';
  const trackingNumber = stringOf(row.number) ?? stringOf(row.track_number) ?? stringOf(row.tracking_number) ?? '';
  if (!trackingNumber) return null;
  return {
    id,
    carrier,
    trackingNumber,
    trackingUrl: trackingUrl(carrier, trackingNumber),
    shippedAt: dateOnly(row.created_at) || null,
    deliveredAt: null,
  };
}

function restShippingAddress(record: Record<string, unknown>): unknown {
  const extension = asRecord(record.extension_attributes);
  const assignments = Array.isArray(extension?.shipping_assignments) ? extension.shipping_assignments : [];
  const shipping = asRecord(asRecord(assignments[0])?.shipping);
  return shipping?.address ?? null;
}

function paymentNames(raw: unknown): string | null {
  if (!Array.isArray(raw)) return null;
  const names = raw
    .map((entry) => stringOf(asRecord(entry)?.name))
    .filter((name): name is string => Boolean(name));
  return names.length > 0 ? names.join(', ') : null;
}

function paymentFromRest(raw: unknown): string | null {
  const row = asRecord(raw);
  if (!row) return null;
  const info = row.additional_information;
  if (typeof info === 'string' && info.trim()) return info.trim();
  const infoRecord = asRecord(info);
  const title = stringOf(infoRecord?.method_title);
  if (title) return title;
  if (Array.isArray(info)) {
    const text = info.find((item) => typeof item === 'string' && item.trim() && !item.startsWith('{'));
    if (typeof text === 'string') return text.trim();
  }
  const method = stringOf(row.method);
  return method ? method.replace(/_/g, ' ') : null;
}

function currencyFromGraphql(record: Record<string, unknown>): string {
  const total = asRecord(record.total);
  const grand = asRecord(total?.grand_total);
  return stringOf(grand?.currency) ?? 'USD';
}

function moneyValue(raw: unknown): number | null {
  return numberOf(asRecord(raw)?.value);
}

function sortOrders(orders: Order[]): Order[] {
  return [...orders].sort((a, b) => b.placedOn.localeCompare(a.placedOn) || b.number.localeCompare(a.number));
}
