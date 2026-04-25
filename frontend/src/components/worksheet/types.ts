export interface WorksheetTask {
  id: string
  type: string
  title: string
  instruction: string
  questionText?: string
  options?: string[]
  correctIndex?: number
  leftColumn?: string[]
  rightColumn?: string[]
  pairs?: Record<string, string>
  blankText?: string
  blankAnswers?: string[]
  answerText?: string
  items?: string[]
  correctItem?: string
  isTrue?: boolean
  crosswordGrid?: string[][]
  crosswordClues?: { direction: 'across' | 'down'; number: number; clue: string; answer: string }[]
  errorText?: string
  correctedText?: string
  errorExplanation?: string
  sequenceItems?: string[]
  correctSequence?: string[]
  wordWithBlanks?: string
  correctWord?: string
  comparePairs?: { left: string; right: string; operator: '>' | '<' | '=' }[]
  problemCondition?: string
  solutionSteps?: string[]
  problemAnswer?: string
  tableHeaders?: string[]
  tableRows?: (string | null)[][]
  tableAnswers?: { row: number; col: number; value: string }[]
  categories?: { name: string; items: string[] }[]
  allCategoryItems?: string[]
  sequenceStart?: string[]
  sequenceAnswer?: string[]
  scrambledWord?: string
  anagramAnswer?: string
  anagramHint?: string
  passageText?: string
  passageQuestions?: { question: string; answer: string }[]
  filwordGrid?: string[][]
  filwordWords?: string[]
  handwritingText?: string
  targetNumber?: number
  numberParts?: { a: number; b: number }[]
  storyBeginning?: string
  mazeGrid?: number[][]
  drawPrompt?: string
  readingText?: string
  unknownWordsList?: string[]
}

export interface WorksheetPayload {
  title?: string
  description?: string
  subject?: string
  grade?: string
  topic?: string
  tasks: WorksheetTask[]
}

export type AnswerMap = Record<string, any>
