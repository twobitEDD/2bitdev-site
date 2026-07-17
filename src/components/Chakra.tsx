"use client";

import { ChakraProvider, cookieStorageManager } from "@chakra-ui/react";

import customTheme from "@styles/theme/index";

interface ChakraProps {
  children: React.ReactNode;
}

export const Chakra = ({ children }: ChakraProps) => {
  return (
    <ChakraProvider
      colorModeManager={cookieStorageManager}
      theme={customTheme}
    >
      {children}
    </ChakraProvider>
  );
};
