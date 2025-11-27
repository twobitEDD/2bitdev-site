"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  Stack,
  Text,
  useToast,
  Alert,
  AlertIcon,
  Spinner,
  Heading,
  useColorModeValue,
  Badge,
  SimpleGrid,
  Code,
  Flex,
  Radio,
  RadioGroup,
  VStack,
} from "@chakra-ui/react";
import {
  mockGoFishing,
  mockCatchFish,
  pollForFulfillment,
} from "@utils/mockContracts";
import { usePlaytestMode } from "@contexts/PlaytestModeContext";
import { useWallet } from "@contexts/WalletContext";
import { goFishing, catchFish, pollForFulfillmentStatus } from "@utils/contractHelpers";
import { contractsConfig } from "@config/contracts";
import { ethers } from "ethers";

interface FishCatch {
  fishType: number;
  fishName: string;
  size: number;
  value: number;
  rarity: string;
  randomness: string;
  tokenId?: number;
}

const FISH_TYPES = [
  { name: "Goldfish", rarity: "Common", emoji: "🐠" },
  { name: "Trout", rarity: "Uncommon", emoji: "🐟" },
  { name: "Salmon", rarity: "Rare", emoji: "🐟" },
  { name: "Tuna", rarity: "Epic", emoji: "🐟" },
  { name: "Shark", rarity: "Legendary", emoji: "🦈" },
  { name: "Whale", rarity: "Mythical", emoji: "🐋" },
];

const getFishEmoji = (fishType: number): string => {
  return FISH_TYPES[fishType]?.emoji || "🐠";
};

const getFishRarity = (fishType: number): string => {
  return FISH_TYPES[fishType]?.rarity || "Common";
};

const getRarityColor = (rarity: string): string => {
  const colors: Record<string, string> = {
    Common: "gray",
    Uncommon: "green",
    Rare: "blue",
    Epic: "purple",
    Legendary: "orange",
    Mythical: "red",
  };
  return colors[rarity] || "gray";
};

export function FishingGameDemo() {
  const toast = useToast();
  const { isPlaytestMode } = usePlaytestMode();
  const { isConnected, signer, provider, connectWallet, switchToBaseSepolia, isBaseSepolia } = useWallet();
  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const bgColor = useColorModeValue("gray.50", "gray.800");

  const [currentRequestId, setCurrentRequestId] = useState<string | null>(null);
  const [fishingStep, setFishingStep] = useState<"idle" | "requested" | "readyToCatch" | "caught">("idle");
  const [caughtFish, setCaughtFish] = useState<FishCatch | null>(null);
  const [fishHistory, setFishHistory] = useState<FishCatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingNFTs, setLoadingNFTs] = useState(false);
  const [vrfSeed, setVrfSeed] = useState<string | null>(null);
  const [pattern, setPattern] = useState<"pattern1" | "pattern2">("pattern1");
  const [nftLinkageError, setNftLinkageError] = useState<string | null>(null);

  // Load user's NFTs from contract
  const loadUserNFTs = useCallback(async () => {
    // Skip if in playtest mode or wallet not connected
    if (isPlaytestMode || !isConnected || !signer || !provider) {
      console.log("⏭️ Skipping NFT load - playtest mode or wallet not connected");
      return;
    }

    try {
      setLoadingNFTs(true);
      const network = "baseSepolia"; // Using Base Sepolia for now
      const nftAddress = contractsConfig[network]?.fishingGameNFT;
      
      console.log("🎣 Loading NFTs from:", {
        network,
        nftAddress,
        fishingGame: contractsConfig[network]?.fishingGame,
      });
      
      if (!nftAddress) {
        console.warn("❌ FishingGameNFT address not configured for", network);
        return;
      }

      const userAddress = await signer.getAddress();
      console.log("👤 User address:", userAddress);
      
      // NFT Contract ABI - using minimal ABI for now (should be replaced with JSON ABI when available)
      const nftAbi = [
        "function balanceOf(address owner) view returns (uint256)",
        "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
        "function fishMetadata(uint256 tokenId) view returns (uint8 fishType, uint256 size, uint256 value, uint256 timestamp, string memory fishName, bytes32 randomness)",
        "event FishNFTMinted(address indexed to, uint256 indexed tokenId, uint8 fishType, uint256 size, uint256 value, string fishName, bytes32 randomness)",
      ];

      const nftContract = new ethers.Contract(nftAddress, nftAbi, provider);
      
      // Check if contract exists
      const contractCode = await provider.getCode(nftAddress);
      if (!contractCode || contractCode === "0x" || contractCode === "0x0") {
        console.warn(`⚠️ NFT contract not found at ${nftAddress}`);
        setFishHistory([]);
        return;
      }
      
      // Get user's balance
      console.log("📊 Checking NFT balance...");
      const balance = await nftContract.balanceOf(userAddress);
      const balanceNum = Number(balance);
      console.log(`📊 NFT Balance: ${balanceNum} tokens`);
      
      if (balanceNum === 0) {
        console.log("ℹ️ No NFTs found for user");
        setFishHistory([]);
        return;
      }

      // Get all token IDs owned by user
      console.log(`🔍 Fetching ${balanceNum} token IDs...`);
      const tokenIds: bigint[] = [];
      for (let i = 0; i < balanceNum; i++) {
        try {
          // Add timeout for each token fetch to prevent hanging
          const tokenId = await Promise.race([
            nftContract.tokenOfOwnerByIndex(userAddress, i),
            new Promise<bigint>((_, reject) => 
              setTimeout(() => reject(new Error(`Timeout fetching token ${i}`)), 5000)
            )
          ]);
          tokenIds.push(tokenId);
          console.log(`  Token ${i}: #${tokenId.toString()}`);
        } catch (err: any) {
          console.warn(`❌ Error getting token ${i}:`, err?.message || err);
          // If enumeration fails, try event-based approach
          if (i === 0) {
            console.log("⚠️ tokenOfOwnerByIndex not available, trying events...");
            try {
              const currentBlock = await provider.getBlockNumber();
              const fromBlock = Math.max(0, currentBlock - 100000);
              const filter = nftContract.filters.FishNFTMinted(userAddress, null);
              const events = await nftContract.queryFilter(filter, fromBlock, currentBlock);
              
              const tokenIdSet = new Set<string>();
              for (const event of events) {
                if ("args" in event && event.args && event.args.tokenId) {
                  tokenIdSet.add(event.args.tokenId.toString());
                }
              }
              tokenIds.push(...Array.from(tokenIdSet).map(id => BigInt(id)));
              console.log(`   ✅ Found ${tokenIdSet.size} token(s) via events`);
            } catch (eventErr) {
              console.warn(`   ⚠️ Could not query events:`, eventErr);
            }
          }
          // Continue to next token instead of stopping
        }
      }

      console.log(`✅ Found ${tokenIds.length} token IDs:`, tokenIds.map(t => t.toString()));

      if (tokenIds.length === 0) {
        console.log("ℹ️ No NFTs found for user");
        setFishHistory([]);
        return;
      }

      // Get metadata for each token (with timeout)
      const loadedFish: FishCatch[] = [];
      for (const tokenId of tokenIds) {
        try {
          console.log(`📝 Loading metadata for token #${tokenId.toString()}...`);
          const metadata = await Promise.race([
            nftContract.fishMetadata(tokenId),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error(`Timeout loading metadata for token ${tokenId.toString()}`)), 5000)
            )
          ]) as any;
          
          const fishType = Number(metadata.fishType);
          const fishName = metadata.fishName;
          const size = Number(metadata.size);
          const value = Number(metadata.value);
          const randomness = metadata.randomness;
          
          console.log(`  ✅ Token #${tokenId.toString()}: ${fishName} (Type: ${fishType}, Size: ${size}cm, Value: ${value})`);
          
          loadedFish.push({
            fishType,
            fishName,
            size,
            value,
            rarity: getFishRarity(fishType),
            randomness,
            tokenId: Number(tokenId),
          });
        } catch (err: any) {
          console.warn(`❌ Error loading metadata for token ${tokenId.toString()}:`, err?.message || err);
          // Continue loading other tokens instead of stopping
        }
      }
      
      console.log(`📊 Successfully loaded ${loadedFish.length} out of ${tokenIds.length} NFTs`);

      // Sort by token ID (newest first, assuming higher token IDs are newer)
      loadedFish.sort((a, b) => (b.tokenId || 0) - (a.tokenId || 0));
      
      console.log(`🎉 Loaded ${loadedFish.length} fish NFTs successfully`);
      setFishHistory(loadedFish);
    } catch (error) {
      console.error("❌ Error loading user NFTs:", error);
    } finally {
      setLoadingNFTs(false);
    }
  }, [isPlaytestMode, isConnected, signer, provider]);

  // Check NFT contract linkage when component mounts or wallet connects
  const checkNFTLinkage = useCallback(async () => {
    if (isPlaytestMode || !isConnected || !signer || !provider) {
      setNftLinkageError(null);
      return;
    }

    try {
      const network = "baseSepolia";
      const fishingGameAddress = contractsConfig[network]?.fishingGame;
      const nftAddress = contractsConfig[network]?.fishingGameNFT;

      if (!fishingGameAddress || !nftAddress) {
        return;
      }

      // Check FishingGame's NFT contract
      const fishingGameAbi = ["function nftContract() view returns (address)"];
      const fishingGameContract = new ethers.Contract(fishingGameAddress, fishingGameAbi, provider);
      const nftContractInFishingGame = await fishingGameContract.nftContract();

      // Check NFT contract's FishingGame address
      const nftAbi = ["function fishingGame() view returns (address)"];
      const nftContract = new ethers.Contract(nftAddress, nftAbi, provider);
      const fishingGameInNFT = await nftContract.fishingGame();

      // Verify linkage
      const fishingGameLinked = nftContractInFishingGame.toLowerCase() === nftAddress.toLowerCase();
      const nftLinked = fishingGameInNFT.toLowerCase() === fishingGameAddress.toLowerCase();

      if (!fishingGameLinked || !nftLinked) {
        let errorMessage = "NFT contract linkage issue:\n";
        
        if (!fishingGameLinked) {
          if (nftContractInFishingGame === "0x0000000000000000000000000000000000000000") {
            errorMessage += `❌ FishingGame.nftContract() is not set (address(0))\n`;
            errorMessage += `   Expected: ${nftAddress}\n`;
            errorMessage += `   Fix: Call FishingGame.setNFTContract(${nftAddress})\n\n`;
          } else {
            errorMessage += `❌ FishingGame.nftContract() mismatch\n`;
            errorMessage += `   Expected: ${nftAddress}\n`;
            errorMessage += `   Actual: ${nftContractInFishingGame}\n`;
            errorMessage += `   Fix: Call FishingGame.setNFTContract(${nftAddress})\n\n`;
          }
        }
        
        if (!nftLinked) {
          if (fishingGameInNFT === "0x0000000000000000000000000000000000000000") {
            errorMessage += `❌ NFT.fishingGame() is not set (address(0))\n`;
            errorMessage += `   Expected: ${fishingGameAddress}\n`;
            errorMessage += `   Fix: Call NFT.setFishingGame(${fishingGameAddress})\n`;
          } else {
            errorMessage += `❌ NFT.fishingGame() mismatch\n`;
            errorMessage += `   Expected: ${fishingGameAddress}\n`;
            errorMessage += `   Actual: ${fishingGameInNFT}\n`;
            errorMessage += `   Fix: Call NFT.setFishingGame(${fishingGameAddress})\n`;
          }
        }
        
        errorMessage += `\nNFTs will not mint until contracts are properly linked.`;
        
        setNftLinkageError(errorMessage);
        console.error("❌ NFT Contract Linkage Issue:", {
          expectedFishingGame: fishingGameAddress,
          expectedNFT: nftAddress,
          actualFishingGameNFT: nftContractInFishingGame,
          actualNFTFishingGame: fishingGameInNFT,
          fishingGameLinked,
          nftLinked,
        });
      } else {
        setNftLinkageError(null);
        console.log("✅ NFT contract linkage verified");
      }
    } catch (error) {
      console.error("Error checking NFT linkage:", error);
      // Don't set error state - might be a temporary network issue
    }
  }, [isPlaytestMode, isConnected, signer, provider]);

  // Load NFTs when component mounts or wallet connects
  useEffect(() => {
    if (isConnected && !isPlaytestMode && signer) {
      checkNFTLinkage();
      loadUserNFTs();
    } else if (isPlaytestMode) {
      // In playtest mode, clear history on disconnect
      setFishHistory([]);
      setNftLinkageError(null);
    }
  }, [isConnected, isPlaytestMode, signer, loadUserNFTs, checkNFTLinkage]);

  const handleGoFishing = async () => {
    // Check if wallet connected when not in playtest mode
    if (!isPlaytestMode && !isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to use real contracts, or enable Playtest Mode",
        status: "warning",
        duration: 5000,
      });
      return;
    }

    // Check if on correct network when not in playtest mode
    if (!isPlaytestMode && !isBaseSepolia) {
      try {
        await switchToBaseSepolia();
        toast({
          title: "Switching Network",
          description: "Please switch to Base Sepolia testnet",
          status: "info",
          duration: 3000,
        });
        return;
      } catch (error) {
        toast({
          title: "Network Switch Failed",
          description: error instanceof Error ? error.message : "Please switch to Base Sepolia manually",
          status: "error",
          duration: 5000,
        });
        return;
      }
    }

    try {
      setLoading(true);
      setFishingStep("requested");
      setCaughtFish(null);
      setVrfSeed(null);

      // Use real contract or mock based on playtest mode
      const result = await goFishing(isPlaytestMode, signer, provider, "baseSepolia");
      setCurrentRequestId(result.requestId);

      toast({
        title: "Fishing Trip Started!",
        description: `Request ID: ${result.requestId.slice(0, 10)}...${result.txHash ? ` | TX: ${result.txHash.slice(0, 10)}...` : ""}`,
        status: "info",
        duration: 3000,
      });

      // Pattern 1: Poll for FishCaught event (automatic callback)
      // Pattern 2: Poll for VRF fulfillment, then user clicks Catch Fish
      if (pattern === "pattern1") {
        // Pattern 1: Poll for FishCaught event directly
        setTimeout(async () => {
          try {
            await pollForFishCaughtEvent(isPlaytestMode, provider, result.requestId, "baseSepolia");
            // FishCaught event found - fish was automatically caught via callback
            // The pollForFishCaughtEvent will update the state
          } catch (error) {
            console.error("Error polling for FishCaught event:", error);
            toast({
              title: "Error",
              description: "Failed to detect fish catch. The callback may still be processing.",
              status: "warning",
              duration: 5000,
            });
          }
        }, 2000);
      } else {
        // Pattern 2: Poll for VRF fulfillment, then show Catch Fish button
        setTimeout(async () => {
          try {
            const status = await pollForFulfillmentStatus(isPlaytestMode, provider, result.requestId, "baseSepolia");
            if (status.fulfilled && status.randomnessValue) {
              setVrfSeed(status.randomnessValue);
              setFishingStep("readyToCatch");
              toast({
                title: "VRF Received!",
                description: "Randomness is ready. Click Catch Fish to see what you caught!",
                status: "success",
                duration: 5000,
              });
            }
          } catch (error) {
            console.error("Error polling:", error);
          }
        }, 2000);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to start fishing",
        status: "error",
        duration: 5000,
      });
      setFishingStep("idle");
    } finally {
      setLoading(false);
    }
  };

  const handleCatchFish = async () => {
    if (!currentRequestId || !vrfSeed) {
      toast({
        title: "Error",
        description: "No active fishing request or VRF not ready",
        status: "error",
        duration: 3000,
      });
      return;
    }

    // Check if wallet connected when not in playtest mode
    if (!isPlaytestMode && !isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to use real contracts, or enable Playtest Mode",
        status: "warning",
        duration: 5000,
      });
      return;
    }

    try {
      setLoading(true);
      // Use real contract or mock based on playtest mode
      const result = await catchFish(isPlaytestMode, signer, currentRequestId, vrfSeed, "baseSepolia");

      const fish: FishCatch = {
        fishType: result.fishType,
        fishName: result.fishName,
        size: result.size,
        value: result.value,
        rarity: getFishRarity(result.fishType),
        randomness: vrfSeed,
        tokenId: fishHistory.length + 1,
      };

      setCaughtFish(fish);
      setFishingStep("caught");
      
      // Reload NFTs from contract to get the actual token ID
      if (!isPlaytestMode && isConnected && signer) {
        // Try multiple times with increasing delays to ensure NFT is loaded
        setTimeout(() => {
          console.log("🔄 Reloading NFTs after catch (attempt 1)...");
          loadUserNFTs();
        }, 3000);
        setTimeout(() => {
          console.log("🔄 Reloading NFTs after catch (attempt 2)...");
          loadUserNFTs();
        }, 8000);
        setTimeout(() => {
          console.log("🔄 Reloading NFTs after catch (attempt 3)...");
          loadUserNFTs();
        }, 15000);
      } else {
        // In playtest mode, just add to local history
        setFishHistory([fish, ...fishHistory]);
      }

      toast({
        title: `Caught a ${fish.fishName}!`,
        description: `${getFishEmoji(fish.fishType)} ${fish.rarity} - Size: ${fish.size}cm, Value: ${fish.value} gold`,
        status: "success",
        duration: 5000,
      });

      // Reset for next fishing trip
      setTimeout(() => {
        setCurrentRequestId(null);
        setFishingStep("idle");
        setVrfSeed(null);
      }, 3000);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to catch fish",
        status: "error",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Poll for FishCaught event (Pattern 1 - automatic callback)
  const pollForFishCaughtEvent = async (
    isPlaytestMode: boolean,
    provider: ethers.BrowserProvider | null,
    requestId: string,
    network: "base" | "baseSepolia"
  ) => {
    if (isPlaytestMode || !provider) {
      // In playtest mode, simulate automatic catch
      setTimeout(() => {
        const mockFish: FishCatch = {
          fishType: Math.floor(Math.random() * 6),
          fishName: FISH_TYPES[Math.floor(Math.random() * 6)].name,
          size: 50 + Math.floor(Math.random() * 251),
          value: Math.floor(Math.random() * 1000),
          rarity: "Common",
          randomness: "0x" + Math.random().toString(16).substr(2, 64),
        };
        setCaughtFish(mockFish);
        setFishingStep("caught");
        toast({
          title: `Caught a ${mockFish.fishName}!`,
          description: `${getFishEmoji(mockFish.fishType)} ${mockFish.rarity} - Size: ${mockFish.size}cm, Value: ${mockFish.value} gold`,
          status: "success",
          duration: 5000,
        });
        setTimeout(() => {
          setCurrentRequestId(null);
          setFishingStep("idle");
          setVrfSeed(null);
        }, 3000);
      }, 3000);
      return;
    }

    const fishingAddress = contractsConfig[network]?.fishingGame;
    if (!fishingAddress) {
      throw new Error(`FishingGame not deployed on ${network}`);
    }

    const fishingAbi = [
      "event FishCaught(address indexed player, uint8 fishType, uint256 size, uint256 value)",
      "function getPlayerCatchCount(address player) external view returns (uint256)",
      "function getPlayerCatch(address player, uint256 index) external view returns (uint8 fishType, uint256 size, uint256 value, uint256 timestamp, string memory fishName)",
    ];

    const fishingContract = new ethers.Contract(fishingAddress, fishingAbi, provider);
    const userAddress = await signer?.getAddress();
    
    if (!userAddress) {
      throw new Error("User address not available");
    }

    // Get initial catch count
    const initialCatchCount = await fishingContract.getPlayerCatchCount(userAddress);
    console.log("Initial catch count:", initialCatchCount.toString());

    // Poll for new catch (check if catch count increased)
    const maxAttempts = 30;
    const intervalMs = 2000;
    
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise(resolve => setTimeout(resolve, intervalMs));
      
      try {
        const currentCatchCount = await fishingContract.getPlayerCatchCount(userAddress);
        
        if (currentCatchCount > initialCatchCount) {
          // New catch detected! Get the latest catch
          const catchIndex = currentCatchCount - BigInt(1);
          const catchData = await fishingContract.getPlayerCatch(userAddress, catchIndex);
          
          const fish: FishCatch = {
            fishType: Number(catchData.fishType),
            fishName: catchData.fishName,
            size: Number(catchData.size),
            value: Number(catchData.value),
            rarity: getFishRarity(Number(catchData.fishType)),
            randomness: requestId, // Use requestId as identifier
          };

          setCaughtFish(fish);
          setFishingStep("caught");
          
          // Check if NFT was actually minted by checking user's NFT balance before and after
          let nftMinted = false;
          if (!isPlaytestMode && isConnected && signer && provider) {
            try {
              const network = "baseSepolia";
              const nftAddress = contractsConfig[network]?.fishingGameNFT;
              if (nftAddress) {
                const userAddress = await signer.getAddress();
                const nftAbi = ["function balanceOf(address owner) view returns (uint256)"];
                const nftContract = new ethers.Contract(nftAddress, nftAbi, provider);
                const balanceBefore = await nftContract.balanceOf(userAddress);
                
                // Wait a bit for the NFT to be minted
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                const balanceAfter = await nftContract.balanceOf(userAddress);
                nftMinted = balanceAfter > balanceBefore;
                
                if (!nftMinted) {
                  console.warn("⚠️ NFT was not minted after catch. Checking contract linkage...");
                  checkNFTLinkage();
                  toast({
                    title: `Caught a ${fish.fishName}!`,
                    description: `${getFishEmoji(fish.fishType)} ${fish.rarity} - Size: ${fish.size}cm, Value: ${fish.value} gold. ⚠️ NFT may not have been minted - check console for details.`,
                    status: "warning",
                    duration: 8000,
                  });
                } else {
                  toast({
                    title: `Caught a ${fish.fishName}!`,
                    description: `${getFishEmoji(fish.fishType)} ${fish.rarity} - Size: ${fish.size}cm, Value: ${fish.value} gold`,
                    status: "success",
                    duration: 5000,
                  });
                }
              }
            } catch (error) {
              console.error("Error checking NFT mint status:", error);
              toast({
                title: `Caught a ${fish.fishName}!`,
                description: `${getFishEmoji(fish.fishType)} ${fish.rarity} - Size: ${fish.size}cm, Value: ${fish.value} gold`,
                status: "success",
                duration: 5000,
              });
            }
          } else {
            toast({
              title: `Caught a ${fish.fishName}!`,
              description: `${getFishEmoji(fish.fishType)} ${fish.rarity} - Size: ${fish.size}cm, Value: ${fish.value} gold`,
              status: "success",
              duration: 5000,
            });
          }

          // Reload NFTs - wait longer for transaction to be mined and indexed
          if (!isPlaytestMode && isConnected && signer) {
            // Try multiple times with increasing delays to ensure NFT is loaded
            setTimeout(() => {
              console.log("🔄 Reloading NFTs after Pattern 1 catch (attempt 1)...");
              loadUserNFTs();
            }, 3000);
            setTimeout(() => {
              console.log("🔄 Reloading NFTs after Pattern 1 catch (attempt 2)...");
              loadUserNFTs();
            }, 8000);
            setTimeout(() => {
              console.log("🔄 Reloading NFTs after Pattern 1 catch (attempt 3)...");
              loadUserNFTs();
            }, 15000);
          } else if (isPlaytestMode) {
            // In playtest mode, add to local history immediately
            setFishHistory([fish, ...fishHistory]);
          }

          // Reset for next fishing trip
          setTimeout(() => {
            setCurrentRequestId(null);
            setFishingStep("idle");
            setVrfSeed(null);
          }, 3000);

          return;
        }
      } catch (error) {
        console.warn(`Poll attempt ${i + 1} failed:`, error);
      }
    }

    throw new Error("Fish catch not detected within timeout. The callback may still be processing.");
  };

  return (
    <Box>
      <Flex align="center" justify="space-between" mb={4} flexWrap="wrap" gap={2}>
        <Heading size="lg" color="white">
          🎣 FishingGame Demo
        </Heading>
        <Flex align="center" gap={2}>
          {isPlaytestMode ? (
            <Badge colorScheme="yellow" fontSize="sm" px={3} py={1}>
              🎮 PLAYTEST MODE
            </Badge>
          ) : isConnected ? (
            <Badge colorScheme="green" fontSize="sm" px={3} py={1}>
              🔗 {isBaseSepolia ? "Base Sepolia" : "Wrong Network"}
            </Badge>
          ) : (
            <Badge colorScheme="gray" fontSize="sm" px={3} py={1}>
              ⚠️ Wallet Not Connected
            </Badge>
          )}
        </Flex>
      </Flex>

      {/* Wallet Connection Alert */}
      {!isPlaytestMode && !isConnected && (
        <Alert status="warning" borderRadius="lg" mb={4}>
          <AlertIcon />
          <Box>
            <Text fontWeight="bold">Connect Wallet to Use Real Contracts</Text>
            <Button
              size="sm"
              colorScheme="blue"
              mt={2}
              onClick={connectWallet}
            >
              Connect Wallet
            </Button>
            <Text fontSize="sm" mt={2} color="gray.600">
              Or enable Playtest Mode to test without a wallet
            </Text>
          </Box>
        </Alert>
      )}

      {/* Network Warning */}
      {!isPlaytestMode && isConnected && !isBaseSepolia && (
        <Alert status="warning" borderRadius="lg" mb={4}>
          <AlertIcon />
          <Box>
            <Text fontWeight="bold">Please Switch to Base Sepolia</Text>
            <Button
              size="sm"
              colorScheme="blue"
              mt={2}
              onClick={switchToBaseSepolia}
            >
              Switch to Base Sepolia
            </Button>
          </Box>
        </Alert>
      )}

      {/* NFT Linkage Info - Educational for Demo Users */}
      {!isPlaytestMode && isConnected && nftLinkageError && (
        <Alert status="info" borderRadius="lg" mb={4}>
          <AlertIcon />
          <Box>
            <Text fontWeight="bold">📚 Learning: NFT Contract Linkage</Text>
            <Text fontSize="sm" mt={2}>
              This demo shows how SERV.random contracts work together. The NFT contract linkage status helps you understand contract relationships.
            </Text>
            <Box mt={3} p={3} bg={bgColor} borderRadius="md" fontSize="xs">
              <Text fontWeight="semibold" mb={2}>Current Status:</Text>
              <Text whiteSpace="pre-wrap" fontFamily="mono" color="gray.300">
                {nftLinkageError}
              </Text>
            </Box>
            <Text fontSize="xs" mt={3} color="gray.500">
              <strong>Note:</strong> This is a demo environment. You don't need to fix anything - this information helps you understand how contract linkage works in SERV.random integrations.
            </Text>
            <Text fontSize="xs" mt={2} color="gray.500">
              <strong>How it works:</strong> For NFTs to mint, the NFT contract must know which FishingGame contract can call it, and the FishingGame must know which NFT contract to mint to. This bidirectional linkage ensures security.
            </Text>
            <Text fontSize="xs" mt={2} color="blue.400">
              <a 
                href={`https://sepolia.basescan.org/address/${contractsConfig.baseSepolia?.fishingGameNFT}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'underline' }}
              >
                Explore NFT Contract on BaseScan →
              </a>
            </Text>
          </Box>
        </Alert>
      )}

      {/* Current Fishing Status */}
      <Box bg={cardBg} p={6} borderRadius="lg" borderWidth="1px" borderColor={borderColor} mb={4}>
        <Flex justify="space-between" align="center" mb={4}>
          <Heading size="sm" color="white">
            Fishing Status
          </Heading>
          <VStack spacing={2} align="flex-end">
            <Text fontSize="xs" color="gray.400">Integration Pattern:</Text>
            <RadioGroup value={pattern} onChange={(value) => setPattern(value as "pattern1" | "pattern2")} size="sm">
              <Stack direction="row" spacing={4}>
                <Radio value="pattern1" colorScheme="blue">
                  <Text fontSize="xs">Pattern 1 (Auto)</Text>
                </Radio>
                <Radio value="pattern2" colorScheme="green">
                  <Text fontSize="xs">Pattern 2 (Manual)</Text>
                </Radio>
              </Stack>
            </RadioGroup>
          </VStack>
        </Flex>

        {fishingStep === "idle" && (
          <Stack spacing={4}>
            <Alert status="info" borderRadius="lg">
              <AlertIcon />
              <Box>
                <Text fontWeight="bold">Ready to Fish!</Text>
                <Text fontSize="sm" mt={1}>
                  {pattern === "pattern1" 
                    ? "Pattern 1 (Automatic): Click 'Go Fishing' and the fish will be automatically caught when VRF is fulfilled via callback."
                    : "Pattern 2 (Manual): Click 'Go Fishing' to request VRF randomness. Once fulfilled, click 'Catch Fish' to see what you caught!"}
                </Text>
              </Box>
            </Alert>
            <Button onClick={handleGoFishing} colorScheme="brand" size="lg" isLoading={loading}>
              Go Fishing (Request VRF)
            </Button>
          </Stack>
        )}

        {fishingStep === "requested" && (
          <Stack spacing={4}>
            <Alert status="warning" borderRadius="lg">
              <AlertIcon />
              <Box>
                <Text fontWeight="bold">
                  {pattern === "pattern1" ? "Waiting for Automatic Catch..." : "Waiting for VRF..."}
                </Text>
                <Text fontSize="sm">
                  Request ID: {currentRequestId?.slice(0, 20)}...
                </Text>
                <Text fontSize="sm" mt={2}>
                  {pattern === "pattern1"
                    ? "Pattern 1: The SERV.random server will automatically catch your fish via callback when VRF is fulfilled. This usually takes 3-5 seconds."
                    : "Pattern 2: The SERV.random server is processing your request. Once fulfilled, you'll be able to catch your fish manually."}
                </Text>
              </Box>
            </Alert>
            <Flex justify="center">
              <Spinner size="lg" color="brand.400" />
            </Flex>
          </Stack>
        )}

        {fishingStep === "readyToCatch" && (
          <Stack spacing={4}>
            <Alert status="success" borderRadius="lg">
              <AlertIcon />
              <Box>
                <Text fontWeight="bold">VRF Ready!</Text>
                <Text fontSize="sm">
                  Randomness has been fulfilled. Click &quot;Catch Fish&quot; to see what you caught!
                </Text>
              </Box>
            </Alert>
            {vrfSeed && (
              <Box p={4} bg={bgColor} borderRadius="md">
                <Text fontSize="sm" fontWeight="semibold" color="white" mb={2}>
                  VRF Seed:
                </Text>
                <Code fontSize="xs" display="block" p={2} bg={cardBg} borderRadius="md" isTruncated>
                  {vrfSeed}
                </Code>
              </Box>
            )}
            <Button onClick={handleCatchFish} colorScheme="green" size="lg" isLoading={loading}>
              Catch Fish!
            </Button>
          </Stack>
        )}

        {fishingStep === "caught" && caughtFish && (
          <Stack spacing={4}>
            <Alert status="success" borderRadius="lg">
              <AlertIcon />
              <Box>
                <Text fontWeight="bold" fontSize="lg">
                  {getFishEmoji(caughtFish.fishType)} Caught a {caughtFish.fishName}!
                </Text>
              </Box>
            </Alert>
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
              <Box textAlign="center" p={4} bg={bgColor} borderRadius="md">
                <Text fontSize="xs" color="gray.500">Rarity</Text>
                <Badge colorScheme={getRarityColor(caughtFish.rarity)} fontSize="md" mt={1}>
                  {caughtFish.rarity}
                </Badge>
              </Box>
              <Box textAlign="center" p={4} bg={bgColor} borderRadius="md">
                <Text fontSize="xs" color="gray.500">Size</Text>
                <Text fontSize="xl" fontWeight="bold" color="white">
                  {caughtFish.size}cm
                </Text>
              </Box>
              <Box textAlign="center" p={4} bg={bgColor} borderRadius="md">
                <Text fontSize="xs" color="gray.500">Value</Text>
                <Text fontSize="xl" fontWeight="bold" color="yellow.400">
                  {caughtFish.value} gold
                </Text>
              </Box>
              <Box textAlign="center" p={4} bg={bgColor} borderRadius="md">
                <Text fontSize="xs" color="gray.500">NFT Token ID</Text>
                <Text fontSize="xl" fontWeight="bold" color="white">
                  #{caughtFish.tokenId}
                </Text>
              </Box>
            </SimpleGrid>
            {caughtFish.randomness && (
              <Box p={4} bg={bgColor} borderRadius="md">
                <Text fontSize="sm" fontWeight="semibold" color="white" mb={2}>
                  VRF Seed (stored in NFT metadata):
                </Text>
                <Code fontSize="xs" display="block" p={2} bg={cardBg} borderRadius="md" isTruncated>
                  {caughtFish.randomness}
                </Code>
                <Text fontSize="xs" color="gray.400" mt={2}>
                  This randomness seed is permanently stored in the NFT&apos;s metadata, making it verifiable on block explorers like BaseScan.
                </Text>
              </Box>
            )}
          </Stack>
        )}
      </Box>

      {/* Fish History */}
      {!isPlaytestMode && (
        <Box bg={cardBg} p={6} borderRadius="lg" borderWidth="1px" borderColor={borderColor} mb={4}>
          <Flex justify="space-between" align="center" mb={4}>
            <Heading size="sm" color="white">
              Your Fish Collection ({fishHistory.length})
            </Heading>
            <Flex align="center" gap={2}>
              {loadingNFTs && <Spinner size="sm" color="brand.400" />}
              <Button
                size="sm"
                colorScheme="blue"
                variant="outline"
                onClick={() => {
                  console.log("🔄 Manual NFT reload triggered");
                  loadUserNFTs();
                }}
                isLoading={loadingNFTs}
              >
                🔄 Reload NFTs
              </Button>
            </Flex>
          </Flex>
          {loadingNFTs && fishHistory.length === 0 && (
            <Text color="gray.400" textAlign="center" py={4}>
              Loading your NFTs...
            </Text>
          )}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
            {fishHistory.map((fish) => (
              <Box
                key={fish.tokenId || `fish-${fish.randomness}`}
                p={4}
                bg={bgColor}
                borderRadius="md"
                borderWidth="1px"
                borderColor={borderColor}
              >
                <Flex align="center" justify="space-between" mb={2}>
                  <Text fontSize="2xl">{getFishEmoji(fish.fishType)}</Text>
                  <Badge colorScheme={getRarityColor(fish.rarity)}>{fish.rarity}</Badge>
                </Flex>
                <Text fontWeight="bold" color="white" mb={1}>
                  {fish.fishName}
                </Text>
                <Stack spacing={1} fontSize="sm" color="gray.400">
                  <Text>Size: {fish.size}cm</Text>
                  <Text>Value: {fish.value} gold</Text>
                  <Text>Token ID: #{fish.tokenId}</Text>
                </Stack>
              </Box>
            ))}
          </SimpleGrid>
        </Box>
      )}

      {/* How It Works */}
      <Box bg={cardBg} p={6} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
        <Heading size="sm" mb={4} color="white">
          How FishingGame Works
        </Heading>
        <Stack spacing={3} fontSize="sm" color="gray.400">
          <Text>
            <strong>Step 1:</strong> Click &quot;Go Fishing&quot; → Calls <Code fontSize="xs">FishingGame.goFishing()</Code> which requests VRF via <Code fontSize="xs">FeeCollector.requestRandomnessFor()</Code>
          </Text>
          <Text>
            <strong>Step 2:</strong> SERV.random server detects the request, fetches VRF from Harmony, and submits it to FeeCollector
          </Text>
          <Text>
            <strong>Step 3:</strong>{" "}
            {pattern === "pattern1" ? (
              <>
                <Badge colorScheme="blue" fontSize="xs" mr={1}>Pattern 1</Badge>
                Server automatically calls <Code fontSize="xs">FishingGame.receiveRandomness()</Code> callback → Fish is automatically caught and NFT minted
              </>
            ) : (
              <>
                <Badge colorScheme="green" fontSize="xs" mr={1}>Pattern 2</Badge>
                Click &quot;Catch Fish&quot; → Calls <Code fontSize="xs">FishingGame.catchFish()</Code> which retrieves VRF from FeeCollector and generates fish using weighted random selection (50% Goldfish, 30% Trout, 15% Salmon, 4% Tuna, 1% Shark, 1% Whale)
              </>
            )}
          </Text>
          <Text>
            <strong>Step 4:</strong> An NFT is minted via <Code fontSize="xs">FishingGameNFT.mintFishNFT()</Code> with the VRF seed stored in its metadata for verifiability on block explorers
          </Text>
          <Text fontSize="xs" color="gray.500" mt={2}>
            <strong>Pattern:</strong> Pattern 2 (Manual Claim) - Two-step flow for better gas control
          </Text>
        </Stack>
      </Box>
    </Box>
  );
}

