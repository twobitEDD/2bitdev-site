import { Box, Button, Flex, SimpleGrid, Stack, Text } from "@chakra-ui/react";
import Image from "next/image";
import { FadeIn } from "@components/motion/Animation";
import Link from "next/link";
import { Description, Title } from "./Section";

const HIGHLIGHT_VISUALS = [
  {
    src: "/images/services/technology-software.svg",
    alt: "Technology platform dashboard with connected software modules",
    label: "Technology integration",
    caption:
      "Platform architecture, APIs, and operational software that connects field to customer.",
  },
  {
    src: "/images/services/branding-identity.svg",
    alt: "Brand identity system with logo grid and visual language",
    label: "Brand identity",
    caption:
      "Mascots, design systems, and product UX — like CO2T's Bigfoot from scratch.",
  },
  {
    src: "/images/services/interactive-games.svg",
    alt: "Interactive game experience with voxel-style play surface",
    label: "Campaign production",
    caption:
      "Interactive retail, launch events, and product storytelling for major brands.",
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
              <Title>Software that connects the stack</Title>
              <Description>
                We architect and build the platforms underneath complex
                businesses — e-commerce, carbon traceability, game catalogs, and
                operational tooling that teams rely on daily.
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
                loading="lazy"
                sizes="(max-width: 768px) 100vw, 480px"
                style={{ width: "100%", height: "auto", display: "block" }}
              />
              <Stack spacing={2} p={4} align="flex-start">
                <Text fontSize="sm" textTransform="uppercase" color="gray.400">
                  {HIGHLIGHT_VISUALS[0].label}
                </Text>
                <Text fontSize="sm" color="gray.400">
                  {HIGHLIGHT_VISUALS[0].caption}
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
              <Title>Branding with a point of view</Title>
              <Description>
                Visual identity is not an afterthought — we design mascots,
                typography, and product surfaces that make new businesses feel
                established from day one.
              </Description>
              <Link
                nonce="false"
                href={"#contact"}
                passHref
                key={"#contact-brand"}
              >
                <Button
                  w={{ base: "full", sm: "auto" }}
                  mt="8"
                  size="lg"
                  variant="solid"
                >
                  Discuss brand work
                </Button>
              </Link>
            </Box>
            <Box className="highlight-visual" order={{ base: "initial", md: 1 }}>
              <Image
                src={HIGHLIGHT_VISUALS[1].src}
                alt={HIGHLIGHT_VISUALS[1].alt}
                width={480}
                height={180}
                loading="lazy"
                sizes="(max-width: 768px) 100vw, 480px"
                style={{ width: "100%", height: "auto", display: "block" }}
              />
              <Stack spacing={2} p={4} align="flex-start">
                <Text fontSize="sm" textTransform="uppercase" color="gray.400">
                  {HIGHLIGHT_VISUALS[1].label}
                </Text>
                <Text fontSize="sm" color="gray.400">
                  {HIGHLIGHT_VISUALS[1].caption}
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
              <Title>Marketing and interactive production</Title>
              <Description>
                Campaign programs, experiential builds, and accessible games —
                delivered through agency partnerships for Google, adidas, Dell,
                and Washington University, plus our own studio catalog.
              </Description>
              <Link
                nonce="false"
                href={"#contact"}
                passHref
                key={"#contact-campaign"}
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
                loading="lazy"
                sizes="(max-width: 768px) 100vw, 480px"
                style={{ width: "100%", height: "auto", display: "block" }}
              />
              <Stack spacing={2} p={4} align="flex-start">
                <Text fontSize="sm" textTransform="uppercase" color="gray.400">
                  {HIGHLIGHT_VISUALS[2].label}
                </Text>
                <Text fontSize="sm" color="gray.400">
                  {HIGHLIGHT_VISUALS[2].caption}
                </Text>
              </Stack>
            </Box>
          </SimpleGrid>
        </FadeIn>
      </Box>
    </Flex>
  );
}
