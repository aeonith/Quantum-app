// QuantumCoin RevStop Screen - Emergency Protection
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useQTCStore } from '../state/store';
import qtcRPC from '../api/qtc';

export default function RevStopScreen({ navigation }: any) {
  const { user, revStopEnabled, setRevStopStatus } = useQTCStore();
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    checkRevStopStatus();
  }, []);

  const checkRevStopStatus = async () => {
    if (!user?.walletAddress) return;

    try {
      setIsChecking(true);
      const enabled = await qtcRPC.getRevStopStatus(user.walletAddress);
      setRevStopStatus(enabled);
    } catch (error) {
      console.error('Failed to check RevStop status:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const activateRevStop = () => {
    Alert.alert(
      '🚨 EMERGENCY REVSTOP™',
      'This is for EMERGENCY USE ONLY\n\nActivate if experiencing:\n• Unauthorized access\n• Security threats\n• Suspicious activity\n\nWARNING: Can only be disabled ONCE\n\nActivate Emergency RevStop™?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Activate',
          style: 'destructive',
          onPress: performActivation
        }
      ]
    );
  };

  const performActivation = async () => {
    if (!user?.walletAddress) return;

    try {
      const emergencyPassword = Math.floor(Math.random() * 9000000000) + 1000000000;
      const success = await qtcRPC.enableRevStop(user.walletAddress, emergencyPassword.toString());

      if (success) {
        setRevStopStatus(true, emergencyPassword.toString());
        Alert.alert(
          '🚨 Emergency RevStop™ Activated!',
          `Your funds are now FROZEN on the QuantumCoin blockchain\n\nEmergency Password: ${emergencyPassword}\n\n⚠️ SAVE THIS PASSWORD! It can only be used ONCE to disable RevStop™`
        );
      } else {
        Alert.alert('Error', 'Failed to activate RevStop™');
      }
    } catch (error) {
      Alert.alert('Error', `RevStop™ activation failed: ${error}`);
    }
  };

  const deactivateRevStop = () => {
    Alert.prompt(
      '🔓 Disable RevStop™ Forever',
      'Enter your 10-digit emergency password:\n\n⚠️ This can only be done ONCE\n⚠️ RevStop™ cannot be re-enabled',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disable',
          style: 'destructive',
          onPress: async (password) => {
            if (!password || password.length !== 10) {
              Alert.alert('Error', 'Invalid password format');
              return;
            }

            try {
              const success = await qtcRPC.disableRevStop(user!.walletAddress, password);
              
              if (success) {
                setRevStopStatus(false);
                Alert.alert(
                  '⚠️ RevStop™ Permanently Disabled',
                  'RevStop™ has been permanently disabled and cannot be re-enabled'
                );
              } else {
                Alert.alert('Error', 'Invalid password or disable failed');
              }
            } catch (error) {
              Alert.alert('Error', `Disable failed: ${error}`);
            }
          }
        }
      ],
      'secure-text'
    );
  };

  if (!user) {
    navigation.navigate('Auth');
    return null;
  }

  return (
    <LinearGradient colors={['#000', '#1a1a2e']} style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>RevStop™</Text>
          <View style={{ width: 50 }} />
        </View>

        {/* Status Card */}
        <View style={[
          styles.statusCard,
          { borderColor: revStopEnabled ? '#FF3B30' : '#00ff88' }
        ]}>
          <View style={styles.statusHeader}>
            <Text style={[
              styles.statusTitle,
              { color: revStopEnabled ? '#FF3B30' : '#00ff88' }
            ]}>
              {revStopEnabled ? '🚨 Emergency Active' : '🛡️ Safe Mode'}
            </Text>
            <View style={[
              styles.statusBadge,
              { 
                backgroundColor: revStopEnabled ? 'rgba(255, 59, 48, 0.2)' : 'rgba(0, 255, 136, 0.2)',
              }
            ]}>
              <Text style={[
                styles.statusBadgeText,
                { color: revStopEnabled ? '#FF3B30' : '#00ff88' }
              ]}>
                {revStopEnabled ? 'FROZEN' : 'NORMAL'}
              </Text>
            </View>
          </View>
          
          <Text style={styles.statusDescription}>
            {revStopEnabled
              ? 'Your wallet is protected by emergency RevStop™. Funds are frozen on the QuantumCoin blockchain.'
              : 'RevStop™ is OFF (normal operation). Your funds are accessible for normal transactions.'
            }
          </Text>
        </View>

        {/* Information */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>What is RevStop™?</Text>
          
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>🛡️ Emergency Protection</Text>
            <Text style={styles.infoText}>
              RevStop™ freezes your funds on the QuantumCoin blockchain during security emergencies. 
              Only activate when you suspect unauthorized access or device compromise.
            </Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>🔐 Quantum-Safe Security</Text>
            <Text style={styles.infoText}>
              Uses quantum-resistant cryptography with 10-digit emergency passwords. 
              Protection remains secure even against future quantum computers.
            </Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>⚠️ One-Time Disable</Text>
            <Text style={styles.infoText}>
              RevStop™ can only be disabled ONCE. After disabling, it cannot be re-enabled. 
              This prevents attackers from repeatedly toggling protection.
            </Text>
          </View>
        </View>

        {/* Action Button */}
        <View style={styles.actionSection}>
          {!revStopEnabled ? (
            <TouchableOpacity style={styles.activateButton} onPress={activateRevStop}>
              <LinearGradient colors={['#FF3B30', '#FF6B6B']} style={styles.buttonGradient}>
                <Text style={styles.buttonText}>🚨 Emergency Activate</Text>
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.disableButton} onPress={deactivateRevStop}>
              <LinearGradient colors={['#FF3B30', '#FF6B6B']} style={styles.buttonGradient}>
                <Text style={styles.buttonText}>🔓 Disable Forever</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>

        {/* Warning */}
        <View style={styles.warningCard}>
          <Text style={styles.warningTitle}>⚠️ CRITICAL WARNINGS</Text>
          <Text style={styles.warningText}>
            • Only activate during real emergencies{'\n'}
            • Save your emergency password safely{'\n'}
            • RevStop™ can only be disabled ONCE{'\n'}
            • Lost password = permanently frozen funds{'\n'}
            • This affects funds on the blockchain level
          </Text>
        </View>
      </ScrollView>
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
  statusCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 2,
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 20,
    marginBottom: 30,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 15,
    lineHeight: 22,
  },
  infoSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  infoTitle: {
    color: '#00ff88',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    lineHeight: 20,
  },
  actionSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  activateButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  disableButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonGradient: {
    padding: 18,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  warningCard: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.3)',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 30,
  },
  warningTitle: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  warningText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    lineHeight: 20,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 16,
    textAlign: 'center',
    margin: 20,
  },
});
