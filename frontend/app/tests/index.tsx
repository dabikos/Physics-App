import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { usePhysicsData } from '../../src/hooks/usePhysicsData';
import { generateTest, GeneratedTest } from '../../src/services/aiService';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../src/context/ThemeContext';
import { useLanguage } from '../../src/context/LanguageContext';

type Difficulty = 'basic' | 'standard' | 'advanced' | 'olympiad';

const DIFFICULTY_DATA: { key: Difficulty; color: string; emoji: string }[] = [
  { key: 'basic', color: '#10B981', emoji: '🟢' },
  { key: 'standard', color: '#F59E0B', emoji: '🟡' },
  { key: 'advanced', color: '#F97316', emoji: '🟠' },
  { key: 'olympiad', color: '#EF4444', emoji: '🔴' },
];

const QUESTION_COUNTS = [5, 10, 15, 20];

export default function TestsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { getAILanguageName } = useLanguage();
  const { t } = useTranslation();
  const { PHYSICS_SECTIONS } = usePhysicsData();
  const DIFFICULTIES = DIFFICULTY_DATA.map(d => ({ ...d, label: t(`difficulty.${d.key}`) }));
  const [showModal, setShowModal] = useState(false);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('standard');
  const [selectedCount, setSelectedCount] = useState(10);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getIconName = (icon: string): keyof typeof Ionicons.glyphMap => {
    const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
      speedometer: 'speedometer',
      thermometer: 'thermometer',
      flash: 'flash',
      eye: 'eye',
      planet: 'planet',
    };
    return iconMap[icon] || 'checkbox';
  };

  const handleGenerateTest = async () => {
    if (!selectedSection) {
      setError(t('tests.selectSection'));
      return;
    }

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
      // Навигация на экран с AI тестом
      router.push({
        pathname: '/tests/ai-test',
        params: { testData: JSON.stringify(result.test) },
      });
    } else {
      setError(result.error || t('common.error'));
    }
  };

  const openModal = () => {
    setSelectedSection(null);
    setSelectedDifficulty('standard');
    setSelectedCount(10);
    setError(null);
    setShowModal(true);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('tests.title')}</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* Кнопка генерации AI теста */}
        <TouchableOpacity
          style={styles.generateButton}
          onPress={openModal}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#8B5CF6', '#6366F1']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.generateButtonGradient}
          >
            <View style={styles.generateButtonContent}>
              <View style={styles.generateIconContainer}>
                <Ionicons name="sparkles" size={28} color="#FFFFFF" />
              </View>
              <View style={styles.generateTextContainer}>
                <Text style={styles.generateTitle}>{t('tests.generateButton')}</Text>
                <Text style={styles.generateSubtitle}>
                  {t('tests.generateSubtitle')}
                </Text>
              </View>
              <Ionicons name="add-circle" size={32} color="rgba(255,255,255,0.9)" />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('tests.readyTests')}</Text>
        
        {Object.entries(PHYSICS_SECTIONS).map(([key, section]) => (
          <TouchableOpacity
            key={key}
            style={[styles.sectionCard, { backgroundColor: colors.card, shadowColor: colors.shadowColor }]}
            onPress={() => router.push(`/tests/${key}`)}
            activeOpacity={0.8}
          >
            <View style={[styles.iconContainer, { backgroundColor: section.color + '20' }]}>
              <Ionicons name={getIconName(section.icon)} size={28} color={section.color} />
            </View>
            <View style={styles.sectionInfo}>
              <Text style={[styles.sectionName, { color: colors.text }]}>{section.name}</Text>
              <Text style={[styles.sectionDescription, { color: colors.textTertiary }]}>{t('tests.checkKnowledge')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.textMuted} />
          </TouchableOpacity>
        ))}

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Модальное окно генерации теста */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: colors.modalOverlay }]}>
          <View style={[styles.modalContainer, { backgroundColor: colors.modalBg }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>{'🧪 ' + t('tests.settingsTitle')}</Text>
              <TouchableOpacity
                style={[styles.modalCloseButton, { backgroundColor: colors.inputBg }]}
                onPress={() => setShowModal(false)}
              >
                <Ionicons name="close" size={24} color={colors.textTertiary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Выбор раздела */}
              <Text style={[styles.modalSectionTitle, { color: colors.textSecondary }]}>{'📚 ' + t('tests.selectSection')}</Text>
              <View style={styles.optionsGrid}>
                {Object.entries(PHYSICS_SECTIONS).map(([key, section]) => (
                  <TouchableOpacity
                    key={key}
                    style={[
                      styles.optionChip,
                      { backgroundColor: colors.inputBg, borderColor: colors.border },
                      selectedSection === key && { 
                        backgroundColor: section.color,
                        borderColor: section.color,
                      },
                    ]}
                    onPress={() => setSelectedSection(key)}
                  >
                    <Text style={[
                      styles.optionChipText,
                      { color: colors.textSecondary },
                      selectedSection === key && styles.optionChipTextSelected,
                    ]}>
                      {section.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Выбор сложности */}
              <Text style={[styles.modalSectionTitle, { color: colors.textSecondary }]}>{'📊 ' + t('tests.difficultyLabel')}</Text>
              <View style={styles.difficultyOptions}>
                {DIFFICULTIES.map((diff) => (
                  <TouchableOpacity
                    key={diff.key}
                    style={[
                      styles.difficultyOption,
                      { backgroundColor: colors.cardAlt, borderColor: colors.border },
                      selectedDifficulty === diff.key && {
                        backgroundColor: diff.color + '20',
                        borderColor: diff.color,
                      },
                    ]}
                    onPress={() => setSelectedDifficulty(diff.key)}
                  >
                    <Text style={styles.difficultyEmoji}>{diff.emoji}</Text>
                    <Text style={[
                      styles.difficultyLabel,
                      { color: colors.textSecondary },
                      selectedDifficulty === diff.key && { color: diff.color },
                    ]}>
                      {diff.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Выбор количества вопросов */}
              <Text style={[styles.modalSectionTitle, { color: colors.textSecondary }]}>{'🔢 ' + t('tests.questionsCount')}</Text>
              <View style={styles.countOptions}>
                {QUESTION_COUNTS.map((count) => (
                  <TouchableOpacity
                    key={count}
                    style={[
                      styles.countOption,
                      { backgroundColor: colors.inputBg, borderColor: colors.border },
                      selectedCount === count && styles.countOptionSelected,
                    ]}
                    onPress={() => setSelectedCount(count)}
                  >
                    <Text style={[
                      styles.countText,
                      { color: colors.textSecondary },
                      selectedCount === count && styles.countTextSelected,
                    ]}>
                      {count}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Ошибка */}
              {error && (
                <View style={[styles.errorContainer, { backgroundColor: colors.errorBg }]}>
                  <Ionicons name="alert-circle" size={20} color={colors.error} />
                  <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
                </View>
              )}

              {/* Кнопка генерации */}
              <TouchableOpacity
                style={[
                  styles.generateTestButton,
                  (!selectedSection || isGenerating) && styles.generateTestButtonDisabled,
                ]}
                onPress={handleGenerateTest}
                disabled={!selectedSection || isGenerating}
              >
                {isGenerating ? (
                  <>
                    <ActivityIndicator color="#FFFFFF" size="small" />
                    <Text style={styles.generateTestButtonText}>
                      {t('tests.generating')}
                    </Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="sparkles" size={20} color="#FFFFFF" />
                    <Text style={styles.generateTestButtonText}>
                      {t('tests.createTest')}
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              {isGenerating && (
                <Text style={[styles.generatingHint, { color: colors.textTertiary }]}>
                  {t('tests.generatingSubtext')}
                </Text>
              )}
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
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  headerPlaceholder: {
    width: 44,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  generateButton: {
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  generateButtonGradient: {
    borderRadius: 20,
  },
  generateButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  generateIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  generateTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  generateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  generateSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  sectionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionInfo: {
    flex: 1,
    marginLeft: 16,
  },
  sectionName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1F2937',
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  bottomPadding: {
    height: 40,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 12,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  optionChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  optionChipTextSelected: {
    color: '#FFFFFF',
  },
  difficultyOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  difficultyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    gap: 6,
  },
  difficultyEmoji: {
    fontSize: 16,
  },
  difficultyLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  countOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  countOption: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  countOptionSelected: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  countText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  countTextSelected: {
    color: '#FFFFFF',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 12,
    marginTop: 16,
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#B91C1C',
  },
  generateTestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366F1',
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 24,
    gap: 10,
  },
  generateTestButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  generateTestButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  generatingHint: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 12,
  },
});
