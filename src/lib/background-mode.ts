export const BG_MODES = [
  "tessellation",
  "warp",
  "impossible-grid",
  "birds",
] as const;

export type BgMode = (typeof BG_MODES)[number];

/** Legacy modes from checker era — map to nearest attractor preset on read. */
const LEGACY_MODE_MAP: Record<string, BgMode> = {
  voxel: "tessellation",
  "ent-mono": "impossible-grid",
  "studio-neon": "birds",
  bloom: "warp",
  slate: "impossible-grid",
  fracture: "warp",
  dark: "impossible-grid",
  light: "tessellation",
  ambient: "tessellation",
  glow: "birds",
  neon: "birds",
};

export const BG_MODE_STORAGE_KEY = "2bitent-bg-mode";
export const BG_EFFECTS_STORAGE_KEY = "2bitent-bg-effects";

export type BgEffectSettings = {
  attractorCount: number;
  magneticStrength: number;
  driftSpeed: number;
  contrast: number;
  accentHue: number;
  scrollMotion: number;
  layerDepth: number;
  pulseIntensity: number;
};

export type BgEffectSliderGroup = "attractors" | "visual" | "motion";

export const BG_EFFECT_SLIDER_GROUPS: {
  group: BgEffectSliderGroup;
  label: string;
  sliders: {
    key: keyof BgEffectSettings;
    label: string;
    min: number;
    max: number;
  }[];
}[] = [
  {
    group: "attractors",
    label: "Attractors",
    sliders: [
      { key: "attractorCount", label: "Count", min: 0, max: 100 },
      { key: "magneticStrength", label: "Strength", min: 0, max: 100 },
      { key: "pulseIntensity", label: "Pulse", min: 0, max: 100 },
    ],
  },
  {
    group: "visual",
    label: "Visual",
    sliders: [
      { key: "contrast", label: "Contrast", min: 0, max: 100 },
      { key: "accentHue", label: "Accent", min: 0, max: 100 },
      { key: "layerDepth", label: "Depth", min: 0, max: 100 },
    ],
  },
  {
    group: "motion",
    label: "Motion",
    sliders: [
      { key: "driftSpeed", label: "Drift", min: 0, max: 100 },
      { key: "scrollMotion", label: "Scroll", min: 0, max: 100 },
    ],
  },
];

/** @deprecated Use BG_EFFECT_SLIDER_GROUPS */
export const BG_EFFECT_SLIDERS = BG_EFFECT_SLIDER_GROUPS.flatMap((g) => g.sliders);

const baseDefaults = {
  attractorCount: 55,
  magneticStrength: 62,
  driftSpeed: 42,
  contrast: 58,
  accentHue: 50,
  scrollMotion: 55,
  layerDepth: 48,
  pulseIntensity: 38,
} satisfies BgEffectSettings;

export const DEFAULT_EFFECT_SETTINGS: Record<BgMode, BgEffectSettings> = {
  tessellation: {
    ...baseDefaults,
    attractorCount: 50,
    magneticStrength: 58,
    contrast: 52,
    accentHue: 42,
    layerDepth: 55,
  },
  warp: {
    ...baseDefaults,
    attractorCount: 62,
    magneticStrength: 72,
    driftSpeed: 48,
    contrast: 64,
    accentHue: 58,
    pulseIntensity: 45,
  },
  "impossible-grid": {
    ...baseDefaults,
    attractorCount: 45,
    magneticStrength: 48,
    driftSpeed: 35,
    contrast: 72,
    accentHue: 0,
    layerDepth: 38,
    pulseIntensity: 28,
  },
  birds: {
    ...baseDefaults,
    attractorCount: 58,
    magneticStrength: 65,
    driftSpeed: 52,
    contrast: 55,
    accentHue: 78,
    pulseIntensity: 52,
    layerDepth: 62,
  },
};

export const BG_MODE_META: Record<
  BgMode,
  { label: string; shortLabel: string; description: string }
> = {
  tessellation: {
    label: "Tessellation",
    shortLabel: "T",
    description: "Hexagonal Escher tiles warped by magnetic attractors",
  },
  warp: {
    label: "Warp",
    shortLabel: "W",
    description: "Morphing grid lines pulled through impossible curvature",
  },
  "impossible-grid": {
    label: "Impossible Grid",
    shortLabel: "G",
    description: "Penrose-style stair grids with depth inversions",
  },
  birds: {
    label: "Birds",
    shortLabel: "B",
    description: "Interlocking bird-fish motifs that flip inside-out",
  },
};

export type AttractorPalette = {
  bg: string;
  tileA: string;
  tileB: string;
  line: string;
  accent: string;
};

export const PRESET_PALETTES: Record<BgMode, AttractorPalette> = {
  tessellation: {
    bg: "#0d0d12",
    tileA: "#1a1a24",
    tileB: "#e8e4dc",
    line: "#3d3850",
    accent: "#9cb89a",
  },
  warp: {
    bg: "#080810",
    tileA: "#12121c",
    tileB: "#d4d0c8",
    line: "#252535",
    accent: "#60a5fa",
  },
  "impossible-grid": {
    bg: "#0a0a0a",
    tileA: "#141414",
    tileB: "#f0f0f0",
    line: "#2a2a2a",
    accent: "#a3a3a3",
  },
  birds: {
    bg: "#0c0c14",
    tileA: "#161622",
    tileB: "#e0dcd4",
    line: "#2d2d42",
    accent: "#e879f9",
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
  return "tessellation";
}

export function nextBgMode(current: BgMode): BgMode {
  const index = BG_MODES.indexOf(current);
  return BG_MODES[(index + 1) % BG_MODES.length];
}

export function readStoredBgMode(): BgMode {
  if (typeof window === "undefined") {
    return "tessellation";
  }
  try {
    const stored = window.localStorage.getItem(BG_MODE_STORAGE_KEY);
    return resolveBgMode(stored);
  } catch {
    return "tessellation";
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

/** Map slider 0–100 to attractor count 3–8 */
export function attractorCountFromSlider(value: number): number {
  return Math.round(3 + (value / 100) * 5);
}

export function effectSettingsToCssVars(
  mode: BgMode,
  settings: BgEffectSettings
): Record<string, string> {
  const hue = (settings.accentHue / 100) * 360;
  return {
    "--attractor-strength": String(settings.magneticStrength / 100),
    "--attractor-drift": String(settings.driftSpeed / 100),
    "--attractor-contrast": String(settings.contrast / 100),
    "--attractor-scroll": String(settings.scrollMotion / 100),
    "--attractor-depth": String(settings.layerDepth / 100),
    "--attractor-pulse": String(settings.pulseIntensity / 100),
    "--accent-hue": `${hue}deg`,
    "--glow-strength": String(0.12 + (settings.contrast / 100) * 0.35),
    "--theme-accent": PRESET_PALETTES[mode].accent,
    "--escher-bg": PRESET_PALETTES[mode].bg,
  };
}
