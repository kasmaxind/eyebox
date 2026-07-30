import { createContext, useCallback, useContext, useMemo, useState } from "react";

const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  const [mini, setMini] = useState(null);

  const openMini = useCallback((payload) => {
    setMini(payload);
  }, []);

  const closeMini = useCallback(() => {
    setMini(null);
  }, []);

  const value = useMemo(
    () => ({ mini, openMini, closeMini }),
    [mini, openMini, closeMini]
  );

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
}
