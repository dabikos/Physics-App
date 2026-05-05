import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePhysicsData } from '../../../src/hooks/usePhysicsData';
import { VideoPlayer } from '../../../src/components/VideoPlayer';
import { MathContent } from '../../../src/components/MathContent';
import { useFavorites } from '../../../src/hooks/useFavorites';
import { useNotes } from '../../../src/hooks/useNotes';
import { useTheme } from '../../../src/context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../src/context/AuthContext';
import api from '../../../src/services/api';
import { initializeMobileAds, showLearnMoreInterstitialAd } from '../../../src/services/adService';
import type { TopicContent } from '../../../src/types/physics';

// Компонент для отображения LaTeX формулы с красивым оформлением
const BeautifulFormula: React.FC<{
  formula: string;
  index: number;
  color: string;
}> = ({ formula, index, color }) => {
  const [height, setHeight] = useState(60);
  const [loaded, setLoaded] = useState(false);

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body {
      background: transparent;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100%;
    }
    #formula {
      padding: 8px 12px;
      text-align: center;
    }
    .katex { 
      font-size: 22px !important;
      color: ${color} !important;
    }
    .katex-display {
      margin: 0 !important;
    }
  </style>
</head>
<body>
  <div id="formula"></div>
  <script>
    try {
      katex.render('${formula.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}', document.getElementById('formula'), {
        displayMode: true,
        throwOnError: false,
        errorColor: '#EF4444',
        trust: true,
        strict: false
      });
      setTimeout(() => {
        const h = document.body.scrollHeight;
        window.ReactNativeWebView.postMessage(JSON.stringify({ height: h, loaded: true }));
      }, 100);
    } catch (e) {
      document.getElementById('formula').innerHTML = '${formula}';
    }
  </script>
</body>
</html>`;

  return (
    <View style={[styles.formulaCard, { borderColor: color + '40' }]}>
      <LinearGradient
        colors={[color + '12', '#FFFFFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.formulaGradient}
      >
        {/* Номер формулы */}
        <View style={[styles.formulaNumber, { backgroundColor: color }]}>
          <Text style={styles.formulaNumberText}>{index + 1}</Text>
        </View>
        
        {/* Формула через KaTeX */}
        <View style={[styles.formulaWebViewContainer, { minHeight: height }]}>
          {!loaded && (
            <View style={styles.formulaLoader}>
              <ActivityIndicator size="small" color={color} />
            </View>
          )}
          <WebView
            source={{ html }}
            style={{ height, opacity: loaded ? 1 : 0.3, backgroundColor: 'transparent' }}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
            originWhitelist={['*']}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            onMessage={(event) => {
              try {
                const data = JSON.parse(event.nativeEvent.data);
                if (data.loaded) setLoaded(true);
                if (data.height > 0) setHeight(Math.max(50, data.height + 16));
              } catch {}
            }}
          />
        </View>
        
        {/* Декоративный элемент */}
        <View style={[styles.formulaDecor, { backgroundColor: color + '20' }]}>
          <Ionicons name="calculator-outline" size={18} color={color} />
        </View>
      </LinearGradient>
    </View>
  );
};

export default function TopicScreen() {

  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { PHYSICS_SECTIONS, getTopicById, isLoading: physicsDataLoading } = usePhysicsData();
  const [remoteTopic, setRemoteTopic] = useState<TopicContent | null>(null);
  const [topicLoading, setTopicLoading] = useState(false);
  
  const topic = remoteTopic || (id ? getTopicById(id) : null);
  const sectionColor = topic ? PHYSICS_SECTIONS[topic.section]?.color || '#6C63FF' : '#6C63FF';
  
  const { isFavorite, toggleFavorite } = useFavorites();
  const { getNote, saveNote, loading: notesLoading } = useNotes();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [noteText, setNoteText] = useState('');
  const [noteExpanded, setNoteExpanded] = useState(false);
  const [lessonCompleted, setLessonCompleted] = useState(false);
  const [completingLesson, setCompletingLesson] = useState(false);
  const [openingLearnMore, setOpeningLearnMore] = useState(false);

  useEffect(() => {
    initializeMobileAds().catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadTopic = async () => {
      if (!id) return;
      setTopicLoading(true);
      try {
        const response = await api.get(`/topics/${id}`);
        if (!cancelled) setRemoteTopic(response.data || null);
      } catch (error) {
        console.log('Topic detail load error:', error);
        if (!cancelled) setRemoteTopic(null);
      } finally {
        if (!cancelled) setTopicLoading(false);
      }
    };

    loadTopic();
    return () => {
      cancelled = true;
    };
  }, [id]);

  // Sync notes when they finish loading from server
  useEffect(() => {
    if (!notesLoading && id) {
      const serverNote = getNote(id);
      if (serverNote) {
        setNoteText(serverNote);
      }
    }
  }, [notesLoading, id, getNote]);

  // Check if lesson already completed (on every focus)
  useFocusEffect(
    useCallback(() => {
      if (id && user) {
        // Check local storage first (instant)
        AsyncStorage.getItem('completed_lessons').then((val) => {
          if (val) {
            const local: string[] = JSON.parse(val);
            if (local.includes(id)) setLessonCompleted(true);
          }
        }).catch(() => {});
        // Also check server
        api.get('/progress').then((res) => {
          const completedLessons: string[] = res.data?.completed_lessons || [];
          if (completedLessons.includes(id)) {
            setLessonCompleted(true);
          }
        }).catch(() => {});
      }
    }, [id, user])
  );

  const handleCompleteLesson = async () => {
    if (!id || lessonCompleted || completingLesson) return;
    setCompletingLesson(true);
    try {
      await api.post(`/progress/lesson/${id}`);
      setLessonCompleted(true);
      // Save locally too
      try {
        const val = await AsyncStorage.getItem('completed_lessons');
        const arr: string[] = val ? JSON.parse(val) : [];
        if (!arr.includes(id)) arr.push(id);
        await AsyncStorage.setItem('completed_lessons', JSON.stringify(arr));
      } catch {}
    } catch (e) {
      console.log('Error completing lesson:', e);
    } finally {
      setCompletingLesson(false);
    }
  };

  const handleNoteChange = (text: string) => {
    setNoteText(text);
    if (id) saveNote(id, text);
  };

  const handleLearnMorePress = async () => {
    if (!id || openingLearnMore) return;
    setOpeningLearnMore(true);
    try {
      const adShown = await showLearnMoreInterstitialAd();
      if (!adShown) {
        Alert.alert(t('common.error'), t('lessons.loadErrorMessage'));
        return;
      }
      router.push(`/lessons/topic/expanded/${id}`);
    } catch {
      Alert.alert(t('common.error'), t('lessons.loadErrorMessage'));
    } finally {
      setOpeningLearnMore(false);
    }
  };

  if (!topic && (physicsDataLoading || topicLoading)) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
        <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{t('lessons.title')}</Text>
          <View style={styles.headerPlaceholder} />
        </View>
        <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
          <ActivityIndicator color={colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  if (!topic) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
        <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{t('lessons.topicTitle')}</Text>
          <View style={styles.headerPlaceholder} />
        </View>
        <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
          <Ionicons name="document-text-outline" size={64} color={colors.border} />
          <Text style={[styles.notFoundTitle, { color: colors.text }]}>{t('common.topicNotFound')}</Text>
          <Text style={[styles.notFoundSubtitle, { color: colors.textTertiary }]}>{t('lessons.contentInDev')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const favorited = isFavorite(id!, 'topic');

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
          {topic.title}
        </Text>
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => toggleFavorite(id!, 'topic')}
        >
          <Ionicons
            name={favorited ? 'heart' : 'heart-outline'}
            size={24}
            color={favorited ? '#EF4444' : colors.textMuted}
          />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
      <ScrollView showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }} style={styles.content}>
        {/* Краткая информация */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: sectionColor + '20' }]}>
              <Ionicons name="information-circle" size={20} color={sectionColor} />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('lessons.briefInfo')}</Text>
          </View>
          <View style={[styles.sectionContent, { backgroundColor: colors.card, shadowColor: colors.shadowColor }]}>
            <MathContent content={topic.brief_info} fontSize={16} textColor={colors.textSecondary} />
          </View>
        </View>

        {/* Видеоурок */}
        {topic.video && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: '#EF444420' }]}>
                <Ionicons name="videocam" size={20} color="#EF4444" />
              </View>
              <Text style={styles.sectionTitle}>{t('lessons.videoLesson')}</Text>
            </View>
            <VideoPlayer 
              videoSource={topic.video} 
              color={sectionColor}
              useNativeControls={true}
            />
          </View>
        )}

        {/* Формулы с LaTeX */}
        {topic.formulas && topic.formulas.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: '#9B59B620' }]}>
                <Ionicons name="flask" size={20} color="#9B59B6" />
              </View>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('lessons.mainFormulas')}</Text>
              <View style={[styles.formulaCount, { backgroundColor: colors.accentLight }]}>
                <Text style={[styles.formulaCountText, { color: colors.accentText }]}>{topic.formulas.length}</Text>
              </View>
            </View>
            
            <View style={styles.formulasContainer}>
              {topic.formulas.map((formula, index) => (
                <BeautifulFormula
                  key={index}
                  formula={formula}
                  index={index}
                  color={sectionColor}
                />
              ))}
            </View>
          </View>
        )}

        {/* Пример задачи */}
        {topic.example_problem && topic.example_problem.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: '#E74C3C20' }]}>
                <Ionicons name="calculator" size={20} color="#E74C3C" />
              </View>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('lessons.exampleProblem')}</Text>
            </View>
            <View style={[styles.exampleCard, { backgroundColor: colors.card, shadowColor: colors.shadowColor }]}>
              <View style={styles.exampleHeader}>
                <Ionicons name="bulb" size={18} color="#F59E0B" />
                <Text style={styles.exampleLabel}>{t('lessons.solution')}</Text>
              </View>
              <MathContent content={topic.example_problem} fontSize={15} textColor={colors.textSecondary} />
            </View>
          </View>
        )}

        {/* Если контент в разработке */}
        {topic.brief_info === "Раздел в разработке" && (
          <View style={styles.devNotice}>
            <Ionicons name="construct" size={32} color="#F59E0B" />
            <Text style={styles.devNoticeText}>
              {t('lessons.sectionInDevMessage')}
            </Text>
          </View>
        )}

        {/* Кнопка "Изучить больше" */}
        <TouchableOpacity
          style={styles.expandButton}
          onPress={handleLearnMorePress}
          activeOpacity={0.85}
          disabled={openingLearnMore}
        >
          <LinearGradient
            colors={[sectionColor, sectionColor + 'DD']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.expandButtonGradient}
          >
            <View style={styles.expandButtonContent}>
              <View style={styles.expandButtonLeft}>
                <Ionicons name="sparkles" size={24} color="#FFFFFF" />
                <View>
                  <Text style={styles.expandButtonTitle}>{t('lessons.learnMore')}</Text>
                  <Text style={styles.expandButtonSubtitle}>
                    {t('lessons.learnMoreSubtitle')}
                  </Text>
                </View>
              </View>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Кнопка завершить урок */}
        <TouchableOpacity
          style={[
            styles.completeLessonButton,
            lessonCompleted && styles.completeLessonButtonDone,
          ]}
          onPress={handleCompleteLesson}
          disabled={lessonCompleted || completingLesson}
          activeOpacity={0.85}
        >
          {completingLesson ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : lessonCompleted ? (
            <>
              <Text style={styles.completeLessonIcon}>🏅</Text>
              <Text style={styles.completeLessonText}>{t('lessons.lessonCompleted')}</Text>
            </>
          ) : (
            <>
              <Ionicons name="checkmark-circle-outline" size={22} color="#FFFFFF" />
              <Text style={styles.completeLessonText}>{t('lessons.completeLesson')}</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Мои заметки */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.sectionHeader} 
            onPress={() => setNoteExpanded(!noteExpanded)}
            activeOpacity={0.7}
          >
            <View style={[styles.sectionIcon, { backgroundColor: '#6C63FF20' }]}>
              <Ionicons name="create" size={20} color="#6C63FF" />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('lessons.myNotes')}</Text>
            <Ionicons 
              name={noteExpanded ? 'chevron-up' : 'chevron-down'} 
              size={20} 
              color={colors.textMuted} 
            />
          </TouchableOpacity>
          {noteExpanded && (
            <View style={[styles.noteContainer, { backgroundColor: colors.card, shadowColor: colors.shadowColor }]}>
              <TextInput
                style={[styles.noteInput, { color: colors.textSecondary }]}
                placeholder={t('lessons.notesPlaceholder')}
                placeholderTextColor={colors.textMuted}
                multiline
                value={noteText}
                onChangeText={handleNoteChange}
                textAlignVertical="top"
              />
              {noteText.length > 0 && (
                <Text style={styles.noteSaved}>{t('lessons.autoSaved')}</Text>
              )}
            </View>
          )}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    padding: 24,
  },
  notFoundTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
  },
  notFoundSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
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
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    marginHorizontal: 8,
  },
  headerPlaceholder: {
    width: 44,
  },
  favoriteButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 10,
  },
  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  formulaCount: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  formulaCountText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6366F1',
  },
  sectionContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  briefText: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 24,
  },
  
  // Formulas
  formulasContainer: {
    gap: 12,
  },
  formulaCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    backgroundColor: '#FFFFFF',
  },
  formulaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    minHeight: 70,
  },
  formulaNumber: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formulaNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  formulaWebViewContainer: {
    flex: 1,
    marginHorizontal: 12,
    position: 'relative',
  },
  formulaLoader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  formulaDecor: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Example card
  exampleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  exampleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  exampleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
  },
  exampleText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
  },

  devNotice: {
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  devNoticeText: {
    fontSize: 14,
    color: '#92400E',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 20,
  },
  expandButton: {
    marginTop: 8,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  expandButtonGradient: {
    borderRadius: 16,
  },
  expandButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
  },
  expandButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  expandButtonTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  expandButtonSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 2,
  },
  bottomPadding: {
    height: 40,
  },
  completeLessonButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#10B981',
    borderRadius: 16,
    paddingVertical: 16,
    marginTop: 16,
    marginBottom: 8,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  completeLessonButtonDone: {
    backgroundColor: '#6B7280',
    shadowOpacity: 0,
    elevation: 0,
  },
  completeLessonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  completeLessonIcon: {
    fontSize: 22,
  },
  noteContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  noteInput: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
    minHeight: 100,
    maxHeight: 200,
  },
  noteSaved: {
    fontSize: 12,
    color: '#10B981',
    marginTop: 8,
    textAlign: 'right',
    fontWeight: '500',
  },
});

