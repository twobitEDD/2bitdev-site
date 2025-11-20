"use client";

import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  SimpleGrid,
  Stack,
  Text,
  useColorModeValue,
  Badge,
  Code,
  Divider,
  Link as ChakraLink,
} from "@chakra-ui/react";
import { Icons } from "@components/icons";
import { PageAnimation } from "@components/motion/PageAnimation";
import { Description, SuperTitle, Title } from "@components/landing-page/Section";
import Link from "next/link";

const ServRandom = () => {
  const bgColor = useColorModeValue("gray.50", "gray.800");
  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const iconBg = useColorModeValue("gray.100", "gray.700");

  const features = [
    {
      title: "Cryptographic Security",
      description:
        "Uses Harmony VRF-enabled blocks for military-grade randomness generation with cryptographic proof verification.",
      icon: <Icons.check />,
    },
    {
      title: "Multi-Chain Support",
      description:
        "Production deployed on Base and Harmony mainnets, with Ergo network integration in development.",
      icon: <Icons.check />,
    },
    {
      title: "Fee-Based Access",
      description:
        "Pay with SRAND tokens for verifiable random values. Simple, transparent pricing at 1 SRAND per request.",
      icon: <Icons.check />,
    },
    {
      title: "Real-Time Processing",
      description:
        "Automatic fulfillment with average processing time under 30 seconds. 99.9% uptime target.",
      icon: <Icons.check />,
    },
    {
      title: "Enterprise Ready",
      description:
        "Production-grade monitoring, health checks, rate limiting, and comprehensive error handling.",
      icon: <Icons.check />,
    },
    {
      title: "Developer Friendly",
      description:
        "Easy-to-use SDK and smart contract integration. Focus on building, not infrastructure management.",
      icon: <Icons.check />,
    },
  ];

  const stats = [
    { label: "Processing Time", value: "<30 seconds" },
    { label: "Uptime Target", value: "99.9%" },
    { label: "Gas Optimization", value: "60% optimized" },
    { label: "Networks", value: "2+ (Base, Harmony)" },
  ];

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
        {/* Hero Section */}
        <Container maxW={"7xl"} py={{ base: 8, md: 16 }}>
          <Stack spacing={{ base: 8, md: 10 }} align="center">
            <SuperTitle>Decentralized Randomness Service</SuperTitle>
            <Title>ServRandom</Title>
            <Description>
              Production-ready randomness service that delivers cryptographic
              randomness across multiple blockchains using Harmony VRF. Get
              verifiable random values for your dApps and smart contracts.
            </Description>
            <Stack direction={{ base: "column", sm: "row" }} spacing={4}>
              <Badge
                colorScheme="green"
                fontSize="md"
                px={4}
                py={2}
                borderRadius="full"
              >
                ✅ Production Deployed
              </Badge>
              <Badge
                colorScheme="blue"
                fontSize="md"
                px={4}
                py={2}
                borderRadius="full"
              >
                Base + Harmony Mainnets
              </Badge>
            </Stack>
          </Stack>
        </Container>

        {/* Features Grid */}
        <Box bg={bgColor} w="full" py={{ base: 12, md: 20 }}>
          <Container maxW={"7xl"}>
            <Stack spacing={8} align="center" mb={12}>
              <SuperTitle>Key Features</SuperTitle>
              <Title>Why Choose ServRandom?</Title>
            </Stack>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
              {features.map((feature, index) => (
                <Box
                  key={index}
                  bg={cardBg}
                  p={6}
                  borderRadius="lg"
                  borderWidth="1px"
                  borderColor={borderColor}
                  _hover={{
                    borderColor: "brand.400",
                    transform: "translateY(-4px)",
                    transition: "all 0.2s",
                  }}
                >
                  <Flex
                    w={10}
                    h={10}
                    align="center"
                    justify="center"
                    color="brand.300"
                    rounded="full"
                    bg={iconBg}
                    mb={4}
                  >
                    {feature.icon}
                  </Flex>
                  <Heading size="md" mb={2} color="white">
                    {feature.title}
                  </Heading>
                  <Text fontSize="sm" color="gray.400">
                    {feature.description}
                  </Text>
                </Box>
              ))}
            </SimpleGrid>
          </Container>
        </Box>

        {/* Stats Section */}
        <Container maxW={"7xl"} py={{ base: 8, md: 16 }}>
          <Stack spacing={8} align="center">
            <SuperTitle>Performance Metrics</SuperTitle>
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={8} w="full">
              {stats.map((stat, index) => (
                <Box key={index} textAlign="center">
                  <Text
                    fontSize="3xl"
                    fontWeight="bold"
                    color="brand.300"
                    mb={2}
                  >
                    {stat.value}
                  </Text>
                  <Text fontSize="md" color="gray.400">
                    {stat.label}
                  </Text>
                </Box>
              ))}
            </SimpleGrid>
          </Stack>
        </Container>

        {/* How It Works */}
        <Box bg={bgColor} w="full" py={{ base: 12, md: 20 }}>
          <Container maxW={"7xl"}>
            <Stack spacing={8} align="center" mb={12}>
              <SuperTitle>How It Works</SuperTitle>
              <Title>Simple Integration</Title>
              <Description>
                ServRandom provides cryptographic randomness sourced from
                Harmony&apos;s VRF-enabled blocks. Users pay with SRAND tokens
                to receive verifiable random values.
              </Description>
            </Stack>

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
              <Box textAlign="center">
                <Box
                  w={16}
                  h={16}
                  mx="auto"
                  mb={4}
                  borderRadius="full"
                  bg="brand.400"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  color="white"
                  fontSize="2xl"
                  fontWeight="bold"
                >
                  1
                </Box>
                <Heading size="md" mb={2} color="white">
                  Request Randomness
                </Heading>
                <Text fontSize="sm" color="gray.400">
                  Call the FeeCollector contract with SRAND token approval
                </Text>
              </Box>

              <Box textAlign="center">
                <Box
                  w={16}
                  h={16}
                  mx="auto"
                  mb={4}
                  borderRadius="full"
                  bg="brand.400"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  color="white"
                  fontSize="2xl"
                  fontWeight="bold"
                >
                  2
                </Box>
                <Heading size="md" mb={2} color="white">
                  Automatic Processing
                </Heading>
                <Text fontSize="sm" color="gray.400">
                  ServRandom server listens to Harmony blocks and processes VRF
                  data
                </Text>
              </Box>

              <Box textAlign="center">
                <Box
                  w={16}
                  h={16}
                  mx="auto"
                  mb={4}
                  borderRadius="full"
                  bg="brand.400"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  color="white"
                  fontSize="2xl"
                  fontWeight="bold"
                >
                  3
                </Box>
                <Heading size="md" mb={2} color="white">
                  Receive Result
                </Heading>
                <Text fontSize="sm" color="gray.400">
                  Get your verifiable random value stored on-chain within 30
                  seconds
                </Text>
              </Box>
            </SimpleGrid>
          </Container>
        </Box>

        {/* Technical Details */}
        <Container maxW={"7xl"} py={{ base: 8, md: 16 }}>
          <Stack spacing={8}>
            <Stack spacing={4} align="center" mb={8}>
              <SuperTitle>Technical Specifications</SuperTitle>
              <Title>Built for Developers</Title>
            </Stack>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
              <Box>
                <Heading size="md" mb={4} color="white">
                  Randomness Source
                </Heading>
                <Text fontSize="sm" color="gray.400" mb={4}>
                  Harmony VRF-enabled blocks provide cryptographic proof
                  verification for maximum security.
                </Text>
                <Code p={2} borderRadius="md" display="block">
                  Source: Harmony VRF Blocks
                  <br />
                  Security: Cryptographic Proof
                  <br />
                  Frequency: Real-time Processing
                </Code>
              </Box>

              <Box>
                <Heading size="md" mb={4} color="white">
                  Fee Structure
                </Heading>
                <Text fontSize="sm" color="gray.400" mb={4}>
                  Simple, transparent pricing with automatic refunds for failed
                  requests.
                </Text>
                <Code p={2} borderRadius="md" display="block">
                  Token: SRAND (ERC20 on Base)
                  <br />
                  Cost: 1 SRAND per request
                  <br />
                  Refund: Failed requests refunded
                </Code>
              </Box>
            </SimpleGrid>
          </Stack>
        </Container>

        {/* CTA Section */}
        <Box bg={bgColor} w="full" py={{ base: 12, md: 20 }}>
          <Container maxW={"7xl"}>
            <Stack spacing={8} align="center" textAlign="center">
              <Title>Ready to Get Started?</Title>
              <Description>
                Integrate ServRandom into your dApp or smart contract today. Get
                production-ready cryptographic randomness in minutes.
              </Description>
              <Stack direction={{ base: "column", sm: "row" }} spacing={4}>
                <Button
                  as={Link}
                  href="https://docs.serv.services"
                  size="lg"
                  colorScheme="brand"
                  rightIcon={<Icons.arrowRight />}
                >
                  View Documentation
                </Button>
                <Button
                  as={Link}
                  href="/"
                  size="lg"
                  variant="outline"
                  colorScheme="brand"
                >
                  Back to Home
                </Button>
              </Stack>
            </Stack>
          </Container>
        </Box>

        <Divider />
      </Flex>
    </PageAnimation>
  );
};

export default ServRandom;

