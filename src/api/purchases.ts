import type { Order, OrderItem } from '../domain';

export interface PurchasedProduct {
  item: OrderItem;
  orderNumbers: string[];
  lastOrdered: string;
}

export function purchasedProducts(orders: Order[]): PurchasedProduct[] {
  const map = new Map<string, PurchasedProduct>();
  for (const order of orders) {
    for (const item of order.items) {
      const key = item.sku || item.name;
      const existing = map.get(key);
      if (!existing) {
        map.set(key, { item, orderNumbers: [order.number], lastOrdered: order.placedOn });
        continue;
      }
      if (!existing.orderNumbers.includes(order.number)) existing.orderNumbers.push(order.number);
      if (order.placedOn > existing.lastOrdered) existing.lastOrdered = order.placedOn;
    }
  }
  return [...map.values()].sort((a, b) => b.lastOrdered.localeCompare(a.lastOrdered));
}
