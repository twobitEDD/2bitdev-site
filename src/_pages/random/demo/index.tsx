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
import Link from "next/link";
import { useState, useEffect } from "react";

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

  useEffect(() => {
    // Skip during build/SSR - only run on client
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    // NOTE: Removed blockchain polling - all VRF data comes from backend API
    // The backend API should include game-specific VRF data (RouletteGame, DungeonCrawler, FishingGame)
    
    const fetchVRFData = async () => {
      try {
        // Try the configured URL first, then fallback to /api/status if needed
        let apiUrl = siteConfig.servRandomStatusUrl;
        
        // If URL ends with /status, also try /api/status as fallback
        const baseUrl = apiUrl.replace(/\/status$/, '').replace(/\/api\/status$/, '');
        const possibleUrls = [
          apiUrl,
          `${baseUrl}/api/status`,
          `${baseUrl}/status`,
        ];
        
        let response: Response | null = null;
        let lastError: Error | null = null;
        
        for (const url of possibleUrls) {
          try {
            console.log('🔄 Trying VRF data from:', url);
            response = await fetch(url, {
              cache: "no-store",
            });
            
            if (response.ok) {
              console.log('✅ Successfully fetched from:', url);
              apiUrl = url;
              break;
            } else {
              console.warn(`⚠️ ${url} returned status ${response.status}`);
            }
          } catch (err) {
            console.warn(`⚠️ Failed to fetch from ${url}:`, err);
            lastError = err as Error;
            response = null;
          }
        }
        
        if (!response || !response.ok) {
          throw lastError || new Error(`Failed to fetch VRF data from any endpoint. Last status: ${response?.status}`);
        }
        
        console.log('📡 Response status:', response.status, response.statusText);
        
        if (response.ok) {
          const data = await response.json();
          console.log('📊 Full API Response:', JSON.stringify(data, null, 2));
          console.log('📊 API Response Summary:', {
            hasRecentRandomness: !!data.recentRandomness,
            recentRandomnessLength: data.recentRandomness?.length || 0,
            recentRandomnessType: Array.isArray(data.recentRandomness) ? 'array' : typeof data.recentRandomness,
            hasFeeRequests: !!data.feeRequests,
            feeRequestsLength: data.feeRequests?.length || 0,
            feeRequestsType: Array.isArray(data.feeRequests) ? 'array' : typeof data.feeRequests,
            feeRequestsSample: data.feeRequests?.slice(0, 3),
            fullDataKeys: Object.keys(data),
          });
          
          // Log sample entries to see structure
          if (data.recentRandomness && Array.isArray(data.recentRandomness) && data.recentRandomness.length > 0) {
            console.log('📋 Sample recentRandomness entry:', data.recentRandomness[0]);
          }
          if (data.feeRequests && Array.isArray(data.feeRequests) && data.feeRequests.length > 0) {
            console.log('📋 Sample feeRequest entry:', data.feeRequests[0]);
          }
          
          const combinedVRF: VRFEntry[] = [];
          
          // Add Harmony block VRF entries
          if (data.recentRandomness && Array.isArray(data.recentRandomness)) {
            console.log(`✅ Processing ${data.recentRandomness.length} Harmony block entries`);
            let addedCount = 0;
            let skippedCount = 0;
            data.recentRandomness.forEach((entry: any, idx: number) => {
              const vrfValue = entry.vrfValue || entry.randomness;
              if (vrfValue && vrfValue !== '0x0' && vrfValue !== '0x0000000000000000000000000000000000000000000000000000000000000000') {
                combinedVRF.push({
                  blockNumber: entry.blockNumber || 0,
                  timestamp: entry.timestamp || Date.now(),
                  vrfValue: vrfValue,
                  harmonyBlockHash: entry.harmonyBlockHash || entry.blockHash || '0x0',
                  gameSource: "Harmony Block",
                  network: "harmony",
                });
                addedCount++;
              } else {
                skippedCount++;
                console.warn(`⚠️ Skipped entry ${idx}: invalid vrfValue`, { vrfValue, entry });
              }
            });
            console.log(`✅ Added ${addedCount} Harmony block entries, skipped ${skippedCount}`);
          } else {
            console.warn('⚠️ recentRandomness is not an array:', typeof data.recentRandomness, data.recentRandomness);
          }
          
          // Add fulfilled game requests (they have randomnessValue)
          if (data.feeRequests && Array.isArray(data.feeRequests)) {
            console.log(`📋 Processing ${data.feeRequests.length} fee requests`);
            const fulfilledRequests = data.feeRequests
              .filter((req: FeeRequest, idx: number) => {
                const isFulfilled = req.fulfilled === true;
                const hasRandomness = req.randomnessValue && 
                  req.randomnessValue !== '0x0000000000000000000000000000000000000000000000000000000000000000' &&
                  req.randomnessValue !== '0x0';
                const shouldInclude = isFulfilled && hasRandomness;
                
                if (!shouldInclude) {
                  console.log(`  ⏭️ Skipping request ${idx}:`, {
                    fulfilled: req.fulfilled,
                    hasRandomness: !!hasRandomness,
                    randomnessValue: req.randomnessValue?.slice(0, 20),
                  });
                }
                
                return shouldInclude;
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
                  blockNumber: 0,
                  timestamp: timestamp || Date.now(),
                  vrfValue: req.randomnessValue!,
                  harmonyBlockHash: "0x0000000000000000000000000000000000000000000000000000000000000000",
                  gameSource: "FeeRequest",
                  network: req.network || "unknown",
                  requestId: req.requestId,
                };
              });
            console.log(`✅ Adding ${fulfilledRequests.length} fulfilled fee requests`);
            combinedVRF.push(...fulfilledRequests);
          }
          
          // Sort by timestamp (most recent first)
          combinedVRF.sort((a, b) => b.timestamp - a.timestamp);
          
          console.log(`📈 Total VRF entries: ${combinedVRF.length}`);
          
          // Always update data (even if empty) to ensure UI reflects current state
          const limitedVRF = combinedVRF.slice(0, 50);
          setVrfData(limitedVRF);
          
          // Always set loading to false after backend API call completes
          setLoading(false);
        } else {
          console.error('❌ API response not OK:', response.status, response.statusText);
          setLoading(false);
        }
      } catch (error) {
        console.error("❌ Error fetching VRF data:", error);
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

          {/* Live VRF Data - At the top */}
          {loading ? (
            <Box bg={cardBg} p={{ base: 4, md: 6 }} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
              <Text color="gray.400" textAlign="center" fontSize={{ base: "sm", md: "md" }}>
                Loading VRF data...
              </Text>
            </Box>
          ) : (
            <Box bg={cardBg} p={{ base: 4, md: 6 }} borderRadius="lg" borderWidth="1px" borderColor={borderColor} overflowX="auto">
              <VRFVisualization entries={vrfData} maxEntries={50} />
            </Box>
          )}

          {/* Playtest Mode Toggle */}
          <PlaytestModeToggle />

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
                    Catch fish using VRF randomness. Each catch is determined by on-chain randomness from SERV.random. Try both integration patterns!
                  </Text>
                  <Flex gap={2} flexWrap="wrap">
                    <Badge colorScheme="blue" fontSize="xs">
                      Pattern 1: Automatic Callback
                    </Badge>
                    <Badge colorScheme="green" fontSize="xs">
                      Pattern 2: Manual Claim
                    </Badge>
                  </Flex>
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
