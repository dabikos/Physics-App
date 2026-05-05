import { Platform } from 'react-native';

export const REVENUECAT_ENTITLEMENT_ID =
  process.env.EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID || 'Physics AI Pro';

export const REVENUECAT_OFFERING_ID =
  process.env.EXPO_PUBLIC_REVENUECAT_OFFERING_ID || 'default';

export const REVENUECAT_PRODUCTS = {
  monthly: 'monthly',
  yearly: 'yearly',
} as const;

export type RevenueCatProductId = keyof typeof REVENUECAT_PRODUCTS;

const ANDROID_API_KEY =
  process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY || 'test_fRSfnFYKOMGqPzUbDUhzdHMdExR';

const IOS_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY || '';
const WEB_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_WEB_API_KEY || '';

export function getRevenueCatApiKey() {
  if (Platform.OS === 'android') return ANDROID_API_KEY;
  if (Platform.OS === 'ios') return IOS_API_KEY;
  if (Platform.OS === 'web') return WEB_API_KEY;
  return '';
}
