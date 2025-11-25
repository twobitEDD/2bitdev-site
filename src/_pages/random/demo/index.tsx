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
import { ethers } from "ethers";

interface VRFEntry {
  blockNumber: number;
  timestamp: number;
  vrfValue: string;
  harmonyBlockHash: string;
}

interface FeeRequest {
  requestId: string;
  requester: string;
  feeAmount: string;
  timestamp: number;
  fulfilled: boolean;
  randomnessValue?: string;
  network: string;
}

const DemoPage = () => {
  const bgColor = useColorModeValue("gray.50", "gray.800");
  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const [vrfData, setVrfData] = useState<VRFEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Helper function to fetch RouletteGame spins
    const fetchRouletteGameSpins = async (network: "base" | "baseSepolia" = "baseSepolia"): Promise<VRFEntry[]> => {
      try {
        const rouletteAddress = contractsConfig[network]?.rouletteGame;
        if (!rouletteAddress) {
          console.log(`RouletteGame not deployed on ${network}`);
          return [];
        }

        // Use public RPC endpoints
        const rpcUrls: Record<string, string> = {
          baseSepolia: "https://sepolia.base.org",
          base: "https://mainnet.base.org",
        };
        const rpcUrl = rpcUrls[network];
        if (!rpcUrl) {
          console.log(`No RPC URL for network ${network}`);
          return [];
        }

        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const rouletteAbi = [
          "function getRecentSpins(uint256 count) external view returns (uint256[])",
          "function getSpin(uint256 _spinId) external view returns (address player, uint8 result, string memory color, bool isEven, bytes32 vrfSeed, uint256 timestamp)",
        ];

        const contract = new ethers.Contract(rouletteAddress, rouletteAbi, provider);
        
        // Get recent spins (last 10)
        const recentSpinIds = await contract.getRecentSpins(10);
        
        if (!recentSpinIds || recentSpinIds.length === 0) {
          return [];
        }

        const spins: VRFEntry[] = [];
        
        // Fetch each spin's details
        for (const spinId of recentSpinIds) {
          try {
            const spin = await contract.getSpin(spinId);
            
            // Check if spin is completed (result != 255 and vrfSeed is not zero)
            if (spin.result !== 255 && 
                spin.vrfSeed !== ethers.ZeroHash && 
                spin.vrfSeed !== "0x0000000000000000000000000000000000000000000000000000000000000000") {
              // Convert timestamp from seconds to milliseconds
              let timestamp = Number(spin.timestamp);
              if (timestamp < 1000000000000) {
                timestamp = timestamp * 1000;
              }
              
              spins.push({
                blockNumber: 0, // Game requests don't have block numbers
                timestamp: timestamp || Date.now(),
                vrfValue: spin.vrfSeed,
                harmonyBlockHash: "0x0000000000000000000000000000000000000000000000000000000000000000",
              });
            }
          } catch (error) {
            console.warn(`Error fetching spin ${spinId.toString()}:`, error);
            // Continue with next spin
          }
        }
        
        console.log(`Fetched ${spins.length} RouletteGame spins from ${network}`);
        return spins;
      } catch (error) {
        console.error(`Error fetching RouletteGame spins from ${network}:`, error);
        return [];
      }
    };

    // Helper function to fetch DungeonCrawler VRF data
    const fetchDungeonCrawlerVRF = async (network: "base" | "baseSepolia" = "baseSepolia"): Promise<VRFEntry[]> => {
      try {
        const dungeonAddress = contractsConfig[network]?.dungeonCrawler;
        if (!dungeonAddress) {
          console.log(`DungeonCrawler not deployed on ${network}`);
          return [];
        }

        const rpcUrls: Record<string, string> = {
          baseSepolia: "https://sepolia.base.org",
          base: "https://mainnet.base.org",
        };
        const rpcUrl = rpcUrls[network];
        if (!rpcUrl) {
          return [];
        }

        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const dungeonAbi = [
          "function characterCounter() external view returns (uint256)",
          "function interactionCounter() external view returns (uint256)",
          "function characters(uint256) external view returns (address player, uint8 class, uint8 strength, uint8 dexterity, uint8 intelligence, uint8 wisdom, uint8 constitution, uint8 charisma, uint256 level, uint256 health, uint256 maxHealth, uint256 wealth, bytes32 creationSeed, bool alive, uint256 actionCount, uint8 status, uint256 createdAt)",
          "function getInteraction(uint256 interactionId) external view returns (uint256 characterId, uint8 interactionType, bool completed, bool success, uint256 healthChange, uint256 wealthChange, string memory outcome, bytes32 vrfSeed)",
        ];

        const contract = new ethers.Contract(dungeonAddress, dungeonAbi, provider);
        const vrfEntries: VRFEntry[] = [];
        
        // Fetch recent characters (last 10)
        try {
          const characterCounter = await contract.characterCounter();
          const startId = characterCounter > BigInt(10) ? characterCounter - BigInt(10) : BigInt(1);
          
          for (let charId = startId; charId <= characterCounter; charId++) {
            try {
              const character = await contract.characters(charId);
              const creationSeed = character.creationSeed || character[13];
              const createdAt = character.createdAt || character[17];
              
              if (creationSeed && 
                  creationSeed !== ethers.ZeroHash && 
                  creationSeed !== "0x0000000000000000000000000000000000000000000000000000000000000000") {
                let timestamp = Number(createdAt);
                if (timestamp < 1000000000000) {
                  timestamp = timestamp * 1000;
                }
                
                vrfEntries.push({
                  blockNumber: 0,
                  timestamp: timestamp || Date.now(),
                  vrfValue: creationSeed,
                  harmonyBlockHash: "0x0000000000000000000000000000000000000000000000000000000000000000",
                });
              }
            } catch (error) {
              console.warn(`Error fetching character ${charId.toString()}:`, error);
            }
          }
        } catch (error) {
          console.warn(`Error fetching characters:`, error);
        }
        
        // Fetch recent interactions (last 10)
        try {
          const interactionCounter = await contract.interactionCounter();
          const startId = interactionCounter > BigInt(10) ? interactionCounter - BigInt(10) : BigInt(1);
          
          for (let interactionId = startId; interactionId <= interactionCounter; interactionId++) {
            try {
              const interaction = await contract.getInteraction(interactionId);
              const vrfSeed = interaction.vrfSeed || interaction[7];
              const completed = interaction.completed !== undefined ? interaction.completed : interaction[2];
              
              if (completed && vrfSeed && 
                  vrfSeed !== ethers.ZeroHash && 
                  vrfSeed !== "0x0000000000000000000000000000000000000000000000000000000000000000") {
                vrfEntries.push({
                  blockNumber: 0,
                  timestamp: Date.now(),
                  vrfValue: vrfSeed,
                  harmonyBlockHash: "0x0000000000000000000000000000000000000000000000000000000000000000",
                });
              }
            } catch (error) {
              console.warn(`Error fetching interaction ${interactionId.toString()}:`, error);
            }
          }
        } catch (error) {
          console.warn(`Error fetching interactions:`, error);
        }
        
        console.log(`Fetched ${vrfEntries.length} DungeonCrawler VRF entries from ${network}`);
        return vrfEntries;
      } catch (error) {
        console.error(`Error fetching DungeonCrawler VRF from ${network}:`, error);
        return [];
      }
    };

    const fetchVRFData = async () => {
      try {
        const response = await fetch(siteConfig.servRandomStatusUrl, {
          cache: "no-store",
        });
        if (response.ok) {
          const data = await response.json();
          console.log('VRF Data Debug:', {
            hasRecentRandomness: !!data.recentRandomness,
            recentRandomnessLength: data.recentRandomness?.length || 0,
            hasFeeRequests: !!data.feeRequests,
            feeRequestsLength: data.feeRequests?.length || 0,
            feeRequestsSample: data.feeRequests?.slice(0, 3),
          });
          
          const combinedVRF: VRFEntry[] = [];
          
          // Add Harmony block VRF entries
          if (data.recentRandomness && Array.isArray(data.recentRandomness)) {
            data.recentRandomness.forEach((entry: any) => {
              combinedVRF.push({
                blockNumber: entry.blockNumber || 0,
                timestamp: entry.timestamp || Date.now(),
                vrfValue: entry.vrfValue || entry.randomness || '0x0',
                harmonyBlockHash: entry.harmonyBlockHash || entry.blockHash || '0x0',
              });
            });
          }
          
          // Add fulfilled game requests (they have randomnessValue)
          if (data.feeRequests && Array.isArray(data.feeRequests)) {
            const fulfilledRequests = data.feeRequests
              .filter((req: FeeRequest) => {
                const isFulfilled = req.fulfilled === true;
                const hasRandomness = req.randomnessValue && 
                  req.randomnessValue !== '0x0000000000000000000000000000000000000000000000000000000000000000' &&
                  req.randomnessValue !== '0x0';
                return isFulfilled && hasRandomness;
              })
              .map((req: FeeRequest) => {
                // Normalize timestamp - handle both seconds and milliseconds
                let timestamp = req.timestamp;
                if (typeof timestamp === 'string') {
                  timestamp = parseInt(timestamp, 10);
                }
                // If timestamp is in seconds (less than 1e12), convert to milliseconds
                if (timestamp < 1000000000000) {
                  timestamp = timestamp * 1000;
                }
                
                return {
                  blockNumber: 0, // Game requests don't have block numbers
                  timestamp: timestamp || Date.now(),
                  vrfValue: req.randomnessValue!,
                  harmonyBlockHash: "0x0000000000000000000000000000000000000000000000000000000000000000", // Not available for game requests
                };
              });
            console.log('Fulfilled requests found:', fulfilledRequests.length);
            combinedVRF.push(...fulfilledRequests);
          }
          
          // Fetch game-specific VRF data from contracts
          // Use Promise.allSettled to continue even if some queries fail
          const [baseSepoliaSpinsResult, baseSpinsResult, baseSepoliaDungeonResult, baseDungeonResult] = await Promise.allSettled([
            fetchRouletteGameSpins("baseSepolia"),
            fetchRouletteGameSpins("base"),
            fetchDungeonCrawlerVRF("baseSepolia"),
            fetchDungeonCrawlerVRF("base"),
          ]);
          
          const baseSepoliaSpins = baseSepoliaSpinsResult.status === 'fulfilled' ? baseSepoliaSpinsResult.value : [];
          const baseSpins = baseSpinsResult.status === 'fulfilled' ? baseSpinsResult.value : [];
          const baseSepoliaDungeon = baseSepoliaDungeonResult.status === 'fulfilled' ? baseSepoliaDungeonResult.value : [];
          const baseDungeon = baseDungeonResult.status === 'fulfilled' ? baseDungeonResult.value : [];
          
          // Log any failures
          if (baseSepoliaSpinsResult.status === 'rejected') {
            console.error('Failed to fetch RouletteGame spins from baseSepolia:', baseSepoliaSpinsResult.reason);
          }
          if (baseSpinsResult.status === 'rejected') {
            console.error('Failed to fetch RouletteGame spins from base:', baseSpinsResult.reason);
          }
          if (baseSepoliaDungeonResult.status === 'rejected') {
            console.error('Failed to fetch DungeonCrawler VRF from baseSepolia:', baseSepoliaDungeonResult.reason);
          }
          if (baseDungeonResult.status === 'rejected') {
            console.error('Failed to fetch DungeonCrawler VRF from base:', baseDungeonResult.reason);
          }
          
          console.log(`Game VRF data: RouletteGame baseSepolia=${baseSepoliaSpins.length}, base=${baseSpins.length}, DungeonCrawler baseSepolia=${baseSepoliaDungeon.length}, base=${baseDungeon.length}`);
          combinedVRF.push(...baseSepoliaSpins, ...baseSpins, ...baseSepoliaDungeon, ...baseDungeon);
          
          // Sort by timestamp (most recent first) and limit to 20
          combinedVRF.sort((a, b) => b.timestamp - a.timestamp);
          const limitedVRF = combinedVRF.slice(0, 20);
          console.log('Final VRF data count:', limitedVRF.length);
          setVrfData(limitedVRF);
        } else {
          console.error('Failed to fetch VRF data:', response.status, response.statusText);
        }
      } catch (error) {
        console.error("Error fetching VRF data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVRFData();
    // Refresh every 10 seconds
    const refreshInterval = setInterval(fetchVRFData, 10000);
    return () => clearInterval(refreshInterval);
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
          {loading ? (
            <Box bg={cardBg} p={6} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
              <Text color="gray.400" textAlign="center">
                Loading VRF data...
              </Text>
            </Box>
          ) : (
            <Box bg={cardBg} p={6} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
              <VRFVisualization entries={vrfData} maxEntries={6} />
            </Box>
          )}

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
