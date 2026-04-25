import React, { useEffect, useRef, useState } from 'react'
import { View, Text, Animated, Modal, ScrollView, TouchableOpacity, TextInput } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../../context/ThemeContext'
import { profileStyles as styles } from './styles'

export const AnimatedProgressBar: React.FC<{
  progress: number
  color: string
  delay?: number
  height?: number
}> = ({ progress, color, delay = 0, height = 8 }) => {
  const { colors } = useTheme()
  const animatedWidth = useRef(new Animated.Value(0)).current

  useEffect(() => {
    const timeout = setTimeout(() => {
      Animated.timing(animatedWidth, {
        toValue: progress,
        duration: 800,
        useNativeDriver: false,
      }).start()
    }, delay)

    return () => clearTimeout(timeout)
  }, [progress, delay, animatedWidth])

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
            backgroundColor: color,
          },
        ]}
      />
    </View>
  )
}

export const StreakFire: React.FC<{ streak: number }> = ({ streak }) => {
  const { i18n } = useTranslation()
  const scaleAnim = useRef(new Animated.Value(0)).current
  const pulseAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start()

    if (streak > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ]),
      ).start()
    }
  }, [streak, pulseAnim, scaleAnim])

  return (
    <Animated.View style={[styles.streakContainer, { transform: [{ scale: scaleAnim }] }]}>
      <LinearGradient
        colors={streak > 0 ? ['#FF6B35', '#FF4500', '#DC143C'] : ['#9CA3AF', '#6B7280']}
        style={styles.streakGradient}
      >
        <Animated.Text style={[styles.streakEmoji, { transform: [{ scale: pulseAnim }] }]}>🔥</Animated.Text>
        <Text style={styles.streakNumber}>{streak}</Text>
        <Text style={styles.streakLabel}>
          {streak === 1 ? i18n.t('profile.day') : streak >= 2 && streak <= 4 ? i18n.t('profile.days2_4') : i18n.t('profile.days5_20')}
        </Text>
      </LinearGradient>
    </Animated.View>
  )
}

export const AchievementBadge: React.FC<{ achievement: any; index: number }> = ({ achievement, index }) => {
  const { colors } = useTheme()
  const { t } = useTranslation()
  const scaleAnim = useRef(new Animated.Value(0)).current
  const glowAnim = useRef(new Animated.Value(0)).current
  const localizedAchievementName = achievement?.id
    ? t(`profile.achievementItems.${achievement.id}.name`, { defaultValue: achievement.name })
    : achievement.name

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 40,
      friction: 6,
      delay: index * 80,
      useNativeDriver: true,
    }).start()

    if (achievement.is_new) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
          Animated.timing(glowAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
        ]),
      ).start()
    }
  }, [achievement.is_new, glowAnim, index, scaleAnim])

  return (
    <Animated.View
      style={[
        styles.achievementBadge,
        {
          backgroundColor: colors.card,
          transform: [{ scale: scaleAnim }],
          opacity: achievement.unlocked ? 1 : 0.4,
        },
      ]}
    >
      {achievement.is_new && <Animated.View style={[styles.achievementGlow, { opacity: glowAnim }]} />}
      <Text style={styles.achievementIcon}>{achievement.icon}</Text>
      <Text style={[styles.achievementName, { color: colors.textSecondary }, !achievement.unlocked && { color: colors.textMuted }]} numberOfLines={1}>
        {localizedAchievementName}
      </Text>
      {achievement.is_new && (
        <View style={styles.newBadge}>
          <Text style={styles.newBadgeText}>{t('common.new')}</Text>
        </View>
      )}
    </Animated.View>
  )
}

export const SectionProgressCard: React.FC<{ section: any; index: number }> = ({ section, index }) => {
  const { colors } = useTheme()
  const { t } = useTranslation()
  const localizedSectionName = section?.section ? t(`physics.${section.section}`, { defaultValue: section.name }) : section.name

  return (
    <View style={[styles.sectionCard, { backgroundColor: colors.card }]}>
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionDot, { backgroundColor: section.color }]} />
        <Text style={[styles.sectionName, { color: colors.text }]}>{localizedSectionName}</Text>
        <Text style={[styles.sectionPercent, { color: section.color }]}>{section.percentage}%</Text>
      </View>
      <AnimatedProgressBar progress={section.percentage} color={section.color} delay={index * 100} />
      <Text style={[styles.sectionSubtext, { color: colors.textMuted }]}>
        {t('profile.topicsOf', { completed: section.completed, total: section.total })}
      </Text>
    </View>
  )
}

export const EditProfileModal: React.FC<{
  visible: boolean
  onClose: () => void
  user: any
  onSave: (data: { name?: string; avatar?: string; grade?: string }) => void
}> = ({ visible, onClose, user, onSave }) => {
  const { colors } = useTheme()
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()
  const [name, setName] = useState(user?.name || '')
  const [grade, setGrade] = useState(user?.grade || '')
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || '🧑‍🎓')

  const avatars = ['🧑‍🎓', '👨‍🔬', '👩‍🔬', '🧑‍💻', '🦸', '🧙', '🧑‍🚀', '🤖', '🦊', '🐱', '🐸', '🦉']

  useEffect(() => {
    setName(user?.name || '')
    setGrade(user?.grade || '')
    setSelectedAvatar(user?.avatar || '🧑‍🎓')
  }, [user, visible])

  const handleSave = () => {
    onSave({
      name: name.trim() || undefined,
      avatar: selectedAvatar,
      grade: grade.trim() || undefined,
    })
    onClose()
  }

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

            <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>{t('profile.avatar')}</Text>
            <View style={styles.avatarGrid}>
              {avatars.map((avatar) => (
                <TouchableOpacity
                  key={avatar}
                  style={[
                    styles.avatarOption,
                    { backgroundColor: colors.inputBg, borderColor: 'transparent' },
                    selectedAvatar === avatar && { borderColor: colors.accent, backgroundColor: colors.accentLight },
                  ]}
                  onPress={() => setSelectedAvatar(avatar)}
                >
                  <Text style={styles.avatarOptionText}>{avatar}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>{t('profile.nameLabel')}</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.inputBg, color: colors.text }]}
              value={name}
              onChangeText={setName}
              placeholder={t('profile.namePlaceholder')}
              placeholderTextColor={colors.textMuted}
            />

            <Text style={[styles.modalLabel, { color: colors.textSecondary }]}>{t('profile.gradeLabel')}</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.inputBg, color: colors.text }]}
              value={grade}
              onChangeText={setGrade}
              placeholder={t('profile.gradePlaceholder')}
              placeholderTextColor={colors.textMuted}
            />

            <TouchableOpacity style={styles.modalSaveButton} onPress={handleSave} activeOpacity={0.9}>
              <LinearGradient colors={['#667EEA', '#764BA2']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.modalSaveGradient}>
                <Text style={styles.modalSaveText}>{t('common.save')}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  )
}
