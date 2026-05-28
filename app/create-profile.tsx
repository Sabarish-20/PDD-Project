import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Platform, KeyboardAvoidingView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useStore } from '../store/useStore';
import { uploadFileToBackend } from '../utils/uploadUtils';

export default function CreateProfileScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const totalSteps = 6;

  // Form State
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [traits, setTraits] = useState<string[]>([]);
  const [phrase, setPhrase] = useState('');
  const [phrases, setPhrases] = useState<string[]>([]);
  const [avatar, setAvatar] = useState<string | undefined>(undefined);
  const [voiceFile, setVoiceFile] = useState<string | undefined>(undefined);
  const [voiceFileName, setVoiceFileName] = useState<string | undefined>(undefined);
  const [personalityDesc, setPersonalityDesc] = useState('');
  const [speakingStyle, setSpeakingStyle] = useState('');
  const [specialAdvice, setSpecialAdvice] = useState('');
  const [coreMemory, setCoreMemory] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const personalityTraits = [
    'Funny', 'Warm', 'Serious', 'Wise', 'Energetic', 'Calm', 'Adventurous', 'Creative'
  ];

  const saveProfile = useStore((state) => state.saveProfile);
  const completeOnboarding = useStore((state) => state.completeOnboarding);

  const handleNext = async () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      setIsLoading(true);
      try {
        // 1. Upload Avatar if selected
        let avatarUrl = '';
        if (avatar) {
          try {
            avatarUrl = await uploadFileToBackend(avatar);
          } catch (uploadErr) {
            console.error("Avatar upload failed, continuing without avatar:", uploadErr);
          }
        }

        // 2. Upload Voice Model if selected
        let voiceUrl = '';
        let voiceId = '';
        if (voiceFile) {
          try {
            // A. Upload to Supabase for storage
            voiceUrl = await uploadFileToBackend(voiceFile);
            
            // B. Create Voice Clone on ElevenLabs
            try {
              const { createElevenLabsVoice } = await import('../utils/elevenLabsUtils');
              voiceId = await createElevenLabsVoice(name || 'Loved One', voiceFile);
            } catch (elError) {
              console.error("ElevenLabs voice cloning failed:", elError);
              // We continue even if ElevenLabs fails, as the Supabase storage succeeded
            }
          } catch (uploadErr) {
            console.error("Voice upload failed, continuing without voice:", uploadErr);
          }
        }

        // 3. Create Document
        const profileData = {
          name: name || 'Loved One',
          relationship: relationship || 'Father',
          traits: {
            selected: traits.length > 0 ? traits : ['Funny', 'Warm'],
            personalityDesc: personalityDesc.trim(),
            speakingStyle: speakingStyle.trim(),
            specialAdvice: specialAdvice.trim(),
            coreMemory: coreMemory.trim()
          },
          phrases: phrases.length > 0 ? phrases : ["That's the ticket!"],
          avatar: avatarUrl || avatar,
          voiceModelUrl: voiceUrl,
          voiceId: voiceId
        };

        // Save to FastAPI Backend
        await saveProfile(profileData);
        completeOnboarding();

        router.replace('/(tabs)/');
      } catch (error: any) {
        console.error("Error creating profile:", error);
        if (error?.message?.includes("avatar") || error?.code === "PGRST204") {
          Alert.alert(
            "Database Update Required",
            "The 'profiles' table is missing the 'avatar' column. Please run the SQL migration in your Supabase dashboard to add it.",
            [{ text: "OK" }]
          );
        } else {
          Alert.alert("Error", "There was an error creating the profile. Please try again.");
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      router.back();
    }
  };

  const toggleTrait = (trait: string) => {
    if (traits.includes(trait)) {
      setTraits(traits.filter(t => t !== trait));
    } else {
      setTraits([...traits, trait]);
    }
  };

  const addPhrase = () => {
    if (phrase.trim()) {
      setPhrases([...phrases, phrase.trim()]);
      setPhrase('');
    }
  };

  // Progress Bar Animation
  const progressStyle = useAnimatedStyle(() => {
    return {
      width: withTiming(`${(step / totalSteps) * 100}%`, { duration: 300 }),
    };
  });

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) setAvatar(result.assets[0].uri);
  };

  const pickAudioVideo = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['audio/*', 'video/*'],
      copyToCacheDirectory: true,
    });
    if (!result.canceled) {
      setVoiceFile(result.assets[0].uri);
      setVoiceFileName(result.assets[0].name);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-slate-50 dark:bg-slate-950">
      {/* Header & Progress */}
      <View className="pt-16 pb-4 px-6 bg-white dark:bg-slate-900 shadow-sm border-b border-gray-100 dark:border-slate-800">
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity onPress={handleBack} className="p-2 -ml-2">
            <MaterialCommunityIcons name="arrow-left" size={24} color="#7C5CBF" />
          </TouchableOpacity>
          <Text className="text-lg text-purple-600 dark:text-purple-300" style={{ fontFamily: 'Lora_700Bold' }}>
            Create Memory Profile
          </Text>
          <View className="w-8" />
        </View>

        <View className="h-2 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <Animated.View className="h-full bg-purple-600" style={progressStyle} />
        </View>
        <Text className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-right" style={{ fontFamily: 'Inter_500Medium' }}>
          Step {step} of {totalSteps}
        </Text>
      </View>

      <ScrollView className="flex-1 px-6 pt-6" contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Step 1: Basic Info */}
        {step === 1 && (
          <Animated.View className="mb-6">
            <Text className="text-2xl text-purple-600 dark:text-purple-300 mb-2" style={{ fontFamily: 'Lora_700Bold' }}>Who are you honoring?</Text>
            
            <View>
              <Text className="text-sm text-gray-500 dark:text-gray-400 mb-2" style={{ fontFamily: 'Inter_500Medium' }}>Their Name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="e.g. Robert Smith"
                placeholderTextColor="#9CA3AF"
                className="bg-white dark:bg-slate-900 border border-purple-100 dark:border-slate-800 rounded-xl px-4 py-4 text-base font-sans text-slate-800 dark:text-gray-200"
                style={{ fontFamily: 'Inter_400Regular' }}
              />
            </View>

            <View>
              <Text className="text-sm text-gray-500 dark:text-gray-400 mb-2 mt-4" style={{ fontFamily: 'Inter_500Medium' }}>Relationship to you</Text>
              <TextInput
                value={relationship}
                onChangeText={setRelationship}
                placeholder="e.g. Father, Friend, Spouse"
                placeholderTextColor="#9CA3AF"
                className="bg-white dark:bg-slate-900 border border-purple-100 dark:border-slate-800 rounded-xl px-4 py-4 text-base font-sans text-slate-800 dark:text-gray-200"
                style={{ fontFamily: 'Inter_400Regular' }}
              />
            </View>
          </Animated.View>
        )}

        {/* Step 2: Photo */}
        {step === 2 && (
          <Animated.View className="items-center mt-8">
            <Text className="text-2xl text-purple-600 dark:text-purple-300 mb-8 text-center" style={{ fontFamily: 'Lora_700Bold' }}>Add their photo</Text>
            
            <TouchableOpacity onPress={pickImage} className="w-40 h-40 rounded-full bg-purple-50 dark:bg-slate-900 border-2 border-dashed border-purple-200 dark:border-slate-700 items-center justify-center mb-6 overflow-hidden">
              {avatar ? (
                <Animated.Image source={{ uri: avatar }} className="w-full h-full" />
              ) : (
                <>
                  <MaterialCommunityIcons name="camera-plus" size={48} color="#7C5CBF" />
                  <Text className="text-purple-600 dark:text-purple-300 mt-2" style={{ fontFamily: 'Inter_500Medium' }}>Tap to upload</Text>
                </>
              )}
            </TouchableOpacity>
            
            <Text className="text-center text-gray-500 dark:text-gray-400 px-4" style={{ fontFamily: 'Inter_400Regular' }}>
              A clear photo of their face works best. You can always change this later.
            </Text>
          </Animated.View>
        )}

        {/* Step 3: Personality */}
        {step === 3 && (
          <Animated.View>
            <Text className="text-2xl text-purple-600 dark:text-purple-300 mb-2" style={{ fontFamily: 'Lora_700Bold' }}>What were they like?</Text>
            <Text className="text-gray-500 dark:text-gray-400 mb-6" style={{ fontFamily: 'Inter_400Regular' }}>Select all that apply to help the AI match their energy.</Text>
            
            <View className="flex-row flex-wrap">
              {personalityTraits.map((trait) => {
                const isSelected = traits.includes(trait);
                return (
                  <TouchableOpacity
                    key={trait}
                    onPress={() => toggleTrait(trait)}
                    className={`px-4 py-2 rounded-full m-1 border ${
                      isSelected ? 'bg-purple-600 dark:bg-purple-600 border-purple-600' : 'bg-white dark:bg-slate-900 border-purple-100 dark:border-slate-800'
                    }`}
                  >
                    <Text 
                      className={`text-base ${isSelected ? 'text-white' : 'text-purple-600 dark:text-purple-300'}`} 
                      style={{ fontFamily: isSelected ? 'Inter_700Bold' : 'Inter_400Regular' }}
                    >
                      {trait}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Animated.View>
        )}

        {/* Step 4: Enriched Personality Details */}
        {step === 4 && (
          <Animated.View>
            <Text className="text-2xl text-purple-600 dark:text-purple-300 mb-2" style={{ fontFamily: 'Lora_700Bold' }}>
              Enrich their memory
            </Text>
            <Text className="text-gray-500 dark:text-gray-400 mb-6" style={{ fontFamily: 'Inter_400Regular' }}>
              Provide qualitative details so that the companion captures their exact character and tone.
            </Text>

            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2" style={{ fontFamily: 'Inter_500Medium' }}>
                Personality & Temperament
              </Text>
              <TextInput
                value={personalityDesc}
                onChangeText={setPersonalityDesc}
                placeholder="e.g. Warm, nurturing, loved telling jokes but could also be a quiet listener."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
                className="bg-white dark:bg-slate-900 border border-purple-100 dark:border-slate-800 rounded-xl px-4 py-3 text-base text-slate-800 dark:text-gray-200 min-h-[80px]"
                style={{ fontFamily: 'Inter_400Regular', textAlignVertical: 'top' }}
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2" style={{ fontFamily: 'Inter_500Medium' }}>
                Typical Speaking Style & Tone
              </Text>
              <TextInput
                value={speakingStyle}
                onChangeText={setSpeakingStyle}
                placeholder="e.g. Soft-spoken and calm, often used phrases like 'sweetheart' or talked with hands."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
                className="bg-white dark:bg-slate-900 border border-purple-100 dark:border-slate-800 rounded-xl px-4 py-3 text-base text-slate-800 dark:text-gray-200 min-h-[80px]"
                style={{ fontFamily: 'Inter_400Regular', textAlignVertical: 'top' }}
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2" style={{ fontFamily: 'Inter_500Medium' }}>
                Life Wisdom & Advice They Passed On
              </Text>
              <TextInput
                value={specialAdvice}
                onChangeText={setSpecialAdvice}
                placeholder="e.g. 'Never go to bed angry' or 'Always look for the silver lining in every situation.'"
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
                className="bg-white dark:bg-slate-900 border border-purple-100 dark:border-slate-800 rounded-xl px-4 py-3 text-base text-slate-800 dark:text-gray-200 min-h-[80px]"
                style={{ fontFamily: 'Inter_400Regular', textAlignVertical: 'top' }}
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2" style={{ fontFamily: 'Inter_500Medium' }}>
                A Special Shared Memory or Story
              </Text>
              <TextInput
                value={coreMemory}
                onChangeText={setCoreMemory}
                placeholder="e.g. Going to the local lake cabin every August or driving down Route 66 in 2018."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
                className="bg-white dark:bg-slate-900 border border-purple-100 dark:border-slate-800 rounded-xl px-4 py-3 text-base text-slate-800 dark:text-gray-200 min-h-[80px]"
                style={{ fontFamily: 'Inter_400Regular', textAlignVertical: 'top' }}
              />
            </View>
          </Animated.View>
        )}

        {/* Step 5: Phrases */}
        {step === 5 && (
          <Animated.View>
            <Text className="text-2xl text-purple-600 dark:text-purple-300 mb-2" style={{ fontFamily: 'Lora_700Bold' }}>Their favorite phrases</Text>
            <Text className="text-gray-500 dark:text-gray-400 mb-6" style={{ fontFamily: 'Inter_400Regular' }}>Did they have a saying or catchphrase they used often?</Text>
            
            <View className="flex-row mb-6">
              <TextInput
                value={phrase}
                onChangeText={setPhrase}
                placeholder="e.g. 'That's the ticket!'"
                placeholderTextColor="#9CA3AF"
                className="flex-1 bg-white dark:bg-slate-900 border border-purple-100 dark:border-slate-800 rounded-l-xl px-4 py-4 text-base font-sans text-slate-800 dark:text-gray-200"
                style={{ fontFamily: 'Inter_400Regular' }}
                onSubmitEditing={addPhrase}
              />
              <TouchableOpacity 
                onPress={addPhrase}
                className="bg-pink-400 px-6 items-center justify-center rounded-r-xl"
              >
                <MaterialCommunityIcons name="plus" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>

            <View className="mb-2">
              {phrases.map((p, i) => (
                <View key={i} className="flex-row items-center bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-100 dark:border-slate-800 mb-2">
                  <MaterialCommunityIcons name="format-quote-close" size={20} color="#f472b6" className="mr-2" />
                  <Text className="flex-1 text-purple-600 dark:text-gray-200 text-base" style={{ fontFamily: 'Inter_500Medium' }}>{p}</Text>
                </View>
              ))}
            </View>
          </Animated.View>
        )}

        {/* Step 6: Voice */}
        {step === 6 && (
          <Animated.View className="items-center mt-4">
            <Text className="text-2xl text-purple-600 dark:text-purple-300 mb-2 text-center" style={{ fontFamily: 'Lora_700Bold' }}>Preserve their voice</Text>
            <Text className="text-gray-500 dark:text-gray-400 text-center mb-8 px-4" style={{ fontFamily: 'Inter_400Regular' }}>
              Upload a clear voice note or video clip (1-2 minutes). We'll use this to recreate their voice for memories.
            </Text>
            
            <TouchableOpacity onPress={pickAudioVideo} className="w-full bg-white dark:bg-slate-900 border-2 border-dashed border-purple-200 dark:border-slate-700 rounded-xl p-8 items-center mb-6">
              <MaterialCommunityIcons name={voiceFile ? "check-circle" : "waveform"} size={48} color="#7C5CBF" />
              <Text className="text-purple-600 dark:text-purple-300 mt-4 text-lg text-center" style={{ fontFamily: 'Inter_500Medium' }}>{voiceFile ? `Selected: ${voiceFileName}` : "Upload Audio/Video"}</Text>
              {!voiceFile && <Text className="text-gray-500 dark:text-gray-400 mt-1 text-sm text-center" style={{ fontFamily: 'Inter_400Regular' }}>MP3, MP4, WAV supported</Text>}
            </TouchableOpacity>
          </Animated.View>
        )}
      </ScrollView>

      {/* Footer Navigation */}
      <View className="absolute bottom-0 left-0 right-0 p-6 bg-white dark:bg-slate-950 border-t border-gray-100 dark:border-slate-800">
        <TouchableOpacity
          onPress={handleNext}
          disabled={isLoading}
          className={isLoading ? "rounded-xl py-4 items-center justify-center shadow-sm bg-purple-300" : "rounded-xl py-4 items-center justify-center shadow-sm bg-purple-600"}
        >
          <Text className="text-white text-lg" style={{ fontFamily: 'Inter_700Bold' }}>
            {isLoading ? 'Creating...' : step === totalSteps ? 'Create Memory Profile' : 'Continue'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
