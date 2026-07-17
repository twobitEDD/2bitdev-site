import type { DeepPartial, Theme } from "@chakra-ui/react";
import { Inter, Roboto_Mono } from "next/font/google";

export const fontMono = Roboto_Mono({
    subsets: ["latin"],
    variable: "--font-mono",
    display: "swap",
})

export const fontSans = Inter({
    subsets: ["latin"],
    variable: "--font-sans",
    display: "swap",
})

export const fonts: DeepPartial<Theme["fonts"]> = {
    heading: fontMono.style.fontFamily,
    body: fontSans.style.fontFamily,
};
