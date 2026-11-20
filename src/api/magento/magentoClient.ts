import type { AppConfig } from '../../config';
import type { Order, StoreClient } from '../../domain';
import { StoreError } from '../errors';
import { assertMayCallStore } from '../guard';
import { createFetchHttp, type StoreHttp } from '../http';
import { asRecord, stringOf } from '../record';
import { fetchAmastyRewards } from '../rewards/amasty';
import { mapCustomer } from './mapCustomer';
import { mapGraphqlOrders, mapRestOrders } from './mapOrder';
import { CUSTOMER_ORDERS_QUERY, restOrderSearch } from './ordersQuery';

/**
 * Magento 2 customer session.
 *
 * Auth: POST /rest/V1/integration/customer/token with { username, password }.
 * Profile: GET /rest/V1/customers/me (self).
 * Orders default to the storefront GraphQL `customer { orders }` query, which
 * a customer token is allowed to run on Magento 2.4.4+. REST /V1/orders is an
 * admin resource (Magento_Sales::actions_view) unless the store grants it.
 * Rewards go through the Amasty adapter.
 */
export function createMagentoClient(config: AppConfig, http?: StoreHttp): StoreClient {
  const transport = http ?? createFetchHttp(config);

  async function getOrders(token: string): Promise<Order[]> {
    assertMayCallStore(config);
    if (config.ordersApi === 'rest') {
      const customer = mapCustomer(await transport.get('/rest/V1/customers/me', token));
      const payload = await transport.get(restOrderSearch(customer.id), token);
      return mapRestOrders(payload);
    }
    const payload = await transport.post('/graphql', { query: CUSTOMER_ORDERS_QUERY }, token);
    const errors = asRecord(payload)?.errors;
    if (Array.isArray(errors) && errors.length > 0) {
      throw new StoreError(stringOf(asRecord(errors[0])?.message) ?? 'The orders query failed.');
    }
    return mapGraphqlOrders(payload);
  }

  return {
    source: 'magento',
    async login(email, password) {
      assertMayCallStore(config);
      const payload = await transport.post('/rest/V1/integration/customer/token', {
        username: email.trim(),
        password,
      });
      if (typeof payload !== 'string' || !payload) {
        throw new StoreError('The store did not return a customer token.');
      }
      return { token: payload };
    },
    async getCustomer(token) {
      assertMayCallStore(config);
      return mapCustomer(await transport.get('/rest/V1/customers/me', token));
    },
    getOrders,
    async getOrder(token, orderNumber) {
      const orders = await getOrders(token);
      const order = orders.find((item) => item.number === orderNumber);
      if (!order) throw new StoreError(`Order ${orderNumber} was not found on this account.`);
      return order;
    },
    async getRewards(token) {
      assertMayCallStore(config);
      return fetchAmastyRewards(config, transport, token);
    },
  };
}
