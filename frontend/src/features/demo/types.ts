export type DemoMode =
  | 'idle'
  | 'theory'
  | 'problems'
  | 'simulations'
  | 'formulas'
  | 'test'
  | 'ai-explain'
  | 'worksheet'

export type DemoPayload = {
  topicTitle?: string
  topicDescription?: string
  theory?: string
  problems?: string[]
  formulas?: string[]
  questions?: { question: string; options: string[] }[]
  variant_index?: number
  variant_count?: number
  interactive_tasks?: {
    title: string
    condition: string
    given?: { symbol: string; value: string; unit?: string; name?: string }[]
    find?: { symbol: string; unit?: string; name?: string }
    steps?: { type?: string; content: string; description?: string }[]
    answer?: string
    hint?: string
  }[]
  ai_questions?: {
    question: string
    answer: string
  }[]
  simulation_id?: 'uniform-acceleration' | 'ohms-law' | 'energy-incline'
  simulation_params?: Record<string, number>
}

export type TheorySlide = {
  title: string
  content: string
}

export type DemoState = {
  mode: DemoMode
  title?: string
  subtitle?: string
  payload?: DemoPayload
}

export type DemoResult = {
  score: number
  correct: number
  total: number
}

export type SimulationId = 'uniform-acceleration' | 'ohms-law' | 'energy-incline'
