import { Stack } from 'expo-router';
import { useTheme } from '../../src/context/ThemeContext';

export default function GamesLayout() {
  const { colors } = useTheme();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="catch-formula" />
      <Stack.Screen name="electricity-maze" />
    </Stack>
  );
}

