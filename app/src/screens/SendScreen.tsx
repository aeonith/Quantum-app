// QuantumCoin Send Screen - Real Transaction Broadcasting
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Camera } from 'expo-camera';
import { BarCodeScanningResult } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { useQTCStore } from '../state/store';
import qtcRPC, { isValidQTCAddress } from '../api/qtc';

export default function SendScreen({ navigation }: any) {
  const { user, marketPrice, isConnected, setLoading, setPendingTx, addTransaction } = useQTCStore();
  
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [fee, setFee] = useState('0.001');
  const [showCamera, setShowCamera] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = ({ data }: BarCodeScanningResult) => {
    if (isValidQTCAddress(data)) {
      setRecipient(data);
      setShowCamera(false);
      Alert.alert('QR Code Scanned', `Recipient: ${data}`);
    } else {
      Alert.alert('Invalid QR Code', 'This is not a valid QuantumCoin address');
    }
  };

  const validateSendForm = (): string | null => {
    if (!recipient.trim()) {
      return 'Recipient address is required';
    }

    if (!isValidQTCAddress(recipient)) {
      return 'Invalid QuantumCoin address format';
    }

    if (!amount.trim() || isNaN(Number(amount))) {
      return 'Valid amount is required';
    }

    const amountNum = parseFloat(amount);
    if (amountNum <= 0) {
      return 'Amount must be greater than 0';
    }

    if (!user) {
      return 'User not logged in';
    }

    if (amountNum > user.balance) {
      return `Insufficient balance. You have ${user.balance.toFixed(4)} QTC`;
    }

    const feeNum = parseFloat(fee);
    if (isNaN(feeNum) || feeNum < 0) {
      return 'Invalid fee amount';
    }

    if ((amountNum + feeNum) > user.balance) {
      return 'Amount + fee exceeds balance';
    }

    return null;
  };

  const sendTransaction = async () => {
    if (!isConnected) {
      Alert.alert('Error', 'Not connected to QuantumCoin blockchain');
      return;
    }

    const validationError = validateSendForm();
    if (validationError) {
      Alert.alert('Validation Error', validationError);
      return;
    }

    if (!user) return;

    const amountNum = parseFloat(amount);
    const feeNum = parseFloat(fee);

    Alert.alert(
      'Confirm Transaction',
      `Send ${amountNum} QTC to ${recipient}?\\n\\nFee: ${feeNum} QTC\\nTotal: ${(amountNum + feeNum).toFixed(4)} QTC`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Send', 
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);

              // Send real transaction to QuantumCoin blockchain
              const txHash = await qtcRPC.sendTransaction(
                user.walletAddress,
                recipient,
                amountNum,
                feeNum * 100000000 // Convert fee to satoshis
              );

              setPendingTx(txHash);

              // Add transaction to local state
              const newTx = {
                txid: txHash,
                from: user.walletAddress,
                to: recipient,
                amount: amountNum * 100000000, // Store in satoshis
                fee: feeNum * 100000000,
                confirmations: 0,
                timestamp: Date.now(),
                status: 'pending' as const
              };

              addTransaction(newTx);

              Alert.alert(
                '✅ Transaction Sent!',
                `Transaction broadcast to QuantumCoin network\\n\\nHash: ${txHash}\\n\\nAmount: ${amountNum} QTC\\nTo: ${recipient}`,
                [
                  { 
                    text: 'OK', 
                    onPress: () => {
                      // Clear form and navigate back
                      setRecipient('');
                      setAmount('');
                      navigation.goBack();
                    }
                  }
                ]
              );

            } catch (error) {
              console.error('Send transaction failed:', error);
              Alert.alert(
                'Transaction Failed', 
                `Failed to send transaction: ${error instanceof Error ? error.message : 'Unknown error'}`
              );
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  if (showCamera) {
    if (hasPermission === null) {
      return <Text>Requesting camera permission...</Text>;
    }
    if (hasPermission === false) {
      return <Text>No access to camera</Text>;
    }

    return (
      <View style={styles.cameraContainer}>
        <Camera
          style={styles.camera}
          onBarCodeScanned={handleBarCodeScanned}
          barCodeScannerSettings={{
            barCodeTypes: ['qr'],
          }}
        >
          <View style={styles.cameraOverlay}>
            <Text style={styles.cameraText}>Scan QuantumCoin QR Code</Text>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowCamera(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Camera>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={['#000', '#1a1a2e']}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Send QuantumCoin</Text>
          <View style={{ width: 50 }} />
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Recipient */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Recipient Address</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                value={recipient}
                onChangeText={setRecipient}
                placeholder="qtc1q..."
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.scanButton}
                onPress={() => setShowCamera(true)}
              >
                <Text style={styles.scanButtonText}>📷 Scan</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Amount */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Amount (QTC)</Text>
            <TextInput
              style={styles.textInput}
              value={amount}
              onChangeText={setAmount}
              placeholder="0.0000"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              keyboardType="decimal-pad"
            />
            {user && (
              <Text style={styles.balanceText}>
                Available: {user.balance.toFixed(4)} QTC
              </Text>
            )}
          </View>

          {/* Fee */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Network Fee (QTC)</Text>
            <TextInput
              style={styles.textInput}
              value={fee}
              onChangeText={setFee}
              placeholder="0.001"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              keyboardType="decimal-pad"
            />
          </View>

          {/* Total */}
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total Cost</Text>
            <Text style={styles.totalAmount}>
              {(parseFloat(amount || '0') + parseFloat(fee)).toFixed(4)} QTC
            </Text>
            <Text style={styles.totalUSD}>
              ≈ ${((parseFloat(amount || '0') + parseFloat(fee)) * marketPrice).toFixed(2)} USD
            </Text>
          </View>

          {/* Send Button */}
          <TouchableOpacity
            style={[
              styles.sendButton,
              { opacity: isConnected ? 1 : 0.5 }
            ]}
            onPress={sendTransaction}
            disabled={!isConnected}
          >
            <LinearGradient
              colors={['#FF3B30', '#FF6B6B']}
              style={styles.sendButtonGradient}
            >
              <Text style={styles.sendButtonText}>
                {isConnected ? '💸 Send QuantumCoin' : '❌ Blockchain Disconnected'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
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
  form: {
    flex: 1,
    paddingHorizontal: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    color: '#00ff88',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  textInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 16,
    color: 'white',
    fontSize: 16,
  },
  scanButton: {
    backgroundColor: '#00ff88',
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  balanceText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    marginTop: 4,
  },
  totalContainer: {
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
    alignItems: 'center',
  },
  totalLabel: {
    color: '#00ff88',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  totalAmount: {
    color: 'white',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  totalUSD: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
  },
  sendButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  sendButtonGradient: {
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 30,
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});
