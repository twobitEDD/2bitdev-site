import { Box, Button, Flex, SimpleGrid, Stack, Text } from "@chakra-ui/react";
import Image from "next/image";
import { FadeIn } from "@components/motion/Animation";
import Link from "next/link";
import { Description, Title } from "./Section";

const HIGHLIGHT_VISUALS = [
  {
    src: "/images/cards/integration-map.svg",
    alt: "Integration map showing connected signal and infrastructure nodes",
  },
  {
    src: "/images/cards/ai-operations.svg",
    alt: "AI operations dashboard with automation metrics",
  },
  {
    src: "/images/cards/production-stack.svg",
    alt: "Production stack with spatial and digital output layers",
  },
];

export default function HighlightSwitchback() {
  return (
    <Flex
      w="full"
      justifyContent="center"
      alignItems="center"
    >
      <Box
        px={{ base: 0, md: 2 }}
        py={{ base: 4, md: 8 }}
        mx="auto"
        id="capabilities"
        w="full"
      >
        <FadeIn direction="from-bottom-to-top">
          <SimpleGrid
            alignItems="center"
            columns={{ base: 1, md: 2 }}
            mb={16}
            spacingY={{ base: 10, md: 16 }}
            spacingX={{ base: 10, md: 16 }}
          >
            <Box>
              <Title>Integration that feels effortless</Title>
              <Description>
                We step into complex environments and connect the systems
                underneath. From construction tech to operational tooling, we
                wire the hardware, software, and data flow to work as one.
              </Description>
              <Link
                nonce="false"
                href={"#contact"}
                passHref
                key={"#contact"}
              >
                <Button
                  w={{ base: "full", sm: "auto" }}
                  mt="8"
                  size="lg"
                  variant="solid"
                >
                  Schedule a consult
                </Button>
              </Link>
            </Box>
            <Box className="highlight-visual">
              <Image
                src={HIGHLIGHT_VISUALS[0].src}
                alt={HIGHLIGHT_VISUALS[0].alt}
                width={480}
                height={180}
                style={{ width: "100%", height: "auto", display: "block" }}
              />
              <Stack spacing={2} p={4} align="flex-start">
                <Text fontSize="sm" textTransform="uppercase" color="gray.400">
                  Integration map
                </Text>
                <Text fontSize="sm" color="gray.400">
                  Sensor networks, edge compute, and real-time dashboards that
                  stay online.
                </Text>
              </Stack>
            </Box>
          </SimpleGrid>
        </FadeIn>

        <FadeIn direction="from-bottom-to-top">
          <SimpleGrid
            alignItems="center"
            columns={{ base: 1, md: 2 }}
            mb={16}
            spacingY={{ base: 10, md: 16 }}
            spacingX={{ base: 10, md: 16 }}
          >
            <Box order={{ base: "initial", md: 2 }}>
              <Title>AI systems that stay reliable</Title>
              <Description>
                We bring applied AI into production environments without
                compromising security or uptime. From orchestration to
                observability, we turn tools into dependable systems.
              </Description>
              <Link
                nonce="false"
                href={"#contact"}
                passHref
                key={"#contact"}
              >
                <Button
                  w={{ base: "full", sm: "auto" }}
                  mt="8"
                  size="lg"
                  variant="solid"
                >
                  Plan an AI rollout
                </Button>
              </Link>
            </Box>
            <Box className="highlight-visual" order={{ base: "initial", md: 1 }}>
              <Image
                src={HIGHLIGHT_VISUALS[1].src}
                alt={HIGHLIGHT_VISUALS[1].alt}
                width={480}
                height={180}
                style={{ width: "100%", height: "auto", display: "block" }}
              />
              <Stack spacing={2} p={4} align="flex-start">
                <Text fontSize="sm" textTransform="uppercase" color="gray.400">
                  AI operations
                </Text>
                <Text fontSize="sm" color="gray.400">
                  Model deployment, feedback loops, and measurable outcomes.
                </Text>
              </Stack>
            </Box>
          </SimpleGrid>
        </FadeIn>

        <FadeIn direction="from-bottom-to-top">
          <SimpleGrid
            alignItems="center"
            columns={{ base: 1, md: 2 }}
            spacingY={{ base: 10, md: 16 }}
            spacingX={{ base: 10, md: 16 }}
          >
            <Box>
              <Title>Production and design that delivers</Title>
              <Description>
                We produce the physical and digital layers that connect people
                to technology. Expect modern aesthetics, clear documentation,
                and hands-on delivery from design through install.
              </Description>
              <Link
                nonce="false"
                href={"#contact"}
                passHref
                key={"#contact"}
              >
                <Button
                  w={{ base: "full", sm: "auto" }}
                  mt="8"
                  size="lg"
                  variant="solid"
                >
                  Start production
                </Button>
              </Link>
            </Box>
            <Box className="highlight-visual">
              <Image
                src={HIGHLIGHT_VISUALS[2].src}
                alt={HIGHLIGHT_VISUALS[2].alt}
                width={480}
                height={180}
                style={{ width: "100%", height: "auto", display: "block" }}
              />
              <Stack spacing={2} p={4} align="flex-start">
                <Text fontSize="sm" textTransform="uppercase" color="gray.400">
                  Production stack
                </Text>
                <Text fontSize="sm" color="gray.400">
                  Lighting, fabrication, interactive media, and blockchain
                  touchpoints engineered for real environments.
                </Text>
              </Stack>
            </Box>
          </SimpleGrid>
        </FadeIn>
      </Box>
    </Flex>
  );
}
