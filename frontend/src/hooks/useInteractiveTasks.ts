import { useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  INTERACTIVE_TASKS,
  InteractiveTask,
  getInteractiveTasksBySection as _getBySection,
  getInteractiveTaskById as _getById,
} from '../data/interactiveTasks';
import {
  InteractiveTaskI18n,
  interactiveTasksEN,
  interactiveTasksKK,
} from '../data/interactiveTasksI18n';

const translationMaps: Record<string, Record<string, InteractiveTaskI18n>> = {
  en: interactiveTasksEN,
  kk: interactiveTasksKK,
};

function applyTranslation(task: InteractiveTask, tr: InteractiveTaskI18n): InteractiveTask {
  const result = { ...task };
  result.title = tr.title;
  result.condition = tr.condition;
  result.hint = tr.hint;
  result.fullSolution = tr.fullSolution;
  result.answer = tr.answer;

  if (tr.unit) result.unit = tr.unit;
  if (tr.options) result.options = tr.options;

  if (tr.givenNames && result.given) {
    result.given = result.given.map((g, i) => ({
      ...g,
      name: tr.givenNames![i] ?? g.name,
      unit: tr.givenUnits?.[i] ?? g.unit,
    }));
  }

  if (tr.findName && result.find) {
    result.find = {
      ...result.find,
      name: tr.findName,
      unit: tr.findUnit ?? result.find.unit,
    };
  }

  if (tr.stepsContent && result.steps) {
    result.steps = result.steps.map((step, i) => ({
      ...step,
      content: tr.stepsContent![i] ?? step.content,
      description: tr.stepsDesc?.[i] ?? step.description,
    }));
  }

  return result;
}

export function useInteractiveTasks() {
  const { currentLanguage } = useLanguage();

  const tasks = useMemo(() => {
    if (currentLanguage === 'ru') return INTERACTIVE_TASKS;
    const trMap = translationMaps[currentLanguage];
    if (!trMap) return INTERACTIVE_TASKS;
    return INTERACTIVE_TASKS.map((task) => {
      const tr = trMap[task.id];
      return tr ? applyTranslation(task, tr) : task;
    });
  }, [currentLanguage]);

  const getInteractiveTaskById = useMemo(() => {
    return (taskId: string): InteractiveTask | null => {
      return tasks.find((t) => t.id === taskId) || null;
    };
  }, [tasks]);

  const getInteractiveTasksBySection = useMemo(() => {
    return (sectionId: string): InteractiveTask[] => {
      return tasks.filter((t) => t.section === sectionId);
    };
  }, [tasks]);

  return {
    INTERACTIVE_TASKS: tasks,
    getInteractiveTaskById,
    getInteractiveTasksBySection,
  };
}
