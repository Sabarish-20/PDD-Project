import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Platform, KeyboardAvoidingView, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useStore } from '../store/useStore';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import Animated from 'react-native-reanimated';
import { uploadFileToBackend } from '../utils/uploadUtils';

const UPLOAD_TYPES = [
  { id: 'photo', label: 'Photo', icon: 'image' },
  { id: 'voice', label: 'Voice', icon: 'microphone' },
  { id: 'video', label: 'Video', icon: 'video' },
  { id: 'story', label: 'Story', icon: 'text-box' },
];

const EMOTIONS = ['Happy', 'Funny', 'Proud', 'Bittersweet', 'Peaceful'];

export default function AddMemoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeType, setActiveType] = useState('photo');
  const [caption, setCaption] = useState('');
  const [sharedBy, setSharedBy] = useState('');
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [activeEmotion, setActiveEmotion] = useState('Happy');
  const [mediaUri, setMediaUri] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  const onChangeDate = (event: any, selectedDate?: Date) => {
    setShowPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const formatDateLocal = (d: Date) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const formattedDate = formatDateLocal(date);

  const [textStory, setTextStory] = useState('');
  const addMemory = useStore((state) => state.addMemory);

  const handleSave = async () => {
    if (!caption.trim() && !textStory.trim() && !mediaUri) return;

    setIsLoading(true);
    try {
      // 1. Upload Media
      let contentUrl = textStory;
      if (activeType !== 'story' && mediaUri) {
        try {
          contentUrl = await uploadFileToBackend(mediaUri);
        } catch (uploadErr) {
          console.error("Memory media upload failed, continuing without media:", uploadErr);
          contentUrl = mediaUri; // Fallback to local URI so UI doesn't crash completely
        }
      }

      const memoryData: any = {
        type: activeType === 'voice' ? 'audio' : activeType === 'story' ? 'text' : activeType,
        title: caption || 'Untitled Memory',
        content: contentUrl || 'Uploaded File',
        emotion: activeEmotion,
        date: formattedDate
      };

      // 2. Save via Zustand (hits FastAPI)
      await addMemory(memoryData);

      router.back();
    } catch (error) {
      console.error("Error saving memory:", error);
      Alert.alert("Error", "There was an error saving this memory. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const pickMedia = async () => {
    if (activeType === 'photo' || activeType === 'video') {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: activeType === 'photo' ? ['images'] : ['videos'],
        allowsEditing: activeType === 'photo',
        quality: 0.8,
      });
      if (!result.canceled) setMediaUri(result.assets[0].uri);
    } else if (activeType === 'voice') {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['audio/*'],
        copyToCacheDirectory: true,
      });
      if (!result.canceled) setMediaUri(result.assets[0].uri);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 py-4 bg-white dark:bg-slate-900 shadow-sm border-b border-gray-100 dark:border-slate-800">
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
            <MaterialCommunityIcons name="close" size={24} color="#7C5CBF" />
          </TouchableOpacity>
          <Text className="text-lg text-purple-600 dark:text-purple-300" style={{ fontFamily: 'Lora_700Bold' }}>
            Add Memory
          </Text>
          <View className="w-8" />
        </View>

        <ScrollView className="flex-1 px-6 pt-6" contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 20, 40) }}>
          {/* Type Selector */}
          <View className="flex-row justify-between mb-8">
            {UPLOAD_TYPES.map(type => (
              <TouchableOpacity
                key={type.id}
                onPress={() => {
                  setActiveType(type.id);
                  setMediaUri(undefined);
                }}
                className={`w-[22%] aspect-square rounded-2xl items-center justify-center border ${activeType === type.id ? 'bg-purple-600 dark:bg-purple-600 border-purple-600' : 'bg-white dark:bg-slate-900 border-purple-100 dark:border-slate-800'
                  }`}
              >
                <MaterialCommunityIcons
                  name={type.icon as any}
                  size={28}
                  color={activeType === type.id ? '#FFF' : '#E8A0BF'}
                />
                <Text
                  className={`text-[10px] mt-1 ${activeType === type.id ? 'text-white' : 'text-purple-600 dark:text-purple-300'}`}
                  style={{ fontFamily: activeType === type.id ? 'Inter_700Bold' : 'Inter_500Medium' }}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Upload Area */}
          {activeType !== 'story' ? (
            <TouchableOpacity onPress={pickMedia} className="bg-white dark:bg-slate-900 border-2 border-dashed border-purple-200 dark:border-slate-700 rounded-2xl p-8 items-center mb-6 overflow-hidden">
              {mediaUri && activeType === 'photo' ? (
                <Animated.Image source={{ uri: mediaUri }} className="w-full h-40 rounded-lg" style={{ resizeMode: 'cover' }} />
              ) : (
                <>
                  <MaterialCommunityIcons name={mediaUri ? "check-circle" : "cloud-upload"} size={48} color="#E8A0BF" />
                  <Text className="text-purple-600 dark:text-purple-300 mt-4 text-base text-center" style={{ fontFamily: 'Inter_500Medium' }}>
                    {mediaUri ? `Selected File: ${mediaUri.split('/').pop()}` : 'Tap to select file'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          ) : (
            <View className="mb-6">
              <TextInput
                value={textStory}
                onChangeText={setTextStory}
                placeholder="Write your story here..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={6}
                className="bg-white dark:bg-slate-900 border border-purple-100 dark:border-slate-800 rounded-xl p-4 text-base font-sans text-slate-800 dark:text-gray-200"
                style={{ fontFamily: 'Inter_400Regular', textAlignVertical: 'top', minHeight: 150 }}
              />
            </View>
          )}

          {/* Form Fields */}
          <View className="mb-6">
            <View>
              <Text className="text-sm text-gray-500 dark:text-gray-400 mb-2" style={{ fontFamily: 'Inter_500Medium' }}>Caption / Title</Text>
              <TextInput
                value={caption}
                onChangeText={setCaption}
                placeholder="A beautiful day at the park"
                placeholderTextColor="#9CA3AF"
                className="bg-white dark:bg-slate-900 border border-purple-100 dark:border-slate-800 rounded-xl px-4 py-3 text-base text-slate-800 dark:text-gray-200"
                style={{ fontFamily: 'Inter_400Regular' }}
              />
            </View>

            <View className="flex-row justify-between mt-4">
              <View className="w-[48%]">
                <Text className="text-sm text-gray-500 dark:text-gray-400 mb-2" style={{ fontFamily: 'Inter_500Medium' }}>Who shared this?</Text>
                <TextInput
                  value={sharedBy}
                  onChangeText={setSharedBy}
                  placeholder="e.g. Sarah"
                  placeholderTextColor="#9CA3AF"
                  className="bg-white dark:bg-slate-900 border border-purple-100 dark:border-slate-800 rounded-xl px-4 py-3 text-base text-slate-800 dark:text-gray-200"
                  style={{ fontFamily: 'Inter_400Regular' }}
                />
              </View>
              <View className="w-[48%]">
                <Text
                  className="text-sm text-gray-500 dark:text-gray-400 mb-2"
                  style={{ fontFamily: 'Inter_500Medium' }}
                >
                  Date
                </Text>

                <TouchableOpacity
                  onPress={() => setShowPicker(true)}
                  className="bg-white dark:bg-[#1E1E1E] border border-purple-100 dark:border-slate-800 rounded-xl px-4 py-3"
                >
                  <Text
                  className="text-base text-slate-800 dark:text-gray-200"
                    style={{ fontFamily: 'Inter_400Regular' }}
                  >
                    {formattedDate}
                  </Text>
                </TouchableOpacity>

                {showPicker && (
                  <DateTimePicker
                    value={date}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={onChangeDate}
                  />
                )}
              </View>
            </View>
          </View>

          {/* Emotion Tag */}
          <View className="mb-8">
            <Text className="text-sm text-gray-500 dark:text-gray-400 mb-3" style={{ fontFamily: 'Inter_500Medium' }}>Emotion Tag</Text>
            <View className="flex-row flex-wrap">
              {EMOTIONS.map(emotion => (
                <TouchableOpacity
                  key={emotion}
                  onPress={() => setActiveEmotion(emotion)}
                  className={`px-3 py-1.5 rounded-full mr-2 mb-2 border ${activeEmotion === emotion ? 'bg-[#E8A0BF] border-[#E8A0BF]' : 'bg-white dark:bg-[#1E1E1E] border-purple-100 dark:border-slate-800'
                    }`}
                >
                  <Text
                    className={`text-sm ${activeEmotion === emotion ? 'text-white' : 'text-gray-500 dark:text-pink-400'}`}
                    style={{ fontFamily: activeEmotion === emotion ? 'Inter_700Bold' : 'Inter_400Regular' }}
                  >
                    {emotion}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            onPress={handleSave}
            disabled={isLoading}
            className={isLoading ? "rounded-xl py-4 items-center justify-center shadow-sm bg-purple-300" : "rounded-xl py-4 items-center justify-center shadow-sm bg-purple-600"}
          >
            <Text className="text-white text-lg" style={{ fontFamily: 'Inter_700Bold' }}>
              {isLoading ? 'Saving...' : 'Save Memory'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
