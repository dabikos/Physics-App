import { useState, useRef, useCallback, useMemo } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { MathText } from './MathText'
import api from '../services/api'

/* ─── Types ─── */
interface WorksheetTask {
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

interface WorksheetPayload {
  title?: string
  description?: string
  subject?: string
  grade?: string
  topic?: string
  tasks: WorksheetTask[]
}

/* ─── Answer state per task ─── */
type AnswerMap = Record<string, any>

/* ─── Main renderer ─── */
export function WorksheetRenderer({ payload, sessionId }: { payload: WorksheetPayload; sessionId?: string }) {
  const [answers, setAnswers] = useState<AnswerMap>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitResult, setSubmitResult] = useState<{
    auto_score: number
    auto_total: number
    score_percent: number | null
    answered_count: number
    task_count: number
  } | null>(null)

  const setAnswer = useCallback((taskId: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [taskId]: value }))
  }, [])

  const tasks = payload.tasks || []
  const answeredCount = Object.keys(answers).filter((k) => {
    const v = answers[k]
    if (v === undefined || v === null || v === '') return false
    if (typeof v === 'string' && v.trim() === '') return false
    if (Array.isArray(v) && v.length === 0) return false
    return true
  }).length

  const handleSubmit = () => {
    if (!sessionId) {
      Alert.alert('Ошибка', 'Нет активной сессии')
      return
    }
    if (answeredCount === 0) {
      Alert.alert('Внимание', 'Вы не ответили ни на один вопрос')
      return
    }
    Alert.alert(
      'Отправить ответы?',
      `Вы ответили на ${answeredCount} из ${tasks.length} заданий. Отправить?`,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Отправить',
          onPress: async () => {
            setSubmitting(true)
            try {
              const response = await api.post(
                `/student/pairing-sessions/${sessionId}/submit-worksheet`,
                { answers },
              )
              setSubmitted(true)
              setSubmitResult(response?.data || null)
            } catch (err: any) {
              const detail = err?.response?.data?.detail || 'Не удалось отправить'
              Alert.alert('Ошибка', detail)
            } finally {
              setSubmitting(false)
            }
          },
        },
      ],
    )
  }

  return (
    <View style={{ gap: 16 }}>
      {/* Header */}
      <View style={styles.wsHeader}>
        <Text style={styles.wsTitle}>{payload.title || 'Рабочий лист'}</Text>
        {payload.description ? (
          <Text style={styles.wsSubtitle}>{payload.description}</Text>
        ) : null}
        <Text style={styles.wsMeta}>
          {payload.subject || 'Физика'}, {payload.grade || '-'} класс
          {payload.topic ? ` • ${payload.topic}` : ''}
        </Text>
      </View>

      {/* Submitted result */}
      {submitted && submitResult && (
        <View style={styles.submitResultCard}>
          <Ionicons name="checkmark-circle" size={48} color="#10B981" />
          <Text style={styles.submitResultTitle}>Ответы отправлены!</Text>
          <Text style={styles.submitResultMeta}>
            Отвечено: {submitResult.answered_count} из {submitResult.task_count}
          </Text>
          {submitResult.score_percent !== null && (
            <View style={styles.scoreRow}>
              <Text style={styles.scoreText}>{submitResult.score_percent}%</Text>
              <Text style={styles.scoreMeta}>
                ({submitResult.auto_score}/{submitResult.auto_total} автопроверка)
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Tasks */}
      {!submitted && tasks.map((task, idx) => (
        <View key={task.id || `t-${idx}`} style={styles.taskCard}>
          <View style={styles.taskHeader}>
            <View style={[
              styles.taskBadge,
              answers[task.id] !== undefined && answers[task.id] !== null && answers[task.id] !== ''
                ? styles.taskBadgeAnswered : null,
            ]}>
              <Text style={styles.taskBadgeText}>{idx + 1}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.taskTitle}>{task.title}</Text>
              <Text style={styles.taskInstruction}>{task.instruction}</Text>
            </View>
          </View>
          <TaskRenderer
            task={task}
            answer={answers[task.id]}
            onChange={(val: any) => setAnswer(task.id, val)}
          />
        </View>
      ))}

      {/* Submit button */}
      {!submitted && sessionId && tasks.length > 0 && (
        <View style={styles.submitSection}>
          <View style={styles.progressRow}>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${Math.round((answeredCount / tasks.length) * 100)}%` as any }]} />
            </View>
            <Text style={styles.progressText}>{answeredCount}/{tasks.length}</Text>
          </View>
          <TouchableOpacity
            style={[styles.submitButton, submitting && { opacity: 0.6 }]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Ionicons name="send" size={18} color="#FFFFFF" />
                <Text style={styles.submitButtonText}>Отправить ответы</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

/* ─── Task Router ─── */
function TaskRenderer({ task, answer, onChange }: { task: WorksheetTask; answer: any; onChange: (v: any) => void }) {
  switch (task.type) {
    case 'multiple-choice': return <MultipleChoice task={task} answer={answer} onChange={onChange} />
    case 'true-false': return <TrueFalse task={task} answer={answer} onChange={onChange} />
    case 'fill-blanks': return <FillBlanks task={task} answer={answer} onChange={onChange} />
    case 'short-answer': return <ShortAnswer task={task} answer={answer} onChange={onChange} />
    case 'essay': return <Essay task={task} answer={answer} onChange={onChange} />
    case 'crossword': return <Crossword task={task} answer={answer} onChange={onChange} />
    case 'find-extra': return <FindExtra task={task} answer={answer} onChange={onChange} />
    case 'match-columns': return <MatchColumns task={task} answer={answer} onChange={onChange} />
    case 'sequence': return <Sequence task={task} answer={answer} onChange={onChange} />
    case 'insert-letter': return <InsertLetter task={task} answer={answer} onChange={onChange} />
    case 'compare-numbers': return <CompareNumbers task={task} answer={answer} onChange={onChange} />
    case 'find-error': return <FindError task={task} answer={answer} onChange={onChange} />
    case 'fill-table': return <FillTable task={task} answer={answer} onChange={onChange} />
    case 'continue-sequence': return <ContinueSeq task={task} answer={answer} onChange={onChange} />
    case 'anagram': return <Anagram task={task} answer={answer} onChange={onChange} />
    case 'step-by-step': return <StepByStep task={task} />
    case 'categorize': return <Categorize task={task} answer={answer} onChange={onChange} />
    case 'scenario':
    case 'text-analysis':
    case 'info-work': return <PassageTask task={task} answer={answer} onChange={onChange} />
    case 'filword': return <Filword task={task} answer={answer} onChange={onChange} />
    case 'continue-story': return <ContinueStory task={task} answer={answer} onChange={onChange} />
    case 'unknown-words': return <UnknownWords task={task} answer={answer} onChange={onChange} />
    case 'handwriting': return <Handwriting task={task} />
    case 'number-composition': return <NumberComposition task={task} answer={answer} onChange={onChange} />
    case 'maze': return <MazeView task={task} />
    case 'draw-illustration': return <DrawIllustration task={task} />
    default: return <GenericTask task={task} answer={answer} onChange={onChange} />
  }
}

/* ═══════════════════════════════════════════
   Individual task type renderers
   ═══════════════════════════════════════════ */

/* 1. Multiple choice */
function MultipleChoice({ task, answer, onChange }: { task: WorksheetTask; answer: any; onChange: (v: any) => void }) {
  const selected = typeof answer === 'number' ? answer : -1
  return (
    <View style={{ gap: 6 }}>
      {task.questionText ? <MathText content={task.questionText} fontSize={15} textColor="#FFFFFF" /> : null}
      <View style={{ gap: 8, marginTop: 8 }}>
        {(task.options || []).map((opt, i) => {
          const active = selected === i
          return (
            <TouchableOpacity
              key={i}
              style={[styles.optionBtn, active && styles.optionBtnActive]}
              onPress={() => onChange(i)}
            >
              <View style={[styles.optionBadge, active && styles.optionBadgeActive]}>
                <Text style={[styles.optionBadgeText, active && { color: '#FFF' }]}>
                  {String.fromCharCode(65 + i)}
                </Text>
              </View>
              <Text style={[styles.optionText, active && { color: '#FFFFFF' }]}>{opt}</Text>
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
}

/* 2. True / False */
function TrueFalse({ task, answer, onChange }: { task: WorksheetTask; answer: any; onChange: (v: any) => void }) {
  return (
    <View style={{ gap: 10 }}>
      {task.questionText ? <MathText content={task.questionText} fontSize={15} textColor="#FFFFFF" /> : null}
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
        {(['true', 'false'] as const).map((val) => {
          const active = answer === val
          const label = val === 'true' ? 'Верно' : 'Неверно'
          const color = val === 'true' ? '#10B981' : '#EF4444'
          return (
            <TouchableOpacity
              key={val}
              style={[styles.tfBtn, active && { backgroundColor: color + '30', borderColor: color + '80' }]}
              onPress={() => onChange(val)}
            >
              <Text style={[styles.tfText, active && { color }]}>{label}</Text>
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
}

/* 3. Fill blanks */
function FillBlanks({ task, answer, onChange }: { task: WorksheetTask; answer: any; onChange: (v: any) => void }) {
  const text = task.blankText || ''
  const parts = text.split('___')
  const values: string[] = Array.isArray(answer) ? answer : Array(parts.length - 1).fill('')

  const updateValue = (idx: number, val: string) => {
    const next = [...values]
    next[idx] = val
    onChange(next)
  }

  return (
    <View style={{ gap: 4 }}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 4 }}>
        {parts.map((part, i) => (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'center' }}>
            {part ? <Text style={styles.blankPartText}>{part}</Text> : null}
            {i < parts.length - 1 && (
              <TextInput
                style={styles.blankInput}
                value={values[i] || ''}
                onChangeText={(v) => updateValue(i, v)}
                placeholder="..."
                placeholderTextColor="rgba(255,255,255,0.3)"
              />
            )}
          </View>
        ))}
      </View>
    </View>
  )
}

/* 4. Short answer */
function ShortAnswer({ task, answer, onChange }: { task: WorksheetTask; answer: any; onChange: (v: any) => void }) {
  return (
    <View style={{ gap: 10 }}>
      {task.questionText ? <MathText content={task.questionText} fontSize={15} textColor="#FFFFFF" /> : null}
      <TextInput
        style={styles.textInput}
        value={typeof answer === 'string' ? answer : ''}
        onChangeText={onChange}
        placeholder="Ваш ответ..."
        placeholderTextColor="rgba(255,255,255,0.3)"
        multiline={false}
      />
    </View>
  )
}

/* 5. Essay */
function Essay({ task, answer, onChange }: { task: WorksheetTask; answer: any; onChange: (v: any) => void }) {
  return (
    <View style={{ gap: 10 }}>
      {task.questionText ? <MathText content={task.questionText} fontSize={15} textColor="#FFFFFF" /> : null}
      <TextInput
        style={[styles.textInput, { minHeight: 120, textAlignVertical: 'top' }]}
        value={typeof answer === 'string' ? answer : ''}
        onChangeText={onChange}
        placeholder="Напишите развёрнутый ответ..."
        placeholderTextColor="rgba(255,255,255,0.3)"
        multiline
      />
    </View>
  )
}

/* 6. Crossword — per-clue text input, auto-fills grid */
function Crossword({ task, answer, onChange }: { task: WorksheetTask; answer: any; onChange: (v: any) => void }) {
  const clues = task.crosswordClues || []
  const grid = task.crosswordGrid || []
  const across = clues.filter((c) => c.direction === 'across')
  const down = clues.filter((c) => c.direction === 'down')

  const rows = grid.length
  const cols = rows > 0 ? grid[0].length : 0

  // answer = Record<string, string>  e.g. { "across-1": "СИЛА", "down-2": "МАССА" }
  const wordAnswers: Record<string, string> = typeof answer === 'object' && answer && !Array.isArray(answer)
    ? answer
    : {}

  const screenWidth = Dimensions.get('window').width
  const maxGridWidth = screenWidth - 80
  const cellSize = Math.min(36, Math.floor(maxGridWidth / Math.max(cols, 1)))

  // Find each clue's start position & cells in the grid
  const cluePositions = useMemo(() => {
    const positions: Record<string, { row: number; col: number; cells: [number, number][] }> = {}
    clues.forEach((c) => {
      const word = c.answer.toUpperCase()
      for (let r = 0; r < rows; r++) {
        for (let col = 0; col < cols; col++) {
          if (grid[r][col] === '#') continue
          let match = true
          const cells: [number, number][] = []
          if (c.direction === 'across') {
            if (col + word.length > cols) continue
            if (col > 0 && grid[r][col - 1] !== '#') continue
            for (let i = 0; i < word.length; i++) {
              if (grid[r][col + i].toUpperCase() !== word[i]) { match = false; break }
              cells.push([r, col + i])
            }
          } else {
            if (r + word.length > rows) continue
            if (r > 0 && grid[r - 1][col] !== '#') continue
            for (let i = 0; i < word.length; i++) {
              if (grid[r + i][col].toUpperCase() !== word[i]) { match = false; break }
              cells.push([r + i, col])
            }
          }
          if (match) {
            const key = `${c.direction}-${c.number}`
            positions[key] = { row: r, col, cells }
            break
          }
        }
        if (positions[`${c.direction}-${c.number}`]) break
      }
    })
    return positions
  }, [clues, grid, rows, cols])

  // Build number map for grid display
  const numberMap = useMemo(() => {
    const map: Record<string, number> = {}
    Object.entries(cluePositions).forEach(([key, pos]) => {
      const cellKey = `${pos.row},${pos.col}`
      const num = parseInt(key.split('-')[1])
      if (!map[cellKey] || num < map[cellKey]) map[cellKey] = num
    })
    return map
  }, [cluePositions])

  // Build displayed grid from user word answers
  const displayGrid = useMemo(() => {
    const dg: string[][] = Array.from({ length: rows }, () => Array(cols).fill(''))
    Object.entries(wordAnswers).forEach(([key, word]) => {
      const pos = cluePositions[key]
      if (!pos) return
      const upper = word.toUpperCase()
      pos.cells.forEach(([r, c], i) => {
        if (i < upper.length) {
          dg[r][c] = upper[i]
        }
      })
    })
    return dg
  }, [wordAnswers, cluePositions, rows, cols])

  const handleWordChange = (clue: typeof clues[0], text: string) => {
    const key = `${clue.direction}-${clue.number}`
    const next = { ...wordAnswers, [key]: text.toUpperCase() }
    onChange(next)
  }

  // Render just clues with text inputs (no grid) — fallback
  if (rows === 0) {
    return (
      <View style={{ gap: 14 }}>
        {across.length > 0 && (
          <View style={{ gap: 8 }}>
            <Text style={styles.cwLabel}>По горизонтали:</Text>
            {across.map((c) => {
              const key = `across-${c.number}`
              return (
                <View key={key} style={styles.cwClueRow}>
                  <Text style={styles.cwClueNum}>{c.number}.</Text>
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text style={styles.cwClue}>{c.clue}</Text>
                    <TextInput
                      style={styles.cwWordInput}
                      value={wordAnswers[key] || ''}
                      onChangeText={(v) => handleWordChange(c, v)}
                      placeholder={`${c.answer.length} букв`}
                      placeholderTextColor="rgba(255,255,255,0.25)"
                      autoCapitalize="characters"
                      maxLength={c.answer.length + 2}
                    />
                  </View>
                </View>
              )
            })}
          </View>
        )}
        {down.length > 0 && (
          <View style={{ gap: 8 }}>
            <Text style={styles.cwLabel}>По вертикали:</Text>
            {down.map((c) => {
              const key = `down-${c.number}`
              return (
                <View key={key} style={styles.cwClueRow}>
                  <Text style={styles.cwClueNum}>{c.number}.</Text>
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text style={styles.cwClue}>{c.clue}</Text>
                    <TextInput
                      style={styles.cwWordInput}
                      value={wordAnswers[key] || ''}
                      onChangeText={(v) => handleWordChange(c, v)}
                      placeholder={`${c.answer.length} букв`}
                      placeholderTextColor="rgba(255,255,255,0.25)"
                      autoCapitalize="characters"
                      maxLength={c.answer.length + 2}
                    />
                  </View>
                </View>
              )
            })}
          </View>
        )}
      </View>
    )
  }

  return (
    <View style={{ gap: 14 }}>
      {/* Grid — read-only, filled automatically from word answers */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          {grid.map((row, ri) => (
            <View key={ri} style={{ flexDirection: 'row' }}>
              {row.map((cell, ci) => {
                if (cell === '#') {
                  return <View key={ci} style={[styles.cwBlack, { width: cellSize, height: cellSize }]} />
                }
                const num = numberMap[`${ri},${ci}`]
                const letter = displayGrid[ri]?.[ci] || ''
                return (
                  <View key={ci} style={[styles.cwCell, { width: cellSize, height: cellSize }, letter ? styles.cwCellFilled : null]}>
                    {num !== undefined && (
                      <Text style={[styles.cwNum, { fontSize: cellSize < 28 ? 7 : 9 }]}>{num}</Text>
                    )}
                    <Text style={[styles.cwLetter, { fontSize: cellSize < 28 ? 14 : 18 }]}>{letter}</Text>
                  </View>
                )
              })}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Clues with text inputs */}
      <View style={{ gap: 14 }}>
        {across.length > 0 && (
          <View style={{ gap: 8 }}>
            <Text style={styles.cwLabel}>По горизонтали:</Text>
            {across.map((c) => {
              const key = `across-${c.number}`
              const val = wordAnswers[key] || ''
              const isFilled = val.length >= c.answer.length
              return (
                <View key={key} style={styles.cwClueRow}>
                  <View style={[styles.cwClueNumBadge, isFilled && styles.cwClueNumBadgeFilled]}>
                    <Text style={styles.cwClueNumText}>{c.number}</Text>
                  </View>
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text style={styles.cwClue}>{c.clue}</Text>
                    <TextInput
                      style={[styles.cwWordInput, isFilled && styles.cwWordInputFilled]}
                      value={val}
                      onChangeText={(v) => handleWordChange(c, v)}
                      placeholder={`Введите слово (${c.answer.length} букв)`}
                      placeholderTextColor="rgba(255,255,255,0.25)"
                      autoCapitalize="characters"
                      maxLength={c.answer.length + 2}
                    />
                  </View>
                </View>
              )
            })}
          </View>
        )}
        {down.length > 0 && (
          <View style={{ gap: 8 }}>
            <Text style={styles.cwLabel}>По вертикали:</Text>
            {down.map((c) => {
              const key = `down-${c.number}`
              const val = wordAnswers[key] || ''
              const isFilled = val.length >= c.answer.length
              return (
                <View key={key} style={styles.cwClueRow}>
                  <View style={[styles.cwClueNumBadge, isFilled && styles.cwClueNumBadgeFilled]}>
                    <Text style={styles.cwClueNumText}>{c.number}</Text>
                  </View>
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text style={styles.cwClue}>{c.clue}</Text>
                    <TextInput
                      style={[styles.cwWordInput, isFilled && styles.cwWordInputFilled]}
                      value={val}
                      onChangeText={(v) => handleWordChange(c, v)}
                      placeholder={`Введите слово (${c.answer.length} букв)`}
                      placeholderTextColor="rgba(255,255,255,0.25)"
                      autoCapitalize="characters"
                      maxLength={c.answer.length + 2}
                    />
                  </View>
                </View>
              )
            })}
          </View>
        )}
      </View>
    </View>
  )
}

/* 7. Find extra */
function FindExtra({ task, answer, onChange }: { task: WorksheetTask; answer: any; onChange: (v: any) => void }) {
  const items = task.items || []
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {items.map((item, i) => {
        const active = answer === item
        return (
          <TouchableOpacity
            key={i}
            style={[styles.chipBtn, active && styles.chipBtnActive]}
            onPress={() => onChange(item)}
          >
            <Text style={[styles.chipText, active && { color: '#FFF' }]}>{item}</Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

/* 8. Match columns */
function MatchColumns({ task, answer, onChange }: { task: WorksheetTask; answer: any; onChange: (v: any) => void }) {
  const left = task.leftColumn || []
  const right = task.rightColumn || []
  // answer = Record<index, selectedRightIndex>
  const selected: Record<number, number> = typeof answer === 'object' && answer ? answer : {}
  const [activeLeft, setActiveLeft] = useState<number | null>(null)

  const handleLeftTap = (i: number) => setActiveLeft(i)
  const handleRightTap = (j: number) => {
    if (activeLeft === null) return
    const next = { ...selected, [activeLeft]: j }
    onChange(next)
    setActiveLeft(null)
  }

  return (
    <View style={{ gap: 12 }}>
      <Text style={styles.hintText}>Нажмите на элемент слева, затем на подходящий справа</Text>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={{ flex: 1, gap: 8 }}>
          {left.map((item, i) => {
            const isActive = activeLeft === i
            const isMatched = selected[i] !== undefined
            return (
              <TouchableOpacity
                key={i}
                style={[styles.matchItem, isActive && styles.matchItemActive, isMatched && styles.matchItemDone]}
                onPress={() => handleLeftTap(i)}
              >
                <Text style={styles.matchText}>{item}</Text>
              </TouchableOpacity>
            )
          })}
        </View>
        <View style={{ flex: 1, gap: 8 }}>
          {right.map((item, j) => {
            const linked = Object.values(selected).includes(j)
            return (
              <TouchableOpacity
                key={j}
                style={[styles.matchItem, linked && styles.matchItemDone]}
                onPress={() => handleRightTap(j)}
              >
                <Text style={styles.matchText}>{item}</Text>
              </TouchableOpacity>
            )
          })}
        </View>
      </View>
    </View>
  )
}

/* 9. Sequence */
function Sequence({ task, answer, onChange }: { task: WorksheetTask; answer: any; onChange: (v: any) => void }) {
  const items = task.sequenceItems || []
  const ordered: string[] = Array.isArray(answer) ? answer : []

  const handleTap = (item: string) => {
    if (ordered.includes(item)) {
      onChange(ordered.filter((x) => x !== item))
    } else {
      onChange([...ordered, item])
    }
  }

  return (
    <View style={{ gap: 10 }}>
      <Text style={styles.hintText}>Нажимайте элементы в правильном порядке</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {items.map((item, i) => {
          const idx = ordered.indexOf(item)
          const isSelected = idx !== -1
          return (
            <TouchableOpacity
              key={i}
              style={[styles.seqItem, isSelected && styles.seqItemActive]}
              onPress={() => handleTap(item)}
            >
              {isSelected && (
                <View style={styles.seqBadge}>
                  <Text style={styles.seqBadgeText}>{idx + 1}</Text>
                </View>
              )}
              <Text style={styles.seqText}>{item}</Text>
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
}

/* 10. Insert letter */
function InsertLetter({ task, answer, onChange }: { task: WorksheetTask; answer: any; onChange: (v: any) => void }) {
  const word = task.wordWithBlanks || ''
  const parts = word.split('_')

  const values: string[] = Array.isArray(answer) ? answer : Array(parts.length - 1).fill('')
  const updateVal = (idx: number, v: string) => {
    const next = [...values]
    next[idx] = v.slice(-1)
    onChange(next)
  }

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 2 }}>
      {parts.map((part, i) => (
        <View key={i} style={{ flexDirection: 'row', alignItems: 'center' }}>
          {part.split('').map((ch, ci) => (
            <View key={`${i}-${ci}`} style={styles.letterBox}>
              <Text style={styles.letterText}>{ch}</Text>
            </View>
          ))}
          {i < parts.length - 1 && (
            <TextInput
              style={styles.letterInput}
              value={values[i] || ''}
              onChangeText={(v) => updateVal(i, v)}
              maxLength={1}
              autoCapitalize="characters"
            />
          )}
        </View>
      ))}
    </View>
  )
}

/* 11. Compare numbers */
function CompareNumbers({ task, answer, onChange }: { task: WorksheetTask; answer: any; onChange: (v: any) => void }) {
  const pairs = task.comparePairs || []
  const selected: Record<number, string> = typeof answer === 'object' && answer ? answer : {}

  const handleSelect = (idx: number, op: string) => {
    onChange({ ...selected, [idx]: op })
  }

  return (
    <View style={{ gap: 10 }}>
      {pairs.map((pair, i) => (
        <View key={i} style={styles.compareRow}>
          <View style={styles.compareNum}><Text style={styles.compareNumText}>{pair.left}</Text></View>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {(['<', '=', '>'] as const).map((op) => {
              const active = selected[i] === op
              return (
                <TouchableOpacity
                  key={op}
                  style={[styles.compareBtn, active && styles.compareBtnActive]}
                  onPress={() => handleSelect(i, op)}
                >
                  <Text style={[styles.compareBtnText, active && { color: '#FFF' }]}>{op}</Text>
                </TouchableOpacity>
              )
            })}
          </View>
          <View style={styles.compareNum}><Text style={styles.compareNumText}>{pair.right}</Text></View>
        </View>
      ))}
    </View>
  )
}

/* 12. Find error */
function FindError({ task, answer, onChange }: { task: WorksheetTask; answer: any; onChange: (v: any) => void }) {
  return (
    <View style={{ gap: 10 }}>
      <View style={styles.errorTextBox}>
        <MathText content={task.errorText || ''} fontSize={15} textColor="#FFFFFF" />
      </View>
      <Text style={styles.hintText}>Исправьте ошибку:</Text>
      <TextInput
        style={[styles.textInput, { minHeight: 80, textAlignVertical: 'top' }]}
        value={typeof answer === 'string' ? answer : ''}
        onChangeText={onChange}
        placeholder="Напишите исправленный текст..."
        placeholderTextColor="rgba(255,255,255,0.3)"
        multiline
      />
    </View>
  )
}

/* 13. Fill table */
function FillTable({ task, answer, onChange }: { task: WorksheetTask; answer: any; onChange: (v: any) => void }) {
  const headers = task.tableHeaders || []
  const rows = task.tableRows || []
  const userCells: Record<string, string> = typeof answer === 'object' && answer ? answer : {}

  const handleCell = (r: number, c: number, val: string) => {
    const key = `${r},${c}`
    onChange({ ...userCells, [key]: val })
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View>
        {/* Header row */}
        <View style={{ flexDirection: 'row' }}>
          {headers.map((h, i) => (
            <View key={i} style={styles.tableHeaderCell}>
              <Text style={styles.tableHeaderText}>{h}</Text>
            </View>
          ))}
        </View>
        {/* Data rows */}
        {rows.map((row, ri) => (
          <View key={ri} style={{ flexDirection: 'row' }}>
            {(row || []).map((cell, ci) => (
              <View key={ci} style={styles.tableCell}>
                {cell !== null ? (
                  <Text style={styles.tableCellText}>{cell}</Text>
                ) : (
                  <TextInput
                    style={styles.tableCellInput}
                    value={userCells[`${ri},${ci}`] || ''}
                    onChangeText={(v) => handleCell(ri, ci, v)}
                    placeholder="?"
                    placeholderTextColor="rgba(255,255,255,0.25)"
                  />
                )}
              </View>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  )
}

/* 14. Continue sequence */
function ContinueSeq({ task, answer, onChange }: { task: WorksheetTask; answer: any; onChange: (v: any) => void }) {
  const start = task.sequenceStart || []
  const ansCount = (task.sequenceAnswer || []).length || 2
  const values: string[] = Array.isArray(answer) ? answer : Array(ansCount).fill('')

  const updateVal = (i: number, v: string) => {
    const next = [...values]
    next[i] = v
    onChange(next)
  }

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
      {start.map((item, i) => (
        <View key={i} style={styles.seqFixed}>
          <Text style={styles.seqFixedText}>{item}</Text>
        </View>
      ))}
      {values.map((v, i) => (
        <TextInput
          key={`a-${i}`}
          style={styles.seqInput}
          value={v}
          onChangeText={(val) => updateVal(i, val)}
          placeholder="?"
          placeholderTextColor="rgba(255,255,255,0.3)"
        />
      ))}
      <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 18 }}>...</Text>
    </View>
  )
}

/* 15. Anagram */
function Anagram({ task, answer, onChange }: { task: WorksheetTask; answer: any; onChange: (v: any) => void }) {
  const scrambled = task.scrambledWord || ''
  const letters = scrambled.toUpperCase().split('')
  return (
    <View style={{ gap: 12 }}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
        {letters.map((ch, i) => (
          <View key={i} style={styles.anagramTile}>
            <Text style={styles.anagramLetter}>{ch}</Text>
          </View>
        ))}
      </View>
      {task.anagramHint ? (
        <Text style={styles.hintText}>Подсказка: {task.anagramHint}</Text>
      ) : null}
      <TextInput
        style={styles.textInput}
        value={typeof answer === 'string' ? answer : ''}
        onChangeText={onChange}
        placeholder="Ваш ответ..."
        placeholderTextColor="rgba(255,255,255,0.3)"
        autoCapitalize="characters"
      />
    </View>
  )
}

/* 16. Step by step (read-only) */
function StepByStep({ task }: { task: WorksheetTask }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <View style={{ gap: 10 }}>
      {task.problemCondition ? <MathText content={task.problemCondition} fontSize={15} textColor="#FFFFFF" /> : null}
      <TouchableOpacity style={styles.expandBtn} onPress={() => setExpanded(!expanded)}>
        <Text style={styles.expandBtnText}>{expanded ? 'Скрыть решение' : 'Показать решение'}</Text>
      </TouchableOpacity>
      {expanded && task.solutionSteps && (
        <View style={{ gap: 6 }}>
          {task.solutionSteps.map((step, i) => (
            <View key={i} style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-start' }}>
              <View style={styles.stepNumBadge}><Text style={styles.stepNumText}>{i + 1}</Text></View>
              <View style={{ flex: 1 }}>
                <MathText content={step} fontSize={14} textColor="#FFFFFF" />
              </View>
            </View>
          ))}
          {task.problemAnswer && (
            <View style={styles.answerBox}>
              <Text style={styles.answerLabel}>Ответ:</Text>
              <MathText content={task.problemAnswer} fontSize={14} textColor="#FFFFFF" />
            </View>
          )}
        </View>
      )}
    </View>
  )
}

/* 17. Categorize */
function Categorize({ task, answer, onChange }: { task: WorksheetTask; answer: any; onChange: (v: any) => void }) {
  const categories = task.categories || []
  const pool = task.allCategoryItems || categories.flatMap((c) => c.items)
  const assigned: Record<string, number> = typeof answer === 'object' && answer ? answer : {}
  const [activeCat, setActiveCat] = useState(0)

  const handleAssign = (item: string) => {
    onChange({ ...assigned, [item]: activeCat })
  }

  return (
    <View style={{ gap: 12 }}>
      {/* Category tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {categories.map((cat, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.catTab, activeCat === i && styles.catTabActive]}
              onPress={() => setActiveCat(i)}
            >
              <Text style={[styles.catTabText, activeCat === i && { color: '#FFF' }]}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      <Text style={styles.hintText}>Выберите категорию, затем нажимайте на элементы</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {pool.map((item, i) => {
          const catIdx = assigned[item]
          const isAssigned = catIdx !== undefined
          const catColor = isAssigned ? getCatColor(catIdx) : null
          return (
            <TouchableOpacity
              key={i}
              style={[styles.catItem, isAssigned && { backgroundColor: catColor + '30', borderColor: catColor + '80' }]}
              onPress={() => handleAssign(item)}
            >
              <Text style={[styles.catItemText, isAssigned && { color: catColor }]}>{item}</Text>
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
}

const CAT_COLORS = ['#8B7CF6', '#F59E0B', '#10B981', '#EF4444', '#3B82F6', '#EC4899']
const getCatColor = (i: number) => CAT_COLORS[i % CAT_COLORS.length]

/* 18. Passage-based (scenario / text-analysis / info-work) */
function PassageTask({ task, answer, onChange }: { task: WorksheetTask; answer: any; onChange: (v: any) => void }) {
  const questions = task.passageQuestions || []
  const values: string[] = Array.isArray(answer) ? answer : Array(questions.length).fill('')

  const updateVal = (i: number, v: string) => {
    const next = [...values]
    next[i] = v
    onChange(next)
  }

  return (
    <View style={{ gap: 12 }}>
      {task.passageText ? (
        <View style={styles.passageBox}>
          <MathText content={task.passageText} fontSize={14} textColor="#FFFFFF" />
        </View>
      ) : null}
      {questions.map((q, i) => (
        <View key={i} style={{ gap: 6 }}>
          <Text style={styles.passageQ}>{i + 1}. {q.question}</Text>
          <TextInput
            style={styles.textInput}
            value={values[i] || ''}
            onChangeText={(v) => updateVal(i, v)}
            placeholder="Ваш ответ..."
            placeholderTextColor="rgba(255,255,255,0.3)"
            multiline
          />
        </View>
      ))}
    </View>
  )
}

/* 19. Filword */
function Filword({ task, answer, onChange }: { task: WorksheetTask; answer: any; onChange: (v: any) => void }) {
  const grid = task.filwordGrid || []
  const words = task.filwordWords || []
  const found: string[] = Array.isArray(answer) ? answer : []

  const toggleWord = (w: string) => {
    if (found.includes(w)) onChange(found.filter((x) => x !== w))
    else onChange([...found, w])
  }

  const cellSize = 32

  return (
    <View style={{ gap: 12 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          {grid.map((row, ri) => (
            <View key={ri} style={{ flexDirection: 'row' }}>
              {row.map((ch, ci) => (
                <View key={ci} style={[styles.fwCell, { width: cellSize, height: cellSize }]}>
                  <Text style={styles.fwLetter}>{ch.toUpperCase()}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
      <Text style={styles.hintText}>Найдите слова:</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {words.map((w, i) => {
          const isFound = found.includes(w)
          return (
            <TouchableOpacity key={i} style={[styles.fwWord, isFound && styles.fwWordFound]} onPress={() => toggleWord(w)}>
              <Text style={[styles.fwWordText, isFound && { textDecorationLine: 'line-through', color: '#86EFAC' }]}>{w}</Text>
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
}

/* 20. Continue story */
function ContinueStory({ task, answer, onChange }: { task: WorksheetTask; answer: any; onChange: (v: any) => void }) {
  return (
    <View style={{ gap: 10 }}>
      {task.storyBeginning ? (
        <View style={styles.passageBox}>
          <MathText content={task.storyBeginning} fontSize={14} textColor="#FFFFFF" />
        </View>
      ) : null}
      <TextInput
        style={[styles.textInput, { minHeight: 120, textAlignVertical: 'top' }]}
        value={typeof answer === 'string' ? answer : ''}
        onChangeText={onChange}
        placeholder="Продолжите рассказ..."
        placeholderTextColor="rgba(255,255,255,0.3)"
        multiline
      />
    </View>
  )
}

/* 21. Unknown words */
function UnknownWords({ task, answer, onChange }: { task: WorksheetTask; answer: any; onChange: (v: any) => void }) {
  return (
    <View style={{ gap: 10 }}>
      {task.readingText ? (
        <View style={styles.passageBox}>
          <MathText content={task.readingText} fontSize={14} textColor="#FFFFFF" />
        </View>
      ) : null}
      <Text style={styles.hintText}>Выпишите незнакомые слова:</Text>
      <TextInput
        style={[styles.textInput, { minHeight: 80, textAlignVertical: 'top' }]}
        value={typeof answer === 'string' ? answer : ''}
        onChangeText={onChange}
        placeholder="Слово 1, слово 2, ..."
        placeholderTextColor="rgba(255,255,255,0.3)"
        multiline
      />
    </View>
  )
}

/* 22. Handwriting (display only) */
function Handwriting({ task }: { task: WorksheetTask }) {
  return (
    <View style={styles.passageBox}>
      <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginBottom: 8 }}>Перепишите текст:</Text>
      <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: '300', letterSpacing: 2, lineHeight: 36 }}>
        {task.handwritingText || ''}
      </Text>
    </View>
  )
}

/* 23. Number composition */
function NumberComposition({ task, answer, onChange }: { task: WorksheetTask; answer: any; onChange: (v: any) => void }) {
  const target = task.targetNumber ?? 0
  const parts = task.numberParts || []
  const values: string[] = Array.isArray(answer) ? answer : Array(parts.length).fill('')

  const updateVal = (i: number, v: string) => {
    const next = [...values]
    next[i] = v
    onChange(next)
  }

  return (
    <View style={{ gap: 10 }}>
      <View style={{ alignItems: 'center' }}>
        <View style={styles.targetBadge}>
          <Text style={styles.targetText}>{target}</Text>
        </View>
      </View>
      {parts.map((p, i) => (
        <View key={i} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <View style={styles.numBox}><Text style={styles.numBoxText}>{p.a}</Text></View>
          <Text style={{ color: '#FFFFFF', fontSize: 20 }}>+</Text>
          <TextInput
            style={styles.numInput}
            value={values[i] || ''}
            onChangeText={(v) => updateVal(i, v)}
            placeholder="?"
            placeholderTextColor="rgba(255,255,255,0.3)"
            keyboardType="numeric"
            maxLength={4}
          />
          <Text style={{ color: '#FFFFFF', fontSize: 20 }}>=</Text>
          <View style={styles.numBox}><Text style={styles.numBoxText}>{target}</Text></View>
        </View>
      ))}
    </View>
  )
}

/* 24. Maze (display only) */
function MazeView({ task }: { task: WorksheetTask }) {
  const grid = task.mazeGrid || []
  const cellSize = 20
  const colors: Record<number, string> = { 0: 'rgba(255,255,255,0.1)', 1: 'rgba(255,255,255,0.6)', 2: '#10B981', 3: '#EF4444' }
  return (
    <View style={{ alignItems: 'center' }}>
      {grid.map((row, ri) => (
        <View key={ri} style={{ flexDirection: 'row' }}>
          {row.map((cell, ci) => (
            <View key={ci} style={{ width: cellSize, height: cellSize, backgroundColor: colors[cell] || 'transparent', borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.05)' }} />
          ))}
        </View>
      ))}
    </View>
  )
}

/* 25. Draw illustration */
function DrawIllustration({ task }: { task: WorksheetTask }) {
  return (
    <View style={styles.drawBox}>
      <Text style={{ color: '#C7BFFF', fontSize: 14 }}>Задание для рисования:</Text>
      <MathText content={task.drawPrompt || ''} fontSize={15} textColor="#FFFFFF" />
    </View>
  )
}

/* 26. Generic fallback */
function GenericTask({ task, answer, onChange }: { task: WorksheetTask; answer: any; onChange: (v: any) => void }) {
  return (
    <View style={{ gap: 10 }}>
      {task.questionText ? <MathText content={task.questionText} fontSize={15} textColor="#FFFFFF" /> : null}
      <TextInput
        style={[styles.textInput, { minHeight: 60, textAlignVertical: 'top' }]}
        value={typeof answer === 'string' ? answer : ''}
        onChangeText={onChange}
        placeholder="Ваш ответ..."
        placeholderTextColor="rgba(255,255,255,0.3)"
        multiline
      />
    </View>
  )
}

/* ═══════════════════════════════════════════
   Styles
   ═══════════════════════════════════════════ */
const styles = StyleSheet.create({
  wsHeader: {
    alignItems: 'center',
    gap: 6,
    paddingBottom: 4,
  },
  wsTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  wsSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    textAlign: 'center',
  },
  wsMeta: {
    color: '#C7BFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  taskCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: 14,
    gap: 12,
  },
  taskHeader: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  taskBadge: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: 'rgba(139,124,246,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskBadgeText: {
    color: '#C7BFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  taskTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  taskInstruction: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    marginTop: 2,
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  optionBtnActive: {
    backgroundColor: 'rgba(108,99,255,0.25)',
    borderColor: 'rgba(108,99,255,0.6)',
  },
  optionBadge: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionBadgeActive: {
    backgroundColor: 'rgba(108,99,255,0.7)',
  },
  optionBadgeText: {
    color: '#E5E7EB',
    fontWeight: '700',
    fontSize: 13,
  },
  optionText: {
    color: '#E5E7EB',
    fontSize: 14,
    flex: 1,
  },
  tfBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
  },
  tfText: {
    color: '#E5E7EB',
    fontSize: 15,
    fontWeight: '700',
  },
  blankPartText: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 28,
  },
  blankInput: {
    borderBottomWidth: 2,
    borderBottomColor: '#8B7CF6',
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    minWidth: 60,
    paddingHorizontal: 4,
    paddingVertical: 2,
    textAlign: 'center',
  },
  textInput: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    color: '#FFFFFF',
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  cwBlack: {
    backgroundColor: '#1E1B3A',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  cwCell: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cwNum: {
    position: 'absolute',
    top: 1,
    left: 2,
    color: '#C7BFFF',
    fontWeight: '700',
  },
  cwInput: {
    color: '#FFFFFF',
    fontWeight: '800',
    textAlign: 'center',
    width: '100%',
    height: '100%',
    padding: 0,
  },
  cwLabel: {
    color: '#FCD34D',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  cwClue: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    marginLeft: 8,
    marginBottom: 3,
  },
  chipBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  chipBtnActive: {
    backgroundColor: 'rgba(239,68,68,0.25)',
    borderColor: 'rgba(239,68,68,0.6)',
  },
  chipText: {
    color: '#E5E7EB',
    fontSize: 14,
    fontWeight: '600',
  },
  matchItem: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  matchItemActive: {
    borderColor: '#8B7CF6',
    backgroundColor: 'rgba(139,124,246,0.15)',
  },
  matchItemDone: {
    borderColor: 'rgba(16,185,129,0.6)',
    backgroundColor: 'rgba(16,185,129,0.12)',
  },
  matchText: {
    color: '#E5E7EB',
    fontSize: 13,
  },
  seqItem: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  seqItemActive: {
    backgroundColor: 'rgba(108,99,255,0.2)',
    borderColor: 'rgba(108,99,255,0.5)',
  },
  seqBadge: {
    width: 20,
    height: 20,
    borderRadius: 6,
    backgroundColor: '#6C63FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  seqBadgeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
  },
  seqText: {
    color: '#E5E7EB',
    fontSize: 14,
  },
  letterBox: {
    width: 32,
    height: 38,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  letterInput: {
    width: 32,
    height: 38,
    borderRadius: 8,
    backgroundColor: 'rgba(139,124,246,0.15)',
    borderWidth: 2,
    borderColor: '#8B7CF6',
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    padding: 0,
  },
  compareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  compareNum: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    minWidth: 50,
    alignItems: 'center',
  },
  compareNumText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  compareBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  compareBtnActive: {
    backgroundColor: 'rgba(108,99,255,0.4)',
    borderColor: '#8B7CF6',
  },
  compareBtnText: {
    color: '#E5E7EB',
    fontSize: 18,
    fontWeight: '800',
  },
  errorTextBox: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(239,68,68,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.2)',
  },
  tableHeaderCell: {
    minWidth: 90,
    padding: 8,
    backgroundColor: 'rgba(139,124,246,0.15)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
  },
  tableHeaderText: {
    color: '#C7BFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  tableCell: {
    minWidth: 90,
    minHeight: 40,
    padding: 6,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tableCellText: {
    color: '#FFFFFF',
    fontSize: 13,
  },
  tableCellInput: {
    color: '#FFFFFF',
    fontSize: 13,
    textAlign: 'center',
    width: '100%',
    padding: 0,
  },
  seqFixed: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  seqFixedText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  seqInput: {
    width: 60,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#8B7CF6',
    backgroundColor: 'rgba(139,124,246,0.1)',
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  anagramTile: {
    width: 40,
    height: 44,
    borderRadius: 10,
    backgroundColor: 'rgba(245,158,11,0.15)',
    borderWidth: 2,
    borderColor: 'rgba(245,158,11,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  anagramLetter: {
    color: '#FCD34D',
    fontSize: 20,
    fontWeight: '800',
  },
  expandBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: 'rgba(99,102,241,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.4)',
  },
  expandBtnText: {
    color: '#C7BFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  stepNumBadge: {
    width: 22,
    height: 22,
    borderRadius: 7,
    backgroundColor: 'rgba(252,211,77,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumText: {
    color: '#FCD34D',
    fontSize: 11,
    fontWeight: '800',
  },
  answerBox: {
    marginTop: 8,
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(16,185,129,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.3)',
    gap: 4,
  },
  answerLabel: {
    color: '#86EFAC',
    fontSize: 12,
    fontWeight: '700',
  },
  catTab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  catTabActive: {
    backgroundColor: 'rgba(108,99,255,0.3)',
    borderColor: '#8B7CF6',
  },
  catTabText: {
    color: '#E5E7EB',
    fontSize: 13,
    fontWeight: '600',
  },
  catItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  catItemText: {
    color: '#E5E7EB',
    fontSize: 13,
    fontWeight: '600',
  },
  passageBox: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  passageQ: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  fwCell: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fwLetter: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  fwWord: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  fwWordFound: {
    borderColor: 'rgba(16,185,129,0.5)',
    backgroundColor: 'rgba(16,185,129,0.1)',
  },
  fwWordText: {
    color: '#E5E7EB',
    fontSize: 13,
    fontWeight: '600',
  },
  targetBadge: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: 'rgba(139,124,246,0.2)',
    borderWidth: 2,
    borderColor: '#8B7CF6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
  },
  numBox: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  numBoxText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  numInput: {
    width: 56,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#8B7CF6',
    backgroundColor: 'rgba(139,124,246,0.1)',
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  drawBox: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    gap: 8,
  },
  hintText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    fontStyle: 'italic',
  },
  /* ── Crossword clue row ── */
  cwClueRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  cwClueNum: {
    color: '#C7BFFF',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
    minWidth: 24,
  },
  cwClueNumBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(139,124,246,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(139,124,246,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  cwClueNumBadgeFilled: {
    backgroundColor: 'rgba(16,185,129,0.2)',
    borderColor: 'rgba(16,185,129,0.5)',
  },
  cwClueNumText: {
    color: '#C7BFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  cwWordInput: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(139,124,246,0.4)',
    backgroundColor: 'rgba(139,124,246,0.08)',
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
  cwWordInputFilled: {
    borderColor: 'rgba(16,185,129,0.5)',
    backgroundColor: 'rgba(16,185,129,0.08)',
  },
  cwCellFilled: {
    backgroundColor: 'rgba(139,124,246,0.15)',
  },
  cwLetter: {
    color: '#FFFFFF',
    fontWeight: '700',
    textAlign: 'center',
  },
  /* ── Submit section ── */
  submitSection: {
    gap: 12,
    paddingTop: 8,
    paddingBottom: 20,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  progressBarBg: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#8B7CF6',
  },
  progressText: {
    color: '#C7BFFF',
    fontSize: 13,
    fontWeight: '600',
    minWidth: 36,
    textAlign: 'right',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#8B7CF6',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  taskBadgeAnswered: {
    backgroundColor: 'rgba(16,185,129,0.3)',
    borderColor: '#10B981',
  },
  submitResultCard: {
    alignItems: 'center',
    gap: 10,
    padding: 24,
    borderRadius: 20,
    backgroundColor: 'rgba(16,185,129,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.25)',
  },
  submitResultTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  submitResultMeta: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginTop: 4,
  },
  scoreText: {
    color: '#10B981',
    fontSize: 32,
    fontWeight: '800',
  },
  scoreMeta: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
  },
})
