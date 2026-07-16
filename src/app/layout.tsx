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
  themeColor: "#050505",
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
    var key = "2bitent-bg-mode";
    var modes = ["dark", "light", "fracture", "ambient"];
    var stored = localStorage.getItem(key);
    var mode = modes.indexOf(stored) >= 0 ? stored : "dark";
    document.documentElement.setAttribute("data-bg-mode", mode);
  } catch (e) {
    document.documentElement.setAttribute("data-bg-mode", "dark");
  }
})();
`;

const RootLayout = ({ children }: RootLayoutProps) => {
  return (
    <html lang="en" data-bg-mode="dark" suppressHydrationWarning>
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
