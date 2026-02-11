import { useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

const NOTES_CACHE_KEY = 'physics_notes';

export function useNotes() {
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadNotes = useCallback(async () => {
    try {
      const response = await api.get('/notes');
      const data: Record<string, string> = response.data;
      setNotes(data);
      await AsyncStorage.setItem(NOTES_CACHE_KEY, JSON.stringify(data));
    } catch {
      try {
        const cached = await AsyncStorage.getItem(NOTES_CACHE_KEY);
        if (cached) setNotes(JSON.parse(cached));
      } catch {}
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotes();
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [loadNotes]);

  const getNote = useCallback(
    (topicId: string) => notes[topicId] || '',
    [notes]
  );

  const saveNote = useCallback(
    (topicId: string, text: string) => {
      // Update local state immediately
      setNotes((prev) => {
        const updated = { ...prev };
        if (text.trim()) {
          updated[topicId] = text;
        } else {
          delete updated[topicId];
        }
        AsyncStorage.setItem(NOTES_CACHE_KEY, JSON.stringify(updated));
        return updated;
      });

      // Debounced backend save
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(async () => {
        try {
          await api.put('/notes', { topic_id: topicId, text });
        } catch (e) {
          console.log('Note save error:', e);
        }
      }, 1000);
    },
    []
  );

  return { notes, loading, getNote, saveNote, refresh: loadNotes };
}
