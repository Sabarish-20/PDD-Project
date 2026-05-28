import React from 'react';
import { View } from 'react-native';

// This screen is never actually rendered because the tabPress listener in _layout.tsx intercepts the tap and navigates to the add-memory stack screen instead.
export default function DummyAddScreen() {
  return <View />;
}
