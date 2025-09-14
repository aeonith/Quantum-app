import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

export default function RainBackground() {
  const opacity = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    const loop = setInterval(() => {
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.8, duration: 90, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 120, useNativeDriver: true })
      ]).start();
    }, 10000 + Math.random()*8000); // flash every 10-18s
    
    return () => clearInterval(loop);
  }, []);
  
  return (
    <View style={StyleSheet.absoluteFill}>
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: '#fff', opacity }]} />
    </View>
  );
}
