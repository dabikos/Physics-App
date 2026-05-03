import React, { useEffect, useMemo, useState } from 'react';
import {
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

import { useTheme } from '../../src/context/ThemeContext';
import { usePhysicsData } from '../../src/hooks/usePhysicsData';
import api from '../../src/services/api';

type PracticeTaskListItem = {
  id: string;
  subsection_id?: string;
};

export default function TasksSubsectionsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { section } = useLocalSearchParams<{ section: string }>();
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();
  const { PHYSICS_SECTIONS } = usePhysicsData();
  const [remoteTasks, setRemoteTasks] = useState<PracticeTaskListItem[]>([]);

  const sectionData = section ? PHYSICS_SECTIONS[section] : null;

  useEffect(() => {
    let cancelled = false;

    const loadTasks = async () => {
      if (!section) return;
      try {
        const response = await api.get('/practice/tasks', { params: { section } });
        const items = Array.isArray(response.data?.items) ? response.data.items : [];
        if (!cancelled) setRemoteTasks(items);
      } catch (error) {
        console.log('Practice tasks subsections load error:', error);
        if (!cancelled) setRemoteTasks([]);
      }
    };

    loadTasks();
    return () => {
      cancelled = true;
    };
  }, [section, i18n.language]);

  const countsBySubsection = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const item of remoteTasks) {
      if (!item.subsection_id) continue;
      counts[item.subsection_id] = (counts[item.subsection_id] || 0) + 1;
    }
    return counts;
  }, [remoteTasks]);

  if (!sectionData || !section) {
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
      <Header title={sectionData.name} onBack={() => router.back()} colors={colors} />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
      >
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('tasks.practicalTasks')}</Text>
        <Text style={[styles.sectionSubtitle, { color: colors.textTertiary }]}>
          Сначала выберите подраздел, затем задачу с полным решением.
        </Text>

        {sectionData.subsections.map((subsection) => {
          const fallbackCount = subsection.topics.length * 5;
          const taskCount = countsBySubsection[subsection.id] ?? fallbackCount;

          return (
            <TouchableOpacity
              key={subsection.id}
              style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.shadowColor }]}
              onPress={() => router.push(`/tasks/${section}/${subsection.id}`)}
              activeOpacity={0.82}
            >
              <View style={[styles.iconContainer, { backgroundColor: sectionData.color + '20' }]}>
                <Ionicons name="layers-outline" size={26} color={sectionData.color} />
              </View>
              <View style={styles.cardInfo}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>{subsection.name}</Text>
                <Text style={[styles.cardSubtitle, { color: colors.textTertiary }]}>
                  {taskCount} задач
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={22} color={colors.textMuted} />
            </TouchableOpacity>
          );
        })}
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
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 18,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 17,
    fontWeight: '600',
  },
});
