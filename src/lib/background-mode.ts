export const BG_MODES = ["dark", "light", "fracture", "ambient", "glow", "neon"] as const;

export type BgMode = (typeof BG_MODES)[number];

export const BG_MODE_STORAGE_KEY = "2bitent-bg-mode";
export const BG_EFFECTS_STORAGE_KEY = "2bitent-bg-effects";

export type BgEffectSettings = {
  checkerIntensity: number;
  fadeAmount: number;
  colorSaturation: number;
  glowStrength: number;
  scrollMotion: number;
};

export const BG_EFFECT_SLIDERS: {
  key: keyof BgEffectSettings;
  label: string;
  min: number;
  max: number;
}[] = [
  { key: "checkerIntensity", label: "Checker", min: 0, max: 100 },
  { key: "fadeAmount", label: "Fade", min: 0, max: 100 },
  { key: "colorSaturation", label: "Color", min: 0, max: 100 },
  { key: "glowStrength", label: "Glow", min: 0, max: 100 },
  { key: "scrollMotion", label: "Motion", min: 0, max: 100 },
];

export const DEFAULT_EFFECT_SETTINGS: Record<BgMode, BgEffectSettings> = {
  dark: {
    checkerIntensity: 72,
    fadeAmount: 28,
    colorSaturation: 42,
    glowStrength: 22,
    scrollMotion: 58,
  },
  light: {
    checkerIntensity: 68,
    fadeAmount: 24,
    colorSaturation: 38,
    glowStrength: 18,
    scrollMotion: 48,
  },
  fracture: {
    checkerIntensity: 78,
    fadeAmount: 22,
    colorSaturation: 52,
    glowStrength: 28,
    scrollMotion: 42,
  },
  ambient: {
    checkerIntensity: 82,
    fadeAmount: 18,
    colorSaturation: 48,
    glowStrength: 32,
    scrollMotion: 72,
  },
  glow: {
    checkerIntensity: 70,
    fadeAmount: 16,
    colorSaturation: 62,
    glowStrength: 72,
    scrollMotion: 50,
  },
  neon: {
    checkerIntensity: 74,
    fadeAmount: 12,
    colorSaturation: 82,
    glowStrength: 88,
    scrollMotion: 38,
  },
};

export const BG_MODE_META: Record<
  BgMode,
  { label: string; shortLabel: string; description: string }
> = {
  dark: {
    label: "Dark",
    shortLabel: "D",
    description: "Dark-dominant sections with curved checker seam",
  },
  light: {
    label: "Light",
    shortLabel: "L",
    description: "White-dominant sections with inverted checker seam",
  },
  fracture: {
    label: "Fracture",
    shortLabel: "F",
    description: "Diagonal zipper split with checker stripe in the gap",
  },
  ambient: {
    label: "Ambient",
    shortLabel: "A",
    description: "Full-page checker with zoom parallax",
  },
  glow: {
    label: "Glow",
    shortLabel: "G",
    description: "Colored edge glow with cyan and magenta accents",
  },
  neon: {
    label: "Neon",
    shortLabel: "N",
    description: "High-saturation neon accents with strong bloom",
  },
};

export function isBgMode(value: string | null | undefined): value is BgMode {
  return BG_MODES.includes(value as BgMode);
}

export function nextBgMode(current: BgMode): BgMode {
  const index = BG_MODES.indexOf(current);
  return BG_MODES[(index + 1) % BG_MODES.length];
}

export function readStoredBgMode(): BgMode {
  if (typeof window === "undefined") {
    return "dark";
  }
  try {
    const stored = window.localStorage.getItem(BG_MODE_STORAGE_KEY);
    return isBgMode(stored) ? stored : "dark";
  } catch {
    return "dark";
  }
}

function clampEffectValue(value: unknown, fallback: number): number {
  const num = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(num)) {
    return fallback;
  }
  return Math.min(100, Math.max(0, Math.round(num)));
}

export function mergeEffectSettings(
  mode: BgMode,
  partial?: Partial<BgEffectSettings> | null
): BgEffectSettings {
  const defaults = DEFAULT_EFFECT_SETTINGS[mode];
  if (!partial) {
    return { ...defaults };
  }
  return {
    checkerIntensity: clampEffectValue(
      partial.checkerIntensity,
      defaults.checkerIntensity
    ),
    fadeAmount: clampEffectValue(partial.fadeAmount, defaults.fadeAmount),
    colorSaturation: clampEffectValue(
      partial.colorSaturation,
      defaults.colorSaturation
    ),
    glowStrength: clampEffectValue(partial.glowStrength, defaults.glowStrength),
    scrollMotion: clampEffectValue(partial.scrollMotion, defaults.scrollMotion),
  };
}

export function readStoredEffectSettings(mode: BgMode): BgEffectSettings {
  if (typeof window === "undefined") {
    return mergeEffectSettings(mode);
  }
  try {
    const raw = window.localStorage.getItem(BG_EFFECTS_STORAGE_KEY);
    if (!raw) {
      return mergeEffectSettings(mode);
    }
    const parsed = JSON.parse(raw) as {
      mode?: string;
      settings?: Partial<BgEffectSettings>;
    };
    if (parsed.mode === mode && parsed.settings) {
      return mergeEffectSettings(mode, parsed.settings);
    }
    return mergeEffectSettings(mode);
  } catch {
    return mergeEffectSettings(mode);
  }
}

export function effectSettingsToCssVars(settings: BgEffectSettings): Record<string, string> {
  return {
    "--checker-intensity": String(settings.checkerIntensity / 100),
    "--fade-amount": String(settings.fadeAmount / 100),
    "--color-saturation": String(settings.colorSaturation / 100),
    "--glow-strength": String(settings.glowStrength / 100),
    "--scroll-motion": String(settings.scrollMotion / 100),
  };
}
