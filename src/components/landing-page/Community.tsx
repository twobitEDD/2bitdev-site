import { Container, Flex, Stack, SystemProps } from "@chakra-ui/react";
import { Icons } from "@components/icons";
import { FadeIn } from "@components/motion/Animation";
import { siteConfig } from "@config/site";
import { ReactNode } from "react";
import { FeatureCard } from "./Features";
import { Description, Title } from "./Section";

export const Community = () => {
  return (
    <>
      <Stack as={Container} maxW={"3xl"} textAlign={"center"} id="contact">
        <Title>Start the conversation</Title>
        <Description>
          Tell us about the technology, production, or design challenges you
          want to solve. We respond quickly and bring clarity to the next steps.
        </Description>
      </Stack>

      <FadeIn direction="from-bottom-to-top">
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
      </FadeIn>
    </>
  );
};

export const communityAccounts = [
  {
    title: "Email",
    description: "Project inquiries and introductions.",
    icon: <Icons.mail />,
    iconColor: "#60A5FA",
    href: siteConfig.links.email,
    isExternal: true,
  },
  {
    title: "Studio",
    description: "Availability, capabilities, and partnerships.",
    icon: <Icons.messageCircle />,
    iconColor: "#34D399",
    href: siteConfig.links.studio,
    isExternal: false,
  },
  {
    title: "Github",
    description: "Open-source tooling and technical experiments.",
    icon: <Icons.gitHub />,
    iconColor: "#FFFFFF",
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
