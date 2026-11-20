import type { AppConfig } from '../../config';
import type { RewardsSnapshot } from '../../domain';
import { StoreError } from '../errors';
import type { StoreHttp } from '../http';
import { asRecord, stringOf } from '../record';
import { mapAmastyBalance, mapAmastyHistory } from './mapRewards';

/**
 * Amasty Reward Points is the working hypothesis for metalcloak.com.
 * Public Amasty docs describe customer-token routes:
 *   GET /rest/V1/rewards/mine/balance
 *   GET /rest/V1/rewards/mine/history
 * and a GraphQL `rewards` query whose exact fields vary by extension version.
 *
 * Storefront controllers `rewards/cart/apply` and `rewards/cart/remove` only
 * apply points during checkout. This app is read-only and does not call them.
 * Admin routes under /rest/V1/rewards/management are not used.
 *
 * The GraphQL selection below is a starting point. If the store rejects it,
 * introspect the schema and edit AMASTY_REWARDS_QUERY. REST field names are
 * normalized in mapRewards.ts.
 */
export const AMASTY_REWARDS_QUERY = `
  query MetalCloakRewards {
    rewards {
      balance
      currency_amount
      history {
        id
        amount
        action
        comment
        date
        action_date
      }
    }
  }
`;

export async function fetchAmastyRewards(
  config: AppConfig,
  http: StoreHttp,
  token: string,
): Promise<RewardsSnapshot> {
  try {
    if (config.rewardsProfile === 'amasty-graphql') {
      const payload = await http.post('/graphql', { query: AMASTY_REWARDS_QUERY }, token);
      return mapAmastyGraphql(payload);
    }
    const [balancePayload, historyPayload] = await Promise.all([
      http.get(config.rewardsBalancePath, token),
      http.get(config.rewardsHistoryPath, token),
    ]);
    const balance = mapAmastyBalance(balancePayload);
    return {
      balance: {
        points: balance.points,
        currencyValue: balance.currencyValue,
        currency: balance.currency,
        conversionNote: null,
      },
      history: mapAmastyHistory(historyPayload),
      provider: config.rewardsProfile,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Rewards request failed.';
    throw new StoreError(
      `${message} Rewards profile "${config.rewardsProfile}" did not match this store. Confirm Amasty's customer routes (GET /rest/V1/rewards/mine/balance and /history) or point EXPO_PUBLIC_REWARDS_PROFILE at amasty-graphql / custom.`,
    );
  }
}

export function mapAmastyGraphql(payload: unknown): RewardsSnapshot {
  const root = asRecord(payload);
  const errors = Array.isArray(root?.errors) ? root.errors : [];
  if (errors.length > 0) {
    const message = stringOf(asRecord(errors[0])?.message);
    throw new StoreError(
      message ??
        "The rewards GraphQL query failed. Its field selection is a hypothesis and may need to match this store's Amasty schema.",
    );
  }
  const data = asRecord(root?.data) ?? root;
  const rewards = data?.rewards ?? data?.customerRewards ?? data?.amastyRewards;
  if (rewards == null) {
    throw new StoreError(
      'Unrecognized Amasty GraphQL rewards payload. Update AMASTY_REWARDS_QUERY after schema introspection.',
    );
  }
  const row = asRecord(rewards);
  const balanceSource =
    row && (typeof row.balance === 'number' || typeof row.balance === 'string')
      ? { balance: row.balance, currency_amount: row.currency_amount ?? row.currencyAmount, currency: row.currency }
      : (row?.balance ?? rewards);
  const mapped = mapAmastyBalance(balanceSource);
  if (mapped.currencyValue == null && row) {
    const sibling = mapCurrencySibling(row);
    if (sibling != null) mapped.currencyValue = sibling;
  }
  return {
    balance: {
      points: mapped.points,
      currencyValue: mapped.currencyValue,
      currency: mapped.currency,
      conversionNote: null,
    },
    history: mapAmastyHistory(row?.history ?? row?.transactions ?? []),
    provider: 'amasty-graphql',
  };
}

function mapCurrencySibling(row: Record<string, unknown>): number | null {
  const value = row.currency_amount ?? row.currencyAmount;
  return typeof value === 'number' ? value : null;
}
