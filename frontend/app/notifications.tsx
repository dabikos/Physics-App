import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../src/context/ThemeContext';
import { useTranslation } from 'react-i18next';
import api from '../src/services/api';

interface Notification {
  id: string;
  type: string;
  icon: string;
  color: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
}

function timeAgo(isoDate: string, lang: string): string {
  const now = new Date();
  const date = new Date(isoDate);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (lang === 'en') {
    if (diffMin < 1) return 'just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'yesterday';
    return `${diffDays}d ago`;
  }
  if (lang === 'kk') {
    if (diffMin < 1) return 'қазір ғана';
    if (diffMin < 60) return `${diffMin} мин бұрын`;
    if (diffHours < 24) return `${diffHours} сағ бұрын`;
    if (diffDays === 1) return 'кеше';
    return `${diffDays} күн бұрын`;
  }
  // ru
  if (diffMin < 1) return 'только что';
  if (diffMin < 60) return `${diffMin} мин назад`;
  if (diffHours < 24) return `${diffHours} ч назад`;
  if (diffDays === 1) return 'вчера';
  return `${diffDays} дн назад`;
}

const ICON_MAP: Record<string, keyof typeof Ionicons.glyphMap> = {
  flame: 'flame',
  trophy: 'trophy',
  medal: 'medal',
  'document-text': 'document-text',
  'stats-chart': 'stats-chart',
  bulb: 'bulb',
};

export default function NotificationsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();
  const lang = i18n.language || 'ru';

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data?.notifications || []);
    } catch (e) {
      console.log('Notifications fetch error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Mark all as read when leaving
  useEffect(() => {
    return () => {
      const ids = notifications.filter(n => !n.read).map(n => n.id);
      if (ids.length > 0) {
        api.post('/notifications/read', { ids }).catch(() => {});
      }
    };
  }, [notifications]);

  const markRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    try {
      await api.post(`/notifications/${id}/read`);
    } catch {}
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{t('notifications.title')}</Text>
          <View style={styles.headerPlaceholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: colors.headerBg, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t('notifications.title')}</Text>
        {unreadCount > 0 ? (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
          </View>
        ) : (
          <View style={styles.headerPlaceholder} />
        )}
      </View>

      {notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-off-outline" size={64} color={colors.border} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>{t('notifications.empty')}</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textTertiary }]}>
            {t('notifications.emptySubtitle')}
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
          }
        >
          {notifications.map((notif) => {
            const iconName = ICON_MAP[notif.icon] || 'notifications';
            return (
              <TouchableOpacity
                key={notif.id}
                style={[
                  styles.notifCard,
                  { backgroundColor: colors.card, shadowColor: colors.shadowColor },
                  !notif.read && styles.notifCardUnread,
                  !notif.read && { borderLeftColor: notif.color },
                ]}
                onPress={() => markRead(notif.id)}
                activeOpacity={0.8}
              >
                <View style={[styles.notifIconContainer, { backgroundColor: notif.color + '18' }]}>
                  <Ionicons name={iconName} size={24} color={notif.color} />
                </View>
                <View style={styles.notifContent}>
                  <Text style={[styles.notifTitle, { color: colors.text }, !notif.read && styles.notifTitleUnread]}>
                    {notif.title}
                  </Text>
                  <Text style={[styles.notifBody, { color: colors.textTertiary }]}>{notif.body}</Text>
                  <Text style={[styles.notifTime, { color: colors.textMuted }]}>
                    {timeAgo(notif.time, lang)}
                  </Text>
                </View>
                {!notif.read && <View style={[styles.unreadDot, { backgroundColor: notif.color }]} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerPlaceholder: {
    width: 44,
  },
  unreadBadge: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    gap: 10,
  },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 14,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderLeftWidth: 0,
  },
  notifCardUnread: {
    borderLeftWidth: 4,
  },
  notifIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  notifContent: {
    flex: 1,
  },
  notifTitle: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 3,
  },
  notifTitleUnread: {
    fontWeight: '700',
  },
  notifBody: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 4,
  },
  notifTime: {
    fontSize: 11,
    fontWeight: '500',
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: 8,
  },
});
