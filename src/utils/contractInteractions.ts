/**
 * Real Contract Interactions
 * 
 * These functions interact with actual smart contracts on-chain.
 * They check playtest mode and fall back to mocks if needed.
 */

import { ethers } from "ethers";
import { contractsConfig } from "@config/contracts";
import FishingGameABI from "@abis/FishingGame.json";
import RouletteGameABI from "@abis/RouletteGame.json";
import DungeonCrawlerABI from "@abis/DungeonCrawler.json";

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

  // Use full ABI from JSON file
  return new ethers.Contract(address, FishingGameABI.abi, signer);
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

  // Use full ABI from JSON file
  return new ethers.Contract(address, RouletteGameABI.abi, signer);
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

  try {
    // Use full ABI from JSON file
    const contract = new ethers.Contract(address, RouletteGameABI.abi, provider);
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

  // Use full ABI from JSON file
  return new ethers.Contract(address, DungeonCrawlerABI.abi, signer);
}

/**
 * Real DungeonCrawler.createCharacter() - calls actual contract
 */
export async function realCreateCharacter(
  signer: ethers.JsonRpcSigner,
  network: "base" | "baseSepolia" = "baseSepolia"
): Promise<ContractRequestResult> {
  console.log("🎮 Starting character creation", { network, address: await signer.getAddress() });
  
  try {
    // Ensure SRAND approval (approve 10 SRAND, but only need 1 SRAND per character)
    console.log("Step 1: Ensuring SRAND approval...");
    await ensureSRANDApproval(signer, network, ethers.parseEther("10"), ethers.parseEther("1"));
    console.log("✅ SRAND approval verified");

    const dungeonCrawler = getDungeonCrawlerContract(signer, network);
    const contractAddress = contractsConfig[network]?.dungeonCrawler;
    console.log("Step 2: Calling createCharacter()", { contractAddress });
    
    // Call createCharacter()
    const tx = await dungeonCrawler.createCharacter();
    console.log("✅ Transaction sent:", tx.hash);
    
    console.log("Step 3: Waiting for transaction confirmation...");
    const receipt = await tx.wait();
    console.log("✅ Transaction confirmed:", receipt.hash);
    console.log("Transaction status:", receipt.status === 1 ? "Success" : "Failed");
    
    if (receipt.status !== 1) {
      throw new Error("Transaction reverted. Check the transaction on block explorer for details.");
    }

    // Get characterId and requestId from event
    console.log("Step 4: Parsing CharacterCreationStarted event...");
    console.log("Total logs:", receipt.logs.length);
    
    const event = receipt.logs.find((log: any) => {
      try {
        const parsed = dungeonCrawler.interface.parseLog(log);
        const isMatch = parsed?.name === "CharacterCreationStarted";
        if (isMatch) {
          console.log("✅ Found CharacterCreationStarted event:", {
            player: parsed.args[0],
            characterId: parsed.args[1]?.toString(),
            requestId: parsed.args[2]?.toString(),
          });
        }
        return isMatch;
      } catch (parseError) {
        return false;
      }
    });

    if (!event) {
      console.error("❌ CharacterCreationStarted event not found in receipt");
      console.error("Available logs:", receipt.logs.map((log: any, idx: number) => {
        try {
          const parsed = dungeonCrawler.interface.parseLog(log);
          return { index: idx, name: parsed?.name, args: parsed?.args };
        } catch {
          return { index: idx, address: log.address, topics: log.topics };
        }
      }));
      throw new Error("CharacterCreationStarted event not found in transaction receipt");
    }

    const parsed = dungeonCrawler.interface.parseLog(event);
    if (!parsed) {
      throw new Error("Failed to parse CharacterCreationStarted event");
    }
    
    // Event structure: CharacterCreationStarted(address indexed player, uint256 indexed characterId, uint256 requestId)
    // Indexed params: player (args[0]), characterId (args[1])
    // Non-indexed params: requestId (args[2])
    const requestId = parsed.args.requestId ?? parsed.args[2];
    const characterId = parsed.args.characterId ?? parsed.args[1];
    
    if (!requestId) {
      throw new Error("RequestId not found in CharacterCreationStarted event");
    }

    console.log("✅ Character creation successful:", {
      requestId: requestId.toString(),
      characterId: characterId?.toString(),
      txHash: receipt.hash,
    });

    return {
      requestId: requestId.toString(),
      txHash: receipt.hash,
    };
  } catch (error: any) {
    console.error("❌ Error in realCreateCharacter:", error);
    const errorMessage = error.message || error.toString();
    throw new Error(`Failed to create character: ${errorMessage}`);
  }
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
  console.log("🎮 Finalizing character", { requestId, network });
  
  const dungeonCrawler = getDungeonCrawlerContract(signer, network);
  
  // Call finalizeCharacter()
  console.log("Step 1: Calling finalizeCharacter()...");
  const tx = await dungeonCrawler.finalizeCharacter(requestId);
  console.log("✅ Transaction sent:", tx.hash);
  
  console.log("Step 2: Waiting for transaction confirmation...");
  const receipt = await tx.wait();
  console.log("✅ Transaction confirmed:", receipt.hash);
  console.log("Transaction status:", receipt.status === 1 ? "Success" : "Failed");
  
  if (receipt.status !== 1) {
    throw new Error("Transaction reverted. Check the transaction on block explorer for details.");
  }

  // Get character details from event
  console.log("Step 3: Parsing CharacterCreated event...");
  console.log("Total logs:", receipt.logs.length);
  
  const event = receipt.logs.find((log: any) => {
    try {
      const parsed = dungeonCrawler.interface.parseLog(log);
      const isMatch = parsed?.name === "CharacterCreated";
      if (isMatch) {
        console.log("✅ Found CharacterCreated event");
      }
      return isMatch;
    } catch {
      return false;
    }
  });

  if (!event) {
    throw new Error("CharacterCreated event not found in transaction receipt");
  }

  const parsed = dungeonCrawler.interface.parseLog(event);
  
  if (!parsed) {
    throw new Error("Failed to parse CharacterCreated event");
  }
  
  // Event structure: CharacterCreated(address indexed player, uint256 indexed characterId, uint8 class, uint8 strength, uint8 dexterity, uint8 intelligence, uint256 health, uint256 wealth, uint256 createdAt)
  // Indexed params come first in args array, then non-indexed
  // For indexed params, we can access by name or position
  // parsed.args[0] = player (indexed)
  // parsed.args[1] = characterId (indexed) 
  // parsed.args[2] = class (non-indexed)
  // parsed.args[3] = strength (non-indexed)
  // etc.
  
  // Try to get characterId from indexed args or by name
  let characterId: number;
  if (parsed.args.characterId !== undefined) {
    characterId = Number(parsed.args.characterId);
  } else if (parsed.args[1] !== undefined) {
    characterId = Number(parsed.args[1]);
  } else {
    throw new Error("Could not extract characterId from CharacterCreated event");
  }
  
  const classNum = Number(parsed.args.class ?? parsed.args[2] ?? 0);
  const strength = Number(parsed.args.strength ?? parsed.args[3] ?? 0);
  const dexterity = Number(parsed.args.dexterity ?? parsed.args[4] ?? 0);
  const intelligence = Number(parsed.args.intelligence ?? parsed.args[5] ?? 0);
  const health = Number(parsed.args.health ?? parsed.args[6] ?? 0);
  const wealth = Number(parsed.args.wealth ?? parsed.args[7] ?? 0);

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

  // Try to get full character details from contract (with fallback to event data)
  let wisdom = 0;
  let constitution = 0;
  let charisma = 0;
  let maxHealth = health; // Default to health from event
  
  try {
    // Wait a moment for state to update
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const character = await dungeonCrawler.getCharacter(characterId);
    
    // Check if character exists (player address should not be zero)
    if (character && character[0] && character[0] !== ethers.ZeroAddress) {
      wisdom = Number(character.wisdom ?? character[5] ?? 0);
      constitution = Number(character.constitution ?? character[6] ?? 0);
      charisma = Number(character.charisma ?? character[7] ?? 0);
      maxHealth = Number(character.maxHealth ?? character[10] ?? health);
    } else {
      // Character doesn't exist yet or getCharacter failed - use defaults from event
      console.warn(`Character ${characterId} not found in contract yet, using event data only`);
      // Calculate defaults based on class (these are approximate)
      wisdom = 10; // Default value
      constitution = 10; // Default value
      charisma = 10; // Default value
      maxHealth = health; // Use health from event as maxHealth
    }
  } catch (getCharError: any) {
    // If getCharacter fails, use event data and defaults
    console.warn(`Failed to get character details from contract: ${getCharError.message}`);
    console.warn(`Using event data only. CharacterId: ${characterId}`);
    
    // Use defaults - these will be approximate but allow the character to be created
    wisdom = 10;
    constitution = 10;
    charisma = 10;
    maxHealth = health;
  }

  return {
    characterId,
    class: classNum,
    strength,
    dexterity,
    intelligence,
    wisdom,
    constitution,
    charisma,
    health,
    maxHealth,
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
  const contractAddress = contractsConfig[network]?.fishingGame;
  
  if (!contractAddress) {
    throw new Error(`FishingGame not deployed on ${network}`);
  }
  
  console.log("🎣 Catching fish", { requestId, network, contractAddress });
  
  // Call catchFish()
  const tx = await fishingGame.catchFish(requestId);
  console.log("✅ Transaction sent:", tx.hash);
  
  const receipt = await tx.wait();
  console.log("✅ Transaction confirmed:", receipt.hash);
  console.log("Transaction status:", receipt.status === 1 ? "Success" : "Failed");
  
  if (receipt.status !== 1) {
    throw new Error("Transaction reverted. Check the transaction on block explorer for details.");
  }

  // Get fish details from event
  console.log("Step 1: Parsing events from transaction receipt...");
  console.log("Total logs:", receipt.logs.length);
  console.log("Contract address:", contractAddress);
  
  // Filter logs by contract address first, then parse
  const contractLogs = receipt.logs.filter((log: any) => 
    log.address.toLowerCase() === contractAddress.toLowerCase()
  );
  console.log(`Logs from FishingGame contract: ${contractLogs.length} out of ${receipt.logs.length}`);
  
  // Check for RandomnessReceived event (emitted before FishCaught)
  const randomnessReceivedEvent = contractLogs.find((log: any) => {
    try {
      const parsed = fishingGame.interface.parseLog(log);
      return parsed?.name === "RandomnessReceived";
    } catch {
      return false;
    }
  });
  
  if (randomnessReceivedEvent) {
    console.log("✅ Found RandomnessReceived event - catchFish() processed the request");
  } else {
    console.log("ℹ️ RandomnessReceived event not found - checking if fish was already caught via callback (Pattern 1)");
  }
  
  // Check for NFT minting events (from FishingGame contract)
  const nftMintedEvent = contractLogs.find((log: any) => {
    try {
      const parsed = fishingGame.interface.parseLog(log);
      return parsed?.name === "FishNFTMinted";
    } catch {
      return false;
    }
  });
  
  const nftMintingFailedEvent = contractLogs.find((log: any) => {
    try {
      const parsed = fishingGame.interface.parseLog(log);
      return parsed?.name === "NFTMintingFailed";
    } catch {
      return false;
    }
  });
  
  if (nftMintedEvent) {
    const parsed = fishingGame.interface.parseLog(nftMintedEvent);
    console.log("✅ Found FishNFTMinted event:", {
      player: parsed?.args.player ?? parsed?.args[0],
      tokenId: parsed?.args.tokenId?.toString() ?? parsed?.args[1]?.toString(),
      fishType: parsed?.args.fishType ?? parsed?.args[2],
    });
  } else if (nftMintingFailedEvent) {
    const parsed = fishingGame.interface.parseLog(nftMintingFailedEvent);
    const errorDetails = {
      player: parsed?.args.player ?? parsed?.args[0],
      fishType: parsed?.args.fishType ?? parsed?.args[1],
      reason: parsed?.args.reason ?? parsed?.args[2],
    };
    console.error("❌ Found NFTMintingFailed event:", errorDetails);
    console.error("⚠️ NFT was NOT minted! This usually means:");
    console.error("   1. FishingGame.nftContract() is not set (address(0))");
    console.error("   2. NFT contract's fishingGame() doesn't match FishingGame address");
    console.error("   3. NFT contract has an error during minting");
    console.error("   Check contract linkage with: FishingGame.nftContract() and NFT.fishingGame()");
    // Don't throw - fish was still caught successfully, just NFT minting failed
  } else {
    // This is normal if fish was already caught via Pattern 1 callback (events are in different transaction)
    // Only log as info, not warning, since we'll check catch history below
    console.log("ℹ️ No FishNFTMinted or NFTMintingFailed event in this transaction - checking catch history");
  }
  
  // Also check all logs for NFT contract events (NFT contract address might be different)
  const nftAddress = contractsConfig[network]?.fishingGameNFT;
  if (nftAddress) {
    const nftContractLogs = receipt.logs.filter((log: any) => 
      log.address.toLowerCase() === nftAddress.toLowerCase()
    );
    console.log(`📦 Logs from NFT contract (${nftAddress}): ${nftContractLogs.length} out of ${receipt.logs.length}`);
    
    if (nftContractLogs.length > 0) {
      console.log("✅ Found logs from NFT contract - NFT may have been minted");
      nftContractLogs.forEach((log: any, idx: number) => {
        console.log(`  NFT Log ${idx}:`, {
          address: log.address,
          topics: log.topics,
          data: log.data?.slice(0, 66), // First 32 bytes
        });
      });
    }
  }
  
  // Find FishCaught event - check FishingGame contract logs first
  let event = contractLogs.find((log: any) => {
    try {
      const parsed = fishingGame.interface.parseLog(log);
      const isMatch = parsed?.name === "FishCaught";
      if (isMatch) {
        console.log("✅ Found FishCaught event:", {
          player: parsed.args.player ?? parsed.args[0],
          fishType: parsed.args.fishType ?? parsed.args[1]?.toString(),
          size: parsed.args.size ?? parsed.args[2]?.toString(),
          value: parsed.args.value ?? parsed.args[3]?.toString(),
        });
      }
      return isMatch;
    } catch (parseError) {
      // Silently skip parse errors - log might be from different contract
      return false;
    }
  });

  // If not found in FishingGame logs, check all logs (in case event is emitted from different contract)
  if (!event) {
    event = receipt.logs.find((log: any) => {
      try {
        const parsed = fishingGame.interface.parseLog(log);
        return parsed?.name === "FishCaught";
      } catch {
        return false;
      }
    });
    if (event) {
      const parsed = fishingGame.interface.parseLog(event);
      if (parsed) {
        console.log("✅ Found FishCaught event in other contract logs:", {
          player: parsed.args.player ?? parsed.args[0],
          fishType: parsed.args.fishType ?? parsed.args[1]?.toString(),
          size: parsed.args.size ?? parsed.args[2]?.toString(),
          value: parsed.args.value ?? parsed.args[3]?.toString(),
        });
      }
    }
  }

  if (!event) {
    // This is normal if fish was already caught via Pattern 1 callback (events are in different transaction)
    // Transaction succeeded but no event - this means the fish was already caught
    // (contract returns early if pendingRequests[_requestId] is address(0))
    console.log("ℹ️ FishCaught event not found in receipt - fish may have been caught via callback (Pattern 1)");
    console.log("Checking player's catch history to find the catch...");
    
    // Only log available logs in debug mode to reduce console noise
    if (process.env.NODE_ENV === 'development') {
      console.log("Available logs:", receipt.logs.map((log: any, idx: number) => {
      try {
        const parsed = fishingGame.interface.parseLog(log);
        return { index: idx, name: parsed?.name, args: parsed?.args };
      } catch {
        return { index: idx, address: log.address, topics: log.topics };
      }
    }));
    }
    try {
      const playerAddress = await signer.getAddress();
      const catchCount = await fishingGame.getPlayerCatchCount(playerAddress);
      
      if (catchCount > 0) {
        // Get the most recent catch (last index)
        const lastCatch = await fishingGame.getPlayerCatch(playerAddress, catchCount - BigInt(1));
        const fishType = Number(lastCatch.fishType);
        const size = Number(lastCatch.size);
        const value = Number(lastCatch.value);
        const fishNames = ["Goldfish", "Trout", "Salmon", "Tuna", "Shark", "Whale"];
        const fishName = fishNames[fishType] || "Unknown";
        
        console.log("✅ Found existing catch:", { fishType, fishName, size, value });
        console.log("Note: Fish was already caught (likely via callback or previous catchFish call)");
        
        return {
          fishType,
          fishName,
          size,
          value,
        };
      }
    } catch (historyError) {
      console.error("Error checking catch history:", historyError);
    }
    
    // If we can't find it in history, throw an error
    throw new Error("FishCaught event not found in transaction receipt. The transaction succeeded but no event was emitted. This may happen if the fish was already caught via callback (Pattern 1) or a previous catchFish call.");
  }

  const parsed = fishingGame.interface.parseLog(event);
  if (!parsed) {
    throw new Error("Failed to parse FishCaught event");
  }
  
  // Event structure: FishCaught(address indexed player, uint8 fishType, uint256 size, uint256 value)
  // Indexed params: player (args[0])
  // Non-indexed params: fishType (args[1]), size (args[2]), value (args[3])
  const fishType = Number(parsed.args.fishType ?? parsed.args[1] ?? 0);
  const size = Number(parsed.args.size ?? parsed.args[2] ?? 0);
  const value = Number(parsed.args.value ?? parsed.args[3] ?? 0);
  
  console.log("✅ Fish caught successfully:", { fishType, size, value });

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

  // Only consider fulfilled if randomnessValue is set and not zero hash
  const randomnessValue = request.randomnessValue !== ethers.ZeroHash && request.randomnessValue !== "0x0000000000000000000000000000000000000000000000000000000000000000"
    ? request.randomnessValue
    : undefined;
  
  // Only mark as fulfilled if randomnessValue is actually set
  const isFulfilled = request.fulfilled && !!randomnessValue;
  
  return {
    id: request.id.toString(),
    requester: request.requester,
    fulfilled: isFulfilled,
    randomnessValue,
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
  // Wait before first check to avoid false positives immediately after request creation
  // This ensures the request has time to be processed by the server
  await new Promise((resolve) => setTimeout(resolve, intervalMs));
  
  for (let i = 0; i < maxAttempts; i++) {
    const status = await checkRequestStatus(provider, requestId, network);
    
    // Only return if both fulfilled AND randomnessValue is set (not zero hash)
    if (status.fulfilled && status.randomnessValue && status.randomnessValue !== ethers.ZeroHash) {
      return status;
    }
    
    // Wait before next check (except on last iteration)
    if (i < maxAttempts - 1) {
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
  }
  throw new Error("Request not fulfilled within timeout");
}


