import { useEffect, useMemo, useRef, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  useWindowDimensions,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter, useLocalSearchParams } from 'expo-router'
import api from '../src/services/api'
import { MathText } from '../src/components/MathText'
import { WorksheetRenderer } from '../src/components/WorksheetRenderer'
import { UniformAccelerationSimulation } from '../src/components/simulations/UniformAccelerationSimulation'
import { OhmsLawSimulation } from '../src/components/simulations/OhmsLawSimulation'
import { EnergyInclineSimulation } from '../src/components/simulations/EnergyInclineSimulation'
import { useTranslation } from 'react-i18next'

type DemoMode = 'idle' | 'theory' | 'problems' | 'simulations' | 'formulas' | 'test' | 'ai-explain' | 'worksheet'

type DemoPayload = {
  topicTitle?: string
  topicDescription?: string
  theory?: string
  problems?: string[]
  formulas?: string[]
  questions?: { question: string; options: string[] }[]
  variant_index?: number
  variant_count?: number
  interactive_tasks?: Array<{
    title: string
    condition: string
    given?: { symbol: string; value: string; unit?: string; name?: string }[]
    find?: { symbol: string; unit?: string; name?: string }
    steps?: { type?: string; content: string; description?: string }[]
    answer?: string
    hint?: string
  }>
  ai_questions?: Array<{
    question: string
    answer: string
  }>
  simulation_id?: 'uniform-acceleration' | 'ohms-law' | 'energy-incline'
  simulation_params?: Record<string, number>
}

type TheorySlide = {
  title: string
  content: string
}

type DemoState = {
  mode: DemoMode
  title?: string
  subtitle?: string
  payload?: DemoPayload
}

type DemoResult = {
  score: number
  correct: number
  total: number
}

type SimulationId = 'uniform-acceleration' | 'ohms-law' | 'energy-incline'

const simulationCatalog: Array<{ id: SimulationId; title: string; description: string }> = [
  {
    id: 'uniform-acceleration',
    title: '\u0420\u0430\u0432\u043d\u043e\u0443\u0441\u043a\u043e\u0440\u0435\u043d\u043d\u043e\u0435 \u0434\u0432\u0438\u0436\u0435\u043d\u0438\u0435',
    description: '\u0422\u0440\u0430\u0435\u043a\u0442\u043e\u0440\u0438\u044f, \u0441\u043a\u043e\u0440\u043e\u0441\u0442\u044c \u0438 \u0443\u0441\u043a\u043e\u0440\u0435\u043d\u0438\u0435.',
  },
  {
    id: 'ohms-law',
    title: '\u0417\u0430\u043a\u043e\u043d \u041e\u043c\u0430',
    description: '\u0421\u0432\u044f\u0437\u044c \u043d\u0430\u043f\u0440\u044f\u0436\u0435\u043d\u0438\u044f, \u0442\u043e\u043a\u0430 \u0438 \u0441\u043e\u043f\u0440\u043e\u0442\u0438\u0432\u043b\u0435\u043d\u0438\u044f.',
  },
  {
    id: 'energy-incline',
    title: '\u042d\u043d\u0435\u0440\u0433\u0438\u044f \u043d\u0430 \u043d\u0430\u043a\u043b\u043e\u043d\u043d\u043e\u0439 \u043f\u043b\u043e\u0441\u043a\u043e\u0441\u0442\u0438',
    description: '\u041f\u043e\u0442\u0435\u043d\u0446\u0438\u0430\u043b\u044c\u043d\u0430\u044f \u0438 \u043a\u0438\u043d\u0435\u0442\u0438\u0447\u0435\u0441\u043a\u0430\u044f \u044d\u043d\u0435\u0440\u0433\u0438\u044f \u043d\u0430 \u0441\u043a\u043b\u043e\u043d\u0435.',
  },
]

const formatFormulaForKatex = (raw: string) => {
  if (!raw) return ''
  const trimmed = raw.trim()
  if (!trimmed) return ''
  if (trimmed.includes('$') || /\\[a-zA-Z]+/.test(trimmed)) {
    return trimmed
  }

  let result = trimmed

  result = result
    .replace(/\u0394([A-Za-z0-9\u0400-\u04FF])/g, '\\Delta $1')
    .replace(/\u0394/g, '\\Delta')
    .replace(/\u03BD([A-Za-z0-9\u0400-\u04FF])/g, '\\nu $1')
    .replace(/\u03BD/g, '\\nu')
    .replace(/\u03BB([A-Za-z0-9\u0400-\u04FF])/g, '\\lambda $1')
    .replace(/\u03BB/g, '\\lambda')
    .replace(/\u03C0([A-Za-z0-9\u0400-\u04FF])/g, '\\pi $1')
    .replace(/\u03C0/g, '\\pi')
    .replace(/\u03B1([A-Za-z0-9\u0400-\u04FF])/g, '\\alpha $1')
    .replace(/\u03B1/g, '\\alpha')
    .replace(/\u03B2([A-Za-z0-9\u0400-\u04FF])/g, '\\beta $1')
    .replace(/\u03B2/g, '\\beta')
    .replace(/\u03B3([A-Za-z0-9\u0400-\u04FF])/g, '\\gamma $1')
    .replace(/\u03B3/g, '\\gamma')
    .replace(/\u03B4([A-Za-z0-9\u0400-\u04FF])/g, '\\delta $1')
    .replace(/\u03B4/g, '\\delta')
    .replace(/\u03B8([A-Za-z0-9\u0400-\u04FF])/g, '\\theta $1')
    .replace(/\u03B8/g, '\\theta')
    .replace(/\u03BC([A-Za-z0-9\u0400-\u04FF])/g, '\\mu $1')
    .replace(/\u03BC/g, '\\mu')
    .replace(/\u03C1([A-Za-z0-9\u0400-\u04FF])/g, '\\rho $1')
    .replace(/\u03C1/g, '\\rho')
    .replace(/\u03C9([A-Za-z0-9\u0400-\u04FF])/g, '\\omega $1')
    .replace(/\u03C9/g, '\\omega')
    .replace(/\u03A9([A-Za-z0-9\u0400-\u04FF])/g, '\\Omega $1')
    .replace(/\u03A9/g, '\\Omega')
    .replace(/\u03A3([A-Za-z0-9\u0400-\u04FF])/g, '\\Sigma $1')
    .replace(/\u03A3/g, '\\Sigma')
    .replace(/\u2211/g, '\\sum')
    .replace(/\u222B/g, '\\int')
    .replace(/\u221E/g, '\\infty')
    .replace(/\u2192/g, '\\rightarrow')

  result = result.replace(/\u221A\(([^)]+)\)/g, (match, expr) => {
    const inner = expr.replace(/\//g, ' \\div ')
    return `\\sqrt{${inner}}`
  })

  result = result.replace(/_(?!\{)([A-Za-z0-9\u0400-\u04FF]+)/g, '_{$1}')

  result = result.replace(/([A-Za-z0-9\u0400-\u04FF]+)\s*\/\s*([A-Za-z0-9\u0400-\u04FF]+)/g, (match, num, den) => {
    if (match.includes('\\')) return match
    return `\\frac{${num}}{${den}}`
  })

  result = result
    .replace(/\u00B2/g, '^2')
    .replace(/\u00B3/g, '^3')
    .replace(/\u2074/g, '^4')
    .replace(/\u2080/g, '_0')
    .replace(/\u2081/g, '_1')
    .replace(/\u2082/g, '_2')
    .replace(/\u2083/g, '_3')
    .replace(/\u00B7/g, ' \\cdot ')
    .replace(/\u00D7/g, ' \\times ')
    .replace(/\u00F7/g, ' \\div ')

  return result
}

const modeIcons: Record<DemoMode, keyof typeof Ionicons.glyphMap> = {
  idle: 'easel-outline',
  theory: 'book-outline',
  problems: 'calculator-outline',
  simulations: 'pulse-outline',
  formulas: 'flask-outline',
  test: 'checkmark-circle-outline',
  'ai-explain': 'sparkles-outline',
  worksheet: 'document-text-outline',
}

const KNOWN_HEADINGS = [
  'Введение',
  'Основные понятия',
  'Законы и формулы',
  'Примеры и задачи',
  'Роль и применение в жизни',
  'Заключение',
  // Старые форматы для совместимости
  'Введение в прямолинейное движение',
  'Понятие перемещения',
  'Скорость в прямолинейном движении',
  'Роль времени в анализе движения',
]

const normalizeHeading = (line: string) => {
  let trimmed = line.trim()
  if (!trimmed) return ''
  trimmed = trimmed.replace(/[:\s]+$/, '').trim()
  if (trimmed.startsWith('## ')) {
    return trimmed.replace(/^##\s*/, '').trim()
  }
  if (/^\*\*.+\*\*$/.test(trimmed)) {
    return trimmed.replace(/\*\*/g, '').trim()
  }
  return trimmed
}

const isIgnoredHeading = (title: string) => {
  const normalized = title.toLowerCase()
  return (
    normalized === 'условие' ||
    normalized === 'решение' ||
    normalized === 'ответ' ||
    normalized === 'дано' ||
    normalized === 'найти'
  )
}

const extractTheorySlides = (theory: string, fallbackTitle: string, fallbackContent = 'Содержание раздела...'): TheorySlide[] => {
  const text = theory.trim()
  if (!text) return []

  const parts: TheorySlide[] = []
  const headings: Array<{ title: string; index: number }> = []

  // Ищем известные заголовки в тексте (как на сайте)
  KNOWN_HEADINGS.forEach((heading) => {
    const safe = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const patterns = [
      new RegExp(`\\*\\*${safe}\\*\\*`, 'm'),
      new RegExp(`##\\s*${safe}`, 'm'),
      new RegExp(`^${safe}`, 'm'),
      new RegExp(`\\n${safe}`, 'm'),
    ]

    for (const pattern of patterns) {
      const match = text.match(pattern)
      if (match) {
        const index = match.index !== undefined ? match.index : text.indexOf(heading)
        if (index !== -1 && !headings.find((h) => h.title === heading)) {
          headings.push({ title: heading, index })
          break
        }
      }
    }
  })

  // Если известные заголовки не найдены, ищем markdown заголовки
  if (headings.length === 0) {
    const markdownHeadings = text.match(/\*\*([^*]+)\*\*/g) || []
    markdownHeadings.forEach((match) => {
      const title = match.replace(/\*\*/g, '').trim()
      if (!title || title.length >= 120 || isIgnoredHeading(title)) return
      const index = text.indexOf(match)
      if (index !== -1 && !headings.find((h) => h.title === title)) {
        headings.push({ title, index })
      }
    })

    if (headings.length === 0) {
      const lines = text.split('\n')
      for (let i = 0; i < lines.length; i += 1) {
        const line = lines[i].trim()
        const nextLine = i < lines.length - 1 ? lines[i + 1].trim() : ''
        if (
          line &&
          /^[А-ЯЁ]/.test(line) &&
          !line.endsWith('.') &&
          line.length < 100 &&
          line.split(' ').length < 15 &&
          !isIgnoredHeading(line) &&
          (nextLine === '' || /^[А-ЯЁ]/.test(nextLine) || nextLine.length > 50)
        ) {
          const index = text.indexOf(line)
          if (index !== -1 && !headings.find((h) => h.title === line)) {
            headings.push({ title: line, index })
          }
        }
      }
    }
  }

  headings.sort((a, b) => a.index - b.index)

  const uniqueHeadings = headings.filter(
    (h, index, self) => index === self.findIndex((t) => t.title === h.title),
  )

  if (uniqueHeadings.length === 0) {
    return [{ title: fallbackTitle, content: text }]
  }

  uniqueHeadings.forEach((heading, index) => {
    const startIndex = heading.index
    const endIndex = index < uniqueHeadings.length - 1
      ? uniqueHeadings[index + 1].index
      : text.length

    let content = text.substring(startIndex, endIndex)

    if (content.startsWith(`**${heading.title}**`)) {
      content = content.substring(heading.title.length + 4).trim()
    } else if (content.startsWith(`## ${heading.title}`)) {
      content = content.substring(heading.title.length + 3).trim()
    } else if (content.startsWith(heading.title)) {
      content = content.substring(heading.title.length).trim()
    }

    content = content
      .replace(/^\*\*/g, '')
      .replace(/\*\*$/g, '')
      .replace(/^##\s*/g, '')
      .replace(/^\n+/g, '')
      .trim()

    parts.push({
      title: heading.title,
      content: content || fallbackContent,
    })
  })

  return parts.length > 0 ? parts : [{ title: fallbackTitle, content: text }]
}

export default function DemoScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const { width } = useWindowDimensions()
  const params = useLocalSearchParams<{ sessionId?: string }>()
  const sessionId = params.sessionId as string | undefined
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [demoState, setDemoState] = useState<DemoState>({
    mode: 'idle',
    title: t('demo.title'),
    subtitle: t('demo.waitTeacher'),
    payload: {},
  })
  const [result, setResult] = useState<DemoResult | null>(null)

  const [testIndex, setTestIndex] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [submitting, setSubmitting] = useState(false)
  const theoryScrollRef = useRef<ScrollView>(null)
  const [theoryIndex, setTheoryIndex] = useState(0)
  const [theorySlideWidth, setTheorySlideWidth] = useState(width - 72)
  const [interactiveExpanded, setInteractiveExpanded] = useState<Record<number, boolean>>({})
  const [selectedSimulationId, setSelectedSimulationId] = useState<SimulationId | null>(null)
  const [simulationParams, setSimulationParams] = useState<Record<string, number>>({})

  const iconName = useMemo(() => modeIcons[demoState.mode] || 'easel-outline', [demoState.mode])
  const payload = demoState.payload || {}

  const theorySlides = useMemo(() => {
    const theory = payload.theory || ''
    if (!theory) return []
    const fallbackTitle = payload.topicTitle || demoState.title || t('demo.theory')
    return extractTheorySlides(theory, fallbackTitle, t('demo.sectionContent'))
  }, [payload.theory, payload.topicTitle, demoState.title, t])

  const testQuestions = payload.questions || []

  useEffect(() => {
    setTheoryIndex(0)
  }, [theorySlides.length])

  useEffect(() => {
    if (demoState.mode !== 'test') return
    setTestIndex(0)
    setAnswers([])
    setResult(null)
  }, [demoState.mode, testQuestions.length])

  useEffect(() => {
    if (demoState.mode !== 'simulations') {
      setSelectedSimulationId(null)
    }
  }, [demoState.mode])

  useEffect(() => {
    if (!sessionId) {
      setError(t('demo.noSession'))
      setLoading(false)
      return
    }

    let isActive = true
    const loadState = async () => {
      try {
        const response = await api.get(`/student/pairing-sessions/${sessionId}`)
        if (!isActive) return
        const state = response?.data?.demo_state
        if (state?.mode) {
          setDemoState({
            mode: state.mode,
            title: state.title || demoState.title,
            subtitle: state.subtitle || demoState.subtitle,
            payload: state.payload || {},
          })
          const simId = state?.payload?.simulation_id as SimulationId | undefined
          if (simId) {
            setSelectedSimulationId(simId)
            setSimulationParams(state?.payload?.simulation_params || {})
          }
        }
        const serverResult = response?.data?.result
        if (serverResult && serverResult.score !== undefined) {
          setResult({
            score: serverResult.score,
            correct: serverResult.correct,
            total: serverResult.total,
          })
        }
        setError(null)
      } catch (err: any) {
        if (!isActive) return
        const detail = err?.response?.data?.detail
        setError(detail || t('demo.loadError'))
      } finally {
        if (isActive) setLoading(false)
      }
    }

    loadState()
    const timer = setInterval(loadState, 3000)
    return () => {
      isActive = false
      clearInterval(timer)
    }
  }, [sessionId])

  const handleSelectAnswer = (optionIndex: number) => {
    setAnswers((prev) => {
      const updated = [...prev]
      updated[testIndex] = optionIndex
      return updated
    })
  }

  const handleNext = async () => {
    if (testIndex < testQuestions.length - 1) {
      setTestIndex((prev) => prev + 1)
      return
    }
    if (!sessionId) return
    setSubmitting(true)
    const finalAnswers = answers.length === testQuestions.length
      ? answers
      : Array.from({ length: testQuestions.length }, (_, i) => answers[i] ?? -1)
    try {
      const response = await api.post(`/student/pairing-sessions/${sessionId}/submit-test`, {
        answers: finalAnswers,
      })
      if (response?.data?.score !== undefined) {
        setResult({
          score: response.data.score,
          correct: response.data.correct,
          total: response.data.total,
        })
      }
    } catch (err: any) {
      const detail = err?.response?.data?.detail
      setError(detail || t('demo.sendTestError'))
    } finally {
      setSubmitting(false)
    }
  }

  const renderTheory = () => {
    if (theorySlides.length === 0) {
      return (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>{t('demo.theoryNotReady')}</Text>
        </View>
      )
    }

    const slideWidth = theorySlideWidth || width - 72
    const canGoPrev = theoryIndex > 0
    const canGoNext = theoryIndex < theorySlides.length - 1

    const handleSlideTo = (index: number) => {
      const nextIndex = Math.max(0, Math.min(theorySlides.length - 1, index))
      theoryScrollRef.current?.scrollTo({ x: nextIndex * slideWidth, animated: true })
      setTheoryIndex(nextIndex)
    }

    return (
      <View
        style={{ gap: 14, width: '100%' }}
        onLayout={(event) => {
          const nextWidth = event.nativeEvent.layout.width
          if (nextWidth > 0 && nextWidth !== theorySlideWidth) {
            setTheorySlideWidth(nextWidth)
          }
        }}
      >
        <ScrollView
          ref={theoryScrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{}}
          onMomentumScrollEnd={(event) => {
            const nextIndex = Math.round(event.nativeEvent.contentOffset.x / slideWidth)
            setTheoryIndex(nextIndex)
          }}
        >
          {theorySlides.map((slide, index) => (
            <View key={index} style={[styles.slideCard, { width: slideWidth }]}>
              <View style={styles.slideBadge}>
                <Text style={styles.slideBadgeText}>{`${index + 1}/${theorySlides.length}`}</Text>
              </View>
              <Text style={styles.slideTitle}>{slide.title}</Text>
              <ScrollView
                style={{ maxHeight: 320 }}
                nestedScrollEnabled
                showsVerticalScrollIndicator={false}
              >
                <MathText content={slide.content} fontSize={16} textColor="#FFFFFF" />
              </ScrollView>
            </View>
          ))}
        </ScrollView>
        <View style={styles.slideControls}>
          <TouchableOpacity
            style={[styles.slideNavButton, !canGoPrev && styles.slideNavButtonDisabled]}
            onPress={() => handleSlideTo(theoryIndex - 1)}
            disabled={!canGoPrev}
          >
            <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.slideDots}>
            {theorySlides.map((_, index) => (
              <View
                key={index}
                style={[styles.slideDot, index === theoryIndex && styles.slideDotActive]}
              />
            ))}
          </View>
          <TouchableOpacity
            style={[styles.slideNavButton, !canGoNext && styles.slideNavButtonDisabled]}
            onPress={() => handleSlideTo(theoryIndex + 1)}
            disabled={!canGoNext}
          >
            <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  const renderProblems = () => {
    const problems = payload.problems || []
    const interactiveTasks = payload.interactive_tasks || []
    if (problems.length === 0) {
      if (interactiveTasks.length === 0) {
        return (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>{t('demo.noTasks')}</Text>
          </View>
        )
      }
    }

    return (
      <View style={{ gap: 16 }}>
        {problems.length > 0 && (
          <View style={{ gap: 12 }}>
            {problems.map((problem, index) => (
              <View key={index} style={styles.problemCard}>
                <View style={styles.problemIndex}>
                  <Text style={styles.problemIndexText}>{index + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <MathText content={problem} fontSize={15} textColor="#FFFFFF" />
                </View>
              </View>
            ))}
          </View>
        )}

        {interactiveTasks.length > 0 && (
          <View style={{ gap: 12 }}>
            <Text style={styles.sectionTitle}>{t('demo.interactiveTasks')}</Text>
            {interactiveTasks.map((task, index) => (
              <View key={`it-${index}`} style={styles.interactiveCard}>
                <View style={styles.interactiveHeader}>
                  <Text style={styles.interactiveTitle}>{task.title || t('demo.taskNum', { num: index + 1 })}</Text>
                  <TouchableOpacity
                    style={styles.toggleButton}
                    onPress={() =>
                      setInteractiveExpanded((prev) => ({
                        ...prev,
                        [index]: !prev[index],
                      }))
                    }
                  >
                    <Text style={styles.toggleButtonText}>
                      {interactiveExpanded[index] ? t('demo.hideSolution') : t('demo.showSolution')}
                    </Text>
                  </TouchableOpacity>
                </View>
                <MathText content={task.condition} fontSize={15} textColor="#FFFFFF" />

                {interactiveExpanded[index] && task.given && task.given.length > 0 && (
                  <View style={{ marginTop: 10, gap: 4 }}>
                    <Text style={styles.miniLabel}>{t('demo.given')}</Text>
                    {task.given.map((item, idx) => (
                      <MathText
                        key={`given-${idx}`}
                        content={`$${item.symbol} = ${item.value}${item.unit ? `\\;${item.unit}` : ''}$`}
                        fontSize={14}
                        textColor="#FFFFFF"
                      />
                    ))}
                  </View>
                )}

                {interactiveExpanded[index] && task.find && (
                  <View style={{ marginTop: 10 }}>
                    <Text style={styles.miniLabel}>{t('demo.find')}</Text>
                    <MathText
                      content={`$${task.find.symbol}${task.find.unit ? `\\;${task.find.unit}` : ''}$`}
                      fontSize={14}
                      textColor="#FFFFFF"
                    />
                  </View>
                )}

                {interactiveExpanded[index] && task.hint && (
                  <View style={{ marginTop: 10 }}>
                    <Text style={styles.miniLabel}>{t('demo.hint')}</Text>
                    <MathText content={task.hint} fontSize={14} textColor="#FFFFFF" />
                  </View>
                )}

                {interactiveExpanded[index] && task.steps && task.steps.length > 0 && (
                  <View style={{ marginTop: 10, gap: 6 }}>
                    <Text style={styles.miniLabel}>{t('demo.solution')}</Text>
                    {task.steps.map((step, stepIndex) => (
                      <View key={`step-${stepIndex}`} style={styles.stepRow}>
                        <Text style={styles.stepIndex}>{stepIndex + 1}</Text>
                        <View style={{ flex: 1 }}>
                          {step.description ? (
                            <Text style={styles.stepDescription}>{step.description}</Text>
                          ) : null}
                          <MathText content={step.content} fontSize={14} textColor="#FFFFFF" />
                        </View>
                      </View>
                    ))}
                  </View>
                )}

                {interactiveExpanded[index] && task.answer && (
                  <View style={{ marginTop: 10 }}>
                    <Text style={styles.miniLabel}>{t('demo.answer')}</Text>
                    <MathText content={task.answer} fontSize={14} textColor="#FFFFFF" />
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </View>
    )
  }

  const renderFormulas = () => {
    const formulas = payload.formulas || []
    if (formulas.length === 0) {
      return (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>{t('demo.noFormulas')}</Text>
        </View>
      )
    }

    return (
      <View style={styles.formulaGrid}>
        {formulas.map((formula, index) => {
          const latex = formatFormulaForKatex(formula)
          const content = latex.includes('$') ? latex : `$$${latex}$$`
          return (
          <View key={index} style={styles.formulaCard}>
            <Text style={styles.formulaLabel}>{`${index + 1}`}</Text>
            <MathText
              content={content}
              fontSize={18}
              textColor="#FFFFFF"
            />
          </View>
          )
        })}
      </View>
    )
  }

  const renderSimulations = () => {
    if (selectedSimulationId) {
      return (
        <View style={{ gap: 16 }}>
          <View style={styles.simHeader}>
            <TouchableOpacity
              style={styles.simBack}
              onPress={() => setSelectedSimulationId(null)}
            >
              <Ionicons name="chevron-back" size={18} color="#FFFFFF" />
              <Text style={styles.simBackText}>{t('demo.simulations')}</Text>
            </TouchableOpacity>
          </View>

          {selectedSimulationId === 'uniform-acceleration' && (
            <UniformAccelerationSimulation
              v0={simulationParams.v0}
              accel={simulationParams.accel}
              timeScale={simulationParams.timeScale}
            />
          )}
          {selectedSimulationId === 'ohms-law' && (
            <OhmsLawSimulation
              voltage={simulationParams.voltage}
              resistance={simulationParams.resistance}
            />
          )}
          {selectedSimulationId === 'energy-incline' && (
            <EnergyInclineSimulation
              mass={simulationParams.mass}
              height={simulationParams.height}
              angle={simulationParams.angle}
            />
          )}
        </View>
      )
    }

    return (
      <View style={{ gap: 12 }}>
        {simulationCatalog.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.simCard}
            onPress={() => setSelectedSimulationId(item.id)}
          >
            <View style={styles.simBadge}>
              <Ionicons name="pulse-outline" size={18} color="#C7BFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.simTitle}>{item.id === 'uniform-acceleration' ? t('demo.uniformAcceleration') : item.id === 'ohms-law' ? t('demo.ohmsLaw') : t('demo.energyIncline')}</Text>
              <Text style={styles.simSubtitle}>{item.id === 'uniform-acceleration' ? t('demo.uniformAccelerationDesc') : item.id === 'ohms-law' ? t('demo.ohmsLawDesc') : t('demo.energyInclineDesc')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        ))}
      </View>
    )
  }

  const renderTest = () => {
    if (result) {
      return (
        <View style={styles.resultCard}>
          <Ionicons name="trophy-outline" size={48} color="#FBBF24" />
          <Text style={styles.resultTitle}>{t('demo.testCompleted')}</Text>
          <Text style={styles.resultScore}>{`${result.score}%`}</Text>
          <Text style={styles.resultMeta}>{`${result.correct}/${result.total}`}</Text>
        </View>
      )
    }

    if (testQuestions.length === 0) {
      return (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>{t('demo.testNotCreated')}</Text>
        </View>
      )
    }

    const current = testQuestions[testIndex]
    const selected = answers[testIndex]
    return (
      <View style={styles.testCard}>
        <View style={styles.testHeader}>
          <Text style={styles.testProgress}>{`${testIndex + 1}/${testQuestions.length}`}</Text>
          <Text style={styles.variantText}>{t('demo.variant', { num: payload.variant_index != null ? payload.variant_index + 1 : 1 })}</Text>
        </View>
        <MathText content={current.question} fontSize={16} textColor="#FFFFFF" />
        <View style={{ marginTop: 12, gap: 10 }}>
          {current.options.map((option, idx) => {
            const isActive = selected === idx
            return (
              <TouchableOpacity
                key={idx}
                style={[styles.optionButton, isActive && styles.optionButtonActive]}
                onPress={() => handleSelectAnswer(idx)}
              >
                <Text style={[styles.optionLabel, isActive && styles.optionLabelActive]}>{String.fromCharCode(65 + idx)}</Text>
                <View style={{ flex: 1 }}>
                  <MathText content={option} fontSize={14} textColor={isActive ? '#FFFFFF' : '#E5E7EB'} />
                </View>
              </TouchableOpacity>
            )
          })}
        </View>
        <TouchableOpacity
          style={[styles.nextButton, (submitting || selected === undefined) && { opacity: 0.6 }]}
          onPress={handleNext}
          disabled={submitting || selected === undefined}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.nextButtonText}>
              {testIndex === testQuestions.length - 1 ? t('common.finish') : t('common.next')}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    )
  }

  const renderContent = () => {
    switch (demoState.mode) {
      case 'theory':
        return renderTheory()
      case 'problems':
        return renderProblems()
      case 'formulas':
        return renderFormulas()
      case 'simulations':
        return renderSimulations()
      case 'test':
        return renderTest()
      case 'worksheet':
        return <WorksheetRenderer payload={payload} sessionId={sessionId} />
      case 'ai-explain':
        const aiQuestions = Array.isArray(payload.ai_questions) ? payload.ai_questions : []
        if (aiQuestions.length === 0) {
          return (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>{t('demo.noQuestions')}</Text>
            </View>
          )
        }
        return (
          <View style={{ gap: 12 }}>
            {aiQuestions.map((item, index) => (
              <View key={`ai-${index}`} style={styles.interactiveCard}>
                <View style={styles.interactiveHeader}>
                  <Text style={styles.interactiveTitle}>{String(item?.question ?? '')}</Text>
                  <TouchableOpacity
                    style={styles.toggleButton}
                    onPress={() =>
                      setInteractiveExpanded((prev) => ({
                        ...prev,
                        [index]: !prev[index],
                      }))
                    }
                  >
                    <Text style={styles.toggleButtonText}>
                      {interactiveExpanded[index] ? t('common.hide') : t('common.show')}
                    </Text>
                  </TouchableOpacity>
                </View>
                {interactiveExpanded[index] && (
                  <View style={{ marginTop: 8 }}>
                    <MathText content={String(item?.answer ?? '')} fontSize={14} textColor="#FFFFFF" />
                  </View>
                )}
              </View>
            ))}
          </View>
        )
      default:
        return (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>{demoState.subtitle || ''}</Text>
          </View>
        )
    }
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0F0C29', '#302B63', '#24243E']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/connect')}>
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.title}>{t('demo.demoScreen')}</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <Ionicons name={iconName} size={40} color="#FFFFFF" />
          </View>
          <Text style={styles.cardTitle}>{demoState.title}</Text>
          <Text style={styles.cardSubtitle}>{demoState.subtitle}</Text>

          {loading && <ActivityIndicator color="#FFFFFF" style={{ marginTop: 12 }} />}
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>

        <View style={styles.contentCard}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 24 }}
            nestedScrollEnabled
          >
            {renderContent()}
          </ScrollView>
        </View>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0C29',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    marginTop: 8,
    marginBottom: 20,
    gap: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    padding: 20,
    alignItems: 'center',
    gap: 12,
  },
  contentCard: {
    marginTop: 16,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    padding: 12,
    flex: 1,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: 'rgba(118, 75, 162, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
  errorText: {
    marginTop: 8,
    fontSize: 13,
    color: '#FCA5A5',
    textAlign: 'center',
  },
  slideCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    padding: 16,
  },
  slideBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(139,124,246,0.2)',
    marginBottom: 10,
  },
  slideBadgeText: {
    color: '#C7BFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  slideTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
  },
  slideControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  slideNavButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slideNavButtonDisabled: {
    opacity: 0.4,
  },
  slideDots: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  slideDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  slideDotActive: {
    width: 18,
    backgroundColor: '#8B7CF6',
  },
  problemCard: {
    flexDirection: 'row',
    gap: 12,
    padding: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  problemIndex: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(249,115,22,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  problemIndexText: {
    color: '#FDBA74',
    fontWeight: '700',
  },
  sectionTitle: {
    color: '#FCD34D',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  interactiveCard: {
    padding: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    gap: 8,
  },
  interactiveTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  interactiveHeader: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    gap: 8,
  },
  toggleButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(99,102,241,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.5)',
    alignSelf: 'flex-start',
  },
  toggleButtonText: {
    color: '#C7BFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  miniLabel: {
    color: '#C7BFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  stepRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  stepIndex: {
    color: '#FCD34D',
    fontSize: 12,
    fontWeight: '700',
    width: 18,
  },
  stepDescription: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginBottom: 2,
  },
  formulaGrid: {
    gap: 12,
    flexDirection: 'column',
  },
  formulaCard: {
    width: '100%',
    padding: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    gap: 8,
  },
  formulaLabel: {
    color: '#C7BFFF',
    fontWeight: '700',
  },
  testCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    padding: 16,
    gap: 12,
  },
  testHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  testProgress: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  variantText: {
    color: '#C7BFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  optionButton: {
    flexDirection: 'row',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
  },
  optionButtonActive: {
    backgroundColor: 'rgba(108,99,255,0.3)',
    borderColor: 'rgba(108,99,255,0.7)',
  },
  optionLabel: {
    width: 24,
    height: 24,
    borderRadius: 8,
    textAlign: 'center',
    textAlignVertical: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    color: '#E5E7EB',
    fontWeight: '700',
  },
  optionLabelActive: {
    color: '#FFFFFF',
    backgroundColor: 'rgba(108,99,255,0.8)',
  },
  nextButton: {
    marginTop: 10,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#6C63FF',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  resultCard: {
    alignItems: 'center',
    gap: 10,
    padding: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(16,185,129,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.4)',
  },
  resultTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  resultScore: {
    color: '#FBBF24',
    fontSize: 36,
    fontWeight: '800',
  },
  resultMeta: {
    color: '#D1FAE5',
    fontSize: 14,
  },
  emptyCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  emptyText: {
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
  simCard: {
    flexDirection: 'row',
    gap: 12,
    padding: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
  },
  simBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(124,115,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  simTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  simSubtitle: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 12,
    marginTop: 2,
  },
  simHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  simBack: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  simBackText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
})
