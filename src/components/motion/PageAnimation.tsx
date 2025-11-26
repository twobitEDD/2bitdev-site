"use client";

import { ReactNode } from "react";
import { MotionBox } from "./MotionBox";

export const PageAnimation = ({ children }: { children: ReactNode }) => {
  // Always start with opacity: 1 to ensure content is visible immediately
  // Only animate the y position for a subtle entrance effect
  // This prevents the page from appearing broken if animation doesn't trigger
  return (
    <MotionBox
      initial={{ opacity: 1, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15 }}
      transition={{ delay: 0.1, duration: 0.3 }}
    >
      {children}
    </MotionBox>
  );
};
