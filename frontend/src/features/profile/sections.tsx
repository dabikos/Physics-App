import React from 'react'
import { View, Text, TouchableOpacity, ActivityIndicator, Animated, Switch } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import type { SupportedLanguage } from '../../config/i18n'
import { profileStyles as styles } from './styles'
import { AchievementBadge, AnimatedProgressBar, SectionProgressCard, StreakFire } from './components'

type TranslateFn = (key: string, options?: Record<string, unknown>) => string

export function GuestProfileState({
  colors,
  t,
  onLogin,
  onRegister,
  onWelcome,
}: {
  colors: any
  t: TranslateFn
  onLogin: () => void
  onRegister: () => void
  onWelcome: () => void
}) {
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('profile.title')}</Text>
      </View>

      <View style={styles.emptyState}>
        <LinearGradient colors={['rgba(102, 126, 234, 0.1)', 'rgba(118, 75, 162, 0.1)']} style={styles.emptyIconContainer}>
          <Ionicons name="person-circle" size={80} color={colors.accent} />
        </LinearGradient>

        <Text style={[styles.emptyTitle, { color: colors.text }]}>{t('auth.loginToAccount')}</Text>
        <Text style={[styles.emptySubtitle, { color: colors.textTertiary }]}>{t('auth.loginRequired')}</Text>

        <View style={styles.authButtons}>
          <TouchableOpacity style={styles.primaryButton} onPress={onLogin} activeOpacity={0.9}>
            <LinearGradient colors={['#667EEA', '#764BA2']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.primaryButtonGradient}>
              <Ionicons name="log-in" size={20} color="#FFFFFF" />
              <Text style={styles.primaryButtonText}>{t('auth.loginButton')}</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.secondaryButton, { backgroundColor: colors.card, borderColor: colors.accent }]} onPress={onRegister}>
            <Ionicons name="person-add" size={20} color={colors.accent} />
            <Text style={[styles.secondaryButtonText, { color: colors.accent }]}>{t('auth.register')}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.welcomeLink} onPress={onWelcome}>
          <Text style={[styles.welcomeLinkText, { color: colors.textTertiary }]}>{t('auth.openWelcome')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

export function LoadingProfileState({ colors, t }: { colors: any; t: TranslateFn }) {
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('profile.title')}</Text>
      </View>
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={[styles.loadingText, { color: colors.textTertiary }]}>{t('profile.loadingProfile')}</Text>
      </View>
    </SafeAreaView>
  )
}

export function StudentProfileSection({
  user,
  profileData,
  colors,
  t,
  fadeAnim,
  showAllAchievements,
  setShowAllAchievements,
  onOpenEdit,
}: {
  user: any
  profileData: any
  colors: any
  t: TranslateFn
  fadeAnim: Animated.Value
  showAllAchievements: boolean
  setShowAllAchievements: React.Dispatch<React.SetStateAction<boolean>>
  onOpenEdit: () => void
}) {
  const stats = profileData?.stats || {}
  const streak = profileData?.streak || { current: 0, max: 0 }
  const xp = profileData?.xp || 0
  const level = profileData?.level || { name: 'Новичок', icon: '🌱', progress: 0, xp_in_level: 0, xp_for_next: 100 }
  const achievements = profileData?.achievements || []
  const sectionProgress = profileData?.section_progress || []
  const unlockedAchievements = achievements.filter((item: any) => item.unlocked)
  const displayAchievements = showAllAchievements ? achievements : achievements.slice(0, 8)
  const avatar = profileData?.user?.avatar || user?.avatar || '🧑‍🎓'

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('profile.title')}</Text>
        <TouchableOpacity onPress={onOpenEdit}>
          <Ionicons name="create-outline" size={24} color={colors.accent} />
        </TouchableOpacity>
      </View>

      <View style={styles.userCardRow}>
        <View style={[styles.userCard, { backgroundColor: colors.card, shadowColor: colors.shadowColor }]}>
          <TouchableOpacity onPress={onOpenEdit}>
            <LinearGradient colors={['#667EEA', '#764BA2']} style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{avatar}</Text>
            </LinearGradient>
          </TouchableOpacity>
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: colors.text }]}>{user.name || t('profile.user')}</Text>
            <Text style={[styles.userEmail, { color: colors.textTertiary }]}>{user.email}</Text>
            {user?.grade ? (
              <View style={[styles.gradeBadge, { backgroundColor: colors.accentLight }]}>
                <Ionicons name="school" size={12} color={colors.accentText} />
                <Text style={[styles.gradeBadgeText, { color: colors.accentText }]}>{t('profile.gradeClass', { grade: user.grade })}</Text>
              </View>
            ) : null}
          </View>
        </View>
        <StreakFire streak={streak.current} />
      </View>

      <View style={[styles.levelCard, { backgroundColor: colors.card, shadowColor: colors.shadowColor }]}>
        <View style={styles.levelHeader}>
          <View style={styles.levelLeft}>
            <Text style={styles.levelIcon}>{level.icon}</Text>
            <View>
              <Text style={[styles.levelName, { color: colors.text }]}>{level.name}</Text>
              <Text style={[styles.levelXP, { color: colors.accent }]}>{xp} XP</Text>
            </View>
          </View>
          {level.next_level && (
            <View style={styles.levelRight}>
              <Text style={[styles.nextLevelText, { color: colors.textMuted }]}>→ {level.next_level}</Text>
            </View>
          )}
        </View>
        <AnimatedProgressBar progress={level.progress} color={colors.accent} height={10} />
        <Text style={[styles.levelProgressText, { color: colors.textTertiary }]}>
          {level.xp_for_next > 0 ? t('profile.xpToNext', { current: level.xp_in_level, total: level.xp_for_next }) : t('profile.maxLevel')}
        </Text>
      </View>

      <View style={styles.statsSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('profile.statistics')}</Text>
        <View style={styles.statsGrid}>
          {[
            { icon: 'book', value: stats.lessons_completed || 0, label: t('profile.lessons'), bg: colors.infoBg, color: colors.accentText },
            { icon: 'calculator', value: stats.tasks_completed || 0, label: t('profile.tasks'), bg: colors.warningBg, color: colors.warning },
            { icon: 'checkbox', value: stats.tests_completed || 0, label: t('profile.tests'), bg: colors.successBg, color: colors.success },
            { icon: 'star', value: `${stats.avg_score || 0}%`, label: t('profile.avgScore'), bg: colors.errorBg, color: colors.error },
          ].map((item) => (
            <View key={`${item.icon}-${item.label}`} style={[styles.statCard, { backgroundColor: colors.card, shadowColor: colors.shadowColor }]}>
              <View style={[styles.statIcon, { backgroundColor: item.bg }]}>
                <Ionicons name={item.icon as any} size={24} color={item.color} />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>{item.value}</Text>
              <Text style={[styles.statLabel, { color: colors.textTertiary }]}>{item.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.achievementsSection}>
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('profile.achievements')} ({unlockedAchievements.length}/{achievements.length})
          </Text>
          {achievements.length > 8 && (
            <TouchableOpacity onPress={() => setShowAllAchievements((prev) => !prev)}>
              <Text style={[styles.showAllText, { color: colors.accent }]}>
                {showAllAchievements ? t('profile.collapse') : t('profile.showAll')}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.achievementsGrid}>
          {displayAchievements.map((achievement: any, index: number) => (
            <AchievementBadge key={achievement.id} achievement={achievement} index={index} />
          ))}
        </View>
      </View>

      <View style={styles.sectionProgressArea}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('profile.sectionProgress')}</Text>
        {sectionProgress.map((section: any, index: number) => (
          <SectionProgressCard key={section.section} section={section} index={index} />
        ))}
      </View>
    </Animated.View>
  )
}

export function TeacherProfileSection({
  teacherData,
  selectedClass,
  setSelectedClass,
  selectedStudent,
  setSelectedStudent,
  studentResults,
  loadingStudentResults,
  loadStudentResults,
  colors,
  t,
}: {
  teacherData: any
  selectedClass: string | null
  setSelectedClass: React.Dispatch<React.SetStateAction<string | null>>
  selectedStudent: any
  setSelectedStudent: React.Dispatch<React.SetStateAction<any>>
  studentResults: any[]
  loadingStudentResults: boolean
  loadStudentResults: (student: any) => Promise<void>
  colors: any
  t: TranslateFn
}) {
  if (selectedStudent) {
    return (
      <View style={{ paddingHorizontal: 16, gap: 12 }}>
        <TouchableOpacity
          style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8 }}
          onPress={() => setSelectedStudent(null)}
        >
          <Ionicons name="arrow-back" size={20} color={colors.accent} />
          <Text style={{ color: colors.accent, fontSize: 15, fontWeight: '600' }}>{t('common.back')}</Text>
        </TouchableOpacity>

        <View style={[styles.resultsCard, { backgroundColor: colors.card, shadowColor: colors.shadowColor }]}>
          <Text style={{ fontSize: 36 }}>🧑‍🎓</Text>
          <Text style={[styles.userName, { color: colors.text, marginTop: 8 }]}>{selectedStudent.name || selectedStudent.email}</Text>
          <Text style={[styles.userEmail, { color: colors.textTertiary }]}>{selectedStudent.email}</Text>
          {selectedStudent.class_id && (
            <View style={[styles.gradeBadge, { backgroundColor: colors.accentLight, marginTop: 6 }]}>
              <Ionicons name="school" size={12} color={colors.accentText} />
              <Text style={[styles.gradeBadgeText, { color: colors.accentText }]}>{selectedStudent.class_id}</Text>
            </View>
          )}
          <View style={{ flexDirection: 'row', marginTop: 16, gap: 20, justifyContent: 'center' }}>
            {[
              { value: selectedStudent.total_score ?? 0, label: t('teacher.score'), color: colors.text },
              { value: selectedStudent.manual_adjustment ?? 0, label: t('teacher.adjustment'), color: colors.text },
              { value: selectedStudent.total_with_adjustment ?? 0, label: t('teacher.total'), color: colors.accent },
            ].map((item, index) => (
              <React.Fragment key={`${item.label}-${index}`}>
                {index > 0 ? <View style={{ width: 1, backgroundColor: colors.border, height: 36 }} /> : null}
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 20, fontWeight: '700', color: item.color }}>{item.value}</Text>
                  <Text style={{ fontSize: 12, color: colors.textMuted }}>{item.label}</Text>
                </View>
              </React.Fragment>
            ))}
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('teacher.testHistory')}</Text>
        {loadingStudentResults ? (
          <ActivityIndicator color={colors.accent} style={{ marginTop: 20 }} />
        ) : studentResults.length === 0 ? (
          <View style={[styles.sectionCard, { backgroundColor: colors.card, alignItems: 'center', padding: 24 }]}>
            <Ionicons name="document-text-outline" size={40} color={colors.textMuted} />
            <Text style={{ fontSize: 13, color: colors.textTertiary, marginTop: 8 }}>{t('teacher.noResults')}</Text>
          </View>
        ) : (
          studentResults.slice(0, 20).map((result: any, index: number) => {
            const score = result.score_final ?? result.score ?? 0
            const scoreColor = score >= 70 ? '#10B981' : score >= 50 ? '#F59E0B' : '#EF4444'

            return (
              <View
                key={result.id || index}
                style={[styles.sectionCard, { backgroundColor: colors.card, borderLeftWidth: 4, borderLeftColor: scoreColor }]}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.sectionName, { color: colors.text }]} numberOfLines={1}>
                      {result.test_id || t('teacher.test')}
                    </Text>
                    <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>
                      {result.created_at ? new Date(result.created_at).toLocaleDateString() : '—'}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontSize: 18, fontWeight: '700', color: scoreColor }}>{score}%</Text>
                    <Text style={{ fontSize: 11, color: colors.textMuted }}>{result.correct_count ?? '?'}/{result.total ?? '?'}</Text>
                  </View>
                </View>
              </View>
            )
          })
        )}
      </View>
    )
  }

  const allStudents = teacherData?.students || []
  const filteredStudents = selectedClass ? allStudents.filter((student: any) => student.class_id === selectedClass) : allStudents
  const sortedStudents = [...filteredStudents].sort(
    (a: any, b: any) => (b.total_with_adjustment ?? b.total_score ?? 0) - (a.total_with_adjustment ?? a.total_score ?? 0),
  )
  const displayStudents = sortedStudents.slice(0, 15)

  return (
    <>
      <View style={styles.statsSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('profile.statistics')}</Text>
        <View style={styles.statsGrid}>
          {[
            { icon: 'people', value: teacherData?.totalStudents || 0, label: t('teacher.totalStudents'), bg: colors.infoBg, color: colors.accentText },
            { icon: 'layers', value: teacherData?.totalClasses || 0, label: t('teacher.totalClasses'), bg: colors.warningBg, color: colors.warning },
            { icon: 'document-text', value: teacherData?.totalTests || 0, label: t('teacher.assignedTests'), bg: colors.successBg, color: colors.success },
            { icon: 'stats-chart', value: teacherData?.avgScore || 0, label: t('teacher.avgScore'), bg: colors.errorBg, color: colors.error },
          ].map((item) => (
            <View key={`${item.icon}-${item.label}`} style={[styles.statCard, { backgroundColor: colors.card, shadowColor: colors.shadowColor }]}>
              <View style={[styles.statIcon, { backgroundColor: item.bg }]}>
                <Ionicons name={item.icon as any} size={24} color={item.color} />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>{item.value}</Text>
              <Text style={[styles.statLabel, { color: colors.textTertiary }]}>{item.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('teacher.myClasses')}</Text>
        {!teacherData?.classes || teacherData.classes.length === 0 ? (
          <View style={[styles.sectionCard, { backgroundColor: colors.card, alignItems: 'center', padding: 24 }]}>
            <Ionicons name="school-outline" size={40} color={colors.textMuted} />
            <Text style={{ fontSize: 13, color: colors.textTertiary, marginTop: 8 }}>{t('teacher.noClasses')}</Text>
          </View>
        ) : (
          teacherData.classes.map((item: any) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.settingItem, { backgroundColor: colors.card, marginBottom: 8 }]}
              onPress={() => setSelectedClass((prev) => (prev === item.id ? null : item.id))}
              activeOpacity={0.8}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: selectedClass === item.id ? colors.accentLight : colors.infoBg }]}>
                  <Ionicons name="people" size={20} color={selectedClass === item.id ? colors.accent : colors.accentText} />
                </View>
                <View>
                  <Text style={[styles.settingText, { color: colors.text }]}>{t('teacher.classLabel', { id: item.id })}</Text>
                  <Text style={{ fontSize: 12, color: colors.textMuted }}>{t('teacher.studentsCount', { count: item.studentCount })}</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: colors.accent }}>{item.avgScore}</Text>
                  <Text style={{ fontSize: 10, color: colors.textMuted }}>{t('teacher.avgShort')}</Text>
                </View>
                <Ionicons
                  name={selectedClass === item.id ? 'checkmark-circle' : 'chevron-forward'}
                  size={18}
                  color={selectedClass === item.id ? colors.accent : colors.textMuted}
                />
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>

      <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
        <View style={[styles.sectionHeaderRow, { marginBottom: 12 }]}>
          <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>
            {selectedClass ? t('teacher.classLabel', { id: selectedClass }) : t('teacher.allStudents')}
          </Text>
          {selectedClass && (
            <TouchableOpacity onPress={() => setSelectedClass(null)}>
              <Text style={[styles.showAllText, { color: colors.accent }]}>{t('teacher.allStudents')}</Text>
            </TouchableOpacity>
          )}
        </View>

        {displayStudents.length === 0 ? (
          <View style={[styles.sectionCard, { backgroundColor: colors.card, alignItems: 'center', padding: 24 }]}>
            <Ionicons name="person-outline" size={40} color={colors.textMuted} />
            <Text style={{ fontSize: 13, color: colors.textTertiary, marginTop: 8 }}>{t('teacher.noStudents')}</Text>
          </View>
        ) : (
          displayStudents.map((student: any, index: number) => (
            <TouchableOpacity
              key={student.id}
              style={[styles.settingItem, { backgroundColor: colors.card, marginBottom: 6 }]}
              onPress={() => loadStudentResults(student)}
              activeOpacity={0.8}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: index < 3 ? '#FEF3C7' : colors.inputBg }]}>
                  <Text style={{ fontSize: 16 }}>{index < 3 ? ['🥇', '🥈', '🥉'][index] : '🧑‍🎓'}</Text>
                </View>
                <View>
                  <Text style={[styles.settingText, { color: colors.text }]} numberOfLines={1}>
                    {student.name || student.email}
                  </Text>
                  <Text style={{ fontSize: 11, color: colors.textMuted }}>{student.class_id || '—'}</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: colors.accent }}>
                  {student.total_with_adjustment ?? student.total_score ?? 0}
                </Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>

      <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
        <View style={[styles.settingItem, { backgroundColor: colors.card, gap: 12 }]}>
          <View style={[styles.settingIcon, { backgroundColor: '#DBEAFE' }]}>
            <Ionicons name="desktop-outline" size={20} color="#3B82F6" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.settingText, { color: colors.text }]}>{t('teacher.webPanel')}</Text>
            <Text style={{ fontSize: 12, color: colors.textTertiary, marginTop: 2 }}>{t('teacher.webPanelDesc')}</Text>
          </View>
        </View>
      </View>
    </>
  )
}

export function ProfileSettingsSection({
  colors,
  isDark,
  toggleTheme,
  currentLanguage,
  availableLanguages,
  changeLanguage,
  t,
  onEditProfile,
  onNotifications,
  onAbout,
}: {
  colors: any
  isDark: boolean
  toggleTheme: () => void
  currentLanguage: SupportedLanguage
  availableLanguages: { code: SupportedLanguage; nativeName: string; flag: string }[]
  changeLanguage: (code: SupportedLanguage) => Promise<void>
  t: TranslateFn
  onEditProfile: () => void
  onNotifications: () => void
  onAbout: () => void
}) {
  return (
    <View style={styles.settingsSection}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('profile.settings')}</Text>

      <TouchableOpacity style={[styles.settingItem, { backgroundColor: colors.card }]} onPress={onEditProfile}>
        <View style={styles.settingLeft}>
          <View style={[styles.settingIcon, { backgroundColor: colors.infoBg }]}>
            <Ionicons name="person" size={20} color={colors.accentText} />
          </View>
          <Text style={[styles.settingText, { color: colors.textSecondary }]}>{t('profile.editProfile')}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      </TouchableOpacity>

      <View style={[styles.settingItem, { backgroundColor: colors.card }]}>
        <View style={styles.settingLeft}>
          <View style={[styles.settingIcon, { backgroundColor: isDark ? '#1E1B4B' : '#F3E8FF' }]}>
            <Ionicons name={isDark ? 'moon' : 'sunny'} size={20} color={isDark ? '#A78BFA' : '#7C3AED'} />
          </View>
          <Text style={[styles.settingText, { color: colors.textSecondary }]}>{t('profile.darkTheme')}</Text>
        </View>
        <Switch value={isDark} onValueChange={toggleTheme} trackColor={{ false: '#D1D5DB', true: '#818CF8' }} thumbColor="#FFFFFF" />
      </View>

      <View style={[styles.settingItem, { backgroundColor: colors.card, flexDirection: 'column', alignItems: 'stretch' }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <View style={styles.settingLeft}>
            <View style={[styles.settingIcon, { backgroundColor: '#DBEAFE' }]}>
              <Ionicons name="language" size={20} color="#3B82F6" />
            </View>
            <Text style={[styles.settingText, { color: colors.textSecondary }]}>{t('profile.language')}</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {availableLanguages.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              style={[
                styles.languageOption,
                { backgroundColor: colors.inputBg, borderColor: 'transparent' },
                currentLanguage === lang.code && { borderColor: colors.accent, backgroundColor: colors.accentLight },
              ]}
              onPress={() => changeLanguage(lang.code)}
            >
              <Text style={styles.languageFlag}>{lang.flag}</Text>
              <Text
                style={[
                  styles.languageName,
                  { color: colors.textSecondary },
                  currentLanguage === lang.code && { color: colors.accent, fontWeight: '700' },
                ]}
              >
                {lang.nativeName}
              </Text>
              {currentLanguage === lang.code && <Ionicons name="checkmark-circle" size={16} color={colors.accent} />}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity style={[styles.settingItem, { backgroundColor: colors.card }]} onPress={onNotifications}>
        <View style={styles.settingLeft}>
          <View style={[styles.settingIcon, { backgroundColor: colors.warningBg }]}>
            <Ionicons name="notifications" size={20} color={colors.warning} />
          </View>
          <Text style={[styles.settingText, { color: colors.textSecondary }]}>{t('profile.notifications')}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      </TouchableOpacity>

      <TouchableOpacity style={[styles.settingItem, { backgroundColor: colors.card }]} onPress={onAbout}>
        <View style={styles.settingLeft}>
          <View style={[styles.settingIcon, { backgroundColor: colors.successBg }]}>
            <Ionicons name="information-circle" size={20} color={colors.success} />
          </View>
          <Text style={[styles.settingText, { color: colors.textSecondary }]}>{t('profile.aboutApp')}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      </TouchableOpacity>
    </View>
  )
}
