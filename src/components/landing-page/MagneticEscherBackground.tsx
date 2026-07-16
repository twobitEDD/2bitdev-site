"use client";

import {
  attractorCountFromSlider,
  type BgMode,
  PRESET_PALETTES,
} from "@lib/background-mode";
import { useCallback, useEffect, useRef } from "react";

import { useBackgroundMode } from "./BackgroundModeProvider";

type Attractor = {
  baseX: number;
  baseY: number;
  pathRadius: number;
  pathSpeed: number;
  pathPhase: number;
  pulsePhase: number;
  z: number;
};

type Point = { x: number; y: number };

const ROOT_CLASS = "escher-scroll-root";

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

function hslAccent(hueDeg: number, sat = 55, light = 58): string {
  return `hsl(${hueDeg} ${sat}% ${light}%)`;
}

function createAttractors(count: number, width: number, height: number): Attractor[] {
  const attractors: Attractor[] = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + 0.3;
    const dist = 0.25 + (i % 3) * 0.12;
    attractors.push({
      baseX: width * (0.5 + Math.cos(angle) * dist),
      baseY: height * (0.5 + Math.sin(angle) * dist * 0.85),
      pathRadius: 40 + (i % 4) * 28,
      pathSpeed: 0.18 + (i % 5) * 0.07,
      pathPhase: angle * 1.4,
      pulsePhase: i * 1.7,
      z: 0.3 + (i % 4) * 0.15,
    });
  }
  return attractors;
}

function getAttractorPositions(
  attractors: Attractor[],
  time: number,
  scrollZ: number,
  pulseAmount: number,
  width: number,
  height: number
): { x: number; y: number; strength: number; invert: boolean }[] {
  return attractors.map((a) => {
    const pulse = 0.65 + Math.sin(time * 1.2 + a.pulsePhase) * pulseAmount * 0.35;
    const z = clamp(a.z + scrollZ * 0.4, 0.05, 1.2);
    const depthFactor = z < 0.35 ? z / 0.35 : z > 0.85 ? (1.2 - z) / 0.35 : 1;
    const x =
      a.baseX +
      Math.cos(time * a.pathSpeed + a.pathPhase) * a.pathRadius * depthFactor;
    const y =
      a.baseY +
      Math.sin(time * a.pathSpeed * 0.85 + a.pathPhase * 1.1) *
        a.pathRadius *
        0.75 *
        depthFactor;
    const offscreen =
      x < -80 || x > width + 80 || y < -80 || y > height + 80;
    const strength = offscreen ? 0 : pulse * depthFactor * (0.5 + z * 0.5);
    const invert = z < 0.25 || z > 0.95;
    return { x, y, strength, invert };
  });
}

function displacePoint(
  x: number,
  y: number,
  attractors: ReturnType<typeof getAttractorPositions>,
  magneticStrength: number
): Point {
  let dx = 0;
  let dy = 0;
  const strengthScale = 1200 + magneticStrength * 2800;

  for (const a of attractors) {
    if (a.strength <= 0.01) continue;
    const distX = x - a.x;
    const distY = y - a.y;
    const distSq = distX * distX + distY * distY + 900;
    const force = (a.strength * strengthScale) / distSq;
    const sign = a.invert ? -1 : 1;
    dx += distX * force * sign;
    dy += distY * force * sign;
  }

  return { x: x + dx, y: y + dy };
}

function getSectionInfluence(): number {
  if (typeof window === "undefined") return 0;
  const sections = document.querySelectorAll<HTMLElement>("[data-landing-section]");
  if (!sections.length) return 0;
  const mid = window.scrollY + window.innerHeight * 0.45;
  let influence = 0;
  sections.forEach((section, i) => {
    const rect = section.getBoundingClientRect();
    const top = rect.top + window.scrollY;
    const center = top + rect.height * 0.5;
    const dist = Math.abs(mid - center);
    const weight = Math.max(0, 1 - dist / (window.innerHeight * 0.9));
    influence += weight * ((i % 3) - 1) * 0.15;
  });
  return clamp(influence, -0.35, 0.35);
}

function drawTessellation(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  cellSize: number,
  attractors: ReturnType<typeof getAttractorPositions>,
  magneticStrength: number,
  palette: (typeof PRESET_PALETTES)[BgMode],
  contrast: number,
  accentColor: string,
  layerScale: number
) {
  const cols = Math.ceil(width / cellSize) + 2;
  const rows = Math.ceil(height / (cellSize * 0.866)) + 2;
  const offsetX = -cellSize;
  const offsetY = -cellSize;

  ctx.lineWidth = 0.6 + contrast * 0.008;
  ctx.strokeStyle = palette.line;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cx = offsetX + col * cellSize + (row % 2) * (cellSize * 0.5);
      const cy = offsetY + row * cellSize * 0.866;
      const center = displacePoint(cx, cy, attractors, magneticStrength * layerScale);

      const hex: Point[] = [];
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 6;
        const px = center.x + Math.cos(angle) * cellSize * 0.48;
        const py = center.y + Math.sin(angle) * cellSize * 0.48;
        hex.push(displacePoint(px, py, attractors, magneticStrength * layerScale * 0.6));
      }

      const parity = (row + col) % 2;
      const fillAlpha = 0.08 + contrast * 0.0012;
      ctx.fillStyle =
        parity === 0
          ? `rgba(255,255,255,${fillAlpha})`
          : `rgba(0,0,0,${fillAlpha * 1.4})`;
      ctx.beginPath();
      ctx.moveTo(hex[0].x, hex[0].y);
      for (let i = 1; i < 6; i++) ctx.lineTo(hex[i].x, hex[i].y);
      ctx.closePath();
      ctx.fill();

      if (layerScale > 0.85) {
        ctx.strokeStyle = palette.line;
        ctx.stroke();
      }

      if (parity === 0 && layerScale > 0.7) {
        ctx.fillStyle = accentColor;
        ctx.globalAlpha = 0.06 + contrast * 0.0008;
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }
  }
}

function drawWarpGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  spacing: number,
  attractors: ReturnType<typeof getAttractorPositions>,
  magneticStrength: number,
  palette: (typeof PRESET_PALETTES)[BgMode],
  contrast: number,
  accentColor: string
) {
  const cols = Math.ceil(width / spacing) + 2;
  const rows = Math.ceil(height / spacing) + 2;

  ctx.lineWidth = 0.5 + contrast * 0.006;

  for (let row = 0; row <= rows; row++) {
    ctx.beginPath();
    let started = false;
    for (let col = 0; col <= cols; col++) {
      const x = (col - 0.5) * spacing;
      const y = (row - 0.5) * spacing;
      const p = displacePoint(x, y, attractors, magneticStrength);
      if (!started) {
        ctx.moveTo(p.x, p.y);
        started = true;
      } else {
        ctx.lineTo(p.x, p.y);
      }
    }
    ctx.strokeStyle = row % 3 === 0 ? accentColor : palette.line;
    ctx.globalAlpha = row % 3 === 0 ? 0.35 + contrast * 0.004 : 0.25 + contrast * 0.003;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  for (let col = 0; col <= cols; col++) {
    ctx.beginPath();
    let started = false;
    for (let row = 0; row <= rows; row++) {
      const x = (col - 0.5) * spacing;
      const y = (row - 0.5) * spacing;
      const p = displacePoint(x, y, attractors, magneticStrength);
      if (!started) {
        ctx.moveTo(p.x, p.y);
        started = true;
      } else {
        ctx.lineTo(p.x, p.y);
      }
    }
    ctx.strokeStyle = col % 4 === 0 ? palette.tileB : palette.line;
    ctx.globalAlpha = 0.2 + contrast * 0.003;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
}

function drawImpossibleGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  spacing: number,
  attractors: ReturnType<typeof getAttractorPositions>,
  magneticStrength: number,
  palette: (typeof PRESET_PALETTES)[BgMode],
  contrast: number,
  time: number
) {
  const cols = Math.ceil(width / spacing) + 1;
  const rows = Math.ceil(height / spacing) + 1;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * spacing;
      const y = row * spacing;
      const p = displacePoint(x, y, attractors, magneticStrength);
      const stair = (row + col) % 3;
      const lift = stair === 1 ? spacing * 0.22 : stair === 2 ? -spacing * 0.12 : 0;
      const wobble = Math.sin(time * 0.4 + col * 0.3 + row * 0.25) * spacing * 0.04;

      const x0 = p.x;
      const y0 = p.y + lift + wobble;
      const x1 = p.x + spacing * 0.85;
      const y1 = p.y + lift;
      const x2 = p.x + spacing * 0.85;
      const y2 = p.y + spacing * 0.85 + lift;
      const x3 = p.x;
      const y3 = p.y + spacing * 0.85 + lift + wobble;

      const shade =
        stair === 0
          ? palette.tileA
          : stair === 1
            ? palette.tileB
            : palette.line;
      const alpha = 0.12 + contrast * 0.0025;

      ctx.fillStyle = shade;
      ctx.globalAlpha = alpha * (stair === 1 ? 1.4 : 1);
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.lineTo(x3, y3);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = palette.tileB;
      ctx.globalAlpha = 0.15 + contrast * 0.002;
      ctx.lineWidth = 0.8;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }
}

function drawBirdFishMotif(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  flip: boolean,
  color: string,
  alpha: number
) {
  const s = size * (flip ? -1 : 1);
  ctx.fillStyle = color;
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.bezierCurveTo(cx + s * 0.5, cy - s * 0.35, cx + s * 0.9, cy - s * 0.1, cx + s * 0.7, cy);
  ctx.bezierCurveTo(cx + s * 0.9, cy + s * 0.1, cx + s * 0.5, cy + s * 0.35, cx, cy);
  ctx.bezierCurveTo(cx - s * 0.3, cy + s * 0.2, cx - s * 0.35, cy - s * 0.2, cx, cy);
  ctx.fill();
  ctx.globalAlpha = 1;
}

function drawBirds(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  cellSize: number,
  attractors: ReturnType<typeof getAttractorPositions>,
  magneticStrength: number,
  palette: (typeof PRESET_PALETTES)[BgMode],
  contrast: number,
  accentColor: string
) {
  const cols = Math.ceil(width / cellSize) + 2;
  const rows = Math.ceil(height / cellSize) + 2;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cx = col * cellSize;
      const cy = row * cellSize;
      const p = displacePoint(cx, cy, attractors, magneticStrength);
      const flip = (row + col) % 2 === 0;
      const nearInvert = attractors.some((a) => {
        const d = Math.hypot(p.x - a.x, p.y - a.y);
        return d < 120 && a.invert;
      });

      const color = nearInvert ? accentColor : flip ? palette.tileB : palette.line;
      const alpha = 0.08 + contrast * 0.0015;
      drawBirdFishMotif(ctx, p.x, p.y, cellSize * 0.42, flip !== nearInvert, color, alpha);

      ctx.strokeStyle = palette.line;
      ctx.globalAlpha = 0.12;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      const p2 = displacePoint(cx + cellSize, cy, attractors, magneticStrength * 0.7);
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }
}

function drawFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  mode: BgMode,
  attractors: ReturnType<typeof getAttractorPositions>,
  magneticStrength: number,
  contrast: number,
  accentHue: number,
  layerDepth: number,
  time: number
) {
  const palette = PRESET_PALETTES[mode];
  const accentColor = hslAccent((accentHue / 100) * 360, 52, 58);

  ctx.fillStyle = palette.bg;
  ctx.fillRect(0, 0, width, height);

  const layerScales = [
    0.55 + layerDepth * 0.003,
    0.85 + layerDepth * 0.002,
    1.0,
  ];

  if (mode === "tessellation") {
    const baseCell = lerp(52, 28, layerDepth / 100);
    layerScales.forEach((scale, i) => {
      drawTessellation(
        ctx,
        width,
        height,
        baseCell * (1 + i * 0.35),
        attractors,
        magneticStrength * (0.5 + i * 0.25),
        palette,
        contrast,
        accentColor,
        scale
      );
    });
  } else if (mode === "warp") {
    const spacing = lerp(48, 24, layerDepth / 100);
    [1.4, 1, 0.65].forEach((mult, i) => {
      ctx.globalAlpha = 0.35 + i * 0.2;
      drawWarpGrid(
        ctx,
        width,
        height,
        spacing * mult,
        attractors,
        magneticStrength * (0.6 + i * 0.2),
        palette,
        contrast,
        accentColor
      );
      ctx.globalAlpha = 1;
    });
  } else if (mode === "impossible-grid") {
    const spacing = lerp(56, 32, layerDepth / 100);
    drawImpossibleGrid(
      ctx,
      width,
      height,
      spacing,
      attractors,
      magneticStrength,
      palette,
      contrast,
      time
    );
    drawImpossibleGrid(
      ctx,
      width,
      height,
      spacing * 1.6,
      attractors,
      magneticStrength * 0.45,
      palette,
      contrast * 0.7,
      time * 0.7
    );
  } else if (mode === "birds") {
    const cell = lerp(64, 36, layerDepth / 100);
    [1.5, 1, 0.7].forEach((mult) => {
      drawBirds(
        ctx,
        width,
        height,
        cell * mult,
        attractors,
        magneticStrength * (mult < 1 ? 0.5 : 0.85),
        palette,
        contrast,
        accentColor
      );
    });
  }

  for (const a of attractors) {
    if (a.strength < 0.05) continue;
    const radius = 3 + a.strength * 8;
    const gradient = ctx.createRadialGradient(a.x, a.y, 0, a.x, a.y, radius * 4);
    gradient.addColorStop(
      0,
      a.invert ? "rgba(255,80,80,0.25)" : "rgba(156,184,154,0.3)"
    );
    gradient.addColorStop(1, "transparent");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(a.x, a.y, radius * 4, 0, Math.PI * 2);
    ctx.fill();
  }

  const vignette = ctx.createRadialGradient(
    width * 0.5,
    height * 0.5,
    Math.min(width, height) * 0.2,
    width * 0.5,
    height * 0.5,
    Math.max(width, height) * 0.75
  );
  vignette.addColorStop(0, "transparent");
  vignette.addColorStop(1, "rgba(0,0,0,0.45)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);
}

export default function MagneticEscherBackground() {
  const { mode, effects } = useBackgroundMode();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const attractorsRef = useRef<Attractor[]>([]);
  const rafRef = useRef<number>(0);
  const timeRef = useRef(0);
  const reducedMotionRef = useRef(false);

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

    const count = attractorCountFromSlider(effects.attractorCount);
    attractorsRef.current = createAttractors(count, w, h);
  }, [effects.attractorCount]);

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
    resize();

    const onResize = () => resize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [resize]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let running = true;

    const render = () => {
      if (!running) return;

      if (document.hidden) {
        rafRef.current = requestAnimationFrame(render);
        return;
      }

      const w = window.innerWidth;
      const h = window.innerHeight;
      const drift = effects.driftSpeed / 100;
      const scrollMotion = effects.scrollMotion / 100;
      const magneticStrength = effects.magneticStrength / 100;
      const contrast = effects.contrast;
      const accentHue = effects.accentHue;
      const layerDepth = effects.layerDepth;
      const pulseAmount = effects.pulseIntensity / 100;

      if (!reducedMotionRef.current) {
        timeRef.current += 0.008 + drift * 0.025;
      }

      const scrollZ =
        (window.scrollY / Math.max(document.body.scrollHeight - h, 1)) *
          scrollMotion +
        getSectionInfluence();

      const attractorPositions = getAttractorPositions(
        attractorsRef.current,
        timeRef.current,
        scrollZ,
        pulseAmount,
        w,
        h
      );

      drawFrame(
        ctx,
        w,
        h,
        mode,
        attractorPositions,
        magneticStrength,
        contrast,
        accentHue,
        layerDepth,
        timeRef.current
      );

      rafRef.current = requestAnimationFrame(render);
    };

    if (reducedMotionRef.current) {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const attractorPositions = getAttractorPositions(
        attractorsRef.current,
        0,
        0,
        0,
        w,
        h
      );
      drawFrame(
        ctx,
        w,
        h,
        mode,
        attractorPositions,
        effects.magneticStrength / 100,
        effects.contrast,
        effects.accentHue,
        effects.layerDepth,
        0
      );
    } else {
      rafRef.current = requestAnimationFrame(render);
    }

    return () => {
      running = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, [mode, effects]);

  return (
    <div className="escher-background" aria-hidden="true">
      <canvas ref={canvasRef} className="escher-background__canvas" />
    </div>
  );
}
