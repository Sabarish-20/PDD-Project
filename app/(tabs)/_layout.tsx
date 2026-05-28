import React from 'react';
import { View, Platform, StyleSheet } from 'react-native';
import { Tabs, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';

export default function TabLayout() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  // Dynamic height and padding based on safe area (handles Android bottom navigation bar correctly)
  const paddingBottom = Math.max(insets.bottom, Platform.OS === 'ios' ? 28 : 10);
  const tabHeight = 60 + paddingBottom;

  const bgColor = isDark ? 'rgba(30, 30, 30, 0.95)' : 'rgba(253, 246, 236, 0.95)';
  const blurBgColor = isDark ? 'rgba(30, 30, 30, 0.4)' : 'rgba(253, 246, 236, 0.4)';
  const borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
  const centerBorderColor = isDark ? '#1E1E1E' : '#FDF6EC';
  const activeColor = isDark ? '#D8B4E2' : '#7C5CBF';
  const inactiveColor = isDark ? '#6B7280' : '#9CA3AF';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        tabBarShowLabel: true,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 0,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: borderColor,
          height: tabHeight,
          backgroundColor: Platform.OS === 'android' ? bgColor : 'transparent',
          paddingBottom: paddingBottom,
          paddingTop: 8,
        },
        tabBarBackground: () => (
          <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: bgColor }} />
        ),
        tabBarLabelStyle: {
          fontFamily: 'Inter_500Medium',
          fontSize: 10,
          marginTop: -4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home-variant" size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="vault"
        options={{
          title: 'Vault',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="image-multiple" size={24} color={color} />
          ),
        }}
      />
      
      {/* Central Add Button */}
      <Tabs.Screen
        name="add"
        options={{
          title: '',
          tabBarIcon: () => (
            <View 
              className="bg-purple-600 rounded-full items-center justify-center shadow-lg"
              style={{ width: 56, height: 56, borderRadius: 28, marginTop: Platform.OS === 'android' ? -32 : -24, borderWidth: 4, borderColor: centerBorderColor }}
            >
              <MaterialCommunityIcons name="plus" size={32} color="#FFF" />
            </View>
          ),
        }}
        listeners={() => ({
          tabPress: (e) => {
            e.preventDefault();
            router.push('/add-memory');
          },
        })}
      />

      <Tabs.Screen
        name="journal"
        options={{
          title: 'Journal',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="book-open-page-variant" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cog" size={24} color={color} />
          ),
        }}
      />

      {/* Hidden Screens inside tabs */}
      <Tabs.Screen name="chat" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="voice" options={{ href: null, tabBarStyle: { display: 'none' } }} />
    </Tabs>
  );
}
