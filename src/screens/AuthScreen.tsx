// src/screens/AuthScreen.tsx - Real Authentication with Quantum Wallets
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { useQTCStore } from "../state/store";
import { generateWallet, restoreWalletFromSeed, isValidSeedPhrase } from "../crypto/keys";

export default function AuthScreen({ navigation }: any) {
  const { setWallet } = useQTCStore();
  const [isSignup, setIsSignup] = useState(false);
  const [isRestore, setIsRestore] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [seedPhrase, setSeedPhrase] = useState('');

  const handleCreateWallet = async () => {
    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('Error', 'All fields are required');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters');
      return;
    }

    try {
      // Generate real quantum wallet
      const wallet = await generateWallet();
      
      // Show seed phrase with mandatory verification
      await showSeedPhraseVerification(wallet);
      
    } catch (error) {
      console.error('Wallet creation failed:', error);
      Alert.alert('Error', 'Failed to create wallet');
    }
  };

  const showSeedPhraseVerification = async (wallet: any) => {
    return new Promise<void>((resolve) => {
      Alert.alert(
        '🔑 Save Your Quantum Seed Phrase',
        `CRITICAL: Write down these words in order. This is the ONLY way to recover your wallet.\\n\\n${wallet.seedPhrase}\\n\\n⚠️ We will verify you saved it!`,
        [
          {
            text: 'I have written it down',
            onPress: () => {
              // Verification quiz
              const words = wallet.seedPhrase.split(' ');
              const randomIndex = Math.floor(Math.random() * 12);
              const correctWord = words[randomIndex];
              
              Alert.prompt(
                'Seed Phrase Verification',
                `Prove you saved your seed phrase.\\n\\nEnter word #${randomIndex + 1}:`,
                [
                  { text: 'Cancel', style: 'cancel', onPress: () => resolve() },
                  {
                    text: 'Verify',
                    onPress: (userWord) => {
                      if (userWord?.toLowerCase().trim() === correctWord.toLowerCase()) {
                        // Verification successful
                        setWallet(wallet);
                        Alert.alert(
                          '✅ Wallet Created!',
                          'Your quantum-resistant QuantumCoin wallet is ready!',
                          [{ text: 'Continue', onPress: () => navigation.navigate('Home') }]
                        );
                        resolve();
                      } else {
                        Alert.alert(
                          '❌ Verification Failed',
                          'Incorrect word. You must save your seed phrase to continue.',
                          [{ text: 'Try Again', onPress: () => resolve() }]
                        );
                      }
                    }
                  }
                ]
              );
            }
          }
        ]
      );
    });
  };

  const handleRestoreWallet = async () => {
    if (!seedPhrase.trim()) {
      Alert.alert('Error', 'Please enter your seed phrase');
      return;
    }

    if (!isValidSeedPhrase(seedPhrase)) {
      Alert.alert('Error', 'Invalid seed phrase format');
      return;
    }

    try {
      const wallet = await restoreWalletFromSeed(seedPhrase);
      setWallet(wallet);
      Alert.alert(
        '✅ Wallet Restored!',
        'Your QuantumCoin wallet has been restored successfully!',
        [{ text: 'Continue', onPress: () => navigation.navigate('Home') }]
      );
    } catch (error) {
      console.error('Wallet restoration failed:', error);
      Alert.alert('Error', 'Failed to restore wallet from seed phrase');
    }
  };

  const handleLogin = async () => {
    // For demo purposes, just navigate to home
    // In production, implement proper authentication
    Alert.alert('Demo Mode', 'Login functionality coming soon. Create a new wallet for now.');
  };

  return (
    <LinearGradient colors={['#0F0C29', '#24243e', '#302B63']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>⚛️</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>QuantumCoin</Text>
        <Text style={styles.subtitle}>Quantum-resistant cryptocurrency wallet</Text>

        {/* Auth Modes */}
        <View style={styles.modeSelector}>
          <TouchableOpacity
            style={[styles.modeButton, !isSignup && !isRestore && styles.modeButtonActive]}
            onPress={() => {
              setIsSignup(false);
              setIsRestore(false);
            }}
          >
            <Text style={[styles.modeButtonText, !isSignup && !isRestore && styles.modeButtonTextActive]}>
              Login
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.modeButton, isSignup && styles.modeButtonActive]}
            onPress={() => {
              setIsSignup(true);
              setIsRestore(false);
            }}
          >
            <Text style={[styles.modeButtonText, isSignup && styles.modeButtonTextActive]}>
              Create Wallet
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.modeButton, isRestore && styles.modeButtonActive]}
            onPress={() => {
              setIsSignup(false);
              setIsRestore(true);
            }}
          >
            <Text style={[styles.modeButtonText, isRestore && styles.modeButtonTextActive]}>
              Restore
            </Text>
          </TouchableOpacity>
        </View>

        {/* Forms */}
        <View style={styles.form}>
          {isRestore ? (
            <>
              <Text style={styles.formTitle}>Restore Quantum Wallet</Text>
              <TextInput
                style={[styles.input, styles.seedInput]}
                placeholder="Enter your 12-word seed phrase"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                value={seedPhrase}
                onChangeText={setSeedPhrase}
                multiline
                numberOfLines={3}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity style={styles.button} onPress={handleRestoreWallet}>
                <Text style={styles.buttonText}>🔄 Restore Wallet</Text>
              </TouchableOpacity>
            </>
          ) : isSignup ? (
            <>
              <Text style={styles.formTitle}>Create Quantum Wallet</Text>
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                value={name}
                onChangeText={setName}
              />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TextInput
                style={styles.input}
                placeholder="Password (8+ characters)"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
              <TouchableOpacity style={styles.button} onPress={handleCreateWallet}>
                <Text style={styles.buttonText}>⚡ Create Quantum Wallet</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.formTitle}>Sign In</Text>
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>🚀 Sign In</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(30, 60, 114, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#00ff88',
  },
  logoText: {
    fontSize: 32,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: '#00ff88',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 17,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 40,
  },
  modeSelector: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 4,
    marginBottom: 32,
  },
  modeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modeButtonActive: {
    backgroundColor: '#00ff88',
  },
  modeButtonText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '600',
    fontSize: 14,
  },
  modeButtonTextActive: {
    color: 'white',
  },
  form: {
    width: '100%',
  },
  formTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 16,
    color: 'white',
    fontSize: 16,
    marginBottom: 16,
  },
  seedInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#00ff88',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});
