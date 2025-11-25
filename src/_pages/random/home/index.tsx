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
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from "@chakra-ui/react";
import { Icons } from "@components/icons";
import { PageAnimation } from "@components/motion/PageAnimation";
import { Description, SuperTitle, Title } from "@components/landing-page/Section";
import Link from "next/link";

const RandomHomePage = () => {
  const bgColor = useColorModeValue("gray.50", "gray.800");
  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  // Prevent hydration issues
  if (typeof window === "undefined") {
    return null;
  }

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
          <Stack spacing={{ base: 8, md: 10 }} align="center" textAlign="center">
            <SuperTitle>SERV.random</SuperTitle>
            <Title>Verifiable Randomness Explorer</Title>
            <Description>
              Explore randomness requests, monitor server status, and learn how to integrate SERV.random into your smart contracts. 
              Built on Harmony VRF, deployed across multiple networks.
            </Description>
            <Stack direction={{ base: "column", sm: "row" }} spacing={4}>
              <Button
                as={Link}
                href="/random/explorer"
                size="lg"
                colorScheme="brand"
                rightIcon={<Icons.arrowRight />}
              >
                Explore Requests
              </Button>
              <Button
                as={Link}
                href="/random/docs"
                size="lg"
                variant="outline"
                colorScheme="brand"
              >
                Developer Guide
              </Button>
              <Button
                as={Link}
                href="/random/status"
                size="lg"
                variant="outline"
                colorScheme="brand"
              >
                Server Status
              </Button>
            </Stack>
          </Stack>
        </Container>

        {/* Quick Stats */}
        <Box bg={bgColor} w="full" py={{ base: 12, md: 20 }}>
          <Container maxW={"7xl"}>
            <Stack spacing={8} align="center" mb={12}>
              <SuperTitle>Live Statistics</SuperTitle>
            </Stack>
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={8}>
              <Stat textAlign="center">
                <StatNumber color="brand.300">--</StatNumber>
                <StatLabel>Total Requests</StatLabel>
                <StatHelpText>Across all networks</StatHelpText>
              </Stat>
              <Stat textAlign="center">
                <StatNumber color="brand.300">--</StatNumber>
                <StatLabel>Fulfilled</StatLabel>
                <StatHelpText>Successfully processed</StatHelpText>
              </Stat>
              <Stat textAlign="center">
                <StatNumber color="brand.300">--</StatNumber>
                <StatLabel>Pending</StatLabel>
                <StatHelpText>Awaiting fulfillment</StatHelpText>
              </Stat>
              <Stat textAlign="center">
                <StatNumber color="brand.300">3+</StatNumber>
                <StatLabel>Networks</StatLabel>
                <StatHelpText>Base, Avalanche, Polygon</StatHelpText>
              </Stat>
            </SimpleGrid>
          </Container>
        </Box>

        {/* Quick Links */}
        <Container maxW={"7xl"} py={{ base: 8, md: 16 }}>
          <Stack spacing={8} align="center">
            <SuperTitle>Explore SERV.random</SuperTitle>
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} w="full">
              <Box
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
                <Heading size="md" mb={2} color="white">
                  🔍 Request Explorer
                </Heading>
                <Text fontSize="sm" color="gray.400" mb={4}>
                  Browse all randomness requests across networks. View request details, VRF values, and fulfillment status.
                </Text>
                <Button
                  as={Link}
                  href="/random/explorer"
                  size="sm"
                  colorScheme="brand"
                  variant="outline"
                >
                  Explore →
                </Button>
              </Box>

              <Box
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
                <Heading size="md" mb={2} color="white">
                  📚 Developer Guide
                </Heading>
                <Text fontSize="sm" color="gray.400" mb={4}>
                  Learn how to integrate SERV.random into your smart contracts. Step-by-step guides, code examples, and best practices.
                </Text>
                <Button
                  as={Link}
                  href="/random/docs"
                  size="sm"
                  colorScheme="brand"
                  variant="outline"
                >
                  Read Docs →
                </Button>
              </Box>

              <Box
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
                <Heading size="md" mb={2} color="white">
                  🖥️ Server Status
                </Heading>
                <Text fontSize="sm" color="gray.400" mb={4}>
                  Monitor SERV.random host servers. Check uptime, latency, and latest VRF submissions from each server.
                </Text>
                <Button
                  as={Link}
                  href="/random/status"
                  size="sm"
                  colorScheme="brand"
                  variant="outline"
                >
                  View Status →
                </Button>
              </Box>
            </SimpleGrid>
          </Stack>
        </Container>

        {/* How It Works */}
        <Box bg={bgColor} w="full" py={{ base: 12, md: 20 }}>
          <Container maxW={"7xl"}>
            <Stack spacing={8} align="center" mb={12}>
              <SuperTitle>How SERV.random Works</SuperTitle>
              <Title>Simple, Secure, Verifiable</Title>
            </Stack>

            <SimpleGrid columns={{ base: 1, md: 4 }} spacing={8}>
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
                <Heading size="sm" mb={2} color="white">
                  Contract Requests
                </Heading>
                <Text fontSize="xs" color="gray.400">
                  Your contract calls FeeCollector with SRAND payment
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
                <Heading size="sm" mb={2} color="white">
                  Server Listens
                </Heading>
                <Text fontSize="xs" color="gray.400">
                  SERV.random server monitors Harmony VRF blocks
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
                <Heading size="sm" mb={2} color="white">
                  VRF Delivered
                </Heading>
                <Text fontSize="xs" color="gray.400">
                  Server submits VRF to RandomnessAccess contract
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
                  4
                </Box>
                <Heading size="sm" mb={2} color="white">
                  Callback Executed
                </Heading>
                <Text fontSize="xs" color="gray.400">
                  FeeCollector calls your contract with randomness
                </Text>
              </Box>
            </SimpleGrid>
          </Container>
        </Box>

        <Divider />
      </Flex>
    </PageAnimation>
  );
};

export default RandomHomePage;

