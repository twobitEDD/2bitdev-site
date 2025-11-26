"use client";

import {
  Box,
  Code,
  Flex,
  Heading,
  Text,
  useColorModeValue,
  Badge,
  Tooltip,
  HStack,
  VStack,
  Icon,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";

interface VRFEntry {
  blockNumber: number;
  timestamp: number; // Can be in seconds (from API) or milliseconds (from Date)
  vrfValue: string;
  harmonyBlockHash: string;
  gameSource?: string; // "RouletteGame", "DungeonCrawler", "FishingGame", "Harmony Block", "FeeRequest"
  network?: string; // "base", "baseSepolia", "harmony"
  requestId?: string; // Request ID if available
  metadata?: Record<string, any>; // Additional metadata (spinId, characterId, etc.)
}

interface VRFVisualizationProps {
  entries: VRFEntry[];
  maxEntries?: number;
}

// Game source icons and colors
const gameSourceConfig: Record<string, { icon: string; color: string; bgColor: string }> = {
  "RouletteGame": { icon: "🎰", color: "red.400", bgColor: "red.50" },
  "DungeonCrawler": { icon: "🐉", color: "purple.400", bgColor: "purple.50" },
  "FishingGame": { icon: "🎣", color: "blue.400", bgColor: "blue.50" },
  "Harmony Block": { icon: "⛓️", color: "green.400", bgColor: "green.50" },
  "FeeRequest": { icon: "📊", color: "orange.400", bgColor: "orange.50" },
};

export function VRFVisualization({ entries, maxEntries = 50 }: VRFVisualizationProps) {
  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const bgColor = useColorModeValue("gray.50", "gray.800");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [animatedEntries, setAnimatedEntries] = useState<Set<number>>(new Set());

  // Convert VRF value to visual representation with more variation
  const hexToColor = (hex: string, index: number): string => {
    try {
      // Use different parts of the hex for more variation
      const offset = (index % 3) * 8;
      const r = parseInt(hex.substring(2 + offset, 10 + offset), 16) % 256;
      const g = parseInt(hex.substring(10 + offset, 18 + offset), 16) % 256;
      const b = parseInt(hex.substring(18 + offset, 26 + offset), 16) % 256;
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

  // Generate random rotation and scale from VRF for visual variety
  const vrfToTransform = (vrf: string, index: number) => {
    try {
      const num1 = parseInt(vrf.substring(2, 10), 16);
      const num2 = parseInt(vrf.substring(10, 18), 16);
      const rotation = (num1 % 20) - 10; // -10 to 10 degrees
      const scale = 0.95 + ((num2 % 10) / 100); // 0.95 to 1.05
      return { rotation, scale };
    } catch {
      return { rotation: 0, scale: 1 };
    }
  };

  // Format relative time
  const formatRelativeTime = (timestamp: number): string => {
    const now = Date.now();
    const ts = timestamp > 1000000000000 ? timestamp : timestamp * 1000;
    const diff = now - ts;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return `${seconds}s ago`;
  };

  // Animate entries as they come into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute("data-index") || "0");
            setAnimatedEntries((prev) => new Set(prev).add(index));
          }
        });
      },
      { threshold: 0.1 }
    );

    const cards = scrollContainerRef.current?.querySelectorAll("[data-index]");
    cards?.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, [entries]);

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
      <Flex justify="space-between" align="center" mb={4}>
        <Heading size="md" color="white">
          🎲 Live VRF Randomness Feed
        </Heading>
        <Badge colorScheme="green" fontSize="xs">
          {displayEntries.length} entries
        </Badge>
      </Flex>
      
      <Box
        ref={scrollContainerRef}
        maxH="600px"
        overflowY="auto"
        overflowX="hidden"
        sx={{
          "&::-webkit-scrollbar": {
            width: "8px",
          },
          "&::-webkit-scrollbar-track": {
            background: bgColor,
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-thumb": {
            background: borderColor,
            borderRadius: "4px",
            "&:hover": {
              background: useColorModeValue("gray.400", "gray.500"),
            },
          },
        }}
      >
        <VStack spacing={3} align="stretch">
          {displayEntries.map((entry, idx) => {
            const color = hexToColor(entry.vrfValue, idx);
            const randomNumber = vrfToNumber(entry.vrfValue);
            const diceRoll = vrfToDice(entry.vrfValue);
            const transform = vrfToTransform(entry.vrfValue, idx);
            const gameConfig = entry.gameSource ? gameSourceConfig[entry.gameSource] : null;
            const isAnimated = animatedEntries.has(idx);

            return (
              <Box
                key={`${entry.vrfValue}-${idx}`}
                data-index={idx}
                bg={cardBg}
                p={3}
                borderRadius="lg"
                borderWidth="1px"
                borderColor={borderColor}
                opacity={isAnimated ? 1 : 0}
                transform={isAnimated ? "translateX(0)" : "translateX(-20px)"}
                transition="all 0.3s ease-out"
                _hover={{
                  borderColor: gameConfig?.color || "brand.400",
                  transform: "translateX(4px) scale(1.02)",
                  boxShadow: "md",
                }}
              >
                <Flex justify="space-between" align="start" gap={3}>
                  {/* Left: Color bar and game info */}
                  <Flex align="center" gap={3} flex={1} minW={0}>
                    <Box
                      w="4px"
                      h="60px"
                      borderRadius="full"
                      bg={color}
                      flexShrink={0}
                      style={{
                        transform: `rotate(${transform.rotation}deg) scaleY(${transform.scale})`,
                        transition: "transform 0.3s ease",
                      }}
                    />
                    
                    <VStack align="start" spacing={1} flex={1} minW={0}>
                      <HStack spacing={2} flexWrap="wrap">
                        {gameConfig && (
                          <Badge
                            colorScheme={gameConfig.color.split(".")[0] as any}
                            fontSize="xs"
                            display="flex"
                            alignItems="center"
                            gap={1}
                          >
                            <Text>{gameConfig.icon}</Text>
                            <Text>{entry.gameSource}</Text>
                          </Badge>
                        )}
                        {entry.network && (
                          <Badge colorScheme="gray" fontSize="xs">
                            {entry.network}
                          </Badge>
                        )}
                        {entry.blockNumber > 0 && (
                          <Badge colorScheme="blue" fontSize="xs">
                            Block #{entry.blockNumber.toLocaleString()}
                          </Badge>
                        )}
                      </HStack>
                      
                      <HStack spacing={3} fontSize="xs" color="gray.500" flexWrap="wrap">
                        <Text>#{randomNumber}</Text>
                        <Text>🎲 {diceRoll}</Text>
                        <Text>{formatRelativeTime(entry.timestamp)}</Text>
                        {entry.metadata?.spinId && (
                          <Text>Spin #{entry.metadata.spinId}</Text>
                        )}
                        {entry.metadata?.characterId && (
                          <Text>Char #{entry.metadata.characterId}</Text>
                        )}
                        {entry.requestId && (
                          <Tooltip label={entry.requestId}>
                            <Text isTruncated maxW="100px">
                              Req: {entry.requestId.slice(0, 8)}...
                            </Text>
                          </Tooltip>
                        )}
                      </HStack>
                    </VStack>
                  </Flex>

                  {/* Right: VRF Value */}
                  <Tooltip label={entry.vrfValue}>
                    <Code
                      fontSize="xs"
                      p={2}
                      bg={bgColor}
                      borderRadius="md"
                      maxW="120px"
                      isTruncated
                      flexShrink={0}
                    >
                      {entry.vrfValue.slice(0, 16)}...
                    </Code>
                  </Tooltip>
                </Flex>
              </Box>
            );
          })}
        </VStack>
      </Box>
    </Box>
  );
}
