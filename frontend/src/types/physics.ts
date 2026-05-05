export interface Topic {
  id: string;
  name: string;
}

export interface Subsection {
  id: string;
  name: string;
  topics: Topic[];
}

export interface Section {
  name: string;
  icon: string;
  color: string;
  subsections: Subsection[];
}

export interface TopicContent {
  id: string;
  section: string;
  subsection: string;
  title: string;
  brief_info: string;
  example_problem: string;
  formulas: string[];
  video?: string | number | null;
}

export interface Formula {
  id: string;
  section: string;
  name: string;
  formula: string;
  description: string;
  variables: Record<string, string>;
  unit: string;
}

export interface Task {
  id: string;
  section: string;
  title: string;
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface TestQuestion {
  question: string;
  options: string[];
  correct: number;
}

export type TestDifficulty = 'basic' | 'standard' | 'advanced' | 'olympiad';

export interface Test {
  id: string;
  section: string;
  title: string;
  difficulty: TestDifficulty;
  questions: TestQuestion[];
  time_limit: number;
}
