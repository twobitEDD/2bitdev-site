"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface PlaytestModeContextType {
  isPlaytestMode: boolean;
  togglePlaytestMode: () => void;
}

const PlaytestModeContext = createContext<PlaytestModeContextType | undefined>(undefined);

export function PlaytestModeProvider({ children }: { children: ReactNode }) {
  const [isPlaytestMode, setIsPlaytestMode] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("playtestMode");
    if (saved === "true") {
      setIsPlaytestMode(true);
    }
  }, []);

  // Save to localStorage when changed
  useEffect(() => {
    localStorage.setItem("playtestMode", isPlaytestMode.toString());
  }, [isPlaytestMode]);

  const togglePlaytestMode = () => {
    setIsPlaytestMode((prev) => !prev);
  };

  return (
    <PlaytestModeContext.Provider value={{ isPlaytestMode, togglePlaytestMode }}>
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

