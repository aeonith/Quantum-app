// QuantumCoin App - Real Cryptocurrency Mobile App
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StyleSheet, View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import SendScreen from './src/screens/SendScreen';
import AuthScreen from './src/screens/AuthScreen';

// State
import { useQTCStore } from './src/state/store';
import qtcRPC from './src/api/qtc';

const Stack = createStackNavigator();

export default function App() {
  const { user, setConnected, setError } = useQTCStore();

  useEffect(() => {
    // Test connection to QuantumCoin node on app start
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      const connected = await qtcRPC.isConnected();
      setConnected(connected);
      
      if (connected) {
        console.log('✅ Connected to QuantumCoin blockchain');
      } else {
        console.warn('❌ Failed to connect to QuantumCoin node');
        setError('Unable to connect to QuantumCoin blockchain');
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      setConnected(false);
      setError('QuantumCoin node connection failed');
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
            cardStyleInterpolator: ({ current }) => ({
              cardStyle: {
                opacity: current.progress,
              },
            }),
          }}
        >
          {user ? (
            <>
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen name="Send" component={SendScreen} />
              <Stack.Screen name="Receive" component={ReceiveScreen} />
              <Stack.Screen name="RevStop" component={RevStopScreen} />
            </>
          ) : (
            <Stack.Screen name="Auth" component={AuthScreen} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
}

// Placeholder screens to be implemented
function ReceiveScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: 'white', fontSize: 18 }}>Receive Screen</Text>
      <Text style={{ color: 'rgba(255, 255, 255, 0.7)', marginTop: 8 }}>
        Coming soon - QR code generation
      </Text>
    </View>
  );
}

function RevStopScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: 'white', fontSize: 18 }}>RevStop™ Screen</Text>
      <Text style={{ color: 'rgba(255, 255, 255, 0.7)', marginTop: 8 }}>
        Coming soon - Emergency protection
      </Text>
    </View>
  );
}

function AuthScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: 'white', fontSize: 18 }}>Authentication Screen</Text>
      <Text style={{ color: 'rgba(255, 255, 255, 0.7)', marginTop: 8 }}>
        Coming soon - Login/Signup
      </Text>
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
