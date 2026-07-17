"use client";

import { ReactNode } from "react";

/** Plain wrapper — framer-motion entrance caused hydration mismatches (#418). */
export const PageAnimation = ({ children }: { children: ReactNode }) => {
  return <>{children}</>;
};
