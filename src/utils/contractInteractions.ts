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
    "event Approval(address indexed owner, address indexed spender, uint256 value)",
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
  amount: bigint = ethers.parseEther("10"), // Approve 10 SRAND by default (enough for multiple requests)
  requiredAmount: bigint = ethers.parseEther("1") // Minimum required for one transaction (tier 1 fee)
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
  
  // Check if current allowance is sufficient for at least one transaction
  // This prevents re-approving when user has enough (even if less than the full amount)
  if (allowance >= requiredAmount) {
    // Already approved enough for at least one transaction
    console.log(`✅ Sufficient allowance already exists: ${ethers.formatEther(allowance)} SRAND (need at least ${ethers.formatEther(requiredAmount)} SRAND)`);
    
    // If allowance is less than requested amount but sufficient for transactions, optionally approve more
    // But don't fail if user doesn't want to approve more - they have enough for transactions
    if (allowance < amount) {
      console.log(`ℹ️ Current allowance (${ethers.formatEther(allowance)} SRAND) is sufficient for transactions but less than recommended (${ethers.formatEther(amount)} SRAND).`);
      // Don't force approval - user has enough for transactions
      // Return early to avoid unnecessary approval transaction
      return;
    } else {
      // Already have enough, no need to approve
      return;
    }
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
    
    // Verify approval via event logs (more reliable than querying allowance immediately)
    const approvalEvent = approveReceipt.logs.find((log: any) => {
      try {
        const parsed = srand.interface.parseLog(log);
        return parsed?.name === 'Approval';
      } catch {
        return false;
      }
    });
    
    if (approvalEvent) {
      const parsed = srand.interface.parseLog(approvalEvent);
      const approvedAmount = parsed?.args[2]; // Third arg is amount
      console.log('✅ Approval event found in receipt:', ethers.formatEther(approvedAmount), 'SRAND');
      
      // If event shows sufficient approval, we're good (even if RPC query is stale)
      if (approvedAmount >= requiredAmount) {
        console.log('✅ Approval confirmed via event - sufficient amount approved');
        return; // Success - don't need to query allowance
      }
    }
    
    // Fallback: Query allowance with retries (RPC might be stale)
    let newAllowance = BigInt(0);
    let retries = 0;
    const maxRetries = 5;
    
    while (retries < maxRetries && newAllowance < requiredAmount) {
      // Wait progressively longer for state to propagate
      const waitTime = Math.min(1000 * Math.pow(2, retries), 5000); // 1s, 2s, 4s, 5s, 5s
      if (retries > 0) {
        console.log(`⏳ Retrying allowance check (attempt ${retries + 1}/${maxRetries}) after ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
      
      try {
        // Query allowance (RPC may be stale, so we retry)
        newAllowance = await srand.allowance(address, feeCollector);
        console.log(`Allowance check (attempt ${retries + 1}):`, ethers.formatEther(newAllowance), 'SRAND');
        
        if (newAllowance >= requiredAmount) {
          console.log('✅ Allowance verified:', ethers.formatEther(newAllowance), 'SRAND');
          break;
        }
      } catch (queryError: any) {
        console.warn(`Allowance query failed (attempt ${retries + 1}):`, queryError.message);
      }
      
      retries++;
    }
    
    // Final check - if still insufficient, throw error
    if (newAllowance < requiredAmount) {
      // If we saw the approval event with sufficient amount, trust that over RPC query
      if (approvalEvent) {
        const parsed = srand.interface.parseLog(approvalEvent);
        const approvedAmount = parsed?.args[2];
        if (approvedAmount >= requiredAmount) {
          console.log('⚠️ RPC query shows 0 but Approval event confirms sufficient amount - trusting event');
          return; // Trust the event over stale RPC data
        }
      }
      
      throw new Error(`Approval completed but allowance is still insufficient. Expected at least ${ethers.formatEther(requiredAmount)} SRAND for transactions, got ${ethers.formatEther(newAllowance)} SRAND. This may be due to RPC caching - please try again in a few seconds.`);
    }
    
    // If we got less than requested but enough for transactions, that's fine
    if (newAllowance < amount) {
      console.log(`⚠️ Approved ${ethers.formatEther(newAllowance)} SRAND (less than requested ${ethers.formatEther(amount)} SRAND, but sufficient for transactions)`);
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
  const address = await signer.getAddress();
  const feeCollector = contractsConfig[network]?.feeCollector;
  const srandAddress = contractsConfig[network]?.srand;
  
  console.log('🎰 RouletteGame.requestSpin() - Starting', {
    network,
    userAddress: address,
    feeCollector,
    srandAddress,
  });

  // Ensure SRAND approval (approve 10 SRAND, but only need 1 SRAND per spin)
  console.log('Step 1: Ensuring SRAND approval...');
  try {
    await ensureSRANDApproval(signer, network, ethers.parseEther("10"), ethers.parseEther("1"));
    console.log('✅ SRAND approval verified');
  } catch (approvalError: any) {
    console.error('❌ SRAND approval failed:', approvalError);
    throw new Error(`SRAND approval failed: ${approvalError.message}`);
  }

  // Verify SRAND balance before proceeding
  const srand = getSRANDContract(signer, network);
  const balance = await srand.balanceOf(address);
  console.log('SRAND balance:', ethers.formatEther(balance), 'SRAND');
  
  if (balance < ethers.parseEther("1")) {
    throw new Error(`Insufficient SRAND balance. You have ${ethers.formatEther(balance)} SRAND, but need at least 1 SRAND.`);
  }

  // Verify allowance
  const allowance = await srand.allowance(address, feeCollector!);
  console.log('SRAND allowance for FeeCollector:', ethers.formatEther(allowance), 'SRAND');
  
  if (allowance < ethers.parseEther("1")) {
    throw new Error(`Insufficient SRAND allowance. You have ${ethers.formatEther(allowance)} SRAND approved, but need at least 1 SRAND.`);
  }

  const rouletteGame = getRouletteGameContract(signer, network);
  const rouletteGameAddress = contractsConfig[network]?.rouletteGame;
  console.log('Step 2: Calling RouletteGame.requestSpin()', {
    rouletteGameAddress,
    contractAddress: rouletteGame.target,
  });
  
  // Call requestSpin() - this will internally call FeeCollector.requestRandomnessFor()
  // which transfers 1 SRAND from the user
  let tx;
  try {
    tx = await rouletteGame.requestSpin();
    console.log('✅ Transaction sent:', tx.hash);
  } catch (txError: any) {
    console.error('❌ Transaction failed:', txError);
    const errorMsg = txError.reason || txError.shortMessage || txError.message || txError.toString();
    throw new Error(`Failed to request spin: ${errorMsg}`);
  }

  console.log('Step 3: Waiting for transaction confirmation...');
  const receiptResult = await tx.wait();
  if (!receiptResult) {
    throw new Error('Transaction receipt is null');
  }
  const receipt: ethers.TransactionReceipt = receiptResult;
  console.log('✅ Transaction confirmed:', receipt.hash);
  console.log('Transaction status:', receipt.status === 1 ? 'Success' : 'Failed');
  
  if (receipt.status !== 1) {
    throw new Error('Transaction reverted. Check the transaction on block explorer for details.');
  }

  // Check for Transfer event (SRAND transfer from user to FeeCollector)
  // The Transfer event is emitted by the SRAND ERC20 contract
  console.log('Step 5: Checking for SRAND Transfer events...');
  console.log('SRAND contract address:', srandAddress);
  console.log('FeeCollector address:', feeCollector);
  console.log('Total logs in receipt:', receipt.logs.length);
  
  // Create SRAND contract interface to parse Transfer events
  const srandContract = new ethers.Contract(srandAddress!, [
    "event Transfer(address indexed from, address indexed to, uint256 value)"
  ], signer.provider);
  
  // Filter logs that match the SRAND contract address
  const srandTransferEvents = receipt.logs
    .filter((log: any) => {
      // Check if log is from SRAND contract
      return log.address.toLowerCase() === srandAddress!.toLowerCase();
    })
    .map((log: any) => {
      try {
        const parsed = srandContract.interface.parseLog(log);
        return parsed;
      } catch (parseError) {
        console.warn('Failed to parse log:', log.address, parseError);
        return null;
      }
    })
    .filter((parsed: any) => parsed && parsed.name === "Transfer");
  
  if (srandTransferEvents.length > 0) {
    console.log('✅ SRAND Transfer event(s) found:', srandTransferEvents.length);
    srandTransferEvents.forEach((event: any, idx: number) => {
      const from = event.args.from;
      const to = event.args.to;
      const amount = ethers.formatEther(event.args.value);
      console.log(`  Transfer ${idx + 1}:`, {
        from,
        to,
        amount: `${amount} SRAND`,
        isToFeeCollector: to.toLowerCase() === feeCollector!.toLowerCase(),
        isFromUser: from.toLowerCase() === address.toLowerCase(),
      });
      
      // Verify this is the expected transfer
      if (to.toLowerCase() === feeCollector!.toLowerCase() && 
          from.toLowerCase() === address.toLowerCase()) {
        console.log(`  ✅ Confirmed: User transferred ${amount} SRAND to FeeCollector`);
      }
    });
  } else {
    console.warn('⚠️ No SRAND Transfer event found in transaction logs');
    const uniqueAddresses = Array.from(new Set(receipt.logs.map((log: any) => log.address)));
    console.log('Available log addresses:', uniqueAddresses);
    console.log('Looking for SRAND at:', srandAddress);
    
    // Try to find any Transfer events regardless of contract
    const erc20TransferAbi = ["event Transfer(address indexed from, address indexed to, uint256 value)"];
    const allTransferEvents = receipt.logs
      .map((log: any) => {
        try {
          const iface = new ethers.Interface(erc20TransferAbi);
          return iface.parseLog(log);
        } catch {
          return null;
        }
      })
      .filter((parsed: any) => parsed && parsed.name === "Transfer");
    
    if (allTransferEvents.length > 0) {
      console.log('Found Transfer events from other contracts:', allTransferEvents.length);
      allTransferEvents.forEach((event: any, idx: number) => {
        console.log(`  Transfer ${idx + 1} (from contract ${receipt.logs.find((l: any) => {
          try {
            const iface = new ethers.Interface(erc20TransferAbi);
            return iface.parseLog(l) === event;
          } catch {
            return false;
          }
        })?.address}):`, {
          from: event.args.from,
          to: event.args.to,
          amount: ethers.formatEther(event.args.value),
        });
      });
    }
  }

  // Get spinId and requestId from SpinRequested event
  console.log('Step 4: Parsing SpinRequested event...');
  const event = receipt.logs.find((log: any) => {
    try {
      const parsed = rouletteGame.interface.parseLog(log);
      return parsed?.name === "SpinRequested";
    } catch {
      return false;
    }
  });

  if (!event) {
    console.error('❌ SpinRequested event not found in logs');
    console.log('Available events:', receipt.logs.map((log: any) => {
      try {
        return rouletteGame.interface.parseLog(log)?.name || 'unknown';
      } catch {
        return 'unparseable';
      }
    }));
    throw new Error("SpinRequested event not found in transaction receipt");
  }

  const parsed = rouletteGame.interface.parseLog(event);
  const spinId = parsed?.args[1]; // Second arg is spinId
  const requestId = parsed?.args[2]; // Third arg is requestId

  console.log('✅ SpinRequested event parsed:', {
    spinId: spinId.toString(),
    requestId: requestId.toString(),
  });

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
    throw new Error(`RouletteGame not deployed on ${network}. Please check contract configuration.`);
  }

  console.log("Getting spin result", {
    network,
    address,
    spinId: spinId.toString(),
    providerNetwork: (await provider.getNetwork()).chainId.toString()
  });

  const abi = [
    "function getSpin(uint256 _spinId) external view returns (address player, uint8 result, string memory color, bool isEven, bytes32 vrfSeed, uint256 timestamp)",
  ];

  try {
    const contract = new ethers.Contract(address, abi, provider);
    const spin = await contract.getSpin(spinId);

    console.log("Spin data from contract:", {
      player: spin.player,
      result: Number(spin.result),
      color: spin.color,
      vrfSeed: spin.vrfSeed,
      isEven: spin.isEven,
      timestamp: spin.timestamp.toString()
    });

    // Check if spin is completed (result != 255)
    // Also check if vrfSeed is zero (not set yet)
    if (spin.result === 255 || spin.vrfSeed === ethers.ZeroHash || spin.vrfSeed === "0x0000000000000000000000000000000000000000000000000000000000000000") {
      console.log("Spin not yet completed", {
        result: Number(spin.result),
        vrfSeed: spin.vrfSeed,
        isZeroHash: spin.vrfSeed === ethers.ZeroHash
      });
      throw new Error("Spin not yet completed");
    }

    return {
      result: Number(spin.result),
      color: spin.color,
      vrfSeed: spin.vrfSeed,
      isEven: spin.isEven,
    };
  } catch (error: any) {
    console.error("Error getting spin result:", {
      error: error.message,
      code: error.code,
      data: error.data,
      network,
      address,
      spinId: spinId.toString()
    });
    
    // Re-throw with more context
    if (error.message?.includes("not yet completed")) {
      throw error; // Re-throw as-is
    }
    
    throw new Error(`Failed to get spin result: ${error.message || error.toString()}`);
  }
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
  console.log("Starting poll for spin completion", {
    spinId: spinId.toString(),
    network,
    maxAttempts,
    intervalMs,
    totalTimeoutSeconds: (maxAttempts * intervalMs) / 1000
  });

  for (let i = 0; i < maxAttempts; i++) {
    try {
      const spin = await getSpinResult(provider, spinId, network);
      console.log(`Spin completed on attempt ${i + 1}/${maxAttempts}`, spin);
      return spin;
    } catch (error: any) {
      if (error.message?.includes("not yet completed")) {
        // Still waiting, continue polling
        if (i % 5 === 0) { // Log every 5th attempt
          console.log(`Polling attempt ${i + 1}/${maxAttempts} - spin not yet completed`);
        }
        await new Promise((resolve) => setTimeout(resolve, intervalMs));
        continue;
      }
      
      // Non-timeout error - log and throw
      console.error(`Error polling for spin (attempt ${i + 1}/${maxAttempts}):`, error);
      throw error;
    }
  }
  
  console.error(`Spin not completed after ${maxAttempts} attempts (${(maxAttempts * intervalMs) / 1000}s timeout)`);
  throw new Error(`Spin not completed within ${(maxAttempts * intervalMs) / 1000} seconds. The server may still be processing.`);
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
    "function getCharacter(uint256 characterId) external view returns (address player, uint8 class, uint8 strength, uint8 dexterity, uint8 intelligence, uint8 wisdom, uint8 constitution, uint8 charisma, uint256 level, uint256 health, uint256 maxHealth, uint256 wealth, bool alive, uint256 actionCount, uint8 status, uint256 createdAt)",
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
  // Ensure SRAND approval (approve 10 SRAND, but only need 1 SRAND per spin)
  await ensureSRANDApproval(signer, network, ethers.parseEther("10"), ethers.parseEther("1"));

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

  // Get creationSeed from FeeCollector request (the randomness value used to create the character)
  const feeCollectorAddress = contractsConfig[network]?.feeCollector;
  if (!feeCollectorAddress) {
    throw new Error(`FeeCollector not configured for ${network}`);
  }
  const feeCollectorAbi = [
    "function requests(uint256) view returns (uint256, address, uint256, uint256, uint256, uint256, bool, bytes32)"
  ];
  const feeCollector = new ethers.Contract(feeCollectorAddress, feeCollectorAbi, signer.provider);
  const requestData = await feeCollector.requests(requestId);
  const creationSeed = requestData[7]; // randomnessValue is at index 7

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
    creationSeed: creationSeed || "0x0000000000000000000000000000000000000000000000000000000000000000",
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
  // Ensure SRAND approval (approve 10 SRAND, but only need 1 SRAND per spin)
  await ensureSRANDApproval(signer, network, ethers.parseEther("10"), ethers.parseEther("1"));

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
  // Ensure SRAND approval (approve 10 SRAND, but only need 1 SRAND per spin)
  await ensureSRANDApproval(signer, network, ethers.parseEther("10"), ethers.parseEther("1"));

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


