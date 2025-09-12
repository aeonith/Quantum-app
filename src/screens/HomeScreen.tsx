// src/screens/HomeScreen.tsx - Real QuantumCoin Wallet Interface
import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  RefreshControl,
  Alert
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { useQTCStore } from "../state/store";
import { getAddressBalance, getBlockchainInfo, getMiningInfo, calculateMarketPrice, getAddressTransactions } from "../api/qtc";
import { loadWallet } from "../crypto/keys";

export default function HomeScreen({ navigation }: any) {
  const {
    wallet,
    balance,
    blockchainInfo,
    miningInfo,
    marketPrice,
    marketCap,
    transactions,
    isConnected,
    setBalance,
    setBlockchainInfo,
    setMiningInfo,
    setMarketData,
    addTransaction,
    setConnected,
    setLoading,
    setError
  } = useQTCStore();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadWalletAndData();
    
    // Real-time updates every 30 seconds
    const interval = setInterval(updateBlockchainData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadWalletAndData = async () => {
    try {
      // Load wallet if not already loaded
      if (!wallet) {
        const loadedWallet = await loadWallet();
        if (loadedWallet) {
          useQTCStore.getState().setWallet(loadedWallet);
        } else {
          // No wallet found, redirect to auth
          navigation.navigate('Auth');
          return;
        }
      }

      await updateBlockchainData();
    } catch (error) {
      console.error('Failed to load wallet and data:', error);
      setError('Failed to load wallet data');
    }
  };

  const updateBlockchainData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Test connection first
      const [blockchain, mining] = await Promise.all([
        getBlockchainInfo(),
        getMiningInfo()
      ]);

      setConnected(true);
      setBlockchainInfo(blockchain);
      setMiningInfo(mining);

      // Calculate real market price
      const price = await calculateMarketPrice();
      const circulatingSupply = blockchain.supply.current / 100000000;
      const marketCapValue = price * circulatingSupply;
      setMarketData(price, marketCapValue);

      // Update balance if wallet exists
      if (wallet?.publicKey) {
        const balanceResult = await getAddressBalance(wallet.publicKey);
        const qtcBalance = balanceResult.balance / 100000000; // Convert from satoshis
        setBalance(qtcBalance);

        // Load recent transactions
        const recentTxs = await getAddressTransactions(wallet.publicKey, 5);
        recentTxs.forEach(tx => addTransaction(tx));
      }

      console.log('✅ Real QuantumCoin data updated:', {
        height: blockchain.height,
        supply: circulatingSupply,
        price,
        marketCap: marketCapValue,
        balance: balance
      });

    } catch (error) {
      console.error('Blockchain data update failed:', error);
      setConnected(false);
      setError('Failed to connect to QuantumCoin blockchain');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    updateBlockchainData();
  };

  const formatQTC = (amount: number): string => {
    return amount.toLocaleString('en-US', {
      minimumFractionDigits: 4,
      maximumFractionDigits: 8
    });
  };

  const formatUSD = (amount: number): string => {
    return amount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD'
    });
  };

  if (!wallet) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading wallet...</Text>
      </View>
    );
  }

  return (
    <LinearGradient colors={['#0F0C29', '#24243e', '#302B63']} style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#00ff88"
          />
        }
      >
        {/* Connection Status */}
        <View style={[styles.statusBar, { backgroundColor: isConnected ? '#00ff88' : '#FF3B30' }]}>
          <Text style={styles.statusText}>
            {isConnected ? '✅ QuantumCoin Blockchain Connected' : '❌ Blockchain Disconnected'}
          </Text>
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>⚛️ QuantumCoin</Text>
          <Text style={styles.headerSubtitle}>Quantum Wallet</Text>
        </View>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Text style={styles.balanceAmount}>{formatQTC(balance)} QTC</Text>
          <Text style={styles.balanceUSD}>{formatUSD(balance * marketPrice)}</Text>
          
          <View style={styles.marketInfo}>
            <View style={styles.marketItem}>
              <Text style={styles.marketValue}>{formatUSD(marketPrice)}</Text>
              <Text style={styles.marketLabel}>Price</Text>
            </View>
            <View style={styles.marketItem}>
              <Text style={styles.marketValue}>
                ${(marketCap / 1000000).toFixed(1)}M
              </Text>
              <Text style={styles.marketLabel}>Market Cap</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.sendButton]}
            onPress={() => navigation.navigate('Send')}
          >
            <Text style={styles.actionButtonText}>💸 Send</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.receiveButton]}
            onPress={() => navigation.navigate('Receive')}
          >
            <Text style={styles.actionButtonText}>📥 Receive</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.revstopButton]}
            onPress={() => navigation.navigate('RevStop')}
          >
            <Text style={styles.actionButtonText}>⚡ RevStop</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          {transactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No transactions yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Start by receiving some QuantumCoin
              </Text>
            </View>
          ) : (
            <View style={styles.transactionsList}>
              {transactions.slice(0, 5).map((tx) => (
                <TouchableOpacity 
                  key={tx.txid} 
                  style={styles.transactionItem}
                  onPress={() => {
                    Alert.alert(
                      'Transaction Details',
                      `Hash: ${tx.txid}\\nAmount: ${formatQTC(tx.amount / 100000000)} QTC\\nStatus: ${tx.status}\\nConfirmations: ${tx.confirmations}`
                    );
                  }}
                >
                  <View style={styles.txContent}>
                    <View style={styles.txLeft}>
                      <Text style={styles.txType}>
                        {tx.from === wallet.publicKey ? 'Sent' : 'Received'}
                      </Text>
                      <Text style={styles.txDate}>
                        {new Date(tx.timestamp).toLocaleDateString()}
                      </Text>
                    </View>
                    <View style={styles.txRight}>
                      <Text style={[
                        styles.txAmount,
                        { color: tx.from === wallet.publicKey ? '#FF3B30' : '#00ff88' }
                      ]}>
                        {tx.from === wallet.publicKey ? '-' : '+'}
                        {formatQTC(tx.amount / 100000000)}
                      </Text>
                      <Text style={styles.txStatus}>{tx.status}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Network Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Network Status</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {blockchainInfo?.height.toLocaleString() || '0'}
              </Text>
              <Text style={styles.statLabel}>Block Height</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {blockchainInfo ? (blockchainInfo.difficulty / 1000000).toFixed(0) + 'M' : '0'}
              </Text>
              <Text style={styles.statLabel}>Difficulty</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {blockchainInfo ? (blockchainInfo.supply.current / 100000000).toLocaleString() : '0'}
              </Text>
              <Text style={styles.statLabel}>Supply (QTC)</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {miningInfo?.rewardQTC.toFixed(1) || '50'} QTC
              </Text>
              <Text style={styles.statLabel}>Block Reward</Text>
            </View>
          </View>
        </View>

        {/* Wallet Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Wallet Address</Text>
          <View style={styles.addressCard}>
            <Text style={styles.addressText}>{wallet.publicKey}</Text>
            <TouchableOpacity 
              style={styles.copyButton}
              onPress={() => Alert.alert('Copied!', 'Address copied to clipboard')}
            >
              <Text style={styles.copyButtonText}>📋 Copy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
  },
  statusBar: {
    padding: 12,
    alignItems: 'center',
  },
  statusText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  headerTitle: {
    color: '#00ff88',
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
  },
  balanceCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 30,
    margin: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 136, 0.3)',
  },
  balanceLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    marginBottom: 8,
  },
  balanceAmount: {
    color: 'white',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  balanceUSD: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 18,
    marginBottom: 20,
  },
  marketInfo: {
    flexDirection: 'row',
    gap: 30,
  },
  marketItem: {
    alignItems: 'center',
  },
  marketValue: {
    color: '#00ff88',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  marketLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 30,
  },
  actionButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  sendButton: { backgroundColor: '#FF3B30' },
  receiveButton: { backgroundColor: '#00ff88' },
  revstopButton: { backgroundColor: '#1e3c72' },
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    padding: 30,
  },
  emptyStateText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 14,
  },
  transactionsList: {
    gap: 12,
  },
  transactionItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  txContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  txLeft: {
    flex: 1,
  },
  txType: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 4,
  },
  txDate: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
  },
  txRight: {
    alignItems: 'flex-end',
  },
  txAmount: {
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 4,
  },
  txStatus: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    textTransform: 'capitalize',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
  },
  statValue: {
    color: '#00ff88',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    textAlign: 'center',
  },
  addressCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  addressText: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 12,
    textAlign: 'center',
  },
  copyButton: {
    backgroundColor: '#00ff88',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  copyButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
});
