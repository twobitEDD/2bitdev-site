"use client";

import { AnimatePresence } from "framer-motion";
import { ReactNode } from "react";
import { MotionBox } from "./MotionBox";

export const PageAnimation = ({ children }: { children: ReactNode }) => (
    <>
        <AnimatePresence>
            <MotionBox
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                transition={{ delay: 0.25 }}
            >
                {children}
            </MotionBox>
        </AnimatePresence>
    </>
);