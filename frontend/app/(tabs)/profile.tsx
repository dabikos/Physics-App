import React, { useEffect, useState, useRef, useCallback } from 'react'
import { View, Text, ScrollView, TouchableOpacity, Alert, Animated, RefreshControl, Linking } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../src/context/AuthContext'
import { useTheme } from '../../src/context/ThemeContext'
import { useLanguage } from '../../src/context/LanguageContext'
import api from '../../src/services/api'
import { EditProfileModal } from '../../src/features/profile/components'
import {
  GuestProfileState,
  LoadingProfileState,
  ProfileSettingsSection,
  StudentProfileSection,
  TeacherProfileOverview,
} from '../../src/features/profile/sections'
import { profileStyles as styles } from '../../src/features/profile/styles'

export default function ProfileScreen() {
  const router = useRouter()
  const { user, signOut, updateUser } = useAuth()
  const { colors, isDark, toggleTheme } = useTheme()
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()
  const { currentLanguage, changeLanguage, availableLanguages } = useLanguage()

  const [profileData, setProfileData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [showAllAchievements, setShowAllAchievements] = useState(false)
  const [teacherData, setTeacherData] = useState<any>(null)

  const fadeAnim = useRef(new Animated.Value(0)).current
  const isTeacher = user?.role === 'teacher'

  const fetchProfileStats = useCallback(async () => {
    try {
      const response = await api.get('/profile/stats')
      setProfileData(response.data)

      if (response.data?.user) {
        const currentUser = response.data.user
        await updateUser({
          name: currentUser.name,
          avatar: currentUser.avatar,
          grade: currentUser.grade,
        })
      }

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start()
    } catch (error) {
      console.log('Profile stats error:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [fadeAnim, updateUser])

  const fetchTeacherData = useCallback(async () => {
    try {
      const [classesRes, studentsRes, testsRes] = await Promise.all([
        api.get('/teacher/classes'),
        api.get('/teacher/students'),
        api.get('/teacher/tests'),
      ])

      const classes = classesRes.data?.classes || []
      const allStudents = Array.isArray(studentsRes.data) ? studentsRes.data : []
      const tests = Array.isArray(testsRes.data) ? testsRes.data : []
      const classStats = classes.map((classId: string) => {
        const classStudents = allStudents.filter((student: any) => student.class_id === classId)
        const scores = classStudents.map((student: any) => student.total_with_adjustment ?? student.total_score ?? 0)
        const avgScore = scores.length > 0 ? Math.round(scores.reduce((sum: number, score: number) => sum + score, 0) / scores.length) : 0

        return {
          id: classId,
          studentCount: classStudents.length,
          avgScore,
        }
      })

      const allScores = allStudents.map((student: any) => student.total_with_adjustment ?? student.total_score ?? 0)
      const avgScore = allScores.length > 0 ? Math.round(allScores.reduce((sum: number, score: number) => sum + score, 0) / allScores.length) : 0

      setTeacherData({
        classes: classStats,
        students: allStudents,
        tests,
        totalStudents: allStudents.length,
        totalClasses: classes.length,
        totalTests: tests.length,
        avgScore,
      })
    } catch (error) {
      console.log('Teacher data error:', error)
    }
  }, [])

  useEffect(() => {
    if (user) {
      fetchProfileStats()
      if (user.role === 'teacher') {
        fetchTeacherData()
      }
    } else {
      setLoading(false)
    }
  }, [currentLanguage, fetchProfileStats, fetchTeacherData, user])

  const onRefresh = () => {
    setRefreshing(true)
    fetchProfileStats()
    if (user?.role === 'teacher') {
      fetchTeacherData()
    }
  }

  const handleLogout = () => {
    Alert.alert(t('auth.logoutTitle'), t('auth.logoutConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('auth.logoutTitle'),
        style: 'destructive',
        onPress: async () => {
          await signOut()
          router.replace('/(auth)/welcome')
        },
      },
    ])
  }

  const handleProfileUpdate = async (data: { name?: string; avatar?: string; grade?: string }) => {
    try {
      const response = await api.patch('/profile/update', data)
      if (response.data?.user) {
        const currentUser = response.data.user
        await updateUser({
          name: currentUser.name || data.name,
          avatar: currentUser.avatar || data.avatar,
          grade: currentUser.grade || data.grade,
        })
      } else {
        await updateUser(data)
      }

      fetchProfileStats()
    } catch {
      Alert.alert(t('common.error'), t('profile.updateError'))
    }
  }

  if (!user) {
    return (
      <GuestProfileState
        colors={colors}
        t={t}
        onLogin={() => router.push('/(auth)/login')}
        onRegister={() => router.push('/(auth)/register')}
        onWelcome={() => router.push('/(auth)/welcome')}
      />
    )
  }

  if (loading) {
    return <LoadingProfileState colors={colors} t={t} />
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.accent]} />}
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
      >
        {isTeacher ? (
          <Animated.View style={{ opacity: fadeAnim }}>
            <TeacherProfileOverview
              user={user}
              profileData={profileData}
              teacherData={teacherData}
              colors={colors}
              t={t}
              onOpenEdit={() => setEditModalVisible(true)}
              onOpenClasses={() => router.push('/teacher/classes' as any)}
              onOpenWebPanel={() => Linking.openURL('https://www.physicsai.me/lesson')}
            />
          </Animated.View>
        ) : (
          <StudentProfileSection
            user={user}
            profileData={profileData}
            colors={colors}
            t={t}
            fadeAnim={fadeAnim}
            showAllAchievements={showAllAchievements}
            setShowAllAchievements={setShowAllAchievements}
            onOpenEdit={() => setEditModalVisible(true)}
          />
        )}

        <ProfileSettingsSection
          colors={colors}
          isDark={isDark}
          toggleTheme={toggleTheme}
          currentLanguage={currentLanguage}
          availableLanguages={availableLanguages}
          changeLanguage={changeLanguage}
          t={t}
          onEditProfile={() => setEditModalVisible(true)}
          onNotifications={() => router.push('/notifications')}
          onSubscription={() => router.push('/subscription' as any)}
          onAbout={() => router.push('/about')}
        />

        <TouchableOpacity style={[styles.logoutButton, { backgroundColor: colors.errorBg }]} onPress={handleLogout}>
          <Ionicons name="log-out" size={20} color={colors.error} />
          <Text style={[styles.logoutText, { color: colors.error }]}>{t('auth.logout')}</Text>
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </ScrollView>

      <EditProfileModal
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        user={user}
        onSave={handleProfileUpdate}
      />
    </SafeAreaView>
  )
}
