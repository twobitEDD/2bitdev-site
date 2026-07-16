export const BG_MODES = ["dark", "light", "fracture", "ambient", "glow", "neon"] as const;

export type BgMode = (typeof BG_MODES)[number];

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
  dark: { ...baseDefaults },
  light: {
    ...baseDefaults,
    checkerIntensity: 68,
    fadeAmount: 24,
    colorSaturation: 38,
    glowStrength: 18,
    scrollMotion: 48,
    backgroundSpeed: 48,
    vignetteStrength: 32,
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
  ambient: {
    ...baseDefaults,
    checkerIntensity: 82,
    fadeAmount: 18,
    colorSaturation: 48,
    glowStrength: 32,
    scrollMotion: 72,
    backgroundSpeed: 72,
    checkerCellSize: 62,
    vignetteStrength: 28,
  },
  glow: {
    ...baseDefaults,
    checkerIntensity: 70,
    fadeAmount: 16,
    colorSaturation: 62,
    glowStrength: 72,
    scrollMotion: 50,
    backgroundSpeed: 52,
    vignetteStrength: 30,
  },
  neon: {
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
    if (parsed.mode === mode && parsed.settings) {
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
