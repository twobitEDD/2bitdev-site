"use client";

import { usePrefersReducedMotion } from "@chakra-ui/react";
import { resolveBgMode, type BgMode } from "@lib/background-mode";
import { useEffect } from "react";

import { useBackgroundMode } from "./BackgroundModeProvider";

const ROOT_CLASS = "checker-scroll-root";

const MODE_PARALLAX: Record<
  BgMode,
  { cellWave: number; offsetX: number; offsetY: number; scale: number; tilt: number }
> = {
  voxel: { cellWave: 32, offsetX: 0.28, offsetY: 0.18, scale: 0.14, tilt: 7 },
  "ent-mono": { cellWave: 18, offsetX: 0.14, offsetY: 0.07, scale: 0.05, tilt: 3 },
  "studio-neon": { cellWave: 22, offsetX: 0.18, offsetY: 0.1, scale: 0.07, tilt: 4 },
  bloom: { cellWave: 26, offsetX: 0.22, offsetY: 0.14, scale: 0.1, tilt: 5 },
  slate: { cellWave: 16, offsetX: 0.12, offsetY: 0.06, scale: 0.04, tilt: 2.5 },
  fracture: { cellWave: 12, offsetX: 0.08, offsetY: 0.04, scale: 0.03, tilt: 1.5 },
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getCssVar(name: string, fallback: number): number {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  const parsed = parseFloat(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function getScrollMotionMultiplier(): number {
  return clamp(getCssVar("--scroll-motion", 0.6), 0, 1);
}

function getBackgroundSpeedMultiplier(): number {
  return clamp(getCssVar("--background-speed", 1), 0.1, 2.5);
}

function getCheckerCellBase(): number {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue("--checker-cell-base")
    .trim();
  const parsed = parseFloat(raw);
  return Number.isFinite(parsed) ? parsed : 72;
}

function getRotationAmount(): number {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue("--checker-rotation-amount")
    .trim();
  const parsed = parseFloat(raw);
  return Number.isFinite(parsed) ? parsed : 3;
}

function getFractureAngleAmount(): number {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue("--fracture-angle-amount")
    .trim();
  const parsed = parseFloat(raw);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getBgMode(): BgMode {
  const attr = document.documentElement.getAttribute("data-bg-mode");
  return resolveBgMode(attr);
}

function updateScrollState(mode: BgMode) {
  const root = document.documentElement;
  const scrollY = window.scrollY;
  const viewportHeight = window.innerHeight;
  const scrollHeight = document.documentElement.scrollHeight - viewportHeight;
  const progress = scrollHeight > 0 ? scrollY / scrollHeight : 0;
  const motion = getScrollMotionMultiplier();
  const speed = getBackgroundSpeedMultiplier();
  const cellBase = getCheckerCellBase();
  const rotationAmount = getRotationAmount();
  const fractureAngleBase = getFractureAngleAmount();

  const wave = Math.sin(scrollY * 0.0032);
  const wave2 = Math.cos(scrollY * 0.0022);
  const parallax = MODE_PARALLAX[mode];

  root.style.setProperty(
    "--checker-cell",
    `${cellBase + wave * parallax.cellWave * motion * speed + progress * (parallax.cellWave * 0.55 * motion * speed)}px`
  );
  root.style.setProperty(
    "--checker-offset-x",
    `${scrollY * parallax.offsetX * motion * speed + wave2 * (parallax.offsetX * 48 * motion * speed)}px`
  );
  root.style.setProperty(
    "--checker-offset-y",
    `${scrollY * parallax.offsetY * motion * speed + wave * (parallax.offsetY * 60 * motion * speed)}px`
  );
  root.style.setProperty(
    "--checker-rotate",
    `${wave * rotationAmount * motion}deg`
  );
  root.style.setProperty(
    "--checker-tilt",
    `${parallax.tilt * motion + rotationAmount * 0.5 * motion + wave2 * (parallax.tilt * 0.5 * motion) + progress * (parallax.tilt * 0.4 * motion)}deg`
  );
  root.style.setProperty(
    "--checker-roll",
    `${wave * rotationAmount * 0.8 * motion}deg`
  );
  root.style.setProperty(
    "--checker-scale",
    `${1 + wave2 * parallax.scale * motion * speed + progress * (parallax.scale * 0.45 * motion * speed)}`
  );

  const fadeAmount = getCssVar("--fade-amount", 0.25);

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

    if (
      mode === "voxel" ||
      mode === "bloom" ||
      mode === "slate" ||
      mode === "studio-neon"
    ) {
      edgeReveal = clamp(0.78 + (1 - normalizedCenter) * 0.18, 0.72, 1);
    }

    if (mode === "fracture") {
      edgeReveal = clamp(0.62 + (1 - normalizedCenter) * 0.38, 0.58, 1);
      const fractureSign = index % 2 === 0 ? -1 : 1;
      const fractureAngle = fractureAngleBase * fractureSign;
      section.style.setProperty("--fracture-angle", `${fractureAngle}deg`);
      section.style.setProperty(
        "--fracture-offset",
        `${Math.sin(scrollY * 0.0025 + index) * 8 * motion * speed}px`
      );
    }

    section.style.setProperty("--edge-reveal", edgeReveal.toFixed(3));

    const localCell = cellBase * 0.72 + edgeReveal * 90 + (1 - normalizedCenter) * 24;
    section.style.setProperty("--checker-cell-local", `${localCell}px`);
  });

  const curvePath = document.getElementById("checker-curve-path");
  if (curvePath && mode === "ent-mono") {
    const amplitude = (50 + progress * 70) * motion * speed;
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
    const skewAmount = 18 + Math.abs(fractureAngleBase) * 1.2;
    stripe.setAttribute(
      "d",
      `M -40 ${y} L ${width + 40} ${y + skew * skewAmount}`
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
  }, [
    mode,
    effects.scrollMotion,
    effects.backgroundSpeed,
    effects.checkerCellSize,
    effects.checkerRotation,
    effects.fractureAngle,
  ]);

  const showCurve = !prefersReducedMotion && mode === "ent-mono";
  const showFracture = !prefersReducedMotion && mode === "fracture";
  const isAmbient =
    mode === "voxel" || mode === "bloom" || mode === "slate";
  const isGlowMode = mode === "studio-neon" || mode === "bloom";
  const isVoxelLayer = mode === "voxel" || mode === "fracture";

  return (
    <>
      <div
        className={`checker-scroll-layer${isAmbient ? " checker-scroll-layer--ambient" : ""}${isGlowMode ? " checker-scroll-layer--glow" : ""}${isVoxelLayer ? " checker-scroll-layer--voxel" : ""}`}
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
