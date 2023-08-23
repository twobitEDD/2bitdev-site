"use client";

import { Box, Divider, Flex } from "@chakra-ui/react";
import { Community } from "@components/landing-page/Community";
import Features from "@components/landing-page/Features";
import Hero from "@components/landing-page/Hero";
import HighlightSwitchback from "@components/landing-page/HighlightSwitchback";
import { InfoAndStats } from "@components/landing-page/InfoAndStats";
import { PageAnimation } from "@components/motion/PageAnimation";

const Home = () => {
    return (
        <PageAnimation>
            <Flex
                direction="column"
                alignItems="center"
                justifyContent="center"
                minHeight="70vh"
                gap={16}
                mb={8}
                w="full"
            >
                <Hero />
                <Features />
                <HighlightSwitchback />
                <InfoAndStats />
                <Community />
                <Box p={10} />
                <Divider />
            </Flex>
        </PageAnimation>
    );
};

export default Home;
