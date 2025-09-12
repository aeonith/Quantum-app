// QuantumCoin Home Screen - Real Wallet Interface
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useQTCStore } from '../state/store';
import qtcRPC from '../api/qtc';

export default function HomeScreen({ navigation }: any) {
  const {
    user,
    blockchainInfo,
    marketPrice,
    marketCap,
    transactions,
    isConnected,
    isLoading,
    updateBlockchainInfo,
    updateMiningInfo,
    updateMarketData,
    updateBalance,
    setConnected,
    setLoading,
    setError
  } = useQTCStore();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadRealData();
    
    // Real-time updates every 30 seconds
    const interval = setInterval(loadRealData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadRealData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check connection to QuantumCoin node
      const connected = await qtcRPC.isConnected();
      setConnected(connected);

      if (!connected) {
        setError('Unable to connect to QuantumCoin node');
        return;
      }

      // Load real blockchain data
      const [blockchain, mining, price] = await Promise.all([
        qtcRPC.getBlockchainInfo(),
        qtcRPC.getMiningInfo(),
        qtcRPC.calculateMarketPrice()
      ]);

      updateBlockchainInfo(blockchain);
      updateMiningInfo(mining);

      // Calculate real market cap
      const circulatingSupply = blockchain.supply.current / 100000000;
      const realMarketCap = price * circulatingSupply;
      updateMarketData(price, realMarketCap);

      // Update user balance if logged in
      if (user?.walletAddress) {
        const balanceResult = await qtcRPC.getBalance(user.walletAddress);
        const qtcBalance = balanceResult.balance / 100000000; // Convert from satoshis
        updateBalance(qtcBalance);

        // Load recent transactions
        const recentTxs = await qtcRPC.getTransactionHistory(user.walletAddress, 10);
        recentTxs.forEach(tx => {
          // Add to store if not already present
          const exists = transactions.find(existingTx => existingTx.txid === tx.txid);
          if (!exists) {
            useQTCStore.getState().addTransaction(tx);
          }
        });
      }

      console.log('✅ Real QuantumCoin data loaded:', {
        height: blockchain.height,
        supply: circulatingSupply,
        price,
        marketCap: realMarketCap,
        connected
      });

    } catch (error) {
      console.error('Failed to load real data:', error);
      setError('Failed to connect to QuantumCoin blockchain');
      setConnected(false);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadRealData();
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
      currency: 'USD',
      minimumFractionDigits: 2
    });
  };

  if (!user) {
    navigation.navigate('Auth');
    return null;
  }

  return (
    <ScrollView 
      style={styles.container}
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
          {isConnected ? '✅ Connected to QuantumCoin Blockchain' : '❌ Blockchain Disconnected'}
        </Text>
      </View>

      {/* Balance Card */}
      <LinearGradient
        colors={['rgba(30, 60, 114, 0.8)', 'rgba(42, 82, 152, 0.8)']}
        style={styles.balanceCard}
      >
        <Text style={styles.balanceLabel}>Total Balance</Text>
        <Text style={styles.balanceAmount}>
          {formatQTC(user.balance)} QTC
        </Text>
        <Text style={styles.balanceUSD}>
          {formatUSD(user.balance * marketPrice)}
        </Text>

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
      </LinearGradient>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.sendButton]}
          onPress={() => navigation.navigate('Send')}
        >
          <Text style={styles.actionButtonText}>Send</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.receiveButton]}
          onPress={() => navigation.navigate('Receive')}
        >
          <Text style={styles.actionButtonText}>Receive</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.buyButton]}
          onPress={() => navigation.navigate('Buy')}
        >
          <Text style={styles.actionButtonText}>Buy</Text>
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
                <View style={styles.txLeft}>
                  <Text style={styles.txType}>
                    {tx.from === user.walletAddress ? 'Sent' : 'Received'}
                  </Text>
                  <Text style={styles.txDate}>
                    {new Date(tx.timestamp).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.txRight}>
                  <Text style={[
                    styles.txAmount,
                    { color: tx.from === user.walletAddress ? '#FF3B30' : '#00ff88' }
                  ]}>
                    {tx.from === user.walletAddress ? '-' : '+'}
                    {formatQTC(tx.amount / 100000000)}
                  </Text>
                  <Text style={styles.txStatus}>{tx.status}</Text>
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
              {blockchainInfo?.nextHalving.toLocaleString() || '105,120'}
            </Text>
            <Text style={styles.statLabel}>Next Halving</Text>
          </View>
        </View>
      </View>

      {/* RevStop Status */}
      <TouchableOpacity 
        style={styles.section}
        onPress={() => navigation.navigate('RevStop')}
      >
        <Text style={styles.sectionTitle}>RevStop™ Status</Text>
        <View style={[
          styles.revStopCard,
          { borderColor: revStopEnabled ? '#FF3B30' : '#00ff88' }
        ]}>
          <View style={styles.revStopHeader}>
            <Text style={[
              styles.revStopTitle,
              { color: revStopEnabled ? '#FF3B30' : '#00ff88' }
            ]}>
              {revStopEnabled ? '🚨 Emergency Active' : '🛡️ Safe Mode'}
            </Text>
            <Text style={[
              styles.revStopStatus,
              { 
                backgroundColor: revStopEnabled ? 'rgba(255, 59, 48, 0.2)' : 'rgba(0, 255, 136, 0.2)',
                color: revStopEnabled ? '#FF3B30' : '#00ff88'
              }
            ]}>
              {revStopEnabled ? 'FROZEN' : 'NORMAL'}
            </Text>
          </View>
          <Text style={styles.revStopDesc}>
            {revStopEnabled 
              ? 'Your wallet is protected by emergency RevStop™'
              : 'RevStop™ protection is OFF (normal operation)'
            }
          </Text>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
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
  balanceCard: {
    margin: 20,
    padding: 30,
    borderRadius: 20,
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
    fontSize: 32,
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
  sendButton: {
    backgroundColor: '#FF3B30',
  },
  receiveButton: {
    backgroundColor: '#00ff88',
  },
  buyButton: {
    backgroundColor: '#1e3c72',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
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
    padding: 40,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
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
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    textAlign: 'center',
  },
  revStopCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
  },
  revStopHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  revStopTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  revStopStatus: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  revStopDesc: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    lineHeight: 20,
  },
});
