"use client";

/* eslint-disable react/display-name */
import { Button, Link as NextUILink } from "@nextui-org/react";
import Link from "next/link";

import { FeaturesGrid } from "./features-grid";

import {
  sectionWrapper,
  subtitle,
  title,
  titleWrapper,
} from "@/components/primitives";
import { EyeBoldIcon } from "../icons/bold/eye";
import { FatrowsBoldIcon } from "../icons/bold/fatrows";
import { KeyboardBoldIcon } from "../icons/bold/keyboard";
import { KeyboardOpenBoldIcon } from "../icons/bold/keyboard-open";
import { MouseCircleBoldIcon } from "../icons/bold/mouse-circle";
import { SquaresBoldIcon } from "../icons/bold/squares";

const features = [
  {
    title: "Keyboard navigation",
    icon: <KeyboardBoldIcon />,
  },
  {
    title: "Managed focus",
    icon: <MouseCircleBoldIcon />,
  },
  {
    title: "Collision aware",
    icon: <SquaresBoldIcon />,
  },
  {
    title: "Alignment control",
    icon: <FatrowsBoldIcon />,
  },
  {
    title: "Screen reader support",
    icon: <EyeBoldIcon />,
  },
  {
    title: "Typehead support",
    icon: <KeyboardOpenBoldIcon />,
  },
];

export const A11yOtb = () => {
  return (
    <section className={sectionWrapper({ class: "z-20 mt-16 lg:mt-44" })}>
      <div className="flex flex-col gap-8 ">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            <FeaturesGrid
              classNames={{
                base: "grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4",
                header: "pb-3",
                // card: "bg-white dark:bg-default-400/10",
                iconWrapper:
                  //   "bg-default-100 dark:bg-transparent text-secondary-500/50",
                  "bg-default-100 dark:bg-transparent text-secondary",
              }}
              features={features}
            />
            <Button
              aria-label="Learn more about accessibility"
              as={Link}
              className="max-w-fit"
              color="secondary"
              href="/"
              radius="full"
              size="sm"
              variant="flat"
            >
              Learn more
            </Button>
          </div>
          <div className="ml-12">
            <div className={titleWrapper()}>
              <h1 className={title({ size: "lg" })}>Some large text with</h1>
              <div>
                <h1 className={title({ color: "secondary", size: "lg" })}>
                  secondary&nbsp;
                </h1>
                <h1 className={title({ size: "lg" })}>color.</h1>
              </div>
            </div>
            <p className={subtitle()}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
              <NextUILink
                isExternal
                className="text-xl  font-light text-secondary [&>svg]:ml-1"
                href="/"
                underline="always"
              >
                Some Link
              </NextUILink>
              &nbsp;ensuring exceptional accessibility support as a top
              priority.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
