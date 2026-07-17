"use client";

import { usePrefersReducedMotion } from "@chakra-ui/react";
import { usePageVisibility } from "@hooks/usePageVisibility";
import { type BgMode } from "@lib/background-mode";
import { useEffect, useRef, useState } from "react";

import { useBackgroundMode } from "./BackgroundModeProvider";

const ROOT_CLASS = "checker-scroll-root";

const MODE_PARALLAX: Record<
  BgMode,
  { cellWave: number; offsetX: number; offsetY: number; tilt: number }
> = {
  dark: { cellWave: 10, offsetX: 0.08, offsetY: 0.04, tilt: 1.8 },
  light: { cellWave: 9, offsetX: 0.07, offsetY: 0.035, tilt: 1.5 },
  accent: { cellWave: 11, offsetX: 0.09, offsetY: 0.045, tilt: 2 },
  voxel: { cellWave: 12, offsetX: 0.1, offsetY: 0.05, tilt: 2.2 },
};

const MOUSE_LERP = 0.09;
const MAX_TILT_PX = 3.5;
const MAX_RIPPLE_PX = 5;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function lerp(current: number, target: number, factor: number) {
  return current + (target - current) * factor;
}

function getScrollMotionMultiplier(): number {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue("--scroll-motion")
    .trim();
  const parsed = parseFloat(raw);
  return Number.isFinite(parsed) ? clamp(parsed, 0, 1) : 0.36;
}

function getMouseInfluenceMultiplier(): number {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue("--mouse-influence")
    .trim();
  const parsed = parseFloat(raw);
  return Number.isFinite(parsed) ? clamp(parsed, 0, 1) : 0.4;
}

function getBgMode(): BgMode {
  const attr = document.documentElement.getAttribute("data-bg-mode");
  if (attr === "light" || attr === "accent" || attr === "voxel") {
    return attr;
  }
  return "dark";
}

function updateScrollState(mode: BgMode) {
  const root = document.documentElement;
  const scrollY = window.scrollY;
  const viewportHeight = window.innerHeight;
  const scrollHeight = document.documentElement.scrollHeight - viewportHeight;
  const progress = scrollHeight > 0 ? scrollY / scrollHeight : 0;
  const motion = getScrollMotionMultiplier();
  const parallax = MODE_PARALLAX[mode];

  const wave = Math.sin(scrollY * 0.0028);
  const wave2 = Math.cos(scrollY * 0.0019);

  root.style.setProperty(
    "--checker-cell",
    `${64 + wave * parallax.cellWave * motion}px`
  );
  root.style.setProperty(
    "--checker-offset-x",
    `${scrollY * parallax.offsetX * motion + wave2 * (parallax.offsetX * 28 * motion)}px`
  );
  root.style.setProperty(
    "--checker-offset-y",
    `${scrollY * parallax.offsetY * motion + wave * (parallax.offsetY * 32 * motion)}px`
  );
  root.style.setProperty(
    "--checker-tilt",
    `${parallax.tilt * motion + wave2 * (parallax.tilt * 0.35 * motion)}deg`
  );
  root.style.setProperty("--checker-roll", `${wave * 0.8 * motion}deg`);
  root.style.setProperty(
    "--checker-scale",
    `${1 + wave2 * 0.02 * motion + progress * 0.015 * motion}`
  );

  const fadeAmount =
    parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue("--fade-amount").trim()
    ) || 0.22;

  const sections = document.querySelectorAll<HTMLElement>("[data-checker-section]");
  sections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    const sectionMid = rect.top + rect.height * 0.5;
    const viewportMid = viewportHeight * 0.5;
    const distFromCenter = Math.abs(sectionMid - viewportMid);
    const normalizedCenter = clamp(
      1 - distFromCenter / (viewportHeight * 0.65 + rect.height * 0.3),
      0,
      1
    );

    const fadeWindow = 0.16 + fadeAmount * 0.18;
    const topReveal = clamp(1 - rect.top / (viewportHeight * fadeWindow), 0, 1);
    const bottomReveal = clamp(
      1 - (viewportHeight - rect.bottom) / (viewportHeight * fadeWindow),
      0,
      1
    );

    const edgeReveal = clamp(
      Math.max(topReveal, bottomReveal) * 0.55 + (1 - normalizedCenter) * 0.35,
      0,
      1
    );

    section.style.setProperty("--edge-reveal", edgeReveal.toFixed(3));
  });

  const curvePath = document.getElementById("checker-curve-path");
  if (curvePath && (mode === "dark" || mode === "light")) {
    const amplitude = (32 + progress * 42) * motion;
    const yBase = viewportHeight * (0.28 + progress * 0.38);
    const width = window.innerWidth;
    curvePath.setAttribute(
      "d",
      `M -80 ${yBase} C ${width * 0.22} ${yBase - amplitude}, ${width * 0.58} ${
        yBase + amplitude
      }, ${width + 80} ${yBase - amplitude * 0.3}`
    );
  }
}

function applyMouseVars(
  x: number,
  y: number,
  rippleX: number,
  rippleY: number,
  influence: number
) {
  const root = document.documentElement;
  root.style.setProperty("--mouse-x", `${x * 100}%`);
  root.style.setProperty("--mouse-y", `${y * 100}%`);
  root.style.setProperty("--mouse-tilt-x", `${rippleX * influence}px`);
  root.style.setProperty("--mouse-tilt-y", `${rippleY * influence}px`);
  root.style.setProperty(
    "--mouse-ripple-x",
    `${rippleX * influence * 1.6}px`
  );
  root.style.setProperty(
    "--mouse-ripple-y",
    `${rippleY * influence * 1.6}px`
  );
}

export default function CheckerboardScrollBackground() {
  const [mounted, setMounted] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();
  const pageVisible = usePageVisibility();
  const { mode, effects } = useBackgroundMode();
  const mouseRef = useRef({ x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5 });
  const rafRef = useRef(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const reduceMotion = mounted && prefersReducedMotion;

  useEffect(() => {
    document.documentElement.classList.add(ROOT_CLASS);

    let scrollFrame = 0;
    const onScroll = () => {
      if (scrollFrame) {
        return;
      }
      scrollFrame = window.requestAnimationFrame(() => {
        scrollFrame = 0;
        updateScrollState(getBgMode());
      });
    };

    updateScrollState(mode);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      document.documentElement.classList.remove(ROOT_CLASS);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (scrollFrame) {
        window.cancelAnimationFrame(scrollFrame);
      }
    };
  }, [mode, effects.scrollMotion, effects.fadeAmount]);

  useEffect(() => {
    if (!mounted || reduceMotion || !pageVisible) {
      applyMouseVars(0.5, 0.5, 0, 0, 0);
      return;
    }

    const onPointerMove = (event: PointerEvent) => {
      mouseRef.current.targetX = event.clientX / window.innerWidth;
      mouseRef.current.targetY = event.clientY / window.innerHeight;
    };

    const animateMouse = () => {
      if (document.hidden) {
        rafRef.current = 0;
        return;
      }

      const state = mouseRef.current;
      state.x = lerp(state.x, state.targetX, MOUSE_LERP);
      state.y = lerp(state.y, state.targetY, MOUSE_LERP);

      const influence = getMouseInfluenceMultiplier();
      const centerX = state.x - 0.5;
      const centerY = state.y - 0.5;
      const rippleX = centerX * MAX_TILT_PX * 2;
      const rippleY = centerY * MAX_TILT_PX * 2;

      applyMouseVars(state.x, state.y, rippleX, rippleY, influence);

      const checkerLayer = document.querySelector<HTMLElement>(".checker-scroll-layer");
      if (checkerLayer) {
        checkerLayer.style.setProperty(
          "--mouse-bg-offset-x",
          `${centerX * MAX_RIPPLE_PX * influence}px`
        );
        checkerLayer.style.setProperty(
          "--mouse-bg-offset-y",
          `${centerY * MAX_RIPPLE_PX * influence}px`
        );
      }

      rafRef.current = window.requestAnimationFrame(animateMouse);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    rafRef.current = window.requestAnimationFrame(animateMouse);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
      }
      applyMouseVars(0.5, 0.5, 0, 0, 0);
    };
  }, [mounted, reduceMotion, pageVisible, effects.mouseInfluence]);

  const showCurve =
    mounted && !reduceMotion && (mode === "dark" || mode === "light");
  const isVoxel = mode === "voxel";

  return (
    <>
      <div
        className={`checker-scroll-layer${isVoxel ? " checker-scroll-layer--voxel" : ""}`}
        aria-hidden="true"
        style={
          reduceMotion
            ? { backgroundSize: "64px 64px", transform: "none" }
            : undefined
        }
      />

      {mounted && !reduceMotion && (
        <div className="checker-mouse-spotlight" aria-hidden="true" />
      )}

      {showCurve && (
        <svg className="checker-curve-line" aria-hidden="true" preserveAspectRatio="none">
          <defs>
            <pattern
              id="checker-curve-stroke"
              width="24"
              height="24"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(45)"
            >
              <rect width="12" height="12" className="checker-curve-tile-a" />
              <rect x="12" y="12" width="12" height="12" className="checker-curve-tile-a" />
              <rect x="12" width="12" height="12" className="checker-curve-tile-b" />
              <rect y="12" width="12" height="12" className="checker-curve-tile-b" />
            </pattern>
          </defs>
          <path id="checker-curve-path" d="M 0 0" />
        </svg>
      )}
    </>
  );
}
