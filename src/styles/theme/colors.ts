import type { DeepPartial, Theme } from "@chakra-ui/react";

/** extend additional color here */
const extendedColors: DeepPartial<
  Record<string, Theme["colors"]["blackAlpha"]>
> = {
  brand: {
    "50": "#fcf2ff",
    "100": "#ecbfff",
    "200": "#dd99ff",
    "300": "#b54dff",
    "400": "#8500ff", // brand color
    "500": "#6f00e6",
    "600": "#5600bf",
    "700": "#400099",
    "800": "#2a0073",
    "900": "#19004a",
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
