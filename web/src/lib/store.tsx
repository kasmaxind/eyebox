"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type MiniPlayer = {
  videoId: string;
  currentTime: number;
  playing: boolean;
} | null;

type StoreState = {
  liked: Set<string>;
  disliked: Set<string>;
  watchLater: Set<string>;
  subscribed: Set<string>;
  history: string[];
  progress: Record<string, number>;
  miniPlayer: MiniPlayer;
  sidebarCollapsed: boolean;
  notificationsOpen: boolean;
};

type StoreApi = StoreState & {
  toggleLike: (id: string) => void;
  toggleDislike: (id: string) => void;
  toggleWatchLater: (id: string) => void;
  toggleSubscribe: (channelId: string) => void;
  addHistory: (id: string) => void;
  setProgress: (id: string, ratio: number) => void;
  openMiniPlayer: (videoId: string, currentTime?: number) => void;
  closeMiniPlayer: () => void;
  updateMiniPlayer: (patch: Partial<NonNullable<MiniPlayer>>) => void;
  setSidebarCollapsed: (v: boolean) => void;
  setNotificationsOpen: (v: boolean) => void;
};

const StoreContext = createContext<StoreApi | null>(null);

const STORAGE_KEY = "eyebox-store-v1";

function loadInitial(): Partial<StoreState> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as {
      liked?: string[];
      disliked?: string[];
      watchLater?: string[];
      subscribed?: string[];
      history?: string[];
      progress?: Record<string, number>;
      sidebarCollapsed?: boolean;
    };
    return {
      liked: new Set(parsed.liked ?? ["v1", "v8"]),
      disliked: new Set(parsed.disliked ?? []),
      watchLater: new Set(parsed.watchLater ?? ["v4", "v9"]),
      subscribed: new Set(parsed.subscribed ?? ["ch-nebula", "ch-pulse", "ch-arena", "ch-byte"]),
      history: parsed.history ?? ["v1", "v2", "v7", "v8", "v10"],
      progress: parsed.progress ?? { v1: 0.42, v2: 0.18, v7: 0.67 },
      sidebarCollapsed: parsed.sidebarCollapsed ?? false,
    };
  } catch {
    return {};
  }
}

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [liked, setLiked] = useState<Set<string>>(() => new Set(["v1", "v8"]));
  const [disliked, setDisliked] = useState<Set<string>>(() => new Set());
  const [watchLater, setWatchLater] = useState<Set<string>>(() => new Set(["v4", "v9"]));
  const [subscribed, setSubscribed] = useState<Set<string>>(
    () => new Set(["ch-nebula", "ch-pulse", "ch-arena", "ch-byte"]),
  );
  const [history, setHistory] = useState<string[]>(["v1", "v2", "v7", "v8", "v10"]);
  const [progress, setProgressMap] = useState<Record<string, number>>({
    v1: 0.42,
    v2: 0.18,
    v7: 0.67,
  });
  const [miniPlayer, setMiniPlayer] = useState<MiniPlayer>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const initial = loadInitial();
    if (initial.liked) setLiked(initial.liked);
    if (initial.disliked) setDisliked(initial.disliked);
    if (initial.watchLater) setWatchLater(initial.watchLater);
    if (initial.subscribed) setSubscribed(initial.subscribed);
    if (initial.history) setHistory(initial.history);
    if (initial.progress) setProgressMap(initial.progress);
    if (typeof initial.sidebarCollapsed === "boolean") setSidebarCollapsed(initial.sidebarCollapsed);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        liked: [...liked],
        disliked: [...disliked],
        watchLater: [...watchLater],
        subscribed: [...subscribed],
        history,
        progress,
        sidebarCollapsed,
      }),
    );
  }, [liked, disliked, watchLater, subscribed, history, progress, sidebarCollapsed, hydrated]);

  const toggleLike = useCallback((id: string) => {
    setLiked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setDisliked((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const toggleDislike = useCallback((id: string) => {
    setDisliked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setLiked((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const toggleWatchLater = useCallback((id: string) => {
    setWatchLater((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSubscribe = useCallback((channelId: string) => {
    setSubscribed((prev) => {
      const next = new Set(prev);
      if (next.has(channelId)) next.delete(channelId);
      else next.add(channelId);
      return next;
    });
  }, []);

  const addHistory = useCallback((id: string) => {
    setHistory((prev) => [id, ...prev.filter((x) => x !== id)].slice(0, 40));
  }, []);

  const setProgress = useCallback((id: string, ratio: number) => {
    setProgressMap((prev) => ({ ...prev, [id]: Math.min(1, Math.max(0, ratio)) }));
  }, []);

  const openMiniPlayer = useCallback((videoId: string, currentTime = 0) => {
    setMiniPlayer({ videoId, currentTime, playing: true });
  }, []);

  const closeMiniPlayer = useCallback(() => setMiniPlayer(null), []);

  const updateMiniPlayer = useCallback((patch: Partial<NonNullable<MiniPlayer>>) => {
    setMiniPlayer((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);

  const value = useMemo<StoreApi>(
    () => ({
      liked,
      disliked,
      watchLater,
      subscribed,
      history,
      progress,
      miniPlayer,
      sidebarCollapsed,
      notificationsOpen,
      toggleLike,
      toggleDislike,
      toggleWatchLater,
      toggleSubscribe,
      addHistory,
      setProgress,
      openMiniPlayer,
      closeMiniPlayer,
      updateMiniPlayer,
      setSidebarCollapsed,
      setNotificationsOpen,
    }),
    [
      liked,
      disliked,
      watchLater,
      subscribed,
      history,
      progress,
      miniPlayer,
      sidebarCollapsed,
      notificationsOpen,
      toggleLike,
      toggleDislike,
      toggleWatchLater,
      toggleSubscribe,
      addHistory,
      setProgress,
      openMiniPlayer,
      closeMiniPlayer,
      updateMiniPlayer,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useAppStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useAppStore must be used within AppStoreProvider");
  return ctx;
}
