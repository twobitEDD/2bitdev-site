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
    label: "Work",
    href: "/#projects",
  },
  {
    label: "Contact",
    href: "/#contact",
  },
];

export const siteConfig = {
  name: "2bitENT",
  legalName: "2bit Entertainment",
  description:
    "Technology, software, branding, and marketing services — from platform architecture and visual identity to campaign production and interactive experiences.",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://2bitENT.com",
  contactEmail: "Admin@2bitENT.com",
  navItems: navItems,
  navMenuItems: navItems,
  links: {
    github: "https://github.com/twobitENT",
    email: "mailto:Admin@2bitENT.com",
    studio: "/#contact",
    portfolio: "https://2bitdev.com",
    fishFight: "https://fishfight.app",
    ergnomes: "https://ergnomes.io",
    pokepocket: "https://pokepocket.cards",
    co2t: "https://co2t.earth",
    co2true: "https://co2true.com",
    ergo: "https://ergo.games",
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
