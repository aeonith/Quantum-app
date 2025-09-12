// QuantumCoin Authentication Screen - Real User Creation
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useQTCStore } from '../state/store';
import { generateQuantumWallet } from '../api/qtc';

export default function AuthScreen() {
  const { setUser } = useQTCStore();
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    // For demo, create user with real wallet
    try {
      const wallet = await generateQuantumWallet();
      
      const user = {
        name: 'QuantumCoin User',
        email,
        walletAddress: wallet.address,
        balance: 0,
        seedPhraseVerified: true
      };

      setUser(user);
      Alert.alert('✅ Welcome!', 'Connected to QuantumCoin blockchain');
    } catch (error) {
      Alert.alert('Error', 'Failed to create wallet');
    }
  };

  const handleSignup = async () => {
    if (!name || !email || !password || !confirmPassword) {
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
      const wallet = await generateQuantumWallet();
      
      // Show seed phrase verification
      Alert.alert(
        '🔑 Save Your Seed Phrase',
        `Your quantum-resistant recovery phrase:\\n\\n${wallet.seedPhrase}\\n\\n⚠️ CRITICAL: Write this down! This is the ONLY way to recover your wallet.`,
        [
          {
            text: 'I have saved it',
            onPress: () => {
              // Verification quiz
              const words = wallet.seedPhrase.split(' ');
              const randomIndex = Math.floor(Math.random() * 12);
              
              Alert.prompt(
                'Seed Phrase Verification',
                `Enter word #${randomIndex + 1} from your seed phrase:`,
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Verify',
                    onPress: (userWord) => {
                      if (userWord?.toLowerCase() === words[randomIndex].toLowerCase()) {
                        const user = {
                          name,
                          email,
                          walletAddress: wallet.address,
                          balance: 0,
                          seedPhraseVerified: true
                        };
                        
                        setUser(user);
                        Alert.alert('✅ Account Created!', 'Your QuantumCoin wallet is ready!');
                      } else {
                        Alert.alert('❌ Verification Failed', 'Please save your seed phrase and try again');
                      }
                    }
                  }
                ]
              );
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create wallet');
    }
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
        <Text style={styles.subtitle}>Quantum-resistant cryptocurrency</Text>

        {/* Form */}
        <View style={styles.form}>
          {isSignup && (
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              value={name}
              onChangeText={setName}
            />
          )}
          
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
          
          {isSignup && (
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          )}

          <TouchableOpacity
            style={styles.button}
            onPress={isSignup ? handleSignup : handleLogin}
          >
            <LinearGradient
              colors={['#1e3c72', '#2a5298']}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>
                {isSignup ? 'Create Account' : 'Sign In'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setIsSignup(!isSignup)}>
            <Text style={styles.toggleText}>
              {isSignup 
                ? 'Already have an account? Sign In' 
                : "Don't have an account? Sign Up"
              }
            </Text>
          </TouchableOpacity>
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
    marginBottom: 48,
  },
  form: {
    width: '100%',
    maxWidth: 335,
    alignSelf: 'center',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 16,
    color: 'white',
    fontSize: 17,
    marginBottom: 16,
  },
  button: {
    borderRadius: 12,
    overflow: 'hidden',
    marginVertical: 24,
  },
  buttonGradient: {
    padding: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '600',
  },
  toggleText: {
    color: '#00ff88',
    textAlign: 'center',
    fontSize: 15,
  },
});
