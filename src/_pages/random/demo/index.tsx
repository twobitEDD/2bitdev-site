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
} from "@chakra-ui/react";
import { PageAnimation } from "@components/motion/PageAnimation";
import { VRFVisualization } from "@components/random/VRFVisualization";
import { PlaytestModeToggle } from "@components/random/PlaytestModeToggle";
import { PlaytestModeProvider } from "@contexts/PlaytestModeContext";
import { WalletProvider, useWallet } from "@contexts/WalletContext";
import { siteConfig } from "@config/site";
import { contractsConfig } from "@config/contracts";
import { getRpcUrl } from "@config/rpc";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ethers } from "ethers";

interface VRFEntry {
  blockNumber: number;
  timestamp: number;
  vrfValue: string;
  harmonyBlockHash: string;
  gameSource?: string; // "RouletteGame", "DungeonCrawler", "FishingGame", "Harmony Block", "FeeRequest"
  network?: string; // "base", "baseSepolia", "harmony"
  requestId?: string; // Request ID if available
  metadata?: Record<string, any>; // Additional metadata (spinId, characterId, etc.)
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

// Inner component that uses WalletContext (must be inside WalletProvider)
const DemoPageContent = () => {
  const { chainId } = useWallet();
  const bgColor = useColorModeValue("gray.50", "gray.800");
  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const [vrfData, setVrfData] = useState<VRFEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper to get a provider for read-only queries using Alchemy RPC
  // Always uses Alchemy RPCs for reliable, fast access regardless of user's MetaMask configuration
  const getReadOnlyProvider = (network: "base" | "baseSepolia" = "baseSepolia"): ethers.JsonRpcProvider => {
    const rpcUrl = getRpcUrl(network);
    return new ethers.JsonRpcProvider(rpcUrl);
  };

  useEffect(() => {
    // Skip during build/SSR - only run on client
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    // Helper function to fetch RouletteGame spins with timeout
    const fetchRouletteGameSpins = async (network: "base" | "baseSepolia" = "baseSepolia"): Promise<VRFEntry[]> => {
      try {
        const rouletteAddress = contractsConfig[network]?.rouletteGame;
        if (!rouletteAddress) {
          console.log(`RouletteGame not deployed on ${network}`);
          return [];
        }

        // Use Alchemy RPC for reliable data access
        const rpcProvider = getReadOnlyProvider(network);
        const rouletteAbi = [
          "function getRecentSpins(uint256 count) external view returns (uint256[])",
          "function getSpin(uint256 _spinId) external view returns (address player, uint8 result, string memory color, bool isEven, bytes32 vrfSeed, uint256 timestamp)",
        ];

        const contract = new ethers.Contract(rouletteAddress, rouletteAbi, rpcProvider);
        
        // Get recent spins (last 10) with timeout
        const recentSpinIds = await Promise.race([
          contract.getRecentSpins(10),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error(`Timeout fetching spins from ${network}`)), 5000)
          )
        ]) as bigint[];
        
        if (!recentSpinIds || recentSpinIds.length === 0) {
          return [];
        }

        const spins: VRFEntry[] = [];
        
        // Fetch each spin's details with timeout protection
        for (const spinId of recentSpinIds) {
          try {
            const spin = await Promise.race([
              contract.getSpin(spinId),
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error(`Timeout fetching spin ${spinId.toString()}`)), 3000)
              )
            ]) as any;
            
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
                gameSource: "RouletteGame",
                network: network,
                metadata: {
                  spinId: spinId.toString(),
                  result: spin.result,
                  color: spin.color,
                },
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

        // Use Alchemy RPC for reliable data access
        const rpcProvider = getReadOnlyProvider(network);
        const dungeonAbi = [
          "function characterCounter() external view returns (uint256)",
          "function interactionCounter() external view returns (uint256)",
          "function characters(uint256) external view returns (address player, uint8 class, uint8 strength, uint8 dexterity, uint8 intelligence, uint8 wisdom, uint8 constitution, uint8 charisma, uint256 level, uint256 health, uint256 maxHealth, uint256 wealth, bytes32 creationSeed, bool alive, uint256 actionCount, uint8 status, uint256 createdAt)",
          "function getInteraction(uint256 interactionId) external view returns (uint256 characterId, uint8 interactionType, bool completed, bool success, uint256 healthChange, uint256 wealthChange, string memory outcome, bytes32 vrfSeed)",
        ];

        const contract = new ethers.Contract(dungeonAddress, dungeonAbi, rpcProvider);
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
                  gameSource: "DungeonCrawler",
                  network: network,
                  metadata: {
                    characterId: charId.toString(),
                    type: "character_creation",
                  },
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
                  gameSource: "DungeonCrawler",
                  network: network,
                  metadata: {
                    interactionId: interactionId.toString(),
                    type: "interaction",
                  },
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
                gameSource: "Harmony Block",
                network: "harmony",
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
                  gameSource: "FeeRequest",
                  network: req.network || "unknown",
                  requestId: req.requestId,
                };
              });
            console.log('Fulfilled requests found:', fulfilledRequests.length);
            combinedVRF.push(...fulfilledRequests);
          }
          
          // Sort by timestamp (most recent first) and update UI immediately with API data
          combinedVRF.sort((a, b) => b.timestamp - a.timestamp);
          if (combinedVRF.length > 0) {
            setVrfData([...combinedVRF]);
            setLoading(false); // Show data immediately when API data is available
          }
          
          // Fetch game-specific VRF data from contracts in parallel (non-blocking)
          // Use Promise.allSettled with timeout to prevent hanging
          const withTimeout = <T,>(promise: Promise<T>, timeoutMs: number = 8000): Promise<T> => {
            return Promise.race([
              promise,
              new Promise<T>((_, reject) => 
                setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
              )
            ]);
          };
          
          // Fetch contract data asynchronously and update when ready
          Promise.allSettled([
            withTimeout(fetchRouletteGameSpins("baseSepolia"), 8000),
            withTimeout(fetchRouletteGameSpins("base"), 8000),
            withTimeout(fetchDungeonCrawlerVRF("baseSepolia"), 8000),
            withTimeout(fetchDungeonCrawlerVRF("base"), 8000),
          ]).then((results) => {
            const baseSepoliaSpins = results[0].status === 'fulfilled' ? results[0].value : [];
            const baseSpins = results[1].status === 'fulfilled' ? results[1].value : [];
            const baseSepoliaDungeon = results[2].status === 'fulfilled' ? results[2].value : [];
            const baseDungeon = results[3].status === 'fulfilled' ? results[3].value : [];
            
            // Log any failures
            if (results[0].status === 'rejected') {
              console.error('Failed to fetch RouletteGame spins from baseSepolia:', results[0].reason);
            }
            if (results[1].status === 'rejected') {
              console.error('Failed to fetch RouletteGame spins from base:', results[1].reason);
            }
            if (results[2].status === 'rejected') {
              console.error('Failed to fetch DungeonCrawler VRF from baseSepolia:', results[2].reason);
            }
            if (results[3].status === 'rejected') {
              console.error('Failed to fetch DungeonCrawler VRF from base:', results[3].reason);
            }
            
            console.log(`Game VRF data: RouletteGame baseSepolia=${baseSepoliaSpins.length}, base=${baseSpins.length}, DungeonCrawler baseSepolia=${baseSepoliaDungeon.length}, base=${baseDungeon.length}`);
            
            // Combine all data and update
            const allVRF = [...combinedVRF, ...baseSepoliaSpins, ...baseSpins, ...baseSepoliaDungeon, ...baseDungeon];
            allVRF.sort((a, b) => b.timestamp - a.timestamp);
            const limitedVRF = allVRF.slice(0, 50); // Increased limit for scrolling list
            console.log('Final VRF data count:', limitedVRF.length);
            setVrfData(limitedVRF);
          });
        } else {
          console.error('Failed to fetch VRF data:', response.status, response.statusText);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching VRF data:", error);
        setLoading(false);
      }
    };

    fetchVRFData();
    // Refresh every 10 seconds
    const refreshInterval = setInterval(fetchVRFData, 10000);
    return () => clearInterval(refreshInterval);
  }, [chainId]); // Re-fetch when chainId changes (network switch)

  return (
    <PageAnimation>
      <Container maxW={"7xl"} py={{ base: 4, md: 8 }} px={{ base: 4, md: 6 }}>
          <Stack spacing={8}>
            <Box>
              <Heading size={{ base: "xl", md: "2xl" }} mb={2} color="white">
                🎮 Interactive Demo & Examples
              </Heading>
              <Text color="gray.400" fontSize={{ base: "sm", md: "md" }}>
                Explore SERV.random in action. See real VRF data, understand the flow, and try interactive examples.
              </Text>
            </Box>

            {/* Playtest Mode Toggle */}
            <PlaytestModeToggle />

          {/* Live VRF Data */}
          {loading ? (
            <Box bg={cardBg} p={{ base: 4, md: 6 }} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
              <Text color="gray.400" textAlign="center" fontSize={{ base: "sm", md: "md" }}>
                Loading VRF data...
              </Text>
            </Box>
          ) : (
            <Box bg={cardBg} p={{ base: 4, md: 6 }} borderRadius="lg" borderWidth="1px" borderColor={borderColor} overflowX="auto">
              <VRFVisualization entries={vrfData} maxEntries={6} />
            </Box>
          )}

          {/* Game Selection Cards */}
          <Box>
            <Heading size="lg" mb={6} color="white">
              🎮 Interactive Game Demos
            </Heading>
            <Text color="gray.400" mb={6} fontSize={{ base: "sm", md: "md" }}>
              Click on a game below to try it out. Each demo shows how SERV.random VRF is used in real smart contracts.
            </Text>
            
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              {/* Fishing Game Card */}
              <Link href="/random/demo/fishing">
                <Box
                  bg={cardBg}
                  p={6}
                  borderRadius="lg"
                  borderWidth="2px"
                  borderColor={borderColor}
                  _hover={{ borderColor: "blue.400", transform: "translateY(-2px)" }}
                  transition="all 0.2s"
                  cursor="pointer"
                  h="100%"
                >
                  <Heading size="md" mb={3} color="white">
                    🎣 Fishing Game
                  </Heading>
                  <Text color="gray.400" mb={4} fontSize="sm">
                    Catch fish using VRF randomness. Each catch is determined by on-chain randomness from SERV.random.
                  </Text>
                  <Badge colorScheme="blue" fontSize="xs">
                    Pattern 1: Automatic Callback
                  </Badge>
                </Box>
              </Link>

              {/* Roulette Game Card */}
              <Link href="/random/demo/roulette">
                <Box
                  bg={cardBg}
                  p={6}
                  borderRadius="lg"
                  borderWidth="2px"
                  borderColor={borderColor}
                  _hover={{ borderColor: "red.400", transform: "translateY(-2px)" }}
                  transition="all 0.2s"
                  cursor="pointer"
                  h="100%"
                >
                  <Heading size="md" mb={3} color="white">
                    🎰 Roulette Game
                  </Heading>
                  <Text color="gray.400" mb={4} fontSize="sm">
                    Spin the wheel and see VRF-powered randomness determine your result. Watch the VRF seed generate your spin outcome.
                  </Text>
                  <Badge colorScheme="red" fontSize="xs">
                    Pattern 1: Automatic Callback
                  </Badge>
                </Box>
              </Link>

              {/* Dungeon Crawler Card */}
              <Link href="/random/demo/dungeon-crawler">
                <Box
                  bg={cardBg}
                  p={6}
                  borderRadius="lg"
                  borderWidth="2px"
                  borderColor={borderColor}
                  _hover={{ borderColor: "purple.400", transform: "translateY(-2px)" }}
                  transition="all 0.2s"
                  cursor="pointer"
                  h="100%"
                >
                  <Heading size="md" mb={3} color="white">
                    🐉 Dungeon Crawler
                  </Heading>
                  <Text color="gray.400" mb={4} fontSize="sm">
                    Create characters and explore dungeons. Character stats and interaction outcomes are generated using VRF randomness.
                  </Text>
                  <Badge colorScheme="purple" fontSize="xs">
                    Pattern 2: Manual Claim
                  </Badge>
                </Box>
              </Link>

              {/* Integration Examples Card */}
              <Link href="/random/demo/integration">
                <Box
                  bg={cardBg}
                  p={6}
                  borderRadius="lg"
                  borderWidth="2px"
                  borderColor={borderColor}
                  _hover={{ borderColor: "green.400", transform: "translateY(-2px)" }}
                  transition="all 0.2s"
                  cursor="pointer"
                  h="100%"
                >
                  <Heading size="md" mb={3} color="white">
                    📊 Integration Examples
                  </Heading>
                  <Text color="gray.400" mb={4} fontSize="sm">
                    View live VRF data from all games and see code examples for integrating SERV.random into your contracts.
                  </Text>
                  <Badge colorScheme="green" fontSize="xs">
                    Live Data & Examples
                  </Badge>
                </Box>
              </Link>
            </SimpleGrid>
          </Box>

          {/* Code Examples Section */}
          <Box bg={cardBg} p={{ base: 4, md: 6 }} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
            <Heading size="lg" mb={4} color="white">
              💻 Quick Code Examples
            </Heading>
            <Text color="gray.400" mb={4} fontSize={{ base: "sm", md: "md" }}>
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

                  <Box bg={cardBg} p={{ base: 4, md: 6 }} borderRadius="lg" borderWidth="1px" borderColor={borderColor} mt={4}>
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
  );
};

// Outer component that provides context
const DemoPage = () => {
  return (
    <PlaytestModeProvider>
      <WalletProvider>
        <DemoPageContent />
      </WalletProvider>
    </PlaytestModeProvider>
  );
};

export default DemoPage;
