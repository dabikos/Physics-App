import { useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePhysicsData } from './usePhysicsData';

const OFFLINE_CACHE_KEY = 'physics_offline_cache';
const OFFLINE_CACHED_AT_KEY = 'physics_offline_cached_at';

interface OfflineCacheData {
  sections: any;
  topics: any;
  formulas: any;
}

export function useOfflineCache() {
  const [isOnline, setIsOnline] = useState(true);
  const [isCached, setIsCached] = useState(false);
  const [cachedAt, setCachedAt] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { PHYSICS_SECTIONS, TOPICS_CONTENT, FORMULAS_DATA } = usePhysicsData();

  // Simple connectivity check via a lightweight fetch
  const checkOnline = useCallback(async () => {
    try {
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), 5000);
      await fetch('https://www.google.com/generate_204', {
        method: 'HEAD',
        signal: controller.signal,
      });
      clearTimeout(t);
      setIsOnline(true);
    } catch {
      setIsOnline(false);
    }
  }, []);

  useEffect(() => {
    checkOnline();
    intervalRef.current = setInterval(checkOnline, 30000); // check every 30s

    AsyncStorage.getItem(OFFLINE_CACHED_AT_KEY).then((val) => {
      if (val) {
        setIsCached(true);
        setCachedAt(val);
      }
    });

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [checkOnline]);

  const cacheForOffline = useCallback(async () => {
    try {
      const data: OfflineCacheData = {
        sections: PHYSICS_SECTIONS,
        topics: TOPICS_CONTENT,
        formulas: FORMULAS_DATA,
      };
      await AsyncStorage.setItem(OFFLINE_CACHE_KEY, JSON.stringify(data));
      const now = new Date().toISOString();
      await AsyncStorage.setItem(OFFLINE_CACHED_AT_KEY, now);
      setIsCached(true);
      setCachedAt(now);
      return true;
    } catch (e) {
      console.log('Cache error:', e);
      return false;
    }
  }, [PHYSICS_SECTIONS, TOPICS_CONTENT, FORMULAS_DATA]);

  const getCachedData = useCallback(async (): Promise<OfflineCacheData | null> => {
    try {
      const cached = await AsyncStorage.getItem(OFFLINE_CACHE_KEY);
      if (cached) return JSON.parse(cached);
      return null;
    } catch {
      return null;
    }
  }, []);

  return { isOnline, isCached, cachedAt, cacheForOffline, getCachedData };
}
