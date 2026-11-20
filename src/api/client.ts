import { getConfig, type AppConfig } from '../config';
import type { StoreClient } from '../domain';
import { createMagentoClient } from './magento/magentoClient';
import { createMockClient } from './mock/mockClient';

export function createStoreClient(config: AppConfig = getConfig()): StoreClient {
  if (config.dataSource === 'magento') return createMagentoClient(config);
  return createMockClient();
}

let singleton: { key: string; client: StoreClient } | null = null;

export function getStoreClient(): StoreClient {
  const config = getConfig();
  const key = JSON.stringify(config);
  if (!singleton || singleton.key !== key) {
    singleton = { key, client: createStoreClient(config) };
  }
  return singleton.client;
}
