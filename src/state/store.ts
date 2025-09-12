// src/state/store.ts - QuantumCoin App State Management
import { create } from 'zustand';
import { BlockchainInfo, MiningInfo, Tx } from '../api/qtc';
import { Wallet } from '../crypto/keys';

interface AppState {
  // User & Wallet
  wallet: Wallet | null;
  balance: number; // in QTC
  
  // Blockchain Data
  blockchainInfo: BlockchainInfo | null;
  miningInfo: MiningInfo | null;
  marketPrice: number;
  marketCap: number;
  
  // Transactions
  transactions: Tx[];
  pendingTxHash: string | null;
  
  // RevStop
  revStopEnabled: boolean;
  
  // Connection Status
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setWallet: (wallet: Wallet | null) => void;
  setBalance: (balance: number) => void;
  setBlockchainInfo: (info: BlockchainInfo) => void;
  setMiningInfo: (info: MiningInfo) => void;
  setMarketData: (price: number, marketCap: number) => void;
  addTransaction: (tx: Tx) => void;
  setPendingTx: (txHash: string | null) => void;
  setRevStopEnabled: (enabled: boolean) => void;
  setConnected: (connected: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useQTCStore = create<AppState>((set, get) => ({
  // Initial state
  wallet: null,
  balance: 0,
  blockchainInfo: null,
  miningInfo: null,
  marketPrice: 0,
  marketCap: 0,
  transactions: [],
  pendingTxHash: null,
  revStopEnabled: false,
  isConnected: false,
  isLoading: false,
  error: null,

  // Actions
  setWallet: (wallet) => set({ wallet }),
  
  setBalance: (balance) => set({ balance }),
  
  setBlockchainInfo: (blockchainInfo) => set({ blockchainInfo }),
  
  setMiningInfo: (miningInfo) => set({ miningInfo }),
  
  setMarketData: (marketPrice, marketCap) => set({ marketPrice, marketCap }),
  
  addTransaction: (tx) => set((state) => ({
    transactions: [tx, ...state.transactions.filter(t => t.txid !== tx.txid)].slice(0, 50)
  })),
  
  setPendingTx: (pendingTxHash) => set({ pendingTxHash }),
  
  setRevStopEnabled: (revStopEnabled) => set({ revStopEnabled }),
  
  setConnected: (isConnected) => set({ isConnected }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error }),
  
  reset: () => set({
    wallet: null,
    balance: 0,
    transactions: [],
    pendingTxHash: null,
    revStopEnabled: false,
    error: null
  })
}));

// Helper selectors
export const getWallet = () => useQTCStore.getState().wallet;
export const getBalance = () => useQTCStore.getState().balance;
export const getMarketPrice = () => useQTCStore.getState().marketPrice;
export const isWalletLoaded = () => !!useQTCStore.getState().wallet;
export const getWalletAddress = () => useQTCStore.getState().wallet?.publicKey;
