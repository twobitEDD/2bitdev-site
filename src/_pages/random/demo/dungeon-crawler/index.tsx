"use client";

import {
  Box,
  Container,
  Flex,
  Heading,
  useColorModeValue,
  Alert,
  AlertIcon,
  Text,
  Stack,
  Code,
} from "@chakra-ui/react";
import { PageAnimation } from "@components/motion/PageAnimation";
import { EnhancedDungeonCrawlerDemo } from "@components/random/EnhancedDungeonCrawlerDemo";
import { PlaytestModeProvider } from "@contexts/PlaytestModeContext";
import { WalletProvider } from "@contexts/WalletContext";
import { contractsConfig } from "@config/contracts";
import Link from "next/link";

export default function DungeonCrawlerPage() {
  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  return (
    <WalletProvider>
      <PlaytestModeProvider>
        <PageAnimation>
          <Container maxW="container.xl" py={8}>
            <Flex align="center" justify="space-between" mb={6} flexWrap="wrap" gap={4}>
              <Heading size="lg" color="white">
                🐉 Dungeon Crawler Demo
              </Heading>
              <Link href="/random/demo">
                <Text color="blue.400" _hover={{ textDecoration: "underline" }}>
                  ← Back to Demo Hub
                </Text>
              </Link>
            </Flex>

            <Box bg={cardBg} p={6} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
              <EnhancedDungeonCrawlerDemo />
            </Box>

            <Alert status="info" borderRadius="lg" mt={4}>
              <AlertIcon />
              <Box>
                <Text fontWeight="bold">Contract Addresses</Text>
                <Stack spacing={1} fontSize="sm" mt={2}>
                  <Text>
                    <strong>Base Sepolia (Testnet):</strong>{" "}
                    <Code fontSize="xs">{contractsConfig.baseSepolia?.dungeonCrawler || "Not deployed"}</Code>
                  </Text>
                  <Text>
                    <strong>Base (Mainnet):</strong>{" "}
                    <Code fontSize="xs">{contractsConfig.base.dungeonCrawler || "Not deployed"}</Code>
                  </Text>
                </Stack>
              </Box>
            </Alert>
          </Container>
        </PageAnimation>
      </PlaytestModeProvider>
    </WalletProvider>
  );
}

