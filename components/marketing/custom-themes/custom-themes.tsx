"use client";

/* eslint-disable react/display-name */
import {
  Button,
  Card,
  CardBody,
  Image,
  Radio,
  RadioGroup,
  Tab,
} from "@nextui-org/react";
import { useMemo, useState } from "react";

import NextImage from "next/image";
import NextLink from "next/link";

import { cardStyles } from "./styles";

import {
  sectionWrapper,
  subtitle,
  title,
  titleWrapper,
} from "@/components/primitives";

import { CircularProgress } from "@/components/circular-progress";
import { Logo } from "@/components/icons";
import { StarIcon } from "@/components/icons/star";
import { useIsMobile } from "@/hooks/use-media-query";

const themesTabs = (isMobile: boolean) => [
  {
    id: "nextui",
    title: () => (
      <p className="group-data-[selected=true]:text-primary">NextUI</p>
    ),
    icon: () => (
      <Logo
        // small
        className="text-default-400 group-data-[selected=true]:text-primary"
        size={isMobile ? 34 : 44}
      />
    ),
  },
];

type Theme = "nextui" | "modern" | "elegant" | "retro";
type Tab = { id: string; title: () => JSX.Element; icon: () => JSX.Element };

const itemSizes = ["xs", "s", "m", "l", "xl"];

const CustomThemesExample = ({
  selectedTheme,
}: {
  tabs: Tab[];
  selectedTheme: Theme;
}) => {
  const [liked, setLiked] = useState(false);

  const slots = useMemo(
    () =>
      cardStyles({
        theme: selectedTheme as Theme,
      }),
    [selectedTheme]
  );

  return (
    <div className="flex flex-col gap-6 ">
      <Card className={slots.wrapper()} radius="lg">
        <CardBody className="relative flex-col gap-4 overflow-visible md:flex-row md:items-center md:gap-9">
          <div className={slots.imageWrapper()}>
            <Image
              fill
              removeWrapper
              alt="Shoes theme example"
              as={NextImage}
              className={slots.img()}
              sizes="100vw"
              src="/images/shoes-1.png"
            />
          </div>
          <div className={slots.contentWrapper()}>
            <div className="relative flex flex-wrap items-baseline">
              <h1 className={slots.title()}>Foo Bar 2.0</h1>
              <p className={slots.description()}>
                Consistent, customized, game-changing.
              </p>
              <p className={slots.price()}>$279.97</p>
              <p className={slots.previousPrice()}>$350</p>
              <p className={slots.percentOff()}>20% off</p>
            </div>
            <RadioGroup
              aria-label="select size"
              classNames={{
                base: "my-4",
              }}
              defaultValue="xs"
              orientation="horizontal"
            >
              {itemSizes.map((itemSize) => (
                <Radio
                  key={itemSize}
                  classNames={{
                    wrapper: "hidden",
                    labelWrapper: slots.sizeOption(),
                    label: slots.sizeOptionLabel(),
                  }}
                  value={itemSize}
                >
                  {itemSize.toUpperCase()}
                </Radio>
              ))}
            </RadioGroup>
            <div className="flex space-x-4">
              <Button
                className={slots.buyButton()}
                color="primary"
                variant={selectedTheme === "nextui" ? "shadow" : "solid"}
              >
                Buy now
              </Button>
              <Button
                className={slots.addToBagButton()}
                color="primary"
                radius="full"
                variant="bordered"
              >
                Add to bag
              </Button>
            </div>
          </div>
          <Button
            isIconOnly
            aria-label="like"
            className={slots.starButton()}
            data-liked={liked}
            radius="full"
            variant="light"
            onPress={() => setLiked((v) => !v)}
          >
            <StarIcon fill={liked ? "currentColor" : "none"} size={20} />
          </Button>
        </CardBody>
      </Card>
      <Button
        aria-label="Learn more about theme customization"
        as={NextLink}
        className={slots.learnMoreButton()}
        color="default"
        href="/"
        radius="full"
        size="sm"
        variant="flat"
      >
        Learn more
      </Button>
    </div>
  );
};

export const CustomThemes = () => {
  const isMobile = useIsMobile();

  const tabs = themesTabs(isMobile);
  const [selectedTheme, setSelectedTheme] = useState<Theme>(
    tabs[0].id as Theme
  );

  return (
    <section className={sectionWrapper({ class: "mt-24 lg:mt-56" })}>
      <div className="flex flex-col gap-8">
        <div>
          <div className={titleWrapper()}>
            <h1 className={title({ size: "lg" })}>Some large text with</h1>
            <div>
              <h1 className={title({ color: "primary", size: "lg" })}>
                primary&nbsp;
              </h1>
              <h1 className={title({ size: "lg" })}>color.</h1>
            </div>
          </div>
          <p className={subtitle()}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <CustomThemesExample selectedTheme={selectedTheme} tabs={tabs} />
          <div className="flex flex-row justify-evenly">
            {[76, 33].map((value) => (
              <CircularProgress value={value} key={value} />
            ))}
          </div>
        </div>
      </div>
      <div className="h-full dark:md:block absolute hidden -bottom-[10%] -left-[15%] -z-[1]">
        <Image
          removeWrapper
          alt="custom themes background"
          className="h-full"
          src="/SERV Logo V1Dark.svg"
        />
      </div>
    </section>
  );
};
