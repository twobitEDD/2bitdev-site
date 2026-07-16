"use client";

import {
  BG_EFFECT_SLIDER_GROUPS,
  BG_MODE_META,
  BG_MODES,
  type BgMode,
} from "@lib/background-mode";
import { useCallback, useEffect, useRef, useState } from "react";

import { useBackgroundMode } from "./BackgroundModeProvider";

export default function BackgroundModeToggle() {
  const { mode, effects, setMode, setEffect, resetEffects } = useBackgroundMode();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const meta = BG_MODE_META[mode];

  const closePanel = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) {
      return;
    }
    const onPointerDown = (event: MouseEvent) => {
      if (!panelRef.current?.contains(event.target as Node)) {
        closePanel();
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closePanel();
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, closePanel]);

  return (
    <div className="bg-mode-panel" ref={panelRef}>
      {open && (
        <div className="bg-mode-panel__drawer" role="dialog" aria-label="Background settings">
          <div className="bg-mode-panel__header">
            <span className="bg-mode-panel__title">Background</span>
            <button
              type="button"
              className="bg-mode-panel__reset"
              onClick={resetEffects}
              aria-label="Reset effect sliders to mode defaults"
            >
              Reset
            </button>
          </div>

          <div className="bg-mode-panel__modes" role="group" aria-label="Background mode">
            {BG_MODES.map((modeKey) => {
              const modeMeta = BG_MODE_META[modeKey];
              const isActive = mode === modeKey;
              return (
                <button
                  key={modeKey}
                  type="button"
                  className={`bg-mode-panel__mode${isActive ? " bg-mode-panel__mode--active" : ""}`}
                  onClick={() => setMode(modeKey as BgMode)}
                  aria-pressed={isActive}
                  title={modeMeta.description}
                >
                  <span className="bg-mode-panel__mode-icon" aria-hidden="true">
                    {modeMeta.shortLabel}
                  </span>
                  <span className="bg-mode-panel__mode-label">{modeMeta.label}</span>
                </button>
              );
            })}
          </div>

          <div className="bg-mode-panel__slider-groups">
            {BG_EFFECT_SLIDER_GROUPS.map((group) => (
              <div key={group.group} className="bg-mode-panel__slider-group">
                <span className="bg-mode-panel__group-label">{group.label}</span>
                {group.sliders.map((slider) => (
                  <label key={slider.key} className="bg-mode-panel__slider">
                    <span className="bg-mode-panel__slider-label">{slider.label}</span>
                    <input
                      type="range"
                      min={slider.min}
                      max={slider.max}
                      value={effects[slider.key]}
                      onChange={(event) =>
                        setEffect(slider.key, Number(event.target.value))
                      }
                      className="bg-mode-panel__range"
                      aria-valuemin={slider.min}
                      aria-valuemax={slider.max}
                      aria-valuenow={effects[slider.key]}
                    />
                    <span className="bg-mode-panel__slider-value">
                      {effects[slider.key]}
                    </span>
                  </label>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        type="button"
        className={`bg-mode-toggle${open ? " bg-mode-toggle--open" : ""}`}
        onClick={() => setOpen((prev) => !prev)}
        aria-label={`Background settings: ${meta.label}. ${meta.description}`}
        aria-expanded={open}
        title={meta.description}
      >
        <span className="bg-mode-toggle__icon" aria-hidden="true">
          {meta.shortLabel}
        </span>
        <span className="bg-mode-toggle__label">{meta.label}</span>
      </button>
    </div>
  );
}
