"use client";

import { usePrefersReducedMotion } from "@chakra-ui/react";
import { type BgMode } from "@lib/background-mode";
import { useEffect } from "react";

import { useBackgroundMode } from "./BackgroundModeProvider";

const ROOT_CLASS = "checker-scroll-root";

const MODE_PARALLAX: Record<
  BgMode,
  { cellWave: number; offsetX: number; offsetY: number; scale: number; tilt: number }
> = {
  dark: { cellWave: 18, offsetX: 0.14, offsetY: 0.07, scale: 0.05, tilt: 3 },
  light: { cellWave: 16, offsetX: 0.12, offsetY: 0.06, scale: 0.04, tilt: 2.5 },
  fracture: { cellWave: 12, offsetX: 0.08, offsetY: 0.04, scale: 0.03, tilt: 1.5 },
  ambient: { cellWave: 32, offsetX: 0.28, offsetY: 0.18, scale: 0.14, tilt: 7 },
  glow: { cellWave: 20, offsetX: 0.16, offsetY: 0.09, scale: 0.06, tilt: 3.5 },
  neon: { cellWave: 22, offsetX: 0.18, offsetY: 0.1, scale: 0.07, tilt: 4 },
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getScrollMotionMultiplier(): number {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue("--scroll-motion")
    .trim();
  const parsed = parseFloat(raw);
  return Number.isFinite(parsed) ? clamp(parsed, 0, 1) : 0.6;
}

function getBgMode(): BgMode {
  const attr = document.documentElement.getAttribute("data-bg-mode");
  if (
    attr === "light" ||
    attr === "fracture" ||
    attr === "ambient" ||
    attr === "glow" ||
    attr === "neon"
  ) {
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

  const wave = Math.sin(scrollY * 0.0032);
  const wave2 = Math.cos(scrollY * 0.0022);
  const parallax = MODE_PARALLAX[mode];

  root.style.setProperty(
    "--checker-cell",
    `${64 + wave * parallax.cellWave * motion + progress * (parallax.cellWave * 0.55 * motion)}px`
  );
  root.style.setProperty(
    "--checker-offset-x",
    `${scrollY * parallax.offsetX * motion + wave2 * (parallax.offsetX * 48 * motion)}px`
  );
  root.style.setProperty(
    "--checker-offset-y",
    `${scrollY * parallax.offsetY * motion + wave * (parallax.offsetY * 60 * motion)}px`
  );
  root.style.setProperty("--checker-rotate", `${wave * 1.4 * motion}deg`);
  root.style.setProperty(
    "--checker-tilt",
    `${parallax.tilt * motion + wave2 * (parallax.tilt * 0.5 * motion) + progress * (parallax.tilt * 0.4 * motion)}deg`
  );
  root.style.setProperty("--checker-roll", `${wave * 1.6 * motion}deg`);
  root.style.setProperty(
    "--checker-scale",
    `${1 + wave2 * parallax.scale * motion + progress * (parallax.scale * 0.45 * motion)}`
  );

  const fadeAmount =
    parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue("--fade-amount").trim()
    ) || 0.25;

  const sections = document.querySelectorAll<HTMLElement>("[data-checker-section]");
  sections.forEach((section, index) => {
    const rect = section.getBoundingClientRect();
    const sectionMid = rect.top + rect.height * 0.5;
    const viewportMid = viewportHeight * 0.5;
    const distFromCenter = Math.abs(sectionMid - viewportMid);
    const normalizedCenter = clamp(
      1 - distFromCenter / (viewportHeight * 0.65 + rect.height * 0.3),
      0,
      1
    );

    const fadeWindow = 0.18 + fadeAmount * 0.22;
    const topReveal = clamp(1 - rect.top / (viewportHeight * fadeWindow), 0, 1);
    const bottomReveal = clamp(
      1 - (viewportHeight - rect.bottom) / (viewportHeight * fadeWindow),
      0,
      1
    );

    let edgeReveal = clamp(
      Math.max(topReveal, bottomReveal) * 0.55 + (1 - normalizedCenter) * 0.35,
      0,
      1
    );

    if (mode === "ambient" || mode === "glow" || mode === "neon") {
      edgeReveal = clamp(0.78 + (1 - normalizedCenter) * 0.18, 0.72, 1);
    }

    if (mode === "fracture") {
      edgeReveal = clamp(0.62 + (1 - normalizedCenter) * 0.38, 0.58, 1);
      const fractureAngle = index % 2 === 0 ? -2.5 : 2.5;
      section.style.setProperty("--fracture-angle", `${fractureAngle}deg`);
      section.style.setProperty(
        "--fracture-offset",
        `${Math.sin(scrollY * 0.0025 + index) * 8 * motion}px`
      );
    }

    section.style.setProperty("--edge-reveal", edgeReveal.toFixed(3));

    const localCell = 52 + edgeReveal * 90 + (1 - normalizedCenter) * 24;
    section.style.setProperty("--checker-cell-local", `${localCell}px`);
  });

  const curvePath = document.getElementById("checker-curve-path");
  if (curvePath && (mode === "dark" || mode === "light")) {
    const amplitude = (50 + progress * 70) * motion;
    const yBase = viewportHeight * (0.25 + progress * 0.45);
    const width = window.innerWidth;
    curvePath.setAttribute(
      "d",
      `M -80 ${yBase} C ${width * 0.2} ${yBase - amplitude}, ${width * 0.55} ${
        yBase + amplitude
      }, ${width + 80} ${yBase - amplitude * 0.35}`
    );
  }

  const fractureStripes = document.querySelectorAll<SVGPathElement>(
    "[data-checker-fracture-stripe]"
  );
  fractureStripes.forEach((stripe, index) => {
    const section = sections[index];
    if (!section) {
      return;
    }
    const rect = section.getBoundingClientRect();
    const y = rect.bottom;
    const width = window.innerWidth;
    const skew = index % 2 === 0 ? -1 : 1;
    stripe.setAttribute(
      "d",
      `M -40 ${y} L ${width + 40} ${y + skew * 28}`
    );
  });
}

export default function CheckerboardScrollBackground() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const { mode, effects } = useBackgroundMode();

  useEffect(() => {
    document.documentElement.classList.add(ROOT_CLASS);

    let frame = 0;
    const onScroll = () => {
      if (frame) {
        return;
      }
      frame = window.requestAnimationFrame(() => {
        frame = 0;
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
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, [mode, effects.scrollMotion]);

  const showCurve = !prefersReducedMotion && (mode === "dark" || mode === "light");
  const showFracture = !prefersReducedMotion && mode === "fracture";
  const isAmbient = mode === "ambient";
  const isGlowMode = mode === "glow" || mode === "neon";

  return (
    <>
      <div
        className={`checker-scroll-layer${isAmbient ? " checker-scroll-layer--ambient" : ""}${isGlowMode ? " checker-scroll-layer--glow" : ""}`}
        aria-hidden="true"
        style={
          prefersReducedMotion
            ? { backgroundSize: "64px 64px", transform: "none" }
            : undefined
        }
      />

      {isGlowMode && (
        <div className="checker-glow-ambient" aria-hidden="true" />
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

      {showFracture && (
        <svg className="checker-fracture-lines" aria-hidden="true" preserveAspectRatio="none">
          <defs>
            <pattern
              id="checker-fracture-stroke"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(45)"
            >
              <rect width="10" height="10" className="checker-curve-tile-a" />
              <rect x="10" y="10" width="10" height="10" className="checker-curve-tile-a" />
              <rect x="10" width="10" height="10" className="checker-curve-tile-b" />
              <rect y="10" width="10" height="10" className="checker-curve-tile-b" />
            </pattern>
          </defs>
          {Array.from({ length: 5 }).map((_, index) => (
            <path
              key={index}
              data-checker-fracture-stripe=""
              stroke="url(#checker-fracture-stroke)"
              fill="none"
            />
          ))}
        </svg>
      )}
    </>
  );
}
