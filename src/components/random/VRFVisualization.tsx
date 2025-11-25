"use client";

import {
  Box,
  Code,
  Flex,
  Heading,
  SimpleGrid,
  Text,
  useColorModeValue,
  Badge,
  Tooltip,
} from "@chakra-ui/react";

interface VRFEntry {
  blockNumber: number;
  timestamp: number;
  vrfValue: string;
  harmonyBlockHash: string;
}

interface VRFVisualizationProps {
  entries: VRFEntry[];
  maxEntries?: number;
}

export function VRFVisualization({ entries, maxEntries = 10 }: VRFVisualizationProps) {
  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const bgColor = useColorModeValue("gray.50", "gray.800");

  // Convert VRF value to visual representation
  const hexToColor = (hex: string): string => {
    try {
      const r = parseInt(hex.substring(2, 10), 16) % 256;
      const g = parseInt(hex.substring(10, 18), 16) % 256;
      const b = parseInt(hex.substring(18, 26), 16) % 256;
      return `rgb(${r}, ${g}, ${b})`;
    } catch {
      return "rgb(100, 100, 100)";
    }
  };

  // Generate random number from VRF (1-100)
  const vrfToNumber = (vrf: string): number => {
    try {
      const num = parseInt(vrf.substring(2, 10), 16);
      return (num % 100) + 1;
    } catch {
      return 0;
    }
  };

  // Generate dice roll from VRF (1-6)
  const vrfToDice = (vrf: string): number => {
    try {
      const num = parseInt(vrf.substring(2, 10), 16);
      return (num % 6) + 1;
    } catch {
      return 1;
    }
  };

  const displayEntries = entries.slice(0, maxEntries);

  if (displayEntries.length === 0) {
    return (
      <Box bg={cardBg} p={6} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
        <Text color="gray.400" textAlign="center">
          No VRF data available yet
        </Text>
      </Box>
    );
  }

  return (
    <Box>
      <Heading size="md" mb={4} color="white">
        🎲 Recent VRF Randomness
      </Heading>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
        {displayEntries.map((entry, idx) => {
          const color = hexToColor(entry.vrfValue);
          const randomNumber = vrfToNumber(entry.vrfValue);
          const diceRoll = vrfToDice(entry.vrfValue);

          return (
            <Box
              key={idx}
              bg={cardBg}
              p={4}
              borderRadius="lg"
              borderWidth="1px"
              borderColor={borderColor}
              _hover={{
                borderColor: "brand.400",
                transform: "translateY(-2px)",
                transition: "all 0.2s",
              }}
            >
              <Flex justify="space-between" align="start" mb={3}>
                <Badge colorScheme="blue" fontSize="xs">
                  Block #{entry.blockNumber.toLocaleString()}
                </Badge>
                <Text fontSize="xs" color="gray.500">
                  {new Date(entry.timestamp).toLocaleTimeString()}
                </Text>
              </Flex>

              {/* Color Visualization */}
              <Box
                w="full"
                h="60px"
                borderRadius="md"
                bg={color}
                mb={3}
                borderWidth="1px"
                borderColor={borderColor}
              />

              {/* VRF Value */}
              <Tooltip label={entry.vrfValue}>
                <Code fontSize="xs" display="block" p={2} bg={bgColor} borderRadius="md" isTruncated>
                  {entry.vrfValue.slice(0, 20)}...
                </Code>
              </Tooltip>

              {/* Example Uses */}
              <Flex gap={2} mt={3} fontSize="xs">
                <Box flex={1} p={2} bg={bgColor} borderRadius="md" textAlign="center">
                  <Text color="gray.500" mb={1}>
                    Random #
                  </Text>
                  <Text fontWeight="bold" color="brand.300">
                    {randomNumber}
                  </Text>
                </Box>
                <Box flex={1} p={2} bg={bgColor} borderRadius="md" textAlign="center">
                  <Text color="gray.500" mb={1}>
                    Dice Roll
                  </Text>
                  <Text fontWeight="bold" color="brand.300">
                    {diceRoll}
                  </Text>
                </Box>
              </Flex>
            </Box>
          );
        })}
      </SimpleGrid>
    </Box>
  );
}

