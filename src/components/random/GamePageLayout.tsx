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
              const rouletteAbi = [
                "function getRecentSpins(uint256 count) external view returns (uint256[])",
                "function getSpin(uint256 _spinId) external view returns (address player, uint8 result, string memory color, bool isEven, bytes32 vrfSeed, uint256 timestamp)",
              ];
              const contract = new ethers.Contract(rouletteAddress, rouletteAbi, rpcProvider);
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
                  if (spin.result !== 255 && spin.vrfSeed !== ethers.ZeroHash) {
                    let timestamp = Number(spin.timestamp);
                    if (timestamp < 1000000000000) timestamp = timestamp * 1000;
                    spins.push({
                      blockNumber: 0,
                      timestamp: timestamp || Date.now(),
                      vrfValue: spin.vrfSeed,
                      harmonyBlockHash: "0x0000000000000000000000000000000000000000000000000000000000000000",
                      gameSource: "RouletteGame",
                      network: network,
                      metadata: { spinId: spinId.toString(), result: spin.result, color: spin.color },
                    });
                  }
                } catch (error) {
                  console.warn(`Error fetching spin ${spinId.toString()}:`, error);
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
              const dungeonAbi = [
                "function characterCounter() external view returns (uint256)",
                "function characters(uint256) external view returns (address player, uint8 class, uint8 strength, uint8 dexterity, uint8 intelligence, uint8 wisdom, uint8 constitution, uint8 charisma, uint256 level, uint256 health, uint256 maxHealth, uint256 wealth, bytes32 creationSeed, bool alive, uint256 actionCount, uint8 status, uint256 createdAt)",
              ];
              const contract = new ethers.Contract(dungeonAddress, dungeonAbi, rpcProvider);
              const vrfEntries: VRFEntry[] = [];
              
              try {
                const characterCounter = await contract.characterCounter();
                const startId = characterCounter > BigInt(10) ? characterCounter - BigInt(10) : BigInt(1);
                for (let charId = startId; charId <= characterCounter; charId++) {
                  try {
                    const character = await contract.characters(charId);
                    const creationSeed = character.creationSeed || character[13];
                    const createdAt = character.createdAt || character[17];
                    if (creationSeed && creationSeed !== ethers.ZeroHash) {
                      let timestamp = Number(createdAt);
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
                  } catch (error) {
                    console.warn(`Error fetching character ${charId.toString()}:`, error);
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
          <Link href="/random/demo">
            <Text color="blue.400" _hover={{ textDecoration: "underline" }} fontSize="sm">
              ← Back to Demo Hub
            </Text>
          </Link>
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

