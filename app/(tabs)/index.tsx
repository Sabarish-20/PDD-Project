import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '../../store/useStore';

export default function DashboardScreen() {
  const router = useRouter();
  const profile = useStore((state) => state.profile);
  const memories = useStore((state) => state.memories);
  const username = useStore((state) => state.username);
  const fetchUserData = useStore((state) => state.fetchUserData);
  const insets = useSafeAreaInsets();

  useFocusEffect(
    React.useCallback(() => {
      fetchUserData();
    }, [])
  );

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const randomMemory = memories && memories.length > 0 ? memories[Math.floor(Math.random() * memories.length)] : null;

  return (
    <ScrollView 
      className="flex-1 bg-slate-50 dark:bg-slate-950" 
      contentContainerStyle={{ paddingTop: insets.top + 20, paddingBottom: 100 }}
    >
      <View className="px-6 mb-8">
        <Text className="text-gray-500 dark:text-gray-400 text-sm mb-1" style={{ fontFamily: 'Inter_500Medium' }}>{today}</Text>
        <Text className="text-3xl text-slate-800 dark:text-white" style={{ fontFamily: 'Lora_700Bold' }}>
          Hello, {username || 'there'}
        </Text>
      </View>

      <View className="px-6 pt-6 pb-32">
        {/* Milestone Badge - Favorite Phrase */}
        {profile?.phrases && profile.phrases.length > 0 && (
          <View className="bg-purple-50 dark:bg-slate-900 rounded-xl p-4 flex-row items-center mb-6 border border-purple-100 dark:border-slate-800">
            <MaterialCommunityIcons name="format-quote-close" size={24} color="#f472b6" />
            <View className="ml-3 flex-1">
              <Text className="text-pink-500 text-sm" style={{ fontFamily: 'Inter_700Bold' }}>Their Favorite Phrase</Text>
              <Text className="text-gray-500 dark:text-gray-400 text-xs mt-0.5" style={{ fontFamily: 'Inter_400Regular' }}>"{profile.phrases[0]}"</Text>
            </View>
          </View>
        )}

        {/* Hero Card */}
        <TouchableOpacity 
          onPress={() => router.push('/create-profile')}
          className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-800 mb-8 items-center relative overflow-hidden"
        >
          <View className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-bl-full" />
          <View className="absolute bottom-0 left-0 w-24 h-24 bg-purple-50 rounded-tr-full" />

          <View className="w-24 h-24 rounded-full bg-purple-100 items-center justify-center mb-4 border-4 border-white shadow-sm overflow-hidden">
            {profile?.avatar ? (
              <Image source={{ uri: profile.avatar }} className="w-full h-full" />
            ) : (
              <MaterialCommunityIcons name="account" size={48} color="#7C5CBF" />
            )}
          </View>
          <Text className="text-2xl text-purple-600 dark:text-purple-300" style={{ fontFamily: 'Lora_700Bold' }}>{profile?.name || 'Create a Profile'}</Text>
          <Text className="text-gray-500 dark:text-gray-400 mt-1 bg-slate-50 dark:bg-slate-950 px-3 py-1 rounded-full text-xs" style={{ fontFamily: 'Inter_500Medium' }}>{profile?.relationship || 'Loved One'}</Text>
        </TouchableOpacity>

        {/* Action Cards 2x2 Grid */}
        <View className="flex-row flex-wrap justify-between mb-8">
          <TouchableOpacity
            onPress={() => router.navigate('/(tabs)/chat')}
            className="w-[48%] bg-purple-600 rounded-3xl p-5 mb-4 shadow-sm"
          >
            <View className="bg-purple-400/50 w-12 h-12 rounded-2xl items-center justify-center mb-4">
              <MaterialCommunityIcons name="message-text" size={24} color="#FFF" />
            </View>
            <Text className="text-white text-base" style={{ fontFamily: 'Inter_700Bold' }}>Chat with {profile?.name ? profile.name.split(' ')[0] : 'Them'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.navigate('/(tabs)/voice')}
            className="w-[48%] bg-pink-500 rounded-3xl p-5 mb-4 shadow-sm"
          >
            <View className="bg-pink-300/50 w-12 h-12 rounded-2xl items-center justify-center mb-4">
              <MaterialCommunityIcons name="microphone" size={24} color="#FFF" />
            </View>
            <Text className="text-white text-base" style={{ fontFamily: 'Inter_700Bold' }}>Hear Their Voice</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/add-memory')}
            className="w-[48%] bg-blue-500 rounded-3xl p-5 shadow-sm"
          >
            <View className="bg-blue-300/50 w-12 h-12 rounded-2xl items-center justify-center mb-4">
              <MaterialCommunityIcons name="plus" size={24} color="#FFF" />
            </View>
            <Text className="text-white text-base" style={{ fontFamily: 'Inter_700Bold' }}>Add Memory</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.navigate('/(tabs)/vault')}
            className="w-[48%] bg-amber-500 rounded-3xl p-5 shadow-sm"
          >
            <View className="bg-amber-300/50 w-12 h-12 rounded-2xl items-center justify-center mb-4">
              <MaterialCommunityIcons name="safe" size={24} color="#FFF" />
            </View>
            <Text className="text-white text-base" style={{ fontFamily: 'Inter_700Bold' }}>Memory Vault</Text>
          </TouchableOpacity>
        </View>

        {/* Memory of the Day */}
        <View className="mb-8">
          <Text className="text-lg text-slate-800 dark:text-white mb-4" style={{ fontFamily: 'Lora_700Bold' }}>Memory of the Day</Text>
          <TouchableOpacity 
            onPress={() => router.navigate('/(tabs)/vault')}
            activeOpacity={0.9}
            className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-slate-800"
          >
            {randomMemory ? (
              <>
                <View className="flex-row items-center mb-4">
                  <View className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-950/80 items-center justify-center mr-3">
                    <MaterialCommunityIcons 
                      name={randomMemory.type === 'audio' ? 'microphone' : randomMemory.type === 'photo' ? 'image' : randomMemory.type === 'video' ? 'video' : 'text-box'} 
                      size={20} 
                      color="#7C5CBF" 
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-slate-800 dark:text-white font-bold">{randomMemory.title}</Text>
                    <Text className="text-gray-500 text-xs">{randomMemory.date}</Text>
                  </View>
                  <View className="bg-pink-50 dark:bg-purple-950 px-2.5 py-1 rounded-full">
                    <Text className="text-[10px] text-purple-600 dark:text-purple-300 font-bold" style={{ fontFamily: 'Inter_500Medium' }}>
                      {randomMemory.emotion}
                    </Text>
                  </View>
                </View>

                {/* Media Preview Block */}
                <View className="w-full rounded-2xl overflow-hidden mb-4 bg-slate-50 dark:bg-slate-950 items-center justify-center border border-gray-100/50 dark:border-slate-800">
                  {randomMemory.type === 'photo' && randomMemory.content && (
                    <Image source={{ uri: randomMemory.content }} className="w-full h-48" style={{ resizeMode: 'cover' }} />
                  )}

                  {randomMemory.type === 'text' && (
                    <View className="p-4 w-full bg-pink-50/5 dark:bg-purple-950/5 rounded-2xl">
                      <MaterialCommunityIcons name="format-quote-open" size={20} color="#E8A0BF" className="mb-1" />
                      <Text className="text-gray-600 dark:text-gray-300 text-sm leading-6 italic" style={{ fontFamily: 'Inter_400Regular' }} numberOfLines={4}>
                        {randomMemory.content}
                      </Text>
                    </View>
                  )}

                  {randomMemory.type === 'audio' && (
                    <View className="p-6 w-full flex-row items-center justify-between">
                      <View className="flex-row items-center">
                        <View className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 items-center justify-center mr-3">
                          <MaterialCommunityIcons name="play" size={20} color="#7C5CBF" />
                        </View>
                        <View>
                          <Text className="text-slate-800 dark:text-gray-200 text-xs font-semibold" style={{ fontFamily: 'Inter_500Medium' }}>Voice Note Recording</Text>
                          <Text className="text-gray-400 text-[10px]">Tap to open Vault and play</Text>
                        </View>
                      </View>
                      <MaterialCommunityIcons name="waveform" size={28} color="#E8A0BF" />
                    </View>
                  )}

                  {randomMemory.type === 'video' && (
                    <View className="w-full h-40 bg-slate-200 dark:bg-slate-800 items-center justify-center relative">
                      <MaterialCommunityIcons name="video" size={32} color="#7C5CBF" />
                      <View className="absolute w-10 h-10 rounded-full bg-black/40 items-center justify-center">
                        <MaterialCommunityIcons name="play" size={20} color="#FFF" />
                      </View>
                    </View>
                  )}
                </View>

                {randomMemory.type !== 'text' && (
                  <Text className="text-gray-600 dark:text-gray-300 leading-6 italic px-1" style={{ fontFamily: 'Inter_400Regular' }}>
                    {randomMemory.title}
                  </Text>
                )}
              </>
            ) : (
              <Text className="text-gray-500 text-center py-4">No memories added yet. Share a moment to see it here.</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
