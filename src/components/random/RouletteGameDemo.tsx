"use client";

import { useState } from "react";
import { SpinningRouletteWheel } from "./SpinningRouletteWheel";
import { requestSpin, getSpinResultHelper, pollForFulfillmentStatus } from "@utils/contractHelpers";
import { useToast, Box, Button, Stack, Text, useColorModeValue, Code, Badge, SimpleGrid, Heading, Flex } from "@chakra-ui/react";
import { usePlaytestMode } from "@contexts/PlaytestModeContext";
import { useWallet } from "@contexts/WalletContext";

interface SpinResult {
  spinId: number;
  result: number;
  color: string;
  vrfSeed?: string;
  timestamp: number;
}

export function RouletteGameDemo() {
  const { isPlaytestMode } = usePlaytestMode();
  const { signer, provider, address, chainId } = useWallet();
  const [currentSpin, setCurrentSpin] = useState<SpinResult | null>(null);
  const [recentSpins, setRecentSpins] = useState<SpinResult[]>([]);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [spinId, setSpinId] = useState<string | null>(null);
  const [spinCounter, setSpinCounter] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isWheelSpinning, setIsWheelSpinning] = useState(false);
  const [statistics, setStatistics] = useState({
    totalSpins: 0,
    redCount: 0,
    blackCount: 0,
    greenCount: 0,
  });
  const toast = useToast();

  // Determine network from chainId
  const network = chainId && chainId === 84532 ? "baseSepolia" : "base";

  const getColor = (result: number): string => {
    if (result === 0) return "green";
    const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
    return redNumbers.includes(result) ? "red" : "black";
  };

  const handleRequestSpin = async () => {
    try {
      setLoading(true);
      
      // Check wallet connection if not in playtest mode
      if (!isPlaytestMode && (!signer || !address)) {
        toast({
          title: "Wallet Not Connected",
          description: "Please connect your wallet to spin the wheel",
          status: "warning",
          duration: 5000,
        });
        setLoading(false);
        return;
      }

      // Request spin using helper (handles mock vs real)
      const result = await requestSpin(isPlaytestMode, signer, network);
      setRequestId(result.requestId);
      setSpinId(result.spinId?.toString() || null);
      setSpinCounter((prev) => prev + 1);

      // Create pending spin
      const newSpin: SpinResult = {
        spinId: result.spinId || spinCounter + 1,
        result: 255, // Pending
        color: "",
        timestamp: Date.now(),
      };
      setCurrentSpin(newSpin);

      toast({
        title: "Spin Requested",
        description: `Waiting for VRF randomness...`,
        status: "info",
        duration: 3000,
      });

      // For Pattern 1 (automatic callback), poll RouletteGame contract directly
      // This is more reliable than polling FeeCollector since the callback processes automatically
      const pollAndComplete = async () => {
        if (!result.spinId) {
          console.error("No spin ID returned from request");
          setLoading(false);
          return;
        }

        try {
          // Poll the RouletteGame contract directly to check if spin is completed
          const spinResultData = await getSpinResultHelper(
            isPlaytestMode,
            provider,
            result.spinId,
            result.requestId,
            network
          );

          // Update current spin with result
          const completedSpin: SpinResult = {
            ...newSpin,
            result: spinResultData.result,
            color: spinResultData.color,
            vrfSeed: spinResultData.vrfSeed,
          };
          setCurrentSpin(completedSpin);

          // Trigger wheel spinning animation
          setTimeout(() => {
            setIsWheelSpinning(true);
          }, 100);

          // Add to recent spins
          setRecentSpins((prev) => {
            const updated = [completedSpin, ...prev].slice(0, 20);
            return updated;
          });

          // Update statistics
          setStatistics((prev) => ({
            totalSpins: prev.totalSpins + 1,
            redCount: spinResultData.color === "red" ? prev.redCount + 1 : prev.redCount,
            blackCount: spinResultData.color === "black" ? prev.blackCount + 1 : prev.blackCount,
            greenCount: spinResultData.color === "green" ? prev.greenCount + 1 : prev.greenCount,
          }));

          toast({
            title: "VRF Received!",
            description: `Spin result: ${spinResultData.result} (${spinResultData.color.toUpperCase()})`,
            status: "success",
            duration: 5000,
          });

          // Reset for next spin after animation completes
          setTimeout(() => {
            setRequestId(null);
            setSpinId(null);
            setIsWheelSpinning(false);
            setLoading(false);
          }, 4500); // Slightly longer than animation duration (4s + buffer)
        } catch (error: any) {
          // pollForSpinCompletion already does internal polling (30 attempts, 2s intervals = 60s total)
          // If it throws, it means the spin didn't complete within timeout
          console.error("Error polling for spin result:", error);
          
          // Check if it's a timeout (spin not completed within 60 seconds)
          if (error.message?.includes("not completed within timeout") || error.message?.includes("Spin not completed")) {
            toast({
              title: "Timeout",
              description: "Spin did not complete within 60 seconds. The server may still be processing. Check the contract directly or try again.",
              status: "warning",
              duration: 8000,
            });
          } else {
            toast({
              title: "Error",
              description: error instanceof Error ? error.message : "Failed to get spin result",
              status: "error",
              duration: 5000,
            });
          }
          
          setLoading(false);
        }
      };

      // Start polling after a short delay (give server time to process)
      setTimeout(pollAndComplete, 2000);
    } catch (error) {
      console.error("Error requesting spin:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to request spin",
        status: "error",
        duration: 5000,
      });
      setLoading(false);
    }
  };

  // handleCompleteSpin is no longer needed - spin completes automatically when VRF is received

  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const bgColor = useColorModeValue("gray.50", "gray.800");

  return (
    <Box>
      <Flex align="center" justify="space-between" mb={4} flexWrap="wrap" gap={2}>
        <Heading size="lg" color="white">
          🎰 Roulette Game
        </Heading>
        {isPlaytestMode && (
          <Badge colorScheme="yellow" fontSize="sm" px={3} py={1}>
            🎮 PLAYTEST MODE
          </Badge>
        )}
      </Flex>

      <Box bg={cardBg} p={6} borderRadius="lg" borderWidth="1px" borderColor={borderColor} mb={4}>
        <SpinningRouletteWheel
          result={currentSpin?.result !== 255 ? currentSpin?.result : undefined}
          isSpinning={isWheelSpinning && currentSpin?.result !== undefined && currentSpin.result !== 255}
          onSpinComplete={() => {
            if (currentSpin?.result !== undefined && currentSpin.result !== 255) {
              const color = getColor(currentSpin.result);
              toast({
                title: `Spin Result: ${currentSpin.result}`,
                description: `Landed on ${color.toUpperCase()} ${currentSpin.result === 0 ? "(Zero)" : currentSpin.result % 2 === 0 ? "(Even)" : "(Odd)"}`,
                status: currentSpin.result === 0 ? "success" : color === "red" ? "error" : "info",
                duration: 5000,
              });
            }
          }}
        />

        {currentSpin && currentSpin.result !== 255 && currentSpin.vrfSeed && (
          <Box mt={4} p={4} bg={bgColor} borderRadius="md">
            <Text fontSize="sm" fontWeight="semibold" color="white" mb={2}>
              VRF Seed Used:
            </Text>
            <Code fontSize="xs" display="block" p={2} bg={cardBg} borderRadius="md" isTruncated>
              {currentSpin.vrfSeed}
            </Code>
            <Text fontSize="xs" color="gray.400" mt={2}>
              This cryptographically verifiable seed determines the result: {currentSpin.result}
            </Text>
          </Box>
        )}

        <Stack direction="row" spacing={4} mt={6} justify="center">
          {!requestId && (
            <Button onClick={handleRequestSpin} colorScheme="brand" isLoading={loading} size="lg">
              Spin the Wheel
            </Button>
          )}
          {requestId && currentSpin && currentSpin.result === 255 && (
            <Button isDisabled colorScheme="yellow" size="lg">
              Waiting for VRF...
            </Button>
          )}
        </Stack>
      </Box>

      {/* Statistics */}
      {statistics.totalSpins > 0 && (
        <Box bg={cardBg} p={6} borderRadius="lg" borderWidth="1px" borderColor={borderColor} mb={4}>
          <Heading size="sm" mb={4} color="white">
            Statistics
          </Heading>
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
            <Box textAlign="center">
              <Text fontSize="xs" color="gray.500">Total Spins</Text>
              <Text fontSize="2xl" fontWeight="bold" color="white">{statistics.totalSpins}</Text>
            </Box>
            <Box textAlign="center">
              <Badge colorScheme="red" mb={2}>Red</Badge>
              <Text fontSize="xl" fontWeight="bold" color="white">{statistics.redCount}</Text>
              <Text fontSize="xs" color="gray.400">
                {statistics.totalSpins > 0 ? ((statistics.redCount / statistics.totalSpins) * 100).toFixed(1) : 0}%
              </Text>
            </Box>
            <Box textAlign="center">
              <Badge colorScheme="gray" mb={2}>Black</Badge>
              <Text fontSize="xl" fontWeight="bold" color="white">{statistics.blackCount}</Text>
              <Text fontSize="xs" color="gray.400">
                {statistics.totalSpins > 0 ? ((statistics.blackCount / statistics.totalSpins) * 100).toFixed(1) : 0}%
              </Text>
            </Box>
            <Box textAlign="center">
              <Badge colorScheme="green" mb={2}>Green</Badge>
              <Text fontSize="xl" fontWeight="bold" color="white">{statistics.greenCount}</Text>
              <Text fontSize="xs" color="gray.400">
                {statistics.totalSpins > 0 ? ((statistics.greenCount / statistics.totalSpins) * 100).toFixed(1) : 0}%
              </Text>
            </Box>
          </SimpleGrid>
        </Box>
      )}

      {/* Current Result */}
      {currentSpin && currentSpin.result !== 255 && (
        <Box bg={cardBg} p={6} borderRadius="lg" borderWidth="1px" borderColor={borderColor} mb={4}>
          <Heading size="sm" mb={4} color="white">
            Current Result
          </Heading>
          <Box
            bg={getColor(currentSpin.result) === "red" ? "red.600" : getColor(currentSpin.result) === "green" ? "green.600" : "gray.800"}
            p={6}
            borderRadius="lg"
            textAlign="center"
            borderWidth="2px"
            borderColor={getColor(currentSpin.result) === "red" ? "red.400" : getColor(currentSpin.result) === "green" ? "green.400" : "gray.600"}
          >
            <Text fontSize="4xl" fontWeight="extrabold" color="white">
              {currentSpin.result}
            </Text>
            <Text fontSize="lg" color="gray.200" mt={2}>
              {getColor(currentSpin.result).toUpperCase()} {currentSpin.result === 0 ? "(Zero)" : currentSpin.result % 2 === 0 ? "(Even)" : "(Odd)"}
            </Text>
          </Box>
        </Box>
      )}

      {/* How It Works */}
      <Box bg={cardBg} p={6} borderRadius="lg" borderWidth="1px" borderColor={borderColor} mb={4}>
        <Heading size="sm" mb={4} color="white">
          How RouletteGame Works
        </Heading>
        <Stack spacing={3} fontSize="sm" color="gray.400">
          <Text>
            <strong>Step 1:</strong> Click &quot;Spin the Wheel&quot; → Calls <Code fontSize="xs">RouletteGame.requestSpin()</Code> which requests VRF via <Code fontSize="xs">FeeCollector.requestRandomnessFor()</Code>
          </Text>
          <Text>
            <strong>Step 2:</strong> SERV.random server detects the request, fetches VRF from Harmony, and submits it to FeeCollector
          </Text>
          <Text>
            <strong>Step 3:</strong> FeeCollector automatically calls <Code fontSize="xs">RouletteGame.receiveRandomness()</Code> callback, which determines result (0-36) using <Code fontSize="xs">VRF % 37</Code>
          </Text>
          <Text>
            <strong>Step 4:</strong> Result is automatically recorded and statistics updated - no manual claim needed!
          </Text>
          <Text fontSize="xs" color="gray.500" mt={2}>
            <strong>Pattern:</strong> Pattern 1 (Automatic Callback) - Single transaction, automatic completion when VRF is fulfilled
          </Text>
        </Stack>
      </Box>

      {/* Recent Spins */}
      {recentSpins.length > 0 && (
        <Box bg={cardBg} p={6} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
          <Heading size="sm" mb={4} color="white">
            Recent Spins (Last {Math.min(recentSpins.length, 20)})
          </Heading>
          <SimpleGrid columns={{ base: 5, md: 10 }} spacing={2}>
            {recentSpins.slice(0, 20).map((spin, idx) => {
              const spinColor = getColor(spin.result);
              return (
                <Badge
                  key={idx}
                  bg={spinColor === "red" ? "red.600" : spinColor === "green" ? "green.600" : "gray.800"}
                  color="white"
                  fontSize="md"
                  px={3}
                  py={2}
                  borderRadius="md"
                  textAlign="center"
                  borderWidth="1px"
                  borderColor={spinColor === "red" ? "red.400" : spinColor === "green" ? "green.400" : "gray.600"}
                >
                  {spin.result}
                </Badge>
              );
            })}
          </SimpleGrid>
        </Box>
      )}
    </Box>
  );
}

