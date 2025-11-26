# ABI Deployment Guide

This guide documents the process for transferring contract ABIs from the `serv-random-contracts` repository to the `serv-website` repository during deployments.

## Overview

The website uses compiled contract ABIs to interact with smart contracts. These ABIs must be kept in sync with the deployed contracts to ensure accurate function signatures and prevent runtime errors.

## ABI Source Location

Contract ABIs are generated during contract compilation in the `serv-random-contracts` repository:

```
serv-random-contracts/
└── artifacts/
    └── contracts/
        ├── base/
        │   └── FishingGame.sol/
        │       └── FishingGame.json
        └── examples/
            ├── RouletteGame.sol/
            │   └── RouletteGame.json
            └── DungeonCrawler.sol/
                └── DungeonCrawler.json
```

## ABI Destination Location

ABIs must be copied to the website repository:

```
serv-website/
└── src/
    └── abis/
        ├── FishingGame.json
        ├── RouletteGame.json
        └── DungeonCrawler.json
```

## Required ABIs

The following contract ABIs are required for the demo games:

1. **FishingGame.json** - Used by Fishing Game demo
2. **RouletteGame.json** - Used by Roulette Game demo
3. **DungeonCrawler.json** - Used by Dungeon Crawler demo

## Deployment Steps

### Step 1: Compile Contracts

Before copying ABIs, ensure contracts are compiled in the `serv-random-contracts` repository:

```bash
cd serv-random-contracts
npm install
npx hardhat compile
```

### Step 2: Copy ABIs

Copy the compiled ABIs from the artifacts directory to the website's abis directory:

```bash
# From the serv-random-contracts directory

# FishingGame ABI
cp artifacts/contracts/base/FishingGame.sol/FishingGame.json ../serv-website/src/abis/FishingGame.json

# RouletteGame ABI
cp artifacts/contracts/examples/RouletteGame.sol/RouletteGame.json ../serv-website/src/abis/RouletteGame.json

# DungeonCrawler ABI
cp artifacts/contracts/examples/DungeonCrawler.sol/DungeonCrawler.json ../serv-website/src/abis/DungeonCrawler.json
```

### Step 3: Verify ABI Structure

Each ABI JSON file should have the following structure:

```json
{
  "_format": "hh-sol-artifact-1",
  "contractName": "ContractName",
  "sourceName": "contracts/...",
  "abi": [
    // Array of ABI entries
  ]
}
```

Verify that the `abi` array contains the expected functions and events.

### Step 4: Verify Website Usage

Ensure the website code imports and uses these ABIs correctly:

**In `src/utils/contractInteractions.ts`:**
```typescript
import FishingGameABI from "@abis/FishingGame.json";
import RouletteGameABI from "@abis/RouletteGame.json";
import DungeonCrawlerABI from "@abis/DungeonCrawler.json";

// Usage in contract creation
const contract = new ethers.Contract(address, FishingGameABI.abi, signer);
```

**In components:**
```typescript
import DungeonCrawlerABI from "@abis/DungeonCrawler.json";
const contract = new ethers.Contract(address, DungeonCrawlerABI.abi, provider);
```

## When to Update ABIs

ABIs must be updated whenever:

1. **Contract functions are added, removed, or modified**
   - Function signatures change
   - Return types change
   - Parameters change

2. **Events are added, removed, or modified**
   - Event signatures change
   - Event parameters change

3. **New contracts are deployed**
   - New demo games are added
   - New contract versions are deployed

4. **Before each deployment**
   - Always ensure ABIs match the deployed contract versions
   - Verify contract addresses in `src/config/contracts.ts` match the deployed contracts

## Automated Deployment Script

You can create a script to automate this process. Create `scripts/copy-abis.sh`:

```bash
#!/bin/bash

# Script to copy ABIs from serv-random-contracts to serv-website

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Paths (adjust based on your repository structure)
CONTRACTS_DIR="../serv-random-contracts"
WEBSITE_DIR="."

# Check if contracts directory exists
if [ ! -d "$CONTRACTS_DIR" ]; then
    echo -e "${RED}Error: Contracts directory not found at $CONTRACTS_DIR${NC}"
    exit 1
fi

# Check if website abis directory exists
if [ ! -d "$WEBSITE_DIR/src/abis" ]; then
    echo -e "${YELLOW}Creating abis directory...${NC}"
    mkdir -p "$WEBSITE_DIR/src/abis"
fi

echo -e "${GREEN}Copying ABIs...${NC}"

# Copy FishingGame ABI
if [ -f "$CONTRACTS_DIR/artifacts/contracts/base/FishingGame.sol/FishingGame.json" ]; then
    cp "$CONTRACTS_DIR/artifacts/contracts/base/FishingGame.sol/FishingGame.json" \
       "$WEBSITE_DIR/src/abis/FishingGame.json"
    echo -e "${GREEN}✓${NC} Copied FishingGame.json"
else
    echo -e "${RED}✗${NC} FishingGame.json not found. Run 'npx hardhat compile' in contracts repo."
fi

# Copy RouletteGame ABI
if [ -f "$CONTRACTS_DIR/artifacts/contracts/examples/RouletteGame.sol/RouletteGame.json" ]; then
    cp "$CONTRACTS_DIR/artifacts/contracts/examples/RouletteGame.sol/RouletteGame.json" \
       "$WEBSITE_DIR/src/abis/RouletteGame.json"
    echo -e "${GREEN}✓${NC} Copied RouletteGame.json"
else
    echo -e "${RED}✗${NC} RouletteGame.json not found. Run 'npx hardhat compile' in contracts repo."
fi

# Copy DungeonCrawler ABI
if [ -f "$CONTRACTS_DIR/artifacts/contracts/examples/DungeonCrawler.sol/DungeonCrawler.json" ]; then
    cp "$CONTRACTS_DIR/artifacts/contracts/examples/DungeonCrawler.sol/DungeonCrawler.json" \
       "$WEBSITE_DIR/src/abis/DungeonCrawler.json"
    echo -e "${GREEN}✓${NC} Copied DungeonCrawler.json"
else
    echo -e "${RED}✗${NC} DungeonCrawler.json not found. Run 'npx hardhat compile' in contracts repo."
fi

echo -e "${GREEN}ABI copy complete!${NC}"
```

Make it executable:
```bash
chmod +x scripts/copy-abis.sh
```

Run it:
```bash
./scripts/copy-abis.sh
```

## CI/CD Integration

### GitHub Actions Example

Add this step to your deployment workflow:

```yaml
- name: Copy Contract ABIs
  run: |
    # Clone contracts repo (if in separate repo)
    git clone https://github.com/your-org/serv-random-contracts.git contracts-repo
    cd contracts-repo
    npm install
    npx hardhat compile
    
    # Copy ABIs to website
    cp artifacts/contracts/base/FishingGame.sol/FishingGame.json ../serv-website/src/abis/FishingGame.json
    cp artifacts/contracts/examples/RouletteGame.sol/RouletteGame.json ../serv-website/src/abis/RouletteGame.json
    cp artifacts/contracts/examples/DungeonCrawler.sol/DungeonCrawler.json ../serv-website/src/abis/DungeonCrawler.json
    
    cd ../serv-website
```

### Pre-deployment Checklist

Before deploying, verify:

- [ ] Contracts are compiled in `serv-random-contracts`
- [ ] ABIs are copied to `serv-website/src/abis/`
- [ ] Contract addresses in `src/config/contracts.ts` match deployed contracts
- [ ] All ABI imports in code are correct
- [ ] No TypeScript errors related to ABI usage
- [ ] Test interactions work with the new ABIs

## Troubleshooting

### Common Issues

1. **"Cannot find module '@abis/...json'"**
   - Verify the ABI file exists in `src/abis/`
   - Check the import path matches the file name
   - Ensure TypeScript can resolve the path (check `tsconfig.json`)

2. **"Function not found" or "Invalid function signature"**
   - ABI is out of date - recompile contracts and copy ABIs
   - Contract address might be wrong - verify in `src/config/contracts.ts`

3. **"RangeError: out of result range"**
   - ABI structure doesn't match contract return values
   - Missing fields in ABI (e.g., `experience` field in DungeonCrawler)
   - Update ABI to match current contract version

4. **Type errors with ABI**
   - Ensure JSON files are valid JSON
   - Check that `abi` property exists in the JSON
   - Verify TypeScript can import JSON files (check `tsconfig.json`)

### Verification Commands

```bash
# Check if ABIs exist
ls -la src/abis/

# Verify JSON structure
cat src/abis/FishingGame.json | jq '.abi | length'
cat src/abis/RouletteGame.json | jq '.abi | length'
cat src/abis/DungeonCrawler.json | jq '.abi | length'

# Check for specific functions
cat src/abis/DungeonCrawler.json | jq '.abi[] | select(.name == "getCharacter")'
```

## Best Practices

1. **Version Control**
   - Commit ABIs to version control
   - Tag ABI versions with contract deployment versions
   - Document which contract version each ABI corresponds to

2. **Testing**
   - Test contract interactions after updating ABIs
   - Verify all demo games work correctly
   - Check that events are parsed correctly

3. **Documentation**
   - Keep this guide updated when adding new contracts
   - Document any special ABI requirements
   - Note any manual modifications needed

4. **Automation**
   - Use scripts to automate ABI copying
   - Integrate into CI/CD pipeline
   - Add pre-commit hooks to verify ABIs are up to date

## Additional Resources

- [Hardhat Documentation](https://hardhat.org/docs)
- [Ethers.js Contract Interaction](https://docs.ethers.org/v6/api/contract/)
- [Solidity ABI Specification](https://docs.soliditylang.org/en/latest/abi-spec.html)

## Support

If you encounter issues with ABI deployment:

1. Check this guide for common solutions
2. Verify contract compilation succeeded
3. Ensure file paths are correct
4. Check TypeScript configuration
5. Review contract deployment logs

---

**Last Updated:** 2025-01-XX  
**Maintained By:** Development Team

