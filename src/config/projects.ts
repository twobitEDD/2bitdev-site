import { siteConfig } from "./site";

export type WorkCategory = "tech" | "brand" | "marketing" | "interactive";

export type StudioProject = {
  title: string;
  link: string;
  summary: string;
  category: WorkCategory;
  external?: boolean;
};

const CATEGORY_LABELS: Record<WorkCategory, string> = {
  tech: "Technology",
  brand: "Branding",
  marketing: "Marketing",
  interactive: "Interactive",
};

export function getCategoryLabel(category: WorkCategory): string {
  return CATEGORY_LABELS[category];
}

/** Portfolio-aligned 2bitENT work catalog (ed-norris-portfolio source of truth). */
export const studioProjects: StudioProject[] = [
  {
    title: "CO2True Platform",
    link: siteConfig.links.co2true,
    external: true,
    category: "tech",
    summary:
      "End-to-end environmental platform — software architecture, e-commerce, carbon credit infrastructure, and brand identity for CO2T.earth and CO2True.com.",
  },
  {
    title: "ERGO.games",
    link: siteConfig.links.ergo,
    external: true,
    category: "interactive",
    summary:
      "Accessible browser-based game console with entitlements, catalog systems, and human-centered UX for independent web games.",
  },
  {
    title: "Agency Client Work",
    link: siteConfig.links.portfolio,
    external: true,
    category: "marketing",
    summary:
      "Contract production through Nice Touch, Uncorked, and other agencies — interactive experiences for Google, adidas, Dell, and Washington University.",
  },
  {
    title: "Fish Fight",
    link: siteConfig.links.fishFight,
    external: true,
    category: "interactive",
    summary:
      "Ocean conservation web game — players navigate currents, protect habitats, and rally around marine stewardship through accessible, playful mechanics.",
  },
  {
    title: "CO2T Brand Identity",
    link: siteConfig.links.co2t,
    external: true,
    category: "brand",
    summary:
      "Bigfoot mascot, visual identity, and product UX designed from scratch for CO2T's soil additive and carbon capture business.",
  },
  {
    title: "PokePocket",
    link: siteConfig.links.pokepocket,
    external: true,
    category: "interactive",
    summary:
      "Pocket-format collectible card experiences with tight feedback loops, social drops, and production-grade merchandising support.",
  },
  {
    title: "ERGnomes",
    link: siteConfig.links.ergnomes,
    external: true,
    category: "interactive",
    summary:
      "NFT ecosystem technical design on the Ergo Platform — art production, front-end, back-end, and trustworthy community interactions.",
  },
  {
    title: "Planet's Core",
    link: siteConfig.links.github,
    external: true,
    category: "interactive",
    summary:
      "Founder-era indie title (2012–2014) — technical design, art integration, and shipping as a small operational studio.",
  },
];
