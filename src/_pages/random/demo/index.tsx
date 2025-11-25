"use client";

import {
  Box,
  Container,
  Flex,
  Heading,
  Stack,
  Text,
  useColorModeValue,
  Button,
  Code,
  Badge,
  SimpleGrid,
  Alert,
  AlertIcon,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from "@chakra-ui/react";
import { PageAnimation } from "@components/motion/PageAnimation";
import { VRFVisualization } from "@components/random/VRFVisualization";
import { RouletteGameDemo } from "@components/random/RouletteGameDemo";
import { EnhancedDungeonCrawlerDemo } from "@components/random/EnhancedDungeonCrawlerDemo";
import { FishingGameDemo } from "@components/random/FishingGameDemo";
import { PlaytestModeToggle } from "@components/random/PlaytestModeToggle";
import { PlaytestModeProvider } from "@contexts/PlaytestModeContext";
import { WalletProvider } from "@contexts/WalletContext";
import { siteConfig } from "@config/site";
import { contractsConfig } from "@config/contracts";
import Link from "next/link";
import { useState, useEffect } from "react";

interface VRFEntry {
  blockNumber: number;
  timestamp: number;
  vrfValue: string;
  harmonyBlockHash: string;
}

const DemoPage = () => {
  const bgColor = useColorModeValue("gray.50", "gray.800");
  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const [vrfData, setVrfData] = useState<VRFEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVRFData = async () => {
      try {
        const response = await fetch(siteConfig.servRandomStatusUrl, {
          cache: "no-store",
        });
        if (response.ok) {
          const data = await response.json();
          if (data.recentRandomness) {
            setVrfData(data.recentRandomness);
          }
        }
      } catch (error) {
        console.error("Error fetching VRF data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVRFData();
    const interval = setInterval(fetchVRFData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <PlaytestModeProvider>
      <WalletProvider>
        <PageAnimation>
        <Container maxW={"7xl"} py={{ base: 8, md: 16 }}>
          <Stack spacing={8}>
            <Box>
              <Heading size="2xl" mb={2} color="white">
                🎮 Interactive Demo & Examples
              </Heading>
              <Text color="gray.400">
                Explore SERV.random in action. See real VRF data, understand the flow, and try interactive examples.
              </Text>
            </Box>

            {/* Playtest Mode Toggle */}
            <PlaytestModeToggle />

          {/* Live VRF Data */}
          <Box bg={cardBg} p={6} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
            <VRFVisualization entries={vrfData} maxEntries={6} />
          </Box>

          {/* Demo Options */}
          <Tabs>
            <TabList>
              <Tab>FishingGame</Tab>
              <Tab>Roulette</Tab>
              <Tab>Dungeon Crawler</Tab>
              <Tab>Integration Examples</Tab>
            </TabList>

            <TabPanels>
              <TabPanel>
                <Box bg={cardBg} p={6} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
                  <FishingGameDemo />
                </Box>
                <Alert status="info" borderRadius="lg" mt={4}>
                  <AlertIcon />
                  <Box>
                    <Text fontWeight="bold">Contract Addresses</Text>
                    <Stack spacing={1} fontSize="sm" mt={2}>
                      <Text>
                        <strong>Base Sepolia (Testnet):</strong>{" "}
                        <Code fontSize="xs">{contractsConfig.baseSepolia?.fishingGame || "Not deployed"}</Code>
                      </Text>
                      <Text>
                        <strong>Base (Mainnet):</strong>{" "}
                        <Code fontSize="xs">{contractsConfig.base.fishingGame}</Code>
                      </Text>
                      <Text>
                        <strong>Avalanche:</strong>{" "}
                        <Code fontSize="xs">{contractsConfig.avalanche.fishingGame}</Code>
                      </Text>
                      <Text>
                        <strong>Polygon:</strong>{" "}
                        <Code fontSize="xs">{contractsConfig.polygon.fishingGame}</Code>
                      </Text>
                    </Stack>
                  </Box>
                </Alert>
              </TabPanel>

              <TabPanel>
                <Box bg={cardBg} p={6} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
                  <RouletteGameDemo />
                </Box>
                <Alert status="info" borderRadius="lg" mt={4}>
                  <AlertIcon />
                  <Box>
                    <Text fontWeight="bold">Contract Addresses</Text>
                    <Stack spacing={1} fontSize="sm" mt={2}>
                      <Text>
                        <strong>Base Sepolia (Testnet):</strong>{" "}
                        <Code fontSize="xs">{contractsConfig.baseSepolia?.rouletteGame || "Not deployed"}</Code>
                      </Text>
                      <Text>
                        <strong>Base (Mainnet):</strong>{" "}
                        <Code fontSize="xs">{contractsConfig.base.rouletteGame || "Not deployed"}</Code>
                      </Text>
                    </Stack>
                  </Box>
                </Alert>
              </TabPanel>

              <TabPanel>
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
              </TabPanel>

              <TabPanel>
                <Stack spacing={4}>
                  <Box bg={cardBg} p={6} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
                    <Heading size="lg" mb={4} color="white">
                      💻 Code Examples
                    </Heading>
                    <Text color="gray.400" mb={4}>
                      Quick examples showing how to use SERV.random randomness in your contracts:
                    </Text>

                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      <Box p={4} bg={bgColor} borderRadius="md">
                        <Heading size="sm" mb={2} color="white">
                          Random Number (0-99)
                        </Heading>
                        <Code fontSize="xs" display="block" whiteSpace="pre-wrap" p={2}>
{`uint256 randomNumber = 
    uint256(randomness) % 100;`}
                        </Code>
                      </Box>

                      <Box p={4} bg={bgColor} borderRadius="md">
                        <Heading size="sm" mb={2} color="white">
                          Random Selection
                        </Heading>
                        <Code fontSize="xs" display="block" whiteSpace="pre-wrap" p={2}>
{`uint256 index = 
    uint256(randomness) % 
    items.length;`}
                        </Code>
                      </Box>

                      <Box p={4} bg={bgColor} borderRadius="md">
                        <Heading size="sm" mb={2} color="white">
                          Dice Roll (1-6)
                        </Heading>
                        <Code fontSize="xs" display="block" whiteSpace="pre-wrap" p={2}>
{`uint256 dice = 
    (uint256(randomness) % 6) + 1;`}
                        </Code>
                      </Box>

                      <Box p={4} bg={bgColor} borderRadius="md">
                        <Heading size="sm" mb={2} color="white">
                          Weighted Random
                        </Heading>
                        <Code fontSize="xs" display="block" whiteSpace="pre-wrap" p={2}>
{`uint256 random = 
    uint256(randomness) % 
    totalWeight;
// Select based on 
// cumulative weights`}
                        </Code>
                      </Box>
                    </SimpleGrid>
                  </Box>

                  <Box bg={cardBg} p={6} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
                    <Heading size="lg" mb={4} color="white">
                      🔗 Integration Patterns
                    </Heading>
                    <Stack spacing={4}>
                      <Box>
                        <Badge colorScheme="green" mb={2}>Pattern 2: Manual Claim (Recommended)</Badge>
                        <Text fontSize="sm" color="gray.400">
                          User requests randomness, then manually claims after server fulfills. More gas-efficient and gives users control.
                        </Text>
                      </Box>
                      <Box>
                        <Badge colorScheme="blue" mb={2}>Pattern 1: Automatic Callback</Badge>
                        <Text fontSize="sm" color="gray.400">
                          Server automatically calls your contract when randomness is ready. Simpler but requires careful gas management.
                        </Text>
                      </Box>
                    </Stack>
                    <Button
                      as={Link}
                      href="/random/docs"
                      mt={4}
                      colorScheme="brand"
                      variant="outline"
                    >
                      View Full Integration Guide →
                    </Button>
                  </Box>
                </Stack>
              </TabPanel>

              <TabPanel>
                <Box bg={cardBg} p={6} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
                  <Heading size="lg" mb={4} color="white">
                    🔄 Complete Flow
                  </Heading>
                  <Text color="gray.400" mb={4} fontSize="sm">
                    Understanding how SERV.random integrates into your game:
                  </Text>
                  <Stack spacing={6}>
                    <Box>
                      <Flex align="center" mb={2}>
                        <Badge colorScheme="blue" mr={3} fontSize="md" w="40px" textAlign="center">
                          1
                        </Badge>
                        <Heading size="sm" color="white">
                          User Action
                        </Heading>
                      </Flex>
                      <Text fontSize="sm" color="gray.400" ml="60px">
                        User clicks &quot;Go Fishing&quot; → Contract calls{" "}
                        <Code fontSize="xs">FeeCollector.requestRandomnessFor()</Code> → SRAND token transferred
                      </Text>
                    </Box>

                    <Box>
                      <Flex align="center" mb={2}>
                        <Badge colorScheme="purple" mr={3} fontSize="md" w="40px" textAlign="center">
                          2
                        </Badge>
                        <Heading size="sm" color="white">
                          Server Processing
                        </Heading>
                      </Flex>
                      <Text fontSize="sm" color="gray.400" ml="60px">
                        SERV.random server monitors Harmony blocks → Extracts VRF data → Submits to RandomnessAccess contract
                      </Text>
                    </Box>

                    <Box>
                      <Flex align="center" mb={2}>
                        <Badge colorScheme="green" mr={3} fontSize="md" w="40px" textAlign="center">
                          3
                        </Badge>
                        <Heading size="sm" color="white">
                          Fulfillment
                        </Heading>
                      </Flex>
                      <Text fontSize="sm" color="gray.400" ml="60px">
                        FeeCollector.fulfillRandomness() called → Randomness stored on-chain → Request marked as fulfilled
                      </Text>
                    </Box>

                    <Box>
                      <Flex align="center" mb={2}>
                        <Badge colorScheme="orange" mr={3} fontSize="md" w="40px" textAlign="center">
                          4
                        </Badge>
                        <Heading size="sm" color="white">
                          User Claims
                        </Heading>
                      </Flex>
                      <Text fontSize="sm" color="gray.400" ml="60px">
                        User calls <Code fontSize="xs">catchFish()</Code> → Contract verifies fulfillment → Uses randomness → Generates outcome → Mints NFT with VRF seed stored
                      </Text>
                    </Box>
                  </Stack>
                </Box>
              </TabPanel>
            </TabPanels>
          </Tabs>

          {/* Resources */}
          <Box bg={bgColor} p={6} borderRadius="lg">
            <Heading size="md" mb={4} color="white">
              📚 Learn More
            </Heading>
            <Stack spacing={2} fontSize="sm" color="gray.400">
              <Text>
                • <Link href="/random/docs" style={{ color: "#60A5FA" }}>Developer Integration Guide</Link> - Complete integration instructions
              </Text>
              <Text>
                • <Link href="/random/explorer" style={{ color: "#60A5FA" }}>Request Explorer</Link> - Browse all randomness requests
              </Text>
              <Text>
                • <Link href="/random/status" style={{ color: "#60A5FA" }}>Server Status</Link> - Monitor SERV.random servers
              </Text>
              <Text>
                • <Link href="https://github.com/ServProtocol/serv-random-contracts" style={{ color: "#60A5FA" }}>GitHub</Link> - View source code and examples
              </Text>
            </Stack>
          </Box>
        </Stack>
      </Container>
    </PageAnimation>
    </WalletProvider>
    </PlaytestModeProvider>
  );
};

export default DemoPage;
