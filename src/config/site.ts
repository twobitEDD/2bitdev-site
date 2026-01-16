export type SiteConfig = typeof siteConfig;

const navItems = [
  {
    label: "Services",
    href: "/#services",
  },
  {
    label: "Capabilities",
    href: "/#capabilities",
  },
  {
    label: "Projects",
    href: "/#projects",
  },
  {
    label: "Contact",
    href: "/#contact",
  },
];

export const siteConfig = {
  name: "2bit entertainment",
  description:
    "Technology integration, consulting, and production for ambitious teams.",
  navItems: navItems, // header links
  navMenuItems: navItems, // drawer links
  links: {
    github: "https://github.com/2bit-entertainment",
    email: "mailto:hello@2bitentertainment.com",
    studio: "/#contact",
    twitter: "https://twitter.com/2bitentertainment",
  },
  maxHeaderWidth: "xl",
  maxContentWidth: "max-w-[1280]",
  // SERV.random server status endpoint (configurable via env var)
  // Note: Server endpoint is /api/status, not /status
  servRandomStatusUrl: process.env.NEXT_PUBLIC_SERV_RANDOM_STATUS_URL || "https://serv-random-production.up.railway.app/api/status",
  // SERV.random requests API endpoint (fetches from serv-random server)
  servRandomRequestsUrl: process.env.NEXT_PUBLIC_SERV_RANDOM_REQUESTS_URL || "https://serv-random-production.up.railway.app/api/requests",
};
