export type SiteConfig = typeof siteConfig;

const navItems = [
  {
    label: "Services",
    href: "https://serv.services",
  },
  {
    label: "Features",
    href: "/features",
  },
  {
    label: "Docs",
    href: "/docs",
  },
  {
    label: "Blog",
    href: "/blog",
  },
  {
    label: "About",
    href: "/about",
  },
];

export const siteConfig = {
  name: "SERV Protocol",
  description:
    "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium .",
  navItems: navItems, // header links
  navMenuItems: navItems, // drawer links
  links: {
    github: "https://github.com/ServProtocol",
    twitter: "https://twitter.com/ServProtocol",
    docs: "https://servprotocol.com/docs",
    discord: "https://discord.gg/uFH988AfJA",
  },
  maxHeaderWidth: "xl",
  maxContentWidth: "max-w-[1280]",
};
