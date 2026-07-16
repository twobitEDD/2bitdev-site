"use client";

import { Box } from "@chakra-ui/react";
import type { CSSProperties, PropsWithChildren } from "react";

export type SectionFrameAccent =
  | "cyan"
  | "magenta"
  | "amber"
  | "emerald"
  | "blue"
  | "neutral";

const ACCENT_VARS: Record<SectionFrameAccent, Record<string, string>> = {
  cyan: {
    "--section-frame-accent": "rgba(34, 211, 238, 0.55)",
    "--section-frame-glow": "rgba(34, 211, 238, 0.18)",
  },
  magenta: {
    "--section-frame-accent": "rgba(232, 121, 249, 0.55)",
    "--section-frame-glow": "rgba(232, 121, 249, 0.18)",
  },
  amber: {
    "--section-frame-accent": "rgba(251, 191, 36, 0.55)",
    "--section-frame-glow": "rgba(251, 191, 36, 0.18)",
  },
  emerald: {
    "--section-frame-accent": "rgba(52, 211, 153, 0.55)",
    "--section-frame-glow": "rgba(52, 211, 153, 0.18)",
  },
  blue: {
    "--section-frame-accent": "rgba(96, 165, 250, 0.55)",
    "--section-frame-glow": "rgba(96, 165, 250, 0.18)",
  },
  neutral: {
    "--section-frame-accent": "rgba(255, 255, 255, 0.22)",
    "--section-frame-glow": "rgba(255, 255, 255, 0.08)",
  },
};

type SectionFrameProps = PropsWithChildren<{
  accent?: SectionFrameAccent;
  size?: "default" | "wide" | "full";
  bleed?: boolean;
  className?: string;
}>;

export default function SectionFrame({
  children,
  accent = "neutral",
  size = "default",
  bleed = false,
  className,
}: SectionFrameProps) {
  return (
    <Box
      className={`section-frame${bleed ? " section-frame--bleed" : ""}${className ? ` ${className}` : ""}`}
      data-frame-size={size}
      style={ACCENT_VARS[accent] as CSSProperties}
      mx="auto"
      w="full"
      maxW={
        size === "full"
          ? "full"
          : size === "wide"
            ? "7xl"
            : { base: "full", md: "6xl" }
      }
      px={{ base: 4, md: 6 }}
      py={{ base: 6, md: 10 }}
    >
      <Box className="section-frame__inner">{children}</Box>
    </Box>
  );
}
