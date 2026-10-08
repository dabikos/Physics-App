import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { MathContent } from '../../components/MathContent';
import { useTheme } from '../../context/ThemeContext';
import { sendChatMessage } from '../../services/aiService';
import { ContextMaterial, ExamContext, ExamIllustration } from './ExamIllustration';

export interface SessionQuestion {
  id: string;
  text: string;
  options: string[];
  correct?: number;
  explanation?: string;
  contextId?: string | null;
  diagramId?: string | null;
}

interface Props {
  title: string;
  questions: SessionQuestion[];
  durationSeconds?: number;
  passingCount?: number;
  contexts?: Record<string, ExamContext>;
  contextStart?: number;
  showAiHelp?: boolean;
  preview?: boolean;
  onClose: () => void;
  onSubmit?: (answers: number[]) => Promise<void> | void;
}

const formatTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
    : `${minutes}:${String(secs).padStart(2, '0')}`;
};

export function TestSession({ title, questions, durationSeconds, passingCount, contexts, contextStart, showAiHelp = false, preview = false, onClose, onSubmit }: Props) {
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>(() => questions.map(() => -1));
  const [marked, setMarked] = useState<number[]>([]);
  const [showMap, setShowMap] = useState(false);
  const [stage, setStage] = useState<'taking' | 'result' | 'review'>('taking');
  const [timeLeft, setTimeLeft] = useState(durationSeconds ?? 0);
  const [showHelp, setShowHelp] = useState(false);
  const [helpLoading, setHelpLoading] = useState(false);
  const [helpText, setHelpText] = useState<Record<number, string>>({});
  const [helpUsed, setHelpUsed] = useState<number[]>([]);
  const endAt = useRef(0);
  const finished = useRef(false);

  const finish = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    setShowMap(false);
    setStage('result');
    void Promise.resolve(onSubmit?.(answers)).catch(error => console.log('Test result submit error:', error));
  }, [answers, onSubmit]);
  const finishRef = useRef(finish);
  useEffect(() => { finishRef.current = finish; }, [finish]);

  useEffect(() => {
    if (!durationSeconds || stage !== 'taking') return;
    if (endAt.current === 0) endAt.current = Date.now() + durationSeconds * 1000;
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((endAt.current - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining === 0) finishRef.current();
    }, 1000);
    return () => clearInterval(interval);
  }, [durationSeconds, stage]);

  const answered = answers.filter(value => value >= 0).length;
  const skipped = questions.length - answered;
  const gradedCount = questions.filter(q => typeof q.correct === 'number' && q.correct >= 0).length;
  const graded = gradedCount > 0;
  const gradingComplete = gradedCount === questions.length;
  const ungradedCount = questions.length - gradedCount;
  const correct = graded ? questions.filter((q, i) => typeof q.correct === 'number' && answers[i] === q.correct).length : 0;
  const wrong = graded ? questions.filter((q, i) => typeof q.correct === 'number' && answers[i] >= 0 && answers[i] !== q.correct).length : 0;
  const passing = passingCount ?? Math.ceil(questions.length * 0.7);
  const current = questions[index];
  const context = current?.contextId ? contexts?.[current.contextId] : undefined;
  const reviewTargets = useMemo(() => graded
    ? questions.map((_, i) => i).filter(i => typeof questions[i].correct !== 'number' || answers[i] !== questions[i].correct)
    : questions.map((_, i) => i).filter(i => answers[i] < 0 || marked.includes(i)),
  [answers, graded, marked, questions]);

  const confirmFinish = () => {
    Alert.alert(t('exam.finishTitle'), t('exam.finishConfirm', { count: skipped }), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.finish'), onPress: finish },
    ]);
  };

  const confirmExit = () => {
    if (stage !== 'taking') { onClose(); return; }
    Alert.alert(t('tests.exitTest'), t('tests.progressLost'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('tests.exitButton'), style: 'destructive', onPress: onClose },
    ]);
  };

  const askAi = async () => {
    setShowHelp(true);
    if (helpText[index] || helpLoading) return;
    setHelpLoading(true);
    setHelpUsed(previous => previous.includes(index) ? previous : [...previous, index]);
    const language = i18n.language.startsWith('kk') ? 'қазақша' : i18n.language.startsWith('en') ? 'English' : 'русский';
    const prompt = `Помоги разобраться с вопросом физики, но не называй правильную букву и не давай готовый ответ. Дай первую короткую подсказку: ключевой закон или формулу и первый шаг решения. Общий материал: ${context?.text ?? 'нет'}. Вопрос: ${current.text}. Варианты: ${current.options.map((option, i) => `${String.fromCharCode(65 + i)}. ${option}`).join('; ')}`;
    try {
      const result = await sendChatMessage(prompt, [], language);
      setHelpText(previous => ({ ...previous, [index]: result.success ? result.content : result.error || t('exam.aiError') }));
    } catch {
      setHelpText(previous => ({ ...previous, [index]: t('exam.aiError') }));
    } finally {
      setHelpLoading(false);
    }
  };

  const renderMap = () => <View style={[styles.mapCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
    <View style={styles.mapHeader}>
      <Text style={[styles.mapTitle, { color: colors.text }]}>{t('exam.questionMap')}</Text>
      <TouchableOpacity onPress={() => setShowMap(false)} accessibilityLabel={t('common.close')}>
        <Ionicons name="close" size={22} color={colors.textSecondary} />
      </TouchableOpacity>
    </View>
    {contextStart != null && <Text style={[styles.mapGroup, { color: colors.textTertiary }]}>{t('exam.regularQuestions')}</Text>}
    <View style={styles.mapGrid}>
      {questions.slice(0, contextStart ?? questions.length).map((_, i) => renderMapNumber(i))}
    </View>
    {contextStart != null && <>
      <Text style={[styles.mapGroup, { color: colors.textTertiary }]}>{t('exam.contextQuestions')}</Text>
      <View style={styles.mapGrid}>{questions.slice(contextStart).map((_, offset) => renderMapNumber(contextStart + offset))}</View>
    </>}
    <Text style={[styles.mapLegend, { color: colors.textTertiary }]}>{t('exam.mapLegend')}</Text>
  </View>;

  const renderMapNumber = (number: number) => {
    const isCurrent = number === index;
    const isMarked = marked.includes(number);
    const isAnswered = answers[number] >= 0;
    const bg = isCurrent ? colors.accent : isMarked ? colors.warningBg : isAnswered ? colors.successBg : colors.inputBg;
    const fg = isCurrent ? '#FFFFFF' : isMarked ? colors.warning : isAnswered ? colors.success : colors.textSecondary;
    return <TouchableOpacity
      key={number}
      style={[styles.mapNumber, { backgroundColor: bg, borderColor: isCurrent ? colors.accent : colors.border }]}
      onPress={() => { setIndex(number); setShowMap(false); }}
      accessibilityLabel={`${t('exam.question')} ${number + 1}`}
    ><Text style={[styles.mapNumberText, { color: fg }]}>{number + 1}</Text></TouchableOpacity>;
  };

  if (stage === 'result') {
    return <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <View style={[styles.header, { borderColor: colors.border, backgroundColor: colors.headerBg }]}>
        <TouchableOpacity onPress={onClose} style={styles.iconButton}><Ionicons name="close" size={23} color={colors.text} /></TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>{t('tests.results')}</Text>
        <View style={styles.iconButton} />
      </View>
      <ScrollView contentContainerStyle={[styles.page, { paddingBottom: insets.bottom + 28 }]}>
        <Text style={[styles.eyebrow, { color: colors.accentText }]}>{title}</Text>
        <Text style={[styles.pageTitle, { color: colors.text }]}>{gradingComplete ? (correct >= passing ? t('exam.goalReached') : t('exam.keepPracticing')) : graded ? t('exam.partialResults') : t('exam.previewComplete')}</Text>
        <View style={[styles.resultHero, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.resultHeroRow}>
            <View>
              <Text style={[styles.resultNumber, { color: colors.text }]}>{graded ? correct : answered}<Text style={[styles.resultDenominator, { color: colors.textTertiary }]}>/{graded ? gradedCount : questions.length}</Text></Text>
              <Text style={[styles.muted, { color: colors.textTertiary }]}>{graded ? t('exam.correctAnswers') : t('exam.answered')}</Text>
            </View>
            <View style={[styles.outcomeBadge, { backgroundColor: gradingComplete ? (correct >= passing ? colors.successBg : colors.warningBg) : colors.infoBg }]}>
              <Text style={{ color: gradingComplete ? (correct >= passing ? colors.success : colors.warning) : colors.accentText, fontWeight: '700' }}>{gradingComplete ? (correct >= passing ? t('exam.passed') : t('exam.belowTarget')) : graded ? t('exam.partial') : t('exam.ungraded')}</Text>
            </View>
          </View>
          <View style={[styles.track, { backgroundColor: colors.border }]}><View style={[styles.fill, { backgroundColor: graded ? colors.success : colors.accent, width: `${Math.round((graded ? correct / gradedCount : answered / questions.length) * 100)}%` }]} /></View>
          {gradingComplete && <Text style={[styles.muted, { color: colors.textTertiary }]}>{t('exam.target', { count: passing })}</Text>}
          {graded && !gradingComplete && <Text style={[styles.muted, { color: colors.textTertiary }]}>{t('exam.partialKey', { count: ungradedCount })}</Text>}
          {!graded && <Text style={[styles.muted, { color: colors.textTertiary }]}>{t('exam.noAnswerKey')}</Text>}
        </View>
        <View style={styles.statsRow}>
          <Stat label={graded ? t('exam.correct') : t('exam.answered')} value={graded ? correct : answered} color={colors.success} background={colors.card} border={colors.border} />
          <Stat label={graded ? t('exam.incorrect') : t('exam.marked')} value={graded ? wrong : marked.length} color={colors.warning} background={colors.card} border={colors.border} />
          <Stat label={t('exam.skipped')} value={skipped} color={colors.textSecondary} background={colors.card} border={colors.border} />
        </View>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('exam.studyPlan')}</Text>
        <View style={[styles.planCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <PlanRow number={1} text={graded ? t('exam.planMistakes', { count: wrong }) : t('exam.planReview', { count: reviewTargets.length })} color={colors.accent} textColor={colors.text} border={colors.border} />
          <PlanRow number={2} text={t('exam.planSkipped', { count: skipped })} color={colors.accent} textColor={colors.text} border={colors.border} />
          <PlanRow number={3} text={t('exam.planWithoutAi', { count: helpUsed.length })} color={colors.accent} textColor={colors.text} border={colors.border} last />
        </View>
        {reviewTargets.length > 0 && <TouchableOpacity style={[styles.primary, { backgroundColor: colors.accent }]} onPress={() => { setIndex(reviewTargets[0]); setStage('review'); }}>
          <Text style={styles.primaryText}>{graded && !gradingComplete ? t('exam.reviewAnswers') : graded ? t('exam.reviewMistakes') : t('exam.reviewMarked')}</Text>
          <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
        </TouchableOpacity>}
        <Text style={[styles.note, { color: colors.textTertiary }]}>{preview ? t('exam.previewNote') : t('exam.practiceNote')}</Text>
      </ScrollView>
    </SafeAreaView>;
  }

  return <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
    <View style={[styles.header, { borderColor: colors.border, backgroundColor: colors.headerBg }]}>
      <TouchableOpacity onPress={stage === 'review' ? () => setStage('result') : confirmExit} style={styles.iconButton} accessibilityLabel={t('common.back')}>
        <Ionicons name={stage === 'review' ? 'arrow-back' : 'close'} size={23} color={colors.text} />
      </TouchableOpacity>
      <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>{title}</Text>
      <View style={[styles.timer, { backgroundColor: colors.inputBg }]}>
        <Ionicons name="time-outline" size={15} color={timeLeft < 60 && stage === 'taking' ? colors.error : colors.textTertiary} />
        <Text style={{ color: timeLeft < 60 && stage === 'taking' ? colors.error : colors.textSecondary, fontWeight: '700' }}>{stage === 'review' ? '—' : durationSeconds ? formatTime(timeLeft) : '—'}</Text>
      </View>
    </View>
    <ScrollView contentContainerStyle={[styles.page, { paddingBottom: insets.bottom + 22 }]} keyboardShouldPersistTaps="handled">
      <Text style={[styles.eyebrow, { color: colors.accentText }]}>{contextStart != null ? (index < contextStart ? t('exam.regularQuestions') : t('exam.contextQuestions')) : t('tests.title')}</Text>
      <Text style={[styles.pageTitle, { color: colors.text }]}>{t('exam.questionNumber', { current: index + 1, total: questions.length })}</Text>
      <Text style={[styles.muted, { color: colors.textTertiary }]}>{t('exam.progress', { answered, marked: marked.length })}</Text>
      <View style={[styles.track, { backgroundColor: colors.border }]}><View style={[styles.fill, { backgroundColor: colors.accent, width: `${(index + 1) / questions.length * 100}%` }]} /></View>
      <TouchableOpacity style={[styles.mapToggle, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => setShowMap(!showMap)}>
        <Ionicons name="grid-outline" size={19} color={colors.accent} />
        <Text style={[styles.mapToggleText, { color: colors.text }]}>{t('exam.questionMap')}</Text>
        <Ionicons name={showMap ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textTertiary} />
      </TouchableOpacity>
      {showMap && renderMap()}
      {context && <ContextMaterial context={context} />}
      <View style={[styles.questionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.questionTop}>
          <View style={[styles.numberBadge, { backgroundColor: colors.accentLight }]}><Text style={{ color: colors.accentText, fontWeight: '700' }}>№ {index + 1}</Text></View>
          {stage === 'taking' && <TouchableOpacity style={styles.markButton} onPress={() => setMarked(previous => previous.includes(index) ? previous.filter(x => x !== index) : [...previous, index])}>
            <Ionicons name={marked.includes(index) ? 'bookmark' : 'bookmark-outline'} size={18} color={marked.includes(index) ? colors.warning : colors.textTertiary} />
            <Text style={{ color: marked.includes(index) ? colors.warning : colors.textTertiary, fontWeight: '600' }}>{marked.includes(index) ? t('exam.marked') : t('exam.mark')}</Text>
          </TouchableOpacity>}
        </View>
        <MathContent content={current.text} fontSize={18} textColor={colors.text} />
        {current.diagramId && <ExamIllustration id={current.diagramId} />}
        <View style={styles.options}>
          {current.options.map((option, optionIndex) => {
            const selected = answers[index] === optionIndex;
            const correctReview = stage === 'review' && typeof current.correct === 'number' && current.correct === optionIndex;
            const wrongReview = stage === 'review' && typeof current.correct === 'number' && selected && !correctReview;
            const border = correctReview ? colors.success : wrongReview ? colors.error : selected ? colors.accent : colors.optionBorder;
            const background = correctReview ? colors.successBg : wrongReview ? colors.errorBg : selected ? colors.optionSelectedBg : colors.optionBg;
            return <TouchableOpacity key={optionIndex} disabled={stage === 'review'} onPress={() => setAnswers(previous => previous.map((value, i) => i === index ? optionIndex : value))}
              style={[styles.option, { borderColor: border, backgroundColor: background }]}>
              <View style={[styles.optionLetter, { backgroundColor: selected ? colors.accent : colors.optionCircleBg }]}>
                <Text style={{ color: selected ? '#FFFFFF' : colors.textSecondary, fontWeight: '700' }}>{String.fromCharCode(65 + optionIndex)}</Text>
              </View>
              <View style={styles.optionContent}><MathContent content={option} fontSize={15} textColor={colors.text} /></View>
              {(correctReview || wrongReview) && <Ionicons name={correctReview ? 'checkmark-circle' : 'close-circle'} size={20} color={border} />}
            </TouchableOpacity>;
          })}
        </View>
        {stage === 'review' && current.explanation && <View style={[styles.explanation, { backgroundColor: colors.infoBg }]}>
          <Text style={{ color: colors.accentText, fontWeight: '700', marginBottom: 6 }}>{t('tests.explanationTitle')}</Text>
          <MathContent content={current.explanation} fontSize={14} textColor={colors.textSecondary} />
        </View>}
      </View>
      {showAiHelp && stage === 'taking' && <TouchableOpacity style={[styles.aiButton, { borderColor: colors.accent, backgroundColor: colors.accentLight }]} onPress={askAi}>
        <Ionicons name="sparkles-outline" size={20} color={colors.accentText} />
        <Text style={{ color: colors.accentText, fontWeight: '700' }}>{t('exam.askAi')}</Text>
      </TouchableOpacity>}
      <View style={styles.navRow}>
        <TouchableOpacity disabled={index === 0} style={[styles.secondary, { borderColor: colors.border, opacity: index === 0 ? 0.45 : 1 }]} onPress={() => setIndex(index - 1)}>
          <Ionicons name="arrow-back" size={18} color={colors.textSecondary} /><Text style={{ color: colors.textSecondary, fontWeight: '700' }}>{t('common.back')}</Text>
        </TouchableOpacity>
        {index === questions.length - 1 && stage === 'taking' ?
          <TouchableOpacity style={[styles.primary, styles.navPrimary, { backgroundColor: colors.accent }]} onPress={confirmFinish}><Text style={styles.primaryText}>{t('common.finish')}</Text></TouchableOpacity> :
          <TouchableOpacity disabled={index === questions.length - 1} style={[styles.primary, styles.navPrimary, { backgroundColor: colors.accent, opacity: index === questions.length - 1 ? 0.45 : 1 }]} onPress={() => setIndex(index + 1)}>
            <Text style={styles.primaryText}>{t('common.next')}</Text><Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
          </TouchableOpacity>}
      </View>
      {stage === 'taking' && index !== questions.length - 1 && <TouchableOpacity style={styles.finishLink} onPress={confirmFinish}><Text style={{ color: colors.textTertiary }}>{t('exam.finishEarly')}</Text></TouchableOpacity>}
    </ScrollView>
    <Modal visible={showHelp} animationType="slide" transparent onRequestClose={() => setShowHelp(false)}>
      <View style={styles.modalScrim}><View style={[styles.helpSheet, { backgroundColor: colors.card, paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.mapHeader}><Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>{t('exam.aiHint')}</Text><TouchableOpacity onPress={() => setShowHelp(false)}><Ionicons name="close" size={24} color={colors.text} /></TouchableOpacity></View>
        <Text style={[styles.note, { color: colors.textTertiary }]}>{t('exam.aiUsesLimit')}</Text>
        <ScrollView style={{ maxHeight: 390 }}>{helpLoading ? <ActivityIndicator color={colors.accent} style={{ margin: 24 }} /> : <MathContent content={helpText[index] || ''} fontSize={15} textColor={colors.text} />}</ScrollView>
      </View></View>
    </Modal>
  </SafeAreaView>;
}

function Stat({ label, value, color, background, border }: { label: string; value: number; color: string; background: string; border: string }) {
  return <View style={[styles.stat, { backgroundColor: background, borderColor: border }]}><Text style={{ color, fontSize: 23, fontWeight: '800' }}>{value}</Text><Text style={{ color, fontSize: 12, marginTop: 4 }}>{label}</Text></View>;
}

function PlanRow({ number, text, color, textColor, border, last }: { number: number; text: string; color: string; textColor: string; border: string; last?: boolean }) {
  return <View style={[styles.planRow, !last && { borderBottomWidth: 1, borderBottomColor: border }]}>
    <View style={[styles.planNumber, { backgroundColor: color + '18' }]}><Text style={{ color, fontWeight: '800' }}>{number}</Text></View>
    <Text style={{ color: textColor, flex: 1, fontSize: 14, lineHeight: 20 }}>{text}</Text>
  </View>;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { height: 58, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, paddingHorizontal: 12 },
  iconButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, fontSize: 15, fontWeight: '700', textAlign: 'center' },
  timer: { minWidth: 76, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 4, paddingHorizontal: 8 },
  page: { padding: 18, gap: 0 },
  eyebrow: { fontSize: 12, fontWeight: '800', letterSpacing: 0.7, textTransform: 'uppercase', marginBottom: 7 },
  pageTitle: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5, marginBottom: 4 },
  muted: { fontSize: 13, lineHeight: 19 },
  track: { height: 6, borderRadius: 4, overflow: 'hidden', marginTop: 16, marginBottom: 18 },
  fill: { height: '100%', borderRadius: 4 },
  mapToggle: { height: 52, borderWidth: 1, borderRadius: 15, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 15, marginBottom: 14 },
  mapToggleText: { flex: 1, fontSize: 14, fontWeight: '700' },
  mapCard: { borderWidth: 1, borderRadius: 17, padding: 15, marginBottom: 14 },
  mapHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  mapTitle: { fontSize: 16, fontWeight: '800' },
  mapGroup: { fontSize: 12, fontWeight: '700', marginTop: 10, marginBottom: 8 },
  mapGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  mapNumber: { width: '17%', height: 38, borderWidth: 1, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  mapNumberText: { fontSize: 13, fontWeight: '700' },
  mapLegend: { fontSize: 11, marginTop: 13, lineHeight: 17 },
  questionCard: { borderWidth: 1, borderRadius: 20, padding: 18 },
  questionTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  numberBadge: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 7 },
  markButton: { flexDirection: 'row', alignItems: 'center', gap: 5, minHeight: 36 },
  options: { gap: 10, marginTop: 20 },
  option: { borderWidth: 1.5, borderRadius: 14, minHeight: 58, padding: 11, flexDirection: 'row', alignItems: 'center', gap: 12 },
  optionLetter: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  optionContent: { flex: 1 },
  explanation: { marginTop: 16, borderRadius: 13, padding: 14 },
  aiButton: { marginTop: 14, minHeight: 52, borderWidth: 1, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 9 },
  navRow: { flexDirection: 'row', gap: 11, marginTop: 20 },
  secondary: { borderWidth: 1, borderRadius: 13, minHeight: 50, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  primary: { minHeight: 50, borderRadius: 13, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, paddingHorizontal: 15, marginTop: 17 },
  navPrimary: { flex: 1, marginTop: 0 },
  primaryText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  finishLink: { alignSelf: 'center', padding: 15, marginTop: 6 },
  resultHero: { borderWidth: 1, borderRadius: 20, padding: 20, marginTop: 15 },
  resultHeroRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resultNumber: { fontSize: 52, fontWeight: '800', lineHeight: 60 },
  resultDenominator: { fontSize: 23, fontWeight: '600' },
  outcomeBadge: { borderRadius: 12, paddingHorizontal: 11, paddingVertical: 8 },
  statsRow: { flexDirection: 'row', gap: 9, marginTop: 12 },
  stat: { flex: 1, borderWidth: 1, borderRadius: 14, padding: 12, minHeight: 78 },
  sectionTitle: { fontSize: 19, fontWeight: '800', marginTop: 22, marginBottom: 12 },
  planCard: { borderWidth: 1, borderRadius: 18, paddingHorizontal: 14 },
  planRow: { minHeight: 63, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  planNumber: { width: 29, height: 29, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  note: { marginTop: 13, fontSize: 12, lineHeight: 18 },
  modalScrim: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  helpSheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 },
});
