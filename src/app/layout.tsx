import type { Metadata } from "next";

import Providers from "@app/providers";
import Layout from "@components/app-shell";

type RootLayoutProps = {
  children: React.ReactNode;
};

const APP_NAME = "2bit entertainment";

export const metadata: Metadata = {
  title: { default: APP_NAME, template: "%s | nextarter-chakra" },
  description:
    "Technology integration, consulting, and production for ambitious teams.",

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
  openGraph: {
    url: "https://2bitentertainment.com",
    title: "2bit entertainment",
    description:
      "Technology integration, consulting, and production for ambitious teams.",
    images: {
      url: "/og-image.svg",
      alt: "2bit entertainment",
    },
  },
  twitter: {
    card: "summary_large_image",
  },
};

const RootLayout = ({ children }: RootLayoutProps) => {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Layout>{children}</Layout>
        </Providers>
      </body>
    </html>
  );
};

export default RootLayout;
