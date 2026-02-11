import { useMemo, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import { CameraView, useCameraPermissions } from 'expo-camera'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../src/context/AuthContext'
import api from '../src/services/api'

export default function ConnectScreen() {
  const { t } = useTranslation()
  const router = useRouter()
  const { user } = useAuth()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [scanOpen, setScanOpen] = useState(false)
  const [scanned, setScanned] = useState(false)
  const [permission, requestPermission] = useCameraPermissions()

  const roleInfo = useMemo(() => {
    if (!user) return { disabled: true, text: t('connect.loginRequired') }
    if (user.role === 'teacher') {
      return { disabled: true, text: t('connect.studentOnly') }
    }
    return { disabled: false, text: '' }
  }, [user])

  const handleJoin = async () => {
    if (roleInfo.disabled) {
      return
    }
    const trimmed = code.trim()
    if (!trimmed) {
      setError(t('connect.pinRequired'))
      return
    }
    setError(null)
    setSuccess(null)
    setLoading(true)
    try {
      const response = await api.post('/student/join-session', { code: trimmed })
      const sessionId = response?.data?.session_id
      setSuccess(t('connect.success'))
      if (sessionId) {
        router.replace({ pathname: '/demo', params: { sessionId } })
      }
    } catch (err: any) {
      const detail = err?.response?.data?.detail
      setError(detail || t('connect.error'))
    } finally {
      setLoading(false)
    }
  }

  const openScanner = async () => {
    const current = permission?.granted
    if (!current) {
      const result = await requestPermission()
      if (!result.granted) {
        setError(t('connect.cameraPermission'))
        return
      }
    }
    setError(null)
    setScanned(false)
    setScanOpen(true)
  }

  const handleBarcode = ({ data }: { data: string }) => {
    if (scanned) return
    setScanned(true)
    const match = data.match(/\d{4,8}/)
    setCode(match ? match[0] : data)
    setScanOpen(false)
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0F0C29', '#302B63', '#24243E']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.title}>
            {t('connect.title')}
          </Text>
          <Text style={styles.subtitle}>
            {t('connect.subtitle')}
          </Text>
        </View>

        <View style={styles.card}>
          <TextInput
            style={styles.input}
            placeholder={t('connect.pinPlaceholder')}
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={code}
            onChangeText={(value) => setCode(value.replace(/\s/g, ''))}
            keyboardType="number-pad"
            maxLength={8}
          />
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, roleInfo.disabled && styles.actionButtonDisabled]}
              onPress={handleJoin}
              disabled={roleInfo.disabled || loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="link" size={18} color="#FFFFFF" />
                  <Text style={styles.actionText}>{t('connect.connectButton')}</Text>
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.secondaryButton, roleInfo.disabled && styles.actionButtonDisabled]}
              onPress={openScanner}
              disabled={roleInfo.disabled}
            >
              <Ionicons name="qr-code" size={18} color="#8B7CF6" />
              <Text style={styles.secondaryText}>{t('connect.scanQR')}</Text>
            </TouchableOpacity>
          </View>

          {roleInfo.text ? <Text style={styles.infoText}>{roleInfo.text}</Text> : null}
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          {success ? <Text style={styles.successText}>{success}</Text> : null}
        </View>
      </SafeAreaView>

      <Modal visible={scanOpen} animationType="slide">
        <View style={styles.scanContainer}>
          <CameraView
            style={styles.camera}
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={handleBarcode}
          />
          <View style={styles.scanOverlay}>
            <Text style={styles.scanTitle}>
              {t('connect.scanHint')}
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={() => setScanOpen(false)}>
              <Ionicons name="close" size={20} color="#FFFFFF" />
              <Text style={styles.closeText}>{t('common.close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0C29',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    marginTop: 8,
    marginBottom: 20,
    gap: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.65)',
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    padding: 18,
    gap: 14,
  },
  input: {
    height: 56,
    borderRadius: 14,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    color: '#FFFFFF',
    fontSize: 18,
    letterSpacing: 4,
    textAlign: 'center',
  },
  actions: {
    gap: 10,
  },
  actionButton: {
    backgroundColor: '#6C63FF',
    borderRadius: 14,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  actionButtonDisabled: {
    opacity: 0.6,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: 'rgba(139,124,246,0.6)',
    borderRadius: 14,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    backgroundColor: 'rgba(139,124,246,0.15)',
  },
  secondaryText: {
    color: '#C7BFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  infoText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
  },
  errorText: {
    color: '#FCA5A5',
    fontSize: 13,
  },
  successText: {
    color: '#86EFAC',
    fontSize: 13,
  },
  scanContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  camera: {
    flex: 1,
  },
  scanOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    backgroundColor: 'rgba(0,0,0,0.6)',
    gap: 12,
  },
  scanTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  closeButton: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  closeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
})
