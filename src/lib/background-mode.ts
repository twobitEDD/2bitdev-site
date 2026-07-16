export const BG_MODES = ["dark", "light", "fracture", "ambient"] as const;

export type BgMode = (typeof BG_MODES)[number];

export const BG_MODE_STORAGE_KEY = "2bitent-bg-mode";

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
    description: "Full-page checker with heavy zoom parallax",
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
