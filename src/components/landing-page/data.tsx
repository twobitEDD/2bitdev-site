"use client";

import { Icons } from "@components/icons";
import type { ServiceAccent } from "./ServiceVisual";

export const data = {
  topFeatures: [
    {
      title: "Technology & Software",
      description:
        "Platform architecture, integrations, and production software — from e-commerce and data pipelines to AI workflows and operational tooling.",
      icon: <Icons.slidersHorizontal />,
      accent: "cyan" as ServiceAccent,
      image: "/images/services/technology-software.svg",
      imageAlt: "Technology platform dashboard with connected software modules",
    },
    {
      title: "Branding & Identity",
      description:
        "Visual identity, mascots, and design systems that give products a distinctive voice — from CO2T's Bigfoot to campaign-ready brand kits.",
      icon: <Icons.sun />,
      accent: "magenta" as ServiceAccent,
      image: "/images/services/branding-identity.svg",
      imageAlt: "Brand identity system with logo grid and visual language",
    },
    {
      title: "Marketing & Campaigns",
      description:
        "Go-to-market assets, interactive product storytelling, and launch programs for brands including Google, adidas, and Dell.",
      icon: <Icons.media />,
      accent: "amber" as ServiceAccent,
      image: "/images/services/marketing-campaigns.svg",
      imageAlt: "Marketing campaign launch with creative assets and analytics",
    },
    {
      title: "Interactive & Games",
      description:
        "Web games, immersive media, and accessible interactive experiences — one pillar of a broader technology and production practice.",
      icon: <Icons.check />,
      accent: "emerald" as ServiceAccent,
      image: "/images/services/interactive-games.svg",
      imageAlt: "Interactive game experience with voxel-style play surface",
    },
  ],
  fullFeatures: [
    {
      title: "Strategy aligned with execution",
      description:
        "We translate bold ideas into roadmaps that teams can build against in weeks, not quarters.",
      icon: <Icons.arrowRight />,
    },
    {
      title: "Systems built to scale",
      description:
        "Cloud architecture, traceability pipelines, and operational software designed for real-world reliability.",
      icon: <Icons.slidersVertical />,
    },
    {
      title: "Brand systems that ship",
      description:
        "Identity, narrative, and visual language that carries from pitch deck through product and campaign.",
      icon: <Icons.media />,
    },
    {
      title: "Integrated AI operations",
      description:
        "We select, deploy, and monitor the right AI tooling so it stays dependable in production.",
      icon: <Icons.sun />,
    },
    {
      title: "Collaborative delivery",
      description:
        "We operate alongside your team with clear checkpoints, documentation, and training.",
      icon: <Icons.messageCircle />,
    },
    {
      title: "Campaign-ready production",
      description:
        "Interactive retail, event experiences, and launch programs engineered for real environments.",
      icon: <Icons.check />,
    },
  ],
};

export const PROJECT_IMAGES: Record<string, { src: string; alt: string }> = {
  "CO2True Platform": {
    src: "/images/cards/project-co2t.svg",
    alt: "CO2True environmental platform with carbon tracking dashboard",
  },
  "ERGO.games": {
    src: "/images/cards/project-ergo.svg",
    alt: "ERGO.games accessible browser game console",
  },
  "Agency Client Work": {
    src: "/images/cards/project-client-work.svg",
    alt: "Agency client work for Google, adidas, and Dell",
  },
  "Fish Fight": {
    src: "/images/cards/project-fish-fight.svg",
    alt: "Ocean conservation game with marine habitat illustration",
  },
  "CO2T Brand Identity": {
    src: "/images/cards/project-co2t-brand.svg",
    alt: "CO2T Bigfoot mascot and brand identity system",
  },
  PokePocket: {
    src: "/images/cards/project-pokepocket.svg",
    alt: "Collectible card game pocket experience artwork",
  },
  "Planet's Core": {
    src: "/images/cards/project-planets-core.svg",
    alt: "Indie game planet and orbital space scene",
  },
  ERGnomes: {
    src: "/images/cards/project-ergnomes.svg",
    alt: "NFT ecosystem gnome characters on Ergo platform",
  },
};
