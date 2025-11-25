"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { ethers } from "ethers";

interface WalletContextType {
  isConnected: boolean;
  address: string | null;
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  chainId: number | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchToBaseSepolia: () => Promise<void>;
  isBaseSepolia: boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const BASE_SEPOLIA_CHAIN_ID = 84532;
const BASE_SEPOLIA_RPC = "https://sepolia.base.org";

export function WalletProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);

  const disconnectWallet = useCallback(() => {
    setProvider(null);
    setSigner(null);
    setAddress(null);
    setChainId(null);
    setIsConnected(false);
  }, []);

  const checkConnection = useCallback(async () => {
    if (typeof window === "undefined" || !window.ethereum) return;

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.listAccounts();
      
      if (accounts.length > 0) {
        const signer = await provider.getSigner();
        const network = await provider.getNetwork();
        const accountAddress = await signer.getAddress();

        setProvider(provider);
        setSigner(signer);
        setAddress(accountAddress);
        setChainId(Number(network.chainId));
        setIsConnected(true);
      } else {
        // No accounts connected, reset state
        setProvider(null);
        setSigner(null);
        setAddress(null);
        setChainId(null);
        setIsConnected(false);
      }
    } catch (error) {
      console.error("Error checking connection:", error);
      // Reset state on error
      setProvider(null);
      setSigner(null);
      setAddress(null);
      setChainId(null);
      setIsConnected(false);
    }
  }, []);

  const handleAccountsChanged = useCallback((accounts: string[]) => {
    if (accounts.length === 0) {
      disconnectWallet();
    } else {
      checkConnection();
    }
  }, [disconnectWallet, checkConnection]);

  const handleChainChanged = useCallback(() => {
    checkConnection();
  }, [checkConnection]);

  // Check if already connected on mount
  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      checkConnection();
      // Listen for account changes
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);
    }

    return () => {
      if (typeof window !== "undefined" && window.ethereum) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, [checkConnection, handleAccountsChanged, handleChainChanged]);

  const connectWallet = useCallback(async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      throw new Error("MetaMask or other wallet not found. Please install MetaMask.");
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      
      const signer = await provider.getSigner();
      const network = await provider.getNetwork();
      const accountAddress = await signer.getAddress();

      setProvider(provider);
      setSigner(signer);
      setAddress(accountAddress);
      setChainId(Number(network.chainId));
      setIsConnected(true);
    } catch (error) {
      console.error("Error connecting wallet:", error);
      throw error;
    }
  }, []);

  const switchToBaseSepolia = useCallback(async () => {
    if (!window.ethereum) {
      throw new Error("MetaMask not found");
    }

    try {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: `0x${BASE_SEPOLIA_CHAIN_ID.toString(16)}`,
            chainName: "Base Sepolia",
            nativeCurrency: {
              name: "ETH",
              symbol: "ETH",
              decimals: 18,
            },
            rpcUrls: [BASE_SEPOLIA_RPC],
            blockExplorerUrls: ["https://sepolia.basescan.org"],
          },
        ],
      });
    } catch (error: any) {
      // If chain already added, switch to it
      if (error.code === 4902 || error.message?.includes("already added")) {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: `0x${BASE_SEPOLIA_CHAIN_ID.toString(16)}` }],
        });
      } else {
        throw error;
      }
    }

    // Refresh connection after switching
    await checkConnection();
  }, [checkConnection]);

  const isBaseSepolia = chainId === BASE_SEPOLIA_CHAIN_ID;

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        address,
        provider,
        signer,
        chainId,
        connectWallet,
        disconnectWallet,
        switchToBaseSepolia,
        isBaseSepolia,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, handler: (...args: any[]) => void) => void;
      removeListener: (event: string, handler: (...args: any[]) => void) => void;
      isMetaMask?: boolean;
    };
  }
}

