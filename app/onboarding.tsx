import React, { useState, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, Dimensions, ViewToken } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useStore } from '../store/useStore';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    title: 'Preserve their voice',
    description: 'Upload audio clips to create an AI persona that speaks in their familiar voice, bringing comfort when you need it most.',
    icon: 'microphone',
  },
  {
    id: '2',
    title: 'Share memories together',
    description: 'Invite family members to contribute photos, stories, and videos to a shared, private memory vault.',
    icon: 'account-group',
  },
  {
    id: '3',
    title: 'Heal at your own pace',
    description: 'Track your grief journey with daily reflections and find peace through guided, personalized memory milestones.',
    icon: 'heart',
  },
];

const Dot = ({ index, currentIndex }: { index: number, currentIndex: number }) => {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: withTiming(currentIndex === index ? 24 : 8, { duration: 300 }),
      backgroundColor: withTiming(currentIndex === index ? '#7C5CBF' : '#E8A0BF', { duration: 300 }),
    };
  });

  return (
    <Animated.View
      style={[
        { height: 8, borderRadius: 4, marginHorizontal: 4 },
        animatedStyle,
      ]}
    />
  );
};

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems[0]) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  }).current;

  const completeOnboarding = useStore((state) => state.completeOnboarding);

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      completeOnboarding();
      router.replace('/(auth)/login');
    }
  };

  const handleSkip = () => {
    completeOnboarding();
    router.replace('/(auth)/login');
  };

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <View className="flex-row justify-end px-6 pt-16 pb-4">
        <TouchableOpacity onPress={handleSkip}>
          <Text className="text-gray-500 dark:text-gray-400 font-sans text-base" style={{ fontFamily: 'Inter_500Medium' }}>
            Skip
          </Text>
        </TouchableOpacity>
      </View>

      {/* FlatList */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        bounces={false}
        renderItem={({ item }) => (
          <View style={{ width }} className="items-center justify-center px-8 flex-1">
            <View className="w-32 h-32 rounded-full bg-purple-50 dark:bg-slate-900 items-center justify-center mb-10">
              <MaterialCommunityIcons name={item.icon as any} size={64} color="#7C5CBF" />
            </View>
            <Text className="text-3xl text-center text-purple-600 dark:text-purple-300 mb-4" style={{ fontFamily: 'Lora_700Bold' }}>
              {item.title}
            </Text>
            <Text className="text-base text-center text-gray-500 dark:text-gray-400 leading-relaxed" style={{ fontFamily: 'Inter_400Regular' }}>
              {item.description}
            </Text>
          </View>
        )}
      />

      {/* Footer */}
      <View className="px-6 pb-12 pt-6">
        <View className="flex-row justify-center mb-10">
          {SLIDES.map((_, index) => (
            <Dot key={index} index={index} currentIndex={currentIndex} />
          ))}
        </View>

        <TouchableOpacity
          onPress={handleNext}
          className="bg-purple-600 rounded-xl py-4 items-center justify-center shadow-sm"
        >
          <Text className="text-white text-lg" style={{ fontFamily: 'Inter_700Bold' }}>
            {currentIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
