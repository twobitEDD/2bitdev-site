import type { DeepPartial, Theme } from "@chakra-ui/react";
import { Figtree, Inter } from "next/font/google";

export const fontSans = Inter({
    subsets: ["latin"],
    variable: "--font-sans",
});

export const fontMono = Figtree({
    subsets: ["latin"],
    variable: "--font-mono",
});

export const fonts: DeepPartial<Theme["fonts"]> = {
    heading: fontSans.style.fontFamily,
    body: fontMono.style.fontFamily,
};
