import { siteConfig } from "./site";

export type StudioProject = {
  title: string;
  link: string;
  summary: string;
  external?: boolean;
};

/** Portfolio-aligned 2bit Entertainment catalog (ed-norris-portfolio source of truth). */
export const studioProjects: StudioProject[] = [
  {
    title: "Fish Fight",
    link: siteConfig.links.fishFight,
    external: true,
    summary:
      "Ocean conservation web game — players navigate currents, protect habitats, and rally around marine stewardship through accessible, playful mechanics.",
  },
  {
    title: "PokePocket",
    link: siteConfig.links.pokepocket,
    external: true,
    summary:
      "Pocket-format collectible card experiences with tight feedback loops, social drops, and production-grade merchandising support.",
  },
  {
    title: "Planet's Core",
    link: siteConfig.links.github,
    external: true,
    summary:
      "Founder-era indie title (2012–2014) — technical design, art integration, and shipping as a small operational studio.",
  },
  {
    title: "ERGnomes",
    link: siteConfig.links.ergnomes,
    external: true,
    summary:
      "NFT ecosystem technical design on the Ergo Platform — art production, front-end, back-end, and trustworthy community interactions.",
  },
];
