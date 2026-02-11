import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

const FAVORITES_CACHE_KEY = 'physics_favorites';

interface FavoriteItem {
  item_id: string;
  item_type: 'topic' | 'formula';
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFavorites = useCallback(async () => {
    try {
      // Try API first
      const response = await api.get('/favorites');
      const data: FavoriteItem[] = response.data;
      setFavorites(data);
      await AsyncStorage.setItem(FAVORITES_CACHE_KEY, JSON.stringify(data));
    } catch {
      // Fallback to cache
      try {
        const cached = await AsyncStorage.getItem(FAVORITES_CACHE_KEY);
        if (cached) setFavorites(JSON.parse(cached));
      } catch {}
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const isFavorite = useCallback(
    (itemId: string, itemType: 'topic' | 'formula') => {
      return favorites.some((f) => f.item_id === itemId && f.item_type === itemType);
    },
    [favorites]
  );

  const toggleFavorite = useCallback(
    async (itemId: string, itemType: 'topic' | 'formula') => {
      // Optimistic update
      const exists = favorites.some((f) => f.item_id === itemId && f.item_type === itemType);
      let newFavs: FavoriteItem[];
      if (exists) {
        newFavs = favorites.filter((f) => !(f.item_id === itemId && f.item_type === itemType));
      } else {
        newFavs = [...favorites, { item_id: itemId, item_type: itemType }];
      }
      setFavorites(newFavs);
      await AsyncStorage.setItem(FAVORITES_CACHE_KEY, JSON.stringify(newFavs));

      try {
        await api.post('/favorites/toggle', { item_id: itemId, item_type: itemType });
      } catch {
        // Revert on error
        setFavorites(favorites);
        await AsyncStorage.setItem(FAVORITES_CACHE_KEY, JSON.stringify(favorites));
      }
    },
    [favorites]
  );

  return { favorites, loading, isFavorite, toggleFavorite, refresh: loadFavorites };
}
