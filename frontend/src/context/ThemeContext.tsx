import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ==================== Types ====================
export type Theme = 'light' | 'dark';

export interface ThemeColors {
  // Backgrounds
  background: string;
  card: string;
  cardAlt: string;
  headerBg: string;
  inputBg: string;
  modalOverlay: string;
  modalBg: string;

  // Text
  text: string;
  textSecondary: string;
  textTertiary: string;
  textMuted: string;

  // Borders
  border: string;
  borderLight: string;

  // Accent
  accent: string;
  accentLight: string;
  accentText: string;

  // Tab Bar
  tabBarBg: string;
  tabBarBorder: string;
  tabBarActive: string;
  tabBarInactive: string;

  // Status Bar
  statusBarStyle: 'light' | 'dark' | 'auto';

  // Shadows
  shadowColor: string;

  // Specific
  skeletonBg: string;
  searchBg: string;
  chipBg: string;
  chipBorder: string;
  chipActiveBg: string;
  chipActiveText: string;

  // Semantic
  success: string;
  successBg: string;
  warning: string;
  warningBg: string;
  error: string;
  errorBg: string;
  infoBg: string;

  // Option / Quiz
  optionBg: string;
  optionBorder: string;
  optionSelectedBg: string;
  optionCircleBg: string;
}

// ==================== Color Palettes ====================
const lightColors: ThemeColors = {
  background: '#F5F7FA',
  card: '#FFFFFF',
  cardAlt: '#F9FAFB',
  headerBg: '#FFFFFF',
  inputBg: '#F3F4F6',
  modalOverlay: 'rgba(0,0,0,0.5)',
  modalBg: '#FFFFFF',

  text: '#1F2937',
  textSecondary: '#374151',
  textTertiary: '#6B7280',
  textMuted: '#9CA3AF',

  border: '#E5E7EB',
  borderLight: '#F3F4F6',

  accent: '#6C63FF',
  accentLight: '#EEF2FF',
  accentText: '#6366F1',

  tabBarBg: '#FFFFFF',
  tabBarBorder: '#E5E7EB',
  tabBarActive: '#6C63FF',
  tabBarInactive: '#9CA3AF',

  statusBarStyle: 'dark',

  shadowColor: '#000',

  skeletonBg: '#E5E7EB',
  searchBg: '#FFFFFF',
  chipBg: '#FFFFFF',
  chipBorder: '#E5E7EB',
  chipActiveBg: '#6C63FF',
  chipActiveText: '#FFFFFF',

  success: '#10B981',
  successBg: '#D1FAE5',
  warning: '#F59E0B',
  warningBg: '#FEF3C7',
  error: '#EF4444',
  errorBg: '#FEE2E2',
  infoBg: '#EEF2FF',

  optionBg: '#F9FAFB',
  optionBorder: '#E5E7EB',
  optionSelectedBg: '#EEF2FF',
  optionCircleBg: '#E5E7EB',
};

const darkColors: ThemeColors = {
  background: '#0F1117',
  card: '#1A1D27',
  cardAlt: '#22252F',
  headerBg: '#1A1D27',
  inputBg: '#22252F',
  modalOverlay: 'rgba(0,0,0,0.7)',
  modalBg: '#1A1D27',

  text: '#F3F4F6',
  textSecondary: '#D1D5DB',
  textTertiary: '#9CA3AF',
  textMuted: '#6B7280',

  border: '#2D3140',
  borderLight: '#22252F',

  accent: '#818CF8',
  accentLight: '#1E1B4B',
  accentText: '#A5B4FC',

  tabBarBg: '#1A1D27',
  tabBarBorder: '#2D3140',
  tabBarActive: '#818CF8',
  tabBarInactive: '#6B7280',

  statusBarStyle: 'light',

  shadowColor: '#000',

  skeletonBg: '#2D3140',
  searchBg: '#22252F',
  chipBg: '#22252F',
  chipBorder: '#2D3140',
  chipActiveBg: '#818CF8',
  chipActiveText: '#FFFFFF',

  success: '#34D399',
  successBg: '#064E3B',
  warning: '#FBBF24',
  warningBg: '#78350F',
  error: '#F87171',
  errorBg: '#7F1D1D',
  infoBg: '#1E1B4B',

  optionBg: '#22252F',
  optionBorder: '#2D3140',
  optionSelectedBg: '#1E1B4B',
  optionCircleBg: '#2D3140',
};

// ==================== Context ====================
interface ThemeContextType {
  theme: Theme;
  colors: ThemeColors;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_KEY = 'app_theme';

// ==================== Provider ====================
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const saved = await AsyncStorage.getItem(THEME_KEY);
        if (saved === 'dark' || saved === 'light') {
          setThemeState(saved);
        }
      } catch {
        // default light
      } finally {
        setLoaded(true);
      }
    };
    loadTheme();
  }, []);

  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      await AsyncStorage.setItem(THEME_KEY, newTheme);
    } catch {}
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const isDark = theme === 'dark';
  const colors = isDark ? darkColors : lightColors;

  // Don't render until theme is loaded to avoid flash
  if (!loaded) return null;

  return (
    <ThemeContext.Provider value={{ theme, colors, isDark, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// ==================== Hook ====================
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
