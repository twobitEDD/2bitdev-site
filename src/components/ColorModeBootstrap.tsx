"use client";

import { ColorModeScript, type ThemeConfig } from "@chakra-ui/react";

type ColorModeBootstrapProps = {
  initialColorMode: ThemeConfig["initialColorMode"];
};

export default function ColorModeBootstrap({
  initialColorMode,
}: ColorModeBootstrapProps) {
  return <ColorModeScript initialColorMode={initialColorMode} />;
}
