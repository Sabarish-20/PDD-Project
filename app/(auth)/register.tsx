import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import { useStore } from '../../store/useStore';

export default function RegisterScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const register = useStore((state) => state.register);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleRegister = async () => {
    if (!username || !password) {
      Alert.alert("Error", "Please enter a username and password.");
      return;
    }

    setIsLoading(true);
    try {
      await register(username, password);
      router.replace('/create-profile');
    } catch (error: any) {
      console.error("Registration failed:", error);
      Alert.alert("Registration Error", error.message || "Failed to register");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      className="flex-1 bg-slate-50 dark:bg-slate-950"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-8 pt-20 bg-slate-50 dark:bg-slate-950">
        <TouchableOpacity 
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/onboarding');
            }
          }} 
          className="mb-8 w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 border border-purple-100 dark:border-slate-800 items-center justify-center shadow-sm"
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={isDark ? "#D8B4E2" : "#7C5CBF"} />
        </TouchableOpacity>

        <Text className="text-4xl text-purple-600 dark:text-purple-300 mb-2" style={{ fontFamily: 'Lora_700Bold' }}>
          Create Account
        </Text>
        <Text className="text-gray-500 dark:text-gray-400 mb-10 text-lg" style={{ fontFamily: 'Inter_400Regular' }}>
          Start preserving memories that matter.
        </Text>

        <View className="space-y-6">
          <View>
            <Text className="text-gray-600 dark:text-gray-400 mb-2 ml-1 font-bold" style={{ fontFamily: 'Inter_500Medium' }}>
              User Name
            </Text>
            <TextInput
              placeholder="Pick a unique username"
              placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-purple-100 dark:border-slate-800 shadow-sm text-lg text-slate-800 dark:text-gray-100"
              style={{ fontFamily: 'Inter_400Regular' }}
            />
          </View>

          <View className="mt-4">
            <Text className="text-gray-600 dark:text-gray-400 mb-2 ml-1 font-bold" style={{ fontFamily: 'Inter_500Medium' }}>
              Password
            </Text>
            <TextInput
              placeholder="••••••••"
              placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-purple-100 dark:border-slate-800 shadow-sm text-lg text-slate-800 dark:text-gray-100"
              style={{ fontFamily: 'Inter_400Regular' }}
            />
          </View>
        </View>

        <TouchableOpacity 
          onPress={handleRegister}
          disabled={isLoading}
          className={`bg-purple-600 py-4 rounded-2xl mt-12 shadow-lg ${isLoading ? 'opacity-70' : ''}`}
        >
          <Text className="text-white text-center text-xl font-bold" style={{ fontFamily: 'Inter_700Bold' }}>
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </Text>
        </TouchableOpacity>

        <View className="flex-row justify-center mt-8 pb-10">
          <Text className="text-gray-500 dark:text-gray-400 text-lg" style={{ fontFamily: 'Inter_400Regular' }}>
            Already have an account?{" "}
          </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text className="text-purple-600 dark:text-purple-300 font-bold text-lg" style={{ fontFamily: 'Inter_700Bold' }}>
              Login
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
