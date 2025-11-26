"use client";

import {
  Box,
  Container,
  Flex,
  Heading,
  useColorModeValue,
  Text,
} from "@chakra-ui/react";
import { PageAnimation } from "@components/motion/PageAnimation";
import { VRFVisualization } from "@components/random/VRFVisualization";
import { PlaytestModeProvider } from "@contexts/PlaytestModeContext";
import { WalletProvider, useWallet } from "@contexts/WalletContext";
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

function IntegrationPageContent() {
  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const { provider } = useWallet();
  const [vrfData, setVrfData] = useState<VRFEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper to get a provider for read-only queries (uses WalletContext provider if available)
  const getReadOnlyProvider = (): ethers.Provider | null => {
    if (typeof window === 'undefined') {
      return null;
    }
    
    // Prefer provider from WalletContext (uses user's configured RPC)
    if (provider) {
      return provider;
    }
    
    // Fallback to window.ethereum if available
    if (window.ethereum) {
      return new ethers.BrowserProvider(window.ethereum);
    }
    
    return null;
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
          return [];
        }

        const rpcProvider = getReadOnlyProvider();
        if (!rpcProvider) {
          return [];
        }

        const rouletteAbi = [
          "function getRecentSpins(uint256 count) external view returns (uint256[])",
          "function getSpin(uint256 _spinId) external view returns (address player, uint8 result, string memory color, bool isEven, bytes32 vrfSeed, uint256 timestamp)",
        ];

        const contract = new ethers.Contract(rouletteAddress, rouletteAbi, rpcProvider);
        
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
        
        for (const spinId of recentSpinIds) {
          try {
            const spin = await Promise.race([
              contract.getSpin(spinId),
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error(`Timeout fetching spin ${spinId.toString()}`)), 3000)
              )
            ]) as any;
            
            if (spin.result !== 255 && 
                spin.vrfSeed !== ethers.ZeroHash && 
                spin.vrfSeed !== "0x0000000000000000000000000000000000000000000000000000000000000000") {
              let timestamp = Number(spin.timestamp);
              if (timestamp < 1000000000000) {
                timestamp = timestamp * 1000;
              }
              
              spins.push({
                blockNumber: 0,
                timestamp: timestamp || Date.now(),
                vrfValue: spin.vrfSeed,
                harmonyBlockHash: "0x0000000000000000000000000000000000000000000000000000000000000000",
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

    // Helper function to fetch DungeonCrawler VRF data
    const fetchDungeonCrawlerVRF = async (network: "base" | "baseSepolia" = "baseSepolia"): Promise<VRFEntry[]> => {
      try {
        const dungeonAddress = contractsConfig[network]?.dungeonCrawler;
        if (!dungeonAddress) {
          return [];
        }

        const rpcProvider = getReadOnlyProvider();
        if (!rpcProvider) {
          return [];
        }

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
          console.error(`Error fetching characters:`, error);
        }
        
        return vrfEntries;
      } catch (error) {
        console.error(`Error fetching DungeonCrawler VRF from ${network}:`, error);
        return [];
      }
    };

    const fetchVRFData = async () => {
      try {
        const withTimeout = <T,>(promise: Promise<T>, timeoutMs: number = 8000): Promise<T> => {
          return Promise.race([
            promise,
            new Promise<T>((_, reject) => 
              setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
            )
          ]);
        };
        
        const [baseSepoliaSpinsResult, baseSpinsResult, baseSepoliaDungeonResult, baseDungeonResult] = await Promise.allSettled([
          withTimeout(fetchRouletteGameSpins("baseSepolia"), 8000),
          withTimeout(fetchRouletteGameSpins("base"), 8000),
          withTimeout(fetchDungeonCrawlerVRF("baseSepolia"), 8000),
          withTimeout(fetchDungeonCrawlerVRF("base"), 8000),
        ]);
        
        const baseSepoliaSpins = baseSepoliaSpinsResult.status === 'fulfilled' ? baseSepoliaSpinsResult.value : [];
        const baseSpins = baseSpinsResult.status === 'fulfilled' ? baseSpinsResult.value : [];
        const baseSepoliaDungeon = baseSepoliaDungeonResult.status === 'fulfilled' ? baseSepoliaDungeonResult.value : [];
        const baseDungeon = baseDungeonResult.status === 'fulfilled' ? baseDungeonResult.value : [];
        
        const combinedVRF = [...baseSepoliaSpins, ...baseSpins, ...baseSepoliaDungeon, ...baseDungeon];
        combinedVRF.sort((a, b) => b.timestamp - a.timestamp);
        
        setVrfData(combinedVRF);
      } catch (error) {
        console.error("Error fetching VRF data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVRFData();
  }, [provider]);

  return (
    <Container maxW="container.xl" py={8}>
      <Flex align="center" justify="space-between" mb={6} flexWrap="wrap" gap={4}>
        <Heading size="lg" color="white">
          📊 VRF Integration Examples
        </Heading>
        <Link href="/random/demo">
          <Text color="blue.400" _hover={{ textDecoration: "underline" }}>
            ← Back to Demo Hub
          </Text>
        </Link>
      </Flex>

      <Box bg={cardBg} p={6} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
        <VRFVisualization entries={vrfData} maxEntries={20} />
      </Box>
    </Container>
  );
}

export default function IntegrationPage() {
  return (
    <WalletProvider>
      <PlaytestModeProvider>
        <PageAnimation>
          <IntegrationPageContent />
        </PageAnimation>
      </PlaytestModeProvider>
    </WalletProvider>
  );
}

