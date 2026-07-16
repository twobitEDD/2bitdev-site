"use client";

import {
  BG_EFFECTS_STORAGE_KEY,
  BG_MODE_STORAGE_KEY,
  DEFAULT_EFFECT_SETTINGS,
  type BgEffectSettings,
  type BgMode,
  effectSettingsToCssVars,
  mergeEffectSettings,
  nextBgMode,
  readStoredBgMode,
  readStoredEffectSettings,
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
  effects: BgEffectSettings;
  cycleMode: () => void;
  setMode: (mode: BgMode) => void;
  setEffect: <K extends keyof BgEffectSettings>(
    key: K,
    value: BgEffectSettings[K]
  ) => void;
  resetEffects: () => void;
};

const BackgroundModeContext = createContext<BackgroundModeContextValue | null>(
  null
);

function applyBgMode(mode: BgMode) {
  document.documentElement.setAttribute("data-bg-mode", mode);
}

function applyEffectSettings(mode: BgMode, settings: BgEffectSettings) {
  const root = document.documentElement;
  const vars = effectSettingsToCssVars(mode, settings);
  Object.entries(vars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
}

function persistEffects(mode: BgMode, settings: BgEffectSettings) {
  try {
    window.localStorage.setItem(
      BG_EFFECTS_STORAGE_KEY,
      JSON.stringify({ mode, settings })
    );
  } catch {
    // ignore storage failures
  }
}

export function BackgroundModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<BgMode>("garden");
  const [effects, setEffectsState] = useState<BgEffectSettings>(
    DEFAULT_EFFECT_SETTINGS.garden
  );

  useEffect(() => {
    const storedMode = readStoredBgMode();
    const storedEffects = readStoredEffectSettings(storedMode);
    setModeState(storedMode);
    setEffectsState(storedEffects);
    applyBgMode(storedMode);
    applyEffectSettings(storedMode, storedEffects);
  }, []);

  const setMode = useCallback((next: BgMode) => {
    const nextEffects = readStoredEffectSettings(next);
    setModeState(next);
    setEffectsState(nextEffects);
    applyBgMode(next);
    applyEffectSettings(next, nextEffects);
    try {
      window.localStorage.setItem(BG_MODE_STORAGE_KEY, next);
    } catch {
      // ignore storage failures
    }
    persistEffects(next, nextEffects);
  }, []);

  const setEffect = useCallback(
    <K extends keyof BgEffectSettings>(key: K, value: BgEffectSettings[K]) => {
      setEffectsState((prev) => {
        const next = mergeEffectSettings(mode, { ...prev, [key]: value });
        applyEffectSettings(mode, next);
        persistEffects(mode, next);
        return next;
      });
    },
    [mode]
  );

  const resetEffects = useCallback(() => {
    const defaults = mergeEffectSettings(mode);
    setEffectsState(defaults);
    applyEffectSettings(mode, defaults);
    persistEffects(mode, defaults);
  }, [mode]);

  const cycleMode = useCallback(() => {
    setMode(nextBgMode(mode));
  }, [mode, setMode]);

  const value = useMemo(
    () => ({ mode, effects, cycleMode, setMode, setEffect, resetEffects }),
    [mode, effects, cycleMode, setMode, setEffect, resetEffects]
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
