"use client";

import { Box } from "@chakra-ui/react";
import type { CSSProperties, PropsWithChildren } from "react";

import SectionFrame, { type SectionFrameAccent } from "./SectionFrame";

export type CheckerboardVariant = "black" | "white";

type CheckerboardSectionProps = PropsWithChildren<{
  variant: CheckerboardVariant;
  py?: number | { base?: number; md?: number };
  id?: string;
  frameAccent?: SectionFrameAccent;
  frameSize?: "default" | "wide" | "full";
  framed?: boolean;
}>;

const toneVars = {
  black: {
    "--checker-heading": "#ffffff",
    "--checker-description": "#a3a3a3",
    "--checker-super-title": "#60a5fa",
  },
  white: {
    "--checker-heading": "#050505",
    "--checker-description": "#4a4a4a",
    "--checker-super-title": "#2563eb",
  },
} as const;

const variantAccent: Record<CheckerboardVariant, SectionFrameAccent> = {
  black: "blue",
  white: "neutral",
};

export default function CheckerboardSection({
  variant,
  children,
  py,
  id,
  frameAccent,
  frameSize = "wide",
  framed = true,
}: CheckerboardSectionProps) {
  return (
    <Box
      as="section"
      data-checker-section=""
      data-variant={variant}
      className="checker-section"
      id={id}
      py={py}
      w="full"
      style={toneVars[variant] as CSSProperties}
    >
      <Box className="checker-section-content" w="full">
        {framed ? (
          <SectionFrame
            accent={frameAccent ?? variantAccent[variant]}
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
