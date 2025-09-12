// QuantumCoin Receive Screen - QR Code Generation
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useQTCStore } from '../state/store';

export default function ReceiveScreen({ navigation }: any) {
  const { user } = useQTCStore();
  const [qrCode, setQrCode] = useState<string>('');

  useEffect(() => {
    if (user?.walletAddress) {
      // Generate QR code data
      setQrCode(user.walletAddress);
    }
  }, [user]);

  const shareAddress = async () => {
    if (user?.walletAddress) {
      try {
        await Share.share({
          message: `My QuantumCoin address: ${user.walletAddress}`,
          title: 'QuantumCoin Address'
        });
      } catch (error) {
        console.error('Share failed:', error);
      }
    }
  };

  const copyAddress = () => {
    if (user?.walletAddress) {
      // In a real app, use Clipboard.setString
      Alert.alert('Copied!', 'Address copied to clipboard');
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No user logged in</Text>
      </View>
    );
  }

  return (
    <LinearGradient colors={['#000', '#1a1a2e']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Receive QuantumCoin</Text>
        <View style={{ width: 50 }} />
      </View>

      {/* QR Code Area */}
      <View style={styles.qrContainer}>
        <View style={styles.qrCodePlaceholder}>
          <Text style={styles.qrText}>📱</Text>
          <Text style={styles.qrLabel}>QR Code</Text>
          <Text style={styles.qrSubtext}>Scan to send QTC</Text>
        </View>
      </View>

      {/* Address */}
      <View style={styles.addressContainer}>
        <Text style={styles.addressLabel}>Your QuantumCoin Address</Text>
        <TouchableOpacity style={styles.addressBox} onPress={copyAddress}>
          <Text style={styles.addressText}>{user.walletAddress}</Text>
        </TouchableOpacity>
        <Text style={styles.addressNote}>Tap to copy</Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.shareButton} onPress={shareAddress}>
          <Text style={styles.shareButtonText}>📤 Share Address</Text>
        </TouchableOpacity>
      </View>

      {/* Instructions */}
      <View style={styles.instructions}>
        <Text style={styles.instructionsTitle}>How to Receive QuantumCoin</Text>
        <Text style={styles.instructionText}>
          1. Share your address or QR code with the sender{'\n'}
          2. They send QTC to your address{'\n'}
          3. Transaction appears in your wallet{'\n'}
          4. Funds available after network confirmation
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    color: '#00ff88',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  qrContainer: {
    alignItems: 'center',
    marginVertical: 40,
  },
  qrCodePlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: 'white',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrText: {
    fontSize: 48,
    marginBottom: 8,
  },
  qrLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  qrSubtext: {
    fontSize: 12,
    color: '#666',
  },
  addressContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  addressLabel: {
    color: '#00ff88',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  addressBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  addressText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  addressNote: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  actions: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  shareButton: {
    backgroundColor: '#00ff88',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  shareButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  instructions: {
    paddingHorizontal: 20,
  },
  instructionsTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  instructionText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    lineHeight: 20,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 16,
    textAlign: 'center',
  },
});
