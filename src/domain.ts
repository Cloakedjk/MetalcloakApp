/**
 * The app talks to the store only through this read-only surface.
 * `login` creates a session. Nothing else writes to the store.
 */
export interface StoreClient {
  readonly source: 'mock' | 'magento';
  login(email: string, password: string): Promise<{ token: string }>;
  getCustomer(token: string): Promise<Customer>;
  getOrders(token: string): Promise<Order[]>;
  getOrder(token: string, orderNumber: string): Promise<Order>;
  getRewards(token: string): Promise<RewardsSnapshot>;
}

export interface Customer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  /** Calendar date, YYYY-MM-DD. */
  createdAt: string;
}

export interface OrderItem {
  sku: string;
  name: string;
  quantity: number;
  unitPrice: number;
  rowTotal: number;
  currency: string;
  /** Magento url_key, without .html. */
  urlKey: string | null;
  /** Absolute product page when the catalog URL is already known. */
  productUrl: string | null;
}

export interface Shipment {
  id: string;
  carrier: string;
  trackingNumber: string;
  trackingUrl: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
}

export interface OrderAddress {
  name: string;
  street: string[];
  city: string;
  region: string;
  postcode: string;
  country: string;
  telephone: string | null;
}

export interface OrderTotals {
  subtotal: number;
  shipping: number;
  tax: number;
  /** Positive amount taken off the order. */
  discount: number;
  grandTotal: number;
  currency: string;
}

export interface Order {
  id: string;
  number: string;
  placedOn: string;
  status: string;
  statusLabel: string;
  items: OrderItem[];
  totals: OrderTotals;
  shippingAddress: OrderAddress | null;
  paymentMethod: string | null;
  shipments: Shipment[];
}

export interface RewardsBalance {
  points: number;
  currencyValue: number | null;
  currency: string;
  conversionNote: string | null;
}

export type RewardAction = 'earn' | 'spend' | 'expire' | 'adjust' | 'unknown';

export interface RewardTransaction {
  id: string;
  date: string;
  /** Signed. Spent and expired points are negative. */
  points: number;
  label: string;
  comment: string | null;
  action: RewardAction;
  orderNumber: string | null;
}

export interface RewardsSnapshot {
  balance: RewardsBalance;
  history: RewardTransaction[];
  /** Which adapter produced the snapshot: sample, amasty-rest, amasty-graphql, or custom. */
  provider: string;
}
