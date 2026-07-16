"use client";

import { usePrefersReducedMotion } from "@chakra-ui/react";
import { useEffect } from "react";

const ROOT_CLASS = "checker-scroll-root";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function updateScrollState() {
  const root = document.documentElement;
  const scrollY = window.scrollY;
  const viewportHeight = window.innerHeight;
  const scrollHeight = document.documentElement.scrollHeight - viewportHeight;
  const progress = scrollHeight > 0 ? scrollY / scrollHeight : 0;

  const wave = Math.sin(scrollY * 0.004);
  const wave2 = Math.cos(scrollY * 0.0028);

  root.style.setProperty("--checker-cell", `${64 + wave * 28 + progress * 24}px`);
  root.style.setProperty("--checker-offset-x", `${scrollY * 0.22 + wave2 * 18}px`);
  root.style.setProperty("--checker-offset-y", `${scrollY * 0.11 + wave * 12}px`);
  root.style.setProperty("--checker-rotate", `${wave * 2.5}deg`);
  root.style.setProperty("--checker-tilt", `${6 + wave2 * 5 + progress * 4}deg`);
  root.style.setProperty("--checker-roll", `${wave * 2.8}deg`);
  root.style.setProperty("--checker-scale", `${1 + wave2 * 0.08 + progress * 0.06}`);

  const sections = document.querySelectorAll<HTMLElement>("[data-checker-section]");
  sections.forEach((section) => {
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

    const edgeReveal = clamp(
      Math.max(topReveal, bottomReveal) * 0.85 + (1 - normalizedCenter) * 0.55,
      0,
      1
    );

    section.style.setProperty("--edge-reveal", edgeReveal.toFixed(3));

    const localCell = 48 + edgeReveal * 140 + (1 - normalizedCenter) * 36;
    section.style.setProperty("--checker-cell-local", `${localCell}px`);
  });

  const curvePath = document.getElementById("checker-curve-path");
  if (curvePath) {
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
}

export default function CheckerboardScrollBackground() {
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    document.documentElement.classList.add(ROOT_CLASS);

    let frame = 0;
    const onScroll = () => {
      if (frame) {
        return;
      }
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        updateScrollState();
      });
    };

    updateScrollState();
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
  }, []);

  if (prefersReducedMotion) {
    return (
      <div
        className="checker-scroll-layer"
        aria-hidden="true"
        style={{
          backgroundSize: "64px 64px",
          transform: "none",
        }}
      />
    );
  }

  return (
    <>
      <div className="checker-scroll-layer" aria-hidden="true" />
      <svg className="checker-curve-line" aria-hidden="true" preserveAspectRatio="none">
        <defs>
          <pattern
            id="checker-curve-stroke"
            width="24"
            height="24"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <rect width="12" height="12" fill="#000000" />
            <rect x="12" y="12" width="12" height="12" fill="#000000" />
            <rect x="12" width="12" height="12" fill="#ffffff" />
            <rect y="12" width="12" height="12" fill="#ffffff" />
          </pattern>
        </defs>
        <path id="checker-curve-path" d="M 0 0" />
      </svg>
    </>
  );
}
