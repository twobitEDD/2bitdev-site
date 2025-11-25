"use client";

import { useState } from "react";
import { DungeonCrawlerGame } from "./DungeonCrawlerGame";
import {
  mockCreateCharacter,
  mockFinalizeCharacter,
  mockStartAdventure,
  mockRollD20,
  mockContinueAdventure,
  pollForFulfillment,
} from "@utils/mockContracts";
import { useToast, Box } from "@chakra-ui/react";

export function DungeonCrawlerDemo() {
  const [character, setCharacter] = useState<any>(null);
  const [characterRequestId, setCharacterRequestId] = useState<string | null>(null);
  const [adventure, setAdventure] = useState<any>(null);
  const [adventureRequestId, setAdventureRequestId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleCreateCharacter = async () => {
    try {
      setLoading(true);
      const result = await mockCreateCharacter();
      setCharacterRequestId(result.requestId);
      
      toast({
        title: "Character Creation Started",
        description: `Request ID: ${result.requestId.slice(0, 10)}...`,
        status: "info",
        duration: 3000,
      });

      // Poll for fulfillment
      setTimeout(async () => {
        try {
          const status = await pollForFulfillment(result.requestId);
          if (status.fulfilled && status.randomnessValue) {
            toast({
              title: "VRF Received!",
              description: "Character stats are ready. Click Finalize to create your character.",
              status: "success",
              duration: 5000,
            });
          }
        } catch (error) {
          console.error("Error polling:", error);
        }
      }, 2000);
    } catch (error) {
      console.error("Error creating character:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create character",
        status: "error",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFinalizeCharacter = async () => {
    if (!characterRequestId) return;

    try {
      setLoading(true);
      const charData = await mockFinalizeCharacter(characterRequestId);
      
      // Calculate health based on class and constitution
      // charData.class is now a number (0-3) from the contract: 0=Warrior, 1=Mage, 2=Rogue, 3=Cleric
      const classIndex = Number(charData.class);
      let baseHealth = 20;
      if (classIndex === 0) baseHealth = 30; // Warrior
      if (classIndex === 3) baseHealth = 25; // Cleric
      const maxHealth = baseHealth + (charData.constitution * 2);

      setCharacter({
        ...charData,
        level: 1,
        experience: 0,
        health: maxHealth,
        maxHealth,
      });

      const classNames = ["Warrior", "Mage", "Rogue", "Cleric"];
      const className = classNames[classIndex] || "Unknown";
      
      toast({
        title: "Character Created!",
        description: `You are a ${className} with ${charData.strength} STR, ${charData.dexterity} DEX, ${charData.intelligence} INT`,
        status: "success",
        duration: 5000,
      });
    } catch (error) {
      console.error("Error finalizing character:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to finalize character",
        status: "error",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartAdventure = async () => {
    if (!character) {
      toast({
        title: "No Character",
        description: "Please create a character first",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    try {
      setLoading(true);
      const result = await mockStartAdventure();
      setAdventureRequestId(result.requestId);
      
      setAdventure({
        roomNumber: 1,
        lastRoll: 0,
        lastEvent: "",
        rollReady: false,
      });

      toast({
        title: "Adventure Started!",
        description: `Entering Room #1. Request ID: ${result.requestId.slice(0, 10)}...`,
        status: "info",
        duration: 3000,
      });

      // Poll for fulfillment
      setTimeout(async () => {
        try {
          const status = await pollForFulfillment(result.requestId);
          if (status.fulfilled && status.randomnessValue) {
            setAdventure((prev: any) => ({
              ...prev,
              rollReady: true,
            }));
            toast({
              title: "VRF Ready!",
              description: "Click Roll d20 to use randomness for combat.",
              status: "success",
              duration: 5000,
            });
          }
        } catch (error) {
          console.error("Error polling:", error);
        }
      }, 2000);
    } catch (error) {
      console.error("Error starting adventure:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to start adventure",
        status: "error",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRollD20 = async () => {
    if (!adventureRequestId) return;

    try {
      setLoading(true);
      const result = await mockRollD20(adventureRequestId);
      
      const newAdventure = {
        ...adventure,
        lastRoll: result.roll,
        lastEvent: result.event,
        rollSeed: result.seed,
        rollReady: true,
      };

      // If successful (15+), advance room
      if (result.roll >= 15) {
        newAdventure.roomNumber = adventure.roomNumber + 1;
        newAdventure.rollReady = false;
      }

      setAdventure(newAdventure);

      toast({
        title: `Rolled ${result.roll}!`,
        description: result.event,
        status: result.roll >= 15 ? "success" : result.roll >= 10 ? "info" : "warning",
        duration: 5000,
      });
    } catch (error) {
      console.error("Error rolling d20:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to roll d20",
        status: "error",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = async () => {
    if (!adventure || adventure.roomNumber === 0) return;

    try {
      setLoading(true);
      const result = await mockContinueAdventure();
      setAdventureRequestId(result.requestId);

      toast({
        title: "Continuing Adventure",
        description: `Entering Room #${adventure.roomNumber + 1}. Request ID: ${result.requestId.slice(0, 10)}...`,
        status: "info",
        duration: 3000,
      });

      // Poll for fulfillment
      setTimeout(async () => {
        try {
          const status = await pollForFulfillment(result.requestId);
          if (status.fulfilled && status.randomnessValue) {
            setAdventure((prev: any) => ({
              ...prev,
              rollReady: true,
            }));
            toast({
              title: "VRF Ready!",
              description: "Click Roll d20 for the next room.",
              status: "success",
              duration: 5000,
            });
          }
        } catch (error) {
          console.error("Error polling:", error);
        }
      }, 2000);
    } catch (error) {
      console.error("Error continuing:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to continue",
        status: "error",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DungeonCrawlerGame
      character={character}
      adventure={adventure}
      onCreateCharacter={handleCreateCharacter}
      onFinalizeCharacter={handleFinalizeCharacter}
      onStartAdventure={handleStartAdventure}
      onRollD20={handleRollD20}
      onContinue={handleContinue}
      loading={loading}
      characterRequestId={characterRequestId || undefined}
      adventureRequestId={adventureRequestId || undefined}
    />
  );
}

