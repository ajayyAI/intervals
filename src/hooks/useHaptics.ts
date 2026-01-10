import { useStore } from '@/store/useStore';
import * as Haptics from 'expo-haptics';
import { useCallback } from 'react';
import { Platform } from 'react-native';

export type ImpactStyle = 'light' | 'medium' | 'heavy';
export type NotificationType = 'success' | 'warning' | 'error';

const isHapticsSupported = Platform.OS === 'ios' || Platform.OS === 'android';

export const useHaptics = () => {
  const { settings } = useStore();

  const impact = useCallback(
    async (style: ImpactStyle = 'light', force = false) => {
      if (!isHapticsSupported) return;
      if (!force && !settings.hapticEnabled) return;

      try {
        const feedbackStyle = {
          light: Haptics.ImpactFeedbackStyle.Light,
          medium: Haptics.ImpactFeedbackStyle.Medium,
          heavy: Haptics.ImpactFeedbackStyle.Heavy,
        }[style];

        await Haptics.impactAsync(feedbackStyle);
      } catch {
        // Fail silently
      }
    },
    [settings.hapticEnabled]
  );

  const notification = useCallback(
    async (type: NotificationType, force = false) => {
      if (!isHapticsSupported) return;
      if (!force && !settings.hapticEnabled) return;

      try {
        const feedbackType = {
          success: Haptics.NotificationFeedbackType.Success,
          warning: Haptics.NotificationFeedbackType.Warning,
          error: Haptics.NotificationFeedbackType.Error,
        }[type];

        await Haptics.notificationAsync(feedbackType);
      } catch {
        // Fail silently
      }
    },
    [settings.hapticEnabled]
  );

  const selection = useCallback(
    async (force = false) => {
      if (!isHapticsSupported) return;
      if (!force && !settings.hapticEnabled) return;

      try {
        await Haptics.selectionAsync();
      } catch {
        // Fail silently
      }
    },
    [settings.hapticEnabled]
  );

  return {
    impact,
    notification,
    selection,
    isEnabled: settings.hapticEnabled,
  };
};
