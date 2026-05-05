import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Formula, Section, TopicContent } from '../types/physics';

const OFFLINE_CACHE_KEY = 'physics_offline_cache';
const OFFLINE_CACHED_AT_KEY = 'physics_offline_cached_at';

export interface OfflineContentCacheData {
  sections: Record<string, Section>;
  topics: Record<string, TopicContent>;
  formulas: Formula[];
}

export async function saveOfflineContentCache(data: OfflineContentCacheData): Promise<string> {
  const now = new Date().toISOString();
  await AsyncStorage.multiSet([
    [OFFLINE_CACHE_KEY, JSON.stringify(data)],
    [OFFLINE_CACHED_AT_KEY, now],
  ]);
  return now;
}

export async function getOfflineContentCache(): Promise<OfflineContentCacheData | null> {
  const cached = await AsyncStorage.getItem(OFFLINE_CACHE_KEY);
  if (!cached) return null;
  return JSON.parse(cached);
}

export async function getOfflineContentCachedAt(): Promise<string | null> {
  return AsyncStorage.getItem(OFFLINE_CACHED_AT_KEY);
}
