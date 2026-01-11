import { useStore } from '@/store/useStore';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

let isNotificationHandlerSet = false;

const setupNotificationHandler = () => {
  if (isNotificationHandlerSet) return;

  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => {
        const state = useStore.getState();
        const shouldShow = state?.settings?.notificationsEnabled ?? false;

        return {
          shouldPlaySound: shouldShow,
          shouldSetBadge: false,
          shouldShowBanner: shouldShow,
          shouldShowList: shouldShow,
        };
      },
    });
    isNotificationHandlerSet = true;
  } catch {
    // Handler setup failed
  }
};

export const requestNotificationPermissions = async (): Promise<boolean> => {
  try {
    setupNotificationHandler();

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return false;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('intervals', {
        name: 'Interval Alerts',
        description: 'Notifications for completed focus intervals',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        sound: 'default',
        enableVibrate: true,
        enableLights: true,
      });
    }

    return true;
  } catch {
    return false;
  }
};

export const checkNotificationPermissions = async (): Promise<boolean> => {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
};

export const scheduleIntervalNotification = async (
  intervalSeconds: number
): Promise<string | null> => {
  try {
    const { settings } = useStore.getState();
    if (!settings?.notificationsEnabled) {
      return null;
    }

    setupNotificationHandler();

    if (intervalSeconds <= 0) {
      return null;
    }

    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Interval Complete',
        body: 'Time to reflect.',
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: intervalSeconds,
        channelId: Platform.OS === 'android' ? 'intervals' : undefined,
      },
    });

    return identifier;
  } catch {
    return null;
  }
};

export const cancelNotification = async (identifier: string): Promise<void> => {
  try {
    if (identifier) {
      await Notifications.cancelScheduledNotificationAsync(identifier);
    }
  } catch {
    // Notification may have already fired
  }
};

export const cancelAllNotifications = async (): Promise<void> => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {
    // Best effort
  }
};

export const addNotificationResponseListener = (
  callback: (response: Notifications.NotificationResponse) => void
) => {
  return Notifications.addNotificationResponseReceivedListener(callback);
};

export const addNotificationReceivedListener = (
  callback: (notification: Notifications.Notification) => void
) => {
  return Notifications.addNotificationReceivedListener(callback);
};
