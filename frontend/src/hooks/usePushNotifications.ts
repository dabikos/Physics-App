import { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import type { EventSubscription } from 'expo-modules-core';
import Constants from 'expo-constants';
import api from '../services/api';

// Настройка обработки уведомлений в foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

async function registerForPushNotificationsAsync(): Promise<string | null> {
  // Push уведомления работают только на физических устройствах
  if (!Device.isDevice) {
    console.log('Push notifications require a physical device');
    return null;
  }

  // Проверяем/запрашиваем разрешение
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Push notification permission not granted');
    return null;
  }

  // Получаем Expo Push Token
  try {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId,
    });
    return tokenData.data; // "ExponentPushToken[xxxxx]"
  } catch (error) {
    console.log('Error getting push token:', error);
    return null;
  }
}

export function usePushNotifications(enabled: boolean = true) {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const notificationListener = useRef<EventSubscription | null>(null);
  const responseListener = useRef<EventSubscription | null>(null);

  useEffect(() => {
    if (!enabled) return;

    // Регистрация токена
    registerForPushNotificationsAsync().then(async (token) => {
      if (token) {
        setExpoPushToken(token);
        // Отправляем токен на бэкенд
        try {
          await api.post('/push-token', { token, platform: Platform.OS });
        } catch (e) {
          console.log('Failed to save push token:', e);
        }
      }
    });

    // Слушатель входящих уведомлений (foreground)
    notificationListener.current = Notifications.addNotificationReceivedListener((notif) => {
      setNotification(notif);
    });

    // Слушатель нажатия на уведомление
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      // Можно обрабатывать навигацию по data.type
      console.log('Notification tapped:', data);
    });

    // Android: настройка канала уведомлений
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'Основные',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#6C63FF',
        sound: 'default',
      });
    }

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [enabled]);

  return { expoPushToken, notification };
}
