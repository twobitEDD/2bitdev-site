"use client";

import {
  Box,
  Code,
  Flex,
  Heading,
  Text,
  useColorModeValue,
  Badge,
  Button,
  SimpleGrid,
  Alert,
  AlertIcon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from "@chakra-ui/react";

interface SpinResult {
  spinId: number;
  result: number;
  color: string;
  vrfSeed?: string;
  timestamp: number;
}

interface RouletteWheelProps {
  currentSpin?: SpinResult;
  recentSpins?: SpinResult[];
  statistics?: {
    totalSpins: number;
    redCount: number;
    blackCount: number;
    greenCount: number;
  };
  onRequestSpin?: () => void;
  loading?: boolean;
  requestId?: string;
}

export function RouletteWheel({
  currentSpin,
  recentSpins = [],
  statistics,
  onRequestSpin,
  loading,
  requestId,
}: RouletteWheelProps) {
  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const bgColor = useColorModeValue("gray.50", "gray.800");

  // European roulette layout (0-36)
  const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
  const blackNumbers = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35];

  const getNumberColor = (num: number): string => {
    if (num === 0) return "green";
    return redNumbers.includes(num) ? "red" : "black";
  };

  const getColorScheme = (color: string): string => {
    if (color === "red") return "red";
    if (color === "black") return "gray";
    return "green";
  };

  return (
    <Box>
      <Heading size="md" mb={4} color="white">
        🎰 Roulette Game - VRF Powered Spins
      </Heading>

      {/* Current Spin */}
      {currentSpin && currentSpin.result !== 255 && (
        <Box bg={cardBg} p={6} borderRadius="lg" borderWidth="1px" borderColor={borderColor} mb={4}>
          <Flex justify="space-between" align="center" mb={4}>
            <Heading size="sm" color="white">
              Last Spin Result
            </Heading>
            <Badge colorScheme={getColorScheme(currentSpin.color)} fontSize="lg" px={4} py={2}>
              {currentSpin.result}
            </Badge>
          </Flex>

          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={4}>
            <Box textAlign="center" p={4} bg={bgColor} borderRadius="md">
              <Text fontSize="xs" color="gray.500" mb={1}>
                Number
              </Text>
              <Text fontSize="3xl" fontWeight="bold" color="white">
                {currentSpin.result}
              </Text>
            </Box>
            <Box textAlign="center" p={4} bg={bgColor} borderRadius="md">
              <Text fontSize="xs" color="gray.500" mb={1}>
                Color
              </Text>
              <Badge colorScheme={getColorScheme(currentSpin.color)} fontSize="lg" px={3} py={1}>
                {currentSpin.color.toUpperCase()}
              </Badge>
            </Box>
            <Box textAlign="center" p={4} bg={bgColor} borderRadius="md">
              <Text fontSize="xs" color="gray.500" mb={1}>
                Even/Odd
              </Text>
              <Text fontSize="lg" fontWeight="bold" color="white">
                {currentSpin.result === 0
                  ? "Zero"
                  : currentSpin.result % 2 === 0
                  ? "Even"
                  : "Odd"}
              </Text>
            </Box>
            <Box textAlign="center" p={4} bg={bgColor} borderRadius="md">
              <Text fontSize="xs" color="gray.500" mb={1}>
                Spin ID
              </Text>
              <Text fontSize="lg" fontWeight="bold" color="brand.300">
                #{currentSpin.spinId}
              </Text>
            </Box>
          </SimpleGrid>

          {currentSpin.vrfSeed && (
            <Box mb={4}>
              <Text fontSize="xs" color="gray.500" mb={2}>
                VRF Seed Used:
              </Text>
              <Code fontSize="xs" display="block" p={2} bg={bgColor} borderRadius="md" isTruncated>
                {currentSpin.vrfSeed}
              </Code>
              <Text fontSize="xs" color="gray.400" mt={2}>
                This VRF seed proves the spin was truly random and verifiable on-chain
              </Text>
            </Box>
          )}
        </Box>
      )}

      {/* Spin Action */}
      <Box bg={cardBg} p={6} borderRadius="lg" borderWidth="1px" borderColor={borderColor} mb={4}>
        <Flex justify="space-between" align="center" mb={4}>
          <Heading size="sm" color="white">
            Spin the Wheel
          </Heading>
          {requestId && (
            <Badge colorScheme="yellow">
              Request ID: {requestId.slice(0, 10)}...
            </Badge>
          )}
        </Flex>

        {!currentSpin || currentSpin.result === 255 ? (
          <Alert status="info" borderRadius="lg" mb={4}>
            <AlertIcon />
            <Box flex={1}>
              <Text fontWeight="bold">
                {requestId ? "Waiting for VRF..." : "Ready to Spin"}
              </Text>
              <Text fontSize="sm">
                {requestId
                  ? "The spin will complete automatically when VRF randomness is received."
                  : "Click Spin the Wheel to start. The result will appear automatically when VRF is received."}
              </Text>
            </Box>
          </Alert>
        ) : null}

        <Flex gap={2} justify="center">
          {!requestId && onRequestSpin && (
            <Button onClick={onRequestSpin} colorScheme="brand" size="lg" isLoading={loading}>
              Spin the Wheel
            </Button>
          )}
          {requestId && (
            <Button isDisabled colorScheme="yellow" size="lg" isLoading={loading}>
              Waiting for VRF...
            </Button>
          )}
        </Flex>
      </Box>

      {/* Statistics */}
      {statistics && (
        <Box bg={cardBg} p={6} borderRadius="lg" borderWidth="1px" borderColor={borderColor} mb={4}>
          <Heading size="sm" mb={4} color="white">
            Statistics
          </Heading>
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
            <Stat>
              <StatLabel>Total Spins</StatLabel>
              <StatNumber color="brand.300">{statistics.totalSpins}</StatNumber>
            </Stat>
            <Stat>
              <StatLabel>Red</StatLabel>
              <StatNumber color="red.400">{statistics.redCount}</StatNumber>
              <StatHelpText>
                {statistics.totalSpins > 0
                  ? `${((statistics.redCount / statistics.totalSpins) * 100).toFixed(1)}%`
                  : "0%"}
              </StatHelpText>
            </Stat>
            <Stat>
              <StatLabel>Black</StatLabel>
              <StatNumber color="gray.400">{statistics.blackCount}</StatNumber>
              <StatHelpText>
                {statistics.totalSpins > 0
                  ? `${((statistics.blackCount / statistics.totalSpins) * 100).toFixed(1)}%`
                  : "0%"}
              </StatHelpText>
            </Stat>
            <Stat>
              <StatLabel>Green (0)</StatLabel>
              <StatNumber color="green.400">{statistics.greenCount}</StatNumber>
              <StatHelpText>
                {statistics.totalSpins > 0
                  ? `${((statistics.greenCount / statistics.totalSpins) * 100).toFixed(1)}%`
                  : "0%"}
              </StatHelpText>
            </Stat>
          </SimpleGrid>
        </Box>
      )}

      {/* Recent Spins Log */}
      {recentSpins.length > 0 && (
        <Box bg={cardBg} p={6} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
          <Heading size="sm" mb={4} color="white">
            Recent Spins Log
          </Heading>
          <Box maxH="400px" overflowY="auto">
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>Spin #</Th>
                  <Th>Result</Th>
                  <Th>Color</Th>
                  <Th>Even/Odd</Th>
                  <Th>VRF Seed</Th>
                </Tr>
              </Thead>
              <Tbody>
                {recentSpins.map((spin, idx) => (
                  <Tr key={idx}>
                    <Td>
                      <Text fontSize="xs" color="gray.400">
                        #{spin.spinId}
                      </Text>
                    </Td>
                    <Td>
                      <Badge colorScheme={getColorScheme(spin.color)} fontSize="md">
                        {spin.result}
                      </Badge>
                    </Td>
                    <Td>
                      <Badge colorScheme={getColorScheme(spin.color)} variant="outline">
                        {spin.color.toUpperCase()}
                      </Badge>
                    </Td>
                    <Td>
                      <Text fontSize="xs" color="gray.400">
                        {spin.result === 0
                          ? "Zero"
                          : spin.result % 2 === 0
                          ? "Even"
                          : "Odd"}
                      </Text>
                    </Td>
                    <Td>
                      {spin.vrfSeed ? (
                        <Code fontSize="xs" maxW="100px" isTruncated title={spin.vrfSeed}>
                          {spin.vrfSeed.slice(0, 12)}...
                        </Code>
                      ) : (
                        <Text fontSize="xs" color="gray.500">
                          Pending
                        </Text>
                      )}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Box>
      )}

      {/* How VRF is Used */}
      <Box bg={bgColor} p={4} borderRadius="lg" mt={4}>
        <Text fontSize="sm" color="gray.400">
          <strong>How VRF is Used:</strong> Each spin uses a fresh VRF seed to determine the result (0-36).
          The VRF value modulo 37 gives the number, ensuring truly random and verifiable outcomes.
          All spins are logged on-chain with their VRF seeds for complete transparency.
        </Text>
      </Box>
    </Box>
  );
}

