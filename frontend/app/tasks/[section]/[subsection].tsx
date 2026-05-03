import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { useTheme } from '../../../src/context/ThemeContext';
import { usePhysicsData } from '../../../src/hooks/usePhysicsData';
import api from '../../../src/services/api';

type PracticeTask = {
  id: string;
  section_id: string;
  subsection_id: string;
  topic_id?: string;
  topic_title?: string;
  title: string;
  problem_text: string;
  difficulty: 'easy' | 'medium' | 'hard' | string;
};

export default function PracticeTasksListScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { section, subsection } = useLocalSearchParams<{ section: string; subsection: string }>();
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();
  const { PHYSICS_SECTIONS } = usePhysicsData();
  const [tasks, setTasks] = useState<PracticeTask[]>([]);
  const [loading, setLoading] = useState(true);

  const sectionData = section ? PHYSICS_SECTIONS[section] : null;
  const subsectionData = sectionData?.subsections.find((item) => item.id === subsection);

  useEffect(() => {
    let cancelled = false;

    const loadTasks = async () => {
      if (!section || !subsection) return;
      setLoading(true);
      try {
        const response = await api.get('/practice/tasks', {
          params: { section, subsection },
        });
        const items = Array.isArray(response.data?.items) ? response.data.items : [];
        if (!cancelled) setTasks(items);
      } catch (error) {
        console.log('Practice tasks load error:', error);
        if (!cancelled) setTasks([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadTasks();
    return () => {
      cancelled = true;
    };
  }, [section, subsection, i18n.language]);

  const groupedTasks = useMemo(() => {
    const groups: Record<string, PracticeTask[]> = {};
    for (const task of tasks) {
      const title = task.topic_title || t('tasks.title');
      groups[title] ||= [];
      groups[title].push(task);
    }
    return Object.entries(groups);
  }, [tasks, t]);

  if (!sectionData || !section || !subsection) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
        <Header title={t('tasks.title')} onBack={() => router.back()} colors={colors} />
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: colors.textTertiary }]}>{t('common.sectionNotFound')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <Header title={subsectionData?.name || sectionData.name} onBack={() => router.back()} colors={colors} />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >
        <View style={[styles.statsContainer, { backgroundColor: colors.card }]}>
          <Text style={[styles.statsText, { color: colors.textTertiary }]}>
            {t('tasks.countSummary', { count: tasks.length })}
          </Text>
        </View>

        {loading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator color={colors.accent} />
          </View>
        ) : tasks.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textTertiary }]}>{t('tasks.tasksInDev')}</Text>
            <Text style={[styles.emptySubtext, { color: colors.textMuted }]}>{t('tasks.tasksInDevMessage')}</Text>
          </View>
        ) : (
          groupedTasks.map(([topicTitle, topicTasks]) => (
            <View key={topicTitle} style={styles.topicSection}>
              <Text style={[styles.topicTitle, { color: colors.text }]}>{topicTitle}</Text>
              {topicTasks.map((task, index) => (
                <TouchableOpacity
                  key={task.id}
                  style={[styles.taskCard, { backgroundColor: colors.card, shadowColor: colors.shadowColor }]}
                  onPress={() => router.push(`/tasks/${section}/${subsection}/${task.id}`)}
                  activeOpacity={0.78}
                >
                  <View style={[styles.taskNumber, { backgroundColor: sectionData.color + '18' }]}>
                    <Text style={[styles.taskNumberText, { color: sectionData.color }]}>{index + 1}</Text>
                  </View>
                  <View style={styles.taskInfo}>
                    <Text style={[styles.taskTitle, { color: colors.text }]} numberOfLines={2}>
                      {task.title}
                    </Text>
                    <Text style={[styles.taskSubtitle, { color: colors.textTertiary }]} numberOfLines={2}>
                      {task.problem_text}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                </TouchableOpacity>
              ))}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Header({
  title,
  onBack,
  colors,
}: {
  title: string;
  onBack: () => void;
  colors: any;
}) {
  return (
    <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Ionicons name="arrow-back" size={24} color={colors.text} />
      </TouchableOpacity>
      <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>{title}</Text>
      <View style={styles.headerPlaceholder} />
    </View>
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
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  headerPlaceholder: {
    width: 44,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statsContainer: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },
  statsText: {
    fontSize: 14,
    fontWeight: '600',
  },
  loadingState: {
    padding: 32,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 17,
    fontWeight: '700',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 6,
    textAlign: 'center',
  },
  topicSection: {
    marginBottom: 18,
  },
  topicTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 10,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  taskNumber: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  taskNumberText: {
    fontSize: 15,
    fontWeight: '800',
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  taskSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
});
