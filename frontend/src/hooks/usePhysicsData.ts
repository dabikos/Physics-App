import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useSubscription } from '../context/SubscriptionContext';
import api from '../services/api';
import { getOfflineContentCache } from '../services/offlineContentCache';
import type {
  Formula,
  Section,
  Task,
  Test,
  TopicContent,
} from '../types/physics';

const FALLBACK_SECTIONS_BY_LANG: Record<string, Record<string, Section>> = {
  ru: {
    mechanics: { name: 'Механика', icon: 'speedometer', color: '#4A90D9', subsections: [] },
    thermodynamics: { name: 'Термодинамика', icon: 'flame', color: '#FF6B6B', subsections: [] },
    electromagnetism: { name: 'Электричество и магнетизм', icon: 'flash', color: '#8B5CF6', subsections: [] },
    optics: { name: 'Оптика', icon: 'eye', color: '#06B6D4', subsections: [] },
    atomic: { name: 'Атомная и ядерная физика', icon: 'nuclear', color: '#10B981', subsections: [] },
    relativity: { name: 'СТО', icon: 'planet', color: '#F59E0B', subsections: [] },
    astronomy: { name: 'Астрономия', icon: 'moon', color: '#6366F1', subsections: [] },
  },
  en: {
    mechanics: { name: 'Mechanics', icon: 'speedometer', color: '#4A90D9', subsections: [] },
    thermodynamics: { name: 'Thermodynamics', icon: 'flame', color: '#FF6B6B', subsections: [] },
    electromagnetism: { name: 'Electricity and Magnetism', icon: 'flash', color: '#8B5CF6', subsections: [] },
    optics: { name: 'Optics', icon: 'eye', color: '#06B6D4', subsections: [] },
    atomic: { name: 'Atomic and Nuclear Physics', icon: 'nuclear', color: '#10B981', subsections: [] },
    relativity: { name: 'Special Relativity', icon: 'planet', color: '#F59E0B', subsections: [] },
    astronomy: { name: 'Astronomy', icon: 'moon', color: '#6366F1', subsections: [] },
  },
  kk: {
    mechanics: { name: 'Механика', icon: 'speedometer', color: '#4A90D9', subsections: [] },
    thermodynamics: { name: 'Термодинамика', icon: 'flame', color: '#FF6B6B', subsections: [] },
    electromagnetism: { name: 'Электр және магнетизм', icon: 'flash', color: '#8B5CF6', subsections: [] },
    optics: { name: 'Оптика', icon: 'eye', color: '#06B6D4', subsections: [] },
    atomic: { name: 'Атомдық және ядролық физика', icon: 'nuclear', color: '#10B981', subsections: [] },
    relativity: { name: 'Арнайы салыстырмалылық', icon: 'planet', color: '#F59E0B', subsections: [] },
    astronomy: { name: 'Астрономия', icon: 'moon', color: '#6366F1', subsections: [] },
  },
};

type PhysicsDataResult = {
  PHYSICS_SECTIONS: Record<string, Section>;
  TOPICS_CONTENT: Record<string, TopicContent>;
  FORMULAS_DATA: Formula[];
  TASKS_DATA: Task[];
  TESTS_DATA: Test[];
  isLoading: boolean;
  hasRemoteContent: boolean;
  getTopicById: (id: string) => TopicContent | null;
  getFormulaById: (id: string) => Formula | null;
  getTasksBySection: (section: string) => Task[];
  getTestsBySection: (section: string) => Test[];
  getTopicsBySubsection: (sectionId: string, subsectionId: string) => TopicContent[];
};

const normalizeLanguage = (language: string) => {
  if (language.startsWith('en')) return 'en';
  if (language.startsWith('kk') || language.startsWith('kz')) return 'kk';
  return 'ru';
};

const emptyRecord = {} as Record<string, TopicContent>;
const emptyTasks: Task[] = [];
const emptyTests: Test[] = [];

export function usePhysicsData(): PhysicsDataResult {
  const { currentLanguage } = useLanguage();
  const { isPro } = useSubscription();
  const language = normalizeLanguage(currentLanguage);
  const [sections, setSections] = useState<Record<string, Section>>(
    FALLBACK_SECTIONS_BY_LANG[language] || FALLBACK_SECTIONS_BY_LANG.ru
  );
  const [topics, setTopics] = useState<Record<string, TopicContent>>(emptyRecord);
  const [formulas, setFormulas] = useState<Formula[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasRemoteContent, setHasRemoteContent] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadRemoteContent = async () => {
      setIsLoading(true);
      setSections(FALLBACK_SECTIONS_BY_LANG[language] || FALLBACK_SECTIONS_BY_LANG.ru);
      setTopics(emptyRecord);
      setFormulas([]);
      setHasRemoteContent(false);

      try {
        const [sectionsResponse, topicsResponse, formulasResponse] = await Promise.all([
          api.get('/sections'),
          api.get('/topics', { params: { summary: true } }),
          api.get('/formulas', { params: { summary: true } }),
        ]);

        if (cancelled) return;

        const remoteSections = sectionsResponse.data || {};
        const remoteTopics = Array.isArray(topicsResponse.data) ? topicsResponse.data : [];
        const remoteFormulas = Array.isArray(formulasResponse.data?.items) ? formulasResponse.data.items : [];
        const topicsById = remoteTopics.reduce((acc: Record<string, TopicContent>, topic: TopicContent) => {
          if (topic?.id) acc[topic.id] = topic;
          return acc;
        }, {});

        if (Object.keys(remoteSections).length > 0) {
          setSections(remoteSections);
          setHasRemoteContent(true);
        }
        setTopics(topicsById);
        setFormulas(remoteFormulas);
      } catch (error) {
        console.log('Physics content load error:', error);
        try {
          const cached = await getOfflineContentCache();
          if (!cancelled && cached) {
            setSections(cached.sections);
            setTopics(cached.topics);
            setFormulas(cached.formulas);
          }
        } catch (cacheError) {
          console.log('Offline physics content load error:', cacheError);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadRemoteContent();
    return () => {
      cancelled = true;
    };
  }, [language, isPro]);

  return useMemo(() => {
    const getTopicById = (id: string): TopicContent | null => topics[id] || null;
    const getFormulaById = (id: string): Formula | null => formulas.find((formula) => formula.id === id) || null;
    const getTasksBySection = (_section: string): Task[] => emptyTasks;
    const getTestsBySection = (_section: string): Test[] => emptyTests;
    const getTopicsBySubsection = (sectionId: string, subsectionId: string): TopicContent[] => (
      Object.values(topics).filter((topic) => topic.section === sectionId && topic.subsection === subsectionId)
    );

    return {
      PHYSICS_SECTIONS: sections,
      TOPICS_CONTENT: topics,
      FORMULAS_DATA: formulas,
      TASKS_DATA: emptyTasks,
      TESTS_DATA: emptyTests,
      isLoading,
      hasRemoteContent,
      getTopicById,
      getFormulaById,
      getTasksBySection,
      getTestsBySection,
      getTopicsBySubsection,
    };
  }, [formulas, hasRemoteContent, isLoading, sections, topics]);
}
