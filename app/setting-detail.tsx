import React, { useState } from 'react';
import { View, Text, Switch, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';

import { useStore } from '../store/useStore';

function UserProfile() {
  const store = useStore();
  const [newUsername, setNewUsername] = useState(store.username || '');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdateUsername = async () => {
    if (!newUsername) return;
    setLoading(true);
    try {
      await store.updateUsername(newUsername);
      Alert.alert('Success', 'Username updated successfully.');
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      await store.updatePassword(newPassword);
      Alert.alert('Success', 'Password updated successfully.');
      setNewPassword('');
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ gap: 24 }}>
      <View className="items-center mb-4">
        <View className="w-24 h-24 rounded-full bg-purple-100 dark:bg-purple-900 items-center justify-center mb-4 border-4 border-white dark:border-slate-800 shadow-sm">
          <MaterialCommunityIcons name="account" size={48} color="#7C5CBF" />
        </View>
        <Text className="text-xl text-slate-800 dark:text-white" style={{ fontFamily: 'Lora_700Bold' }}>{store.username}</Text>
        <Text className="text-gray-500 dark:text-gray-400 text-sm">GriefBridge Member</Text>
      </View>

      <View className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800">
        <View className="flex-row items-center mb-4">
          <MaterialCommunityIcons name="account-edit-outline" size={20} color="#7C5CBF" className="mr-2" />
          <Text className="text-slate-800 dark:text-gray-200 font-bold text-lg">Username</Text>
        </View>
        <TextInput
          value={newUsername}
          onChangeText={setNewUsername}
          placeholder="New Username"
          className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl text-slate-800 dark:text-white mb-4 border border-gray-100 dark:border-slate-800"
          autoCapitalize="none"
        />
        <TouchableOpacity
          className="bg-purple-600 p-4 rounded-2xl items-center shadow-sm"
          onPress={handleUpdateUsername}
          disabled={loading}
        >
          <Text className="text-white font-bold" style={{ fontFamily: 'Inter_700Bold' }}>{loading ? 'Updating...' : 'Save Username'}</Text>
        </TouchableOpacity>
      </View>

      <View className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800">
        <View className="flex-row items-center mb-4">
          <MaterialCommunityIcons name="lock-outline" size={20} color="#7C5CBF" className="mr-2" />
          <Text className="text-slate-800 dark:text-gray-200 font-bold text-lg">Security</Text>
        </View>
        <TextInput
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="New Password (min. 6 characters)"
          secureTextEntry
          className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl text-slate-800 dark:text-white mb-4 border border-gray-100 dark:border-slate-800"
        />
        <TouchableOpacity
          className="bg-slate-800 dark:bg-slate-700 p-4 rounded-2xl items-center shadow-sm"
          onPress={handleUpdatePassword}
          disabled={loading}
        >
          <Text className="text-white font-bold" style={{ fontFamily: 'Inter_700Bold' }}>{loading ? 'Updating...' : 'Update Password'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}



export default function SettingDetailScreen() {
  const { title } = useLocalSearchParams<{ title: string }>();
  const router = useRouter();
  const profile = useStore((state) => state.profile);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [toggles, setToggles] = useState({
    notifications: true,
    emailAlerts: false,
    shareAll: true,
  });

  const [inputVal, setInputVal] = useState('');

  const renderContent = () => {
    switch (title) {
      case 'Manage Profiles':
        return (
          <View className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
            <Text className="text-purple-600 dark:text-purple-300 text-lg mb-2" style={{ fontFamily: 'Inter_700Bold' }}>Primary Profile</Text>
            <Text className="text-slate-800 dark:text-gray-200 text-base mb-1" style={{ fontFamily: 'Inter_500Medium' }}>{profile?.name || 'Your Loved One'}</Text>
            <Text className="text-gray-500 dark:text-gray-400 mb-4" style={{ fontFamily: 'Inter_400Regular' }}>Manage the loved one you are remembering.</Text>
            <TouchableOpacity
              className="bg-purple-50 dark:bg-slate-800 p-3 rounded-xl flex-row items-center justify-center"
              onPress={() => router.push('/create-profile')}
            >
              <MaterialCommunityIcons name="pencil" size={20} color="#7C5CBF" />
              <Text className="text-purple-600 font-bold ml-2">Edit Details</Text>
            </TouchableOpacity>
          </View>
        );
      case 'Family Sharing':
        return (
          <View>
            <View className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 mb-4 flex-row items-center justify-between">
              <Text className="text-slate-800 dark:text-gray-200" style={{ fontFamily: 'Inter_500Medium' }}>Share Memories Automatically</Text>
              <Switch
                value={toggles.shareAll}
                onValueChange={v => setToggles({ ...toggles, shareAll: v })}
                trackColor={{ false: '#D1D5DB', true: '#7C5CBF' }}
                thumbColor="#FFF"
              />
            </View>
            <View className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
              <Text className="text-purple-600 dark:text-purple-300 font-bold mb-2">Invite Family Member</Text>
              <TextInput
                value={inputVal}
                onChangeText={setInputVal}
                placeholder="Email address"
                placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
                className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl text-slate-800 dark:text-white mb-3"
              />
              <TouchableOpacity className="bg-purple-600 p-3 rounded-xl items-center">
                <Text className="text-white font-bold">Send Invite</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      case 'Notifications':
      case 'Milestone Reminders':
        return (
          <View className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
            <View className="p-4 border-b border-gray-100 dark:border-slate-800 flex-row items-center justify-between">
              <Text className="text-slate-800 dark:text-gray-200" style={{ fontFamily: 'Inter_500Medium' }}>Push Notifications</Text>
              <Switch
                value={toggles.notifications}
                onValueChange={v => setToggles({ ...toggles, notifications: v })}
                trackColor={{ false: '#D1D5DB', true: '#7C5CBF' }}
                thumbColor="#FFF"
              />
            </View>
            <View className="p-4 flex-row items-center justify-between">
              <Text className="text-slate-800 dark:text-gray-200" style={{ fontFamily: 'Inter_500Medium' }}>Email Alerts</Text>
              <Switch
                value={toggles.emailAlerts}
                onValueChange={v => setToggles({ ...toggles, emailAlerts: v })}
                trackColor={{ false: '#D1D5DB', true: '#7C5CBF' }}
                thumbColor="#FFF"
              />
            </View>
          </View>
        );
      case 'Privacy Policy':
        return (
          <View className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
            <Text className="text-slate-800 dark:text-gray-200 mb-4 leading-6" style={{ fontFamily: 'Inter_400Regular' }}>
              GriefBridge is built on a foundation of trust, compassion, and deep respect for your personal data. We understand that the memories, voice recordings, photographs, and stories you share within this application are irreplaceable and deeply personal. When you create an account, we collect only the information necessary to provide our services — your name, email address, and the memory content you choose to upload. All data you share, including photographs, audio recordings, videos, and written stories of your loved one, is stored securely using encrypted cloud storage and is never shared with, sold to, or accessed by any third party for commercial purposes.
              {'\n'}The voice recordings you upload for voice cloning purposes are used solely to reconstruct the vocal characteristics of your loved one within your personal account. These recordings are processed by our voice cloning service provider under strict data processing agreements and are never used to train general-purpose AI models or shared with other users. The AI-generated conversations and journal entries within GriefBridge are private to your account and are not reviewed by human staff except in rare cases where required by law or to investigate a reported safety concern.
              {'\n'}We use anonymised, aggregated usage data to improve the performance and features of the application. This data contains no personally identifiable information and cannot be traced back to any individual user or memory profile. Our grief journal entries and mood tracking data are stored locally and in your private account only — this sensitive emotional data is never used for advertising, profiling, or research without your explicit written consent.
              {'\n'}GriefBridge does not display third-party advertisements and does not allow advertisers to access your data or influence your experience within the application. We do not use tracking technologies such as third-party cookies or behavioural trackers. The only analytics we collect relate to app performance — such as crash reports and loading times — to ensure a stable experience for all users.
              {'\n'}You retain full ownership of all content you upload to GriefBridge at all times. You may request the complete deletion of your account and all associated data at any time by visiting the Settings screen and selecting Delete My Account. Upon deletion, all your data including memory vault contents, chat history, journal entries, and voice clone data will be permanently removed from our servers within 30 days. You may also contact us at privacy@griefbridge.app for any data-related requests. We are committed to complying with applicable data protection regulations including the Information Technology Act 2000 (India), GDPR (European Union), and CCPA (California). Our privacy practices are reviewed regularly and this policy will be updated whenever material changes are made, with notice provided to all registered users.
            </Text>
          </View>
        );
      case 'About GriefBridge':
        return (
          <View className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
            <Text className="text-slate-800 dark:text-gray-200 mb-4 leading-6" style={{ fontFamily: 'Inter_400Regular' }}>
              GriefBridge was born from a simple but profound belief — that the people we love never truly leave us, as long as their memories are kept alive. We built GriefBridge because we recognised a gap that no technology had addressed: when someone we love passes away, their voice, their personality, their wisdom, and their warmth disappear — and families are left with nothing but static photographs and fading memories. Every existing solution in this space either requires the person to prepare for their own death in advance, costs hundreds of dollars a year, or offers a generic experience that bears no resemblance to the person who was actually lost. GriefBridge was created to change that.
              {'\n'}GriefBridge is a mobile application for iOS and Android that allows grieving families to collaboratively preserve the memory of a deceased loved one and interact with an AI companion that reflects that person's personality, communication style, and warmth — built entirely from materials the family already has, like WhatsApp voice notes, home videos, photographs, and written stories. There is no expensive subscription. There is no requirement to have planned ahead. There is only the memory of the person you loved, and the technology to keep it close.
              {'\n'}At the heart of GriefBridge is a deep respect for the complexity of grief. We do not believe technology can replace a person, and we have never tried to. Every feature in this application is framed around memory and reflection — not resurrection. When you converse with the AI persona of your loved one, you are not speaking to them. You are speaking to a compassionate, thoughtful reflection of everything your family remembers about them — their favourite phrases, their sense of humour, the way they gave advice, the things they loved. It is a mirror made of memories, and we hope it brings you comfort.
              {'\n'}GriefBridge also recognises that grief is not a problem to be solved — it is a journey to be supported. That is why the application includes a private grief journal with personalised daily prompts, a mood tracker that maps your emotional journey over time, memory milestone notifications on birthdays and anniversaries, and a crisis support module that connects you to professional counselling resources if you ever need them. Grief looks different for everyone, and GriefBridge is designed to meet you wherever you are.
              {'\n'}This application was developed as a final year Computer Science Engineering project with the goal of solving a real human problem using cutting-edge artificial intelligence in an ethical, accessible, and compassionate way. It is dedicated to everyone who has ever lost someone, and to the belief that love — expressed through memory — is the most enduring technology of all.
            </Text>
          </View>
        );
      case 'Crisis Support':
        return (
          <View className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 items-center">
            <MaterialCommunityIcons name="heart-pulse" size={48} color="#EF4444" className="mb-2" />
            <Text className="text-slate-800 dark:text-gray-200 font-bold mb-1 text-lg">You are not alone.</Text>
            <Text className="text-gray-500 dark:text-gray-400 text-center mb-4">If you are in distress, please reach out for immediate support.</Text>
            <TouchableOpacity className="bg-[#EF4444] py-3 px-6 rounded-full flex-row items-center">
              <MaterialCommunityIcons name="phone" size={20} color="#FFF" />
              <Text className="text-white font-bold ml-2">Call Crisis Lifeline (988)</Text>
            </TouchableOpacity>
          </View>
        );
      case 'Account Settings':
      case 'User Profile':
        return <UserProfile />;
      default:
        return (
          <Text className="text-gray-500 dark:text-gray-400 text-center mt-10">This setting is under construction.</Text>
        );
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 shadow-sm z-10">
        <TouchableOpacity onPress={() => router.back()} className="p-2 mr-2">
          <MaterialCommunityIcons name="arrow-left" size={24} color="#7C5CBF" />
        </TouchableOpacity>
        <Text className="text-xl text-purple-600 dark:text-purple-300 flex-1" style={{ fontFamily: 'Lora_700Bold' }}>
          {title?.trim() || 'Setting'}
        </Text>
      </View>

      {/* Content */}
      <ScrollView className="flex-1 p-6">
        {renderContent()}
      </ScrollView>
    </SafeAreaView>
  );
}
