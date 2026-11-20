import type { RewardAction, RewardTransaction } from '../../domain';
import { StoreError } from '../errors';
import { asRecord, dateOnly, describePayload, numberOf, stringOf } from '../record';

const POINT_KEYS = ['balance', 'points', 'points_left', 'pointsLeft', 'amount', 'customer_balance', 'reward_points'];
const CURRENCY_KEYS = [
  'currency_amount',
  'currencyAmount',
  'money_amount',
  'base_currency_amount',
  'currency_value',
  'money',
];

export interface MappedBalance {
  points: number;
  currencyValue: number | null;
  currency: string;
}

/**
 * Accepts the shapes Amasty's customer balance API is known to return,
 * plus a few nearby variants so a store-specific payload can be mapped
 * without rewriting the screens.
 */
export function mapAmastyBalance(payload: unknown): MappedBalance {
  const points = findPoints(payload);
  if (points == null) {
    throw new StoreError(
      `Unrecognized rewards balance (${describePayload(payload)}). Extend mapAmastyBalance for this response.`,
    );
  }
  return {
    points,
    currencyValue: findCurrencyValue(payload),
    currency: findCurrencyCode(payload) ?? 'USD',
  };
}

export function mapAmastyHistory(payload: unknown): RewardTransaction[] {
  return extractList(payload)
    .map((item, index) => mapHistoryItem(item, index))
    .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
}

export function mapAction(code: string, points: number): RewardAction {
  const normalized = code.toLowerCase();
  if (normalized.includes('expir')) return 'expire';
  if (normalized.includes('admin') || normalized.includes('adjust') || normalized.includes('import')) {
    return 'adjust';
  }
  if (
    normalized.includes('spend') ||
    normalized.includes('redeem') ||
    normalized.includes('deduct') ||
    normalized.includes('subtract')
  ) {
    return 'spend';
  }
  if (points < 0) return 'spend';
  if (points > 0) return 'earn';
  if (normalized) return 'adjust';
  return 'unknown';
}

function findPoints(payload: unknown): number | null {
  const direct = numberOf(payload);
  if (direct != null && (typeof payload === 'number' || typeof payload === 'string')) return direct;
  const row = asRecord(payload);
  if (!row) return null;
  for (const key of POINT_KEYS) {
    if (!(key in row)) continue;
    const found = findPoints(row[key]);
    if (found != null) return found;
  }
  return null;
}

function findCurrencyValue(payload: unknown): number | null {
  const row = asRecord(payload);
  if (!row) return null;
  for (const key of CURRENCY_KEYS) {
    if (!(key in row)) continue;
    const value = row[key];
    const direct = numberOf(value);
    if (direct != null && typeof value !== 'object') return direct;
    const nested = numberOf(asRecord(value)?.value);
    if (nested != null) return nested;
  }
  for (const key of ['customer_balance', 'balance']) {
    const nested = asRecord(row[key]);
    if (!nested) continue;
    const found = findCurrencyValue(nested);
    if (found != null) return found;
  }
  return null;
}

function findCurrencyCode(payload: unknown): string | null {
  const row = asRecord(payload);
  if (!row) return null;
  const direct = stringOf(row.currency) ?? stringOf(row.currency_code);
  if (direct && direct.length === 3) return direct.toUpperCase();
  for (const key of CURRENCY_KEYS) {
    const nested = stringOf(asRecord(row[key])?.currency);
    if (nested) return nested.toUpperCase();
  }
  for (const key of ['customer_balance', 'balance']) {
    const nested = asRecord(row[key]);
    if (!nested) continue;
    const found = findCurrencyCode(nested);
    if (found) return found;
  }
  return null;
}

function extractList(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  const row = asRecord(payload);
  if (!row) return [];
  for (const key of ['items', 'history', 'transactions']) {
    if (Array.isArray(row[key])) return row[key] as unknown[];
  }
  return [];
}

function mapHistoryItem(raw: unknown, index: number): RewardTransaction {
  const row = asRecord(raw) ?? {};
  const points = numberOf(row.amount ?? row.points ?? row.points_delta ?? row.balance_change) ?? 0;
  const actionCode = stringOf(row.action) ?? stringOf(row.code) ?? '';
  const comment = stringOf(row.comment) ?? stringOf(row.message);
  const orderNumber =
    stringOf(row.order_number) ?? stringOf(row.order_increment_id) ?? orderNumberFrom(comment);
  const action = mapAction(actionCode, points);
  const label = comment || humanize(actionCode) || defaultLabel(action, orderNumber);
  return {
    id: stringOf(row.id) ?? `reward-${index}`,
    date: dateOnly(row.action_date ?? row.date ?? row.created_at ?? row.createdAt),
    points,
    label,
    comment: comment && comment !== label ? comment : null,
    action,
    orderNumber,
  };
}

function orderNumberFrom(comment: string | null): string | null {
  if (!comment) return null;
  const match = comment.match(/#?\b(\d{6,})\b/);
  return match?.[1] ?? null;
}

function humanize(code: string): string | null {
  if (!code) return null;
  const words = code.replace(/[_-]+/g, ' ').trim();
  if (!words) return null;
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function defaultLabel(action: RewardAction, orderNumber: string | null): string {
  const order = orderNumber ? ` on order #${orderNumber}` : '';
  switch (action) {
    case 'earn':
      return `Points earned${order}`;
    case 'spend':
      return `Points spent${order}`;
    case 'expire':
      return 'Points expired';
    case 'adjust':
      return 'Balance adjustment';
    default:
      return 'Rewards activity';
  }
}
