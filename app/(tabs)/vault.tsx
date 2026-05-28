import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, Image, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';
import { Audio } from 'expo-av';

const { width } = Dimensions.get('window');

const FILTERS = ['All', 'Photos', 'Voice', 'Videos', 'Stories'];

export default function VaultScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState('All');
  const memories = useStore(state => state.memories);
  const [selectedMemory, setSelectedMemory] = useState<any | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);

  const filteredMemories = activeFilter === 'All' ? memories : memories.filter(m => {
    if (activeFilter === 'Photos') return m.type === 'photo';
    if (activeFilter === 'Voice') return m.type === 'audio';
    if (activeFilter === 'Videos') return m.type === 'video';
    if (activeFilter === 'Stories') return m.type === 'text';
    return true;
  });

  // Simple masonry layout logic (two columns)
  const leftColumn = filteredMemories.filter((_, i) => i % 2 === 0);
  const rightColumn = filteredMemories.filter((_, i) => i % 2 !== 0);

  const togglePlayAudio = async (uri: string) => {
    if (isPlaying) {
      if (soundRef.current) {
        await soundRef.current.stopAsync().catch(() => {});
        await soundRef.current.unloadAsync().catch(() => {});
        soundRef.current = null;
      }
      setIsPlaying(false);
      return;
    }

    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true }
      );
      soundRef.current = sound;
      setIsPlaying(true);
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
          sound.unloadAsync().catch(() => {});
          soundRef.current = null;
        }
      });
    } catch (error) {
      console.error("Failed to play audio:", error);
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(() => {});
      }
    };
  }, []);

  const renderMemoryCard = (item: any) => {
    const height = item.type === 'photo' ? 180 : item.type === 'audio' ? 120 : item.type === 'text' ? 190 : 150;
    return (
      <TouchableOpacity 
        key={item.id} 
        onPress={() => {
          setIsPlaying(false);
          setSelectedMemory(item);
        }}
        className="bg-white dark:bg-slate-900 mb-4 rounded-3xl overflow-hidden shadow-sm border border-gray-100 dark:border-slate-800"
      >
        <View 
          style={{ height }} 
          className="bg-purple-50 dark:bg-slate-950 items-center justify-center relative overflow-hidden"
        >
          {item.type === 'photo' && item.content ? (
            <Image source={{ uri: item.content }} className="w-full h-full" style={{ resizeMode: 'cover' }} />
          ) : item.type === 'text' ? (
            <View className="p-4 w-full h-full justify-start items-start bg-pink-50/10 dark:bg-purple-950/10">
              <MaterialCommunityIcons name="format-quote-open" size={16} color="#E8A0BF" className="mb-1" />
              <Text className="text-gray-600 dark:text-gray-300 text-xs italic leading-5" numberOfLines={5}>
                {item.content}
              </Text>
            </View>
          ) : item.type === 'audio' ? (
            <View className="items-center justify-center">
              <View className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/50 items-center justify-center mb-2">
                <MaterialCommunityIcons name="microphone" size={20} color="#7C5CBF" />
              </View>
              <Text className="text-[10px] text-purple-600 dark:text-purple-300 font-semibold" style={{ fontFamily: 'Inter_500Medium' }}>Audio Note</Text>
            </View>
          ) : item.type === 'video' ? (
            <View className="w-full h-full items-center justify-center bg-slate-200 dark:bg-slate-800 relative">
              {item.content ? (
                <View className="w-full h-full bg-purple-100 dark:bg-slate-850 items-center justify-center">
                  <MaterialCommunityIcons name="video" size={32} color="#7C5CBF" />
                </View>
              ) : (
                <MaterialCommunityIcons name="video" size={32} color="#6B7280" />
              )}
              <View className="absolute w-10 h-10 rounded-full bg-black/40 items-center justify-center">
                <MaterialCommunityIcons name="play" size={20} color="#FFF" />
              </View>
            </View>
          ) : (
            <MaterialCommunityIcons 
              name="image" 
              size={40} 
              color="#E8A0BF" 
              opacity={0.5} 
            />
          )}
          
          {/* Emotion Chip */}
          <View className="absolute top-2 right-2 bg-white/90 dark:bg-slate-900/90 px-2 py-0.5 rounded-full shadow-sm">
            <Text className="text-[9px] text-purple-600 dark:text-purple-300 font-semibold" style={{ fontFamily: 'Inter_500Medium' }}>
              {item.emotion}
            </Text>
          </View>
        </View>

        <View className="p-3">
          <Text className="text-purple-600 dark:text-purple-300 text-xs" style={{ fontFamily: 'Inter_500Medium' }} numberOfLines={1}>
            {item.title}
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 text-[10px] mt-0.5" style={{ fontFamily: 'Inter_400Regular' }}>
            {item.date}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950" edges={['top']}>
      {/* Header */}
      <View className="px-6 py-4 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 pt-10">
        <Text className="text-2xl text-purple-600 dark:text-purple-300" style={{ fontFamily: 'Lora_700Bold' }}>
          Memory Vault
        </Text>
      </View>

      {/* Filters */}
      <View>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          className="py-4 pl-6 bg-white dark:bg-[#1E1E1E] border-b border-gray-100 dark:border-slate-800"
        >
          {FILTERS.map((filter) => (
            <TouchableOpacity 
              key={filter}
              onPress={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-full mr-2 border ${
                activeFilter === filter ? 'bg-purple-600 border-purple-600' : 'bg-white dark:bg-slate-900 border-purple-100 dark:border-slate-800'
              }`}
            >
              <Text 
                className={`text-sm ${activeFilter === filter ? 'text-white' : 'text-gray-500 dark:text-purple-300'}`}
                style={{ fontFamily: activeFilter === filter ? 'Inter_700Bold' : 'Inter_500Medium' }}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
          <View className="w-6" />
        </ScrollView>
      </View>

      {/* Masonry Grid */}
      <ScrollView className="flex-1 px-4 pt-4">
        {filteredMemories.length === 0 ? (
          <View className="flex-1 items-center justify-center mt-20">
            <View className="w-32 h-32 rounded-full bg-purple-50 dark:bg-slate-900 items-center justify-center mb-6">
              <MaterialCommunityIcons name="image-plus" size={48} color="#7C5CBF" />
            </View>
            <Text className="text-xl text-purple-600 dark:text-purple-300 mb-2" style={{ fontFamily: 'Lora_700Bold' }}>Vault is empty</Text>
            <Text className="text-gray-500 dark:text-gray-400 text-center" style={{ fontFamily: 'Inter_400Regular' }}>
              Be the first to add a memory and start preserving their legacy.
            </Text>
          </View>
        ) : (
          <View className="flex-row justify-between pb-32">
            <View style={{ width: (width - 40) / 2 }}>
              {leftColumn.map(renderMemoryCard)}
            </View>
            <View style={{ width: (width - 40) / 2 }}>
              {rightColumn.map(renderMemoryCard)}
            </View>
          </View>
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity 
        onPress={() => router.push('/add-memory')}
        className="absolute bottom-28 right-6 w-16 h-16 bg-purple-600 rounded-full items-center justify-center shadow-md shadow-purple-900"
      >
        <MaterialCommunityIcons name="plus" size={32} color="#FFF" />
      </TouchableOpacity>

      {/* Complete Details Modal */}
      <Modal
        visible={!!selectedMemory}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          if (soundRef.current) soundRef.current.unloadAsync().catch(() => {});
          setIsPlaying(false);
          setSelectedMemory(null);
        }}
      >
        <View className="flex-1 justify-end bg-black/60">
          <View className="bg-white dark:bg-slate-900 rounded-t-[40px] px-6 pt-6 pb-12 w-full max-h-[90%] shadow-2xl border-t border-gray-100 dark:border-slate-800">
            {/* Modal Header */}
            <View className="flex-row items-center justify-between mb-6">
              <View className="flex-row items-center bg-purple-50 dark:bg-slate-800 px-3 py-1.5 rounded-full">
                <MaterialCommunityIcons 
                  name={
                    selectedMemory?.type === 'photo' ? 'image' : 
                    selectedMemory?.type === 'audio' ? 'microphone' : 
                    selectedMemory?.type === 'video' ? 'video' : 'text-box'
                  } 
                  size={16} 
                  color="#7C5CBF" 
                />
                <Text className="text-purple-600 dark:text-purple-300 text-xs font-semibold ml-1.5 capitalize" style={{ fontFamily: 'Inter_500Medium' }}>
                  {selectedMemory?.type} Memory
                </Text>
              </View>
              <TouchableOpacity 
                onPress={() => {
                  if (soundRef.current) soundRef.current.unloadAsync().catch(() => {});
                  setIsPlaying(false);
                  setSelectedMemory(null);
                }} 
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-850 items-center justify-center"
              >
                <MaterialCommunityIcons name="close" size={20} color="#7C5CBF" />
              </TouchableOpacity>
            </View>

            {/* Modal Content */}
            <ScrollView showsVerticalScrollIndicator={false} className="mb-6">
              <Text className="text-2xl text-slate-800 dark:text-white mb-2" style={{ fontFamily: 'Lora_700Bold' }}>
                {selectedMemory?.title}
              </Text>
              <View className="flex-row items-center mb-6">
                <MaterialCommunityIcons name="calendar" size={14} color="#9CA3AF" />
                <Text className="text-gray-500 dark:text-gray-400 text-xs ml-1" style={{ fontFamily: 'Inter_400Regular' }}>
                  {selectedMemory?.date}
                </Text>
                <View className="w-1.5 h-1.5 rounded-full bg-pink-400 mx-2" />
                <MaterialCommunityIcons name="heart" size={14} color="#f472b6" />
                <Text className="text-[#f472b6] text-xs ml-1 font-semibold" style={{ fontFamily: 'Inter_500Medium' }}>
                  {selectedMemory?.emotion}
                </Text>
              </View>

              {/* Dynamic Media View inside Modal */}
              <View className="w-full rounded-3xl overflow-hidden mb-6 bg-slate-50 dark:bg-slate-950 items-center justify-center border border-gray-100 dark:border-slate-800">
                {selectedMemory?.type === 'photo' && selectedMemory?.content && (
                  <Image source={{ uri: selectedMemory.content }} className="w-full h-72" style={{ resizeMode: 'contain' }} />
                )}

                {selectedMemory?.type === 'text' && (
                  <View className="p-5 w-full bg-pink-50/5 dark:bg-purple-950/5 rounded-2xl">
                    <MaterialCommunityIcons name="format-quote-open" size={24} color="#E8A0BF" className="mb-2" />
                    <Text className="text-slate-700 dark:text-gray-200 text-base leading-7 italic" style={{ fontFamily: 'Inter_400Regular' }}>
                      {selectedMemory.content}
                    </Text>
                  </View>
                )}

                {selectedMemory?.type === 'audio' && selectedMemory?.content && (
                  <View className="p-8 w-full items-center justify-center">
                    <TouchableOpacity 
                      onPress={() => togglePlayAudio(selectedMemory.content)}
                      className={`w-20 h-20 rounded-full items-center justify-center shadow-lg ${isPlaying ? 'bg-red-500 shadow-red-300' : 'bg-purple-600 shadow-purple-300'}`}
                    >
                      <MaterialCommunityIcons 
                        name={isPlaying ? 'pause' : 'play'} 
                        size={40} 
                        color="#FFF" 
                      />
                    </TouchableOpacity>
                    <Text className="text-purple-600 dark:text-purple-300 mt-4 font-semibold text-sm" style={{ fontFamily: 'Inter_500Medium' }}>
                      {isPlaying ? 'Playing Audio Note...' : 'Tap to Listen'}
                    </Text>
                  </View>
                )}

                {selectedMemory?.type === 'video' && selectedMemory?.content && (
                  <View className="w-full h-64 bg-slate-950 items-center justify-center">
                    <MaterialCommunityIcons name="video" size={64} color="#E8A0BF" className="mb-4" />
                    <TouchableOpacity className="bg-purple-600 px-6 py-3 rounded-full flex-row items-center shadow-sm">
                      <MaterialCommunityIcons name="play" size={20} color="#FFF" />
                      <Text className="text-white font-bold ml-1.5">Play Video</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
