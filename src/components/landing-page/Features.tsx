"use client";

import { Box, Container, Flex, Heading, Stack, Text } from "@chakra-ui/react";
import { ReactElement } from "react";
import { Description, SuperTitle, Title } from "./Section";
import Link from "next/link";

import { FadeIn } from "@components/motion/Animation";
import { siteConfig } from "@config/site";
import { data } from "./data";

interface CardProps {
  heading: string;
  description: string;
  icon: ReactElement;
  iconColor?: string;
  href?: string;
  isExternal?: boolean;
}

export const FeatureCard = ({
  heading,
  description,
  icon,
  iconColor,
  href,
  isExternal,
}: CardProps) => {
  const cardBg = "blackAlpha.700";

  const CardContent = (
    <Box
      maxW={{ base: "full", md: "275px" }}
      w={"full"}
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      p={6}
      mb={100}
      bg={cardBg}
      borderColor="whiteAlpha.200"
      _hover={href ? { borderColor: "brand.400", cursor: "pointer" } : {}}
    >
      <Stack align={"start"} spacing={2}>
        <Flex
          direction={"row"}
          justifyContent={"flex-start"}
          alignItems={"center"}
          gap={"0.75rem"}
        >
          <Flex
            w={10}
            minW={10}
            h={10}
            minH={10}
            align={"center"}
            justify={"center"}
            color={iconColor || "brand.300"}
            rounded={"full"}
            bg="blackAlpha.600"
          >
            {icon}
          </Flex>
          <Heading size="md" color="white">
            {heading}
          </Heading>
        </Flex>
        <Box mt={2}>
          <Text mt={1} fontSize={"sm"} color={"gray.300"}>
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
    <>
      <Stack as={Container} maxW={"3xl"} textAlign={"center"} id="services">
        <SuperTitle>Services</SuperTitle>
        <Title>Full-spectrum technology support</Title>
        <Description>
          {siteConfig.legalName} delivers consulting, production, and technical
          integration for teams that need expert execution across games,
          interactive media, and software.
          <Text></Text>
        </Description>
      </Stack>

      <FadeIn direction="from-bottom-to-top">
        <Flex flexWrap="wrap" gridGap={6} justify="center" mt={12}>
          {data.topFeatures.map((feat, index: number) => (
            <FeatureCard
              heading={feat.title}
              icon={feat.icon}
              description={feat.description}
              href={(feat as { href?: string }).href}
              key={feat.title}
            />
          ))}
        </Flex>
      </FadeIn>
    </>
  );
}
