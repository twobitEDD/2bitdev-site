import type { Metadata } from "next";

import Providers from "@app/providers";
import Layout from "@components/app-shell";

type RootLayoutProps = {
  children: React.ReactNode;
};

const APP_NAME = "SERV Protocol";

export const metadata: Metadata = {
  title: { default: APP_NAME, template: "%s | nextarter-chakra" },
  description: "A Secure Decentralized Online Data Layer",

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
  themeColor: "#FFFFFF",
  openGraph: {
    url: "https://Serv.Services",
    title: "SERV Protocol",
    description: "A Secure Decentralized Online Data Layer",
    images: {
      url: "https://servprotocol.nyc3.cdn.digitaloceanspaces.com/BlockchainImage.jpeg",
      alt: "https://serv.services",
    },
  },
  twitter: {
    creator: "@sozonome",
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
