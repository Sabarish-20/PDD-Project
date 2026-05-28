import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';
import { useStore } from '../../store/useStore';

const SETTING_SECTIONS = [
  {
    title: 'Personal Profile',
    items: [
      { id: '0', title: 'User Profile', icon: 'account-circle-outline' },
    ]
  },
  {
    title: 'Memory Profiles',
    items: [
      { id: '1', title: 'Manage Profiles', icon: 'account-multiple' },
      { id: '2', title: 'Family Sharing', icon: 'account-group' },
    ]
  },
  {
    title: 'Preferences',
    items: [
      { id: '3', title: 'Notifications', icon: 'bell-outline' },
      { id: '4', title: 'Milestone Reminders', icon: 'calendar-heart' },
      { id: '5', title: "Themes", icon: "brush" },
    ]
  },
  {
    title: 'Support & Privacy',
    items: [
      { id: '5', title: 'Privacy Policy', icon: 'shield-check-outline' },
      { id: '6', title: 'Crisis Support', icon: 'lifebuoy' },
      { id: '7', title: 'About GriefBridge', icon: 'information-outline' },
    ]
  },
  {
    title: 'User Account',
    items: [
      { id: '8', title: 'Account Settings', icon: 'account-cog-outline' },
    ]
  }
];

export default function SettingsScreen() {
  const router = useRouter();
  const store = useStore();
  const logout = store.logout;
  const profile = store.profile;
  const username = store.username;
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950" edges={['left', 'right', 'bottom']}>
      {/* Header */}
      <View className="flex-row items-center px-6 py-4 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 pt-10">
        <Text className="text-2xl text-purple-600 dark:text-purple-300" style={{ fontFamily: 'Lora_700Bold' }}>
          Settings
        </Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-6" contentContainerStyle={{ paddingBottom: 100 }}>
        {/* User Profile Area - Now leads to Account Settings */}
        <TouchableOpacity 
          className="bg-white dark:bg-slate-900 rounded-3xl p-6 mb-8 flex-row items-center shadow-sm border border-gray-100 dark:border-slate-800"
          onPress={() => router.push({ pathname: '/setting-detail', params: { title: 'Account Settings' } })}
        >
          <View className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900 items-center justify-center mr-4">
            <MaterialCommunityIcons name="account" size={32} color="#7C5CBF" />
          </View>
          <View className="flex-1">
            <Text className="text-xl text-purple-600 dark:text-purple-300 mb-1" style={{ fontFamily: 'Lora_700Bold' }}>
              {username || 'GriefBridge User'}
            </Text>
            <Text className="text-gray-500 dark:text-gray-400 text-sm" style={{ fontFamily: 'Inter_400Regular' }}>
              Account Settings & Password
            </Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color={isDarkMode ? '#6B7280' : '#D1D5DB'} />
        </TouchableOpacity>

        {/* Setting Sections */}
        {SETTING_SECTIONS.filter(s => s.title !== 'User Account').map((section, index) => (
          <View key={index} className="mb-6">
            <Text className="text-purple-600 dark:text-purple-300 text-xs uppercase tracking-wider mb-3 ml-2" style={{ fontFamily: 'Inter_700Bold' }}>
              {section.title}
            </Text>
            <View className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-slate-800">
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={item.id}
                  className={`flex-row items-center px-4 py-4 ${itemIndex !== section.items.length - 1 ? 'border-b border-gray-100 dark:border-slate-800' : ''}`}
                  disabled={item.title === 'Themes'}
                  onPress={() => {
                    if (item.title !== 'Themes') {
                      router.push({ pathname: '/setting-detail', params: { title: item.title } });
                    }
                  }}
                >
                  <MaterialCommunityIcons name={item.icon as any} size={24} color="#E8A0BF" className="mr-3" />
                  <Text className="flex-1 text-gray-800 dark:text-gray-200 text-base" style={{ fontFamily: 'Inter_500Medium' }}>
                    {item.title}
                  </Text>
                  {item.title === 'Themes' ? (
                    <Switch 
                      value={isDarkMode} 
                      onValueChange={toggleColorScheme}
                      trackColor={{ false: '#D1D5DB', true: '#7C5CBF' }}
                      thumbColor="#FFF"
                    />
                  ) : (
                    <MaterialCommunityIcons name="chevron-right" size={24} color={isDarkMode ? '#6B7280' : '#D1D5DB'} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Logout */}
        <TouchableOpacity
          className="mt-4 mb-8 bg-white dark:bg-slate-900 rounded-2xl p-4 flex-row justify-center items-center shadow-sm border border-gray-100 dark:border-slate-800"
          onPress={() => {
            logout();
            router.replace('/(auth)/login');
          }}
        >
          <MaterialCommunityIcons name="logout" size={20} color="#EF4444" className="mr-2" />
          <Text className="text-[#EF4444] text-base" style={{ fontFamily: 'Inter_700Bold' }}>Log Out</Text>
        </TouchableOpacity>

        {/* Version Info */}
        <Text className="text-center text-gray-500 dark:text-gray-500 text-xs mb-8" style={{ fontFamily: 'Inter_400Regular' }}>
          GriefBridge v1.0.0 (Build 42)
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
