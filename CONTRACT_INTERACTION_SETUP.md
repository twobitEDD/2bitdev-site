# Contract Interaction Setup & Testing Guide

## Overview
The demo components use **mock contract interactions** for testing the UI/UX flow without requiring deployed contracts. This allows you to verify the entire user experience before deploying contracts.

## Architecture

### Mock System (`src/utils/mockContracts.ts`)
- Simulates contract calls with realistic delays
- Generates fake VRF values (bytes32 hex strings)
- Simulates fulfillment after 3-5 seconds
- Stores request state in memory
- Provides polling functionality

### Demo Components
- **OthelloGameDemo**: Wraps OthelloBoard with mock contract interactions
- **DungeonCrawlerDemo**: Wraps DungeonCrawlerGame with mock contract interactions
- Both handle state management and user feedback

## Contract Flow Review

### Pattern 2: Manual Claim (Used in All Examples)

#### OthelloGame Flow:
1. **User clicks "Request Spin"**
   - Calls `RouletteGame.requestSpin()`
   - Which calls `FeeCollector.requestRandomnessFor(1, msg.sender)`
   - Returns `spinId` and `requestId`
   - Spin created with `requestId` stored

2. **Server fulfills** (automatic, happens off-chain)
   - SERV.random server detects request
   - Fetches VRF from Harmony
   - Calls `FeeCollector.fulfillRandomness(requestId, vrfValue)`
   - Randomness stored on-chain

3. **User clicks "Complete Spin"**
   - Calls `RouletteGame.completeSpin(spinId)`
   - Contract checks `FeeCollector.requests(requestId)` for fulfillment
   - Uses VRF to determine result: `uint256(vrf) % 37` → 0-36
   - Result logged with VRF seed, statistics updated

#### DungeonCrawler Flow:
1. **Character Creation**:
   - `createCharacter()` → `FeeCollector.requestRandomnessFor()`
   - Server fulfills
   - `finalizeCharacter(requestId)` → Uses VRF to generate stats

2. **Adventure**:
   - `startAdventure()` → `FeeCollector.requestRandomnessFor()`
   - Server fulfills
   - `rollD20(requestId)` → Uses VRF for d20 roll (1-20)
   - `continueAdventure()` → New request for next room

## Mock Functions

### Available Mock Functions:
```typescript
// General
mockRequestRandomness(tierId, requester) → { requestId, txHash }
mockCheckRequestStatus(requestId) → RequestStatus | null
pollForFulfillment(requestId) → RequestStatus

// Roulette
mockRouletteRequestSpin() → { requestId, txHash }
mockRouletteCompleteSpin(requestId) → { result, color, vrfSeed }

// Dungeon Crawler
mockCreateCharacter() → { requestId, txHash }
mockFinalizeCharacter(requestId) → Character data
mockStartAdventure() → { requestId, txHash }
mockRollD20(requestId) → { roll, event, seed }
mockContinueAdventure() → { requestId, txHash }
```

## Testing with Mocks

### Current Setup:
✅ **Mock interactions are active** - Components use mock functions  
✅ **No wallet required** - Works without MetaMask  
✅ **Instant testing** - No contract deployment needed  
✅ **Realistic flow** - Simulates real contract behavior  

### How to Test:
1. Navigate to `/random/demo`
2. Click on "Roulette" or "Dungeon Crawler" tab
3. Click "Request Spin" / "Create Character"
4. Wait 3-5 seconds (simulated server processing)
5. Click "Complete Spin" / "Finalize" when VRF is ready
6. See VRF visualization, results, and running log

## Switching to Real Contracts

### Step 1: Deploy Contracts
Deploy `RouletteGame` and `DungeonCrawler` contracts to your network.

### Step 2: Update Contract Addresses
Add to `src/config/contracts.ts`:
```typescript
export const contractsConfig: ContractsConfig = {
  base: {
    // ... existing
    rouletteGame: "0x...", // New address
    dungeonCrawler: "0x...", // New address
  },
  // ...
};
```

### Step 3: Create Real Contract Interaction Functions
Create `src/utils/realContracts.ts`:
```typescript
import { ethers } from "ethers";
import { contractsConfig } from "@config/contracts";

export async function realRouletteRequestSpin(signer: ethers.Signer) {
  const rouletteAbi = [
    "function requestSpin() external returns (uint256)",
  ];
  const contract = new ethers.Contract(
    contractsConfig.base.rouletteGame,
    rouletteAbi,
    signer
  );
  const tx = await contract.requestSpin();
  const receipt = await tx.wait();
  // Extract spinId from event...
  return { spinId, requestId, txHash: receipt.hash };
}
```

### Step 4: Update Demo Components
Replace mock imports with real imports:
```typescript
// Change from:
import { mockRouletteRequestSpin } from "@utils/mockContracts";

// To:
import { realRouletteRequestSpin } from "@utils/realContracts";
```

### Step 5: Add Wallet Connection
Add wallet connection logic (similar to FishingGame):
```typescript
const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();
const result = await realRouletteRequestSpin(signer);
```

## Contract Interaction Patterns

### Pattern Used: Manual Claim (Pattern 2)
**Why**: More gas-efficient, gives users control, avoids callback gas issues

**Flow**:
```
User → Contract.requestRandomness() 
     → FeeCollector.requestRandomnessFor()
     → Event emitted
     → Server detects event
     → Server fulfills (FeeCollector.fulfillRandomness)
     → User → Contract.claim() 
            → Checks FeeCollector.requests() for fulfillment
            → Uses randomness
```

### Key Contract Functions:

#### RouletteGame:
- `requestSpin()` - Requests VRF, creates spin
- `completeSpin(spinId)` - Claims VRF, determines result (0-36)
- `getSpin(spinId)` - View spin details with VRF seed
- `getRecentSpins(count)` - View running log of spins
- `getStatistics()` - View frequency statistics

#### DungeonCrawler:
- `createCharacter()` - Requests VRF for character
- `finalizeCharacter(requestId)` - Claims VRF, creates character
- `startAdventure()` - Requests VRF for first room
- `rollD20(requestId)` - Claims VRF, rolls d20
- `continueAdventure()` - Requests VRF for next room
- `getCharacter(player)` - View character stats
- `getAdventure(player)` - View adventure state

## Verification Points

### What to Verify:
1. ✅ **Request Flow**: User can request randomness
2. ✅ **Fulfillment Detection**: UI detects when randomness is ready
3. ✅ **Claim Flow**: User can claim/initialize with randomness
4. ✅ **VRF Visualization**: VRF seed is displayed and visualized
5. ✅ **Game State**: Game state updates correctly from VRF
6. ✅ **Error Handling**: Errors are caught and displayed

### Current Status:
- ✅ Mock system working
- ✅ UI/UX flow complete
- ✅ VRF visualization integrated
- ⏳ Real contracts: Ready to deploy and integrate

## Next Steps

1. **Test with Mocks** (Current):
   - Verify UI/UX flow
   - Test all user interactions
   - Confirm VRF visualization works

2. **Deploy Contracts**:
   - Deploy OthelloGame to testnet
   - Deploy DungeonCrawler to testnet
   - Verify deployment

3. **Integrate Real Contracts**:
   - Create real contract interaction functions
   - Update demo components
   - Test with real contracts

4. **Production**:
   - Deploy to mainnet
   - Update contract addresses
   - Launch!

