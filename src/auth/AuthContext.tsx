import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getStoreClient } from '../api/client';
import { readStorageItem, setStorageItemAsync } from './storage';

const SESSION_KEY = 'metalcloak.session.v1';

interface AuthContextValue {
  session: string | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stored = await readStorageItem(SESSION_KEY);
        if (cancelled || !stored) return;
        try {
          await getStoreClient().getCustomer(stored);
          if (!cancelled) setSession(stored);
        } catch {
          await setStorageItemAsync(SESSION_KEY, null);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { token } = await getStoreClient().login(email, password);
    await setStorageItemAsync(SESSION_KEY, token);
    setSession(token);
  }, []);

  const signOut = useCallback(async () => {
    await setStorageItemAsync(SESSION_KEY, null);
    setSession(null);
  }, []);

  const value = useMemo(
    () => ({ session, isLoading, signIn, signOut }),
    [session, isLoading, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useSession(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useSession must be used within AuthProvider');
  return value;
}
