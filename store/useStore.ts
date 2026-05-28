import { create } from 'zustand';
import { supabase } from '../config/supabaseConfig';

export interface Profile {
  name: string;
  relationship: string;
  avatar?: string;
  phrases?: string[];
  traits?: any; // To support both legacy string arrays and enriched metadata objects
  voiceId?: string;
  voiceModelUrl?: string;
}

export interface Memory {
  id: string;
  type: 'photo' | 'video' | 'audio' | 'text';
  title: string;
  content: string;
  emotion: string;
  date: string;
}

export interface JournalEntry {
  id: string;
  preview: string;
  mood: string;
  date: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface AppState {
  isAuthenticated: boolean;
  username: string | null;
  profile: Profile | null;
  memories: Memory[];
  journalEntries: JournalEntry[];
  messages: ChatMessage[];
  hasCompletedOnboarding: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchUserData: () => Promise<void>;
  saveProfile: (profile: Profile) => Promise<void>;
  addMemory: (memory: Omit<Memory, 'id'>) => Promise<void>;
  updateUsername: (newUsername: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  addJournalEntry: (content: string, mood: string, date: string) => Promise<void>;
  addMessage: (message: ChatMessage) => void;
  completeOnboarding: () => void;
}

export const useStore = create<AppState>((set, get) => ({
  isAuthenticated: false,
  username: null,
  profile: null,
  memories: [],
  journalEntries: [],
  messages: [],
  hasCompletedOnboarding: false,

  login: async (username, password) => {
    const email = `${username}@griefbridge.app`;
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    set({ isAuthenticated: true, username });
    await get().fetchUserData();
  },

  register: async (username, password) => {
    const email = `${username}@griefbridge.app`;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    set({ isAuthenticated: true, username });
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ isAuthenticated: false, username: null, profile: null, memories: [], journalEntries: [], messages: [] });
  },

  fetchUserData: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const username = user.email?.split('@')[0] || null;
      set({ username });

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('userId', user.id)
        .single();
      
      if (profile) set({ profile });

      const { data: memories } = await supabase
        .from('memories')
        .select('*')
        .eq('userId', user.id);
      
      if (memories) set({ memories: memories || [] });

      const { data: journals } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('userId', user.id);
      
      if (journals) {
        set({ journalEntries: journals.map(j => ({
          id: j.id,
          preview: j.content,
          mood: j.mood,
          date: j.date
        })) });
      }
    } catch (e) {
      console.error('Error fetching user data:', e);
    }
  },

  saveProfile: async (profileData) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('profiles').upsert({
      userId: user.id,
      ...profileData,
    });
    if (error) throw error;
    set({ profile: profileData });
  },

  addMemory: async (memoryData) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase.from('memories').insert({
      userId: user.id,
      ...memoryData,
    }).select().single();

    if (error) throw error;
    set((state) => ({ memories: [...state.memories, data] }));
  },

  updateUsername: async (newUsername) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const newEmail = `${newUsername}@griefbridge.app`;
    const { error } = await supabase.auth.updateUser({ email: newEmail });
    if (error) throw error;
    set({ username: newUsername });
  },

  updatePassword: async (newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  },

  addJournalEntry: async (content, mood, date) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase.from('journal_entries').insert({
      userId: user.id,
      content,
      mood,
      date
    }).select().single();

    if (error) throw error;
    set((state) => ({
      journalEntries: [...state.journalEntries, {
        id: data.id,
        preview: data.content,
        mood: data.mood,
        date: data.date
      }]
    }));
  },

  addMessage: (message) => {
    set((state) => ({ messages: [...state.messages, message] }));
  },

  completeOnboarding: () => {
    set({ hasCompletedOnboarding: true });
  },
}));
