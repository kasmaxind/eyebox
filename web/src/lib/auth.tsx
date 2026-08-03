import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { api, clearTokens, getAccessToken, getRefreshToken, setTokens } from './api';
import {
  setupE2EKeys,
  unlockPrivateKey,
  hasSubtleCrypto,
} from './e2e';
import type { User } from './types';

interface E2EBundle {
  publicKey: string;
  encryptedPrivateKey: string;
  salt: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  e2e: E2EBundle | null;
  privateKey: CryptoKey | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; username: string; displayName: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
  enableE2E: (password: string) => Promise<void>;
  unlockE2E: (password: string) => Promise<void>;
  lockE2E: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [e2e, setE2e] = useState<E2EBundle | null>(null);
  const [privateKey, setPrivateKey] = useState<CryptoKey | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshMe = useCallback(async () => {
    if (!getAccessToken() && !getRefreshToken()) {
      setUser(null);
      setE2e(null);
      setLoading(false);
      return;
    }
    try {
      const res = await api<{ user: User; e2e: E2EBundle }>('/api/auth/me');
      setUser(res.data.user);
      setE2e(res.data.e2e?.publicKey ? res.data.e2e : null);
    } catch {
      clearTokens();
      setUser(null);
      setE2e(null);
      setPrivateKey(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshMe();
  }, [refreshMe]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api<{ user: User; accessToken: string; refreshToken: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, deviceName: 'EyeBox Web' }),
    });
    setTokens(res.data.accessToken, res.data.refreshToken);
    setUser(res.data.user);
    await refreshMe();
  }, [refreshMe]);

  const register = useCallback(async (data: { email: string; password: string; username: string; displayName: string }) => {
    const res = await api<{ user: User; accessToken: string; refreshToken: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setTokens(res.data.accessToken, res.data.refreshToken);
    setUser(res.data.user);
    await refreshMe();
  }, [refreshMe]);

  const logout = useCallback(async () => {
    try {
      await api('/api/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: getRefreshToken() }),
      });
    } catch { /* ignore */ }
    clearTokens();
    setUser(null);
    setE2e(null);
    setPrivateKey(null);
  }, []);

  const enableE2E = useCallback(async (password: string) => {
    if (!hasSubtleCrypto()) throw new Error('Web Crypto not available (needs HTTPS or localhost)');
    const keys = await setupE2EKeys(password);
    await api('/api/auth/e2e-keys', {
      method: 'PUT',
      body: JSON.stringify(keys),
    });
    const priv = await unlockPrivateKey(password, keys.encryptedPrivateKey, keys.salt);
    setE2e(keys);
    setPrivateKey(priv);
    await refreshMe();
  }, [refreshMe]);

  const unlockE2E = useCallback(async (password: string) => {
    if (!e2e?.encryptedPrivateKey || !e2e.salt) throw new Error('E2E keys not configured');
    const priv = await unlockPrivateKey(password, e2e.encryptedPrivateKey, e2e.salt);
    setPrivateKey(priv);
  }, [e2e]);

  const lockE2E = useCallback(() => setPrivateKey(null), []);

  const value = useMemo(() => ({
    user, loading, e2e, privateKey, login, register, logout, refreshMe, enableE2E, unlockE2E, lockE2E,
  }), [user, loading, e2e, privateKey, login, register, logout, refreshMe, enableE2E, unlockE2E, lockE2E]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth outside provider');
  return ctx;
}
