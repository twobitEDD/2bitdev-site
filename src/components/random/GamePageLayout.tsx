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
import { ethers } from "ethers";
import { getRpcUrl } from "@config/rpc";
import { siteConfig } from "@config/site";
import Link from "next/link";
import { useRouter } from "next/navigation";
import RouletteGameABI from "@abis/RouletteGame.json";
import DungeonCrawlerABI from "@abis/DungeonCrawler.json";
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

  // Helper to get a provider for read-only queries using Alchemy RPC
  const getReadOnlyProvider = (network: "base" | "baseSepolia" = "baseSepolia"): ethers.JsonRpcProvider => {
    const rpcUrl = getRpcUrl(network);
    return new ethers.JsonRpcProvider(rpcUrl);
  };

  useEffect(() => {
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    const fetchVRFData = async () => {
      try {
        const response = await fetch(siteConfig.servRandomStatusUrl, {
          cache: "no-store",
        });
        if (response.ok) {
          const data = await response.json();
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
            combinedVRF.push(...fulfilledRequests);
          }
          
          // Sort by timestamp (most recent first) and update UI immediately
          combinedVRF.sort((a, b) => b.timestamp - a.timestamp);
          if (combinedVRF.length > 0) {
            setVrfData([...combinedVRF]);
            setLoading(false);
          }
          
          // Fetch game-specific VRF data from contracts in parallel (non-blocking)
          const withTimeout = <T,>(promise: Promise<T>, timeoutMs: number = 8000): Promise<T> => {
            return Promise.race([
              promise,
              new Promise<T>((_, reject) => 
                setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
              )
            ]);
          };
          
          // Fetch RouletteGame spins
          const fetchRouletteGameSpins = async (network: "base" | "baseSepolia"): Promise<VRFEntry[]> => {
            try {
              const rouletteAddress = contractsConfig[network]?.rouletteGame;
              if (!rouletteAddress) return [];
              const rpcProvider = getReadOnlyProvider(network);
              // Use full ABI from JSON file
              const contract = new ethers.Contract(rouletteAddress, RouletteGameABI.abi, rpcProvider);
              const recentSpinIds = await Promise.race([
                contract.getRecentSpins(10),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
              ]) as bigint[];
              if (!recentSpinIds || recentSpinIds.length === 0) return [];
              
              const spins: VRFEntry[] = [];
              for (const spinId of recentSpinIds) {
                try {
                  const spin = await Promise.race([
                    contract.getSpin(spinId),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))
                  ]) as any;
                  
                  // Safely access spin properties
                  const result = spin?.result ?? spin?.[1] ?? 255;
                  const vrfSeed = spin?.vrfSeed ?? spin?.[4] ?? null;
                  const timestamp = spin?.timestamp ?? spin?.[5] ?? null;
                  
                  if (result !== 255 && vrfSeed && vrfSeed !== ethers.ZeroHash && vrfSeed !== "0x0000000000000000000000000000000000000000000000000000000000000000") {
                    let ts = timestamp ? Number(timestamp) : Date.now();
                    if (ts < 1000000000000) ts = ts * 1000;
                    spins.push({
                      blockNumber: 0,
                      timestamp: ts || Date.now(),
                      vrfValue: vrfSeed,
                      harmonyBlockHash: "0x0000000000000000000000000000000000000000000000000000000000000000",
                      gameSource: "RouletteGame",
                      network: network,
                      metadata: { 
                        spinId: spinId.toString(), 
                        result: result,
                        color: spin?.color ?? spin?.[2] ?? "unknown"
                      },
                    });
                  }
                } catch (error: any) {
                  // Skip spins that don't exist or fail to load
                  if (error?.code === 'CALL_EXCEPTION' || error?.message?.includes('revert') || error?.message?.includes('Timeout')) {
                    // Spin doesn't exist or timed out, skip silently
                  } else {
                    console.warn(`Error fetching spin ${spinId.toString()}:`, error?.message || error);
                  }
                }
              }
              return spins;
            } catch (error) {
              console.error(`Error fetching RouletteGame spins from ${network}:`, error);
              return [];
            }
          };
          
          // Fetch DungeonCrawler VRF data
          const fetchDungeonCrawlerVRF = async (network: "base" | "baseSepolia"): Promise<VRFEntry[]> => {
            try {
              const dungeonAddress = contractsConfig[network]?.dungeonCrawler;
              if (!dungeonAddress) return [];
              const rpcProvider = getReadOnlyProvider(network);
              // Use full ABI from JSON file
              const contract = new ethers.Contract(dungeonAddress, DungeonCrawlerABI.abi, rpcProvider);
              const vrfEntries: VRFEntry[] = [];
              
              try {
                const characterCounter = await contract.characterCounter();
                if (!characterCounter || characterCounter === BigInt(0)) {
                  return [];
                }
                const startId = characterCounter > BigInt(10) ? characterCounter - BigInt(10) : BigInt(1);
                for (let charId = startId; charId <= characterCounter; charId++) {
                  try {
                    const character = await Promise.race([
                      contract.characters(charId),
                      new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('Timeout')), 2000)
                      )
                    ]) as any;
                    
                    // Safely access creationSeed - try named first, then indexed
                    // Mapping structure: 0=player, 1=class, 2=strength, 3=dexterity, 4=intelligence, 
                    // 5=wisdom, 6=constitution, 7=charisma, 8=level, 9=experience, 10=health, 
                    // 11=maxHealth, 12=wealth, 13=creationSeed, 14=alive, 15=actionCount, 16=status, 17=createdAt
                    let creationSeed: string | null = null;
                    try {
                      creationSeed = character?.creationSeed || character?.[13] || null;
                    } catch (e) {
                      // Skip if we can't access creationSeed
                      continue;
                    }
                    
                    // Safely access createdAt - try named first, then indexed (index 17)
                    let createdAt: number | bigint | null = null;
                    try {
                      createdAt = character?.createdAt || character?.[17] || null;
                    } catch (e) {
                      createdAt = null;
                    }
                    
                    if (creationSeed && creationSeed !== ethers.ZeroHash && creationSeed !== "0x0000000000000000000000000000000000000000000000000000000000000000") {
                      let timestamp = createdAt ? Number(createdAt) : Date.now();
                      if (timestamp < 1000000000000) timestamp = timestamp * 1000;
                      vrfEntries.push({
                        blockNumber: 0,
                        timestamp: timestamp || Date.now(),
                        vrfValue: creationSeed,
                        harmonyBlockHash: "0x0000000000000000000000000000000000000000000000000000000000000000",
                        gameSource: "DungeonCrawler",
                        network: network,
                        metadata: { characterId: charId.toString(), type: "character_creation" },
                      });
                    }
                  } catch (error: any) {
                    // Skip characters that don't exist or fail to load
                    if (error?.code === 'CALL_EXCEPTION' || error?.message?.includes('revert') || error?.message?.includes('RangeError')) {
                      // Character doesn't exist, skip silently
                    } else {
                      console.warn(`Error fetching character ${charId.toString()}:`, error?.message || error);
                    }
                  }
                }
              } catch (error) {
                console.warn(`Error fetching characters:`, error);
              }
              
              return vrfEntries;
            } catch (error) {
              console.error(`Error fetching DungeonCrawler VRF from ${network}:`, error);
              return [];
            }
          };
          
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
            
            const allVRF = [...combinedVRF, ...baseSepoliaSpins, ...baseSpins, ...baseSepoliaDungeon, ...baseDungeon];
            allVRF.sort((a, b) => b.timestamp - a.timestamp);
            const limitedVRF = allVRF.slice(0, 50);
            setVrfData(limitedVRF);
          });
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching VRF data:", error);
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

