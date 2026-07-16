"use client";

import { Box, Container, Flex, Heading, SimpleGrid, Stack, Text } from "@chakra-ui/react";
import { ReactElement } from "react";
import { Description, SuperTitle, Title } from "./Section";
import Link from "next/link";

import { FadeIn } from "@components/motion/Animation";
import { siteConfig } from "@config/site";
import { data } from "./data";
import {
  SERVICE_ACCENTS,
  ServiceVisual,
  type ServiceAccent,
} from "./ServiceVisual";

interface CardProps {
  heading: string;
  description: string;
  icon: ReactElement;
  accent?: ServiceAccent;
  iconColor?: string;
  href?: string;
  isExternal?: boolean;
}

export const FeatureCard = ({
  heading,
  description,
  icon,
  accent,
  iconColor,
  href,
  isExternal,
}: CardProps) => {
  const isServiceCard = Boolean(accent);
  const accentMeta = accent ? SERVICE_ACCENTS[accent] : null;

  const CardContent = isServiceCard && accentMeta ? (
    <Box
      className="service-card"
      maxW={{ base: "full", md: "280px" }}
      w="full"
      style={
        {
          "--service-accent": accentMeta.color,
          "--service-glow": accentMeta.glow,
          "--service-gradient": accentMeta.gradient,
        } as React.CSSProperties
      }
    >
      <ServiceVisual accent={accent!} />
      <Stack align="start" spacing={3} className="service-card__body">
        <Flex
          direction="row"
          justifyContent="flex-start"
          alignItems="center"
          gap="0.75rem"
        >
          <Flex
            className="service-card__icon"
            w={11}
            minW={11}
            h={11}
            minH={11}
            align="center"
            justify="center"
            color={accentMeta.color}
            rounded="xl"
          >
            {icon}
          </Flex>
          <Heading size="md" className="service-card__heading">
            {heading}
          </Heading>
        </Flex>
        <Text fontSize="sm" className="service-card__description">
          {description}
        </Text>
      </Stack>
    </Box>
  ) : (
    <Box
      maxW={{ base: "full", md: "275px" }}
      w="full"
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      p={6}
      mb={100}
      bg="blackAlpha.700"
      borderColor="whiteAlpha.200"
      _hover={href ? { borderColor: "brand.400", cursor: "pointer" } : {}}
    >
      <Stack align="start" spacing={2}>
        <Flex direction="row" justifyContent="flex-start" alignItems="center" gap="0.75rem">
          <Flex
            w={10}
            minW={10}
            h={10}
            minH={10}
            align="center"
            justify="center"
            color={iconColor || "brand.300"}
            rounded="full"
            bg="blackAlpha.600"
          >
            {icon}
          </Flex>
          <Heading size="md" color="white">
            {heading}
          </Heading>
        </Flex>
        <Box mt={2}>
          <Text mt={1} fontSize="sm" color="gray.300">
            {description}
          </Text>
        </Box>
      </Stack>
    </Box>
  );

  if (href) {
    if (isExternal) {
      return (
        <Box as="a" href={href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
          {CardContent}
        </Box>
      );
    }
    return (
      <Box as={Link} href={href} style={{ textDecoration: "none" }}>
        {CardContent}
      </Box>
    );
  }

  return CardContent;
};

export default function Features() {
  return (
    <Box className="services-section" w="full">
      <Stack
        as={Container}
        maxW="3xl"
        textAlign="center"
        id="services"
        className="services-section__header"
      >
        <SuperTitle>Services</SuperTitle>
        <Title>Full-spectrum technology support</Title>
        <Description>
          {siteConfig.legalName} delivers consulting, production, and technical
          integration for teams that need expert execution across games,
          interactive media, and software.
        </Description>
      </Stack>

      <FadeIn direction="from-bottom-to-top">
        <Container maxW="6xl" mt={12}>
          <SimpleGrid
            columns={{ base: 1, sm: 2, lg: 4 }}
            spacing={{ base: 6, md: 8 }}
            className="services-section__grid"
          >
            {data.topFeatures.map((feat) => (
              <FeatureCard
                heading={feat.title}
                icon={feat.icon}
                description={feat.description}
                accent={feat.accent}
                href={(feat as { href?: string }).href}
                key={feat.title}
              />
            ))}
          </SimpleGrid>
        </Container>
      </FadeIn>
    </Box>
  );
}
