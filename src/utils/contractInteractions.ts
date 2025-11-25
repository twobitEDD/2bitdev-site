/**
 * Real Contract Interactions
 * 
 * These functions interact with actual smart contracts on-chain.
 * They check playtest mode and fall back to mocks if needed.
 */

import { ethers } from "ethers";
import { contractsConfig } from "@config/contracts";

export interface ContractRequestResult {
  requestId: string;
  txHash: string;
  spinId?: string; // Optional, for RouletteGame
  interactionId?: string; // Optional, for DungeonCrawler interactions
}

export interface ContractRequestStatus {
  id: string;
  requester: string;
  fulfilled: boolean;
  randomnessValue?: string;
  timestamp: number;
}

/**
 * Get contract instance for FishingGame
 */
export function getFishingGameContract(
  signer: ethers.JsonRpcSigner,
  network: "base" | "baseSepolia" = "baseSepolia"
): ethers.Contract {
  const address = contractsConfig[network]?.fishingGame;
  if (!address) {
    throw new Error(`FishingGame not deployed on ${network}`);
  }

  // Minimal ABI for FishingGame functions we need
  const abi = [
    "function goFishing() external returns (uint256)",
    "function catchFish(uint256 _requestId) external",
    "function getPlayerCatchCount(address player) external view returns (uint256)",
    "function getPlayerCatch(address player, uint256 index) external view returns (uint8 fishType, uint256 size, uint256 value, uint256 timestamp, string memory fishName)",
    "event FishingTripStarted(address indexed player, uint256 requestId)",
    "event FishCaught(address indexed player, uint8 fishType, uint256 size, uint256 value)",
  ];

  return new ethers.Contract(address, abi, signer);
}

/**
 * Get contract instance for SRAND token
 */
export function getSRANDContract(
  signer: ethers.JsonRpcSigner,
  network: "base" | "baseSepolia" = "baseSepolia"
): ethers.Contract {
  const address = contractsConfig[network]?.srand;
  if (!address) {
    throw new Error(`SRAND not deployed on ${network}`);
  }

  const abi = [
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function allowance(address owner, address spender) external view returns (uint256)",
    "function balanceOf(address account) external view returns (uint256)",
  ];

  return new ethers.Contract(address, abi, signer);
}

/**
 * Get contract instance for FeeCollector
 */
export function getFeeCollectorContract(
  signer: ethers.JsonRpcSigner,
  network: "base" | "baseSepolia" = "baseSepolia"
): ethers.Contract {
  const address = contractsConfig[network]?.feeCollector;
  if (!address) {
    throw new Error(`FeeCollector not deployed on ${network}`);
  }

  const abi = [
    "function requests(uint256 requestId) external view returns (uint256 id, address requester, uint256 tierId, uint256 feeAmount, uint256 timestamp, uint256 deadline, bool fulfilled, bytes32 randomnessValue)",
  ];

  return new ethers.Contract(address, abi, signer);
}

/**
 * Check and approve SRAND tokens if needed
 * Uses the proven method from serv-random-frontend
 */
export async function ensureSRANDApproval(
  signer: ethers.JsonRpcSigner,
  network: "base" | "baseSepolia" = "baseSepolia",
  amount: bigint = ethers.parseEther("10") // Approve 10 SRAND by default (enough for multiple requests)
): Promise<void> {
  const feeCollector = contractsConfig[network]?.feeCollector;
  if (!feeCollector) {
    throw new Error(`FeeCollector not configured for ${network}`);
  }

  const srandAddress = contractsConfig[network]?.srand;
  if (!srandAddress) {
    throw new Error(`SRAND contract address not configured for ${network}. Please check contracts config.`);
  }

  const address = await signer.getAddress();
  
  // Log contract addresses for debugging
  console.log('SRAND Approval Debug:', {
    network,
    srandAddress,
    feeCollector,
    userAddress: address,
    amount: ethers.formatEther(amount),
  });
  
  // Verify contract exists by checking code
  try {
    const provider = signer.provider;
    const code = await provider.getCode(srandAddress);
    if (code === '0x' || code === '0x0') {
      throw new Error(`SRAND contract does not exist at ${srandAddress} on ${network}. Please verify the contract address.`);
    }
    console.log('✅ SRAND contract verified at:', srandAddress);
  } catch (codeError: any) {
    throw new Error(`Failed to verify SRAND contract: ${codeError.message}. Contract address: ${srandAddress}`);
  }

  const srand = getSRANDContract(signer, network);
  
  // Check current allowance
  let allowance;
  try {
    allowance = await srand.allowance(address, feeCollector);
    console.log('Current allowance:', ethers.formatEther(allowance), 'SRAND');
  } catch (allowanceError: any) {
    console.error('Error checking allowance:', allowanceError);
    throw new Error(`Failed to check SRAND allowance: ${allowanceError.message || allowanceError.toString()}. Please verify the SRAND contract at ${srandAddress}.`);
  }
  
  if (allowance >= amount) {
    // Already approved enough
    console.log('✅ Sufficient allowance already exists');
    return;
  }

  // First, verify the token contract exists and user has balance
  let tokenBalance;
  try {
    tokenBalance = await srand.balanceOf(address);
    console.log('Token balance check:', ethers.formatEther(tokenBalance), 'SRAND');
  } catch (balanceError: any) {
    console.error('Error checking token balance:', balanceError);
    throw new Error(`Failed to verify SRAND token: ${balanceError.message || balanceError.toString()}. Please check that the token contract exists at ${srandAddress}.`);
  }

  // Check if user has sufficient balance
  if (tokenBalance < amount) {
    throw new Error(`Insufficient SRAND balance. You have ${ethers.formatEther(tokenBalance)} SRAND, but need ${ethers.formatEther(amount)} SRAND.`);
  }

  // Estimate gas before sending
  let gasEstimate;
  try {
    console.log('Estimating gas for approval transaction...');
    console.log('Approving to:', feeCollector);
    console.log('Amount:', ethers.formatEther(amount), 'SRAND');
    console.log('SRAND contract address:', srandAddress);
    
    gasEstimate = await srand.approve.estimateGas(feeCollector, amount);
    console.log('Gas estimate:', gasEstimate.toString());
  } catch (estimateError: any) {
    console.error('Gas estimation failed:', estimateError);
    console.error('Error details:', {
      code: estimateError?.code,
      reason: estimateError?.reason,
      shortMessage: estimateError?.shortMessage,
      message: estimateError?.message,
      data: estimateError?.data,
      error: estimateError?.error,
    });
    
    const errorMsg = estimateError.reason || estimateError.shortMessage || estimateError.message || estimateError.toString();
    
    // Try to decode custom error if available
    let revertReason = '';
    if (estimateError?.error?.data || estimateError?.data) {
      try {
        const revertData = estimateError.error?.data || estimateError.data;
        console.log('Revert data:', revertData);
        
        if (revertData && typeof revertData === 'string' && revertData.startsWith('0x')) {
          // Try to decode Error(string) selector (0x08c379a0)
          if (revertData.startsWith('0x08c379a0')) {
            const reason = ethers.AbiCoder.defaultAbiCoder().decode(['string'], '0x' + revertData.slice(10));
            revertReason = ` Revert reason: ${reason[0]}`;
          } else {
            // Custom error - try to decode common ERC20 errors
            const errorSelector = revertData.slice(0, 10);
            let customErrorMsg = '';
            
            // Common ERC20 custom errors (first 4 bytes)
            if (errorSelector === '0xfb8f41b2') {
              customErrorMsg = ' (likely InsufficientBalance or InsufficientAllowance)';
            } else if (errorSelector === '0x1e4fbdf7') {
              customErrorMsg = ' (TransferFromZeroAddress)';
            } else if (errorSelector === '0x90b8ec18') {
              customErrorMsg = ' (TransferToZeroAddress)';
            } else {
              customErrorMsg = ` (custom error selector: ${errorSelector})`;
            }
            
            revertReason = customErrorMsg;
            console.log('Custom error data:', revertData);
            console.log('Custom error selector:', errorSelector);
          }
        }
      } catch (decodeError) {
        console.error('Error decoding revert data:', decodeError);
      }
    }
    
    throw new Error(`Transaction would fail: ${errorMsg}${revertReason}. Please check that the SRAND token contract exists at ${srandAddress} and you have sufficient balance.`);
  }

  // Send approval with gas limit (add 20% buffer)
  try {
    const gasLimit = (gasEstimate * BigInt(120)) / BigInt(100);
    console.log('Sending approval transaction with gas limit:', gasLimit.toString());
    
    const approveTx = await srand.approve(feeCollector, amount, {
      gasLimit: gasLimit
    });
    
    console.log('✅ Approve transaction sent:', approveTx.hash);
    console.log('⏳ Waiting for approval confirmation...');
    
    const approveReceipt = await approveTx.wait();
    console.log('✅ SRAND approval confirmed! Block:', approveReceipt.blockNumber);
    console.log('Gas used:', approveReceipt.gasUsed.toString());
    
    // Wait a moment for state to update
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Re-check allowance after approval
    const newAllowance = await srand.allowance(address, feeCollector);
    console.log('New allowance:', ethers.formatEther(newAllowance), 'SRAND');
    
    if (newAllowance < amount) {
      throw new Error(`Approval completed but allowance is still insufficient. Expected at least ${ethers.formatEther(amount)} SRAND, got ${ethers.formatEther(newAllowance)} SRAND.`);
    }
  } catch (approveError: any) {
    console.error('Approval transaction error:', approveError);
    
    // Handle user rejection
    if (approveError?.code === 'ACTION_REJECTED' || approveError?.code === 4001 || 
        approveError?.message?.includes('user rejected') || approveError?.message?.includes('denied')) {
      throw new Error('Transaction rejected. Please approve the transaction to continue.');
    }
    
    // Handle RPC errors
    if (approveError?.code === 'UNKNOWN_ERROR' || approveError?.code === -32603) {
      const errorDetails = approveError?.error?.message || approveError?.message || approveError?.toString();
      
      // Try to extract revert reason if available
      let revertReason = '';
      if (approveError?.error?.data || approveError?.data) {
        try {
          const revertData = approveError.error?.data || approveError.data;
          if (revertData && typeof revertData === 'string' && revertData.startsWith('0x')) {
            if (revertData.startsWith('0x08c379a0')) {
              // Error(string) selector
              const reason = ethers.AbiCoder.defaultAbiCoder().decode(['string'], '0x' + revertData.slice(10));
              revertReason = ` Revert reason: ${reason[0]}`;
            } else {
              // Custom error
              revertReason = ` Custom error: ${revertData.slice(0, 10)}`;
            }
          }
        } catch (decodeError) {
          // Ignore decode errors
        }
      }
      
      throw new Error(`Transaction failed: ${errorDetails}${revertReason}. Please check that the SRAND token contract exists and you have sufficient balance.`);
    }
    
    // Handle other errors with better messages
    const errorMsg = approveError?.reason || approveError?.shortMessage || approveError?.message || approveError?.toString();
    throw new Error(`Approval failed: ${errorMsg}`);
  }
}

/**
 * Get spin ID from request ID (for RouletteGame Pattern 1)
 * We need to track the mapping from requestId to spinId
 */
export async function getSpinIdFromRequestId(
  provider: ethers.BrowserProvider,
  requestId: string,
  network: "base" | "baseSepolia" = "baseSepolia"
): Promise<bigint | null> {
  const address = contractsConfig[network]?.rouletteGame;
  if (!address) {
    return null;
  }

  const abi = [
    "function requestIdToSpinId(uint256 requestId) external view returns (uint256)",
  ];

  try {
    const contract = new ethers.Contract(address, abi, provider);
    const spinId = await contract.requestIdToSpinId(requestId);
    return spinId;
  } catch {
    return null;
  }
}

/**
 * Get contract instance for RouletteGame
 */
export function getRouletteGameContract(
  signer: ethers.JsonRpcSigner,
  network: "base" | "baseSepolia" = "baseSepolia"
): ethers.Contract {
  const address = contractsConfig[network]?.rouletteGame;
  if (!address) {
    throw new Error(`RouletteGame not deployed on ${network}`);
  }

  const abi = [
    "function requestSpin() external returns (uint256)",
    "function getSpin(uint256 _spinId) external view returns (address player, uint8 result, string memory color, bool isEven, bytes32 vrfSeed, uint256 timestamp)",
    "function spinCounter() external view returns (uint256)",
    "event SpinRequested(address indexed player, uint256 indexed spinId, uint256 requestId)",
    "event SpinCompleted(uint256 indexed spinId, address indexed player, uint8 result, string color, bytes32 vrfSeed)",
  ];

  return new ethers.Contract(address, abi, signer);
}

/**
 * Real RouletteGame.requestSpin() - calls actual contract
 * Pattern 1: Automatic callback - spin completes automatically when VRF is fulfilled
 */
export async function realRequestSpin(
  signer: ethers.JsonRpcSigner,
  network: "base" | "baseSepolia" = "baseSepolia"
): Promise<ContractRequestResult> {
  // Ensure SRAND approval
  await ensureSRANDApproval(signer, network, ethers.parseEther("10"));

  const rouletteGame = getRouletteGameContract(signer, network);
  
  // Call requestSpin()
  const tx = await rouletteGame.requestSpin();
  const receipt = await tx.wait();

  // Get spinId and requestId from event
  const event = receipt.logs.find((log: any) => {
    try {
      const parsed = rouletteGame.interface.parseLog(log);
      return parsed?.name === "SpinRequested";
    } catch {
      return false;
    }
  });

  if (!event) {
    throw new Error("SpinRequested event not found");
  }

  const parsed = rouletteGame.interface.parseLog(event);
  const spinId = parsed?.args[1]; // Second arg is spinId
  const requestId = parsed?.args[2]; // Third arg is requestId

  return {
    spinId: spinId.toString(),
    requestId: requestId.toString(),
    txHash: receipt.hash,
  };
}

/**
 * Get spin result from RouletteGame contract
 * Note: For Pattern 1, the spin completes automatically via receiveRandomness callback
 * We need to poll for the SpinCompleted event
 */
export async function getSpinResult(
  provider: ethers.BrowserProvider,
  spinId: bigint,
  network: "base" | "baseSepolia" = "baseSepolia"
): Promise<{
  result: number;
  color: string;
  vrfSeed: string;
  isEven: boolean;
}> {
  const address = contractsConfig[network]?.rouletteGame;
  if (!address) {
    throw new Error(`RouletteGame not deployed on ${network}`);
  }

  const abi = [
    "function getSpin(uint256 _spinId) external view returns (address player, uint8 result, string memory color, bool isEven, bytes32 vrfSeed, uint256 timestamp)",
  ];

  const contract = new ethers.Contract(address, abi, provider);
  const spin = await contract.getSpin(spinId);

  // Check if spin is completed (result != 255)
  // Also check if vrfSeed is zero (not set yet)
  if (spin.result === 255 || spin.vrfSeed === ethers.ZeroHash || spin.vrfSeed === "0x0000000000000000000000000000000000000000000000000000000000000000") {
    throw new Error("Spin not yet completed");
  }

  return {
    result: Number(spin.result),
    color: spin.color,
    vrfSeed: spin.vrfSeed,
    isEven: spin.isEven,
  };
}

/**
 * Poll for spin completion (Pattern 1 - automatic callback)
 */
export async function pollForSpinCompletion(
  provider: ethers.BrowserProvider,
  spinId: bigint,
  network: "base" | "baseSepolia" = "baseSepolia",
  maxAttempts: number = 30,
  intervalMs: number = 2000
): Promise<{
  result: number;
  color: string;
  vrfSeed: string;
  isEven: boolean;
}> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const spin = await getSpinResult(provider, spinId, network);
      return spin;
    } catch (error: any) {
      if (error.message?.includes("not yet completed")) {
        // Still waiting, continue polling
        await new Promise((resolve) => setTimeout(resolve, intervalMs));
        continue;
      }
      throw error;
    }
  }
  throw new Error("Spin not completed within timeout");
}

/**
 * Get contract instance for DungeonCrawler
 */
export function getDungeonCrawlerContract(
  signer: ethers.JsonRpcSigner,
  network: "base" | "baseSepolia" = "baseSepolia"
): ethers.Contract {
  const address = contractsConfig[network]?.dungeonCrawler;
  if (!address) {
    throw new Error(`DungeonCrawler not deployed on ${network}`);
  }

  const abi = [
    "function createCharacter() external returns (uint256)",
    "function finalizeCharacter(uint256 _requestId) external",
    "function startInteraction(uint256 _characterId, uint8 _interactionType) external returns (uint256)",
    "function completeInteraction(uint256 _interactionId) external",
    "function getCharacter(uint256 _characterId) external view returns (address player, uint8 class, uint8 strength, uint8 dexterity, uint8 intelligence, uint8 wisdom, uint8 constitution, uint8 charisma, uint256 level, uint256 experience, uint256 health, uint256 maxHealth, uint256 wealth, bytes32 creationSeed, bool alive, uint256 actionCount, uint8 status, uint256 createdAt)",
    "function getInteraction(uint256 _interactionId) external view returns (address player, uint256 characterId, uint256 requestId, uint8 interactionType, bytes32 vrfSeed, bool completed, bool success, uint256 healthChange, uint256 wealthChange, string memory outcome, uint256 timestamp)",
    "function playerCharacters(address player) external view returns (uint256[] memory)",
    "function characterCounter() external view returns (uint256)",
    "event CharacterCreationStarted(address indexed player, uint256 indexed characterId, uint256 requestId)",
    "event CharacterCreated(address indexed player, uint256 indexed characterId, uint8 class, uint8 strength, uint8 dexterity, uint8 intelligence, uint256 health, uint256 wealth, uint256 createdAt)",
    "event InteractionStarted(address indexed player, uint256 indexed characterId, uint256 indexed interactionId, uint8 interactionType, uint256 requestId)",
    "event InteractionCompleted(uint256 indexed interactionId, address indexed player, uint256 indexed characterId, uint8 interactionType, bool success, uint256 healthChange, uint256 wealthChange, uint256 actionCount, string outcome, bytes32 vrfSeed)",
  ];

  return new ethers.Contract(address, abi, signer);
}

/**
 * Real DungeonCrawler.createCharacter() - calls actual contract
 */
export async function realCreateCharacter(
  signer: ethers.JsonRpcSigner,
  network: "base" | "baseSepolia" = "baseSepolia"
): Promise<ContractRequestResult> {
  // Ensure SRAND approval
  await ensureSRANDApproval(signer, network, ethers.parseEther("10"));

  const dungeonCrawler = getDungeonCrawlerContract(signer, network);
  
  // Call createCharacter()
  const tx = await dungeonCrawler.createCharacter();
  const receipt = await tx.wait();

  // Get characterId and requestId from event
  const event = receipt.logs.find((log: any) => {
    try {
      const parsed = dungeonCrawler.interface.parseLog(log);
      return parsed?.name === "CharacterCreationStarted";
    } catch {
      return false;
    }
  });

  if (!event) {
    throw new Error("CharacterCreationStarted event not found");
  }

  const parsed = dungeonCrawler.interface.parseLog(event);
  const requestId = parsed?.args[2]; // Third arg is requestId
  const characterId = parsed?.args[1]; // Second arg is characterId

  return {
    requestId: requestId.toString(),
    txHash: receipt.hash,
  };
}

/**
 * Real DungeonCrawler.finalizeCharacter() - calls actual contract
 */
export async function realFinalizeCharacter(
  signer: ethers.JsonRpcSigner,
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
  const dungeonCrawler = getDungeonCrawlerContract(signer, network);
  
  // Call finalizeCharacter()
  const tx = await dungeonCrawler.finalizeCharacter(requestId);
  const receipt = await tx.wait();

  // Get character details from event
  const event = receipt.logs.find((log: any) => {
    try {
      const parsed = dungeonCrawler.interface.parseLog(log);
      return parsed?.name === "CharacterCreated";
    } catch {
      return false;
    }
  });

  if (!event) {
    throw new Error("CharacterCreated event not found");
  }

  const parsed = dungeonCrawler.interface.parseLog(event);
  const characterId = Number(parsed?.args[1]); // characterId
  const classNum = Number(parsed?.args[2]); // class
  const strength = Number(parsed?.args[3]);
  const dexterity = Number(parsed?.args[4]);
  const intelligence = Number(parsed?.args[5]);
  const health = Number(parsed?.args[6]);
  const wealth = Number(parsed?.args[7]);

  // Get full character details from contract
  const character = await dungeonCrawler.getCharacter(characterId);

  return {
    characterId,
    class: classNum,
    strength,
    dexterity,
    intelligence,
    wisdom: Number(character.wisdom),
    constitution: Number(character.constitution),
    charisma: Number(character.charisma),
    health,
    maxHealth: Number(character.maxHealth),
    wealth,
    creationSeed: character.creationSeed,
  };
}

/**
 * Real DungeonCrawler.startInteraction() - calls actual contract
 */
export async function realStartInteraction(
  signer: ethers.JsonRpcSigner,
  characterId: bigint,
  interactionType: number,
  network: "base" | "baseSepolia" = "baseSepolia"
): Promise<ContractRequestResult> {
  // Ensure SRAND approval
  await ensureSRANDApproval(signer, network, ethers.parseEther("10"));

  const dungeonCrawler = getDungeonCrawlerContract(signer, network);
  
  // Call startInteraction()
  const tx = await dungeonCrawler.startInteraction(characterId, interactionType);
  const receipt = await tx.wait();

  // Get interactionId and requestId from event
  const event = receipt.logs.find((log: any) => {
    try {
      const parsed = dungeonCrawler.interface.parseLog(log);
      return parsed?.name === "InteractionStarted";
    } catch {
      return false;
    }
  });

  if (!event) {
    throw new Error("InteractionStarted event not found");
  }

  const parsed = dungeonCrawler.interface.parseLog(event);
  const interactionId = parsed?.args[2]; // Third arg is interactionId
  const requestId = parsed?.args[4]; // Fifth arg is requestId

  return {
    requestId: requestId.toString(),
    interactionId: interactionId.toString(),
    txHash: receipt.hash,
  };
}

/**
 * Real DungeonCrawler.completeInteraction() - calls actual contract
 */
export async function realCompleteInteraction(
  signer: ethers.JsonRpcSigner,
  interactionId: bigint,
  network: "base" | "baseSepolia" = "baseSepolia"
): Promise<{
  success: boolean;
  healthChange: number;
  wealthChange: number;
  outcome: string;
  vrfSeed: string;
  actionCount: number;
}> {
  const dungeonCrawler = getDungeonCrawlerContract(signer, network);
  
  // Call completeInteraction()
  const tx = await dungeonCrawler.completeInteraction(interactionId);
  const receipt = await tx.wait();

  // Get interaction details from event
  const event = receipt.logs.find((log: any) => {
    try {
      const parsed = dungeonCrawler.interface.parseLog(log);
      return parsed?.name === "InteractionCompleted";
    } catch {
      return false;
    }
  });

  if (!event) {
    throw new Error("InteractionCompleted event not found");
  }

  const parsed = dungeonCrawler.interface.parseLog(event);
  const success = parsed?.args[4]; // success
  const healthChange = Number(parsed?.args[5]); // healthChange (can be negative)
  const wealthChange = Number(parsed?.args[6]); // wealthChange (can be negative)
  const actionCount = Number(parsed?.args[7]); // actionCount
  const outcome = parsed?.args[8]; // outcome
  const vrfSeed = parsed?.args[9]; // vrfSeed

  return {
    success,
    healthChange,
    wealthChange,
    outcome,
    vrfSeed,
    actionCount,
  };
}

/**
 * Real FishingGame.goFishing() - calls actual contract
 */
export async function realGoFishing(
  signer: ethers.JsonRpcSigner,
  network: "base" | "baseSepolia" = "baseSepolia"
): Promise<ContractRequestResult> {
  // Ensure SRAND approval
  await ensureSRANDApproval(signer, network, ethers.parseEther("10"));

  const fishingGame = getFishingGameContract(signer, network);
  
  // Call goFishing()
  const tx = await fishingGame.goFishing();
  const receipt = await tx.wait();

  // Get requestId from event
  const event = receipt.logs.find((log: any) => {
    try {
      const parsed = fishingGame.interface.parseLog(log);
      return parsed?.name === "FishingTripStarted";
    } catch {
      return false;
    }
  });

  if (!event) {
    throw new Error("FishingTripStarted event not found");
  }

  const parsed = fishingGame.interface.parseLog(event);
  const requestId = parsed?.args[1]; // Second arg is requestId

  return {
    requestId: requestId.toString(),
    txHash: receipt.hash,
  };
}

/**
 * Real FishingGame.catchFish() - calls actual contract
 */
export async function realCatchFish(
  signer: ethers.JsonRpcSigner,
  requestId: string,
  network: "base" | "baseSepolia" = "baseSepolia"
): Promise<{
  fishType: number;
  fishName: string;
  size: number;
  value: number;
}> {
  const fishingGame = getFishingGameContract(signer, network);
  
  // Call catchFish()
  const tx = await fishingGame.catchFish(requestId);
  const receipt = await tx.wait();

  // Get fish details from event
  const event = receipt.logs.find((log: any) => {
    try {
      const parsed = fishingGame.interface.parseLog(log);
      return parsed?.name === "FishCaught";
    } catch {
      return false;
    }
  });

  if (!event) {
    throw new Error("FishCaught event not found");
  }

  const parsed = fishingGame.interface.parseLog(event);
  const fishType = Number(parsed?.args[1]); // fishType
  const size = Number(parsed?.args[2]); // size
  const value = Number(parsed?.args[3]); // value

  // Map fish type to name
  const fishNames = ["Goldfish", "Trout", "Salmon", "Tuna", "Shark", "Whale"];
  const fishName = fishNames[fishType] || "Unknown";

  return {
    fishType,
    fishName,
    size,
    value,
  };
}

/**
 * Check request status from FeeCollector
 */
export async function checkRequestStatus(
  provider: ethers.BrowserProvider,
  requestId: string,
  network: "base" | "baseSepolia" = "baseSepolia"
): Promise<ContractRequestStatus> {
  const feeCollector = contractsConfig[network]?.feeCollector;
  if (!feeCollector) {
    throw new Error(`FeeCollector not configured for ${network}`);
  }

  const abi = [
    "function requests(uint256 requestId) external view returns (uint256 id, address requester, uint256 tierId, uint256 feeAmount, uint256 timestamp, uint256 deadline, bool fulfilled, bytes32 randomnessValue)",
  ];

  const contract = new ethers.Contract(feeCollector, abi, provider);
  const request = await contract.requests(requestId);

  return {
    id: request.id.toString(),
    requester: request.requester,
    fulfilled: request.fulfilled,
    randomnessValue: request.randomnessValue !== ethers.ZeroHash ? request.randomnessValue : undefined,
    timestamp: Number(request.timestamp),
  };
}

/**
 * Poll for request fulfillment
 */
export async function pollForRealFulfillment(
  provider: ethers.BrowserProvider,
  requestId: string,
  network: "base" | "baseSepolia" = "baseSepolia",
  maxAttempts: number = 30,
  intervalMs: number = 2000
): Promise<ContractRequestStatus> {
  for (let i = 0; i < maxAttempts; i++) {
    const status = await checkRequestStatus(provider, requestId, network);
    if (status.fulfilled && status.randomnessValue) {
      return status;
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  throw new Error("Request not fulfilled within timeout");
}


