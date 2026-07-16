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
  dark: { cellWave: 28, offsetX: 0.22, offsetY: 0.11, scale: 0.08, tilt: 5 },
  light: { cellWave: 24, offsetX: 0.18, offsetY: 0.09, scale: 0.06, tilt: 4 },
  fracture: { cellWave: 16, offsetX: 0.12, offsetY: 0.06, scale: 0.04, tilt: 2 },
  ambient: { cellWave: 56, offsetX: 0.42, offsetY: 0.28, scale: 0.22, tilt: 12 },
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getBgMode(): BgMode {
  const attr = document.documentElement.getAttribute("data-bg-mode");
  if (attr === "light" || attr === "fracture" || attr === "ambient") {
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

  const wave = Math.sin(scrollY * 0.004);
  const wave2 = Math.cos(scrollY * 0.0028);
  const parallax = MODE_PARALLAX[mode];

  root.style.setProperty(
    "--checker-cell",
    `${64 + wave * parallax.cellWave + progress * (parallax.cellWave * 0.85)}px`
  );
  root.style.setProperty(
    "--checker-offset-x",
    `${scrollY * parallax.offsetX + wave2 * (parallax.offsetX * 80)}px`
  );
  root.style.setProperty(
    "--checker-offset-y",
    `${scrollY * parallax.offsetY + wave * (parallax.offsetY * 100)}px`
  );
  root.style.setProperty("--checker-rotate", `${wave * 2.5}deg`);
  root.style.setProperty(
    "--checker-tilt",
    `${parallax.tilt + wave2 * (parallax.tilt * 0.9) + progress * (parallax.tilt * 0.75)}deg`
  );
  root.style.setProperty("--checker-roll", `${wave * 2.8}deg`);
  root.style.setProperty(
    "--checker-scale",
    `${1 + wave2 * parallax.scale + progress * (parallax.scale * 0.75)}`
  );

  const sections = document.querySelectorAll<HTMLElement>("[data-checker-section]");
  sections.forEach((section, index) => {
    const rect = section.getBoundingClientRect();
    const sectionMid = rect.top + rect.height * 0.5;
    const viewportMid = viewportHeight * 0.5;
    const distFromCenter = Math.abs(sectionMid - viewportMid);
    const normalizedCenter = clamp(
      1 - distFromCenter / (viewportHeight * 0.55 + rect.height * 0.25),
      0,
      1
    );

    const topReveal = clamp(1 - rect.top / (viewportHeight * 0.28), 0, 1);
    const bottomReveal = clamp(
      1 - (viewportHeight - rect.bottom) / (viewportHeight * 0.28),
      0,
      1
    );

    let edgeReveal = clamp(
      Math.max(topReveal, bottomReveal) * 0.85 + (1 - normalizedCenter) * 0.55,
      0,
      1
    );

    if (mode === "ambient") {
      edgeReveal = clamp(0.65 + (1 - normalizedCenter) * 0.35, 0.55, 1);
    }

    if (mode === "fracture") {
      edgeReveal = clamp(0.45 + (1 - normalizedCenter) * 0.55, 0.4, 1);
      const fractureAngle = index % 2 === 0 ? -3.5 : 3.5;
      section.style.setProperty("--fracture-angle", `${fractureAngle}deg`);
      section.style.setProperty(
        "--fracture-offset",
        `${Math.sin(scrollY * 0.003 + index) * 12}px`
      );
    }

    section.style.setProperty("--edge-reveal", edgeReveal.toFixed(3));

    const localCell = 48 + edgeReveal * 140 + (1 - normalizedCenter) * 36;
    section.style.setProperty("--checker-cell-local", `${localCell}px`);
  });

  const curvePath = document.getElementById("checker-curve-path");
  if (curvePath && (mode === "dark" || mode === "light")) {
    const amplitude = 80 + progress * 120;
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
      `M -40 ${y} L ${width + 40} ${y + skew * 36}`
    );
  });
}

export default function CheckerboardScrollBackground() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const { mode } = useBackgroundMode();

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
  }, [mode]);

  const showCurve = !prefersReducedMotion && (mode === "dark" || mode === "light");
  const showFracture = !prefersReducedMotion && mode === "fracture";
  const isAmbient = mode === "ambient";

  return (
    <>
      <div
        className={`checker-scroll-layer${isAmbient ? " checker-scroll-layer--ambient" : ""}`}
        aria-hidden="true"
        style={
          prefersReducedMotion
            ? { backgroundSize: "64px 64px", transform: "none" }
            : undefined
        }
      />

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
