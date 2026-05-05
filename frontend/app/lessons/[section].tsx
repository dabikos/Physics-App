import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePhysicsData } from '../../src/hooks/usePhysicsData';
import { useFavorites } from '../../src/hooks/useFavorites';
import { useTheme } from '../../src/context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../src/context/AuthContext';
import api from '../../src/services/api';
export default function SectionScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { section } = useLocalSearchParams<{ section: string }>();
  const [selectedSubsection, setSelectedSubsection] = useState<string | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const { isFavorite, toggleFavorite } = useFavorites();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { PHYSICS_SECTIONS, getTopicsBySubsection } = usePhysicsData();
  const { user } = useAuth();

  // Load completed lessons on every focus (from server + local storage)
  useFocusEffect(
    useCallback(() => {
      if (user) {
        // Load from local storage first (instant)
        AsyncStorage.getItem('completed_lessons').then((val) => {
          if (val) {
            const local: string[] = JSON.parse(val);
            setCompletedLessons((prev) => {
              const merged = new Set(prev);
              local.forEach((id) => merged.add(id));
              return merged;
            });
          }
        }).catch(() => {});
        // Also load from server
        api.get('/progress').then((res) => {
          const list: string[] = res.data?.completed_lessons || [];
          setCompletedLessons((prev) => {
            const merged = new Set(prev);
            list.forEach((id) => merged.add(id));
            return merged;
          });
          // Sync server data to local
          if (list.length > 0) {
            AsyncStorage.getItem('completed_lessons').then((val) => {
              const local: string[] = val ? JSON.parse(val) : [];
              const all = [...new Set([...local, ...list])];
              AsyncStorage.setItem('completed_lessons', JSON.stringify(all));
            }).catch(() => {});
          }
        }).catch(() => {});
      }
    }, [user])
  );

  const sectionData = section ? PHYSICS_SECTIONS[section] : null;

  if (!sectionData) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Раздел не найден</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{sectionData.name}</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }} style={styles.content}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Подразделы</Text>

        {sectionData.subsections.map((subsection) => {
          const topics = getTopicsBySubsection(section!, subsection.id);
          const completedCount = topics.filter(t => completedLessons.has(t.id)).length;
          const allCompleted = completedCount === topics.length && topics.length > 0;
          
          return (
            <View key={subsection.id}>
              <TouchableOpacity
                style={[
                  styles.subsectionCard,
                  { backgroundColor: colors.card, shadowColor: colors.shadowColor },
                  selectedSubsection === subsection.id && { backgroundColor: colors.accentLight },
                ]}
                onPress={() =>
                  setSelectedSubsection(
                    selectedSubsection === subsection.id ? null : subsection.id
                  )
                }
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.subsectionDot,
                    { backgroundColor: allCompleted ? '#10B981' : sectionData.color },
                  ]}
                />
                <View style={styles.subsectionInfo}>
                  <Text style={[styles.subsectionName, { color: colors.text }]}>{subsection.name}</Text>
                  <View style={styles.subsectionMeta}>
                    <Text style={[styles.topicsCount, { color: colors.textTertiary }]}>{t('lessons.topicsCount', { count: subsection.topics.length })}</Text>
                    {completedCount > 0 && (
                      <View style={styles.completedBadge}>
                        <Text style={styles.completedBadgeText}>
                          {completedCount}/{topics.length} ✓
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
                <Ionicons
                  name={selectedSubsection === subsection.id ? 'chevron-down' : 'chevron-forward'}
                  size={20}
                  color={colors.textTertiary}
                />
              </TouchableOpacity>

              {selectedSubsection === subsection.id && (
                <View style={styles.topicsList}>
                  {topics.map((topic) => {
                    const isCompleted = completedLessons.has(topic.id);
                    const isLocked = topic.is_locked || topic.requires_pro;
                    return (
                    <TouchableOpacity
                      key={topic.id}
                      style={[
                        styles.topicCard,
                        { borderLeftColor: isCompleted ? '#10B981' : sectionData.color, backgroundColor: colors.card, shadowColor: colors.shadowColor },
                        isCompleted && { opacity: 0.65 },
                        isLocked && { opacity: 0.72 },
                      ]}
                      onPress={() => router.push(isLocked ? '/subscription' : `/lessons/topic/${topic.id}`)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.topicContent}>
                        <Text style={[styles.topicTitle, { color: colors.text }]}>{topic.title}</Text>
                        <Text style={[styles.topicBrief, { color: colors.textTertiary }]} numberOfLines={2}>
                          {topic.brief_info}
                        </Text>
                      </View>
                      {isLocked ? (
                        <View style={styles.lockBadge}>
                          <Ionicons name="lock-closed" size={16} color="#FFFFFF" />
                          <Text style={styles.lockBadgeText}>Pro</Text>
                        </View>
                      ) : isCompleted ? (
                        <Text style={styles.completedMedal}>🏅</Text>
                      ) : (
                      <TouchableOpacity
                        onPress={(e) => {
                          e.stopPropagation();
                          toggleFavorite(topic.id, 'topic');
                        }}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        style={styles.favButton}
                      >
                        <Ionicons
                          name={isFavorite(topic.id, 'topic') ? 'heart' : 'heart-outline'}
                          size={20}
                          color={isFavorite(topic.id, 'topic') ? '#EF4444' : '#D1D5DB'}
                        />
                      </TouchableOpacity>
                      )}
                    </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
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
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 20,
  },
  subsectionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  subsectionCardActive: {
    backgroundColor: '#EEF2FF',
  },
  subsectionDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  subsectionInfo: {
    flex: 1,
  },
  subsectionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  subsectionName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  topicsCount: {
    fontSize: 13,
    color: '#6B7280',
  },
  completedBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  completedBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
  },
  topicsList: {
    paddingLeft: 22,
    marginBottom: 8,
  },
  topicCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
    borderLeftWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  topicContent: {
    flex: 1,
  },
  topicTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  topicBrief: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  favButton: {
    padding: 4,
    marginLeft: 8,
  },
  lockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: '#111827',
    marginLeft: 8,
  },
  lockBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  completedMedal: {
    fontSize: 22,
    marginLeft: 8,
  },
});


