import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

let isNotificationHandlerSet = false;

const setupNotificationHandler = () => {
  if (isNotificationHandlerSet) return;

  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
    isNotificationHandlerSet = true;
  } catch (error) {
    console.warn('Failed to set notification handler:', error);
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
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        sound: 'default',
      });
    }

    return true;
  } catch (error) {
    console.warn('Failed to request notification permissions:', error);
    return false;
  }
};

export const scheduleIntervalNotification = async (
  intervalSeconds: number,
  sessionLabel: string
): Promise<string | null> => {
  try {
    setupNotificationHandler();
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Interval Complete ✨',
        body: `Time to check in on "${sessionLabel}"`,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: intervalSeconds,
      },
    });

    return identifier;
  } catch (error) {
    console.warn('Failed to schedule notification:', error);
    return null;
  }
};

export const cancelNotification = async (identifier: string): Promise<void> => {
  try {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  } catch (error) {
    console.warn('Failed to cancel notification:', error);
  }
};

export const cancelAllNotifications = async (): Promise<void> => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.warn('Failed to cancel all notifications:', error);
  }
};

export const addNotificationResponseListener = (
  callback: (response: Notifications.NotificationResponse) => void
) => {
  return Notifications.addNotificationResponseReceivedListener(callback);
};
