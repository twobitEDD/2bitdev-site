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
      title: "Lorem ipsum dolor sit amet",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse hendrerit eros eget arcu eleifend, ac viverra quam tincidunt.",
      icon: <MagicIcon /* className="text-primary-500"  */ />,
    },
    {
      title: "Sed do eiusmod tempor",
      description:
        "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco.",
      icon: <FlashIcon /* className="text-pink-500" */ />,
    },
    {
      title: "Duis aute irure dolor",
      description:
        "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
      icon: <MoonIcon /* className="text-pink-500" */ />,
    },
    {
      title: "Excepteur sint occaecat",
      description:
        "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
      icon: <DevicesIcon /* className="text-pink-500" */ />,
    },
  ],
  fullFeatures: [
    {
      title: "Lorem ipsum dolor sit amet",
      description: (
        <>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua.
        </>
      ),
      icon: <ServerLinearIcon /* className="text-pink-500" */ />,
    },
    {
      title: "Sed do eiusmod tempor",
      description:
        "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco.",
      icon: <TagUserLinearIcon /* className="text-pink-500" */ />,
    },
    {
      title: "Duis aute irure dolor",
      description:
        "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
      icon: <MouseCircleLinearIcon /* className="text-pink-500" */ />,
    },
    {
      title: "Excepteur sint occaecat",
      description:
        "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
      icon: <CubesLinearIcon /* className="text-pink-500" */ />,
    },
    {
      title: "Lorem ipsum dolor sit amet",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      icon: <CodeDocumentLinearIcon /* className="text-pink-500" */ />,
    },
    {
      title: "Sed do eiusmod tempor",
      description:
        "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco.",
      icon: <HtmlLogoLinearIcon /* className="text-pink-500" */ />,
    },
    {
      title: "Duis aute irure dolor",
      description:
        "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
      icon: <FlashIcon /* className="text-pink-500" */ />,
    },
    {
      title: "Excepteur sint occaecat",
      description:
        "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
      icon: <MagicIcon /* className="text-pink-500" */ />,
    },
  ],
};
