"use client";

import {
  danceSpeedFromSlider,
  fairyCountFromSlider,
  freezeOnHoverEnabled,
  PRESET_PALETTES,
  type BgMode,
} from "@lib/background-mode";
import { useCallback, useEffect, useRef } from "react";

import { useBackgroundMode } from "./BackgroundModeProvider";

type Pixel = { ox: number; oy: number; kind: "body" | "wing" | "eye" };

type Fairy = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  bodyColor: string;
  wingColor: string;
  pixels: Pixel[];
  dancePhase: number;
  danceRate: number;
  wanderPhase: number;
  wanderRadius: number;
  homeX: number;
  homeY: number;
  alert: boolean;
  alertBlend: number;
  leanX: number;
  leanY: number;
  sparkleTimer: number;
  seed: number;
};

type Sparkle = {
  x: number;
  y: number;
  life: number;
  maxLife: number;
};

type Pointer = { x: number; y: number; active: boolean };

const ROOT_CLASS = "fairy-scroll-root";
const PROXIMITY_MIN = 80;
const PROXIMITY_MAX = 120;
const ALERT_RELEASE_MS = 320;
const PIXEL_SIZE = 3;

const FAIRY_SHAPES: Pixel[][] = [
  [
    { ox: 0, oy: -2, kind: "wing" },
    { ox: -1, oy: -1, kind: "wing" },
    { ox: 0, oy: -1, kind: "body" },
    { ox: 1, oy: -1, kind: "wing" },
    { ox: -1, oy: 0, kind: "eye" },
    { ox: 0, oy: 0, kind: "body" },
    { ox: 1, oy: 0, kind: "eye" },
    { ox: 0, oy: 1, kind: "body" },
    { ox: 0, oy: 2, kind: "body" },
  ],
  [
    { ox: -1, oy: -1, kind: "wing" },
    { ox: 1, oy: -1, kind: "wing" },
    { ox: 0, oy: -1, kind: "body" },
    { ox: -1, oy: 0, kind: "eye" },
    { ox: 0, oy: 0, kind: "body" },
    { ox: 1, oy: 0, kind: "eye" },
    { ox: -1, oy: 1, kind: "wing" },
    { ox: 1, oy: 1, kind: "wing" },
    { ox: 0, oy: 2, kind: "body" },
  ],
  [
    { ox: 0, oy: -2, kind: "body" },
    { ox: -1, oy: -1, kind: "wing" },
    { ox: 1, oy: -1, kind: "wing" },
    { ox: 0, oy: 0, kind: "body" },
    { ox: -1, oy: 1, kind: "eye" },
    { ox: 1, oy: 1, kind: "eye" },
    { ox: 0, oy: 2, kind: "body" },
  ],
  [
    { ox: -1, oy: 0, kind: "wing" },
    { ox: 0, oy: -1, kind: "body" },
    { ox: 1, oy: 0, kind: "wing" },
    { ox: -1, oy: 1, kind: "eye" },
    { ox: 0, oy: 1, kind: "body" },
    { ox: 1, oy: 1, kind: "eye" },
    { ox: 0, oy: 2, kind: "body" },
  ],
];

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function pick<T>(arr: T[], seed: number): T {
  return arr[Math.abs(Math.floor(seed)) % arr.length];
}

function createFairy(
  index: number,
  width: number,
  height: number,
  colors: string[]
): Fairy {
  const seed = index * 17.31 + 3.7;
  const x = (0.08 + ((index * 0.618) % 1) * 0.84) * width;
  const y = (0.1 + ((index * 0.381) % 1) * 0.8) * height;
  const bodyColor = pick(colors, seed);
  const wingColor = pick(colors, seed + 2);

  return {
    x,
    y,
    vx: (Math.sin(seed) * 0.12) / 60,
    vy: (Math.cos(seed * 1.3) * 0.1) / 60,
    bodyColor,
    wingColor,
    pixels: pick(FAIRY_SHAPES, seed),
    dancePhase: seed * 2.1,
    danceRate: 0.8 + (index % 5) * 0.15,
    wanderPhase: seed * 0.7,
    wanderRadius: 18 + (index % 4) * 10,
    homeX: x,
    homeY: y,
    alert: false,
    alertBlend: 0,
    leanX: 0,
    leanY: 0,
    sparkleTimer: index * 0.4,
    seed,
  };
}

function createFairies(
  count: number,
  width: number,
  height: number,
  colors: string[]
): Fairy[] {
  return Array.from({ length: count }, (_, i) =>
    createFairy(i, width, height, colors)
  );
}

function danceOffset(
  frame: number,
  phase: number,
  rate: number
): { dx: number; dy: number; frame: number } {
  const t = frame * rate + phase;
  const bob = Math.sin(t * 2.4) * 2.2;
  const wiggle = Math.sin(t * 3.7 + 1.2) * 1.4;
  const orbit = Math.sin(t * 1.6) * 0.8;
  const frameIdx = Math.floor(t * 2) % 4;
  return { dx: wiggle + orbit, dy: bob, frame: frameIdx };
}

function drawGradientBg(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  mode: BgMode
) {
  const palette = PRESET_PALETTES[mode];
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, palette.bgTop);
  gradient.addColorStop(1, palette.bgBottom);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

function drawFairy(
  ctx: CanvasRenderingContext2D,
  fairy: Fairy,
  frame: number,
  danceSpeed: number,
  pointer: Pointer,
  reducedMotion: boolean
) {
  const proximity =
    PROXIMITY_MIN + ((fairy.seed % 10) / 10) * (PROXIMITY_MAX - PROXIMITY_MIN);
  const dist = Math.hypot(pointer.x - fairy.x, pointer.y - fairy.y);
  const near = pointer.active && dist < proximity;

  if (near) {
    fairy.alert = true;
    fairy.alertBlend = lerp(fairy.alertBlend, 1, 0.22);
  } else if (fairy.alert) {
    fairy.alertBlend = lerp(fairy.alertBlend, 0, 0.08);
    if (fairy.alertBlend < 0.05) {
      fairy.alert = false;
      fairy.alertBlend = 0;
    }
  }

  const isFrozen = fairy.alertBlend > 0.35;
  const dance = reducedMotion
    ? { dx: 0, dy: 0, frame: 0 }
    : danceOffset(frame, fairy.dancePhase, fairy.danceRate * danceSpeed);

  let angle = 0;
  let eyeShiftX = 0;
  let eyeShiftY = 0;

  if (isFrozen && pointer.active) {
    angle = Math.atan2(pointer.y - fairy.y, pointer.x - fairy.x) + Math.PI / 2;
    const lookStrength = fairy.alertBlend * 0.35;
    eyeShiftX = Math.cos(angle - Math.PI / 2) * lookStrength;
    eyeShiftY = Math.sin(angle - Math.PI / 2) * lookStrength;
    fairy.leanX = lerp(fairy.leanX, Math.cos(angle) * 1.5 * fairy.alertBlend, 0.15);
    fairy.leanY = lerp(fairy.leanY, Math.sin(angle) * 1.5 * fairy.alertBlend, 0.15);
  } else {
    fairy.leanX = lerp(fairy.leanX, 0, 0.1);
    fairy.leanY = lerp(fairy.leanY, 0, 0.1);
  }

  const freezeMix = isFrozen ? 1 - fairy.alertBlend * 0.85 : 1;
  const bobFrames = [
    { dx: 0, dy: 0 },
    { dx: 0.5, dy: -0.8 },
    { dx: 0, dy: -1.2 },
    { dx: -0.5, dy: -0.5 },
  ];
  const bob = bobFrames[dance.frame];

  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const cx = fairy.x + fairy.leanX;
  const cy = fairy.y + fairy.leanY;
  const animDx = (dance.dx + bob.dx) * freezeMix;
  const animDy = (dance.dy + bob.dy) * freezeMix;

  for (const pixel of fairy.pixels) {
    let px = pixel.ox + animDx;
    let py = pixel.oy + animDy;

    if (isFrozen) {
      const rx = px * cos - py * sin;
      const ry = px * sin + py * cos;
      px = rx;
      py = ry;
    }

    if (pixel.kind === "eye") {
      px += eyeShiftX;
      py += eyeShiftY;
    }

    const color =
      pixel.kind === "eye"
        ? "#1a1028"
        : pixel.kind === "wing"
          ? fairy.wingColor
          : fairy.bodyColor;

    ctx.fillStyle = color;
    ctx.fillRect(
      Math.round(cx + px * PIXEL_SIZE),
      Math.round(cy + py * PIXEL_SIZE),
      PIXEL_SIZE,
      PIXEL_SIZE
    );
  }
}

function updateFairy(
  fairy: Fairy,
  width: number,
  height: number,
  time: number,
  danceSpeed: number,
  reducedMotion: boolean
) {
  if (reducedMotion || fairy.alertBlend > 0.2) {
    return;
  }

  const wanderX =
    fairy.homeX + Math.cos(time * 0.35 + fairy.wanderPhase) * fairy.wanderRadius;
  const wanderY =
    fairy.homeY + Math.sin(time * 0.28 + fairy.wanderPhase * 1.1) * fairy.wanderRadius * 0.7;

  fairy.x += (wanderX - fairy.x) * 0.004 * danceSpeed + fairy.vx;
  fairy.y += (wanderY - fairy.y) * 0.004 * danceSpeed + fairy.vy;

  const margin = 24;
  if (fairy.x < margin) fairy.x = margin;
  if (fairy.x > width - margin) fairy.x = width - margin;
  if (fairy.y < margin) fairy.y = margin;
  if (fairy.y > height - margin) fairy.y = height - margin;

  fairy.sparkleTimer -= 0.016;
}

function drawSparkles(
  ctx: CanvasRenderingContext2D,
  sparkles: Sparkle[],
  color: string
) {
  for (const s of sparkles) {
    const alpha = (s.life / s.maxLife) * 0.45;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    const size = PIXEL_SIZE * (0.6 + (1 - s.life / s.maxLife) * 0.4);
    ctx.fillRect(s.x - size / 2, s.y - size / 2, size, size);
  }
  ctx.globalAlpha = 1;
}

export default function PixelFairyBackground() {
  const { mode, effects } = useBackgroundMode();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fairiesRef = useRef<Fairy[]>([]);
  const sparklesRef = useRef<Sparkle[]>([]);
  const rafRef = useRef(0);
  const timeRef = useRef(0);
  const frameRef = useRef(0);
  const pointerRef = useRef<Pointer>({ x: -9999, y: -9999, active: false });
  const releaseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reducedMotionRef = useRef(false);
  const isCoarsePointerRef = useRef(false);

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = fairyCountFromSlider(effects.fairyCount);
    const palette = PRESET_PALETTES[mode];
    fairiesRef.current = createFairies(count, w, h, palette.fairyColors);
    sparklesRef.current = [];
  }, [effects.fairyCount, mode]);

  useEffect(() => {
    document.documentElement.classList.add(ROOT_CLASS);
    return () => {
      document.documentElement.classList.remove(ROOT_CLASS);
    };
  }, []);

  useEffect(() => {
    reducedMotionRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    isCoarsePointerRef.current = window.matchMedia("(pointer: coarse)").matches;
    resize();

    const onResize = () => resize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [resize]);

  useEffect(() => {
    const freezeEnabled =
      freezeOnHoverEnabled(effects.freezeOnHover) && !isCoarsePointerRef.current;

    const setPointer = (x: number, y: number, active: boolean) => {
      pointerRef.current = { x, y, active: active && freezeEnabled };
      if (releaseTimerRef.current) {
        clearTimeout(releaseTimerRef.current);
        releaseTimerRef.current = null;
      }
    };

    const onMouseMove = (e: MouseEvent) => setPointer(e.clientX, e.clientY, true);
    const onMouseLeave = () => {
      releaseTimerRef.current = setTimeout(() => {
        pointerRef.current = { ...pointerRef.current, active: false };
      }, ALERT_RELEASE_MS);
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0 && freezeEnabled) {
        setPointer(e.touches[0].clientX, e.touches[0].clientY, true);
      }
    };
    const onTouchEnd = () => {
      releaseTimerRef.current = setTimeout(() => {
        pointerRef.current = { ...pointerRef.current, active: false };
      }, ALERT_RELEASE_MS);
    };

    window.addEventListener("mousemove", onMouseMove);
    document.documentElement.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      document.documentElement.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      if (releaseTimerRef.current) clearTimeout(releaseTimerRef.current);
    };
  }, [effects.freezeOnHover]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let running = true;
    const danceSpeed = danceSpeedFromSlider(effects.danceSpeed);
    const palette = PRESET_PALETTES[mode];

    const render = () => {
      if (!running) return;

      if (document.hidden) {
        rafRef.current = requestAnimationFrame(render);
        return;
      }

      const w = window.innerWidth;
      const h = window.innerHeight;
      const reduced = reducedMotionRef.current;

      if (!reduced) {
        timeRef.current += 0.016 * danceSpeed;
        frameRef.current += 0.05 * danceSpeed;
      }

      drawGradientBg(ctx, w, h, mode);

      const fairies = fairiesRef.current;
      const sparkles = sparklesRef.current;

      for (const fairy of fairies) {
        updateFairy(fairy, w, h, timeRef.current, danceSpeed, reduced);

        if (!reduced && fairy.sparkleTimer <= 0 && Math.random() < 0.02) {
          sparkles.push({
            x: fairy.x + (Math.random() - 0.5) * 8,
            y: fairy.y + (Math.random() - 0.5) * 8,
            life: 1,
            maxLife: 1,
          });
          fairy.sparkleTimer = 1.5 + Math.random() * 2;
        }

        drawFairy(
          ctx,
          fairy,
          frameRef.current,
          danceSpeed,
          pointerRef.current,
          reduced
        );
      }

      for (let i = sparkles.length - 1; i >= 0; i--) {
        sparkles[i].life -= 0.025;
        if (sparkles[i].life <= 0) sparkles.splice(i, 1);
      }
      if (sparkles.length > 60) sparkles.splice(0, sparkles.length - 60);
      drawSparkles(ctx, sparkles, palette.sparkle);

      rafRef.current = requestAnimationFrame(render);
    };

    if (reducedMotionRef.current) {
      drawGradientBg(ctx, window.innerWidth, window.innerHeight, mode);
      for (const fairy of fairiesRef.current) {
        drawFairy(ctx, fairy, 0, 1, { x: -9999, y: -9999, active: false }, true);
      }
    } else {
      rafRef.current = requestAnimationFrame(render);
    }

    return () => {
      running = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, [mode, effects]);

  return (
    <div className="fairy-background" aria-hidden="true">
      <canvas ref={canvasRef} className="fairy-background__canvas" />
    </div>
  );
}
