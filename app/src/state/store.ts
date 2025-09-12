// QuantumCoin App State Management with Zustand
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';
import { QTCWallet, QTCTransaction, QTCBlockchainInfo, QTCMiningInfo } from '../api/qtc';

interface QTCAppState {
  // User & Wallet State
  user: {
    name: string;
    email: string;
    walletAddress: string;
    balance: number; // In QTC (not satoshis)
    seedPhraseVerified: boolean;
  } | null;
  
  // Blockchain State
  blockchainInfo: QTCBlockchainInfo | null;
  miningInfo: QTCMiningInfo | null;
  marketPrice: number;
  marketCap: number;
  
  // Transaction State
  transactions: QTCTransaction[];
  pendingTx: string | null;
  
  // RevStop State
  revStopEnabled: boolean;
  revStopPassword: string | null;
  
  // UI State
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;
  
  // Actions
  setUser: (user: QTCAppState['user']) => void;
  updateBlockchainInfo: (info: QTCBlockchainInfo) => void;
  updateMiningInfo: (info: QTCMiningInfo) => void;
  updateMarketData: (price: number, marketCap: number) => void;
  updateBalance: (balance: number) => void;
  addTransaction: (tx: QTCTransaction) => void;
  setPendingTx: (txHash: string | null) => void;
  setRevStopStatus: (enabled: boolean, password?: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setConnected: (connected: boolean) => void;
  clearUser: () => void;
}

// Secure storage helpers
const secureStorageAdapter = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(name);
    } catch (error) {
      console.error('SecureStore getItem failed:', error);
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(name, value);
    } catch (error) {
      console.error('SecureStore setItem failed:', error);
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(name);
    } catch (error) {
      console.error('SecureStore removeItem failed:', error);
    }
  },
};

export const useQTCStore = create<QTCAppState>()(
  persist(
    (set, get) => ({
      // Initial State
      user: null,
      blockchainInfo: null,
      miningInfo: null,
      marketPrice: 0,
      marketCap: 0,
      transactions: [],
      pendingTx: null,
      revStopEnabled: false,
      revStopPassword: null,
      isLoading: false,
      error: null,
      isConnected: false,

      // Actions
      setUser: (user) => {
        set({ user });
      },

      updateBlockchainInfo: (info) => {
        set({ blockchainInfo: info });
      },

      updateMiningInfo: (info) => {
        set({ miningInfo: info });
      },

      updateMarketData: (price, marketCap) => {
        set({ marketPrice: price, marketCap });
      },

      updateBalance: (balance) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: {
              ...currentUser,
              balance
            }
          });
        }
      },

      addTransaction: (tx) => {
        set((state) => ({
          transactions: [tx, ...state.transactions].slice(0, 50) // Keep last 50
        }));
      },

      setPendingTx: (txHash) => {
        set({ pendingTx: txHash });
      },

      setRevStopStatus: (enabled, password) => {
        set({ 
          revStopEnabled: enabled,
          revStopPassword: password || null
        });
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      setError: (error) => {
        set({ error });
      },

      setConnected: (connected) => {
        set({ isConnected: connected });
      },

      clearUser: () => {
        set({
          user: null,
          transactions: [],
          pendingTx: null,
          revStopEnabled: false,
          revStopPassword: null
        });
      }
    }),
    {
      name: 'quantumcoin-store',
      storage: secureStorageAdapter,
      // Only persist user data securely
      partialize: (state) => ({
        user: state.user,
        revStopEnabled: state.revStopEnabled
      }),
    }
  )
);

// Store helpers for easy access
export const getUser = () => useQTCStore.getState().user;
export const getBalance = () => useQTCStore.getState().user?.balance || 0;
export const getWalletAddress = () => useQTCStore.getState().user?.walletAddress;
export const isUserLoggedIn = () => !!useQTCStore.getState().user;
export const getMarketPrice = () => useQTCStore.getState().marketPrice;
export const getBlockchainInfo = () => useQTCStore.getState().blockchainInfo;
export const isConnectedToNode = () => useQTCStore.getState().isConnected;
