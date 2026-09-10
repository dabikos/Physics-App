import { useState, useEffect, useCallback, useRef } from 'react';
import { usePhysicsData } from './usePhysicsData';
import {
  getOfflineContentCache,
  getOfflineContentCachedAt,
  saveOfflineContentCache,
} from '../services/offlineContentCache';
import api from '../services/api';

export function useOfflineCache() {
  const [isOnline, setIsOnline] = useState(true);
  const [isCached, setIsCached] = useState(false);
  const [cachedAt, setCachedAt] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const {
    PHYSICS_SECTIONS,
    TOPICS_CONTENT,
    FORMULAS_DATA,
    hasRemoteContent,
    isLoading,
  } = usePhysicsData();

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

    getOfflineContentCachedAt().then((val) => {
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
      if (isLoading || !hasRemoteContent || Object.keys(TOPICS_CONTENT).length === 0) {
        return false;
      }

      const [topicsResponse, formulasResponse] = await Promise.all([
        api.get('/topics'),
        api.get('/formulas'),
      ]);
      const remoteTopics = Array.isArray(topicsResponse.data) ? topicsResponse.data : [];
      const remoteFormulas = Array.isArray(formulasResponse.data?.items) ? formulasResponse.data.items : [];
      const topicsById = remoteTopics.reduce((acc, topic) => {
        if (topic?.id) acc[topic.id] = topic;
        return acc;
      }, {} as typeof TOPICS_CONTENT);

      const data = {
        sections: PHYSICS_SECTIONS,
        topics: Object.keys(topicsById).length > 0 ? topicsById : TOPICS_CONTENT,
        formulas: remoteFormulas.length > 0 ? remoteFormulas : FORMULAS_DATA,
      };
      const now = await saveOfflineContentCache(data);
      setIsCached(true);
      setCachedAt(now);
      return true;
    } catch (e) {
      console.log('Cache error:', e);
      return false;
    }
  }, [FORMULAS_DATA, PHYSICS_SECTIONS, TOPICS_CONTENT, hasRemoteContent, isLoading]);

  const getCachedData = useCallback(async () => {
    try {
      return await getOfflineContentCache();
    } catch {
      return null;
    }
  }, []);

  return { isOnline, isCached, cachedAt, cacheForOffline, getCachedData };
}
