import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Animated, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { useStore } from '../../store/useStore';
import { generateAIResponse, generateAIVoiceResponse } from '../../utils/aiUtils';
import { generateSpeech } from '../../utils/elevenLabsUtils';
import * as FileSystem from 'expo-file-system';

export default function VoiceScreen() {
  const router = useRouter();
  const profile = useStore((state) => state.profile);
  const memories = useStore((state) => state.memories);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [isUnloaded, setIsUnloaded] = useState(true);

  const pulseAnim = useState(new Animated.Value(1))[0];

  const isPressingRef = useRef(false);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const activeSoundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    return () => {
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync().catch(() => {});
      }
      if (activeSoundRef.current) {
        activeSoundRef.current.unloadAsync().catch(() => {});
      }
    };
  }, []);

  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording]);

  async function startRecording() {
    try {
      isPressingRef.current = true;
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        isPressingRef.current = false;
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      if (!isPressingRef.current) return;

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      if (!isPressingRef.current) {
        await newRecording.stopAndUnloadAsync().catch(() => {});
        return;
      }

      setRecording(newRecording);
      recordingRef.current = newRecording;
      setIsRecording(true);
      setIsUnloaded(false);
    } catch (err) {
      console.error('Failed to start recording', err);
      isPressingRef.current = false;
    }
  }

  async function stopRecording() {
    isPressingRef.current = false;
    const activeRecording = recordingRef.current;
    if (!activeRecording) return;
    
    setIsRecording(false);
    setIsProcessing(true);
    
    try {
      await activeRecording.stopAndUnloadAsync();
      const uri = activeRecording.getURI();
      console.log('Recording stopped and stored at', uri);

      // 1. Read the audio file as a Base64 string and generate a multimodal voice response
      let response = "I'm here for you, and I'm listening.";
      if (uri) {
        try {
          const base64Audio = await FileSystem.readAsStringAsync(uri, {
            encoding: 'base64',
          });
          const extension = uri.split('.').pop() || 'm4a';
          const mimeType = `audio/${extension === 'mp4' ? 'mp4' : extension === 'caf' ? 'x-caf' : 'm4a'}`;
          response = await generateAIVoiceResponse(profile, memories, base64Audio, mimeType);
        } catch (readError) {
          console.error("Failed to read audio or generate multimodal response:", readError);
          response = await generateAIResponse(profile, memories, [], "The user sent a voice message.");
        }
      } else {
        response = await generateAIResponse(profile, memories, [], "The user sent a voice message.");
      }
      setAiMessage(response);

      // 2. Play speech automatically for Voice-to-Voice interaction!
      try {
        const relationLower = (profile?.relationship || '').toLowerCase().trim();
        const isMaleRelation = ['father', 'dad', 'grandfather', 'grandpa', 'brother', 'husband', 'uncle', 'son'].includes(relationLower);
        const fallbackVoiceId = isMaleRelation ? 'ErXwobaYiN019PkySvjV' : 'EXAVITQu4vr4xnSDxMaL';
        const activeVoiceId = profile?.voiceId || fallbackVoiceId;

        // Generate audio path via ElevenLabs (uses fallbacks elegantly)
        const audioUri = await generateSpeech(response, activeVoiceId);
        
        // Load and play audio response
        const { sound } = await Audio.Sound.createAsync(
          { uri: audioUri },
          { shouldPlay: true }
        );
        
        if (activeSoundRef.current) {
          await activeSoundRef.current.unloadAsync().catch(() => {});
        }
        activeSoundRef.current = sound;
      } catch (voicePlayError) {
        console.error("Voice-to-voice playback failed:", voicePlayError);
      }
    } catch (error) {
      console.error('Failed to stop recording', error);
    } finally {
      setIsProcessing(false);
      setRecording(null);
      recordingRef.current = null;
      setIsUnloaded(true);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950">
      <View className="flex-row items-center justify-between px-6 py-4 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 shadow-sm">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <MaterialCommunityIcons name="close" size={24} color="#7C5CBF" />
        </TouchableOpacity>
        <Text className="text-lg text-purple-600 dark:text-purple-300" style={{ fontFamily: 'Lora_700Bold' }}>Voice Memory</Text>
        <View className="w-8" />
      </View>

      <ScrollView className="flex-1 px-6 py-10" contentContainerStyle={{ alignItems: 'center' }}>
        <Text className="text-2xl text-center text-slate-800 dark:text-white mb-2" style={{ fontFamily: 'Lora_700Bold' }}>
          Speak with {profile?.name || 'them'}
        </Text>
        <Text className="text-gray-500 text-center mb-20 px-4" style={{ fontFamily: 'Inter_400Regular' }}>
          Hold the button below and speak. Your words will reach their digital memory.
        </Text>

        <View className="items-center justify-center">
          {isRecording && (
            <Animated.View 
              style={{ transform: [{ scale: pulseAnim }] }}
              className="absolute w-40 h-40 bg-purple-100 rounded-full opacity-50"
            />
          )}
          <TouchableOpacity
            onLongPress={startRecording}
            onPressOut={stopRecording}
            activeOpacity={0.8}
            className={`w-32 h-32 rounded-full items-center justify-center shadow-lg ${isRecording ? 'bg-red-500' : 'bg-purple-600'}`}
          >
            <MaterialCommunityIcons 
              name={isRecording ? 'stop' : 'microphone'} 
              size={48} 
              color="#FFF" 
            />
          </TouchableOpacity>
        </View>

        <Text className="mt-8 text-gray-400 font-bold tracking-widest">
          {isRecording ? 'LISTENING...' : isProcessing ? 'PROCESSING...' : 'HOLD TO SPEAK'}
        </Text>

        {aiMessage && (
          <View className="mt-12 bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-purple-100 dark:border-slate-800 w-full">
            <View className="flex-row items-center mb-3">
              <View className="w-8 h-8 rounded-full bg-purple-100 items-center justify-center mr-2">
                <MaterialCommunityIcons name="account" size={16} color="#7C5CBF" />
              </View>
              <Text className="text-purple-600 font-bold">{profile?.name || 'Them'}</Text>
            </View>
            <Text className="text-gray-700 dark:text-gray-300 leading-6 italic" style={{ fontFamily: 'Inter_400Regular' }}>
              "{aiMessage}"
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
