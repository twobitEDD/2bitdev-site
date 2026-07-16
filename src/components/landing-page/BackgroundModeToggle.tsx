"use client";

import { BG_MODE_META } from "@lib/background-mode";

import { useBackgroundMode } from "./BackgroundModeProvider";

export default function BackgroundModeToggle() {
  const { mode, cycleMode } = useBackgroundMode();
  const meta = BG_MODE_META[mode];

  return (
    <button
      type="button"
      className="bg-mode-toggle"
      onClick={cycleMode}
      aria-label={`Background mode: ${meta.label}. ${meta.description}. Click to cycle.`}
      title={meta.description}
    >
      <span className="bg-mode-toggle__icon" aria-hidden="true">
        {meta.shortLabel}
      </span>
      <span className="bg-mode-toggle__label">{meta.label}</span>
    </button>
  );
}
