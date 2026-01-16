import { Box, Button, Flex, SimpleGrid, Stack, Text } from "@chakra-ui/react";
import { FadeIn } from "@components/motion/Animation";
import Link from "next/link";
import { Description, Title } from "./Section";

export default function HighlightSwitchback() {
  return (
    <Flex
      w="full"
      justifyContent="center"
      alignItems="center"
      // mt={{ base: 10, md: 28 }}
    >
      <Box
        bg="black"
        px={{ base: 6, md: 8 }}
        py={{ base: 16, md: 20 }}
        mx="auto"
        id="capabilities"
      >
        {/* Left Section */}
        <FadeIn direction="from-bottom-to-top">
          <SimpleGrid
            alignItems="center"
            columns={{ base: 1, md: 2 }}
            mb={24}
            spacingY={{ base: 10, md: 32 }}
            spacingX={{ base: 10, md: 24 }}
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
            <Box
              w="full"
              h="full"
              bg="blackAlpha.700"
              border="1px solid"
              borderColor="whiteAlpha.200"
              textAlign={"center"}
              borderRadius="2xl"
              px={8}
              py={10}
            >
              <Stack spacing={4} align="flex-start">
                <Text fontSize="sm" textTransform="uppercase" color="gray.400">
                  Integration map
                </Text>
                <Text fontSize="2xl" color="white" fontWeight="semibold">
                  Signal + infrastructure
                </Text>
                <Box
                  w="full"
                  h="140px"
                  borderRadius="lg"
                  bgGradient="linear(to-br, rgba(255,255,255,0.05), rgba(255,255,255,0))"
                  border="1px solid"
                  borderColor="whiteAlpha.200"
                  backgroundImage="linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)"
                  backgroundSize="32px 32px"
                />
                <Text fontSize="sm" color="gray.400">
                  Sensor networks, edge compute, and real-time dashboards that
                  stay online.
                </Text>
              </Stack>
            </Box>
          </SimpleGrid>
        </FadeIn>
        {/* Right section */}
        <FadeIn direction="from-bottom-to-top">
          <SimpleGrid
            alignItems="center"
            columns={{ base: 1, md: 2 }}
            flexDirection="column-reverse"
            mb={24}
            spacingY={{ base: 10, md: 32 }}
            spacingX={{ base: 10, md: 24 }}
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
            <Box
              w="full"
              h="full"
              bg="blackAlpha.700"
              border="1px solid"
              borderColor="whiteAlpha.200"
              textAlign={"center"}
              borderRadius="2xl"
              px={8}
              py={10}
            >
              <Stack spacing={4} align="flex-start">
                <Text fontSize="sm" textTransform="uppercase" color="gray.400">
                  AI operations
                </Text>
                <Text fontSize="2xl" color="white" fontWeight="semibold">
                  Automation + control
                </Text>
                <Box
                  w="full"
                  h="140px"
                  borderRadius="lg"
                  bgGradient="linear(to-br, rgba(96,165,250,0.2), rgba(0,0,0,0))"
                  border="1px solid"
                  borderColor="whiteAlpha.200"
                  backgroundImage="linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)"
                  backgroundSize="32px 32px"
                />
                <Text fontSize="sm" color="gray.400">
                  Model deployment, feedback loops, and measurable outcomes.
                </Text>
              </Stack>
            </Box>
          </SimpleGrid>
        </FadeIn>

        {/* Left Section */}
        <FadeIn direction="from-bottom-to-top">
          <SimpleGrid
            alignItems="center"
            columns={{ base: 1, md: 2 }}
            spacingY={{ base: 10, md: 32 }}
            spacingX={{ base: 10, md: 24 }}
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
            <Box
              w="full"
              h="full"
              bg="blackAlpha.700"
              border="1px solid"
              borderColor="whiteAlpha.200"
              textAlign={"center"}
              borderRadius="2xl"
              px={8}
              py={10}
            >
              <Stack spacing={4} align="flex-start">
                <Text fontSize="sm" textTransform="uppercase" color="gray.400">
                  Production stack
                </Text>
                <Text fontSize="2xl" color="white" fontWeight="semibold">
                  Spatial + digital output
                </Text>
                <Box
                  w="full"
                  h="140px"
                  borderRadius="lg"
                  bgGradient="linear(to-br, rgba(255,80,80,0.2), rgba(0,0,0,0))"
                  border="1px solid"
                  borderColor="whiteAlpha.200"
                  backgroundImage="linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)"
                  backgroundSize="32px 32px"
                />
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
