"use client";

import {
  BG_MODE_STORAGE_KEY,
  type BgMode,
  nextBgMode,
  readStoredBgMode,
} from "@lib/background-mode";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type BackgroundModeContextValue = {
  mode: BgMode;
  cycleMode: () => void;
  setMode: (mode: BgMode) => void;
};

const BackgroundModeContext = createContext<BackgroundModeContextValue | null>(
  null
);

function applyBgMode(mode: BgMode) {
  document.documentElement.setAttribute("data-bg-mode", mode);
}

export function BackgroundModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<BgMode>("dark");

  useEffect(() => {
    const stored = readStoredBgMode();
    setModeState(stored);
    applyBgMode(stored);
  }, []);

  const setMode = useCallback((next: BgMode) => {
    setModeState(next);
    applyBgMode(next);
    try {
      window.localStorage.setItem(BG_MODE_STORAGE_KEY, next);
    } catch {
      // ignore storage failures
    }
  }, []);

  const cycleMode = useCallback(() => {
    setMode(nextBgMode(mode));
  }, [mode, setMode]);

  const value = useMemo(
    () => ({ mode, cycleMode, setMode }),
    [mode, cycleMode, setMode]
  );

  return (
    <BackgroundModeContext.Provider value={value}>
      {children}
    </BackgroundModeContext.Provider>
  );
}

export function useBackgroundMode() {
  const context = useContext(BackgroundModeContext);
  if (!context) {
    throw new Error("useBackgroundMode must be used within BackgroundModeProvider");
  }
  return context;
}
