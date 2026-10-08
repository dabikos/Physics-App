import { useEffect, useRef, useState } from 'react';
import { AppState, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import type * as ExpoNotifications from 'expo-notifications';
import api from '../services/api';
import { PUSH_LANGUAGES, pushCategories, pushChannelNames, pushDestination, pushLanguage } from '../features/notifications/pushPresentation';

const isExpoGo = Constants.appOwnership === 'expo';

export function usePushNotifications(enabled = true, userId?: string, role?: string) {
  const router = useRouter();
  const { i18n } = useTranslation();
  const language = pushLanguage(i18n.resolvedLanguage || i18n.language);
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<ExpoNotifications.Notification | null>(null);
  const handledResponses = useRef(new Set<string>());

  useEffect(() => {
    if (!enabled || !userId || isExpoGo || Platform.OS === 'web' || !Device.isDevice) return;

    let mounted = true;
    let syncing = false;
    let receivedListener: ExpoNotifications.EventSubscription | undefined;
    let responseListener: ExpoNotifications.EventSubscription | undefined;
    let appStateListener: ReturnType<typeof AppState.addEventListener> | undefined;
    let tokenListener: ExpoNotifications.EventSubscription | undefined;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let retryCount = 0;

    const initialize = async () => {
      const Notifications = await import('expo-notifications');
      if (!mounted) return;

      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });

      const handleResponse = (response: ExpoNotifications.NotificationResponse | null) => {
        if (!mounted || !response) return;
        const request = response.notification.request;
        const data = request.content.data || {};
        // Ignore old notifications addressed to another account on this phone.
        if (data.recipient_user_id && data.recipient_user_id !== userId) return;
        const key = `${userId}:${request.identifier}:${response.actionIdentifier}`;
        if (handledResponses.current.has(key)) return;
        handledResponses.current.add(key);
        router.push(pushDestination(data, role));
        Notifications.clearLastNotificationResponse();
      };

      receivedListener = Notifications.addNotificationReceivedListener(setNotification);
      responseListener = Notifications.addNotificationResponseReceivedListener(handleResponse);

      // Android 13+ needs a channel before the permission prompt/token request.
      if (Platform.OS === 'android') {
        const names = pushChannelNames(language);
        await Promise.all(Object.entries(names).map(([id, name]) => Notifications.setNotificationChannelAsync(id, {
          name,
          importance: id === 'learning' || id === 'default'
            ? Notifications.AndroidImportance.HIGH : Notifications.AndroidImportance.DEFAULT,
          lightColor: '#6C63FF',
          sound: 'default',
          vibrationPattern: [0, 200],
          showBadge: true,
          lockscreenVisibility: Notifications.AndroidNotificationVisibility.PRIVATE,
        })));
      }
      if (!mounted) return;
      await Promise.all(PUSH_LANGUAGES.flatMap(lang => pushCategories(lang).map(category =>
        Notifications.setNotificationCategoryAsync(category.identifier, [{
          identifier: category.action,
          buttonTitle: category.title,
          options: { opensAppToForeground: true },
        }]),
      )));
      if (!mounted) return;

      const synchronizeToken = async (allowPrompt = false) => {
        if (!mounted || syncing) return;
        syncing = true;
        try {
          let permission = await Notifications.getPermissionsAsync();
          if (allowPrompt && permission.status === 'undetermined' && permission.canAskAgain) {
            permission = await Notifications.requestPermissionsAsync();
          }
          if (!mounted || !permission.granted) return;
          const projectId = Constants.easConfig?.projectId || Constants.expoConfig?.extra?.eas?.projectId;
          const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
          if (!mounted) return;
          await api.post('/push-token', { token, platform: Platform.OS, language, notification_version: 2 });
          if (!mounted) return;
          setExpoPushToken(token);
          retryCount = 0;
          if (retryTimer) clearTimeout(retryTimer);
        } catch (error) {
          console.log('Push token registration failed:', error instanceof Error ? error.name : 'UnknownError');
          const delays = [3000, 10000, 30000];
          if (mounted && retryCount < delays.length) {
            if (retryTimer) clearTimeout(retryTimer);
            retryTimer = setTimeout(() => { void synchronizeToken(); }, delays[retryCount++]);
          }
        } finally {
          syncing = false;
        }
      };

      // Recheck after returning from settings, reconnecting, or rotating a native token.
      appStateListener = AppState.addEventListener('change', state => {
        if (state === 'active') void synchronizeToken();
      });
      tokenListener = Notifications.addPushTokenListener(() => { void synchronizeToken(); });
      handleResponse(Notifications.getLastNotificationResponse());
      await synchronizeToken(true);
    };

    void initialize().catch(error => {
      console.log('Push setup failed:', error instanceof Error ? error.name : 'UnknownError');
    });

    return () => {
      mounted = false;
      if (retryTimer) clearTimeout(retryTimer);
      receivedListener?.remove();
      responseListener?.remove();
      appStateListener?.remove();
      tokenListener?.remove();
    };
  }, [enabled, userId, role, language, router]);

  return { expoPushToken, notification };
}
