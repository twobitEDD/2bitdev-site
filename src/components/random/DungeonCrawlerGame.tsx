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
  Progress,
  Stat,
  StatLabel,
  StatNumber,
} from "@chakra-ui/react";
import { VRFVisualization } from "./VRFVisualization";

interface Character {
  class: string;
  strength: number;
  dexterity: number;
  intelligence: number;
  wisdom: number;
  constitution: number;
  charisma: number;
  level: number;
  health: number;
  maxHealth: number;
  creationSeed?: string;
}

interface Adventure {
  roomNumber: number;
  lastRoll: number;
  lastEvent: string;
  rollReady: boolean;
  rollSeed?: string;
}

interface DungeonCrawlerGameProps {
  character?: Character;
  adventure?: Adventure;
  onCreateCharacter?: () => void;
  onFinalizeCharacter?: () => void;
  onStartAdventure?: () => void;
  onRollD20?: () => void;
  onContinue?: () => void;
  loading?: boolean;
  characterRequestId?: string;
  adventureRequestId?: string;
}

export function DungeonCrawlerGame({
  character,
  adventure,
  onCreateCharacter,
  onFinalizeCharacter,
  onStartAdventure,
  onRollD20,
  onContinue,
  loading,
  characterRequestId,
  adventureRequestId,
}: DungeonCrawlerGameProps) {
  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const bgColor = useColorModeValue("gray.50", "gray.800");

  const classColors: Record<string, string> = {
    Warrior: "red",
    Mage: "blue",
    Rogue: "purple",
    Cleric: "green",
  };

  const getD20Color = (roll: number): string => {
    if (roll >= 18) return "green";
    if (roll >= 15) return "blue";
    if (roll >= 10) return "yellow";
    if (roll >= 5) return "orange";
    return "red";
  };

  return (
    <Box>
      <Heading size="md" mb={4} color="white">
        ⚔️ Dungeon Crawler - VRF Powered RPG
      </Heading>

      {/* Character Creation */}
      <Box bg={cardBg} p={6} borderRadius="lg" borderWidth="1px" borderColor={borderColor} mb={4}>
        <Heading size="sm" mb={4} color="white">
          Character
        </Heading>

        {!character ? (
          <Box>
            <Alert status="info" borderRadius="lg" mb={4}>
              <AlertIcon />
              <Box flex={1}>
                <Text fontWeight="bold">No Character</Text>
                <Text fontSize="sm">
                  {characterRequestId
                    ? "VRF seed received! Finalize your character."
                    : "Create a character using VRF for fair stat generation."}
                </Text>
              </Box>
            </Alert>
            <Flex gap={2}>
              {!characterRequestId && onCreateCharacter && (
                <Button onClick={onCreateCharacter} colorScheme="brand" isLoading={loading}>
                  Create Character (Request VRF)
                </Button>
              )}
              {characterRequestId && onFinalizeCharacter && (
                <Button onClick={onFinalizeCharacter} colorScheme="green" isLoading={loading}>
                  Finalize Character
                </Button>
              )}
            </Flex>
          </Box>
        ) : (
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
            <Box>
              <Badge colorScheme={classColors[character.class] || "gray"} mb={2} fontSize="md">
                {character.class}
              </Badge>
              <Text fontSize="xs" color="gray.500">
                Level {character.level}
              </Text>
            </Box>
            <Stat>
              <StatLabel fontSize="xs">Strength</StatLabel>
              <StatNumber fontSize="lg" color="red.400">
                {character.strength}
              </StatNumber>
            </Stat>
            <Stat>
              <StatLabel fontSize="xs">Dexterity</StatLabel>
              <StatNumber fontSize="lg" color="blue.400">
                {character.dexterity}
              </StatNumber>
            </Stat>
            <Stat>
              <StatLabel fontSize="xs">Intelligence</StatLabel>
              <StatNumber fontSize="lg" color="purple.400">
                {character.intelligence}
              </StatNumber>
            </Stat>
            <Box gridColumn={{ base: "1 / -1", md: "1 / -1" }}>
              <Text fontSize="xs" color="gray.500" mb={1}>
                Health
              </Text>
              <Progress
                value={(character.health / character.maxHealth) * 100}
                colorScheme="red"
                size="sm"
              />
              <Text fontSize="xs" color="gray.400" mt={1}>
                {character.health} / {character.maxHealth} HP
              </Text>
            </Box>
            {character.creationSeed && (
              <Box gridColumn={{ base: "1 / -1", md: "1 / -1" }}>
                <Text fontSize="xs" color="gray.500" mb={1}>
                  Creation VRF Seed:
                </Text>
                <Code fontSize="xs" display="block" p={2} bg={bgColor} borderRadius="md" isTruncated>
                  {character.creationSeed.slice(0, 30)}...
                </Code>
                <Text fontSize="xs" color="gray.400" mt={1}>
                  All stats generated from this VRF seed - verifiably random!
                </Text>
              </Box>
            )}
          </SimpleGrid>
        )}
      </Box>

      {/* Adventure */}
      {character && (
        <Box bg={cardBg} p={6} borderRadius="lg" borderWidth="1px" borderColor={borderColor} mb={4}>
          <Heading size="sm" mb={4} color="white">
            Adventure
          </Heading>

          {!adventure || adventure.roomNumber === 0 ? (
            <Box>
              <Alert status="info" borderRadius="lg" mb={4}>
                <AlertIcon />
                <Text fontSize="sm">Start an adventure to explore the dungeon!</Text>
              </Alert>
              {onStartAdventure && (
                <Button onClick={onStartAdventure} colorScheme="brand" isLoading={loading}>
                  Start Adventure (Request VRF)
                </Button>
              )}
            </Box>
          ) : (
            <Box>
              <Flex justify="space-between" align="center" mb={4}>
                <Text fontWeight="semibold" color="white">
                  Room #{adventure.roomNumber}
                </Text>
                {adventure.rollReady && (
                  <Badge colorScheme="green">Roll Ready!</Badge>
                )}
              </Flex>

              {/* d20 Roll Visualization */}
              {adventure.lastRoll > 0 && (
                <Box mb={4}>
                  <Text fontSize="sm" color="gray.400" mb={2}>
                    Last d20 Roll:
                  </Text>
                  <Flex align="center" gap={4}>
                    <Box
                      w="80px"
                      h="80px"
                      borderRadius="lg"
                      bg={bgColor}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      borderWidth="2px"
                      borderColor={getD20Color(adventure.lastRoll)}
                    >
                      <Text fontSize="3xl" fontWeight="bold" color={getD20Color(adventure.lastRoll)}>
                        {adventure.lastRoll}
                      </Text>
                    </Box>
                    <Box flex={1}>
                      <Text fontWeight="semibold" color="white" mb={1}>
                        {adventure.lastEvent}
                      </Text>
                      {adventure.rollSeed && (
                        <Code fontSize="xs" display="block" p={1} bg={bgColor} borderRadius="md" isTruncated>
                          VRF: {adventure.rollSeed.slice(0, 20)}...
                        </Code>
                      )}
                    </Box>
                  </Flex>
                </Box>
              )}

              {/* Action Buttons */}
              <Flex gap={2} flexWrap="wrap">
                {!adventure.rollReady && adventureRequestId && onRollD20 && (
                  <Button onClick={onRollD20} colorScheme="purple" isLoading={loading}>
                    Roll d20 (Use VRF)
                  </Button>
                )}
                {adventure.rollReady && onContinue && (
                  <Button onClick={onContinue} colorScheme="brand" isLoading={loading}>
                    Continue to Next Room (Request VRF)
                  </Button>
                )}
              </Flex>

              {/* How VRF is Used */}
              <Box bg={bgColor} p={3} borderRadius="md" mt={4}>
                <Text fontSize="xs" color="gray.400">
                  <strong>VRF Usage:</strong> Each d20 roll uses a fresh VRF seed, ensuring truly random
                  combat outcomes. The roll (1-20) is derived from the VRF value modulo 20, making it
                  cryptographically verifiable and fair.
                </Text>
              </Box>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}

