import { Container, Flex, Stack, SystemProps } from "@chakra-ui/react";
import { DiscordIcon, Icons } from "@components/icons";
import { siteConfig } from "@config/site";
import { ReactNode } from "react";
import { FeatureCard } from "./Features";
import { Description, Title } from "./Section";

export const Community = () => {
  return (
    <>
      <Stack as={Container} maxW={"3xl"} textAlign={"center"}>
        <Title>Community</Title>
        <Description>
          Get involved in our community. Everyone is welcome!
        </Description>
      </Stack>

      <Flex flexWrap="wrap" gridGap={6} justify="center" mt={12}>
        {communityAccounts.map((feat) => (
          <FeatureCard
            heading={feat.title}
            icon={feat.icon}
            iconColor={feat.iconColor}
            description={feat.description}
            href={feat.href}
            isExternal={feat.isExternal}
            key={feat.title}
          />
        ))}
      </Flex>
    </>
  );
};

export const communityAccounts = [
  {
    title: "Twitter",
    description: "For announcements, tips and general information.",
    icon: <Icons.twitter />,
    iconColor: "#00ACEE",
    href: siteConfig.links.twitter,
    isExternal: true,
  },
  {
    title: "Discord",
    description:
      "To get involved in the community, ask questions and share tips.",
    //  icon: <Icons.discord />,
    icon: <DiscordIcon />,

    iconColor: "#7289DA",
    href: siteConfig.links.discord,
    isExternal: true,
  },
  {
    title: "Github",
    description:
      "To report bugs, request features and contribute to the project.",
    icon: <Icons.gitHub />,
    iconColor: "#E7E7E7",
    href: siteConfig.links.github,
    isExternal: true,
  },
];

export interface BaseFeature {
  title: string;
  description?: string;
  icon: ReactNode;
  href?: string;
  onClick?: () => void;
  isExternal: boolean;
}

// Add intersection type
export type FeatureItem =
  | (BaseFeature & { href?: string; onClick?: undefined })
  | (BaseFeature & { href?: undefined; onClick?: () => void });

interface FeaturesGridProps {
  features: FeatureItem[];
  templateColumns?: SystemProps["gridTemplateColumns"];
}
