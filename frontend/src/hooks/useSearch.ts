import { useState, useCallback, useRef } from 'react';
import api from '../services/api';
import { usePhysicsData } from './usePhysicsData';

export interface SearchResult {
  type: 'topic' | 'formula' | 'section' | 'subsection';
  id: string;
  title: string;
  subtitle: string;
  icon: string;
}

export function useSearch() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { PHYSICS_SECTIONS, TOPICS_CONTENT, FORMULAS_DATA } = usePhysicsData();

  const searchLocal = useCallback((q: string): SearchResult[] => {
    const lower = q.toLowerCase().trim();
    if (lower.length < 2) return [];
    const found: SearchResult[] = [];

    // Search topics
    Object.entries(TOPICS_CONTENT).forEach(([id, topic]) => {
      if (
        topic.title.toLowerCase().includes(lower) ||
        topic.brief_info.toLowerCase().includes(lower)
      ) {
        found.push({
          type: 'topic',
          id,
          title: topic.title,
          subtitle: PHYSICS_SECTIONS[topic.section]?.name || topic.section,
          icon: 'book',
        });
      }
    });

    // Search formulas
    FORMULAS_DATA.forEach((f) => {
      if (
        f.name.toLowerCase().includes(lower) ||
        f.formula.toLowerCase().includes(lower) ||
        f.description.toLowerCase().includes(lower)
      ) {
        found.push({
          type: 'formula',
          id: f.id,
          title: f.name,
          subtitle: f.formula,
          icon: 'flask',
        });
      }
    });

    // Search sections
    Object.entries(PHYSICS_SECTIONS).forEach(([key, sec]) => {
      if (sec.name.toLowerCase().includes(lower)) {
        found.push({
          type: 'section',
          id: key,
          title: sec.name,
          subtitle: `${sec.subsections.length} подразделов`,
          icon: 'folder',
        });
      }
      sec.subsections.forEach((sub) => {
        if (sub.name.toLowerCase().includes(lower)) {
          found.push({
            type: 'subsection',
            id: `${key}/${sub.id}`,
            title: sub.name,
            subtitle: sec.name,
            icon: 'list',
          });
        }
      });
    });

    return found.slice(0, 20);
  }, [PHYSICS_SECTIONS, TOPICS_CONTENT, FORMULAS_DATA]);

  const search = useCallback(
    (q: string) => {
      setQuery(q);
      if (q.trim().length < 2) {
        setResults([]);
        setLoading(false);
        return;
      }
      setLoading(true);

      // Debounce
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(async () => {
        // Local search first (instant)
        const localResults = searchLocal(q);
        setResults(localResults);

        // Also try backend search for richer results
        try {
          const response = await api.get('/search', { params: { q } });
          if (response.data?.results?.length > 0) {
            // Merge, dedup by id
            const ids = new Set(localResults.map((r) => r.id));
            const extra = response.data.results.filter((r: SearchResult) => !ids.has(r.id));
            setResults([...localResults, ...extra].slice(0, 25));
          }
        } catch {
          // Local results are fine
        }
        setLoading(false);
      }, 300);
    },
    [searchLocal]
  );

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setLoading(false);
  }, []);

  return { query, results, loading, search, clearSearch };
}
