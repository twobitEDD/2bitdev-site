# Contract Addresses Configuration

## Overview
All SERV.random contract addresses are centralized in a single configuration file for easy updates.

## Configuration File
**Location**: `src/config/contracts.ts`

## How to Update Contract Addresses

### Step 1: Open the Config File
```bash
serv-website/src/config/contracts.ts
```

### Step 2: Update the Address
Find the network and contract you need to update:

```typescript
export const contractsConfig: ContractsConfig = {
  base: {
    feeCollector: "0x...",  // ← Update here
    srand: "0x...",
    // ...
  },
  // ...
};
```

### Step 3: Save and Rebuild
The changes will automatically be reflected across all pages that use contract addresses:
- Developer Guide (`/random/docs`)
- Explorer page (if using addresses)
- Demo page (if using addresses)

## Current Contract Addresses

### Base Mainnet
- **FeeCollector**: `0xBD7cA8294e976BfCaf61674D4131c35ca71B8662`
- **SRAND Token**: `0x9d8e106BbDdb95cCAc27007De4BE4Fe22E9b0093`
- **RandomnessAccess**: `0xD3e1E14D4d464319C7546E668713BddEc9676Ecf`
- **FishingGame**: `0xBE1244045AA8b7415DDc2c19974b214ceeB17305`
- **FishingGameNFT**: `0x1A5b6eB9864B0373D859D2A63c1E1Cd5c789E9B4`

### Avalanche C-Chain
- **FeeCollector**: `0x599E7F697B77AcC29128c7Ce4f9623c67C50D09e`
- **SRAND Token**: `0x9d8e106BbDdb95cCAc27007De4BE4Fe22E9b0093`
- **RandomnessAccess**: `0x599E7F697B77AcC29128c7Ce4f9623c67C50D09e`
- **FishingGame**: `0x653851F8421e2d79525761DE092feE2F548f8eF0`

### Polygon Mainnet
- **FeeCollector**: `0x630beA16eFe7A1673845FeB3782Fb0F32C9Ad6fD`
- **SRAND Token**: `0x9d8e106BbDdb95cCAc27007De4BE4Fe22E9b0093`
- **RandomnessAccess**: `0xFfcBE939F8Aa8fd26E932E2327cD622B8cb148fA`
- **FishingGame**: `0x974DC14df9316013455521A2Fa83B6ca9e8B2Fc3`

## Usage in Code

### Import the Config
```typescript
import { contractsConfig, getContractAddress } from "@config/contracts";

// Get specific contract address
const feeCollector = getContractAddress("base", "feeCollector");

// Get all contracts for a network
const baseContracts = contractsConfig.base;
```

## Benefits

✅ **Single Source of Truth**: All addresses in one place  
✅ **Easy Updates**: Change once, updates everywhere  
✅ **Type Safety**: TypeScript ensures correct usage  
✅ **No Hardcoding**: Addresses imported, not duplicated  

## After Redeployment

1. Update `src/config/contracts.ts` with new addresses
2. Update this README with new addresses (optional)
3. Rebuild and deploy the website
4. Verify addresses on `/random/docs` page

