import React, { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../src/context/AuthContext'
import { useTheme } from '../../src/context/ThemeContext'
import api from '../../src/services/api'
import { TeacherProfileSection } from '../../src/features/profile/sections'
import { profileStyles as styles } from '../../src/features/profile/styles'

export default function TeacherClassesScreen() {
  const router = useRouter()
  const { user } = useAuth()
  const { colors } = useTheme()
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()

  const [teacherData, setTeacherData] = useState<any>(null)
  const [selectedClass, setSelectedClass] = useState<string | null>(null)
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const [studentResults, setStudentResults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [loadingStudentResults, setLoadingStudentResults] = useState(false)

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
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  const loadStudentResults = async (student: any) => {
    setSelectedStudent(student)
    setLoadingStudentResults(true)

    try {
      const response = await api.get(`/teacher/students/${student.id}/results`)
      setStudentResults(Array.isArray(response.data) ? response.data : [])
    } catch {
      setStudentResults([])
    } finally {
      setLoadingStudentResults(false)
    }
  }

  useEffect(() => {
    fetchTeacherData()
  }, [fetchTeacherData])

  const onRefresh = () => {
    setRefreshing(true)
    fetchTeacherData()
  }

  if (user?.role !== 'teacher') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{t('teacher.myClasses')}</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={[styles.sectionCard, { backgroundColor: colors.card, margin: 16, alignItems: 'center', padding: 24 }]}>
          <Ionicons name="lock-closed-outline" size={42} color={colors.textMuted} />
          <Text style={{ color: colors.textTertiary, marginTop: 10 }}>Доступно только для учителя</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('teacher.myClasses')}</Text>
        <TouchableOpacity onPress={fetchTeacherData}>
          <Ionicons name="refresh" size={22} color={colors.accent} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={[styles.loadingText, { color: colors.textTertiary }]}>{t('profile.loadingProfile')}</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.accent]} />}
          contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
        >
          <TeacherProfileSection
            teacherData={teacherData}
            selectedClass={selectedClass}
            setSelectedClass={setSelectedClass}
            selectedStudent={selectedStudent}
            setSelectedStudent={setSelectedStudent}
            studentResults={studentResults}
            loadingStudentResults={loadingStudentResults}
            loadStudentResults={loadStudentResults}
            colors={colors}
            t={t}
          />
        </ScrollView>
      )}
    </SafeAreaView>
  )
}
