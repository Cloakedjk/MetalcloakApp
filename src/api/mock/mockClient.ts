import type { StoreClient } from '../../domain';
import { StoreError } from '../errors';
import { SAMPLE_TOKEN, sampleAccount, sampleCustomer, sampleOrders, sampleRewards } from './sampleData';

export function createMockClient(options?: { delayMs?: number }): StoreClient {
  const delayMs = options?.delayMs ?? 400;
  const wait = () => new Promise<void>((resolve) => setTimeout(resolve, delayMs));

  function assertToken(token: string): void {
    if (token !== SAMPLE_TOKEN) {
      throw new StoreError('Sample session expired. Sign in again.');
    }
  }

  return {
    source: 'mock',
    async login(email, password) {
      await wait();
      const normalized = email.trim().toLowerCase();
      if (!normalized || !password) {
        throw new StoreError('Enter the email and password for your MetalCloak account.');
      }
      if (normalized !== sampleAccount.email) {
        throw new StoreError(`No sample account uses that email. Try ${sampleAccount.email}.`);
      }
      if (password !== sampleAccount.password) {
        throw new StoreError("That password doesn't match the sample account.");
      }
      return { token: SAMPLE_TOKEN };
    },
    async getCustomer(token) {
      await wait();
      assertToken(token);
      return sampleCustomer;
    },
    async getOrders(token) {
      await wait();
      assertToken(token);
      return sampleOrders;
    },
    async getOrder(token, orderNumber) {
      await wait();
      assertToken(token);
      const order = sampleOrders.find((item) => item.number === orderNumber);
      if (!order) throw new StoreError(`Order ${orderNumber} was not found on this account.`);
      return order;
    },
    async getRewards(token) {
      await wait();
      assertToken(token);
      return sampleRewards;
    },
  };
}
