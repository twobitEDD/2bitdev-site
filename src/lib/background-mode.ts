export const BG_MODES = [
  "voxel",
  "ent-mono",
  "studio-neon",
  "bloom",
  "slate",
  "fracture",
] as const;

export type BgMode = (typeof BG_MODES)[number];

/** Legacy modes from earlier builds — map to nearest new theme on read. */
const LEGACY_MODE_MAP: Record<string, BgMode> = {
  dark: "ent-mono",
  light: "ent-mono",
  ambient: "voxel",
  glow: "studio-neon",
  neon: "studio-neon",
};

export const BG_MODE_STORAGE_KEY = "2bitent-bg-mode";
export const BG_EFFECTS_STORAGE_KEY = "2bitent-bg-effects";

export type BgEffectSettings = {
  checkerIntensity: number;
  checkerCellSize: number;
  checkerRotation: number;
  seamIntensity: number;
  fractureAngle: number;
  vignetteStrength: number;
  fadeAmount: number;
  colorSaturation: number;
  glowStrength: number;
  hueShift: number;
  scrollMotion: number;
  backgroundSpeed: number;
};

export type BgEffectSliderGroup = "background" | "motion" | "color";

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
    group: "background",
    label: "Background",
    sliders: [
      { key: "checkerIntensity", label: "Checker", min: 0, max: 100 },
      { key: "checkerCellSize", label: "Cell Size", min: 0, max: 100 },
      { key: "checkerRotation", label: "Rotation", min: 0, max: 100 },
      { key: "seamIntensity", label: "Seam", min: 0, max: 100 },
      { key: "fractureAngle", label: "Fracture", min: 0, max: 100 },
      { key: "vignetteStrength", label: "Vignette", min: 0, max: 100 },
      { key: "fadeAmount", label: "Fade", min: 0, max: 100 },
    ],
  },
  {
    group: "motion",
    label: "Motion",
    sliders: [
      { key: "scrollMotion", label: "Motion", min: 0, max: 100 },
      { key: "backgroundSpeed", label: "Speed", min: 0, max: 100 },
    ],
  },
  {
    group: "color",
    label: "Color",
    sliders: [
      { key: "colorSaturation", label: "Color", min: 0, max: 100 },
      { key: "glowStrength", label: "Glow", min: 0, max: 100 },
      { key: "hueShift", label: "Hue", min: 0, max: 100 },
    ],
  },
];

/** @deprecated Use BG_EFFECT_SLIDER_GROUPS */
export const BG_EFFECT_SLIDERS = BG_EFFECT_SLIDER_GROUPS.flatMap((g) => g.sliders);

const baseDefaults = {
  checkerIntensity: 72,
  checkerCellSize: 50,
  checkerRotation: 42,
  seamIntensity: 58,
  fractureAngle: 50,
  vignetteStrength: 38,
  fadeAmount: 28,
  colorSaturation: 42,
  glowStrength: 22,
  hueShift: 0,
  scrollMotion: 58,
  backgroundSpeed: 55,
} satisfies BgEffectSettings;

export const DEFAULT_EFFECT_SETTINGS: Record<BgMode, BgEffectSettings> = {
  voxel: {
    ...baseDefaults,
    checkerIntensity: 80,
    checkerCellSize: 58,
    fadeAmount: 20,
    colorSaturation: 55,
    glowStrength: 26,
    scrollMotion: 68,
    backgroundSpeed: 62,
    vignetteStrength: 32,
  },
  "ent-mono": { ...baseDefaults },
  "studio-neon": {
    ...baseDefaults,
    checkerIntensity: 74,
    fadeAmount: 12,
    colorSaturation: 82,
    glowStrength: 88,
    scrollMotion: 38,
    backgroundSpeed: 48,
    hueShift: 18,
    vignetteStrength: 24,
  },
  bloom: {
    ...baseDefaults,
    checkerIntensity: 76,
    fadeAmount: 18,
    colorSaturation: 68,
    glowStrength: 48,
    scrollMotion: 62,
    backgroundSpeed: 58,
    checkerCellSize: 56,
    vignetteStrength: 30,
  },
  slate: {
    ...baseDefaults,
    checkerIntensity: 64,
    fadeAmount: 26,
    colorSaturation: 32,
    glowStrength: 16,
    scrollMotion: 44,
    backgroundSpeed: 46,
    vignetteStrength: 42,
    seamIntensity: 48,
  },
  fracture: {
    ...baseDefaults,
    checkerIntensity: 78,
    fadeAmount: 22,
    colorSaturation: 52,
    glowStrength: 28,
    scrollMotion: 42,
    backgroundSpeed: 45,
    fractureAngle: 68,
    seamIntensity: 35,
  },
};

export const BG_MODE_META: Record<
  BgMode,
  { label: string; shortLabel: string; description: string }
> = {
  voxel: {
    label: "Voxel",
    shortLabel: "V",
    description: "Logo-faithful isometric sage and cream cubes on purple-grey",
  },
  "ent-mono": {
    label: "ENT Mono",
    shortLabel: "M",
    description: "Classic black-and-white checker with curved seam",
  },
  "studio-neon": {
    label: "Studio Neon",
    shortLabel: "N",
    description: "Magenta and cyan glow on deep black",
  },
  bloom: {
    label: "Marketing Bloom",
    shortLabel: "B",
    description: "Warm amber and rose tones for brand-forward work",
  },
  slate: {
    label: "Enterprise Slate",
    shortLabel: "S",
    description: "Cool grey and subtle blue for software and consulting",
  },
  fracture: {
    label: "Fracture Zipper",
    shortLabel: "F",
    description: "Diagonal zipper split with voxel-edge checker stripes",
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
  return "voxel";
}

export function nextBgMode(current: BgMode): BgMode {
  const index = BG_MODES.indexOf(current);
  return BG_MODES[(index + 1) % BG_MODES.length];
}

export function readStoredBgMode(): BgMode {
  if (typeof window === "undefined") {
    return "voxel";
  }
  try {
    const stored = window.localStorage.getItem(BG_MODE_STORAGE_KEY);
    return resolveBgMode(stored);
  } catch {
    return "voxel";
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

export function effectSettingsToCssVars(settings: BgEffectSettings): Record<string, string> {
  const cellBase = 40 + (settings.checkerCellSize / 100) * 88;
  const rotation = (settings.checkerRotation / 100) * 8;
  const fractureDeg = -5 + (settings.fractureAngle / 100) * 10;
  const speed = 0.25 + (settings.backgroundSpeed / 100) * 1.75;

  return {
    "--checker-intensity": String(settings.checkerIntensity / 100),
    "--checker-cell-base": `${cellBase}px`,
    "--checker-rotation-amount": `${rotation}deg`,
    "--seam-intensity": String(settings.seamIntensity / 100),
    "--fracture-angle-amount": `${fractureDeg}deg`,
    "--vignette-strength": String(settings.vignetteStrength / 100),
    "--fade-amount": String(settings.fadeAmount / 100),
    "--color-saturation": String(settings.colorSaturation / 100),
    "--glow-strength": String(settings.glowStrength / 100),
    "--hue-shift": `${(settings.hueShift / 100) * 360}deg`,
    "--scroll-motion": String(settings.scrollMotion / 100),
    "--background-speed": String(speed),
  };
}
