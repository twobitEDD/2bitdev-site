/**
 * Mock Contract Interactions
 * 
 * Simulates contract calls for testing UI/UX without deployed contracts.
 * These functions mimic the behavior of real contract interactions.
 */

// Generate a fake VRF value (bytes32 hex string)
function generateMockVRF(): string {
  const randomHex = Array.from({ length: 64 }, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
  return `0x${randomHex}`;
}

// Simulate delay for async operations
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface MockRequestResult {
  requestId: string;
  txHash: string;
}

export interface MockRequestStatus {
  id: string;
  requester: string;
  fulfilled: boolean;
  randomnessValue?: string;
  timestamp: number;
}

// In-memory storage for mock requests
const mockRequests = new Map<string, MockRequestStatus>();

/**
 * Mock FeeCollector.requestRandomnessFor()
 * Simulates requesting randomness from FeeCollector
 */
export async function mockRequestRandomness(
  tierId: number = 1,
  requester: string = "0xMockUser"
): Promise<MockRequestResult> {
  await delay(1000); // Simulate network delay
  
  const requestId = `0x${Math.floor(Math.random() * 1000000000).toString(16)}`;
  const txHash = `0x${Array.from({ length: 64 }, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join('')}`;
  
  // Store request as pending
  mockRequests.set(requestId, {
    id: requestId,
    requester,
    fulfilled: false,
    timestamp: Date.now(),
  });
  
  console.log('🎲 Mock: Requested randomness', { requestId, tierId, requester });
  
  return { requestId, txHash };
}

/**
 * Mock checking if randomness is fulfilled
 * Simulates checking FeeCollector.requests(requestId)
 */
export async function mockCheckRequestStatus(requestId: string): Promise<MockRequestStatus | null> {
  await delay(500);
  
  const request = mockRequests.get(requestId);
  if (!request) {
    return null;
  }
  
  // Simulate fulfillment after 3-5 seconds
  const timeSinceRequest = Date.now() - request.timestamp;
  if (!request.fulfilled && timeSinceRequest > 3000) {
    request.fulfilled = true;
    request.randomnessValue = generateMockVRF();
    mockRequests.set(requestId, request);
    console.log('✅ Mock: Randomness fulfilled', { requestId, randomness: request.randomnessValue });
  }
  
  return request;
}

/**
 * Mock RouletteGame.requestSpin()
 */
export async function mockRouletteRequestSpin(): Promise<MockRequestResult> {
  return mockRequestRandomness(1, "0xRoulettePlayer");
}

/**
 * Mock RouletteGame.completeSpin()
 */
export async function mockRouletteCompleteSpin(
  requestId: string
): Promise<{ result: number; color: string; vrfSeed: string }> {
  await delay(1000);
  
  const request = await mockCheckRequestStatus(requestId);
  if (!request || !request.fulfilled || !request.randomnessValue) {
    throw new Error('Randomness not yet fulfilled');
  }
  
  // Generate result from VRF (0-36)
  const seed = BigInt(request.randomnessValue);
  const result = Number(seed % BigInt(37));
  
  // Determine color
  const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
  let color = "black";
  if (result === 0) {
    color = "green";
  } else if (redNumbers.includes(result)) {
    color = "red";
  }
  
  return {
    result,
    color,
    vrfSeed: request.randomnessValue,
  };
}

/**
 * Mock DungeonCrawler.createCharacter()
 */
export async function mockCreateCharacter(): Promise<{
  requestId: string;
  characterId: string;
}> {
  const result = await mockRequestRandomness(1, "0xDungeonPlayer");
  // Generate a mock characterId (sequential number)
  const characterId = Math.floor(Math.random() * 1000000).toString();
  return {
    requestId: result.requestId,
    characterId,
  };
}

/**
 * Mock DungeonCrawler.finalizeCharacter()
 */
export async function mockFinalizeCharacter(requestId: string): Promise<{
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
  await delay(1000);
  
  const request = await mockCheckRequestStatus(requestId);
  if (!request || !request.fulfilled || !request.randomnessValue) {
    throw new Error('Randomness not yet fulfilled');
  }
  
  const seed = BigInt(request.randomnessValue);
  const classIndex = Number(seed % BigInt(4)); // 0-3 for Warrior, Mage, Rogue, Cleric
  
  // Generate stats from VRF seed (3-18 range)
  const strength = Number((seed % BigInt(16)) + BigInt(3));
  const dexterity = Number(((seed >> BigInt(8)) % BigInt(16)) + BigInt(3));
  const intelligence = Number(((seed >> BigInt(16)) % BigInt(16)) + BigInt(3));
  const wisdom = Number(((seed >> BigInt(24)) % BigInt(16)) + BigInt(3));
  const constitution = Number(((seed >> BigInt(32)) % BigInt(16)) + BigInt(3));
  const charisma = Number(((seed >> BigInt(40)) % BigInt(16)) + BigInt(3));
  
  // Calculate health based on class and constitution (matching contract logic)
  let baseHealth = 20;
  if (classIndex === 0) baseHealth = 30; // Warrior
  if (classIndex === 3) baseHealth = 25; // Cleric
  const maxHealth = baseHealth + (constitution * 2);
  
  // Generate wealth (10-50 range, matching contract)
  const wealth = 10 + Number((seed >> BigInt(48)) % BigInt(41));
  
  // Generate characterId from requestId (use first 8 chars as hex number)
  const characterId = parseInt(requestId.slice(2, 10) || "0", 16);
  
  return {
    characterId,
    class: classIndex,
    strength,
    dexterity,
    intelligence,
    wisdom,
    constitution,
    charisma,
    health: maxHealth,
    maxHealth,
    wealth,
    creationSeed: request.randomnessValue,
  };
}

/**
 * Mock DungeonCrawler.startAdventure()
 */
export async function mockStartAdventure(): Promise<MockRequestResult> {
  return mockRequestRandomness(1, "0xDungeonPlayer");
}

/**
 * Mock DungeonCrawler.rollD20()
 */
export async function mockRollD20(requestId: string): Promise<{
  roll: number;
  event: string;
  seed: string;
}> {
  await delay(1000);
  
  const request = await mockCheckRequestStatus(requestId);
  if (!request || !request.fulfilled || !request.randomnessValue) {
    throw new Error('Randomness not yet fulfilled');
  }
  
  // Generate d20 roll from VRF (1-20)
  const seed = BigInt(request.randomnessValue);
  const roll = Number((seed % BigInt(20)) + BigInt(1));
  
  // Determine event based on roll
  let event = '';
  if (roll >= 18) {
    event = 'Critical Success! You find treasure!';
  } else if (roll >= 15) {
    event = 'Success! You defeat the monster!';
  } else if (roll >= 10) {
    event = 'Partial success. You take some damage.';
  } else if (roll >= 5) {
    event = 'Failure. You take damage!';
  } else {
    event = 'Critical Failure! You take heavy damage!';
  }
  
  return {
    roll,
    event,
    seed: request.randomnessValue,
  };
}

/**
 * Mock DungeonCrawler.continueAdventure()
 */
export async function mockContinueAdventure(): Promise<MockRequestResult> {
  return mockRequestRandomness(1, "0xDungeonPlayer");
}

/**
 * Poll for request fulfillment (simulates waiting for server)
 */
export async function pollForFulfillment(
  requestId: string,
  maxAttempts: number = 20,
  intervalMs: number = 1000
): Promise<MockRequestStatus> {
  for (let i = 0; i < maxAttempts; i++) {
    const status = await mockCheckRequestStatus(requestId);
    if (status && status.fulfilled) {
      return status;
    }
    await delay(intervalMs);
  }
  throw new Error('Request not fulfilled within timeout');
}

/**
 * Mock Enhanced DungeonCrawler.startInteraction(characterId, interactionType)
 * Matches contract signature: startInteraction(uint256 _characterId, InteractionType _interactionType)
 */
export async function mockStartInteraction(characterId: number | string, interactionType: number): Promise<MockRequestResult> {
  // In real contract, characterId is uint256, but for mocks we accept string or number
  return mockRequestRandomness(1, `0xDungeonPlayer_${characterId}`);
}

/**
 * Mock Enhanced DungeonCrawler.completeInteraction()
 * Matches DungeonCrawler.sol contract logic exactly
 */
export async function mockCompleteInteraction(
  requestId: string,
  interactionType: number,
  character: {
    strength: number;
    dexterity: number;
    intelligence: number;
    charisma: number;
    actionCount?: number; // Optional, defaults to 0
  }
): Promise<{
  success: boolean;
  healthChange: number;
  wealthChange: number;
  outcome: string;
  actionCount: number;
  vrfSeed: string;
}> {
  await delay(1000);
  
  const request = await mockCheckRequestStatus(requestId);
  if (!request || !request.fulfilled || !request.randomnessValue) {
    throw new Error('Randomness not yet fulfilled');
  }
  
  const seed = BigInt(request.randomnessValue);
  const roll = Number(seed % BigInt(100)); // 0-99 roll
  
  // Base success rate depends on interaction type and relevant stat
  // Matches contract: baseSuccessRate = 50
  let baseSuccessRate = 50;
  
  // Adjust success rate based on relevant stat - matches contract logic
  // Contract checks: interactionType == InteractionType.Combat || uint256(interactionType) % 7 == 0
  // Since enum values are sequential, we can use % 7
  if (interactionType === 0 || interactionType % 7 === 0) { // Combat types
    baseSuccessRate += character.strength * 2; // STR affects combat
  } else if (interactionType === 13 || interactionType === 14 || interactionType % 7 === 3) { // Stealth types (Lockpick, Stealth)
    baseSuccessRate += character.dexterity * 2; // DEX affects stealth
  } else if (interactionType === 14 || interactionType === 3 || interactionType % 7 === 5) { // Magic types (Magic, Puzzle)
    baseSuccessRate += character.intelligence * 2; // INT affects magic
  } else if (interactionType === 4 || interactionType === 11 || interactionType % 7 === 6) { // Social types (Merchant, Blessing)
    baseSuccessRate += character.charisma * 2; // CHA affects social
  }
  
  // Cap success rate - matches contract
  if (baseSuccessRate > 95) baseSuccessRate = 95;
  if (baseSuccessRate < 5) baseSuccessRate = 5;
  
  const success = roll < baseSuccessRate;
  
  // Determine outcomes based on success/failure and interaction type - matches contract exactly
  let healthChange = 0;
  let wealthChange = 0;
  let outcome = '';
  
  // Use shifted seed for variation (matches contract: seed >> 8)
  const shiftedSeed = seed >> BigInt(8);
  
  if (success) {
    // Success outcomes - matches contract logic
    if (interactionType === 0 || interactionType % 7 === 0) { // Combat
      healthChange = 0; // No damage on success
      wealthChange = Number(shiftedSeed % BigInt(20)) + 5; // 5-24 gold reward
      outcome = 'Victory! You defeated the enemy and found gold.';
    } else if (interactionType === 1 || interactionType % 7 === 1) { // Treasure
      healthChange = 0;
      wealthChange = Number(shiftedSeed % BigInt(50)) + 10; // 10-59 gold
      outcome = 'You found a treasure chest!';
    } else if (interactionType === 9 || interactionType % 7 === 4) { // Healing
      healthChange = Number(shiftedSeed % BigInt(20)) + 10; // 10-29 healing
      wealthChange = 0;
      outcome = 'You found a healing potion!';
    } else if (interactionType === 4 || interactionType % 7 === 5) { // Merchant
      healthChange = 0;
      wealthChange = Number(shiftedSeed % BigInt(30)) + 5; // 5-34 gold
      outcome = 'The merchant gave you a good deal!';
    } else {
      healthChange = Number(shiftedSeed % BigInt(10)) + 5; // 5-14 healing
      wealthChange = Number(shiftedSeed % BigInt(15)) + 5; // 5-19 gold
      outcome = 'Success! You gained rewards.';
    }
  } else {
    // Failure outcomes - matches contract logic
    // Contract uses uint256(-int256(...)) for negative values
    if (interactionType === 0 || interactionType % 7 === 0) { // Combat
      healthChange = -(Number(shiftedSeed % BigInt(15)) + 5); // 5-19 damage
      wealthChange = 0;
      outcome = 'You were defeated! You took damage.';
    } else if (interactionType === 2 || interactionType % 7 === 2) { // Trap
      healthChange = -(Number(shiftedSeed % BigInt(20)) + 10); // 10-29 damage
      wealthChange = 0;
      outcome = 'You triggered a trap!';
    } else if (interactionType === 10 || interactionType % 7 === 4) { // Curse
      healthChange = -(Number(shiftedSeed % BigInt(10)) + 5); // 5-14 damage
      wealthChange = -(Number(shiftedSeed % BigInt(10)) + 5); // 5-14 gold loss
      outcome = 'You were cursed! Lost health and gold.';
    } else {
      healthChange = -(Number(shiftedSeed % BigInt(10)) + 3); // 3-12 damage
      wealthChange = 0;
      outcome = 'Failure! You took some damage.';
    }
  }
  
  // actionCount is incremented after interaction (contract increments it)
  const currentActionCount = character.actionCount || 0;
  const newActionCount = currentActionCount + 1;
  
  return {
    success,
    healthChange,
    wealthChange,
    outcome,
    actionCount: newActionCount,
    vrfSeed: request.randomnessValue,
  };
}

/**
 * Mock FishingGame.goFishing()
 */
export async function mockGoFishing(): Promise<MockRequestResult> {
  return mockRequestRandomness(1, "0xFishingPlayer");
}

/**
 * Mock FishingGame.catchFish()
 * Matches FishingGame.sol contract logic exactly
 */
export async function mockCatchFish(
  requestId: string,
  randomnessSeed: string
): Promise<{
  fishType: number;
  fishName: string;
  size: number;
  value: number;
}> {
  await delay(1000);
  
  const request = await mockCheckRequestStatus(requestId);
  if (!request || !request.fulfilled || !request.randomnessValue) {
    throw new Error('Randomness not yet fulfilled');
  }
  
  // Generate fish from VRF seed - matches contract logic exactly
  const seed = BigInt(randomnessSeed);
  const randomValue = seed;
  
  // Fish types: 0=Goldfish, 1=Trout, 2=Salmon, 3=Tuna, 4=Shark, 5=Whale
  const fishTypes = [
    { name: "Goldfish", type: 0 },
    { name: "Trout", type: 1 },
    { name: "Salmon", type: 2 },
    { name: "Tuna", type: 3 },
    { name: "Shark", type: 4 },
    { name: "Whale", type: 5 },
  ];
  
  // Fish weights from contract: [50, 30, 15, 4, 1, 1]
  // Total weight = 101 (ensures all fish types including WHALE are catchable)
  const fishWeights = [50, 30, 15, 4, 1, 1];
  const totalWeight = 101;
  const randomFish = Number(randomValue % BigInt(totalWeight));
  
  // Determine fish type using cumulative weights (matches contract logic)
  let fishType = 0; // Default to Goldfish
  let cumulativeWeight = 0;
  for (let i = 0; i < fishWeights.length; i++) {
    cumulativeWeight += fishWeights[i];
    if (randomFish < cumulativeWeight) {
      fishType = i;
      break;
    }
  }
  
  const selectedFish = fishTypes[fishType];
  
  // Generate size (50-300 cm) - matches contract: 50 + (randomValue % 251)
  const size = 50 + Number(randomValue % BigInt(251));
  
  // Calculate value - matches contract: baseValue * size * sizeMultiplier / 100
  // Base values from contract: Goldfish=1, Trout=5, Salmon=15, Tuna=50, Shark=200, Whale=1000
  const baseValues = [1, 5, 15, 50, 200, 1000];
  const baseValue = baseValues[fishType];
  const sizeMultiplier = size > 150 ? 2 : 1; // Bigger fish = more valuable
  const value = Math.floor((baseValue * size * sizeMultiplier) / 100);
  
  return {
    fishType: selectedFish.type,
    fishName: selectedFish.name,
    size,
    value,
  };
}

/**
 * Clear all mock requests (for testing/reset)
 */
export function clearMockRequests(): void {
  mockRequests.clear();
}

