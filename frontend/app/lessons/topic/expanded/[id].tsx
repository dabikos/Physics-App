import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePhysicsData } from '../../../../src/hooks/usePhysicsData';
import { generateExpandedContent } from '../../../../src/services/aiService';
import { MathText } from '../../../../src/components/MathText';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../../src/context/ThemeContext';
import { useLanguage } from '../../../../src/context/LanguageContext';
import api from '../../../../src/services/api';
import type { TopicContent } from '../../../../src/types/physics';

const CACHE_PREFIX = 'expanded_topic_';
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 дней
export default function ExpandedTopicScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { PHYSICS_SECTIONS, getTopicById, isLoading: physicsDataLoading } = usePhysicsData();
  const [remoteTopic, setRemoteTopic] = useState<TopicContent | null>(null);
  const [topicLoading, setTopicLoading] = useState(false);
  
  const topic = remoteTopic || (id ? getTopicById(id) : null);
  const sectionInfo = topic ? PHYSICS_SECTIONS[topic.section] : null;
  const sectionColor = sectionInfo?.color || '#6C63FF';
  const sectionName = sectionInfo?.name || 'Физика';

  const [expandedContent, setExpandedContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { getAILanguageName } = useLanguage();

  useEffect(() => {
    let cancelled = false;

    const loadTopic = async () => {
      if (!id) return;
      setTopicLoading(true);
      try {
        const response = await api.get(`/topics/${id}`);
        if (!cancelled) setRemoteTopic(response.data || null);
      } catch (error) {
        console.log('Expanded topic detail load error:', error);
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

  const loadContent = useCallback(async (forceRefresh = false) => {
    if (!topic) return;
    
    setError(null);
    
    // Проверяем кэш
    if (!forceRefresh) {
      try {
        const cached = await AsyncStorage.getItem(CACHE_PREFIX + topic.id);
        if (cached) {
          const { content, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_DURATION) {
            setExpandedContent(content);
            setIsLoading(false);
            return;
          }
        }
      } catch {
        // Кэш не найден, продолжаем
      }
    }

    // Генерируем новый контент
    setIsLoading(true);

    try {
      const result = await generateExpandedContent(
        topic.title,
        topic.brief_info,
        sectionName,
        getAILanguageName(),
        topic.id
      );

      if (result.success) {
        setExpandedContent(result.content);

        // Сохраняем в кэш
        try {
          await AsyncStorage.setItem(
            CACHE_PREFIX + topic.id,
            JSON.stringify({ content: result.content, timestamp: Date.now() })
          );
        } catch {
          // Ошибка кэширования не критична
        }
      } else {
        setError(result.error || t('lessons.loadErrorMessage'));
      }
    } catch (error: any) {
      const detail = error?.response?.data?.detail;
      setError((typeof detail === 'string' ? detail : detail?.message) || error?.message || t('lessons.loadErrorMessage'));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [getAILanguageName, sectionName, t, topic]);

  useEffect(() => {
    if (topic) {
      loadContent();
    }
  }, [loadContent, topic]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadContent(true);
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
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
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
          <Text style={[styles.headerTitle, { color: colors.text }]}>{t('common.topicNotFound')}</Text>
          <View style={styles.headerPlaceholder} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
          {topic.title}
        </Text>
        <TouchableOpacity 
          style={styles.refreshButton} 
          onPress={handleRefresh}
          disabled={isLoading}
        >
          <Ionicons 
            name="refresh" 
            size={22} 
            color={isLoading ? colors.border : colors.textTertiary} 
          />
        </TouchableOpacity>
      </View>

      {/* AI Badge */}
      <View style={[styles.aiBadge, { backgroundColor: sectionColor + '15' }]}>
        <Ionicons name="sparkles" size={16} color={sectionColor} />
        <Text style={[styles.aiBadgeText, { color: sectionColor }]}>
          {t('lessons.expandedTitle')}
        </Text>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[sectionColor]}
            tintColor={sectionColor}
          />
        }
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={sectionColor} />
            <Text style={[styles.loadingText, { color: colors.text }]}>{t('lessons.aiGenerating')}</Text>
            <Text style={[styles.loadingSubtext, { color: colors.textTertiary }]}>{t('lessons.aiGeneratingSubtext')}</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="cloud-offline" size={48} color="#EF4444" />
            <Text style={[styles.errorTitle, { color: colors.text }]}>{t('lessons.loadError')}</Text>
            <Text style={[styles.errorText, { color: colors.textTertiary }]}>{error}</Text>
            <TouchableOpacity 
              style={[styles.retryButton, { backgroundColor: sectionColor }]}
              onPress={() => loadContent(true)}
            >
              <Ionicons name="refresh" size={18} color="#FFFFFF" />
              <Text style={styles.retryButtonText}>{t('common.retry')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={[styles.contentContainer, { backgroundColor: colors.card, shadowColor: colors.shadowColor }]}>
            <MathText
              content={expandedContent}
              textColor={colors.text}
              fontSize={15}
              backgroundColor={colors.card}
            />
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
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
  refreshButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 6,
  },
  aiBadgeText: {
    fontSize: 13,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginTop: 16,
  },
  loadingSubtext: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 24,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 20,
    gap: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  contentContainer: {
    margin: 12,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  bottomPadding: {
    height: 40,
  },
});


