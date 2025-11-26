/**
 * RPC Configuration for SERV.random
 * 
 * Uses Alchemy RPC endpoints for reliable, fast access to blockchain data.
 * Falls back to public RPCs if Alchemy keys are not configured.
 */

// Alchemy API keys (should be set via environment variables in production)
const ALCHEMY_BASE_SEPOLIA_KEY = process.env.NEXT_PUBLIC_ALCHEMY_BASE_SEPOLIA_KEY || '';
const ALCHEMY_BASE_KEY = process.env.NEXT_PUBLIC_ALCHEMY_BASE_KEY || '';
const ALCHEMY_AVALANCHE_KEY = process.env.NEXT_PUBLIC_ALCHEMY_AVALANCHE_KEY || '';
const ALCHEMY_POLYGON_KEY = process.env.NEXT_PUBLIC_ALCHEMY_POLYGON_KEY || '';

// RPC URLs - prefer Alchemy, fallback to public endpoints
export const RPC_URLS = {
  baseSepolia: ALCHEMY_BASE_SEPOLIA_KEY
    ? `https://base-sepolia.g.alchemy.com/v2/${ALCHEMY_BASE_SEPOLIA_KEY}`
    : 'https://sepolia.base.org',
  base: ALCHEMY_BASE_KEY
    ? `https://base.g.alchemy.com/v2/${ALCHEMY_BASE_KEY}`
    : 'https://mainnet.base.org',
  avalanche: ALCHEMY_AVALANCHE_KEY
    ? `https://avalanche-mainnet.g.alchemy.com/v2/${ALCHEMY_AVALANCHE_KEY}`
    : 'https://api.avax.network/ext/bc/C/rpc',
  polygon: ALCHEMY_POLYGON_KEY
    ? `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_POLYGON_KEY}`
    : 'https://polygon-rpc.com',
};

/**
 * Get RPC URL for a specific network
 */
export function getRpcUrl(network: 'base' | 'baseSepolia' | 'avalanche' | 'polygon'): string {
  return RPC_URLS[network] || RPC_URLS.baseSepolia;
}

