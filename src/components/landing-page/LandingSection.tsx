"use client";

import { Box } from "@chakra-ui/react";
import type { CSSProperties, PropsWithChildren } from "react";

import SectionFrame, { type SectionFrameAccent } from "./SectionFrame";

export type LandingSectionTone = "dark" | "light";

type LandingSectionProps = PropsWithChildren<{
  tone: LandingSectionTone;
  py?: number | { base?: number; md?: number };
  id?: string;
  frameAccent?: SectionFrameAccent;
  frameSize?: "default" | "wide" | "full";
  framed?: boolean;
}>;

const toneVars = {
  dark: {
    "--section-heading": "#ffffff",
    "--section-description": "#a3a3a3",
    "--section-super-title": "#60a5fa",
  },
  light: {
    "--section-heading": "#050505",
    "--section-description": "#4a4a4a",
    "--section-super-title": "#2563eb",
  },
} as const;

const toneAccent: Record<LandingSectionTone, SectionFrameAccent> = {
  dark: "blue",
  light: "neutral",
};

export default function LandingSection({
  tone,
  children,
  py,
  id,
  frameAccent,
  frameSize = "wide",
  framed = true,
}: LandingSectionProps) {
  return (
    <Box
      as="section"
      data-landing-section=""
      data-checker-section=""
      data-checker-variant={tone === "dark" ? "black" : "white"}
      data-tone={tone}
      className="landing-section"
      id={id}
      py={py}
      w="full"
      style={toneVars[tone] as CSSProperties}
    >
      <Box className="landing-section__content" w="full">
        {framed ? (
          <SectionFrame
            accent={frameAccent ?? toneAccent[tone]}
            size={frameSize}
          >
            {children}
          </SectionFrame>
        ) : (
          children
        )}
      </Box>
    </Box>
  );
}
