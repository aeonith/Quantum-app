import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import AuthScreen from './src/screens/AuthScreen';

// State and API
import { useQTCStore } from './src/state/store';
import { testConnection } from './src/api/qtc';
import { loadWallet } from './src/crypto/keys';

const Stack = createStackNavigator();

export default function App() {
  const { wallet, setWallet, setConnected, setError } = useQTCStore();

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Test connection to QuantumCoin node
      const connected = await testConnection();
      setConnected(connected);
      
      if (connected) {
        console.log('✅ Connected to QuantumCoin blockchain');
      } else {
        console.warn('❌ QuantumCoin node not available');
        setError('QuantumCoin node not running');
      }

      // Load existing wallet
      const existingWallet = await loadWallet();
      if (existingWallet) {
        setWallet(existingWallet);
        console.log('✅ Wallet loaded from secure storage');
      }
    } catch (error) {
      console.error('App initialization failed:', error);
      setError('Failed to initialize QuantumCoin app');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="#000" />
      
      {/* Galaxy Background */}
      <LinearGradient
        colors={['#0F0C29', '#24243e', '#302B63']}
        style={styles.background}
      />
      
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: 'transparent' },
          }}
        >
          {wallet ? (
            <Stack.Screen name="Home" component={HomeScreen} />
          ) : (
            <Stack.Screen name="Auth" component={AuthScreen} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
});
