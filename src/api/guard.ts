import { isLiveMetalCloakHost, type AppConfig } from '../config';
import { StoreError } from './errors';

/**
 * This build must not contact the live MetalCloak store unless someone
 * explicitly arms that call after access has been confirmed.
 */
export function assertMayCallStore(config: AppConfig): void {
  try {
    new URL(config.magentoBaseUrl);
  } catch {
    throw new StoreError('EXPO_PUBLIC_MAGENTO_BASE_URL is not a valid URL.');
  }
  if (isLiveMetalCloakHost(config.magentoBaseUrl) && !config.allowLiveStore) {
    throw new StoreError(
      'This build will not call the live MetalCloak store. It ships on sample data. Point EXPO_PUBLIC_MAGENTO_BASE_URL at a Magento instance you control, or set EXPO_PUBLIC_ALLOW_LIVE_STORE=true only after MetalCloak has confirmed API access.',
    );
  }
}
