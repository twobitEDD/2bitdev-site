/**
 * SERV.random Contract Addresses Configuration
 * 
 * This file contains all contract addresses for SERV.random across different networks.
 * Update this file when contracts are redeployed.
 * 
 * Last updated: 2025-01-XX
 */

export interface NetworkContracts {
  feeCollector: string;
  srand: string;
  randomnessAccess?: string;
  fishingGame?: string;
  fishingGameNFT?: string;
  rouletteGame?: string;
  dungeonCrawler?: string;
}

export interface ContractsConfig {
  base: NetworkContracts;
  baseSepolia?: NetworkContracts; // Testnet
  avalanche: NetworkContracts;
  polygon: NetworkContracts;
}

export const contractsConfig: ContractsConfig = {
  base: {
    feeCollector: "0xBD7cA8294e976BfCaf61674D4131c35ca71B8662",
    srand: "0x9d8e106BbDdb95cCAc27007De4BE4Fe22E9b0093",
    randomnessAccess: "0xD3e1E14D4d464319C7546E668713BddEc9676Ecf",
    fishingGame: "0xBE1244045AA8b7415DDc2c19974b214ceeB17305",
    fishingGameNFT: "0x1A5b6eB9864B0373D859D2A63c1E1Cd5c789E9B4",
  },
  baseSepolia: {
    feeCollector: "0x630beA16eFe7A1673845FeB3782Fb0F32C9Ad6fD",
    srand: "0xC39FE2a3949CE09390e5663d105b81b5700C3ea4",
    randomnessAccess: "0xFfcBE939F8Aa8fd26E932E2327cD622B8cb148fA",
    fishingGame: "0x524EAA18bCF37c9De3a475a29616F2DFeeC924BD",
    fishingGameNFT: "0x974DC14df9316013455521A2Fa83B6ca9e8B2Fc3",
    rouletteGame: "0x58E320956a158F8554F316468B643c6CD9060e55",
    dungeonCrawler: "0x11a0336e0CF4952A7851Adf4498e1383775C892D",
  },
  avalanche: {
    feeCollector: "0x599E7F697B77AcC29128c7Ce4f9623c67C50D09e",
    srand: "0x9d8e106BbDdb95cCAc27007De4BE4Fe22E9b0093",
    randomnessAccess: "0x599E7F697B77AcC29128c7Ce4f9623c67C50D09e",
    fishingGame: "0x653851F8421e2d79525761DE092feE2F548f8eF0",
  },
  polygon: {
    feeCollector: "0x630beA16eFe7A1673845FeB3782Fb0F32C9Ad6fD",
    srand: "0x9d8e106BbDdb95cCAc27007De4BE4Fe22E9b0093",
    randomnessAccess: "0xFfcBE939F8Aa8fd26E932E2327cD622B8cb148fA",
    fishingGame: "0x974DC14df9316013455521A2Fa83B6ca9e8B2Fc3",
  },
};

/**
 * Get contract address for a specific network and contract type
 */
export function getContractAddress(
  network: keyof ContractsConfig,
  contract: keyof NetworkContracts
): string {
  const networkContracts = contractsConfig[network];
  if (!networkContracts) {
    throw new Error(`Network ${network} not found in contracts config`);
  }
  const address = networkContracts[contract];
  if (!address) {
    throw new Error(`Contract ${contract} not found for network ${network}`);
  }
  return address;
}

/**
 * Get all contracts for a specific network
 */
export function getNetworkContracts(
  network: keyof ContractsConfig
): NetworkContracts {
  const networkContracts = contractsConfig[network];
  if (!networkContracts) {
    throw new Error(`Network ${network} not found in contracts config`);
  }
  return networkContracts;
}

/**
 * Get all networks
 */
export function getNetworks(): Array<keyof ContractsConfig> {
  return Object.keys(contractsConfig) as Array<keyof ContractsConfig>;
}

