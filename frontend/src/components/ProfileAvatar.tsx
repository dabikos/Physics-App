import React, { useMemo } from 'react'
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native'
import multiavatar from '@multiavatar/multiavatar'
import { SvgXml } from 'react-native-svg'

export const MULTIAVATAR_PREFIX = 'multiavatar:'

export function createAvatarSeed(): string {
  const random = Math.random().toString(36).slice(2)
  return `${MULTIAVATAR_PREFIX}${Date.now().toString(36)}-${random}`
}

export function isMultiavatar(value?: string | null): boolean {
  return Boolean(value?.startsWith(MULTIAVATAR_PREFIX))
}

type ProfileAvatarProps = {
  value?: string | null
  fallback?: string
  size: number
  style?: StyleProp<ViewStyle>
}

export function ProfileAvatar({ value, fallback = '🧑‍🎓', size, style }: ProfileAvatarProps) {
  const svg = useMemo(() => {
    if (!isMultiavatar(value)) return null
    try {
      return multiavatar(value!.slice(MULTIAVATAR_PREFIX.length))
    } catch {
      return null
    }
  }, [value])

  const radius = size / 2

  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: radius }, style]}>
      {svg ? (
        <SvgXml xml={svg} width={size} height={size} />
      ) : (
        <Text style={[styles.fallback, { fontSize: Math.round(size * 0.5) }]}>
          {value || fallback}
        </Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: '#EEF2FF',
  },
  fallback: {
    textAlign: 'center',
  },
})

