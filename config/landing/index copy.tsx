import React from "react";
import { Code } from "@nextui-org/react";
import { MagicIcon } from "@/components/icons/magic";
import { DevicesIcon } from "@/components/icons/devices";
import { FlashIcon } from "@/components/icons/flash";
import { CodeDocumentLinearIcon } from "@/components/icons/linear/code-document";
import { CubesLinearIcon } from "@/components/icons/linear/cubes";
import { HtmlLogoLinearIcon } from "@/components/icons/linear/html-logo";
import { MouseCircleLinearIcon } from "@/components/icons/linear/mouse-circle";
import { ServerLinearIcon } from "@/components/icons/linear/server";
import { TagUserLinearIcon } from "@/components/icons/linear/tag-user";
import { MoonIcon } from "@/components/icons/moon";

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  topFeatures: [
    {
      title: "Themeable",
      description:
        "Provides a plugin to customize default themes, you can change all semantic tokens or create an entire new theme.",
      icon: <MagicIcon /* className="text-primary-500"  */ />,
    },
    {
      title: "Fast",
      description:
        "Built on top of Tailwind CSS, which means no runtime styles, and no unnecessary classes in your bundle.",
      icon: <FlashIcon /* className="text-pink-500" */ />,
    },
    {
      title: "Light & Dark UI",
      description:
        "Automatic dark mode recognition, NextUI automatically changes the theme when detects HTML theme prop changes.",
      icon: <MoonIcon /* className="text-pink-500" */ />,
    },
    {
      title: "Unique DX",
      description:
        "NextUI is fully-typed to minimize the learning curve, and provide the best possible developer experience.",
      icon: <DevicesIcon /* className="text-pink-500" */ />,
    },
  ],
  fullFeatures: [
    {
      title: "React server components",
      description: (
        <>
          All NextUI components already include the{" "}
          <Code>&quot;use client&quot;</Code> directive, which means you can
          import and use them directly in your RSC.
        </>
      ),
      icon: <ServerLinearIcon /* className="text-pink-500" */ />,
    },
    {
      title: "Accessible components",
      description:
        "NextUI components follow the WAI-ARIA guidelines, provide keyboard support and sensible focus management.",
      icon: <TagUserLinearIcon /* className="text-pink-500" */ />,
    },
    {
      title: "Focus interactions",
      description:
        "Focus ring will appear only when user navigates with keyboard or screen reader.",
      icon: <MouseCircleLinearIcon /* className="text-pink-500" */ />,
    },
    {
      title: "Multiple packages",
      description:
        "NextUI is divided into multiple packages, so you can install only the components you need.",
      icon: <CubesLinearIcon /* className="text-pink-500" */ />,
    },
    {
      title: "TypeScript based",
      description:
        "Build type safe applications, NextUI has a fully-typed API to minimize the learning curve, and help you build applications.",
      icon: <CodeDocumentLinearIcon /* className="text-pink-500" */ />,
    },
    {
      title: "Override components tags",
      description:
        "A polymorphic `as` prop is included in all NextUI components.",
      icon: <HtmlLogoLinearIcon /* className="text-pink-500" */ />,
    },
    {
      title: "No runtime styles",
      description:
        "NextUI is based on Tailwind CSS, it means that there are no runtime styles, and no unnecessary classes in your bundle.",
      icon: <FlashIcon /* className="text-pink-500" */ />,
    },
    {
      title: "Beautifully designed",
      description:
        "NextUI components are unique and are not tied to any visual trend or design rule, which makes us unique and of course your projects as well.",
      icon: <MagicIcon /* className="text-pink-500" */ />,
    },
  ],
};
