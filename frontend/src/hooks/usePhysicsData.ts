import { useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  PHYSICS_SECTIONS,
  TOPICS_CONTENT,
  FORMULAS_DATA,
  TASKS_DATA,
  TESTS_DATA,
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

function applySectonTranslations(
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
      subsections: section.subsections.map(sub => {
        const subTr = sTr.subsections?.[sub.id];
        if (!subTr) return sub;
        return {
          ...sub,
          name: subTr.name || sub.name,
          topics: sub.topics.map(topic => ({
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
  return formulas.map(f => {
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
  return tasks.map(t => {
    const tTr = tr[t.id];
    if (!tTr) return t;
    // Find the index of the correct answer in original options,
    // then use the same index in translated options
    const correctIdx = t.options.indexOf(t.correct_answer);
    const translatedOptions = tTr.options?.length ? tTr.options : t.options;
    return {
      ...t,
      title: tTr.title || t.title,
      question: tTr.question || t.question,
      options: translatedOptions,
      correct_answer: correctIdx >= 0 && translatedOptions[correctIdx]
        ? translatedOptions[correctIdx]
        : t.correct_answer,
      explanation: tTr.explanation || t.explanation,
    };
  });
}

function applyTestTranslations(
  tests: Test[],
  tr: PhysicsTranslations['tests'] | undefined
): Test[] {
  if (!tr) return tests;
  return tests.map(t => {
    const tTr = tr[t.id];
    if (!tTr) return t;
    return {
      ...t,
      title: tTr.title || t.title,
      questions: t.questions.map((q, i) => {
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

export function usePhysicsData() {
  const { currentLanguage } = useLanguage();

  const data = useMemo(() => {
    const tr = translationsMap[currentLanguage];
    if (!tr) {
      // Russian or no translations available
      return {
        PHYSICS_SECTIONS,
        TOPICS_CONTENT,
        FORMULAS_DATA,
        TASKS_DATA,
        TESTS_DATA,
      };
    }

    return {
      PHYSICS_SECTIONS: applySectonTranslations(PHYSICS_SECTIONS, tr.sections),
      TOPICS_CONTENT: applyTopicTranslations(TOPICS_CONTENT, tr.topics),
      FORMULAS_DATA: applyFormulaTranslations(FORMULAS_DATA, tr.formulas),
      TASKS_DATA: applyTaskTranslations(TASKS_DATA, tr.tasks),
      TESTS_DATA: applyTestTranslations(TESTS_DATA, tr.tests),
    };
  }, [currentLanguage]);

  const getTopicById = (id: string): TopicContent | null => {
    return data.TOPICS_CONTENT[id] || null;
  };

  const getFormulaById = (id: string): Formula | null => {
    return data.FORMULAS_DATA.find(f => f.id === id) || null;
  };

  const getTasksBySection = (section: string): Task[] => {
    return data.TASKS_DATA.filter(t => t.section === section);
  };

  const getTestsBySection = (section: string): Test[] => {
    return data.TESTS_DATA.filter(t => t.section === section);
  };

  const getTopicsBySubsection = (sectionId: string, subsectionId: string): TopicContent[] => {
    const section = data.PHYSICS_SECTIONS[sectionId];
    if (!section) return [];
    const subsection = section.subsections.find(s => s.id === subsectionId);
    if (!subsection) return [];
    return subsection.topics.map(topic => {
      return data.TOPICS_CONTENT[topic.id] || {
        id: topic.id,
        section: sectionId,
        subsection: subsectionId,
        title: topic.name,
        brief_info: currentLanguage === 'en' ? 'Section under development' :
                     currentLanguage === 'kk' ? 'Бөлім дайындалуда' :
                     'Раздел в разработке',
        example_problem: '',
        formulas: [],
      };
    });
  };

  return {
    ...data,
    getTopicById,
    getFormulaById,
    getTasksBySection,
    getTestsBySection,
    getTopicsBySubsection,
  };
}
