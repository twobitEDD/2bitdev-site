"use client";

import { useState } from "react";
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
} from "@chakra-ui/react";
import {
  mockGoFishing,
  mockCatchFish,
  pollForFulfillment,
} from "@utils/mockContracts";
import { usePlaytestMode } from "@contexts/PlaytestModeContext";
import { useWallet } from "@contexts/WalletContext";
import { goFishing, catchFish, pollForFulfillmentStatus } from "@utils/contractHelpers";

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
  const [vrfSeed, setVrfSeed] = useState<string | null>(null);

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

      // Poll for fulfillment
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
      setFishHistory([fish, ...fishHistory]);
      setFishingStep("caught");

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

      {/* Current Fishing Status */}
      <Box bg={cardBg} p={6} borderRadius="lg" borderWidth="1px" borderColor={borderColor} mb={4}>
        <Heading size="sm" mb={4} color="white">
          Fishing Status
        </Heading>

        {fishingStep === "idle" && (
          <Stack spacing={4}>
            <Alert status="info" borderRadius="lg">
              <AlertIcon />
              <Box>
                <Text fontWeight="bold">Ready to Fish!</Text>
                <Text fontSize="sm">
                  Click &quot;Go Fishing&quot; to request VRF randomness. Once the server fulfills the request, you can catch your fish!
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
                <Text fontWeight="bold">Waiting for VRF...</Text>
                <Text fontSize="sm">
                  Request ID: {currentRequestId?.slice(0, 20)}...
                </Text>
                <Text fontSize="sm" mt={2}>
                  The SERV.random server is processing your request. This usually takes 3-5 seconds.
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
      {fishHistory.length > 0 && (
        <Box bg={cardBg} p={6} borderRadius="lg" borderWidth="1px" borderColor={borderColor} mb={4}>
          <Heading size="sm" mb={4} color="white">
            Your Fish Collection ({fishHistory.length})
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
            {fishHistory.map((fish, idx) => (
              <Box
                key={idx}
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
            <strong>Step 3:</strong> Click &quot;Catch Fish&quot; → Calls <Code fontSize="xs">FishingGame.catchFish()</Code> which retrieves VRF from FeeCollector and generates fish using weighted random selection (50% Goldfish, 30% Trout, 15% Salmon, 4% Tuna, 1% Shark, 0% Whale)
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

