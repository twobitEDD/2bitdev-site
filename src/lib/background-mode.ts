export const BG_MODES = ["garden", "twilight", "midnight"] as const;

export type BgMode = (typeof BG_MODES)[number];

/** Legacy modes — map to nearest fairy palette on read. */
const LEGACY_MODE_MAP: Record<string, BgMode> = {
  tessellation: "garden",
  warp: "twilight",
  "impossible-grid": "midnight",
  birds: "garden",
  voxel: "garden",
  "ent-mono": "midnight",
  "studio-neon": "twilight",
  bloom: "twilight",
  slate: "midnight",
  fracture: "twilight",
  dark: "midnight",
  light: "garden",
  ambient: "garden",
  glow: "twilight",
  neon: "twilight",
};

export const BG_MODE_STORAGE_KEY = "2bitent-bg-mode";
export const BG_EFFECTS_STORAGE_KEY = "2bitent-bg-effects";

export type BgEffectSettings = {
  fairyCount: number;
  danceSpeed: number;
  freezeOnHover: number;
};

export const BG_EFFECT_SLIDERS: {
  key: keyof BgEffectSettings;
  label: string;
  min: number;
  max: number;
}[] = [
  { key: "fairyCount", label: "Fairies", min: 0, max: 100 },
  { key: "danceSpeed", label: "Dance", min: 0, max: 100 },
];

export const baseDefaults = {
  fairyCount: 55,
  danceSpeed: 45,
  freezeOnHover: 100,
} satisfies BgEffectSettings;

export const DEFAULT_EFFECT_SETTINGS: Record<BgMode, BgEffectSettings> = {
  garden: { ...baseDefaults, fairyCount: 50, danceSpeed: 50 },
  twilight: { ...baseDefaults, fairyCount: 55, danceSpeed: 42 },
  midnight: { ...baseDefaults, fairyCount: 48, danceSpeed: 38 },
};

export const BG_MODE_META: Record<
  BgMode,
  { label: string; shortLabel: string; description: string }
> = {
  garden: {
    label: "Garden",
    shortLabel: "G",
    description: "Bright cream meadow with colorful pixel fairies",
  },
  twilight: {
    label: "Twilight",
    shortLabel: "T",
    description: "Soft lavender dusk with gentle fairy glow",
  },
  midnight: {
    label: "Midnight",
    shortLabel: "M",
    description: "Dark studio sky with vivid fairy sparkles",
  },
};

export type FairyPalette = {
  bgTop: string;
  bgBottom: string;
  fairyColors: string[];
  sparkle: string;
  themeAccent: string;
  sectionFrameAccent: string;
  sectionFrameGlow: string;
};

export const PRESET_PALETTES: Record<BgMode, FairyPalette> = {
  garden: {
    bgTop: "#f5f0e8",
    bgBottom: "#e8dff5",
    fairyColors: ["#ff6eb4", "#22d3ee", "#fde047", "#a3e635", "#c4b5fd"],
    sparkle: "rgba(255, 255, 255, 0.55)",
    themeAccent: "#ff6eb4",
    sectionFrameAccent: "rgba(255, 110, 180, 0.32)",
    sectionFrameGlow: "rgba(34, 211, 238, 0.18)",
  },
  twilight: {
    bgTop: "#3d3558",
    bgBottom: "#2a2438",
    fairyColors: ["#f0abfc", "#67e8f9", "#fcd34d", "#86efac", "#c4b5fd"],
    sparkle: "rgba(255, 255, 255, 0.35)",
    themeAccent: "#c4b5fd",
    sectionFrameAccent: "rgba(196, 181, 253, 0.35)",
    sectionFrameGlow: "rgba(240, 171, 252, 0.16)",
  },
  midnight: {
    bgTop: "#12121a",
    bgBottom: "#0a0a10",
    fairyColors: ["#f472b6", "#22d3ee", "#facc15", "#84cc16", "#a78bfa"],
    sparkle: "rgba(255, 255, 255, 0.4)",
    themeAccent: "#22d3ee",
    sectionFrameAccent: "rgba(34, 211, 238, 0.32)",
    sectionFrameGlow: "rgba(244, 114, 182, 0.2)",
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
  return "garden";
}

export function nextBgMode(current: BgMode): BgMode {
  const index = BG_MODES.indexOf(current);
  return BG_MODES[(index + 1) % BG_MODES.length];
}

export function readStoredBgMode(): BgMode {
  if (typeof window === "undefined") {
    return "garden";
  }
  try {
    const stored = window.localStorage.getItem(BG_MODE_STORAGE_KEY);
    return resolveBgMode(stored);
  } catch {
    return "garden";
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
  const merged = { ...defaults };
  (Object.keys(defaults) as (keyof BgEffectSettings)[]).forEach((key) => {
    merged[key] = clampEffectValue(partial[key], defaults[key]);
  });
  return merged;
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

/** Map slider 0–100 to fairy count 15–40 */
export function fairyCountFromSlider(value: number): number {
  return Math.round(15 + (value / 100) * 25);
}

/** Map slider 0–100 to dance speed multiplier 0.3–1.6 */
export function danceSpeedFromSlider(value: number): number {
  return 0.3 + (value / 100) * 1.3;
}

export function freezeOnHoverEnabled(value: number): boolean {
  return value >= 50;
}

export function effectSettingsToCssVars(
  mode: BgMode,
  settings: BgEffectSettings
): Record<string, string> {
  const palette = PRESET_PALETTES[mode];
  return {
    "--fairy-bg-top": palette.bgTop,
    "--fairy-bg-bottom": palette.bgBottom,
    "--theme-accent": palette.themeAccent,
    "--section-frame-accent": palette.sectionFrameAccent,
    "--section-frame-glow": palette.sectionFrameGlow,
    "--glow-strength": String(0.15 + (settings.danceSpeed / 100) * 0.25),
  };
}
