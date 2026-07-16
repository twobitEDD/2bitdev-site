import type { Metadata } from "next";

import "@styles/checkerboard.css";
import Providers from "@app/providers";
import Layout from "@components/app-shell";
import { siteConfig } from "@config/site";

type RootLayoutProps = {
  children: React.ReactNode;
};

const APP_NAME = siteConfig.name;

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: { default: APP_NAME, template: `%s | ${APP_NAME}` },
  description: siteConfig.description,

  viewport: {
    width: "device-width",
    initialScale: 1,
  },
  applicationName: APP_NAME,
  appleWebApp: {
    capable: true,
    title: APP_NAME,
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
  },
  themeColor: "#3d3850",
  icons: {
    icon: [{ url: "/brand/2bit-icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/brand/apple-touch-icon.svg", type: "image/svg+xml" }],
  },
  manifest: "/manifest.json",
  openGraph: {
    url: siteConfig.siteUrl,
    title: APP_NAME,
    description: siteConfig.description,
    images: {
      url: "/og-image.svg",
      alt: APP_NAME,
    },
  },
  twitter: {
    card: "summary_large_image",
  },
};

const bgModeBootstrapScript = `
(function () {
  try {
    var modeKey = "2bitent-bg-mode";
    var effectsKey = "2bitent-bg-effects";
    var modes = ["voxel", "ent-mono", "studio-neon", "bloom", "slate", "fracture"];
    var legacy = { dark: "ent-mono", light: "ent-mono", ambient: "voxel", glow: "studio-neon", neon: "studio-neon" };
    var defaults = {
      voxel: { checkerIntensity: 80, fadeAmount: 20, colorSaturation: 55, glowStrength: 26, scrollMotion: 68 },
      "ent-mono": { checkerIntensity: 72, fadeAmount: 28, colorSaturation: 42, glowStrength: 22, scrollMotion: 58 },
      "studio-neon": { checkerIntensity: 74, fadeAmount: 12, colorSaturation: 82, glowStrength: 88, scrollMotion: 38 },
      bloom: { checkerIntensity: 76, fadeAmount: 18, colorSaturation: 68, glowStrength: 48, scrollMotion: 62 },
      slate: { checkerIntensity: 64, fadeAmount: 26, colorSaturation: 32, glowStrength: 16, scrollMotion: 44 },
      fracture: { checkerIntensity: 78, fadeAmount: 22, colorSaturation: 52, glowStrength: 28, scrollMotion: 42 }
    };
    var stored = localStorage.getItem(modeKey);
    var mode = modes.indexOf(stored) >= 0 ? stored : (legacy[stored] || "voxel");
    document.documentElement.setAttribute("data-bg-mode", mode);
    var effects = defaults[mode];
    try {
      var raw = localStorage.getItem(effectsKey);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed && parsed.mode === mode && parsed.settings) {
          effects = Object.assign({}, effects, parsed.settings);
        }
      }
    } catch (e2) {}
    var root = document.documentElement;
    root.style.setProperty("--checker-intensity", String((effects.checkerIntensity || 72) / 100));
    root.style.setProperty("--fade-amount", String((effects.fadeAmount || 28) / 100));
    root.style.setProperty("--color-saturation", String((effects.colorSaturation || 42) / 100));
    root.style.setProperty("--glow-strength", String((effects.glowStrength || 22) / 100));
    root.style.setProperty("--scroll-motion", String((effects.scrollMotion || 58) / 100));
  } catch (e) {
    document.documentElement.setAttribute("data-bg-mode", "voxel");
  }
})();
`;

const RootLayout = ({ children }: RootLayoutProps) => {
  return (
    <html lang="en" data-bg-mode="voxel" suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: bgModeBootstrapScript }} />
        <Providers>
          <Layout>{children}</Layout>
        </Providers>
      </body>
    </html>
  );
};

export default RootLayout;
