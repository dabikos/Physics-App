import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import type * as ExpoNotifications from 'expo-notifications';
import api from '../services/api';

type PermissionStatusLike = {
  status?: string;
  granted?: boolean;
};

const isExpoGo = Constants.appOwnership === 'expo';

const getPermissionStatus = (permission: PermissionStatusLike) => {
  if (permission.status) {
    return permission.status;
  }

  return permission.granted ? 'granted' : 'undetermined';
};

async function getNotificationsModule() {
  if (isExpoGo) {
    return null;
  }

  try {
    return await import('expo-notifications');
  } catch {
    return null;
  }
}

async function registerForPushNotificationsAsync(): Promise<string | null> {
  const Notifications = await getNotificationsModule();
  if (!Notifications) {
    return null;
  }

  if (!Device.isDevice) {
    console.log('Push notifications require a physical device');
    return null;
  }

  const existingPermission = await Notifications.getPermissionsAsync();
  const existingStatus = getPermissionStatus(existingPermission as PermissionStatusLike);
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const requestedPermission = await Notifications.requestPermissionsAsync();
    finalStatus = getPermissionStatus(requestedPermission as PermissionStatusLike);
  }

  if (finalStatus !== 'granted') {
    console.log('Push notification permission not granted');
    return null;
  }

  try {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
    return tokenData.data;
  } catch (error) {
    console.log('Error getting push token:', error);
    return null;
  }
}

export function usePushNotifications(enabled: boolean = true) {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<ExpoNotifications.Notification | null>(null);
  const notificationListener = useRef<ExpoNotifications.EventSubscription | null>(null);
  const responseListener = useRef<ExpoNotifications.EventSubscription | null>(null);

  useEffect(() => {
    if (!enabled || isExpoGo) {
      return;
    }

    let isMounted = true;

    registerForPushNotificationsAsync().then(async (token) => {
      if (token && isMounted) {
        setExpoPushToken(token);
        try {
          await api.post('/push-token', { token, platform: Platform.OS });
        } catch (error) {
          console.log('Failed to save push token:', error);
        }
      }
    });

    getNotificationsModule().then((Notifications) => {
      if (!Notifications || !isMounted) {
        return;
      }

      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        }),
      });

      notificationListener.current = Notifications.addNotificationReceivedListener((nextNotification) => {
        setNotification(nextNotification);
      });

      responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data;
        console.log('Notification tapped:', data);
      });

      if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
          name: 'Основные',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#6C63FF',
          sound: 'default',
        });
      }
    });

    return () => {
      isMounted = false;
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [enabled]);

  return { expoPushToken, notification };
}
