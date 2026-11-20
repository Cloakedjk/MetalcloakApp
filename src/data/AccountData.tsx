import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getStoreClient } from '../api/client';
import { errorMessage } from '../api/errors';
import { useSession } from '../auth/AuthContext';
import type { Customer, Order, RewardsSnapshot } from '../domain';

interface AccountDataValue {
  customer: Customer | null;
  orders: Order[];
  rewards: RewardsSnapshot | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const AccountDataContext = createContext<AccountDataValue | null>(null);

export function AccountDataProvider({ children }: { children: ReactNode }) {
  const { session } = useSession();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [rewards, setRewards] = useState<RewardsSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (mode: 'initial' | 'refresh') => {
      if (!session) return;
      if (mode === 'initial') setLoading(true);
      else setRefreshing(true);
      try {
        const client = getStoreClient();
        const [nextCustomer, nextOrders, nextRewards] = await Promise.all([
          client.getCustomer(session),
          client.getOrders(session),
          client.getRewards(session),
        ]);
        setCustomer(nextCustomer);
        setOrders(nextOrders);
        setRewards(nextRewards);
        setError(null);
      } catch (caught) {
        setError(errorMessage(caught, 'Could not load your account.'));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [session],
  );

  useEffect(() => {
    void load('initial');
  }, [load]);

  const refresh = useCallback(() => load('refresh'), [load]);

  const value = useMemo(
    () => ({ customer, orders, rewards, loading, refreshing, error, refresh }),
    [customer, orders, rewards, loading, refreshing, error, refresh],
  );

  return <AccountDataContext.Provider value={value}>{children}</AccountDataContext.Provider>;
}

export function useAccountData(): AccountDataValue {
  const value = useContext(AccountDataContext);
  if (!value) throw new Error('useAccountData must be used within AccountDataProvider');
  return value;
}
