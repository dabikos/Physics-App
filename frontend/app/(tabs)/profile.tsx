import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Animated,
  Modal,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Switch,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';
import { useLanguage } from '../../src/context/LanguageContext';
import { useTranslation } from 'react-i18next';
import api from '../../src/services/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ==================== Animated Progress Bar ====================
const AnimatedProgressBar: React.FC<{ progress: number; color: string; delay?: number; height?: number }> = ({ 
  progress, 
  color, 
  delay = 0,
  height = 8,
}) => {
  const { colors } = useTheme();
  const animatedWidth = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    const timeout = setTimeout(() => {
      Animated.timing(animatedWidth, {
        toValue: progress,
        duration: 800,
        useNativeDriver: false,
      }).start();
    }, delay);
    return () => clearTimeout(timeout);
  }, [progress]);

  return (
    <View style={[styles.progressBarContainer, { height, backgroundColor: colors.border }]}>
      <Animated.View 
        style={[
          styles.progressBar, 
          { 
            height,
            width: animatedWidth.interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%'],
            }), 
            backgroundColor: color 
          }
        ]} 
      />
    </View>
  );
};

// ==================== Streak Fire Component ====================
const StreakFire: React.FC<{ streak: number }> = ({ streak }) => {
  const { i18n } = useTranslation();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();

    if (streak > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [streak]);

  return (
    <Animated.View style={[styles.streakContainer, { transform: [{ scale: scaleAnim }] }]}>
      <LinearGradient
        colors={streak > 0 ? ['#FF6B35', '#FF4500', '#DC143C'] : ['#9CA3AF', '#6B7280']}
        style={styles.streakGradient}
      >
        <Animated.Text style={[styles.streakEmoji, { transform: [{ scale: pulseAnim }] }]}>
          🔥
        </Animated.Text>
        <Text style={styles.streakNumber}>{streak}</Text>
        <Text style={styles.streakLabel}>
          {streak === 1 ? i18n.t('profile.day') : streak >= 2 && streak <= 4 ? i18n.t('profile.days2_4') : i18n.t('profile.days5_20')}
        </Text>
      </LinearGradient>
    </Animated.View>
  );
};

// ==================== Achievement Badge ====================
const AchievementBadge: React.FC<{ achievement: any; index: number }> = ({ achievement, index }) => {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 40,
      friction: 6,
      delay: index * 80,
      useNativeDriver: true,
    }).start();

    if (achievement.is_new) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
          Animated.timing(glowAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    }
  }, []);

  return (
    <Animated.View style={[
      styles.achievementBadge,
      { 
        backgroundColor: colors.card,
        transform: [{ scale: scaleAnim }],
        opacity: achievement.unlocked ? 1 : 0.4,
      }
    ]}>
      {achievement.is_new && (
        <Animated.View style={[styles.achievementGlow, { opacity: glowAnim }]} />
      )}
      <Text style={styles.achievementIcon}>{achievement.icon}</Text>
      <Text style={[styles.achievementName, { color: colors.textSecondary }, !achievement.unlocked && { color: colors.textMuted }]} numberOfLines={1}>
        {achievement.name}
      </Text>
      {achievement.is_new && (
        <View style={styles.newBadge}>
          <Text style={styles.newBadgeText}>NEW</Text>
        </View>
      )}
    </Animated.View>
  );
};

// ==================== Section Progress Card ====================
const SectionProgressCard: React.FC<{ section: any; index: number }> = ({ section, index }) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  return (
    <View style={[styles.sectionCard, { backgroundColor: colors.card }]}>
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionDot, { backgroundColor: section.color }]} />
        <Text style={[styles.sectionName, { color: colors.text }]}>{section.name}</Text>
        <Text style={[styles.sectionPercent, { color: section.color }]}>{section.percentage}%</Text>
      </View>
      <AnimatedProgressBar progress={section.percentage} color={section.color} delay={index * 100} />
      <Text style={[styles.sectionSubtext, { color: colors.textMuted }]}>
        {t('profile.topicsOf', { completed: section.completed, total: section.total })}
      </Text>
    </View>
  );
};

// ==================== Edit Profile Modal ====================
const EditProfileModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  user: any;
  onSave: (data: { name?: string; avatar?: string; grade?: string }) => void;
}> = ({ visible, onClose, user, onSave }) => {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState(user?.name || '');
  const [grade, setGrade] = useState(user?.grade || '');
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || '🧑‍🎓');

  const avatars = ['🧑‍🎓', '👨‍🔬', '👩‍🔬', '🧑‍💻', '🦸', '🧙', '🧑‍🚀', '🤖', '🦊', '🐱', '🐸', '🦉'];

  const handleSave = () => {
    onSave({ name: name.trim() || undefined, avatar: selectedAvatar, grade: grade.trim() || undefined });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.card, paddingBottom: 24 + insets.bottom }]}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScrollContent}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{t('profile.editProfile')}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close-circle" size={28} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Avatar Selection */}
          <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>{t('profile.avatar')}</Text>
          <View style={styles.avatarGrid}>
            {avatars.map((av) => (
              <TouchableOpacity
                key={av}
                style={[styles.avatarOption, { backgroundColor: colors.inputBg, borderColor: 'transparent' }, selectedAvatar === av && { borderColor: colors.accent, backgroundColor: colors.accentLight }]}
                onPress={() => setSelectedAvatar(av)}
              >
                <Text style={styles.avatarOptionText}>{av}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Name */}
          <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>{t('profile.nameLabel')}</Text>
          <TextInput
            style={[styles.modalInput, { backgroundColor: colors.inputBg, color: colors.text }]}
            value={name}
            onChangeText={setName}
            placeholder={t('profile.namePlaceholder')}
            placeholderTextColor={colors.textMuted}
          />

          {/* Grade */}
          <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>{t('profile.gradeLabel')}</Text>
          <TextInput
            style={[styles.modalInput, { backgroundColor: colors.inputBg, color: colors.text }]}
            value={grade}
            onChangeText={setGrade}
            placeholder={t('profile.gradePlaceholder')}
            placeholderTextColor={colors.textMuted}
          />

          <TouchableOpacity style={styles.modalSaveButton} onPress={handleSave} activeOpacity={0.9}>
            <LinearGradient
              colors={['#667EEA', '#764BA2']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.modalSaveGradient}
            >
              <Text style={styles.modalSaveText}>{t('common.save')}</Text>
            </LinearGradient>
          </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// ==================== Main Profile Screen ====================
export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut, updateUser } = useAuth();
  const { colors, isDark, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { currentLanguage, changeLanguage, availableLanguages } = useLanguage();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [showAllAchievements, setShowAllAchievements] = useState(false);

  // Teacher data states
  const [teacherData, setTeacherData] = useState<any>(null);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [studentResults, setStudentResults] = useState<any[]>([]);
  const [loadingStudentResults, setLoadingStudentResults] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const fetchProfileStats = useCallback(async () => {
    try {
      const response = await api.get('/profile/stats');
      setProfileData(response.data);
      // Sync user data from backend (avatar, name, grade)
      if (response.data?.user) {
        const u = response.data.user;
        await updateUser({
          name: u.name,
          avatar: u.avatar,
          grade: u.grade,
        });
      }
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    } catch (error) {
      console.log('Profile stats error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const fetchTeacherData = useCallback(async () => {
    try {
      const [classesRes, studentsRes, testsRes] = await Promise.all([
        api.get('/teacher/classes'),
        api.get('/teacher/students'),
        api.get('/teacher/tests'),
      ]);
      const classes = classesRes.data?.classes || [];
      const allStudents = Array.isArray(studentsRes.data) ? studentsRes.data : [];
      const tests = Array.isArray(testsRes.data) ? testsRes.data : [];
      const classStats = classes.map((classId: string) => {
        const cs = allStudents.filter((s: any) => s.class_id === classId);
        const scores = cs.map((s: any) => s.total_with_adjustment ?? s.total_score ?? 0);
        const avg = scores.length > 0 ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length) : 0;
        return { id: classId, studentCount: cs.length, avgScore: avg };
      });
      const allScores = allStudents.map((s: any) => s.total_with_adjustment ?? s.total_score ?? 0);
      const avgScore = allScores.length > 0 ? Math.round(allScores.reduce((a: number, b: number) => a + b, 0) / allScores.length) : 0;
      setTeacherData({ classes: classStats, students: allStudents, tests, totalStudents: allStudents.length, totalClasses: classes.length, totalTests: tests.length, avgScore });
    } catch (error) {
      console.log('Teacher data error:', error);
    }
  }, []);

  const loadStudentResults = async (student: any) => {
    setSelectedStudent(student);
    setLoadingStudentResults(true);
    try {
      const res = await api.get(`/teacher/students/${student.id}/results`);
      setStudentResults(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      setStudentResults([]);
    } finally {
      setLoadingStudentResults(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProfileStats();
      if (user.role === 'teacher') fetchTeacherData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProfileStats();
    if (user?.role === 'teacher') fetchTeacherData();
  };

  const handleLogout = () => {
    Alert.alert(t('auth.logoutTitle'), t('auth.logoutConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('auth.logoutTitle'),
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/(auth)/welcome');
        },
      },
    ]);
  };

  const handleProfileUpdate = async (data: { name?: string; avatar?: string; grade?: string }) => {
    try {
      const response = await api.patch('/profile/update', data);
      // Immediately update local user context
      if (response.data?.user) {
        const u = response.data.user;
        await updateUser({
          name: u.name || data.name,
          avatar: u.avatar || data.avatar,
          grade: u.grade || data.grade,
        });
      } else {
        await updateUser(data);
      }
      fetchProfileStats();
    } catch (error) {
      Alert.alert(t('common.error'), t('profile.updateError'));
    }
  };

  const isTeacher = user?.role === 'teacher';

  const renderTeacherContent = () => {
    if (selectedStudent) {
      return (
        <View style={{ paddingHorizontal: 16, gap: 12 }}>
          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8 }}
            onPress={() => { setSelectedStudent(null); setStudentResults([]); }}
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
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text }}>{selectedStudent.total_score ?? 0}</Text>
                <Text style={{ fontSize: 12, color: colors.textMuted }}>{t('teacher.score')}</Text>
              </View>
              <View style={{ width: 1, backgroundColor: colors.border, height: 36 }} />
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text }}>{selectedStudent.manual_adjustment ?? 0}</Text>
                <Text style={{ fontSize: 12, color: colors.textMuted }}>{t('teacher.adjustment')}</Text>
              </View>
              <View style={{ width: 1, backgroundColor: colors.border, height: 36 }} />
              <View style={{ alignItems: 'center' }}>
                <Text style={{ fontSize: 20, fontWeight: '700', color: colors.accent }}>{selectedStudent.total_with_adjustment ?? 0}</Text>
                <Text style={{ fontSize: 12, color: colors.textMuted }}>{t('teacher.total')}</Text>
              </View>
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
            studentResults.slice(0, 20).map((r: any, i: number) => {
              const score = r.score_final ?? r.score ?? 0;
              const scoreColor = score >= 70 ? '#10B981' : score >= 50 ? '#F59E0B' : '#EF4444';
              return (
                <View key={r.id || i} style={[styles.sectionCard, { backgroundColor: colors.card, borderLeftWidth: 4, borderLeftColor: scoreColor }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.sectionName, { color: colors.text }]} numberOfLines={1}>{r.test_id || t('teacher.test')}</Text>
                      <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>
                        {r.created_at ? new Date(r.created_at).toLocaleDateString() : '—'}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ fontSize: 18, fontWeight: '700', color: scoreColor }}>{score}%</Text>
                      <Text style={{ fontSize: 11, color: colors.textMuted }}>{r.correct_count ?? '?'}/{r.total ?? '?'}</Text>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>
      );
    }

    return (
      <>
        {/* Teacher Quick Stats */}
        <View style={styles.statsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('profile.statistics')}</Text>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: colors.card, shadowColor: colors.shadowColor }]}>
              <View style={[styles.statIcon, { backgroundColor: colors.infoBg }]}>
                <Ionicons name="people" size={24} color={colors.accentText} />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>{teacherData?.totalStudents || 0}</Text>
              <Text style={[styles.statLabel, { color: colors.textTertiary }]}>{t('teacher.totalStudents')}</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.card, shadowColor: colors.shadowColor }]}>
              <View style={[styles.statIcon, { backgroundColor: colors.warningBg }]}>
                <Ionicons name="layers" size={24} color={colors.warning} />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>{teacherData?.totalClasses || 0}</Text>
              <Text style={[styles.statLabel, { color: colors.textTertiary }]}>{t('teacher.totalClasses')}</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.card, shadowColor: colors.shadowColor }]}>
              <View style={[styles.statIcon, { backgroundColor: colors.successBg }]}>
                <Ionicons name="document-text" size={24} color={colors.success} />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>{teacherData?.totalTests || 0}</Text>
              <Text style={[styles.statLabel, { color: colors.textTertiary }]}>{t('teacher.assignedTests')}</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.card, shadowColor: colors.shadowColor }]}>
              <View style={[styles.statIcon, { backgroundColor: colors.errorBg }]}>
                <Ionicons name="stats-chart" size={24} color={colors.error} />
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>{teacherData?.avgScore || 0}</Text>
              <Text style={[styles.statLabel, { color: colors.textTertiary }]}>{t('teacher.avgScore')}</Text>
            </View>
          </View>
        </View>

        {/* My Classes */}
        <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('teacher.myClasses')}</Text>
          {(!teacherData?.classes || teacherData.classes.length === 0) ? (
            <View style={[styles.sectionCard, { backgroundColor: colors.card, alignItems: 'center', padding: 24 }]}>
              <Ionicons name="school-outline" size={40} color={colors.textMuted} />
              <Text style={{ fontSize: 13, color: colors.textTertiary, marginTop: 8 }}>{t('teacher.noClasses')}</Text>
            </View>
          ) : (
            teacherData.classes.map((cls: any) => (
              <TouchableOpacity
                key={cls.id}
                style={[styles.settingItem, { backgroundColor: colors.card, marginBottom: 8 }]}
                onPress={() => setSelectedClass(selectedClass === cls.id ? null : cls.id)}
                activeOpacity={0.8}
              >
                <View style={styles.settingLeft}>
                  <View style={[styles.settingIcon, { backgroundColor: selectedClass === cls.id ? colors.accentLight : colors.infoBg }]}>
                    <Ionicons name="people" size={20} color={selectedClass === cls.id ? colors.accent : colors.accentText} />
                  </View>
                  <View>
                    <Text style={[styles.settingText, { color: colors.text }]}>{t('teacher.classLabel', { id: cls.id })}</Text>
                    <Text style={{ fontSize: 12, color: colors.textMuted }}>{t('teacher.studentsCount', { count: cls.studentCount })}</Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontSize: 16, fontWeight: '700', color: colors.accent }}>{cls.avgScore}</Text>
                    <Text style={{ fontSize: 10, color: colors.textMuted }}>{t('teacher.avgShort')}</Text>
                  </View>
                  <Ionicons name={selectedClass === cls.id ? 'checkmark-circle' : 'chevron-forward'} size={18} color={selectedClass === cls.id ? colors.accent : colors.textMuted} />
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Students List */}
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
          {(() => {
            const students = teacherData?.students || [];
            const filtered = selectedClass ? students.filter((s: any) => s.class_id === selectedClass) : students;
            const sorted = [...filtered].sort((a: any, b: any) => (b.total_with_adjustment ?? b.total_score ?? 0) - (a.total_with_adjustment ?? a.total_score ?? 0));
            const display = sorted.slice(0, 15);
            if (display.length === 0) {
              return (
                <View style={[styles.sectionCard, { backgroundColor: colors.card, alignItems: 'center', padding: 24 }]}>
                  <Ionicons name="person-outline" size={40} color={colors.textMuted} />
                  <Text style={{ fontSize: 13, color: colors.textTertiary, marginTop: 8 }}>{t('teacher.noStudents')}</Text>
                </View>
              );
            }
            return display.map((student: any, i: number) => (
              <TouchableOpacity
                key={student.id}
                style={[styles.settingItem, { backgroundColor: colors.card, marginBottom: 6 }]}
                onPress={() => loadStudentResults(student)}
                activeOpacity={0.8}
              >
                <View style={styles.settingLeft}>
                  <View style={[styles.settingIcon, { backgroundColor: i < 3 ? '#FEF3C7' : colors.inputBg }]}>
                    <Text style={{ fontSize: 16 }}>{i < 3 ? ['🥇', '🥈', '🥉'][i] : '🧑‍🎓'}</Text>
                  </View>
                  <View>
                    <Text style={[styles.settingText, { color: colors.text }]} numberOfLines={1}>{student.name || student.email}</Text>
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
            ));
          })()}
        </View>

        {/* Web Panel Notice */}
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
    );
  };

  // ===== Not logged in =====
  if (!user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{t('profile.title')}</Text>
        </View>
        
        <View style={styles.emptyState}>
          <LinearGradient
            colors={['rgba(102, 126, 234, 0.1)', 'rgba(118, 75, 162, 0.1)']}
            style={styles.emptyIconContainer}
          >
            <Ionicons name="person-circle" size={80} color={colors.accent} />
          </LinearGradient>
          
          <Text style={[styles.emptyTitle, { color: colors.text }]}>{t('auth.loginToAccount')}</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textTertiary }]}>
            {t('auth.loginRequired')}
          </Text>
          
          <View style={styles.authButtons}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.push('/(auth)/login')}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#667EEA', '#764BA2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.primaryButtonGradient}
              >
                <Ionicons name="log-in" size={20} color="#FFFFFF" />
                <Text style={styles.primaryButtonText}>{t('auth.loginButton')}</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.secondaryButton, { backgroundColor: colors.card, borderColor: colors.accent }]}
              onPress={() => router.push('/(auth)/register')}
            >
              <Ionicons name="person-add" size={20} color={colors.accent} />
              <Text style={[styles.secondaryButtonText, { color: colors.accent }]}>{t('auth.register')}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.welcomeLink}
            onPress={() => router.push('/(auth)/welcome')}
          >
            <Text style={[styles.welcomeLinkText, { color: colors.textTertiary }]}>{t('auth.openWelcome')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ===== Loading =====
  if (loading) {
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
    );
  }

  const stats = profileData?.stats || {};
  const streak = profileData?.streak || { current: 0, max: 0 };
  const xp = profileData?.xp || 0;
  const level = profileData?.level || { name: 'Новичок', icon: '🌱', progress: 0, xp_in_level: 0, xp_for_next: 100 };
  const achievements = profileData?.achievements || [];
  const sectionProgress = profileData?.section_progress || [];

  const unlockedAchievements = achievements.filter((a: any) => a.unlocked);
  const lockedAchievements = achievements.filter((a: any) => !a.unlocked);
  const displayAchievements = showAllAchievements ? achievements : achievements.slice(0, 8);

  const avatar = profileData?.user?.avatar || user?.avatar || '🧑‍🎓';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.accent]} />}
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>{t('profile.title')}</Text>
            <TouchableOpacity onPress={() => setEditModalVisible(true)}>
              <Ionicons name="create-outline" size={24} color={colors.accent} />
            </TouchableOpacity>
          </View>

          {/* ============ User Card + Streak ============ */}
          <View style={styles.userCardRow}>
            <View style={[styles.userCard, { backgroundColor: colors.card, shadowColor: colors.shadowColor }]}>
              <TouchableOpacity onPress={() => setEditModalVisible(true)}>
                <LinearGradient
                  colors={['#667EEA', '#764BA2']}
                  style={styles.avatarCircle}
                >
                  <Text style={styles.avatarText}>{avatar}</Text>
                </LinearGradient>
              </TouchableOpacity>
              <View style={styles.userInfo}>
                <Text style={[styles.userName, { color: colors.text }]}>{user.name || t('profile.user')}</Text>
                <Text style={[styles.userEmail, { color: colors.textTertiary }]}>{user.email}</Text>
                {isTeacher ? (
                  <View style={[styles.gradeBadge, { backgroundColor: '#DBEAFE' }]}>
                    <Ionicons name="school" size={12} color="#3B82F6" />
                    <Text style={[styles.gradeBadgeText, { color: '#3B82F6' }]}>{t('teacher.role')}</Text>
                  </View>
                ) : user?.grade ? (
                  <View style={[styles.gradeBadge, { backgroundColor: colors.accentLight }]}>
                    <Ionicons name="school" size={12} color={colors.accentText} />
                    <Text style={[styles.gradeBadgeText, { color: colors.accentText }]}>{t('profile.gradeClass', { grade: user.grade })}</Text>
                  </View>
                ) : null}
              </View>
            </View>
            {!isTeacher && <StreakFire streak={streak.current} />}
          </View>

          {!isTeacher && (
          <>
          {/* ============ Level / XP ============ */}
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
            <AnimatedProgressBar 
              progress={level.progress} 
              color={colors.accent} 
              height={10} 
            />
            <Text style={[styles.levelProgressText, { color: colors.textTertiary }]}>
              {level.xp_for_next > 0 
                ? t('profile.xpToNext', { current: level.xp_in_level, total: level.xp_for_next })
                : t('profile.maxLevel')
              }
            </Text>
          </View>

          {/* ============ Statistics Grid ============ */}
          <View style={styles.statsSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('profile.statistics')}</Text>
            <View style={styles.statsGrid}>
              <View style={[styles.statCard, { backgroundColor: colors.card, shadowColor: colors.shadowColor }]}>
                <View style={[styles.statIcon, { backgroundColor: colors.infoBg }]}>
                  <Ionicons name="book" size={24} color={colors.accentText} />
                </View>
                <Text style={[styles.statValue, { color: colors.text }]}>{stats.lessons_completed || 0}</Text>
                <Text style={[styles.statLabel, { color: colors.textTertiary }]}>{t('profile.lessons')}</Text>
              </View>
              
              <View style={[styles.statCard, { backgroundColor: colors.card, shadowColor: colors.shadowColor }]}>
                <View style={[styles.statIcon, { backgroundColor: colors.warningBg }]}>
                  <Ionicons name="calculator" size={24} color={colors.warning} />
                </View>
                <Text style={[styles.statValue, { color: colors.text }]}>{stats.tasks_completed || 0}</Text>
                <Text style={[styles.statLabel, { color: colors.textTertiary }]}>{t('profile.tasks')}</Text>
              </View>
              
              <View style={[styles.statCard, { backgroundColor: colors.card, shadowColor: colors.shadowColor }]}>
                <View style={[styles.statIcon, { backgroundColor: colors.successBg }]}>
                  <Ionicons name="checkbox" size={24} color={colors.success} />
                </View>
                <Text style={[styles.statValue, { color: colors.text }]}>{stats.tests_completed || 0}</Text>
                <Text style={[styles.statLabel, { color: colors.textTertiary }]}>{t('profile.tests')}</Text>
              </View>
              
              <View style={[styles.statCard, { backgroundColor: colors.card, shadowColor: colors.shadowColor }]}>
                <View style={[styles.statIcon, { backgroundColor: colors.errorBg }]}>
                  <Ionicons name="star" size={24} color={colors.error} />
                </View>
                <Text style={[styles.statValue, { color: colors.text }]}>{stats.avg_score || 0}%</Text>
                <Text style={[styles.statLabel, { color: colors.textTertiary }]}>{t('profile.avgScore')}</Text>
              </View>
            </View>
          </View>

          {/* ============ Achievements ============ */}
          <View style={styles.achievementsSection}>
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {t('profile.achievements')} ({unlockedAchievements.length}/{achievements.length})
              </Text>
              {achievements.length > 8 && (
                <TouchableOpacity onPress={() => setShowAllAchievements(!showAllAchievements)}>
                  <Text style={[styles.showAllText, { color: colors.accent }]}>
                    {showAllAchievements ? t('profile.collapse') : t('profile.showAll')}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.achievementsGrid}>
              {displayAchievements.map((ach: any, i: number) => (
                <AchievementBadge key={ach.id} achievement={ach} index={i} />
              ))}
            </View>
          </View>

          {/* ============ Section Progress ============ */}
          <View style={styles.sectionProgressArea}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('profile.sectionProgress')}</Text>
            {sectionProgress.map((section: any, i: number) => (
              <SectionProgressCard key={section.section} section={section} index={i} />
            ))}
          </View>
          </>
          )}

          {isTeacher && renderTeacherContent()}

          {/* ============ Settings ============ */}
          <View style={styles.settingsSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('profile.settings')}</Text>
            
            <TouchableOpacity style={[styles.settingItem, { backgroundColor: colors.card }]} onPress={() => setEditModalVisible(true)}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: colors.infoBg }]}>
                  <Ionicons name="person" size={20} color={colors.accentText} />
                </View>
                <Text style={[styles.settingText, { color: colors.textSecondary }]}>{t('profile.editProfile')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </TouchableOpacity>

            {/* Dark Mode Toggle */}
            <View style={[styles.settingItem, { backgroundColor: colors.card }]}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: isDark ? '#1E1B4B' : '#F3E8FF' }]}>
                  <Ionicons name={isDark ? 'moon' : 'sunny'} size={20} color={isDark ? '#A78BFA' : '#7C3AED'} />
                </View>
                <Text style={[styles.settingText, { color: colors.textSecondary }]}>{t('profile.darkTheme')}</Text>
              </View>
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: '#D1D5DB', true: '#818CF8' }}
                thumbColor={isDark ? '#FFFFFF' : '#FFFFFF'}
              />
            </View>

            {/* Language Selector */}
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
                    <Text style={[
                      styles.languageName,
                      { color: colors.textSecondary },
                      currentLanguage === lang.code && { color: colors.accent, fontWeight: '700' },
                    ]}>{lang.nativeName}</Text>
                    {currentLanguage === lang.code && (
                      <Ionicons name="checkmark-circle" size={16} color={colors.accent} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <TouchableOpacity style={[styles.settingItem, { backgroundColor: colors.card }]} onPress={() => router.push('/notifications')}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: colors.warningBg }]}>
                  <Ionicons name="notifications" size={20} color={colors.warning} />
                </View>
                <Text style={[styles.settingText, { color: colors.textSecondary }]}>{t('profile.notifications')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.settingItem, { backgroundColor: colors.card }]} onPress={() => router.push('/about')}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: colors.successBg }]}>
                  <Ionicons name="information-circle" size={20} color={colors.success} />
                </View>
                <Text style={[styles.settingText, { color: colors.textSecondary }]}>{t('profile.aboutApp')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Logout */}
          <TouchableOpacity style={[styles.logoutButton, { backgroundColor: colors.errorBg }]} onPress={handleLogout}>
            <Ionicons name="log-out" size={20} color={colors.error} />
            <Text style={[styles.logoutText, { color: colors.error }]}>{t('auth.logout')}</Text>
          </TouchableOpacity>

          <View style={styles.bottomPadding} />
        </Animated.View>
      </ScrollView>

      <EditProfileModal
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        user={user}
        onSave={handleProfileUpdate}
      />
    </SafeAreaView>
  );
}

// ==================== Styles ====================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#6B7280',
  },

  // Empty state
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyIconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  authButtons: {
    marginTop: 32,
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#667EEA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#667EEA',
    gap: 10,
  },
  secondaryButtonText: {
    color: '#667EEA',
    fontSize: 17,
    fontWeight: '600',
  },
  welcomeLink: {
    marginTop: 24,
    padding: 12,
  },
  welcomeLinkText: {
    fontSize: 14,
    color: '#6B7280',
  },

  // User Card + Streak Row
  userCardRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    alignItems: 'stretch',
  },
  userCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    gap: 14,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 28,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  userEmail: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  gradeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 4,
    gap: 4,
    alignSelf: 'flex-start',
  },
  gradeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6366F1',
  },

  // Streak
  streakContainer: {
    width: 90,
  },
  streakGradient: {
    flex: 1,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  streakEmoji: {
    fontSize: 28,
  },
  streakNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  streakLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    marginTop: -2,
  },

  // Level Card
  levelCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  levelLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  levelIcon: {
    fontSize: 36,
  },
  levelName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  levelXP: {
    fontSize: 14,
    color: '#667EEA',
    fontWeight: '600',
  },
  levelRight: {},
  nextLevelText: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  levelProgressText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 6,
    textAlign: 'center',
  },

  // Stats
  statsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },

  // Achievements
  achievementsSection: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  showAllText: {
    fontSize: 14,
    color: '#667EEA',
    fontWeight: '600',
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  achievementBadge: {
    width: (SCREEN_WIDTH - 32 - 30) / 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  achievementGlow: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  achievementIcon: {
    fontSize: 26,
    marginBottom: 4,
  },
  achievementName: {
    fontSize: 10,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  newBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  newBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // Section Progress
  sectionProgressArea: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  sectionName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  sectionPercent: {
    fontSize: 14,
    fontWeight: '700',
  },
  sectionSubtext: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
  },

  // Settings
  settingsSection: {
    padding: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#374151',
  },

  // Progress Bar
  progressBarContainer: {
    backgroundColor: '#E5E7EB',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBar: {
    borderRadius: 5,
  },

  // Logout
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    marginHorizontal: 16,
    marginTop: 8,
    padding: 16,
    borderRadius: 14,
    gap: 10,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
  bottomPadding: {
    height: 40,
  },

  // Language selector
  languageOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    gap: 6,
  },
  languageFlag: {
    fontSize: 18,
  },
  languageName: {
    fontSize: 13,
    fontWeight: '500',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalScrollContent: {
    paddingBottom: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 12,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  avatarOption: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  avatarSelected: {
    borderColor: '#667EEA',
    backgroundColor: '#EEF2FF',
  },
  avatarOptionText: {
    fontSize: 26,
  },
  modalInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#1F2937',
  },
  modalSaveButton: {
    marginTop: 24,
    borderRadius: 14,
    overflow: 'hidden',
  },
  modalSaveGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  modalSaveText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
});
