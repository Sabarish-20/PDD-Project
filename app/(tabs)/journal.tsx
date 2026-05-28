import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useStore } from '../../store/useStore';

const MOODS = [
  { emoji: '😢', label: 'Very Sad', color: '#6B7280' },
  { emoji: '😔', label: 'Sad', color: '#9CA3AF' },
  { emoji: '😐', label: 'Okay', color: '#D1D5DB' },
  { emoji: '🙂', label: 'Good', color: '#E8A0BF' },
  { emoji: '😊', label: 'Peaceful', color: '#7C5CBF' },
];

export default function JournalScreen() {
  const [entry, setEntry] = useState('');
  const [activeMood, setActiveMood] = useState('😐');
  const [isSaving, setIsSaving] = useState(false);

  const journalEntries = useStore((state) => state.journalEntries);
  const memories = useStore((state) => state.memories);
  const profile = useStore((state) => state.profile);
  const addJournalEntry = useStore((state) => state.addJournalEntry);

  const formatDateLocal = (d: Date) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const today = new Date();
  const todayStr = formatDateLocal(today);
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const generateMonthDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevTotalDays = new Date(year, month, 0).getDate();
    
    const cells = [];
    
    // Previous month's leading days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevTotalDays - i);
      cells.push({
        dateStr: formatDateLocal(d),
        dayNumber: d.getDate(),
        isCurrentMonth: false
      });
    }
    
    // Current month's days
    for (let i = 1; i <= totalDays; i++) {
      const d = new Date(year, month, i);
      cells.push({
        dateStr: formatDateLocal(d),
        dayNumber: i,
        isCurrentMonth: true
      });
    }
    
    // Next month's trailing days (to fill 42 cells)
    const remaining = 42 - cells.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      cells.push({
        dateStr: formatDateLocal(d),
        dayNumber: i,
        isCurrentMonth: false
      });
    }
    
    return cells;
  };

  const selectedEntries = journalEntries.filter(e => e.date === selectedDate);
  const selectedMemories = memories.filter(m => m.date === selectedDate);

  const handleSaveEntry = async () => {
    if (!entry.trim()) return;

    setIsSaving(true);
    try {
      // Update Zustand (which now saves to FastAPI backend)
      await addJournalEntry(entry.trim(), activeMood, selectedDate);

      setEntry('');
      setActiveMood('😐');
      Alert.alert("Saved", "Your journal entry has been saved for " + selectedDate + ".");
    } catch (error) {
      console.error("Error saving journal entry:", error);
      Alert.alert("Error", "Failed to save entry.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950" edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        {/* Header */}
        <View className="px-6 py-4 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 pt-10">
          <Text className="text-2xl text-purple-600 dark:text-purple-300" style={{ fontFamily: 'Lora_700Bold' }}>
            Grief Journal
          </Text>
        </View>

        <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 120 }}>
          {/* Dynamic Monthly Grid Calendar */}
          <View className="bg-white dark:bg-slate-900 py-4 px-6 border-b border-gray-100 dark:border-slate-800 mb-6 shadow-sm">
            {/* Calendar Controls */}
            <View className="flex-row justify-between items-center mb-4">
              <TouchableOpacity 
                onPress={handlePrevMonth} 
                className="w-8 h-8 rounded-full bg-purple-50 dark:bg-slate-800 items-center justify-center"
              >
                <MaterialCommunityIcons name="chevron-left" size={20} color="#7C5CBF" />
              </TouchableOpacity>
              <Text className="text-base text-purple-600 dark:text-purple-300 font-bold" style={{ fontFamily: 'Inter_700Bold' }}>
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </Text>
              <TouchableOpacity 
                onPress={handleNextMonth} 
                className="w-8 h-8 rounded-full bg-purple-50 dark:bg-slate-800 items-center justify-center"
              >
                <MaterialCommunityIcons name="chevron-right" size={20} color="#7C5CBF" />
              </TouchableOpacity>
            </View>

            {/* Weekdays */}
            <View className="flex-row justify-between mb-2">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((dayName, idx) => (
                <Text key={idx} className="text-gray-400 dark:text-gray-500 text-xs w-[14.28%] text-center" style={{ fontFamily: 'Inter_700Bold' }}>
                  {dayName}
                </Text>
              ))}
            </View>

            {/* Days Grid */}
            <View className="flex-row flex-wrap">
              {generateMonthDays().map((item, idx) => {
                const hasData = journalEntries.some(e => e.date === item.dateStr) || memories.some(m => m.date === item.dateStr);
                const isSelected = item.dateStr === selectedDate;
                
                return (
                  <TouchableOpacity 
                    key={idx} 
                    onPress={() => setSelectedDate(item.dateStr)} 
                    className="items-center w-[14.28%] py-1.5"
                  >
                    <View 
                      className={`w-8 h-8 items-center justify-center rounded-full ${
                        isSelected ? 'bg-purple-600' : 'bg-transparent'
                      }`}
                    >
                      <Text 
                        className={`text-xs ${
                          isSelected ? 'text-white font-bold' : 
                          item.isCurrentMonth ? 'text-slate-800 dark:text-gray-200' : 'text-gray-300 dark:text-gray-700'
                        }`} 
                        style={{ fontFamily: isSelected ? 'Inter_700Bold' : 'Inter_400Regular' }}
                      >
                        {item.dayNumber}
                      </Text>
                    </View>
                    <View className="h-1.5 justify-center mt-0.5">
                      {hasData && !isSelected && (
                        <View className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View className="px-6">
            {/* AI Prompt Card */}
            <View className="bg-purple-50 dark:bg-slate-900 rounded-2xl p-5 mb-6 border border-purple-100 dark:border-slate-800">
              <Text className="text-xs text-purple-600 dark:text-purple-300 mb-1 uppercase tracking-wider" style={{ fontFamily: 'Inter_700Bold' }}>Daily Reflection</Text>
              <Text className="text-purple-600 dark:text-purple-300 text-base" style={{ fontFamily: 'Lora_700Bold' }}>
                What's something {profile?.name ? profile.name.split(' ')[0] : 'your loved one'} taught you about patience?
              </Text>
            </View>

            {/* Entry Area */}
            <View className="mb-8">
              <TextInput
                value={entry}
                onChangeText={setEntry}
                placeholder="Write your thoughts here..."
                placeholderTextColor="#9CA3AF"
                multiline
                className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-5 text-base shadow-sm text-slate-800 dark:text-gray-200"
                style={{ fontFamily: 'Inter_400Regular', textAlignVertical: 'top', minHeight: 200 }}
              />
            </View>

            {/* Mood Selector */}
            <Text className="text-sm text-gray-500 dark:text-gray-400 mb-3 text-center" style={{ fontFamily: 'Inter_500Medium' }}>
              How are you feeling right now?
            </Text>
            <View className="flex-row justify-between mb-8 px-2">
              {MOODS.map((m) => (
                <TouchableOpacity
                  key={m.emoji}
                  onPress={() => setActiveMood(m.emoji)}
                  className={`items-center justify-center w-12 h-12 rounded-full border ${activeMood === m.emoji ? 'border-purple-600 bg-purple-50' : 'border-transparent'
                    }`}
                >
                  <Text className="text-2xl">{m.emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Save Button */}
            <TouchableOpacity
              onPress={handleSaveEntry}
              disabled={isSaving}
              className={`rounded-xl py-4 items-center justify-center shadow-sm mb-10 ${isSaving ? 'bg-purple-300' : 'bg-purple-600'}`}
            >
              <Text className="text-white text-lg" style={{ fontFamily: 'Inter_700Bold' }}>
                {isSaving ? 'Saving...' : 'Save Entry'}
              </Text>
            </TouchableOpacity>

            {/* Selected Date Entries */}
            <Text className="text-lg text-purple-600 dark:text-purple-300 mb-4" style={{ fontFamily: 'Lora_700Bold' }}>
              {selectedDate === todayStr ? 'Today\'s Activity' : 'Activity on ' + selectedDate}
            </Text>

            {selectedEntries.length === 0 && selectedMemories.length === 0 && (
              <Text className="text-gray-500 dark:text-gray-400 text-center mb-6" style={{ fontFamily: 'Inter_400Regular' }}>No entries or memories for this day.</Text>
            )}

            {selectedEntries.map(item => (
              <TouchableOpacity key={item.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl mb-3 shadow-sm border border-gray-100 dark:border-slate-800 flex-row">
                <Text className="text-2xl mr-3">{item.mood}</Text>
                <View className="flex-1">
                  <Text className="text-purple-600 dark:text-purple-300 text-xs mb-1" style={{ fontFamily: 'Inter_700Bold' }}>Journal Entry</Text>
                  <Text className="text-gray-500 dark:text-gray-400 text-sm" style={{ fontFamily: 'Inter_400Regular' }} numberOfLines={2}>
                    {item.preview}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}

            {selectedMemories.map(item => (
              <TouchableOpacity key={item.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl mb-3 shadow-sm border border-gray-100 dark:border-slate-800 flex-row items-center">
                <View className="w-10 h-10 rounded-full bg-purple-50 dark:bg-slate-800 items-center justify-center mr-3">
                   <MaterialCommunityIcons name={item.type === 'photo' ? 'image' : item.type === 'audio' ? 'microphone' : item.type === 'video' ? 'video' : 'text-box'} size={20} color="#7C5CBF" />
                </View>
                <View className="flex-1 justify-center">
                  <Text className="text-purple-600 dark:text-purple-300 text-sm mb-1" style={{ fontFamily: 'Inter_700Bold' }}>{item.title}</Text>
                  <Text className="text-gray-500 dark:text-gray-400 text-xs" style={{ fontFamily: 'Inter_400Regular' }}>Memory Vault • {item.emotion}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
