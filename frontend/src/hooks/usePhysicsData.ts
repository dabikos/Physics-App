import { useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  PHYSICS_SECTIONS,
  getAllFormulas,
  getAllTasks,
  getAllTests,
  getAllTopicsContent,
  getFormulaById as getFormulaByIdRaw,
  getTasksBySection as getTasksBySectionRaw,
  getTestsBySection as getTestsBySectionRaw,
  getTopicById as getTopicByIdRaw,
  getTopicsBySubsection as getTopicsBySubsectionRaw,
  Section,
  TopicContent,
  Formula,
  Task,
  Test,
} from '../data/physicsData';
import type { PhysicsTranslations } from '../data/physics/translationTypes';
import { translations as enTranslations } from '../data/physics/translations/en';
import { translations as kkTranslations } from '../data/physics/translations/kk';

const translationsMap: Record<string, PhysicsTranslations | null> = {
  ru: null,
  en: enTranslations,
  kk: kkTranslations,
};

function applySectionTranslations(
  sections: Record<string, Section>,
  tr: PhysicsTranslations['sections'] | undefined
): Record<string, Section> {
  if (!tr) return sections;
  const result: Record<string, Section> = {};
  for (const [key, section] of Object.entries(sections)) {
    const sTr = tr[key];
    if (!sTr) {
      result[key] = section;
      continue;
    }
    result[key] = {
      ...section,
      name: sTr.name || section.name,
      subsections: section.subsections.map((sub) => {
        const subTr = sTr.subsections?.[sub.id];
        if (!subTr) return sub;
        return {
          ...sub,
          name: subTr.name || sub.name,
          topics: sub.topics.map((topic) => ({
            ...topic,
            name: subTr.topics?.[topic.id] || topic.name,
          })),
        };
      }),
    };
  }
  return result;
}

function applyTopicTranslations(
  topics: Record<string, TopicContent>,
  tr: PhysicsTranslations['topics'] | undefined
): Record<string, TopicContent> {
  if (!tr) return topics;
  const result: Record<string, TopicContent> = {};
  for (const [key, topic] of Object.entries(topics)) {
    const tTr = tr[key];
    if (!tTr) {
      result[key] = topic;
      continue;
    }
    result[key] = {
      ...topic,
      title: tTr.title || topic.title,
      brief_info: tTr.brief_info || topic.brief_info,
      example_problem: tTr.example_problem || topic.example_problem,
    };
  }
  return result;
}

function applyFormulaTranslations(
  formulas: Formula[],
  tr: PhysicsTranslations['formulas'] | undefined
): Formula[] {
  if (!tr) return formulas;
  return formulas.map((f) => {
    const fTr = tr[f.id];
    if (!fTr) return f;
    return {
      ...f,
      name: fTr.name || f.name,
      description: fTr.description || f.description,
      variables: fTr.variables || f.variables,
      unit: fTr.unit || f.unit,
    };
  });
}

function applyTaskTranslations(
  tasks: Task[],
  tr: PhysicsTranslations['tasks'] | undefined
): Task[] {
  if (!tr) return tasks;
  return tasks.map((task) => {
    const tTr = tr[task.id];
    if (!tTr) return task;
    return {
      ...task,
      title: tTr.title || task.title,
      question: tTr.question || task.question,
      options: tTr.options?.length ? tTr.options : task.options,
      // correct_answer is index in options, no remapping required
      explanation: tTr.explanation || task.explanation,
    };
  });
}

function applyTestTranslations(
  tests: Test[],
  tr: PhysicsTranslations['tests'] | undefined
): Test[] {
  if (!tr) return tests;
  return tests.map((test) => {
    const tTr = tr[test.id];
    if (!tTr) return test;
    return {
      ...test,
      title: tTr.title || test.title,
      questions: test.questions.map((q, i) => {
        const qTr = tTr.questions?.[i];
        if (!qTr) return q;
        return {
          ...q,
          question: qTr.question || q.question,
          options: qTr.options?.length ? qTr.options : q.options,
        };
      }),
    };
  });
}

function topicFallbackByLanguage(lang: string): string {
  if (lang === 'en') return 'Section under development';
  if (lang === 'kk') return '\u0411\u04e9\u043b\u0456\u043c \u0434\u0430\u0439\u044b\u043d\u0434\u0430\u043b\u0443\u0434\u0430';
  return '\u0420\u0430\u0437\u0434\u0435\u043b \u0432 \u0440\u0430\u0437\u0440\u0430\u0431\u043e\u0442\u043a\u0435';
}

function isDefaultTopicFallback(value: string): boolean {
  return value === 'Section under development' || value === '\u0420\u0430\u0437\u0434\u0435\u043b \u0432 \u0440\u0430\u0437\u0440\u0430\u0431\u043e\u0442\u043a\u0435';
}

type PhysicsDataResult = {
  PHYSICS_SECTIONS: Record<string, Section>;
  TOPICS_CONTENT: Record<string, TopicContent>;
  FORMULAS_DATA: Formula[];
  TASKS_DATA: Task[];
  TESTS_DATA: Test[];
  getTopicById: (id: string) => TopicContent | null;
  getFormulaById: (id: string) => Formula | null;
  getTasksBySection: (section: string) => Task[];
  getTestsBySection: (section: string) => Test[];
  getTopicsBySubsection: (sectionId: string, subsectionId: string) => TopicContent[];
};

export function usePhysicsData(): PhysicsDataResult {
  const { currentLanguage } = useLanguage();

  const tr = translationsMap[currentLanguage];

  const translatedSections = useMemo(() => {
    return applySectionTranslations(PHYSICS_SECTIONS, tr?.sections);
  }, [tr]);

  const data = useMemo(() => {
    let topicsCache: Record<string, TopicContent> | null = null;
    let formulasCache: Formula[] | null = null;
    let tasksCache: Task[] | null = null;
    let testsCache: Test[] | null = null;

    const getAllTopicsTranslated = (): Record<string, TopicContent> => {
      if (topicsCache) return topicsCache;
      topicsCache = applyTopicTranslations(getAllTopicsContent(), tr?.topics);
      return topicsCache;
    };

    const getAllFormulasTranslated = (): Formula[] => {
      if (formulasCache) return formulasCache;
      formulasCache = applyFormulaTranslations(getAllFormulas(), tr?.formulas);
      return formulasCache;
    };

    const getAllTasksTranslated = (): Task[] => {
      if (tasksCache) return tasksCache;
      tasksCache = applyTaskTranslations(getAllTasks(), tr?.tasks);
      return tasksCache;
    };

    const getAllTestsTranslated = (): Test[] => {
      if (testsCache) return testsCache;
      testsCache = applyTestTranslations(getAllTests(), tr?.tests);
      return testsCache;
    };

    const getTopicById = (id: string): TopicContent | null => {
      const topic = getTopicByIdRaw(id);
      if (!topic) return null;

      const tTr = tr?.topics?.[id];
      const translated = tTr
        ? {
            ...topic,
            title: tTr.title || topic.title,
            brief_info: tTr.brief_info || topic.brief_info,
            example_problem: tTr.example_problem || topic.example_problem,
          }
        : topic;

      if (isDefaultTopicFallback(translated.brief_info)) {
        return { ...translated, brief_info: topicFallbackByLanguage(currentLanguage) };
      }

      return translated;
    };

    const getFormulaById = (id: string): Formula | null => {
      const formula = getFormulaByIdRaw(id);
      if (!formula) return null;

      const fTr = tr?.formulas?.[id];
      if (!fTr) return formula;

      return {
        ...formula,
        name: fTr.name || formula.name,
        description: fTr.description || formula.description,
        variables: fTr.variables || formula.variables,
        unit: fTr.unit || formula.unit,
      };
    };

    const getTasksBySection = (section: string): Task[] => {
      return applyTaskTranslations(getTasksBySectionRaw(section), tr?.tasks);
    };

    const getTestsBySection = (section: string): Test[] => {
      return applyTestTranslations(getTestsBySectionRaw(section), tr?.tests);
    };

    const getTopicsBySubsection = (sectionId: string, subsectionId: string): TopicContent[] => {
      const topics = getTopicsBySubsectionRaw(sectionId, subsectionId);
      return topics.map((topic) => {
        const tTr = tr?.topics?.[topic.id];
        if (!tTr) {
          if (isDefaultTopicFallback(topic.brief_info)) {
            return { ...topic, brief_info: topicFallbackByLanguage(currentLanguage) };
          }
          return topic;
        }
        return {
          ...topic,
          title: tTr.title || topic.title,
          brief_info: tTr.brief_info || topic.brief_info,
          example_problem: tTr.example_problem || topic.example_problem,
        };
      });
    };

    const result = {
      PHYSICS_SECTIONS: translatedSections,
      getTopicById,
      getFormulaById,
      getTasksBySection,
      getTestsBySection,
      getTopicsBySubsection,
    } as PhysicsDataResult;

    Object.defineProperties(result, {
      TOPICS_CONTENT: {
        enumerable: true,
        get: getAllTopicsTranslated,
      },
      FORMULAS_DATA: {
        enumerable: true,
        get: getAllFormulasTranslated,
      },
      TASKS_DATA: {
        enumerable: true,
        get: getAllTasksTranslated,
      },
      TESTS_DATA: {
        enumerable: true,
        get: getAllTestsTranslated,
      },
    });

    return result;
  }, [currentLanguage, tr, translatedSections]);

  return data;
}
