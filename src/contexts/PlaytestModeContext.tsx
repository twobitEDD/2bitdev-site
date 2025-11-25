"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from "react";

interface PlaytestModeContextType {
  isPlaytestMode: boolean;
  togglePlaytestMode: () => void;
}

const PlaytestModeContext = createContext<PlaytestModeContextType | undefined>(undefined);

export function PlaytestModeProvider({ children }: { children: ReactNode }) {
  const [isPlaytestMode, setIsPlaytestMode] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Load from localStorage on mount (client-side only)
  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("playtestMode");
        if (saved === "true") {
          setIsPlaytestMode(true);
        }
      } catch (error) {
        console.error("Error reading from localStorage:", error);
      }
    }
  }, []);

  // Save to localStorage when changed (client-side only)
  useEffect(() => {
    if (isMounted && typeof window !== "undefined") {
      try {
        localStorage.setItem("playtestMode", isPlaytestMode.toString());
      } catch (error) {
        console.error("Error writing to localStorage:", error);
      }
    }
  }, [isPlaytestMode, isMounted]);

  const togglePlaytestMode = useCallback(() => {
    setIsPlaytestMode((prev) => !prev);
  }, []);

  const value = useMemo(
    () => ({ isPlaytestMode, togglePlaytestMode }),
    [isPlaytestMode, togglePlaytestMode]
  );

  return (
    <PlaytestModeContext.Provider value={value}>
      {children}
    </PlaytestModeContext.Provider>
  );
}

export function usePlaytestMode() {
  const context = useContext(PlaytestModeContext);
  if (context === undefined) {
    throw new Error("usePlaytestMode must be used within a PlaytestModeProvider");
  }
  return context;
}

