import type { Metadata } from "next";

import "@styles/escher-background.css";
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
    var modes = ["tessellation", "warp", "impossible-grid", "birds"];
    var legacy = {
      voxel: "tessellation", "ent-mono": "impossible-grid", "studio-neon": "birds",
      bloom: "warp", slate: "impossible-grid", fracture: "warp",
      dark: "impossible-grid", light: "tessellation", ambient: "tessellation",
      glow: "birds", neon: "birds"
    };
    var defaults = {
      tessellation: { contrast: 52, magneticStrength: 58, driftSpeed: 42, scrollMotion: 55 },
      warp: { contrast: 64, magneticStrength: 72, driftSpeed: 48, scrollMotion: 55 },
      "impossible-grid": { contrast: 72, magneticStrength: 48, driftSpeed: 35, scrollMotion: 55 },
      birds: { contrast: 55, magneticStrength: 65, driftSpeed: 52, scrollMotion: 55 }
    };
    var stored = localStorage.getItem(modeKey);
    var mode = modes.indexOf(stored) >= 0 ? stored : (legacy[stored] || "tessellation");
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
    root.style.setProperty("--attractor-strength", String((effects.magneticStrength || 58) / 100));
    root.style.setProperty("--attractor-contrast", String((effects.contrast || 58) / 100));
    root.style.setProperty("--attractor-drift", String((effects.driftSpeed || 42) / 100));
    root.style.setProperty("--attractor-scroll", String((effects.scrollMotion || 55) / 100));
    root.style.setProperty("--glow-strength", String(0.12 + ((effects.contrast || 58) / 100) * 0.35));
  } catch (e) {
    document.documentElement.setAttribute("data-bg-mode", "tessellation");
  }
})();
`;

const RootLayout = ({ children }: RootLayoutProps) => {
  return (
    <html lang="en" data-bg-mode="tessellation" suppressHydrationWarning>
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
