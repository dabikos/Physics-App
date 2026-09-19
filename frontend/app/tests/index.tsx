import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Animated,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { usePhysicsData } from '../../src/hooks/usePhysicsData';
import { generateTest } from '../../src/services/aiService';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../src/context/ThemeContext';
import { useLanguage } from '../../src/context/LanguageContext';
import api from '../../src/services/api';

const triggerHaptic = (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) => {
  try {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(style);
    }
  } catch {}
};

type Difficulty = 'basic' | 'standard' | 'advanced' | 'olympiad';

const DIFFICULTY_DATA: { key: Difficulty; color: string; emoji: string }[] = [
  { key: 'basic', color: '#10B981', emoji: '🟢' },
  { key: 'standard', color: '#F59E0B', emoji: '🟡' },
  { key: 'advanced', color: '#F97316', emoji: '🟠' },
  { key: 'olympiad', color: '#EF4444', emoji: '🔴' },
];

const QUESTION_COUNTS = [5, 10, 15, 20];
const RANDOM_QUESTION_COUNTS = [5, 10, 15, 20, 30];

const SECTION_GRADIENTS: Record<string, [string, string]> = {
  mechanics: ['#3B82F6', '#1D4ED8'],
  thermodynamics: ['#F97316', '#C2410C'],
  electromagnetism: ['#8B5CF6', '#6D28D9'],
  optics: ['#10B981', '#047857'],
  atomic: ['#EC4899', '#BE185D'],
  relativity: ['#6366F1', '#4338CA'],
  astronomy: ['#F59E0B', '#D97706'],
};

export default function TestsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { getAILanguageName } = useLanguage();
  const { t } = useTranslation();
  const { PHYSICS_SECTIONS } = usePhysicsData();

  const DIFFICULTIES = DIFFICULTY_DATA.map((d) => ({
    ...d,
    label: t(`difficulty.${d.key}`, { defaultValue: d.key }),
  }));

  const [showModal, setShowModal] = useState(false);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('standard');
  const [selectedCount, setSelectedCount] = useState(10);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showRandomModal, setShowRandomModal] = useState(false);
  const [selectedRandomSections, setSelectedRandomSections] = useState<string[]>([]);
  const [selectedRandomCount, setSelectedRandomCount] = useState(10);
  const [isRandomizing, setIsRandomizing] = useState(false);
  const [randomError, setRandomError] = useState<string | null>(null);

  const getIconName = (icon: string): keyof typeof Ionicons.glyphMap => {
    const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
      speedometer: 'speedometer-outline',
      thermometer: 'thermometer-outline',
      flash: 'flash-outline',
      eye: 'eye-outline',
      planet: 'planet-outline',
      infinite: 'infinite-outline',
      moon: 'moon-outline',
    };
    return iconMap[icon] || 'checkbox-outline';
  };

  const handleGenerateTest = async () => {
    if (!selectedSection) {
      setError(t('tests.selectSection', { defaultValue: 'Выберите раздел' }));
      return;
    }

    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    setError(null);
    setIsGenerating(true);

    const sectionData = PHYSICS_SECTIONS[selectedSection];
    const result = await generateTest(
      sectionData.name,
      selectedSection,
      selectedDifficulty,
      selectedCount,
      getAILanguageName()
    );

    setIsGenerating(false);

    if (result.success && result.test) {
      setShowModal(false);
      router.push({
        pathname: '/tests/ai-test',
        params: { testData: JSON.stringify(result.test) },
      });
    } else {
      setError(result.error || t('common.error', { defaultValue: 'Ошибка генерации' }));
    }
  };

  const openModal = () => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
    setSelectedSection(null);
    setSelectedDifficulty('standard');
    setSelectedCount(10);
    setError(null);
    setShowModal(true);
  };

  const openRandomModal = () => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
    setSelectedRandomSections([]);
    setSelectedRandomCount(10);
    setRandomError(null);
    setShowRandomModal(true);
  };

  const toggleRandomSection = (sectionKey: string) => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
    setSelectedRandomSections((current) =>
      current.includes(sectionKey)
        ? current.filter((key) => key !== sectionKey)
        : [...current, sectionKey]
    );
  };

  const handleRandomTest = async () => {
    if (selectedRandomSections.length === 0) {
      setRandomError(t('tests.selectRandomSection', { defaultValue: 'Выберите хотя бы один раздел' }));
      return;
    }

    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    setRandomError(null);
    setIsRandomizing(true);
    try {
      const response = await api.post('/practice/tests/random', {
        section_ids: selectedRandomSections,
        question_count: selectedRandomCount,
      });
      const test = response.data?.item;
      setShowRandomModal(false);
      router.push({
        pathname: '/tests/ai-test',
        params: { testData: JSON.stringify(test) },
      });
    } catch (err: any) {
      setRandomError(err.response?.data?.detail || t('tests.randomLoadError', { defaultValue: 'Не удалось загрузить тест' }));
    } finally {
      setIsRandomizing(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      {/* ==================== Header ==================== */}
      <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.navBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => {
            triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.headerTitleWrap}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {t('tests.title', { defaultValue: 'Тесты и Проверка' })}
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textTertiary }]}>
            142 теста • AI Генератор
          </Text>
        </View>

        <View style={styles.navBtnPlaceholder} />
      </View>

      {/* ==================== Content ==================== */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 30 }]}
      >
        {/* Generator Cards Bento */}
        <View style={styles.generatorsGrid}>
          {/* AI Generator Card */}
          <TouchableOpacity
            style={styles.heroActionCard}
            onPress={openModal}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#8B5CF6', '#6366F1']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroActionGradient}
            >
              <View style={styles.heroActionTop}>
                <View style={styles.heroActionIconBadge}>
                  <Ionicons name="sparkles" size={24} color="#FFFFFF" />
                </View>
                <View style={styles.heroPillBadge}>
                  <Text style={styles.heroPillText}>GPT-4o</Text>
                </View>
              </View>

              <Text style={styles.heroActionTitle}>
                {t('tests.generateButton', { defaultValue: 'AI Генератор тестов' })}
              </Text>
              <Text style={styles.heroActionSubtitle}>
                {t('tests.generateSubtitle', { defaultValue: 'Создать уникальный тест под любой уровень сложности' })}
              </Text>

              <View style={styles.heroCtaRow}>
                <Text style={styles.heroCtaLabel}>Сгенерировать</Text>
                <Ionicons name="arrow-forward-circle" size={22} color="#FFFFFF" />
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Random Blitz Test Card */}
          <TouchableOpacity
            style={styles.heroActionCard}
            onPress={openRandomModal}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#0EA5E9', '#0D9488']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroActionGradient}
            >
              <View style={styles.heroActionTop}>
                <View style={styles.heroActionIconBadge}>
                  <Ionicons name="shuffle" size={24} color="#FFFFFF" />
                </View>
                <View style={styles.heroPillBadge}>
                  <Text style={styles.heroPillText}>Блиц</Text>
                </View>
              </View>

              <Text style={styles.heroActionTitle}>
                {t('tests.randomButton', { defaultValue: 'Случайный экспресс-тест' })}
              </Text>
              <Text style={styles.heroActionSubtitle}>
                {t('tests.randomSubtitle', { defaultValue: 'Смешанные вопросы по выбранным разделам' })}
              </Text>

              <View style={styles.heroCtaRow}>
                <Text style={styles.heroCtaLabel}>Начать блиц</Text>
                <Ionicons name="play-circle" size={22} color="#FFFFFF" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Section Title */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('tests.readyTests', { defaultValue: 'Готовые тесты по разделам' })}
          </Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textTertiary }]}>7 разделов</Text>
        </View>

        {/* Ready Tests List */}
        <View style={styles.testsList}>
          {Object.entries(PHYSICS_SECTIONS).map(([key, section]) => {
            const gradient = SECTION_GRADIENTS[key] || ['#6366F1', '#4F46E5'];
            const iconName = getIconName(section.icon);

            return (
              <TouchableOpacity
                key={key}
                style={[
                  styles.testCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    shadowColor: colors.shadowColor,
                  },
                ]}
                onPress={() => {
                  triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
                  router.push(`/tests/${key}`);
                }}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.testIconGradient}
                >
                  <Ionicons name={iconName} size={24} color="#FFFFFF" />
                </LinearGradient>

                <View style={styles.testCardInfo}>
                  <Text style={[styles.testCardTitle, { color: colors.text }]}>{section.name}</Text>
                  <Text style={[styles.testCardSub, { color: colors.textTertiary }]}>
                    {section.subsections?.length || 0} тем с тестами
                  </Text>
                </View>

                <View style={[styles.arrowCircle, { borderColor: colors.border }]}>
                  <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* ==================== AI Test Generator Modal ==================== */}
      <Modal visible={showModal} animationType="slide" transparent onRequestClose={() => setShowModal(false)}>
        <View style={[styles.modalOverlay, { backgroundColor: colors.modalOverlay }]}>
          <View style={[styles.modalContainer, { backgroundColor: colors.modalBg }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  {t('tests.settingsTitle', { defaultValue: 'AI Генератор тестов' })}
                </Text>
                <Text style={[styles.modalSubtitle, { color: colors.textTertiary }]}>
                  Настройте параметры квиза
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.modalCloseBtn, { backgroundColor: colors.inputBg }]}
                onPress={() => setShowModal(false)}
              >
                <Ionicons name="close" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
              {/* Section Select */}
              <Text style={[styles.modalFieldLabel, { color: colors.textSecondary }]}>
                {t('tests.sectionLabel', { defaultValue: 'Выберите раздел:' })}
              </Text>
              <View style={styles.chipsWrap}>
                {Object.entries(PHYSICS_SECTIONS).map(([key, section]) => {
                  const isSelected = selectedSection === key;
                  return (
                    <TouchableOpacity
                      key={key}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: isSelected ? '#6366F1' : colors.inputBg,
                          borderColor: isSelected ? '#6366F1' : colors.border,
                        },
                      ]}
                      onPress={() => {
                        triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
                        setSelectedSection(key);
                      }}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          { color: isSelected ? '#FFFFFF' : colors.text },
                        ]}
                      >
                        {section.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Difficulty */}
              <Text style={[styles.modalFieldLabel, { color: colors.textSecondary }]}>
                {t('tests.difficultyLabel', { defaultValue: 'Сложность:' })}
              </Text>
              <View style={styles.diffRow}>
                {DIFFICULTIES.map((d) => {
                  const isSelected = selectedDifficulty === d.key;
                  return (
                    <TouchableOpacity
                      key={d.key}
                      style={[
                        styles.diffCard,
                        {
                          backgroundColor: isSelected ? d.color + '20' : colors.inputBg,
                          borderColor: isSelected ? d.color : colors.border,
                        },
                      ]}
                      onPress={() => {
                        triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
                        setSelectedDifficulty(d.key);
                      }}
                    >
                      <Text style={{ fontSize: 16 }}>{d.emoji}</Text>
                      <Text
                        style={[
                          styles.diffLabel,
                          { color: isSelected ? d.color : colors.text },
                        ]}
                      >
                        {d.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Count */}
              <Text style={[styles.modalFieldLabel, { color: colors.textSecondary }]}>
                {t('tests.questionCountLabel', { defaultValue: 'Количество вопросов:' })}
              </Text>
              <View style={styles.countsRow}>
                {QUESTION_COUNTS.map((cnt) => {
                  const isSelected = selectedCount === cnt;
                  return (
                    <TouchableOpacity
                      key={cnt}
                      style={[
                        styles.countPill,
                        {
                          backgroundColor: isSelected ? '#6366F1' : colors.inputBg,
                          borderColor: isSelected ? '#6366F1' : colors.border,
                        },
                      ]}
                      onPress={() => {
                        triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
                        setSelectedCount(cnt);
                      }}
                    >
                      <Text
                        style={[
                          styles.countPillText,
                          { color: isSelected ? '#FFFFFF' : colors.text },
                        ]}
                      >
                        {cnt}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Error */}
              {error && (
                <View style={[styles.errorBox, { backgroundColor: colors.errorBg }]}>
                  <Ionicons name="alert-circle" size={18} color={colors.error} />
                  <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
                </View>
              )}

              {/* Submit CTA */}
              <TouchableOpacity
                style={[
                  styles.modalSubmitBtn,
                  (!selectedSection || isGenerating) && styles.btnDisabled,
                ]}
                onPress={handleGenerateTest}
                disabled={!selectedSection || isGenerating}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={['#8B5CF6', '#6366F1']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.modalSubmitGradient}
                >
                  {isGenerating ? (
                    <>
                      <ActivityIndicator color="#FFFFFF" size="small" />
                      <Text style={styles.modalSubmitText}>
                        {t('tests.generating', { defaultValue: 'Генерация вопросов...' })}
                      </Text>
                    </>
                  ) : (
                    <>
                      <Ionicons name="sparkles" size={18} color="#FFFFFF" />
                      <Text style={styles.modalSubmitText}>
                        {t('tests.createTest', { defaultValue: 'Создать тест' })}
                      </Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ==================== Random Blitz Modal ==================== */}
      <Modal visible={showRandomModal} animationType="slide" transparent onRequestClose={() => setShowRandomModal(false)}>
        <View style={[styles.modalOverlay, { backgroundColor: colors.modalOverlay }]}>
          <View style={[styles.modalContainer, { backgroundColor: colors.modalBg }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  {t('tests.randomSettingsTitle', { defaultValue: 'Случайный блиц-квиз' })}
                </Text>
                <Text style={[styles.modalSubtitle, { color: colors.textTertiary }]}>
                  Выберите разделы для смешивания
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.modalCloseBtn, { backgroundColor: colors.inputBg }]}
                onPress={() => setShowRandomModal(false)}
              >
                <Ionicons name="close" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
              <Text style={[styles.modalFieldLabel, { color: colors.textSecondary }]}>
                {t('tests.randomSectionsLabel', { defaultValue: 'Разделы для квиза:' })}
              </Text>
              <View style={styles.chipsWrap}>
                {Object.entries(PHYSICS_SECTIONS).map(([key, section]) => {
                  const isSelected = selectedRandomSections.includes(key);
                  return (
                    <TouchableOpacity
                      key={key}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: isSelected ? '#0EA5E9' : colors.inputBg,
                          borderColor: isSelected ? '#0EA5E9' : colors.border,
                        },
                      ]}
                      onPress={() => toggleRandomSection(key)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          { color: isSelected ? '#FFFFFF' : colors.text },
                        ]}
                      >
                        {section.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={[styles.modalFieldLabel, { color: colors.textSecondary }]}>
                {t('tests.questionCountLabel', { defaultValue: 'Количество вопросов:' })}
              </Text>
              <View style={styles.countsRow}>
                {RANDOM_QUESTION_COUNTS.map((cnt) => {
                  const isSelected = selectedRandomCount === cnt;
                  return (
                    <TouchableOpacity
                      key={cnt}
                      style={[
                        styles.countPill,
                        {
                          backgroundColor: isSelected ? '#0EA5E9' : colors.inputBg,
                          borderColor: isSelected ? '#0EA5E9' : colors.border,
                        },
                      ]}
                      onPress={() => {
                        triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
                        setSelectedRandomCount(cnt);
                      }}
                    >
                      <Text
                        style={[
                          styles.countPillText,
                          { color: isSelected ? '#FFFFFF' : colors.text },
                        ]}
                      >
                        {cnt}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {randomError && (
                <View style={[styles.errorBox, { backgroundColor: colors.errorBg }]}>
                  <Ionicons name="alert-circle" size={18} color={colors.error} />
                  <Text style={[styles.errorText, { color: colors.error }]}>{randomError}</Text>
                </View>
              )}

              <TouchableOpacity
                style={[
                  styles.modalSubmitBtn,
                  (selectedRandomSections.length === 0 || isRandomizing) && styles.btnDisabled,
                ]}
                onPress={handleRandomTest}
                disabled={selectedRandomSections.length === 0 || isRandomizing}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={['#0EA5E9', '#0D9488']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.modalSubmitGradient}
                >
                  {isRandomizing ? (
                    <>
                      <ActivityIndicator color="#FFFFFF" size="small" />
                      <Text style={styles.modalSubmitText}>
                        {t('tests.randomizing', { defaultValue: 'Сборка теста...' })}
                      </Text>
                    </>
                  ) : (
                    <>
                      <Ionicons name="play" size={18} color="#FFFFFF" />
                      <Text style={styles.modalSubmitText}>
                        {t('tests.startRandomTest', { defaultValue: 'Начать тест' })}
                      </Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navBtnPlaceholder: {
    width: 40,
  },
  headerTitleWrap: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  content: {
    padding: 16,
  },
  generatorsGrid: {
    gap: 14,
    marginBottom: 24,
  },
  heroActionCard: {
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
  },
  heroActionGradient: {
    padding: 20,
  },
  heroActionTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  heroActionIconBadge: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroPillBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  heroPillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  heroActionTitle: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  heroActionSubtitle: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  heroCtaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  heroCtaLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 14,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  sectionSubtitle: {
    fontSize: 12,
    fontWeight: '600',
  },
  testsList: {
    gap: 12,
  },
  testCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 20,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  testIconGradient: {
    width: 48,
    height: 48,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  testCardInfo: {
    flex: 1,
    marginLeft: 14,
  },
  testCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 3,
  },
  testCardSub: {
    fontSize: 12,
    fontWeight: '500',
  },
  arrowCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: '800',
  },
  modalSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalFieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
    marginTop: 10,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 14,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  diffRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  diffCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    gap: 4,
  },
  diffLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  countsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  countPill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  countPillText: {
    fontSize: 14,
    fontWeight: '700',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    marginBottom: 14,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '600',
  },
  modalSubmitBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
  },
  modalSubmitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  modalSubmitText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  btnDisabled: {
    opacity: 0.5,
  },
});
