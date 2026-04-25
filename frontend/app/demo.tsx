import { useEffect, useMemo, useRef, useState } from 'react'
import { View, Text, ActivityIndicator, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { useTranslation } from 'react-i18next'
import api from '../src/services/api'
import {
  AiExplainSection,
  EmptyCard,
  FormulasSection,
  ProblemsSection,
  SimulationsSection,
  TestSection,
  TheorySection,
  WorksheetSection,
} from '../src/features/demo/sections'
import { demoStyles as styles } from '../src/features/demo/styles'
import { extractTheorySlides, modeIcons } from '../src/features/demo/utils'
import type { DemoResult, DemoState, SimulationId } from '../src/features/demo/types'

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

  const iconName = useMemo<keyof typeof Ionicons.glyphMap>(
    () => (modeIcons[demoState.mode] || 'easel-outline') as keyof typeof Ionicons.glyphMap,
    [demoState.mode],
  )
  const payload = demoState.payload || {}
  const testQuestions = payload.questions || []
  const aiQuestions = Array.isArray(payload.ai_questions) ? payload.ai_questions : []
  const theorySlides = useMemo(() => {
    const theory = payload.theory || ''
    if (!theory) return []

    const fallbackTitle = payload.topicTitle || demoState.title || t('demo.theory')
    return extractTheorySlides(theory, fallbackTitle, t('demo.sectionContent'))
  }, [payload.theory, payload.topicTitle, demoState.title, t])

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
          setDemoState((prev) => ({
            mode: state.mode,
            title: state.title || prev.title,
            subtitle: state.subtitle || prev.subtitle,
            payload: state.payload || {},
          }))

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
  }, [sessionId, t])

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
    const finalAnswers =
      answers.length === testQuestions.length
        ? answers
        : Array.from({ length: testQuestions.length }, (_, index) => answers[index] ?? -1)

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

  const renderContent = () => {
    switch (demoState.mode) {
      case 'theory':
        return (
          <TheorySection
            theorySlides={theorySlides}
            theoryIndex={theoryIndex}
            theorySlideWidth={theorySlideWidth}
            width={width}
            theoryScrollRef={theoryScrollRef}
            setTheoryIndex={setTheoryIndex}
            setTheorySlideWidth={setTheorySlideWidth}
            emptyText={t('demo.theoryNotReady')}
          />
        )
      case 'problems':
        return (
          <ProblemsSection
            payload={payload}
            interactiveExpanded={interactiveExpanded}
            setInteractiveExpanded={setInteractiveExpanded}
            t={t}
          />
        )
      case 'formulas':
        return <FormulasSection formulas={payload.formulas || []} emptyText={t('demo.noFormulas')} />
      case 'simulations':
        return (
          <SimulationsSection
            selectedSimulationId={selectedSimulationId}
            setSelectedSimulationId={setSelectedSimulationId}
            simulationParams={simulationParams}
            t={t}
          />
        )
      case 'test':
        return (
          <TestSection
            result={result}
            questions={testQuestions}
            testIndex={testIndex}
            answers={answers}
            submitting={submitting}
            variantIndex={payload.variant_index}
            onSelectAnswer={handleSelectAnswer}
            onNext={handleNext}
            t={t}
          />
        )
      case 'worksheet':
        return <WorksheetSection payload={payload} sessionId={sessionId} />
      case 'ai-explain':
        return (
          <AiExplainSection
            questions={aiQuestions}
            interactiveExpanded={interactiveExpanded}
            setInteractiveExpanded={setInteractiveExpanded}
            t={t}
          />
        )
      default:
        return <EmptyCard text={demoState.subtitle || ''} />
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
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }} nestedScrollEnabled>
            {renderContent()}
          </ScrollView>
        </View>
      </SafeAreaView>
    </View>
  )
}
