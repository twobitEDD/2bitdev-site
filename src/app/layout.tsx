import type { Metadata } from "next";

import "@styles/checkerboard.css";
import "@styles/gas-effects.css";
import Providers from "@app/providers";
import Layout from "@components/app-shell";
import { siteConfig } from "@config/site";
import { fontMono, fontSans } from "@styles/theme/fonts";

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
    var modes = ["dark", "light", "accent", "voxel"];
    var legacy = {
      garden: "light", twilight: "accent", midnight: "dark",
      tessellation: "accent", warp: "accent", "impossible-grid": "dark", birds: "light",
      voxel: "voxel", "ent-mono": "dark", "studio-neon": "accent",
      bloom: "accent", slate: "dark", fracture: "dark",
      ambient: "voxel", glow: "accent", neon: "accent"
    };
    var defaults = {
      dark: { checkerIntensity: 68, fadeAmount: 22, scrollMotion: 36, mouseInfluence: 40 },
      light: { checkerIntensity: 12, fadeAmount: 8, scrollMotion: 8, mouseInfluence: 8 },
      accent: { checkerIntensity: 70, fadeAmount: 18, scrollMotion: 34, mouseInfluence: 42 },
      voxel: { checkerIntensity: 72, fadeAmount: 18, scrollMotion: 38, mouseInfluence: 38 }
    };
    var stored = localStorage.getItem(modeKey);
    var mode = modes.indexOf(stored) >= 0 ? stored : (legacy[stored] || "light");
    document.documentElement.setAttribute("data-bg-mode", mode);
    var effects = defaults[mode] || defaults.dark;
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
    root.style.setProperty("--checker-intensity", String((effects.checkerIntensity ?? 12) / 100));
    root.style.setProperty("--fade-amount", String((effects.fadeAmount ?? 8) / 100));
    root.style.setProperty("--scroll-motion", String((effects.scrollMotion ?? 8) / 100));
    root.style.setProperty("--mouse-influence", String((effects.mouseInfluence ?? 8) / 100));
  } catch (e) {
    document.documentElement.setAttribute("data-bg-mode", "light");
  }
})();
`;

const RootLayout = ({ children }: RootLayoutProps) => {
  return (
    <html
      lang="en"
      data-bg-mode="light"
      suppressHydrationWarning
      className={`${fontSans.variable} ${fontMono.variable}`}
    >
      <body className={fontSans.className}>
        <script dangerouslySetInnerHTML={{ __html: bgModeBootstrapScript }} />
        <Providers>
          <Layout>{children}</Layout>
        </Providers>
      </body>
    </html>
  );
};

export default RootLayout;
