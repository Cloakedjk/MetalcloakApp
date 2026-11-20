import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { getConfig, isLiveMetalCloakHost } from '../src/config';
import { createStoreClient } from '../src/api/client';
import { magentoErrorMessage } from '../src/api/http';
import { createMagentoClient } from '../src/api/magento/magentoClient';
import { mapCustomer } from '../src/api/magento/mapCustomer';
import { mapGraphqlOrders, mapRestOrders, trackingUrl } from '../src/api/magento/mapOrder';
import { createMockClient } from '../src/api/mock/mockClient';
import { sampleOrders, sampleRewards } from '../src/api/mock/sampleData';
import { purchasedProducts } from '../src/api/purchases';
import { productReviewUrl } from '../src/api/reviews';
import type { StoreHttp } from '../src/api/http';
import { mapAmastyGraphql } from '../src/api/rewards/amasty';
import { mapAmastyBalance, mapAmastyHistory } from '../src/api/rewards/mapRewards';

describe('sample account', () => {
  it('signs in the fictional customer and refuses anything else', async () => {
    const client = createMockClient({ delayMs: 0 });
    const session = await client.login('Alex.Rivera@example.com', 'trailrated');
    const customer = await client.getCustomer(session.token);
    assert.equal(customer.firstName, 'Alex');
    const orders = await client.getOrders(session.token);
    assert.equal(orders[0]?.number, '100048812');
    await assert.rejects(() => client.login('alex.rivera@example.com', 'wrong'), /doesn't match/);
    await assert.rejects(() => client.login('someone@example.com', 'trailrated'), /No sample account/);
  });

  it('keeps the sample rewards ledger equal to the balance', () => {
    const sum = sampleRewards.history.reduce((total, entry) => total + entry.points, 0);
    assert.equal(sum, sampleRewards.balance.points);
    assert.equal(sampleRewards.balance.currencyValue, 18.4);
  });

  it('keeps sample order totals consistent and lists each purchase once', () => {
    for (const order of sampleOrders) {
      const expected =
        order.totals.subtotal - order.totals.discount + order.totals.shipping + order.totals.tax;
      assert.equal(Math.round(expected * 100) / 100, order.totals.grandTotal);
    }
    const products = purchasedProducts(sampleOrders);
    assert.equal(products.length, 8);
    assert.equal(products[0]?.item.sku, 'A2235');
  });
});

describe('review links', () => {
  it('opens the product page review anchor', () => {
    assert.equal(
      productReviewUrl(
        {
          productUrl: 'https://metalcloak.com/jl-wrangler-3-5-game-changer-suspension-system.html',
          urlKey: 'ignored',
          sku: 'A2235',
        },
        'https://www.metalcloak.com',
      ),
      'https://metalcloak.com/jl-wrangler-3-5-game-changer-suspension-system.html#reviews',
    );
    assert.equal(
      productReviewUrl({ productUrl: null, urlKey: '/game-changer.html', sku: 'A2235' }, 'https://www.metalcloak.com'),
      'https://www.metalcloak.com/game-changer.html#reviews',
    );
    assert.equal(
      productReviewUrl({ productUrl: null, urlKey: null, sku: 'A2235' }, 'https://www.metalcloak.com'),
      'https://www.metalcloak.com/catalogsearch/result/?q=A2235#reviews',
    );
  });
});

describe('magento mappers', () => {
  it('maps a customer profile', () => {
    const customer = mapCustomer({
      id: 10482,
      email: 'alex.rivera@example.com',
      firstname: 'Alex',
      lastname: 'Rivera',
      created_at: '2019-04-12 18:22:11',
    });
    assert.equal(customer.createdAt, '2019-04-12');
    assert.equal(customer.id, '10482');
  });

  it('maps GraphQL orders, including tracking links', () => {
    const orders = mapGraphqlOrders({
      data: {
        customer: {
          orders: {
            items: [
              {
                id: '9',
                number: '100048812',
                order_date: '2026-11-12 15:00:00',
                status: 'processing',
                items: [
                  {
                    product_sku: 'A2235',
                    product_name: 'Game-Changer',
                    product_url_key: 'jl-wrangler-3-5-game-changer-suspension-system',
                    quantity_ordered: 1,
                    product_sale_price: { value: 5495, currency: 'USD' },
                  },
                ],
                total: {
                  grand_total: { value: 5495, currency: 'USD' },
                  subtotal: { value: 5495, currency: 'USD' },
                  total_shipping: { value: 0, currency: 'USD' },
                  total_tax: { value: 0, currency: 'USD' },
                  discounts: [],
                },
                shipping_address: {
                  firstname: 'Alex',
                  lastname: 'Rivera',
                  street: ['1842 Canyon Ridge Rd'],
                  city: 'Moab',
                  region: 'UT',
                  postcode: '84532',
                  country_code: 'US',
                },
                payment_methods: [{ name: 'Visa', type: 'card' }],
                shipments: [],
              },
            ],
          },
        },
      },
    });
    assert.equal(orders[0]?.statusLabel, 'Processing');
    assert.equal(orders[0]?.items[0]?.urlKey, 'jl-wrangler-3-5-game-changer-suspension-system');
    assert.equal(orders[0]?.shippingAddress?.city, 'Moab');
    assert.equal(trackingUrl('UPS Ground', '1Z999'), 'https://www.ups.com/track?tracknum=1Z999');
  });

  it('drops configurable child rows from REST orders', () => {
    const orders = mapRestOrders({
      items: [
        {
          entity_id: 3,
          increment_id: '1001',
          created_at: '2026-01-02 00:00:00',
          status: 'complete',
          subtotal: 100,
          shipping_amount: 0,
          tax_amount: 0,
          discount_amount: -5,
          grand_total: 95,
          order_currency_code: 'USD',
          items: [
            { sku: 'PARENT', name: 'Kit', price: 100, row_total: 100, qty_ordered: 1, product_type: 'configurable' },
            { sku: 'CHILD', name: 'Kit option', price: 0, row_total: 0, qty_ordered: 1, parent_item_id: 10 },
          ],
          payment: { method: 'authnetcim', additional_information: { method_title: 'Visa' } },
          tracks: [{ title: 'FedEx', track_number: '7489' }],
        },
      ],
    });
    assert.equal(orders[0]?.items.length, 1);
    assert.equal(orders[0]?.items[0]?.sku, 'PARENT');
    assert.equal(orders[0]?.totals.discount, 5);
    assert.equal(orders[0]?.paymentMethod, 'Visa');
    assert.equal(orders[0]?.shipments[0]?.trackingNumber, '7489');
    assert.match(orders[0]?.shipments[0]?.trackingUrl ?? '', /fedex/i);
  });
});

describe('rewards adapter', () => {
  it('reads several Amasty balance shapes', () => {
    assert.equal(mapAmastyBalance(1840).points, 1840);
    assert.equal(mapAmastyBalance({ balance: 12 }).points, 12);
    assert.deepEqual(mapAmastyBalance({ customer_balance: { points: 40, currency_amount: 0.4, currency: 'usd' } }), {
      points: 40,
      currencyValue: 0.4,
      currency: 'USD',
    });
  });

  it('reads history rows and a hypothetical GraphQL payload', () => {
    const history = mapAmastyHistory({
      items: [
        { id: 2, amount: -15, action: 'redeem', comment: 'Spent on order #100045102', action_date: '2026-06-21 12:00:00' },
        { id: 1, amount: 20, action: 'ordercompleted', comment: 'Earned', action_date: '2026-01-01' },
      ],
    });
    assert.equal(history[0]?.action, 'spend');
    assert.equal(history[0]?.orderNumber, '100045102');
    assert.equal(history[1]?.action, 'earn');

    const snapshot = mapAmastyGraphql({
      data: {
        rewards: {
          balance: 80,
          currency_amount: 0.8,
          history: [{ id: '9', amount: 80, action: 'earn', comment: 'Bonus', date: '2026-02-02' }],
        },
      },
    });
    assert.equal(snapshot.balance.points, 80);
    assert.equal(snapshot.balance.currencyValue, 0.8);
    assert.equal(snapshot.provider, 'amasty-graphql');
  });

  it('surfaces a GraphQL schema mismatch instead of inventing a balance', () => {
    assert.throws(
      () => mapAmastyGraphql({ errors: [{ message: 'Cannot query field "rewards" on type "Query".' }] }),
      /Cannot query field/,
    );
  });
});

describe('live store guard', () => {
  it('does not call metalcloak.com unless the flag is set', async () => {
    let called = false;
    const http = fakeHttp(() => {
      called = true;
      return 'token';
    });
    const client = createMagentoClient(
      getConfig({
        EXPO_PUBLIC_DATA_SOURCE: 'magento',
        EXPO_PUBLIC_MAGENTO_BASE_URL: 'https://www.metalcloak.com',
      }),
      http,
    );
    await assert.rejects(() => client.login('a@b.c', 'secret'), /will not call the live MetalCloak store/);
    assert.equal(called, false);
    assert.equal(isLiveMetalCloakHost('https://shop.metalcloak.com/rest'), true);
  });

  it('uses the customer token API against a non-live host', async () => {
    const calls: string[] = [];
    const http: StoreHttp = {
      async post(path, body) {
        calls.push(path);
        assert.deepEqual(body, { username: 'a@b.c', password: 'secret' });
        return 'tok_123';
      },
      async get() {
        throw new Error('unexpected');
      },
    };
    const client = createMagentoClient(
      getConfig({
        EXPO_PUBLIC_DATA_SOURCE: 'magento',
        EXPO_PUBLIC_MAGENTO_BASE_URL: 'https://magento.example.test',
      }),
      http,
    );
    const session = await client.login('a@b.c', 'secret');
    assert.equal(session.token, 'tok_123');
    assert.deepEqual(calls, ['/rest/V1/integration/customer/token']);
    assert.equal(createStoreClient(getConfig({})).source, 'mock');
  });

  it('rejects an unknown rewards profile', () => {
    assert.throws(() => getConfig({ EXPO_PUBLIC_REWARDS_PROFILE: 'mirasvit' }), /Unknown EXPO_PUBLIC_REWARDS_PROFILE/);
  });

  it('passes through Magento error messages', () => {
    assert.equal(
      magentoErrorMessage({ message: 'Invalid login or password.' }, '', 401),
      'Invalid login or password.',
    );
  });
});

function fakeHttp(post: () => unknown): StoreHttp {
  return {
    post: async () => post(),
    get: async () => post(),
  };
}
