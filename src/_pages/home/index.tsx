"use client";

import { Box, Divider, Flex } from "@chakra-ui/react";
import { BackgroundModeProvider } from "@components/landing-page/BackgroundModeProvider";
import BackgroundModeToggle from "@components/landing-page/BackgroundModeToggle";
import LandingSection from "@components/landing-page/LandingSection";
import PixelFairyBackground from "@components/landing-page/PixelFairyBackground";
import { Community } from "@components/landing-page/Community";
import Features from "@components/landing-page/Features";
import Hero from "@components/landing-page/Hero";
import HighlightSwitchback from "@components/landing-page/HighlightSwitchback";
import { InfoAndStats } from "@components/landing-page/InfoAndStats";
import { PageAnimation } from "@components/motion/PageAnimation";

const Home = () => {
  return (
    <BackgroundModeProvider>
      <PageAnimation>
        <PixelFairyBackground />
        <BackgroundModeToggle />
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
          <LandingSection tone="dark" frameAccent="emerald">
            <Hero />
          </LandingSection>
          <LandingSection tone="light" frameAccent="emerald">
            <Features />
          </LandingSection>
          <LandingSection tone="dark" frameAccent="cyan">
            <HighlightSwitchback />
          </LandingSection>
          <LandingSection tone="light" frameAccent="amber">
            <InfoAndStats />
          </LandingSection>
          <LandingSection tone="dark" frameAccent="magenta">
            <Community />
          </LandingSection>
          <Box p={10} />
          <Divider borderColor="whiteAlpha.300" />
        </Flex>
      </PageAnimation>
    </BackgroundModeProvider>
  );
};

export default Home;
