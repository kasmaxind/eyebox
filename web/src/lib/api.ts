import type { ApiResponse } from './types';

const ACCESS_KEY = 'eyebox_access';
const REFRESH_KEY = 'eyebox_refresh';

export function getAccessToken() {
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY);
}

export function setTokens(access: string, refresh: string) {
  localStorage.setItem(ACCESS_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

let refreshPromise: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;
  try {
    const res = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    const json = await res.json();
    if (!json.success) {
      clearTokens();
      return false;
    }
    setTokens(json.data.accessToken, json.data.refreshToken);
    return true;
  } catch {
    clearTokens();
    return false;
  }
}

export async function api<T>(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<ApiResponse<T>> {
  const headers = new Headers(options.headers || {});
  const token = getAccessToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(path, { ...options, headers });
  if (res.status === 401 && retry) {
    refreshPromise = refreshPromise || tryRefresh().finally(() => { refreshPromise = null; });
    const ok = await refreshPromise;
    if (ok) return api(path, options, false);
  }

  const json = await res.json().catch(() => ({ success: false, error: 'Invalid response', data: null }));
  if (!res.ok || json.success === false) {
    throw new Error(json.error || `Request failed (${res.status})`);
  }
  return json as ApiResponse<T>;
}

export function mediaUrl(kind: 'thumbs' | 'avatars', filename?: string | null) {
  if (!filename) return null;
  if (filename.startsWith('http') || filename.startsWith('/')) return filename;
  return `/media/${kind}/${filename}`;
}

export function formatViews(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export function formatDuration(seconds: number) {
  const s = Math.max(0, Math.floor(seconds || 0));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  return `${m}:${String(sec).padStart(2, '0')}`;
}

export function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}
