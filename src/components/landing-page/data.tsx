"use client";

import { Icons } from "@components/icons";
import type { ServiceAccent } from "./ServiceVisual";

export const data = {
  topFeatures: [
    {
      title: "Technology Integration",
      description:
        "We design, install, and integrate the technical systems that power complex environments, from infrastructure to live operations.",
      icon: <Icons.slidersHorizontal />,
      accent: "cyan" as ServiceAccent,
      image: "/images/cards/tech-integration.svg",
      imageAlt: "Connected systems and infrastructure integration diagram",
    },
    {
      title: "AI + Automation",
      description:
        "Deploy practical AI workflows, custom tooling, and intelligent automations that keep your team moving fast.",
      icon: <Icons.sun />,
      accent: "magenta" as ServiceAccent,
      image: "/images/cards/ai-automation.svg",
      imageAlt: "AI neural network and automation workflow illustration",
    },
    {
      title: "Interactive Experiences",
      description:
        "Video games, immersive media, and experiential builds tuned for real-world execution.",
      icon: <Icons.media />,
      accent: "amber" as ServiceAccent,
      image: "/images/cards/interactive-experiences.svg",
      imageAlt: "Interactive game screen and controller experience",
    },
    {
      title: "Blockchain Connection",
      description:
        "Wallets, tokenized access, and on-chain integrations that connect experiences to blockchain.",
      icon: <Icons.check />,
      accent: "emerald" as ServiceAccent,
      image: "/images/cards/blockchain.svg",
      imageAlt: "Blockchain network nodes and connection links",
    },
  ],
  fullFeatures: [
    {
      title: "Strategy that aligns with execution",
      description:
        "We translate bold ideas into roadmaps that teams can build against in weeks, not quarters.",
      icon: <Icons.arrowRight />,
    },
    {
      title: "Systems built to scale",
      description:
        "Our infrastructure work keeps operations reliable, from cloud architecture to on-site deployments.",
      icon: <Icons.slidersVertical />,
    },
    {
      title: "Creative technology that ships",
      description:
        "Interactive installations, game builds, and production pipelines designed for launch-ready delivery.",
      icon: <Icons.media />,
    },
    {
      title: "Integrated AI operations",
      description:
        "We select, deploy, and monitor the right AI tooling so it stays reliable in the real world.",
      icon: <Icons.sun />,
    },
    {
      title: "Collaborative delivery",
      description:
        "We operate alongside your team with clear checkpoints, documentation, and training.",
      icon: <Icons.messageCircle />,
    },
    {
      title: "Blockchain-ready experiences",
      description:
        "We connect products to blockchain when it adds trust, ownership, or new revenue models.",
      icon: <Icons.check />,
    },
  ],
};

export const PROJECT_IMAGES: Record<string, { src: string; alt: string }> = {
  "Fish Fight": {
    src: "/images/cards/project-fish-fight.svg",
    alt: "Ocean conservation game with marine habitat illustration",
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
