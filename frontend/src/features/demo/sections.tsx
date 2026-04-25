import type { Dispatch, RefObject, SetStateAction } from 'react'
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { MathText } from '../../components/MathText'
import { WorksheetRenderer } from '../../components/WorksheetRenderer'
import { UniformAccelerationSimulation } from '../../components/simulations/UniformAccelerationSimulation'
import { OhmsLawSimulation } from '../../components/simulations/OhmsLawSimulation'
import { EnergyInclineSimulation } from '../../components/simulations/EnergyInclineSimulation'
import { demoStyles as styles } from './styles'
import { formatFormulaForKatex, simulationCatalog } from './utils'
import type { DemoPayload, DemoResult, SimulationId, TheorySlide } from './types'

type TranslateFn = (key: string, options?: Record<string, unknown>) => string

export function EmptyCard({ text }: { text: string }) {
  return (
    <View style={styles.emptyCard}>
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  )
}

export function TheorySection({
  theorySlides,
  theoryIndex,
  theorySlideWidth,
  width,
  theoryScrollRef,
  setTheoryIndex,
  setTheorySlideWidth,
  emptyText,
}: {
  theorySlides: TheorySlide[]
  theoryIndex: number
  theorySlideWidth: number
  width: number
  theoryScrollRef: RefObject<ScrollView | null>
  setTheoryIndex: (index: number) => void
  setTheorySlideWidth: (width: number) => void
  emptyText: string
}) {
  if (theorySlides.length === 0) {
    return <EmptyCard text={emptyText} />
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
        onMomentumScrollEnd={(event) => {
          const nextIndex = Math.round(event.nativeEvent.contentOffset.x / slideWidth)
          setTheoryIndex(nextIndex)
        }}
      >
        {theorySlides.map((slide, index) => (
          <View key={`${slide.title}-${index}`} style={[styles.slideCard, { width: slideWidth }]}>
            <View style={styles.slideBadge}>
              <Text style={styles.slideBadgeText}>{`${index + 1}/${theorySlides.length}`}</Text>
            </View>
            <Text style={styles.slideTitle}>{slide.title}</Text>
            <ScrollView style={{ maxHeight: 320 }} nestedScrollEnabled showsVerticalScrollIndicator={false}>
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
            <View key={index} style={[styles.slideDot, index === theoryIndex && styles.slideDotActive]} />
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

export function ProblemsSection({
  payload,
  interactiveExpanded,
  setInteractiveExpanded,
  t,
}: {
  payload: DemoPayload
  interactiveExpanded: Record<number, boolean>
  setInteractiveExpanded: Dispatch<SetStateAction<Record<number, boolean>>>
  t: TranslateFn
}) {
  const problems = payload.problems || []
  const interactiveTasks = payload.interactive_tasks || []

  if (problems.length === 0 && interactiveTasks.length === 0) {
    return <EmptyCard text={t('demo.noTasks')} />
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
                        {step.description ? <Text style={styles.stepDescription}>{step.description}</Text> : null}
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

export function FormulasSection({ formulas, emptyText }: { formulas: string[]; emptyText: string }) {
  if (formulas.length === 0) {
    return <EmptyCard text={emptyText} />
  }

  return (
    <View style={styles.formulaGrid}>
      {formulas.map((formula, index) => {
        const latex = formatFormulaForKatex(formula)
        const content = latex.includes('$') ? latex : `$$${latex}$$`

        return (
          <View key={index} style={styles.formulaCard}>
            <Text style={styles.formulaLabel}>{`${index + 1}`}</Text>
            <MathText content={content} fontSize={18} textColor="#FFFFFF" />
          </View>
        )
      })}
    </View>
  )
}

export function SimulationsSection({
  selectedSimulationId,
  setSelectedSimulationId,
  simulationParams,
  t,
}: {
  selectedSimulationId: SimulationId | null
  setSelectedSimulationId: (id: SimulationId | null) => void
  simulationParams: Record<string, number>
  t: TranslateFn
}) {
  if (selectedSimulationId) {
    return (
      <View style={{ gap: 16 }}>
        <View style={styles.simHeader}>
          <TouchableOpacity style={styles.simBack} onPress={() => setSelectedSimulationId(null)}>
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
          <OhmsLawSimulation voltage={simulationParams.voltage} resistance={simulationParams.resistance} />
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
        <TouchableOpacity key={item.id} style={styles.simCard} onPress={() => setSelectedSimulationId(item.id)}>
          <View style={styles.simBadge}>
            <Ionicons name="pulse-outline" size={18} color="#C7BFFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.simTitle}>
              {item.id === 'uniform-acceleration'
                ? t('demo.uniformAcceleration')
                : item.id === 'ohms-law'
                  ? t('demo.ohmsLaw')
                  : t('demo.energyIncline')}
            </Text>
            <Text style={styles.simSubtitle}>
              {item.id === 'uniform-acceleration'
                ? t('demo.uniformAccelerationDesc')
                : item.id === 'ohms-law'
                  ? t('demo.ohmsLawDesc')
                  : t('demo.energyInclineDesc')}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      ))}
    </View>
  )
}

export function TestSection({
  result,
  questions,
  testIndex,
  answers,
  submitting,
  variantIndex,
  onSelectAnswer,
  onNext,
  t,
}: {
  result: DemoResult | null
  questions: { question: string; options: string[] }[]
  testIndex: number
  answers: number[]
  submitting: boolean
  variantIndex?: number
  onSelectAnswer: (optionIndex: number) => void
  onNext: () => void
  t: TranslateFn
}) {
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

  if (questions.length === 0) {
    return <EmptyCard text={t('demo.testNotCreated')} />
  }

  const current = questions[testIndex]
  const selected = answers[testIndex]

  return (
    <View style={styles.testCard}>
      <View style={styles.testHeader}>
        <Text style={styles.testProgress}>{`${testIndex + 1}/${questions.length}`}</Text>
        <Text style={styles.variantText}>{t('demo.variant', { num: variantIndex != null ? variantIndex + 1 : 1 })}</Text>
      </View>
      <MathText content={current.question} fontSize={16} textColor="#FFFFFF" />
      <View style={{ marginTop: 12, gap: 10 }}>
        {current.options.map((option, index) => {
          const isActive = selected === index
          return (
            <TouchableOpacity
              key={index}
              style={[styles.optionButton, isActive && styles.optionButtonActive]}
              onPress={() => onSelectAnswer(index)}
            >
              <Text style={[styles.optionLabel, isActive && styles.optionLabelActive]}>{String.fromCharCode(65 + index)}</Text>
              <View style={{ flex: 1 }}>
                <MathText content={option} fontSize={14} textColor={isActive ? '#FFFFFF' : '#E5E7EB'} />
              </View>
            </TouchableOpacity>
          )
        })}
      </View>
      <TouchableOpacity
        style={[styles.nextButton, (submitting || selected === undefined) && { opacity: 0.6 }]}
        onPress={onNext}
        disabled={submitting || selected === undefined}
      >
        {submitting ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.nextButtonText}>
            {testIndex === questions.length - 1 ? t('common.finish') : t('common.next')}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  )
}

export function AiExplainSection({
  questions,
  interactiveExpanded,
  setInteractiveExpanded,
  t,
}: {
  questions: { question: string; answer: string }[]
  interactiveExpanded: Record<number, boolean>
  setInteractiveExpanded: Dispatch<SetStateAction<Record<number, boolean>>>
  t: TranslateFn
}) {
  if (questions.length === 0) {
    return <EmptyCard text={t('demo.noQuestions')} />
  }

  return (
    <View style={{ gap: 12 }}>
      {questions.map((item, index) => (
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
}

export function WorksheetSection({ payload, sessionId }: { payload: DemoPayload; sessionId?: string }) {
  return <WorksheetRenderer payload={payload as any} sessionId={sessionId} />
}
