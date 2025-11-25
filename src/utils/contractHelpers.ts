/**
 * Contract Helper Functions
 * 
 * Unified interface for contract interactions that respects playtest mode
 */

import { ethers } from "ethers";
import {
  mockGoFishing,
  mockCatchFish,
  pollForFulfillment,
} from "./mockContracts";
import {
  realGoFishing,
  realCatchFish,
  checkRequestStatus,
  pollForRealFulfillment,
} from "./contractInteractions";

export interface FishingResult {
  requestId: string;
  txHash?: string;
}

export interface FishCatchResult {
  fishType: number;
  fishName: string;
  size: number;
  value: number;
}

/**
 * Go fishing - uses real contract or mock based on playtest mode
 */
export async function goFishing(
  isPlaytestMode: boolean,
  signer: ethers.JsonRpcSigner | null,
  provider: ethers.BrowserProvider | null,
  network: "base" | "baseSepolia" = "baseSepolia"
): Promise<FishingResult> {
  if (isPlaytestMode || !signer) {
    // Use mock when playtest mode is ON or wallet not connected
    return await mockGoFishing();
  }

  // Use real contract
  return await realGoFishing(signer, network);
}

/**
 * Catch fish - uses real contract or mock based on playtest mode
 */
export async function catchFish(
  isPlaytestMode: boolean,
  signer: ethers.JsonRpcSigner | null,
  requestId: string,
  randomnessSeed: string,
  network: "base" | "baseSepolia" = "baseSepolia"
): Promise<FishCatchResult> {
  if (isPlaytestMode || !signer) {
    // Use mock when playtest mode is ON or wallet not connected
    return await mockCatchFish(requestId, randomnessSeed);
  }

  // Use real contract
  return await realCatchFish(signer, requestId, network);
}

/**
 * Poll for fulfillment - uses real contract or mock based on playtest mode
 */
export async function pollForFulfillmentStatus(
  isPlaytestMode: boolean,
  provider: ethers.BrowserProvider | null,
  requestId: string,
  network: "base" | "baseSepolia" = "baseSepolia"
): Promise<{ fulfilled: boolean; randomnessValue?: string }> {
  if (isPlaytestMode || !provider) {
    // Use mock when playtest mode is ON or provider not available
    const status = await pollForFulfillment(requestId);
    return {
      fulfilled: status.fulfilled,
      randomnessValue: status.randomnessValue,
    };
  }

  // Use real contract
  try {
    const status = await pollForRealFulfillment(provider, requestId, network);
    return {
      fulfilled: status.fulfilled,
      randomnessValue: status.randomnessValue,
    };
  } catch (error) {
    // If polling fails, check once more
    const status = await checkRequestStatus(provider, requestId, network);
    return {
      fulfilled: status.fulfilled,
      randomnessValue: status.randomnessValue,
    };
  }
}

// ========== RouletteGame Helpers ==========

export interface RouletteSpinResult {
  spinId: string;
  requestId: string;
  txHash?: string;
}

/**
 * Request spin - uses real contract or mock based on playtest mode
 */
export async function requestSpin(
  isPlaytestMode: boolean,
  signer: ethers.JsonRpcSigner | null,
  network: "base" | "baseSepolia" = "baseSepolia"
): Promise<{ requestId: string; spinId?: number; txHash?: string }> {
  if (isPlaytestMode || !signer) {
    // Use mock when playtest mode is ON or wallet not connected
    const { mockRequestRandomness } = await import("./mockContracts");
    const result = await mockRequestRandomness(1, "0xRoulettePlayer");
    return {
      requestId: result.requestId,
    };
  }

  // Use real contract
  const { realRequestSpin } = await import("./contractInteractions");
  const result = await realRequestSpin(signer, network);
  
  return {
    requestId: result.requestId,
    spinId: result.spinId ? Number(result.spinId) : undefined,
    txHash: result.txHash,
  };
}

/**
 * Get spin result - uses real contract or mock based on playtest mode
 */
export async function getSpinResultHelper(
  isPlaytestMode: boolean,
  provider: ethers.BrowserProvider | null,
  spinId: number | string | null | undefined,
  requestId: string,
  network: "base" | "baseSepolia" = "baseSepolia"
): Promise<{ result: number; color: string; vrfSeed: string; isEven: boolean }> {
  if (isPlaytestMode || !provider) {
    // Use mock when playtest mode is ON or provider not available
    const { pollForFulfillment } = await import("./mockContracts");
    const status = await pollForFulfillment(requestId);
    if (!status.randomnessValue) {
      throw new Error("Randomness not yet fulfilled");
    }
    
    const seed = BigInt(status.randomnessValue);
    const result = Number(seed % BigInt(37));
    const getColor = (r: number): string => {
      if (r === 0) return "green";
      const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
      return redNumbers.includes(r) ? "red" : "black";
    };
    
    return {
      result,
      color: getColor(result),
      vrfSeed: status.randomnessValue,
      isEven: result !== 0 && result % 2 === 0,
    };
  }

  // Use real contract - need spinId
  if (!spinId) {
    throw new Error("Spin ID required for real contract");
  }

  const { pollForSpinCompletion } = await import("./contractInteractions");
  return await pollForSpinCompletion(provider, BigInt(spinId), network);
}

// ========== DungeonCrawler Helpers ==========

export interface CharacterCreationResult {
  requestId: string;
  characterId: string;
  txHash?: string;
}

export interface CharacterFinalizeResult {
  characterId: string;
  class: number;
  strength: number;
  dexterity: number;
  intelligence: number;
  wisdom: number;
  constitution: number;
  charisma: number;
  health: number;
  maxHealth: number;
  wealth: number;
  creationSeed: string;
}

export interface InteractionStartResult {
  requestId: string;
  interactionId: string;
  txHash?: string;
}

export interface InteractionCompleteResult {
  success: boolean;
  healthChange: number;
  wealthChange: number;
  outcome: string;
  actionCount: number;
  vrfSeed: string;
}

/**
 * Create character - uses real contract or mock based on playtest mode
 */
export async function createCharacter(
  isPlaytestMode: boolean,
  signer: ethers.JsonRpcSigner | null,
  network: "base" | "baseSepolia" = "baseSepolia"
): Promise<{ requestId: string; txHash?: string }> {
  if (isPlaytestMode || !signer) {
    // Use mock when playtest mode is ON or wallet not connected
    const { mockCreateCharacter } = await import("./mockContracts");
    return await mockCreateCharacter();
  }

  // Use real contract
  const { realCreateCharacter } = await import("./contractInteractions");
  return await realCreateCharacter(signer, network);
}

/**
 * Finalize character - uses real contract or mock based on playtest mode
 */
export async function finalizeCharacter(
  isPlaytestMode: boolean,
  signer: ethers.JsonRpcSigner | null,
  requestId: string,
  network: "base" | "baseSepolia" = "baseSepolia"
): Promise<{
  characterId: number;
  class: number;
  strength: number;
  dexterity: number;
  intelligence: number;
  wisdom: number;
  constitution: number;
  charisma: number;
  health: number;
  maxHealth: number;
  wealth: number;
  creationSeed: string;
}> {
  if (isPlaytestMode || !signer) {
    // Use mock when playtest mode is ON or wallet not connected
    const { mockFinalizeCharacter } = await import("./mockContracts");
    return await mockFinalizeCharacter(requestId);
  }

  // Use real contract
  const { realFinalizeCharacter } = await import("./contractInteractions");
  return await realFinalizeCharacter(signer, requestId, network);
}

/**
 * Start interaction - uses real contract or mock based on playtest mode
 */
export async function startInteraction(
  isPlaytestMode: boolean,
  signer: ethers.JsonRpcSigner | null,
  characterId: number,
  interactionType: number,
  network: "base" | "baseSepolia" = "baseSepolia"
): Promise<{ requestId: string; interactionId?: number; txHash?: string }> {
  if (isPlaytestMode || !signer) {
    // Use mock when playtest mode is ON or wallet not connected
    const { mockStartInteraction } = await import("./mockContracts");
    const result = await mockStartInteraction(characterId, interactionType);
    return {
      requestId: result.requestId,
      interactionId: undefined, // Mocks don't return interactionId
    };
  }

  // Use real contract
  const { realStartInteraction } = await import("./contractInteractions");
  const result = await realStartInteraction(signer, BigInt(characterId), interactionType, network);
  
  return {
    requestId: result.requestId,
    interactionId: result.interactionId ? Number(result.interactionId) : undefined,
    txHash: result.txHash,
  };
}

/**
 * Complete interaction - uses real contract or mock based on playtest mode
 */
export async function completeInteraction(
  isPlaytestMode: boolean,
  signer: ethers.JsonRpcSigner | null,
  interactionId: number,
  requestId: string,
  network: "base" | "baseSepolia",
  interactionType: number,
  character: {
    strength: number;
    dexterity: number;
    intelligence: number;
    charisma: number;
    actionCount?: number;
  }
): Promise<{
  success: boolean;
  healthChange: number;
  wealthChange: number;
  outcome: string;
  vrfSeed: string;
}> {
  if (isPlaytestMode || !signer) {
    // Use mock when playtest mode is ON or wallet not connected
    const { mockCompleteInteraction } = await import("./mockContracts");
    return await mockCompleteInteraction(requestId, interactionType, character);
  }

  // Use real contract
  const { realCompleteInteraction } = await import("./contractInteractions");
  const result = await realCompleteInteraction(signer, BigInt(interactionId), network);
  
  return {
    success: result.success,
    healthChange: result.healthChange,
    wealthChange: result.wealthChange,
    outcome: result.outcome,
    vrfSeed: result.vrfSeed,
  };
}

