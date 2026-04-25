import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePhysicsData } from '../../../src/hooks/usePhysicsData';
import { InteractiveTask } from '../../../src/data/interactiveTasks';
import { useInteractiveTasks } from '../../../src/hooks/useInteractiveTasks';
import { useTheme } from '../../../src/context/ThemeContext';
import { useTranslation } from 'react-i18next';
export default function InteractiveTasksIndexScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const { PHYSICS_SECTIONS } = usePhysicsData();
  const { INTERACTIVE_TASKS } = useInteractiveTasks();

  const getDifficultyInfo = (difficulty: InteractiveTask['difficulty']) => {
    switch (difficulty) {
      case 'basic': return { label: t('difficulty.basic'), color: '#10B981', emoji: '🟢' };
      case 'standard': return { label: t('difficulty.standard'), color: '#F59E0B', emoji: '🟡' };
      case 'advanced': return { label: t('difficulty.advanced'), color: '#F97316', emoji: '🟠' };
      case 'olympiad': return { label: t('difficulty.olympiad'), color: '#EF4444', emoji: '🔴' };
    }
  };

  const getAnswerTypeIcon = (type: InteractiveTask['answerType']) => {
    switch (type) {
      case 'choice': return 'radio-button-on';
      case 'number': return 'keypad';
      case 'formula': return 'flask';
    }
  };

  const sections = Object.entries(PHYSICS_SECTIONS).map(([key, data]) => ({
    id: key,
    ...data,
    tasks: INTERACTIVE_TASKS.filter(t => t.section === key),
  })).filter(s => s.tasks.length > 0);

  const filteredTasks = selectedSection 
    ? INTERACTIVE_TASKS.filter(t => t.section === selectedSection)
    : INTERACTIVE_TASKS;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{t('tasks.interactiveTasks')}</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textTertiary }]}>{filteredTasks.length} {t('tasks.tasksCount')}</Text>
        </View>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}>
        {/* Фильтр по разделам */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContainer}
        >
          <TouchableOpacity
            style={[
              styles.filterChip,
              { backgroundColor: colors.card, borderColor: colors.border },
              selectedSection === null && [styles.filterChipActive, { backgroundColor: colors.chipActiveBg, borderColor: colors.chipActiveBg }],
            ]}
            onPress={() => setSelectedSection(null)}
          >
            <Text style={[
              styles.filterChipText,
              { color: colors.textSecondary },
              selectedSection === null && styles.filterChipTextActive,
            ]}>
              {t('common.all')}
            </Text>
          </TouchableOpacity>
          {sections.map((section) => (
            <TouchableOpacity
              key={section.id}
              style={[
                styles.filterChip,
                { backgroundColor: colors.card, borderColor: colors.border },
                selectedSection === section.id && styles.filterChipActive,
                selectedSection === section.id && { backgroundColor: section.color },
              ]}
              onPress={() => setSelectedSection(section.id === selectedSection ? null : section.id)}
            >
              <Ionicons 
                name={section.icon as any} 
                size={14} 
                color={selectedSection === section.id ? '#FFFFFF' : section.color} 
              />
              <Text style={[
                styles.filterChipText,
                { color: colors.textSecondary },
                selectedSection === section.id && styles.filterChipTextActive,
              ]}>
                {section.name}
              </Text>
              <View style={[
                styles.filterBadge,
                { backgroundColor: colors.inputBg },
                selectedSection === section.id && styles.filterBadgeActive,
              ]}>
                <Text style={[
                  styles.filterBadgeText,
                  { color: colors.textTertiary },
                  selectedSection === section.id && styles.filterBadgeTextActive,
                ]}>
                  {section.tasks.length}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Информационный блок */}
        <View style={[styles.infoCard, { backgroundColor: isDark ? '#3B3520' : '#FEF3C7' }]}>
          <View style={[styles.infoIconContainer, { backgroundColor: colors.card }]}>
            <Ionicons name="bulb" size={24} color="#F59E0B" />
          </View>
          <View style={styles.infoContent}>
            <Text style={[styles.infoTitle, { color: isDark ? '#FDE68A' : '#92400E' }]}>{t('tasks.howItWorks')}</Text>
            <Text style={[styles.infoText, { color: isDark ? '#FCD34D' : '#B45309' }]}>
              {t('tasks.howItWorksDesc')}
            </Text>
          </View>
        </View>

        {/* Список задач */}
        <View style={styles.tasksList}>
          {filteredTasks.map((task) => {
            const difficultyInfo = getDifficultyInfo(task.difficulty);
            const sectionData = PHYSICS_SECTIONS[task.section];
            
            return (
              <TouchableOpacity
                key={task.id}
                style={[styles.taskCard, { backgroundColor: colors.card, shadowColor: colors.shadowColor }]}
                onPress={() => router.push(`/tasks/interactive/${task.id}`)}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.taskAccent,
                  { backgroundColor: difficultyInfo.color }
                ]} />
                
                <View style={styles.taskContent}>
                  <View style={styles.taskTopRow}>
                    <View style={[
                      styles.sectionBadge,
                      { backgroundColor: sectionData.color + '15' }
                    ]}>
                      <Ionicons 
                        name={sectionData.icon as any} 
                        size={12} 
                        color={sectionData.color} 
                      />
                      <Text style={[styles.sectionBadgeText, { color: sectionData.color }]}>
                        {sectionData.name}
                      </Text>
                    </View>
                    
                    <View style={styles.taskMeta}>
                      <View style={[
                        styles.answerTypeBadge,
                      { backgroundColor: colors.inputBg || '#F3F4F6' }
                    ]}>
                        <Ionicons 
                          name={getAnswerTypeIcon(task.answerType) as any} 
                          size={12} 
                          color={colors.textTertiary} 
                        />
                      </View>
                    </View>
                  </View>
                  
                  <Text style={[styles.taskTitle, { color: colors.text }]} numberOfLines={2}>
                    {task.title}
                  </Text>
                  
                  <Text style={[styles.taskCondition, { color: colors.textTertiary }]} numberOfLines={2}>
                    {task.condition}
                  </Text>
                  
                  <View style={styles.taskBottomRow}>
                    <View style={[
                      styles.difficultyBadge,
                      { backgroundColor: difficultyInfo.color + '15' }
                    ]}>
                      <Text style={styles.difficultyEmoji}>{difficultyInfo.emoji}</Text>
                      <Text style={[styles.difficultyText, { color: difficultyInfo.color }]}>
                        {difficultyInfo.label}
                      </Text>
                    </View>
                    
                    <View style={styles.stepsIndicator}>
                      <Ionicons name="layers" size={14} color={colors.textTertiary} />
                      <Text style={[styles.stepsText, { color: colors.textTertiary }]}>{t('tasks.stepsCount', { count: task.steps.length })}</Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.taskArrow}>
                  <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

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
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  headerPlaceholder: {
    width: 44,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterChipActive: {
    backgroundColor: '#6C63FF',
    borderColor: '#6C63FF',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  filterBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  filterBadgeActive: {
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  filterBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterBadgeTextActive: {
    color: '#FFFFFF',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#FEF3C7',
    marginHorizontal: 16,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: '#B45309',
    lineHeight: 18,
  },
  tasksList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  taskCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  taskAccent: {
    width: 4,
  },
  taskContent: {
    flex: 1,
    padding: 16,
  },
  taskTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  sectionBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  taskMeta: {
    flexDirection: 'row',
    gap: 6,
  },
  answerTypeBadge: {
    width: 24,
    height: 24,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 6,
    lineHeight: 22,
  },
  taskCondition: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  taskBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  difficultyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  difficultyEmoji: {
    fontSize: 12,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  stepsIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stepsText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  taskArrow: {
    justifyContent: 'center',
    paddingRight: 12,
  },
  bottomPadding: {
    height: 40,
  },
});



















