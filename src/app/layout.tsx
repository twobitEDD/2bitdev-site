import type { Metadata } from "next";

import "@styles/fairy-background.css";
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
    var modes = ["garden", "twilight", "midnight"];
    var legacy = {
      tessellation: "garden", warp: "twilight", "impossible-grid": "midnight", birds: "garden",
      voxel: "garden", "ent-mono": "midnight", "studio-neon": "twilight",
      bloom: "twilight", slate: "midnight", fracture: "twilight",
      dark: "midnight", light: "garden", ambient: "garden", glow: "twilight", neon: "twilight"
    };
    var palettes = {
      garden: { bgTop: "#f5f0e8", bgBottom: "#e8dff5", accent: "#ff6eb4" },
      twilight: { bgTop: "#3d3558", bgBottom: "#2a2438", accent: "#c4b5fd" },
      midnight: { bgTop: "#12121a", bgBottom: "#0a0a10", accent: "#22d3ee" }
    };
    var stored = localStorage.getItem(modeKey);
    var mode = modes.indexOf(stored) >= 0 ? stored : (legacy[stored] || "garden");
    document.documentElement.setAttribute("data-bg-mode", mode);
    var palette = palettes[mode] || palettes.garden;
    var danceSpeed = 45;
    try {
      var raw = localStorage.getItem(effectsKey);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed && parsed.settings && typeof parsed.settings.danceSpeed === "number") {
          danceSpeed = parsed.settings.danceSpeed;
        }
      }
    } catch (e2) {}
    var root = document.documentElement;
    root.style.setProperty("--fairy-bg-top", palette.bgTop);
    root.style.setProperty("--fairy-bg-bottom", palette.bgBottom);
    root.style.setProperty("--theme-accent", palette.accent);
    root.style.setProperty("--glow-strength", String(0.15 + (danceSpeed / 100) * 0.25));
  } catch (e) {
    document.documentElement.setAttribute("data-bg-mode", "garden");
  }
})();
`;

const RootLayout = ({ children }: RootLayoutProps) => {
  return (
    <html lang="en" data-bg-mode="garden" suppressHydrationWarning>
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
