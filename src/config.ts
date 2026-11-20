export type DataSource = 'mock' | 'magento';
export type OrdersApi = 'graphql' | 'rest';
export type RewardsProfile = 'amasty-rest' | 'amasty-graphql' | 'custom';

export interface AppConfig {
  dataSource: DataSource;
  magentoBaseUrl: string;
  storeWebOrigin: string;
  magentoStoreCode: string | null;
  ordersApi: OrdersApi;
  rewardsProfile: RewardsProfile;
  rewardsBalancePath: string;
  rewardsHistoryPath: string;
  allowLiveStore: boolean;
}

const LIVE_HOST = 'metalcloak.com';

export function getConfig(env: Record<string, string | undefined> = process.env): AppConfig {
  const ordersRaw = env.EXPO_PUBLIC_ORDERS_API;
  return {
    dataSource: env.EXPO_PUBLIC_DATA_SOURCE === 'magento' ? 'magento' : 'mock',
    magentoBaseUrl: trimSlash(env.EXPO_PUBLIC_MAGENTO_BASE_URL ?? 'https://www.metalcloak.com'),
    storeWebOrigin: trimSlash(env.EXPO_PUBLIC_STORE_WEB_ORIGIN ?? 'https://www.metalcloak.com'),
    magentoStoreCode: env.EXPO_PUBLIC_MAGENTO_STORE_CODE?.trim() || null,
    ordersApi: ordersRaw === 'rest' ? 'rest' : 'graphql',
    rewardsProfile: parseRewardsProfile(env.EXPO_PUBLIC_REWARDS_PROFILE),
    rewardsBalancePath: env.EXPO_PUBLIC_REWARDS_BALANCE_PATH ?? '/rest/V1/rewards/mine/balance',
    rewardsHistoryPath: env.EXPO_PUBLIC_REWARDS_HISTORY_PATH ?? '/rest/V1/rewards/mine/history',
    allowLiveStore: env.EXPO_PUBLIC_ALLOW_LIVE_STORE === 'true',
  };
}

export function isLiveMetalCloakHost(baseUrl: string): boolean {
  try {
    const host = new URL(baseUrl).hostname.toLowerCase();
    return host === LIVE_HOST || host.endsWith(`.${LIVE_HOST}`);
  } catch {
    return false;
  }
}

function parseRewardsProfile(raw: string | undefined): RewardsProfile {
  if (!raw || raw === 'amasty-rest') return 'amasty-rest';
  if (raw === 'amasty-graphql' || raw === 'custom') return raw;
  throw new Error(
    `Unknown EXPO_PUBLIC_REWARDS_PROFILE "${raw}". Use amasty-rest, amasty-graphql, or custom.`,
  );
}

function trimSlash(url: string): string {
  return url.replace(/\/+$/, '');
}
