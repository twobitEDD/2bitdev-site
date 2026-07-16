import { siteConfig } from "@config/site";

const APP_NAME = siteConfig.name;

const Meta = () => {
  return (
    <>
      <meta name="application-name" content={APP_NAME} />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content={APP_NAME} />
      <meta name="format-detection" content="telephone=no" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="theme-color" content="#050505" />

      <link rel="icon" href="/brand/2bit-icon.svg" type="image/svg+xml" />
      <link rel="apple-touch-icon" href="/brand/apple-touch-icon.svg" />

      <link rel="manifest" href="/manifest.json" />
    </>
  );
};

export default Meta;
