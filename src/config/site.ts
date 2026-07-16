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
  name: "2bitDEV",
  legalName: "2bit Entertainment",
  description:
    "Indie games, interactive experiences, and software production — from Planet's Core and Fish Fight to agency-backed work for Google, Dell, and Washington University.",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://2bitDEV.com",
  navItems: navItems,
  navMenuItems: navItems,
  links: {
    github: "https://github.com/twobitENT",
    email: "mailto:EddNorris@2bitdev.com",
    studio: "/#contact",
    fishFight: "https://fishfight.app",
    ergnomes: "https://ergnomes.io",
    pokepocket: "https://pokepocket.cards",
  },
  maxHeaderWidth: "xl",
  maxContentWidth: "max-w-[1280]",
  servRandomStatusUrl:
    process.env.NEXT_PUBLIC_SERV_RANDOM_STATUS_URL ||
    "https://serv-random-production.up.railway.app/api/status",
  servRandomRequestsUrl:
    process.env.NEXT_PUBLIC_SERV_RANDOM_REQUESTS_URL ||
    "https://serv-random-production.up.railway.app/api/requests",
};
