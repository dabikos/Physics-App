// Types for physics data translation overlays
// All fields are optional — only translated fields need to be provided

export interface SectionTranslation {
  name: string;
  subsections: Record<string, {
    name: string;
    topics: Record<string, string>; // topicId -> translated name
  }>;
}

export interface TopicTranslation {
  title: string;
  brief_info: string;
  example_problem: string;
}

export interface FormulaTranslation {
  name: string;
  description: string;
  variables: Record<string, string>;
  unit: string;
}

export interface TaskTranslation {
  title: string;
  question: string;
  options: string[];
  correct_answer?: string;
  explanation: string;
}

export interface TestTranslation {
  title: string;
  questions?: {
    question: string;
    options: string[];
  }[];
}

export interface PhysicsTranslations {
  sections: Record<string, SectionTranslation>;
  topics: Record<string, TopicTranslation>;
  formulas: Record<string, FormulaTranslation>;
  tasks: Record<string, Omit<TaskTranslation, 'correct_answer'>>;
  tests: Record<string, TestTranslation>;
}
