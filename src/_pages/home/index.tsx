"use client";

import { Box, Divider, Flex } from "@chakra-ui/react";
import CheckerboardScrollBackground from "@components/landing-page/CheckerboardScrollBackground";
import CheckerboardSection from "@components/landing-page/CheckerboardSection";
import { Community } from "@components/landing-page/Community";
import Features from "@components/landing-page/Features";
import Hero from "@components/landing-page/Hero";
import HighlightSwitchback from "@components/landing-page/HighlightSwitchback";
import { InfoAndStats } from "@components/landing-page/InfoAndStats";
import { PageAnimation } from "@components/motion/PageAnimation";

const Home = () => {
  return (
    <PageAnimation>
      <CheckerboardScrollBackground />
      <Flex
        direction="column"
        alignItems="center"
        justifyContent="center"
        minHeight="70vh"
        gap={16}
        mb={8}
        w="full"
        color="white"
        position="relative"
        zIndex={1}
      >
        <CheckerboardSection variant="black">
          <Hero />
        </CheckerboardSection>
        <CheckerboardSection variant="white">
          <Features />
        </CheckerboardSection>
        <CheckerboardSection variant="black">
          <HighlightSwitchback />
        </CheckerboardSection>
        <CheckerboardSection variant="white">
          <InfoAndStats />
        </CheckerboardSection>
        <CheckerboardSection variant="black">
          <Community />
        </CheckerboardSection>
        <Box p={10} />
        <Divider borderColor="whiteAlpha.300" />
      </Flex>
    </PageAnimation>
  );
};

export default Home;
