"use client";

import {
  Box,
  Container,
  Flex,
  useColorModeValue,
  Alert,
  AlertIcon,
  Text,
  Stack,
  Code,
  Tabs,
  TabList,
  Tab,
} from "@chakra-ui/react";
import { PageAnimation } from "@components/motion/PageAnimation";
import { VRFVisualization } from "@components/random/VRFVisualization";
import { contractsConfig } from "@config/contracts";
import { useWallet } from "@contexts/WalletContext";
import { useState, useEffect } from "react";
import { siteConfig } from "@config/site";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PlaytestModeToggle } from "@components/random/PlaytestModeToggle";

interface VRFEntry {
  blockNumber: number;
  timestamp: number;
  vrfValue: string;
  harmonyBlockHash: string;
  gameSource?: string;
  network?: string;
  requestId?: string;
  metadata?: Record<string, any>;
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

interface GamePageLayoutProps {
  currentGame: "fishing" | "roulette" | "dungeon-crawler";
  children: React.ReactNode;
  contractKey: "fishingGame" | "rouletteGame" | "dungeonCrawler";
}

const GAMES = [
  { id: "fishing", name: "🎣 Fishing", path: "/random/demo/fishing" },
  { id: "roulette", name: "🎰 Roulette", path: "/random/demo/roulette" },
  { id: "dungeon-crawler", name: "🐉 Dungeon Crawler", path: "/random/demo/dungeon-crawler" },
];

export function GamePageLayout({ currentGame, children, contractKey }: GamePageLayoutProps) {
  const router = useRouter();
  const { chainId } = useWallet();
  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const [vrfData, setVrfData] = useState<VRFEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    const fetchVRFData = async () => {
      try {
        console.log('🔄 Fetching VRF data from:', siteConfig.servRandomStatusUrl);
        const response = await fetch(siteConfig.servRandomStatusUrl, {
          cache: "no-store",
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('📊 API Response:', {
            hasRecentRandomness: !!data.recentRandomness,
            recentRandomnessLength: data.recentRandomness?.length || 0,
            hasFeeRequests: !!data.feeRequests,
            feeRequestsLength: data.feeRequests?.length || 0,
            feeRequestsSample: data.feeRequests?.slice(0, 3),
            fullDataKeys: Object.keys(data),
          });
          
          const combinedVRF: VRFEntry[] = [];
          
          // Add Harmony block VRF entries
          if (data.recentRandomness && Array.isArray(data.recentRandomness)) {
            console.log(`✅ Adding ${data.recentRandomness.length} Harmony block entries`);
            data.recentRandomness.forEach((entry: any) => {
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
              }
            });
          }
          
          // Add fulfilled game requests
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
                let timestamp = req.timestamp;
                if (typeof timestamp === 'string') {
                  timestamp = parseInt(timestamp, 10);
                }
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
          console.log(`📊 Setting VRF data: ${limitedVRF.length} entries`);
          setVrfData(limitedVRF);
          
          // Always set loading to false after backend API call completes
          setLoading(false);
          
          // Debug: Log what we're passing to VRFVisualization
          console.log("📤 Passing to VRFVisualization:", {
            entriesCount: limitedVRF.length,
            sampleEntry: limitedVRF[0] ? {
              vrfValue: limitedVRF[0].vrfValue?.slice(0, 20),
              gameSource: limitedVRF[0].gameSource,
              timestamp: limitedVRF[0].timestamp,
            } : null,
          });
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
    const refreshInterval = setInterval(fetchVRFData, 10000);
    return () => clearInterval(refreshInterval);
  }, [chainId]);

  const currentGameIndex = GAMES.findIndex(g => g.id === currentGame);

  const handleTabChange = (index: number) => {
    const game = GAMES[index];
    if (game && game.id !== currentGame) {
      router.push(game.path);
    }
  };

  return (
    <PageAnimation>
      <Container maxW="container.xl" py={8}>
        <Flex align="center" justify="space-between" mb={6} flexWrap="wrap" gap={4}>
          <Tabs index={currentGameIndex} onChange={handleTabChange} variant="enclosed" colorScheme="brand" flex={1}>
            <TabList>
              {GAMES.map((game) => (
                <Tab key={game.id} fontSize="md" fontWeight="semibold">
                  {game.name}
                </Tab>
              ))}
            </TabList>
          </Tabs>
          <Flex align="center" gap={4} flexWrap="wrap">
            <PlaytestModeToggle compact={true} />
            <Link href="/random/demo">
              <Text color="blue.400" _hover={{ textDecoration: "underline" }} fontSize="sm">
                ← Back to Demo Hub
              </Text>
            </Link>
          </Flex>
        </Flex>

        {/* VRF Visualization at the top */}
        <Box bg={cardBg} p={6} borderRadius="lg" borderWidth="1px" borderColor={borderColor} mb={6}>
          {loading ? (
            <Text color="gray.400" textAlign="center">
              Loading VRF data...
            </Text>
          ) : (
            <VRFVisualization entries={vrfData} maxEntries={50} />
          )}
        </Box>

        {/* Game content */}
        <Box bg={cardBg} p={6} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
          {children}
        </Box>

        <Alert status="info" borderRadius="lg" mt={4}>
          <AlertIcon />
          <Box>
            <Text fontWeight="bold">Contract Addresses</Text>
            <Stack spacing={1} fontSize="sm" mt={2}>
              <Text>
                <strong>Base Sepolia (Testnet):</strong>{" "}
                <Code fontSize="xs">{contractsConfig.baseSepolia?.[contractKey] || "Not deployed"}</Code>
              </Text>
              <Text>
                <strong>Base (Mainnet):</strong>{" "}
                <Code fontSize="xs">{contractsConfig.base[contractKey] || "Not deployed"}</Code>
              </Text>
            </Stack>
          </Box>
        </Alert>
      </Container>
    </PageAnimation>
  );
}

