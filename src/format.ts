import type { Order } from './domain';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  processing: 'Processing',
  complete: 'Complete',
  closed: 'Closed',
  canceled: 'Canceled',
  holded: 'On hold',
  payment_review: 'Payment review',
  fraud: 'Under review',
  unknown: 'Unknown',
};

export function normalizeStatus(status: string): string {
  return status.trim().toLowerCase().replace(/\s+/g, '_');
}

export function statusLabel(status: string): string {
  const key = normalizeStatus(status);
  return STATUS_LABELS[key] ?? key.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

export type StatusTone = 'open' | 'done' | 'hold' | 'bad' | 'neutral';

export function statusTone(status: string): StatusTone {
  switch (normalizeStatus(status)) {
    case 'pending':
    case 'processing':
    case 'payment_review':
      return 'open';
    case 'complete':
    case 'closed':
      return 'done';
    case 'holded':
    case 'fraud':
      return 'hold';
    case 'canceled':
      return 'bad';
    default:
      return 'neutral';
  }
}

export function money(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

export function pointsCount(points: number): string {
  return new Intl.NumberFormat('en-US').format(points);
}

export function signedPoints(points: number): string {
  const formatted = new Intl.NumberFormat('en-US').format(Math.abs(points));
  if (points > 0) return `+${formatted}`;
  if (points < 0) return `−${formatted}`;
  return formatted;
}

export function formatDate(isoDate: string): string {
  if (!isoDate) return '';
  const [year, month, day] = isoDate.slice(0, 10).split('-').map(Number);
  if (!year || !month || !day) return isoDate;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(year, month - 1, day));
}

export function formatQty(quantity: number): string {
  if (Number.isInteger(quantity)) return String(quantity);
  return String(Math.round(quantity * 100) / 100);
}

export function shipmentSummary(order: Order): string | null {
  if (order.shipments.length === 0) return null;
  if (order.shipments.every((shipment) => shipment.deliveredAt)) return 'Delivered';
  return 'In transit';
}

export function isOpenOrder(order: Order): boolean {
  return ['pending', 'processing', 'payment_review', 'holded', 'fraud'].includes(order.status);
}

export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
