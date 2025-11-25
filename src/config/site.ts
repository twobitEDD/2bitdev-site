export type SiteConfig = typeof siteConfig;

const navItems = [
  {
    label: "Services",
    href: "https://serv.services",
  },
  {
    label: "SERV.random",
    href: "/random",
  },
  {
    label: "Features",
    href: "/#/page1",
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
    forum: "https://forum.servprotocol.com",
  },
  maxHeaderWidth: "xl",
  maxContentWidth: "max-w-[1280]",
  // SERV.random server status endpoint (configurable via env var)
  servRandomStatusUrl: process.env.NEXT_PUBLIC_SERV_RANDOM_STATUS_URL || "https://serv-random-production.up.railway.app/status",
  // SERV.random requests API endpoint (fetches from serv-random server)
  servRandomRequestsUrl: process.env.NEXT_PUBLIC_SERV_RANDOM_REQUESTS_URL || "https://serv-random-production.up.railway.app/api/requests",
};
