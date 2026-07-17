"use client";

import { Box, usePrefersReducedMotion } from "@chakra-ui/react";
import { useInView } from "@hooks/useInView";
import { usePageVisibility } from "@hooks/usePageVisibility";
import { useEffect, useRef } from "react";

type AnimatedLandscapeProps = {
  height?: string | number;
};

const accentColors = {
  red: "rgba(255, 80, 80, 0.6)",
  green: "rgba(64, 220, 160, 0.6)",
  blue: "rgba(96, 165, 250, 0.6)",
};

export default function AnimatedLandscape({
  height = "100%",
}: AnimatedLandscapeProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const pageVisible = usePageVisibility();
  const inView = useInView(containerRef, { rootMargin: "120px 0px" });
  const shouldAnimate = !prefersReducedMotion && pageVisible && inView;

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    const state = {
      width: 0,
      height: 0,
      pointerX: 0,
      pointerY: 0,
      scrollY: 0,
    };

    let rafId = 0;
    let scrollFrame = 0;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      state.width = rect.width;
      state.height = rect.height;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      renderFrame(0);
    };

    const handleScroll = () => {
      if (scrollFrame) {
        return;
      }
      scrollFrame = window.requestAnimationFrame(() => {
        scrollFrame = 0;
        state.scrollY = window.scrollY || 0;
        if (prefersReducedMotion || !shouldAnimate) {
          renderFrame(0);
        }
      });
    };

    const handlePointer = (x: number, y: number) => {
      state.pointerX = x * 2 - 1;
      state.pointerY = y * 2 - 1;
      if (prefersReducedMotion) {
        renderFrame(0);
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      handlePointer(event.clientX / window.innerWidth, event.clientY / window.innerHeight);
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (!event.touches[0]) {
        return;
      }
      handlePointer(
        event.touches[0].clientX / window.innerWidth,
        event.touches[0].clientY / window.innerHeight
      );
    };

    const renderFrame = (time: number) => {
      const { width, height, pointerX, pointerY, scrollY } = state;
      if (!width || !height) {
        return;
      }

      const t = time * 0.0003;
      const scrollFactor = Math.min(1.4, scrollY / 600);
      const amplitudeScale = Math.max(0.6, 1 + scrollFactor * 0.6 + pointerY * 0.2);
      const baseOffset = height * 0.35 + scrollFactor * 12 + pointerY * 10;
      const lineStep = Math.max(6, width / 160);

      const gradient = context.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, "rgba(3, 3, 3, 0.98)");
      gradient.addColorStop(1, "rgba(12, 12, 12, 1)");
      context.fillStyle = gradient;
      context.fillRect(0, 0, width, height);

      context.strokeStyle = "rgba(255, 255, 255, 0.04)";
      context.lineWidth = 1;
      context.setLineDash([2, 12]);
      for (let x = 0; x <= width; x += 60) {
        context.beginPath();
        context.moveTo(x + pointerX * 12, height * 0.12);
        context.lineTo(x + pointerX * 12, height);
        context.stroke();
      }
      context.setLineDash([]);

      const layers = [
        {
          color: "rgba(255, 255, 255, 0.28)",
          amplitude: 12,
          frequency: 0.0045,
          speed: 0.55,
          offset: 0.18,
          lineWidth: 1.1,
        },
        {
          color: "rgba(255, 255, 255, 0.22)",
          amplitude: 18,
          frequency: 0.004,
          speed: 0.4,
          offset: 0.28,
          lineWidth: 1,
        },
        {
          color: "rgba(255, 255, 255, 0.18)",
          amplitude: 26,
          frequency: 0.0034,
          speed: 0.32,
          offset: 0.4,
          lineWidth: 1,
        },
        {
          color: accentColors.red,
          amplitude: 30,
          frequency: 0.0031,
          speed: 0.36,
          offset: 0.52,
          lineWidth: 1.4,
          dash: [8, 8],
        },
        {
          color: accentColors.green,
          amplitude: 34,
          frequency: 0.0027,
          speed: 0.28,
          offset: 0.62,
          lineWidth: 1.4,
          dash: [10, 10],
        },
        {
          color: accentColors.blue,
          amplitude: 38,
          frequency: 0.0024,
          speed: 0.24,
          offset: 0.72,
          lineWidth: 1.4,
          dash: [12, 12],
        },
        {
          color: "rgba(255, 255, 255, 0.14)",
          amplitude: 42,
          frequency: 0.002,
          speed: 0.2,
          offset: 0.84,
          lineWidth: 1,
        },
      ];

      layers.forEach((layer) => {
        const baseY = height * layer.offset + baseOffset;
        const amplitude = layer.amplitude * amplitudeScale;

        context.beginPath();
        for (let x = 0; x <= width; x += lineStep) {
          const wave =
            Math.sin(x * layer.frequency + t * layer.speed + pointerX * 1.4) +
            Math.sin(x * layer.frequency * 0.6 - t * layer.speed * 1.2) * 0.6;
          const y = baseY + wave * amplitude;
          if (x === 0) {
            context.moveTo(x, y);
          } else {
            context.lineTo(x, y);
          }
        }

        context.strokeStyle = layer.color;
        context.lineWidth = layer.lineWidth;
        if (layer.dash) {
          context.setLineDash(layer.dash);
        } else {
          context.setLineDash([]);
        }
        context.stroke();
      });

      context.setLineDash([]);
      context.strokeStyle = "rgba(255, 255, 255, 0.08)";
      context.lineWidth = 1;
      context.beginPath();
      context.moveTo(0, height * 0.28 + baseOffset * 0.2);
      context.lineTo(width, height * 0.28 + baseOffset * 0.2);
      context.stroke();
    };

    const animate = (time: number) => {
      renderFrame(time);
      rafId = window.requestAnimationFrame(animate);
    };

    resize();
    handleScroll();

    window.addEventListener("resize", resize);
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    if (shouldAnimate) {
      rafId = window.requestAnimationFrame(animate);
    } else {
      renderFrame(0);
    }

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
      if (scrollFrame) {
        window.cancelAnimationFrame(scrollFrame);
      }
    };
  }, [prefersReducedMotion, shouldAnimate]);

  return (
    <Box
      ref={containerRef}
      position="absolute"
      inset={0}
      height={height}
      width="100%"
      overflow="hidden"
      pointerEvents="none"
      aria-hidden="true"
    >
      <canvas ref={canvasRef} />
    </Box>
  );
}
