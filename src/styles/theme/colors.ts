import type { DeepPartial, Theme } from "@chakra-ui/react";

/** extend additional color here */
const extendedColors: DeepPartial<Theme["colors"]> = {
  brand: {
    "50": "#eef4ff",
    "100": "#d6e4ff",
    "200": "#adccff",
    "300": "#84b5ff",
    "400": "#5b9bff",
    "500": "#3b82f6", // brand color
    "600": "#2563eb",
    "700": "#1d4ed8",
    "800": "#1e40af",
    "900": "#1e3a8a",
  },
  accent: {
    red: "#ff4d4d",
    green: "#34d399",
    blue: "#60a5fa",
  },
  neutral: {
    "50": "#f7f7f7",
    "100": "#ededed",
    "200": "#d1d1d1",
    "300": "#a3a3a3",
    "400": "#707070",
    "500": "#4a4a4a",
    "600": "#2a2a2a",
    "700": "#1a1a1a",
    "800": "#101010",
    "900": "#050505",
  },
};

/** override chakra colors here */
const overridenChakraColors: DeepPartial<Theme["colors"]> = {};

export const colors = {
  // default color scheme for SERV Protocol
  servProtocol: {
    ...overridenChakraColors,
    ...extendedColors,
  },
};
