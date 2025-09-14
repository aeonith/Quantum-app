import React, { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { startBuy } from '../api/wallet';

export default function BuyScreen() {
  const [amountUSD, setAmountUSD] = useState('50');
  
  const onBuy = async () => {
    try {
      const { checkoutUrl } = await startBuy(parseFloat(amountUSD));
      await WebBrowser.openBrowserAsync(checkoutUrl);
    } catch (e:any) {
      Alert.alert('Error', e?.response?.data?.error ?? 'Failed to start buy');
    }
  };
  
  return (
    <View style={{ flex:1, backgroundColor:'#0B0F17', padding:16 }}>
      <TextInput value={amountUSD} onChangeText={setAmountUSD} keyboardType="decimal-pad"
                 placeholder="$50" placeholderTextColor="#666"
                 style={{ backgroundColor:'#101521', color:'#fff', padding:12, borderRadius:12, marginBottom:16 }} />
      <Button title="Start buy (MoonPay/Transak)" onPress={onBuy} />
    </View>
  );
}
