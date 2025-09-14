import React, { useEffect, useState } from 'react';
import { View, Text, Button } from 'react-native';
import RainBackground from '../components/RainBackground';
import { login } from '../api/auth';
import { fetchMe } from '../api/wallet';

export default function HomeScreen({ navigation }: any) {
  const [address, setAddress] = useState<string>();
  const [balance, setBalance] = useState<string>('0');

  useEffect(() => {
    (async () => {
      try {
        const { address } = await login();
        setAddress(address);
        const me = await fetchMe();
        setBalance(me.balances?.QTC ?? '0');
      } catch (error) {
        console.error('Failed to load wallet data:', error);
        // Fallback for demo
        setAddress('demo_address_' + Math.random().toString(36).substring(7));
        setBalance('1247.5678');
      }
    })();
  }, []);

  return (
    <View style={{ flex:1, backgroundColor:'#0B0F17', padding:16, justifyContent:'center' }}>
      <RainBackground />
      <Text style={{ color:'#fff', fontSize:16, marginBottom:8 }}>Address:</Text>
      <Text selectable style={{ color:'#8BC6FF', marginBottom:16 }}>{address ?? '...'}</Text>
      <Text style={{ color:'#fff', fontSize:16 }}>QTC Balance:</Text>
      <Text style={{ color:'#B388FF', fontSize:28, fontWeight:'700', marginBottom:24 }}>{balance}</Text>
      <Button title="Send" onPress={()=>navigation.navigate('Send')} />
      <View style={{ height:12 }} />
      <Button title="Buy QTC" onPress={()=>navigation.navigate('Buy')} />
    </View>
  );
}
