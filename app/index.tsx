import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { useStore } from '../store/useStore';

export default function SplashScreenComponent() {
  const router = useRouter();
  const isAuthenticated = useStore((state) => state.isAuthenticated);

  // Animation values
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);

  useEffect(() => {
    // Start animations
    opacity.value = withTiming(1, { duration: 1000, easing: Easing.out(Easing.ease) });
    scale.value = withTiming(1, { duration: 1000, easing: Easing.out(Easing.ease) });

    // Navigate to appropriate screen after 2.5 seconds
    const timer = setTimeout(() => {
      if (isAuthenticated) {
        router.replace('/(tabs)/');
      } else {
        router.replace('/onboarding');
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <View className="flex-1 bg-slate-50 items-center justify-center">
      <Animated.View style={[animatedStyle, { alignItems: 'center' }]}>
        {/* Candle Flame SVG */}
        <Svg width="80" height="80" viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 2C12 2 8 8 8 13C8 15.2091 9.79086 17 12 17C14.2091 17 16 15.2091 16 13C16 8 12 2 12 2Z"
            fill="#7C5CBF"
          />
          <Path
            d="M12 17C11.5 17 10 18.5 10 20C10 21.5 12 22 12 22C12 22 14 21.5 14 20C14 18.5 12.5 17 12 17Z"
            fill="#E8A0BF"
          />
        </Svg>

        {/* Title */}
        <Text className="text-4xl font-serif text-purple-600 mt-6 mb-2" style={{ fontFamily: 'Lora_700Bold' }}>
          GriefBridge
        </Text>

        {/* Tagline */}
        <Text className="text-base font-sans text-gray-500" style={{ fontFamily: 'Inter_400Regular' }}>
          Keep their memory alive
        </Text>
      </Animated.View>
    </View>
  );
}
