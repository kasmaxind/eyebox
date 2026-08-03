"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

type MiniPlayer = {
  videoId: string;
  currentTime: number;
  playing: boolean;
} | null;

type Persisted = {
  liked: string[];
  disliked: string[];
  watchLater: string[];
  subscribed: string[];
  history: string[];
  progress: Record<string, number>;
  sidebarCollapsed: boolean;
};

type StoreApi = {
  liked: Set<string>;
  disliked: Set<string>;
  watchLater: Set<string>;
  subscribed: Set<string>;
  history: string[];
  progress: Record<string, number>;
  miniPlayer: MiniPlayer;
  sidebarCollapsed: boolean;
  notificationsOpen: boolean;
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

const defaults: Persisted = {
  liked: ["v1", "v8"],
  disliked: [],
  watchLater: ["v4", "v9"],
  subscribed: ["ch-nebula", "ch-pulse", "ch-arena", "ch-byte"],
  history: ["v1", "v2", "v7", "v8", "v10"],
  progress: { v1: 0.42, v2: 0.18, v7: 0.67 },
  sidebarCollapsed: false,
};

let memory: Persisted = defaults;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function readFromStorage(): Persisted {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as Partial<Persisted>;
    return {
      liked: parsed.liked ?? defaults.liked,
      disliked: parsed.disliked ?? defaults.disliked,
      watchLater: parsed.watchLater ?? defaults.watchLater,
      subscribed: parsed.subscribed ?? defaults.subscribed,
      history: parsed.history ?? defaults.history,
      progress: parsed.progress ?? defaults.progress,
      sidebarCollapsed: parsed.sidebarCollapsed ?? defaults.sidebarCollapsed,
    };
  } catch {
    return defaults;
  }
}

function commit(next: Persisted) {
  memory = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* ignore quota */
  }
  emit();
}

function getSnapshot(): Persisted {
  return memory;
}

function getServerSnapshot(): Persisted {
  return defaults;
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  if (listeners.size === 1 && typeof window !== "undefined") {
    memory = readFromStorage();
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        memory = readFromStorage();
        emit();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(onChange);
      window.removeEventListener("storage", onStorage);
    };
  }
  return () => {
    listeners.delete(onChange);
  };
}

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const persisted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [liveProgress, setLiveProgress] = useState<Record<string, number> | null>(null);
  const [miniPlayer, setMiniPlayer] = useState<MiniPlayer>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const progressRef = useRef(persisted.progress);

  useEffect(() => {
    progressRef.current = liveProgress ?? persisted.progress;
  }, [liveProgress, persisted.progress]);

  const patch = useCallback((partial: Partial<Persisted>) => {
    commit({ ...memory, progress: progressRef.current, ...partial });
  }, []);

  const toggleLike = useCallback(
    (id: string) => {
      const liked = new Set(memory.liked);
      if (liked.has(id)) liked.delete(id);
      else liked.add(id);
      patch({ liked: [...liked], disliked: memory.disliked.filter((x) => x !== id) });
    },
    [patch],
  );

  const toggleDislike = useCallback(
    (id: string) => {
      const disliked = new Set(memory.disliked);
      if (disliked.has(id)) disliked.delete(id);
      else disliked.add(id);
      patch({ disliked: [...disliked], liked: memory.liked.filter((x) => x !== id) });
    },
    [patch],
  );

  const toggleWatchLater = useCallback(
    (id: string) => {
      const watchLater = new Set(memory.watchLater);
      if (watchLater.has(id)) watchLater.delete(id);
      else watchLater.add(id);
      patch({ watchLater: [...watchLater] });
    },
    [patch],
  );

  const toggleSubscribe = useCallback(
    (channelId: string) => {
      const subscribed = new Set(memory.subscribed);
      if (subscribed.has(channelId)) subscribed.delete(channelId);
      else subscribed.add(channelId);
      patch({ subscribed: [...subscribed] });
    },
    [patch],
  );

  const addHistory = useCallback(
    (id: string) => {
      patch({
        history: [id, ...memory.history.filter((x) => x !== id)].slice(0, 40),
      });
    },
    [patch],
  );

  const setProgress = useCallback((id: string, ratio: number) => {
    const next = Math.min(1, Math.max(0, ratio));
    setLiveProgress((prev) => {
      const base = prev ?? memory.progress;
      if (Math.abs((base[id] ?? 0) - next) < 0.012) return prev;
      const updated = { ...base, [id]: next };
      progressRef.current = updated;
      return updated;
    });
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      if (!progressRef.current) return;
      commit({ ...memory, progress: progressRef.current });
    }, 3000);
    return () => window.clearInterval(id);
  }, []);

  const openMiniPlayer = useCallback((videoId: string, currentTime = 0) => {
    setMiniPlayer({ videoId, currentTime, playing: true });
  }, []);

  const closeMiniPlayer = useCallback(() => setMiniPlayer(null), []);

  const updateMiniPlayer = useCallback((p: Partial<NonNullable<MiniPlayer>>) => {
    setMiniPlayer((prev) => (prev ? { ...prev, ...p } : prev));
  }, []);

  const setSidebarCollapsed = useCallback((v: boolean) => patch({ sidebarCollapsed: v }), [patch]);

  const progress = liveProgress ?? persisted.progress;

  const value = useMemo<StoreApi>(
    () => ({
      liked: new Set(persisted.liked),
      disliked: new Set(persisted.disliked),
      watchLater: new Set(persisted.watchLater),
      subscribed: new Set(persisted.subscribed),
      history: persisted.history,
      progress,
      miniPlayer,
      sidebarCollapsed: persisted.sidebarCollapsed,
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
      persisted,
      progress,
      miniPlayer,
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
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useAppStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useAppStore must be used within AppStoreProvider");
  return ctx;
}
