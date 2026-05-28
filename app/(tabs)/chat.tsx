import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence, SharedValue } from 'react-native-reanimated';
import { useStore } from '../../store/useStore';
import { generateAIResponse, Message } from '../../utils/aiUtils';

import { Audio } from 'expo-av';
import { generateSpeech } from '../../utils/elevenLabsUtils';

// Simple Typing Indicator
const TypingIndicator = () => {
  const dot1 = useSharedValue(0);
  const dot2 = useSharedValue(0);
  const dot3 = useSharedValue(0);

  useEffect(() => {
    const animateDot = (dot: SharedValue<number>, delay: number) => {
      setTimeout(() => {
        dot.value = withRepeat(
          withSequence(
            withTiming(-5, { duration: 300 }),
            withTiming(0, { duration: 300 })
          ),
          -1,
          true
        );
      }, delay);
    };

    animateDot(dot1, 0);
    animateDot(dot2, 150);
    animateDot(dot3, 300);
  }, []);

  const getStyle = (dot: SharedValue<number>) => useAnimatedStyle(() => ({
    transform: [{ translateY: dot.value }]
  }));

  return (
    <View className="flex-row items-center p-2">
      <Animated.View className="w-2 h-2 bg-pink-400 rounded-full" style={getStyle(dot1)} />
      <Animated.View className="w-2 h-2 bg-pink-400 rounded-full ml-1" style={getStyle(dot2)} />
      <Animated.View className="w-2 h-2 bg-pink-400 rounded-full ml-1" style={getStyle(dot3)} />
    </View>
  );
};

export default function ChatScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { profile, memories } = useStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isPlaying, setIsPlaying] = useState<number | null>(null);

  const starters = [
    "What would you say about today?",
    "Tell me a story",
    "What advice do you have?"
  ];

  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(() => {});
      }
    };
  }, []);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;
    
    // Add user message
    const newMsg: Message = { content: text, role: 'user' };
    setMessages(prev => [...prev, newMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      // Pass the current conversation history (excluding the new message which we pass separately)
      const aiResponseText = await generateAIResponse(profile, memories, messages, text);
      
      setIsTyping(false);
      setMessages(prev => [...prev, {
        content: aiResponseText,
        role: 'assistant'
      }]);
    } catch (error) {
      console.error("Failed to fetch AI response:", error);
      setIsTyping(false);
      setMessages(prev => [...prev, {
        content: "I'm having trouble connecting right now. Can we talk later?",
        role: 'assistant'
      }]);
    }
  };

  const playMessage = async (text: string, index: number) => {
    // Elegant fallback: If the ElevenLabs key doesn't support custom voice cloning (free tier),
    // we use a highly expressive pre-made ElevenLabs public voice based on the relationship gender.
    const relationLower = (profile?.relationship || '').toLowerCase().trim();
    const isMaleRelation = ['father', 'dad', 'grandfather', 'grandpa', 'brother', 'husband', 'uncle', 'son'].includes(relationLower);
    
    // 'ErXwobaYiN019PkySvjV' (Antoni - Deep/Empathetic Male) or 'EXAVITQu4vr4xnSDxMaL' (Bella - Soft/Empathetic Female)
    const fallbackVoiceId = isMaleRelation ? 'ErXwobaYiN019PkySvjV' : 'EXAVITQu4vr4xnSDxMaL';
    const activeVoiceId = profile?.voiceId || fallbackVoiceId;

    try {
      setIsPlaying(index);

      if (soundRef.current) {
        await soundRef.current.unloadAsync().catch(() => {});
        soundRef.current = null;
      }

      const audioUri = await generateSpeech(text, activeVoiceId);
      const { sound } = await Audio.Sound.createAsync({ uri: audioUri });
      soundRef.current = sound;

      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(null);
          sound.unloadAsync().catch(() => {});
          if (soundRef.current === sound) {
            soundRef.current = null;
          }
        }
      });
    } catch (error) {
      console.error("Playback error:", error);
      setIsPlaying(null);
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(() => {});
        soundRef.current = null;
      }
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950" edges={['top']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        keyboardVerticalOffset={90}
      >
        {/* Header */}
        <View className="flex-row items-center px-6 py-4 bg-white dark:bg-slate-900 shadow-sm border-b border-gray-100 dark:border-slate-800 z-10 pt-10">
          <TouchableOpacity onPress={() => router.back()} className="mr-4 -ml-2 p-2">
            <MaterialCommunityIcons name="arrow-left" size={24} color="#7C5CBF" />
          </TouchableOpacity>
          <View className="w-10 h-10 rounded-full bg-purple-100 dark:bg-slate-800 items-center justify-center mr-3">
            <MaterialCommunityIcons name="account" size={24} color="#7C5CBF" />
          </View>
          <View className="flex-1">
            <Text className="text-lg text-purple-600 dark:text-purple-300" style={{ fontFamily: 'Lora_700Bold' }}>{profile?.name ? profile.name.split(' ')[0] : 'Loved One'}</Text>
            <View className="flex-row items-center">
              <View className="w-2 h-2 rounded-full bg-pink-400 mr-1" />
              <Text className="text-xs text-gray-500 dark:text-gray-400" style={{ fontFamily: 'Inter_500Medium' }}>Memory Mode</Text>
            </View>
          </View>
        </View>

        {/* Chat Area */}
        <ScrollView className="flex-1 px-4 pt-4" contentContainerStyle={{ paddingBottom: 20 }}>
          {messages.length === 0 ? (
            <View className="flex-1 justify-center items-center mt-20">
              <MaterialCommunityIcons name="message-text-outline" size={48} color="#f472b6" opacity={0.5} className="mb-4" />
              <Text className="text-gray-500 dark:text-gray-400 mb-6 text-center" style={{ fontFamily: 'Inter_400Regular' }}>
                Start a conversation with {profile?.name ? profile.name.split(' ')[0] : 'your loved one'}'s memory persona.
              </Text>
              <View className="w-full flex-row flex-wrap justify-center gap-2">
                {starters.map((starter, index) => (
                  <TouchableOpacity 
                    key={index}
                    onPress={() => handleSend(starter)}
                    className="bg-white dark:bg-slate-900 border border-purple-100 dark:border-slate-800 rounded-full px-4 py-2 mb-2 shadow-sm"
                  >
                    <Text className="text-purple-600 dark:text-purple-300 text-sm" style={{ fontFamily: 'Inter_500Medium' }}>{starter}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : (
            <View className="flex-1">
              {messages.map((msg, idx) => (
                <View key={idx.toString()} className={`mb-4 max-w-[80%] ${msg.role === 'user' ? 'self-end' : 'self-start'}`}>
                  {msg.role === 'assistant' && (
                    <Text className="text-xs text-gray-500 dark:text-gray-400 mb-1 ml-1" style={{ fontFamily: 'Inter_500Medium' }}>{profile?.name ? profile.name.split(' ')[0] : 'Loved One'}</Text>
                  )}
                  <View className={`p-4 rounded-2xl ${msg.role === 'user' ? 'bg-purple-600 dark:bg-purple-600 rounded-tr-sm' : 'bg-white dark:bg-slate-900 rounded-tl-sm shadow-sm border border-gray-100 dark:border-slate-800'}`}>
                    <Text className={`text-base ${msg.role === 'user' ? 'text-white' : 'text-[#2D2D2D] dark:text-gray-200'}`} style={{ fontFamily: 'Inter_400Regular' }}>
                      {msg.content}
                    </Text>
                    {msg.role === 'assistant' && profile?.voiceId && (
                      <TouchableOpacity 
                        onPress={() => playMessage(msg.content, idx)}
                        className="mt-2 flex-row items-center self-end"
                        disabled={isPlaying === idx}
                      >
                        <MaterialCommunityIcons 
                          name={isPlaying === idx ? "loading" : "volume-high"} 
                          size={18} 
                          color="#7C5CBF" 
                          className={isPlaying === idx ? "animate-spin" : ""}
                        />
                        <Text className="text-xs text-purple-600 dark:text-purple-300 ml-1" style={{ fontFamily: 'Inter_500Medium' }}>
                          {isPlaying === idx ? "Generating..." : "Listen"}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
              
              {isTyping && (
                <View className="self-start mb-4 max-w-[80%]">
                  <Text className="text-xs text-gray-500 dark:text-gray-400 mb-1 ml-1" style={{ fontFamily: 'Inter_500Medium' }}>{profile?.name ? profile.name.split(' ')[0] : 'Loved One'}</Text>
                  <View className="bg-white dark:bg-slate-900 p-3 rounded-2xl rounded-tl-sm shadow-sm border border-gray-100 dark:border-slate-800 w-16">
                    <TypingIndicator />
                  </View>
                </View>
              )}
            </View>
          )}
        </ScrollView>

        {/* Input Area */}
        <View 
          className="px-4 pt-3 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800"
          style={{ paddingBottom: Math.max(insets.bottom, 12) }}
        >
          <View className="flex-row items-center">
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder={`Message ${profile?.name ? profile.name.split(' ')[0] : 'Loved One'}...`}
              placeholderTextColor="#9CA3AF"
              className="flex-1 bg-slate-50 dark:bg-slate-950 border border-purple-100 dark:border-slate-800 rounded-full px-5 py-3 text-base mr-2 text-slate-800 dark:text-gray-200"
              style={{ fontFamily: 'Inter_400Regular' }}
            />
            <TouchableOpacity 
              onPress={() => handleSend(inputText)}
              className="w-12 h-12 bg-purple-600 rounded-full items-center justify-center shadow-sm"
            >
              <MaterialCommunityIcons name="send" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
          <Text className="text-center text-[10px] text-gray-500 dark:text-gray-500 mt-2" style={{ fontFamily: 'Inter_400Regular' }}>
            Responses inspired by {profile?.name ? profile.name.split(' ')[0] : 'your loved one'}'s memories
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
