import '../global.css';
import { Stack } from 'expo-router';
import { ThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { useColorScheme } from 'nativewind';
import { useFonts, Lora_400Regular, Lora_700Bold } from '@expo-google-fonts/lora';
import { Inter_400Regular, Inter_500Medium, Inter_700Bold } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useStore } from '../store/useStore';
import { supabase } from '../config/supabaseConfig';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { colorScheme } = useColorScheme();
  const [loaded, error] = useFonts({
    Lora_400Regular,
    Lora_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_700Bold,
  });

  const login = useStore((state) => state.login);
  const logout = useStore((state) => state.logout);
  const fetchUserData = useStore((state) => state.fetchUserData);

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        useStore.setState({ isAuthenticated: true });
        fetchUserData();
      } else {
        useStore.setState({ isAuthenticated: false });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        useStore.setState({ isAuthenticated: true });
        fetchUserData();
      } else {
        useStore.setState({ isAuthenticated: false });
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchUserData]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="onboarding" options={{ headerShown: false }} />
            <Stack.Screen name="create-profile" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="add-memory" options={{ headerShown: false }} />
            <Stack.Screen name="setting-detail" options={{ headerShown: false, animation: 'slide_from_right' }} />
          </Stack>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
