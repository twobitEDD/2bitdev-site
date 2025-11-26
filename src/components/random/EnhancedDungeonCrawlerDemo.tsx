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
  Stat,
  StatLabel,
  StatNumber,
  Progress,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Code,
  Select,
  Flex,
} from "@chakra-ui/react";
import { usePlaytestMode } from "@contexts/PlaytestModeContext";
import { useWallet } from "@contexts/WalletContext";
import {
  createCharacter,
  finalizeCharacter,
  startInteraction,
  completeInteraction,
  pollForFulfillmentStatus,
} from "@utils/contractHelpers";
import { contractsConfig } from "@config/contracts";
import { getRpcUrl } from "@config/rpc";
import { ethers } from "ethers";
import DungeonCrawlerABI from "@abis/DungeonCrawler.json";

interface Character {
  id: string; // Local unique identifier for the character
  contractCharacterId?: number; // Contract's uint256 characterId (from CharacterCreationStarted event)
  requestId?: string; // Request ID from createCharacter() - used to get characterId from event
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
  wealth: number;
  alive: boolean;
  actionCount: number; // Number of interactions completed (0-100)
  status: "active" | "legendary" | "early_death"; // Character status
  creationSeed?: string;
  createdAt: number;
}

interface Interaction {
  id: number;
  characterId: string; // Which character this interaction belongs to
  type: string;
  success: boolean;
  healthChange: number;
  wealthChange: number;
  outcome: string;
  vrfSeed?: string;
  timestamp: number;
}

// Base interaction types with variations
const BASE_INTERACTION_TYPES = [
  "Combat", "Treasure", "Trap", "Puzzle", "Merchant", "Rest", "Boss", "Secret",
  "Ambush", "Healing", "Curse", "Blessing", "Lockpick", "Stealth", "Magic",
];

// Variations for each type (used when repeating)
const INTERACTION_VARIATIONS: Record<string, string[]> = {
  "Combat": ["Combat", "Skilled Combat", "Master Combat", "Elite Combat", "Legendary Combat", "Epic Combat", "Mythic Combat"],
  "Treasure": ["Treasure", "Rich Treasure", "Ancient Treasure", "Rare Treasure", "Legendary Treasure", "Epic Treasure", "Mythic Treasure"],
  "Trap": ["Trap", "Deadly Trap", "Master Trap", "Elite Trap", "Legendary Trap", "Epic Trap", "Mythic Trap"],
  "Puzzle": ["Puzzle", "Complex Puzzle", "Master Puzzle", "Elite Puzzle", "Legendary Puzzle", "Epic Puzzle", "Mythic Puzzle"],
  "Merchant": ["Merchant", "Skilled Merchant", "Master Merchant", "Elite Merchant", "Legendary Merchant", "Epic Merchant", "Mythic Merchant"],
  "Rest": ["Rest", "Deep Rest", "Master Rest", "Elite Rest", "Legendary Rest", "Epic Rest", "Mythic Rest"],
  "Boss": ["Boss", "Elite Boss", "Master Boss", "Legendary Boss", "Epic Boss", "Mythic Boss", "Ultimate Boss"],
  "Secret": ["Secret", "Hidden Secret", "Master Secret", "Elite Secret", "Legendary Secret", "Epic Secret", "Mythic Secret"],
  "Ambush": ["Ambush", "Skilled Ambush", "Master Ambush", "Elite Ambush", "Legendary Ambush", "Epic Ambush", "Mythic Ambush"],
  "Healing": ["Healing", "Greater Healing", "Master Healing", "Elite Healing", "Legendary Healing", "Epic Healing", "Mythic Healing"],
  "Curse": ["Curse", "Powerful Curse", "Master Curse", "Elite Curse", "Legendary Curse", "Epic Curse", "Mythic Curse"],
  "Blessing": ["Blessing", "Greater Blessing", "Master Blessing", "Elite Blessing", "Legendary Blessing", "Epic Blessing", "Mythic Blessing"],
  "Lockpick": ["Lockpick", "Skilled Lockpick", "Master Lockpick", "Elite Lockpick", "Legendary Lockpick", "Epic Lockpick", "Mythic Lockpick"],
  "Stealth": ["Stealth", "Skilled Stealth", "Master Stealth", "Elite Stealth", "Legendary Stealth", "Epic Stealth", "Mythic Stealth"],
  "Magic": ["Magic", "Powerful Magic", "Master Magic", "Elite Magic", "Legendary Magic", "Epic Magic", "Mythic Magic"],
};

// Generate 100 interaction types with better names
const INTERACTION_TYPES = Array.from({ length: 100 }, (_, i) => {
  const baseType = BASE_INTERACTION_TYPES[i % BASE_INTERACTION_TYPES.length];
  const variationIndex = Math.floor(i / BASE_INTERACTION_TYPES.length);
  const variations = INTERACTION_VARIATIONS[baseType];
  return variations[Math.min(variationIndex, variations.length - 1)];
});

export function EnhancedDungeonCrawlerDemo() {
  const toast = useToast();
  const { isPlaytestMode } = usePlaytestMode();
  const { signer, provider, address, chainId } = useWallet();
  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const bgColor = useColorModeValue("gray.50", "gray.800");

  // Determine network from chainId
  const network = chainId && chainId === 84532 ? "baseSepolia" : "base";

  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);
  const [characterRequestId, setCharacterRequestId] = useState<string | null>(null);
  const [vrfReceived, setVrfReceived] = useState(false); // Track when VRF is actually received
  const [loadingCharacters, setLoadingCharacters] = useState(false); // Track character loading state
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [currentInteractionId, setCurrentInteractionId] = useState<number | null>(null);
  const [currentInteractionContractId, setCurrentInteractionContractId] = useState<string | null>(null); // Contract's interactionId
  const [currentInteractionRequestId, setCurrentInteractionRequestId] = useState<string | null>(null);
  const [selectedInteractionType, setSelectedInteractionType] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  // Get currently selected character
  const character = characters.find(c => c.id === selectedCharacterId) || null;
  
  // Get interactions for selected character
  const characterInteractions = interactions.filter(i => i.characterId === selectedCharacterId);

  const classColors: Record<string, string> = {
    Warrior: "red",
    Mage: "blue",
    Rogue: "purple",
    Cleric: "green",
  };

  // Function to load characters from contract (can be called manually)
  const loadCharactersFromContract = useCallback(async () => {
    // Skip during build/SSR - only run on client
    if (typeof window === 'undefined') {
      return;
    }

    // Skip if in playtest mode (no contract to query)
    if (isPlaytestMode) {
      console.log("Skipping character load - playtest mode");
      return;
    }

    // Skip if no address
    if (!address) {
      console.log("Skipping character load - no address");
      return;
    }

    try {
      setLoadingCharacters(true);
      console.log("🔄 Loading characters from contract...", { network, address });

      const dungeonCrawlerAddress = contractsConfig[network]?.dungeonCrawler;
      if (!dungeonCrawlerAddress) {
        console.log(`DungeonCrawler not deployed on ${network}`);
        setLoadingCharacters(false);
        return;
      }

      // Create read-only provider using Alchemy RPC for reliable data access
      const rpcUrl = getRpcUrl(network);
      const rpcProvider = new ethers.JsonRpcProvider(rpcUrl);
      console.log(`Using RPC for ${network}:`, rpcUrl.includes('alchemy') ? 'Alchemy' : 'Public');

      // Use full ABI from JSON file for accurate function signatures
      const contract = new ethers.Contract(dungeonCrawlerAddress, DungeonCrawlerABI.abi, rpcProvider);
      
      // Get user's character IDs with timeout
      // Use getPlayerCharacters() function instead of playerCharacters mapping
      let characterIds: bigint[] = [];
      try {
        characterIds = await Promise.race([
          contract.getPlayerCharacters(address),
          new Promise<bigint[]>((_, reject) => 
            setTimeout(() => reject(new Error(`Timeout fetching characters from ${network}`)), 5000)
          )
        ]) as bigint[];
      } catch (error: any) {
        // If playerCharacters fails, it might mean the player has no characters
        if (error?.code === 'CALL_EXCEPTION' || error?.message?.includes('revert') || error?.message?.includes('missing revert data')) {
          console.log(`No characters found for address ${address} (contract call reverted)`);
          setLoadingCharacters(false);
          return;
        }
        console.error(`Error fetching character IDs:`, error?.message || error);
        setLoadingCharacters(false);
        return;
      }
      
      if (!characterIds || characterIds.length === 0) {
        console.log("No past characters found");
        setLoadingCharacters(false);
        return;
      }

      console.log(`Found ${characterIds.length} character IDs for address ${address}`);

      // Fetch each character's data
      const loadedCharacters: Character[] = [];
      const classNames = ["Warrior", "Mage", "Rogue", "Cleric"];

      for (const characterId of characterIds) {
        try {
          const charData = await Promise.race([
            contract.getCharacter(characterId),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error(`Timeout fetching character ${characterId.toString()}`)), 3000)
            )
          ]) as any;

          // Safely access player address - try both named and indexed access
          let playerAddress: string | null = null;
          try {
            playerAddress = charData?.player || charData?.[0] || null;
          } catch (e) {
            // If accessing fails, character doesn't exist
            console.warn(`Character ${characterId.toString()} data access failed:`, e);
            continue;
          }

          // Check if character exists (player address should not be zero)
          if (!playerAddress || playerAddress === ethers.ZeroAddress || playerAddress === "0x0000000000000000000000000000000000000000") {
            console.warn(`Character ${characterId.toString()} does not exist (zero address)`);
            continue;
          }

          // Safely access all character properties with fallbacks
          const contractCharacterId = Number(characterId);
          const characterIdLocal = `char_${contractCharacterId}_${Date.now()}`;
          
          // Safely get class - try named first, then indexed
          let classValue = 0;
          try {
            classValue = Number(charData?.class ?? charData?.[1] ?? 0);
          } catch (e) {
            console.warn(`Failed to get class for character ${characterId.toString()}`);
            continue;
          }
          const className = classNames[classValue] || "Unknown";
          
          // Map status: 0=active, 1=legendary, 2=early_death
          const statusMap: Character["status"][] = ["active", "legendary", "early_death"];
          let statusValue = 0;
          try {
            statusValue = Number(charData?.status ?? charData?.[14] ?? 0);
          } catch (e) {
            statusValue = 0; // Default to active
          }
          const status = statusMap[statusValue] || "active";

          // Safely extract all character properties
          const character: Character = {
            id: characterIdLocal,
            contractCharacterId,
            class: className,
            strength: Number(charData?.strength ?? charData?.[2] ?? 10),
            dexterity: Number(charData?.dexterity ?? charData?.[3] ?? 10),
            intelligence: Number(charData?.intelligence ?? charData?.[4] ?? 10),
            wisdom: Number(charData?.wisdom ?? charData?.[5] ?? 10),
            constitution: Number(charData?.constitution ?? charData?.[6] ?? 10),
            charisma: Number(charData?.charisma ?? charData?.[7] ?? 10),
            level: Number(charData?.level ?? charData?.[8] ?? 1),
            health: Number(charData?.health ?? charData?.[9] ?? 20),
            maxHealth: Number(charData?.maxHealth ?? charData?.[10] ?? 20),
            wealth: Number(charData?.wealth ?? charData?.[11] ?? 0),
            alive: charData?.alive ?? charData?.[12] ?? true,
            actionCount: Number(charData?.actionCount ?? charData?.[13] ?? 0),
            status,
            createdAt: Number(charData?.createdAt ?? charData?.[15] ?? Date.now() / 1000) * 1000, // Convert from seconds to milliseconds
          };

          loadedCharacters.push(character);
        } catch (error: any) {
          // More detailed error logging
          if (error?.code === 'CALL_EXCEPTION' || error?.message?.includes('revert')) {
            console.warn(`Character ${characterId.toString()} does not exist or contract call failed:`, error.message);
          } else if (error?.message?.includes('RangeError') || error?.message?.includes('out of result range')) {
            console.warn(`Character ${characterId.toString()} data access error (out of range):`, error.message);
          } else {
            console.warn(`Failed to load character ${characterId.toString()}:`, error?.message || error);
          }
          // Continue loading other characters even if one fails
        }
      }

      if (loadedCharacters.length > 0) {
        console.log(`Loaded ${loadedCharacters.length} characters from contract`);
        // Sort by creation time (newest first)
        loadedCharacters.sort((a, b) => b.createdAt - a.createdAt);
        setCharacters(loadedCharacters);
        // Select the first (newest) character if none selected
        if (!selectedCharacterId && loadedCharacters.length > 0) {
          setSelectedCharacterId(loadedCharacters[0].id);
        }
      } else {
        console.log("No characters found for this address");
      }
    } catch (error) {
      console.error("Error loading past characters:", error);
      if (error instanceof Error) {
        console.error("Error details:", {
          message: error.message,
          stack: error.stack,
          network,
          address,
          dungeonCrawlerAddress: contractsConfig[network]?.dungeonCrawler
        });
      }
    } finally {
      setLoadingCharacters(false);
    }
  }, [isPlaytestMode, network, address]);

  // Load past characters from contract on mount
  useEffect(() => {
    // Skip during build/SSR - only run on client
    if (typeof window === 'undefined') {
      return;
    }

    // Call the shared load function
    loadCharactersFromContract();
  }, [loadCharactersFromContract]); // Re-fetch when load function changes

  const handleCreateCharacter = async () => {
    try {
      setLoading(true);
      
      // Check wallet connection if not in playtest mode
      if (!isPlaytestMode && (!signer || !address)) {
        toast({
          title: "Wallet Not Connected",
          description: "Please connect your wallet to create a character",
          status: "warning",
          duration: 5000,
        });
        setLoading(false);
        return;
      }

      console.log("🎮 Creating character...", { isPlaytestMode, network, hasSigner: !!signer });
      
      const result = await createCharacter(isPlaytestMode, signer, network);
      console.log("✅ Character creation request successful:", result);
      
      if (!result || !result.requestId) {
        throw new Error("Invalid response from createCharacter - missing requestId");
      }
      
      setCharacterRequestId(result.requestId);
      setVrfReceived(false); // Reset VRF received state
      
      // In real contract, createCharacter() returns requestId and emits CharacterCreationStarted with characterId
      toast({
        title: "Character Creation Started",
        description: `Request ID: ${result.requestId.slice(0, 10)}... Waiting for VRF...`,
        status: "info",
        duration: 5000,
      });

      // Poll for fulfillment after initial delay
      // Note: pollForFulfillmentStatus already has built-in delays, so we don't need a long delay here
      setTimeout(async () => {
        try {
          console.log("🔍 Polling for VRF fulfillment...", { requestId: result.requestId });
          const status = await pollForFulfillmentStatus(
            isPlaytestMode,
            provider,
            result.requestId,
            network
          );
          console.log("📊 Polling result:", { fulfilled: status.fulfilled, hasRandomness: !!status.randomnessValue });
          
          // Only show toast and set state if actually fulfilled with randomness value
          if (status.fulfilled && status.randomnessValue) {
            setVrfReceived(true);
            toast({
              title: "VRF Received!",
              description: "Click Finalize to create your character.",
              status: "success",
              duration: 5000,
            });
          }
        } catch (error) {
          console.error("Error polling for VRF fulfillment:", error);
          // Don't show error toast - polling will continue in background
        }
      }, 2000); // Wait 2 seconds before starting to poll
    } catch (error) {
      console.error("❌ Error creating character:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to create character";
      toast({
        title: "Error Creating Character",
        description: errorMessage,
        status: "error",
        duration: 7000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFinalizeCharacter = async () => {
    if (!characterRequestId) return;

    try {
      setLoading(true);
      
      // Check wallet connection if not in playtest mode
      if (!isPlaytestMode && (!signer || !address)) {
        toast({
          title: "Wallet Not Connected",
          description: "Please connect your wallet to finalize character",
          status: "warning",
          duration: 5000,
        });
        setLoading(false);
        return;
      }

      console.log("Finalizing character with requestId:", characterRequestId);
      const charData = await finalizeCharacter(isPlaytestMode, signer, characterRequestId, network);
      console.log("Character data received:", charData);
      
      // Validate character data
      if (!charData || charData.characterId === undefined) {
        throw new Error("Invalid character data received from contract");
      }
      
      // Create new character with unique ID
      // In real contract, characterId comes from CharacterCreationStarted event
      const contractCharacterId = charData.characterId;
      const characterId = `char_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const classNames = ["Warrior", "Mage", "Rogue", "Cleric"];
      // charData.class is a number (0-3) from the contract: 0=Warrior, 1=Mage, 2=Rogue, 3=Cleric
      const className = classNames[Number(charData.class)] || "Unknown";
      
      const newCharacter: Character = {
        id: characterId,
        contractCharacterId, // Store contract's characterId for use with startInteraction
        requestId: characterRequestId, // Store requestId for reference
        class: className,
        strength: charData.strength || 10,
        dexterity: charData.dexterity || 10,
        intelligence: charData.intelligence || 10,
        wisdom: charData.wisdom || 10,
        constitution: charData.constitution || 10,
        charisma: charData.charisma || 10,
        level: 1,
        health: charData.health || charData.maxHealth || 20,
        maxHealth: charData.maxHealth || charData.health || 20,
        wealth: charData.wealth || 0,
        alive: true,
        actionCount: 0,
        status: "active",
        creationSeed: charData.creationSeed,
        createdAt: Date.now(),
      };

      console.log("Adding character to state:", newCharacter);
      setCharacters(prev => {
        const updated = [...prev, newCharacter];
        console.log("Updated characters array:", updated);
        return updated;
      });
      setSelectedCharacterId(characterId);
      setCharacterRequestId(null);
      setVrfReceived(false); // Reset VRF received state

      toast({
        title: "Character Created!",
        description: `You are a ${className} with ${charData.strength} STR, ${charData.dexterity} DEX, ${charData.intelligence} INT`,
        status: "success",
        duration: 5000,
      });

      // Reload characters from contract to ensure persistence
      // This ensures the newly created character is loaded from the contract
      if (!isPlaytestMode && address) {
        setTimeout(() => {
          console.log("🔄 Reloading characters after creation...");
          loadCharactersFromContract();
        }, 3000); // Wait 3 seconds for the transaction to be mined
      }
    } catch (error) {
      console.error("Error finalizing character:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to finalize character";
      toast({
        title: "Error Finalizing Character",
        description: errorMessage,
        status: "error",
        duration: 7000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartInteraction = async () => {
    if (!character || !character.alive || character.status !== "active") {
      toast({
        title: "No Active Character",
        description: character?.status === "legendary" 
          ? "This character has reached legendary status and cannot perform more actions."
          : character?.status === "early_death"
          ? "This character has died early."
          : "Please create and select a character first",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    // Check if character has reached 100 actions
    if (character.actionCount >= 100) {
      toast({
        title: "Character Reached Limit",
        description: "This character has completed 100 actions and achieved legendary status!",
        status: "info",
        duration: 5000,
      });
      return;
    }

    // Check wallet connection if not in playtest mode
    if (!isPlaytestMode && (!signer || !address)) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to start an interaction",
        status: "warning",
        duration: 5000,
      });
      return;
    }

    try {
      setLoading(true);
      const interactionType = selectedInteractionType;
      
      // Contract requires: startInteraction(uint256 _characterId, InteractionType _interactionType)
      // Use contractCharacterId if available, otherwise fall back to character index
      const characterIdForContract = character.contractCharacterId ?? (characters.findIndex(c => c.id === character.id) + 1);
      const result = await startInteraction(
        isPlaytestMode,
        signer,
        characterIdForContract,
        interactionType,
        network
      );
      const newInteractionId = Date.now(); // Use timestamp for unique ID
      
      setCurrentInteractionId(newInteractionId);
      setCurrentInteractionContractId(result.interactionId?.toString() || null); // Store contract's interactionId
      setCurrentInteractionRequestId(result.requestId);
      
      toast({
        title: "Interaction Started",
        description: `${INTERACTION_TYPES[interactionType]} - Request ID: ${result.requestId.slice(0, 10)}...`,
        status: "info",
        duration: 3000,
      });

      // Poll for fulfillment after initial delay
      setTimeout(async () => {
        try {
          const status = await pollForFulfillmentStatus(
            isPlaytestMode,
            provider,
            result.requestId,
            network
          );
          // Only show toast if actually fulfilled with randomness value
          if (status.fulfilled && status.randomnessValue) {
            toast({
              title: "VRF Received!",
              description: "Click Complete Interaction to see the result.",
              status: "success",
              duration: 5000,
            });
          }
        } catch (error) {
          console.error("Error polling for VRF fulfillment:", error);
          // Don't show error toast - polling will continue in background
        }
      }, 1000); // Reduced delay since pollForRealFulfillment now waits before first check
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to start interaction",
        status: "error",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteInteraction = async () => {
    if (!currentInteractionRequestId || currentInteractionId === null || !character) return;

    // Check wallet connection if not in playtest mode
    if (!isPlaytestMode && (!signer || !address)) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to complete interaction",
        status: "warning",
        duration: 5000,
      });
      return;
    }

    // For real contracts, we need the contract's interactionId
    if (!isPlaytestMode && !currentInteractionContractId) {
      toast({
        title: "Error",
        description: "Interaction ID not found",
        status: "error",
        duration: 5000,
      });
      return;
    }

    try {
      setLoading(true);
      // Use contract's interactionId for real contracts, or currentInteractionId for mocks
      const interactionIdToUse = isPlaytestMode 
        ? currentInteractionId 
        : parseInt(currentInteractionContractId || "0");
      
      const result = await completeInteraction(
        isPlaytestMode,
        signer,
        interactionIdToUse,
        currentInteractionRequestId,
        network,
        selectedInteractionType,
        {
          strength: character.strength,
          dexterity: character.dexterity,
          intelligence: character.intelligence,
          charisma: character.charisma,
        }
      );

      const newInteraction: Interaction = {
        id: currentInteractionId,
        characterId: character.id,
        type: INTERACTION_TYPES[selectedInteractionType],
        success: result.success,
        healthChange: result.healthChange,
        wealthChange: result.wealthChange,
        outcome: result.outcome,
        vrfSeed: result.vrfSeed,
        timestamp: Date.now(),
      };

      setInteractions(prev => [newInteraction, ...prev]);

      // Update character
      const newHealth = Math.max(0, Math.min(character.maxHealth, character.health + result.healthChange));
      const newWealth = Math.max(0, character.wealth + result.wealthChange);
      const isAlive = newHealth > 0;
      const newActionCount = character.actionCount + 1;
      
      // Determine character status
      let newStatus: Character["status"] = character.status;
      if (!isAlive) {
        newStatus = "early_death";
      } else if (newActionCount >= 100) {
        newStatus = "legendary";
      }

      // Update character in array
      setCharacters(prev => prev.map(c => 
        c.id === character.id 
          ? {
              ...c,
              health: newHealth,
              wealth: newWealth,
              alive: isAlive,
              actionCount: newActionCount,
              status: newStatus,
            }
          : c
      ));

      toast({
        title: result.success ? "Success!" : "Failure!",
        description: result.outcome,
        status: result.success ? "success" : "error",
        duration: 5000,
      });

      if (!isAlive) {
        toast({
          title: "Character Died Early!",
          description: `Your character perished after ${newActionCount} actions. Create a new character to continue.`,
          status: "error",
          duration: 7000,
        });
      } else if (newActionCount >= 100) {
        toast({
          title: "Legendary Status Achieved!",
          description: `Congratulations! Your character has completed 100 actions and achieved legendary status!`,
          status: "success",
          duration: 7000,
        });
      }

      setCurrentInteractionId(null);
      setCurrentInteractionContractId(null);
      setCurrentInteractionRequestId(null);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to complete interaction",
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
          🐉 Enhanced Dungeon Crawler - 100 Interactions
        </Heading>
        {isPlaytestMode && (
          <Badge colorScheme="yellow" fontSize="sm" px={3} py={1}>
            🎮 PLAYTEST MODE
          </Badge>
        )}
      </Flex>

      {/* Character Selection & Creation */}
      <Box bg={cardBg} p={6} borderRadius="lg" borderWidth="1px" borderColor={borderColor} mb={4}>
        <Flex justify="space-between" align="center" mb={4}>
          <Heading size="sm" color="white">
            Characters ({characters.length})
            {loadingCharacters && (
              <Spinner size="sm" ml={2} />
            )}
          </Heading>
          <Stack direction="row" spacing={2}>
            {!characterRequestId && (
              <Button onClick={handleCreateCharacter} colorScheme="brand" size="sm" isLoading={loading}>
                Create New Character
              </Button>
            )}
            {characterRequestId && vrfReceived && (
              <Button onClick={handleFinalizeCharacter} colorScheme="green" size="sm" isLoading={loading}>
                Finalize Character
              </Button>
            )}
            {characterRequestId && !vrfReceived && (
              <Button isDisabled colorScheme="gray" size="sm">
                Waiting for VRF...
              </Button>
            )}
          </Stack>
        </Flex>

        {characters.length > 0 && (
          <Box mb={4}>
            <Text fontSize="sm" color="gray.400" mb={2}>
              Select Character:
            </Text>
            <Select
              value={selectedCharacterId || ""}
              onChange={(e) => setSelectedCharacterId(e.target.value || null)}
              bg={bgColor}
              color="white"
              mb={4}
              placeholder="Choose a character..."
            >
              {characters.map((char) => (
                <option key={char.id} value={char.id}>
                  {char.class} - {char.actionCount}/100 actions
                  {char.status === "legendary" && " ⭐ LEGENDARY"}
                  {char.status === "early_death" && " 💀 DIED EARLY"}
                </option>
              ))}
            </Select>
          </Box>
        )}

        {characterRequestId && !character && (
          <Alert status={vrfReceived ? "success" : "info"} borderRadius="lg" mb={4}>
            <AlertIcon />
            <Box flex={1}>
              <Text fontWeight="bold">{vrfReceived ? "VRF Received!" : "Waiting for VRF..."}</Text>
              <Text fontSize="sm">
                {vrfReceived 
                  ? "Click Finalize Character to create your character."
                  : "Please wait for the VRF randomness to be fulfilled. This usually takes a few seconds."}
              </Text>
            </Box>
          </Alert>
        )}

        {character && (
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
            <Box>
              <Badge colorScheme={classColors[character.class] || "gray"} mb={2} fontSize="md">
                {character.class}
              </Badge>
              <Text fontSize="xs" color="gray.500">
                Level {character.level}
              </Text>
              {character.status === "legendary" && (
                <Badge colorScheme="yellow" mt={1} fontSize="xs">
                  ⭐ LEGENDARY
                </Badge>
              )}
              {character.status === "early_death" && (
                <Badge colorScheme="red" mt={1} fontSize="xs">
                  💀 DIED EARLY
                </Badge>
              )}
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
                Actions Remaining: {100 - character.actionCount} / 100
              </Text>
              <Progress
                value={(character.actionCount / 100) * 100}
                colorScheme={character.actionCount >= 100 ? "yellow" : character.actionCount >= 75 ? "orange" : "blue"}
                size="md"
                mb={2}
              />
              <Text fontSize="xs" color="gray.400">
                {character.actionCount} actions completed
                {character.actionCount >= 100 && <Badge colorScheme="yellow" ml={2}>Legendary!</Badge>}
              </Text>
            </Box>
            <Box gridColumn={{ base: "1 / -1", md: "1 / -1" }}>
              <Text fontSize="xs" color="gray.500" mb={1}>
                Health
              </Text>
              <Progress
                value={(character.health / character.maxHealth) * 100}
                colorScheme={character.alive ? "red" : "gray"}
                size="sm"
              />
              <Text fontSize="xs" color="gray.400" mt={1}>
                {character.health} / {character.maxHealth} HP
                {!character.alive && <Badge colorScheme="red" ml={2}>DEAD</Badge>}
              </Text>
            </Box>
            <Box gridColumn={{ base: "1 / -1", md: "1 / -1" }}>
              <Text fontSize="xs" color="gray.500" mb={1}>
                Wealth
              </Text>
              <Text fontSize="lg" fontWeight="bold" color="yellow.400">
                {character.wealth} Gold
              </Text>
            </Box>
          </SimpleGrid>
        )}

        {characters.length === 0 && !characterRequestId && (
          <Alert status="info" borderRadius="lg">
            <AlertIcon />
            <Box flex={1}>
              <Text fontWeight="bold">No Characters</Text>
              <Text fontSize="sm">Create your first character to start playing!</Text>
            </Box>
          </Alert>
        )}
      </Box>

      {/* Character List */}
      {characters.length > 1 && (
        <Box bg={cardBg} p={6} borderRadius="lg" borderWidth="1px" borderColor={borderColor} mb={4}>
          <Heading size="sm" mb={4} color="white">
            All Characters
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
            {characters.map((char) => {
              const charInteractions = interactions.filter(i => i.characterId === char.id);
              return (
                <Box
                  key={char.id}
                  p={4}
                  bg={selectedCharacterId === char.id ? "brand.900" : bgColor}
                  borderRadius="md"
                  borderWidth="2px"
                  borderColor={selectedCharacterId === char.id ? "brand.400" : borderColor}
                  cursor="pointer"
                  onClick={() => setSelectedCharacterId(char.id)}
                  _hover={{ borderColor: "brand.400" }}
                >
                  <Flex justify="space-between" align="start" mb={2}>
                    <Badge colorScheme={classColors[char.class] || "gray"} fontSize="sm">
                      {char.class}
                    </Badge>
                    {char.status === "legendary" && (
                      <Badge colorScheme="yellow" fontSize="xs">⭐ LEGENDARY</Badge>
                    )}
                    {char.status === "early_death" && (
                      <Badge colorScheme="red" fontSize="xs">💀 DIED EARLY</Badge>
                    )}
                  </Flex>
                  <Text fontSize="xs" color="gray.400" mb={2}>
                    {char.actionCount} / 100 actions
                  </Text>
                  <Progress
                    value={(char.actionCount / 100) * 100}
                    colorScheme={char.actionCount >= 100 ? "yellow" : char.actionCount >= 75 ? "orange" : "blue"}
                    size="sm"
                    mb={2}
                  />
                  <Text fontSize="xs" color="gray.500">
                    {char.alive ? `${char.health}/${char.maxHealth} HP` : "DEAD"} • {char.wealth} Gold
                  </Text>
                </Box>
              );
            })}
          </SimpleGrid>
        </Box>
      )}

      {/* Interaction Section */}
      {character && character.alive && character.status === "active" && (
        <Box bg={cardBg} p={6} borderRadius="lg" borderWidth="1px" borderColor={borderColor} mb={4}>
          <Heading size="sm" mb={4} color="white">
            Start Interaction ({characterInteractions.length}/100 remaining: {100 - character.actionCount})
          </Heading>

          <Stack spacing={4}>
            <Box>
              <Text fontSize="sm" color="gray.400" mb={2}>
                Select Interaction Type:
              </Text>
              <SimpleGrid columns={{ base: 3, md: 5 }} spacing={2}>
                {INTERACTION_TYPES.slice(0, 20).map((type, idx) => (
                  <Button
                    key={idx}
                    size="sm"
                    colorScheme={selectedInteractionType === idx ? "brand" : "gray"}
                    variant={selectedInteractionType === idx ? "solid" : "outline"}
                    onClick={() => setSelectedInteractionType(idx)}
                  >
                    {type}
                  </Button>
                ))}
              </SimpleGrid>
            </Box>

            <Stack direction="row" spacing={4}>
              {!currentInteractionRequestId && (
                <Button onClick={handleStartInteraction} colorScheme="brand" isLoading={loading}>
                  Start Interaction (Request VRF)
                </Button>
              )}
              {currentInteractionRequestId && (
                <Button onClick={handleCompleteInteraction} colorScheme="green" isLoading={loading}>
                  Complete Interaction
                </Button>
              )}
            </Stack>
          </Stack>
        </Box>
      )}

      {/* How It Works */}
      <Box bg={cardBg} p={6} borderRadius="lg" borderWidth="1px" borderColor={borderColor} mb={4}>
        <Heading size="sm" mb={4} color="white">
          How DungeonCrawler Works
        </Heading>
        <Stack spacing={3} fontSize="sm" color="gray.400">
          <Text>
            <strong>Character Creation:</strong> <Code fontSize="xs">createCharacter()</Code> requests VRF → <Code fontSize="xs">finalizeCharacter()</Code> uses VRF to generate class and stats (3-18 range)
          </Text>
          <Text>
            <strong>Interactions:</strong> <Code fontSize="xs">startInteraction(characterId, interactionType)</Code> requests VRF → <Code fontSize="xs">completeInteraction()</Code> uses VRF to determine success/failure based on character stats
          </Text>
          <Text>
            <strong>Success Rate:</strong> Base 50% + (relevant stat × 2). Combat uses STR, Stealth uses DEX, Magic uses INT, Social uses CHA
          </Text>
          <Text>
            <strong>Outcomes:</strong> Success grants health/wealth, failure deals damage. Character dies if health reaches 0
          </Text>
          <Text fontSize="xs" color="gray.500" mt={2}>
            <strong>Pattern:</strong> Pattern 2 (Manual Claim) - Two-step flow for character creation and interactions
          </Text>
        </Stack>
      </Box>

      {/* Interaction History */}
      {character && characterInteractions.length > 0 && (
        <Box bg={cardBg} p={6} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
          <Heading size="sm" mb={4} color="white">
            Interaction History - {character.class} ({characterInteractions.length}/100)
          </Heading>
          <Box maxH="400px" overflowY="auto">
            <Table size="sm">
              <Thead>
                <Tr>
                  <Th>Type</Th>
                  <Th>Result</Th>
                  <Th>Health</Th>
                  <Th>Wealth</Th>
                  <Th>Outcome</Th>
                </Tr>
              </Thead>
              <Tbody>
                {characterInteractions.slice(0, 20).map((interaction) => (
                  <Tr key={interaction.id}>
                    <Td>
                      <Badge colorScheme={interaction.success ? "green" : "red"}>
                        {interaction.type}
                      </Badge>
                    </Td>
                    <Td>
                      <Badge colorScheme={interaction.success ? "green" : "red"}>
                        {interaction.success ? "✓" : "✗"}
                      </Badge>
                    </Td>
                    <Td color={interaction.healthChange >= 0 ? "green.400" : "red.400"}>
                      {interaction.healthChange >= 0 ? "+" : ""}{interaction.healthChange}
                    </Td>
                    <Td color={interaction.wealthChange >= 0 ? "green.400" : "red.400"}>
                      {interaction.wealthChange >= 0 ? "+" : ""}{interaction.wealthChange}
                    </Td>
                    <Td fontSize="xs">{interaction.outcome}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Box>
      )}
    </Box>
  );
}

