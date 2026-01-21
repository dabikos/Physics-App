import React from 'react';
import { Stack } from 'expo-router';

export default function TestsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#F5F7FA' },
      }}
    />
  );
}
