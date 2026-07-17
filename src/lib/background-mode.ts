export const BG_MODES = ["dark", "light", "accent", "voxel"] as const;

export type BgMode = (typeof BG_MODES)[number];

/** Legacy modes — map to nearest checker palette on read. */
const LEGACY_MODE_MAP: Record<string, BgMode> = {
  garden: "light",
  twilight: "accent",
  midnight: "dark",
  tessellation: "accent",
  warp: "accent",
  "impossible-grid": "dark",
  birds: "light",
  "ent-mono": "dark",
  "studio-neon": "accent",
  bloom: "accent",
  slate: "dark",
  fracture: "dark",
  ambient: "voxel",
  glow: "accent",
  neon: "accent",
};

export const BG_MODE_STORAGE_KEY = "2bitent-bg-mode";
export const BG_EFFECTS_STORAGE_KEY = "2bitent-bg-effects";

export type BgEffectSettings = {
  checkerIntensity: number;
  fadeAmount: number;
  scrollMotion: number;
  mouseInfluence: number;
};

export const BG_EFFECT_SLIDERS: {
  key: keyof BgEffectSettings;
  label: string;
  min: number;
  max: number;
}[] = [
  { key: "checkerIntensity", label: "Checker", min: 0, max: 100 },
  { key: "fadeAmount", label: "Fade", min: 0, max: 100 },
  { key: "scrollMotion", label: "Motion", min: 0, max: 100 },
  { key: "mouseInfluence", label: "Mouse", min: 0, max: 100 },
];

/** Minimal effect values — used as light-mode baseline. */
export const MINIMAL_EFFECT_SETTINGS: BgEffectSettings = {
  checkerIntensity: 12,
  fadeAmount: 8,
  scrollMotion: 8,
  mouseInfluence: 8,
};

export const DEFAULT_EFFECT_SETTINGS: Record<BgMode, BgEffectSettings> = {
  dark: {
    checkerIntensity: 68,
    fadeAmount: 22,
    scrollMotion: 36,
    mouseInfluence: 40,
  },
  light: { ...MINIMAL_EFFECT_SETTINGS },
  accent: {
    checkerIntensity: 70,
    fadeAmount: 18,
    scrollMotion: 34,
    mouseInfluence: 42,
  },
  voxel: {
    checkerIntensity: 72,
    fadeAmount: 18,
    scrollMotion: 38,
    mouseInfluence: 38,
  },
};

export const BG_MODE_META: Record<
  BgMode,
  { label: string; shortLabel: string; description: string }
> = {
  dark: {
    label: "Dark",
    shortLabel: "D",
    description: "Black-dominant checker with a soft curved seam",
  },
  light: {
    label: "Light",
    shortLabel: "L",
    description: "White-dominant checker with inverted seam",
  },
  accent: {
    label: "Accent",
    shortLabel: "A",
    description: "B&W checker with subtle cyan and magenta tint",
  },
  voxel: {
    label: "Voxel",
    shortLabel: "V",
    description: "Logo sage and cream cubes on purple-grey",
  },
};

export function isBgMode(value: string | null | undefined): value is BgMode {
  return BG_MODES.includes(value as BgMode);
}

export function resolveBgMode(value: string | null | undefined): BgMode {
  if (isBgMode(value)) {
    return value;
  }
  if (value && value in LEGACY_MODE_MAP) {
    return LEGACY_MODE_MAP[value];
  }
  return "light";
}

export function nextBgMode(current: BgMode): BgMode {
  const index = BG_MODES.indexOf(current);
  return BG_MODES[(index + 1) % BG_MODES.length];
}

export function readStoredBgMode(): BgMode {
  if (typeof window === "undefined") {
    return "light";
  }
  try {
    const stored = window.localStorage.getItem(BG_MODE_STORAGE_KEY);
    return resolveBgMode(stored);
  } catch {
    return "light";
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
    scrollMotion: clampEffectValue(partial.scrollMotion, defaults.scrollMotion),
    mouseInfluence: clampEffectValue(
      partial.mouseInfluence,
      defaults.mouseInfluence
    ),
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
    const storedMode = resolveBgMode(parsed.mode);
    if (storedMode === mode && parsed.settings) {
      return mergeEffectSettings(mode, parsed.settings);
    }
    return mergeEffectSettings(mode);
  } catch {
    return mergeEffectSettings(mode);
  }
}

export function effectSettingsToCssVars(
  settings: BgEffectSettings
): Record<string, string> {
  return {
    "--checker-intensity": String(settings.checkerIntensity / 100),
    "--fade-amount": String(settings.fadeAmount / 100),
    "--scroll-motion": String(settings.scrollMotion / 100),
    "--mouse-influence": String(settings.mouseInfluence / 100),
  };
}
