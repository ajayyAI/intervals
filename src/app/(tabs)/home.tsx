import { Button, CheckInModal, FlipTimer } from '@/components';
import { useIntervalChime } from '@/services/audio';
import {
  cancelAllNotifications,
  cancelNotification,
  requestNotificationPermissions,
  scheduleIntervalNotification,
} from '@/services/notifications';
import { useStore } from '@/store/useStore';
import { Colors, Spacing } from '@/theme';
import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState } from 'react';
import { AppState, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const {
    activeSession,
    timerSeconds,
    isTimerRunning,
    isCheckInModalVisible,
    settings,
    setTimerSeconds,
    setCheckInModalVisible,
    startSession,
    pauseSession,
    resumeSession,
    endSession,
    completeInterval,
  } = useStore();

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const notificationIdRef = useRef<string | null>(null);
  const appState = useRef(AppState.currentState);
  const [localElapsed, setLocalElapsed] = useState(0);

  const { playChime } = useIntervalChime(
    settings.selectedSound as 'glass' | 'wood' | 'bell' | 'chime' | 'bowl'
  );

  // Request notification permissions on mount if enabled
  useEffect(() => {
    if (settings.notificationsEnabled) {
      requestNotificationPermissions();
    }
  }, [settings.notificationsEnabled]);

  // Clean up orphaned notifications on app launch
  useEffect(() => {
    if (!activeSession) {
      cancelAllNotifications();
    }
  }, []);

  // Timer logic
  useEffect(() => {
    if (isTimerRunning && timerSeconds > 0) {
      timerRef.current = setInterval(() => {
        setTimerSeconds(timerSeconds - 1);
        setLocalElapsed((prev) => prev + 1);
      }, 1000);
    } else if (timerSeconds === 0 && isTimerRunning && activeSession) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      if (settings.hapticEnabled) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
      if (settings.soundEnabled) {
        playChime();
      }
      completeInterval();
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [
    isTimerRunning,
    timerSeconds,
    activeSession,
    settings.hapticEnabled,
    settings.soundEnabled,
    playChime,
    completeInterval,
    setTimerSeconds,
  ]);

  // Handle app state changes for background/foreground sync
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextState) => {
      // Coming back to foreground - sync timer
      if (appState.current.match(/inactive|background/) && nextState === 'active') {
        if (isTimerRunning && startTimeRef.current > 0) {
          const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
          const remaining = Math.max(0, settings.intervalMinutes * 60 - elapsed);
          setTimerSeconds(remaining);
        }
      }

      // Going to background - cancel notifications if no active session
      if (nextState === 'background' && !activeSession) {
        await cancelAllNotifications();
      }

      appState.current = nextState;
    });

    return () => subscription.remove();
  }, [isTimerRunning, settings.intervalMinutes, setTimerSeconds, activeSession]);

  const handleStart = async () => {
    if (settings.hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }

    if (settings.notificationsEnabled) {
      const intervalSeconds = settings.intervalMinutes * 60;
      notificationIdRef.current = await scheduleIntervalNotification(
        intervalSeconds,
        'Focus Session'
      );
    }

    startTimeRef.current = Date.now();
    setLocalElapsed(0);
    startSession('Focus Session');
  };

  const handleTimerPress = async () => {
    if (!activeSession) return;

    if (settings.hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (isTimerRunning) {
      if (notificationIdRef.current) {
        await cancelNotification(notificationIdRef.current);
        notificationIdRef.current = null;
      }
      pauseSession();
    } else {
      if (settings.notificationsEnabled) {
        notificationIdRef.current = await scheduleIntervalNotification(
          timerSeconds,
          activeSession.label
        );
      }
      startTimeRef.current = Date.now() - localElapsed * 1000;
      resumeSession();
    }
  };

  const handleEnd = async () => {
    if (settings.hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }

    if (notificationIdRef.current) {
      await cancelNotification(notificationIdRef.current);
      notificationIdRef.current = null;
    }
    await cancelAllNotifications();
    endSession();
    setLocalElapsed(0);
    startTimeRef.current = 0;
  };

  const handleCheckInContinue = async () => {
    if (settings.notificationsEnabled && activeSession) {
      notificationIdRef.current = await scheduleIntervalNotification(
        settings.intervalMinutes * 60,
        activeSession.label
      );
    }
    startTimeRef.current = Date.now();
    setLocalElapsed(0);
  };

  const handleCheckInBreak = async () => {
    if (notificationIdRef.current) {
      await cancelNotification(notificationIdRef.current);
      notificationIdRef.current = null;
    }
    await cancelAllNotifications();
    endSession();
    setLocalElapsed(0);
    startTimeRef.current = 0;
  };

  const bottomPadding = Math.max(insets.bottom, 16) + 64 + 24;

  return (
    <View style={styles.container}>
      {/* Minimal top section */}
      <View style={[styles.topSection, { paddingTop: insets.top + 16 }]}>
        {activeSession && (
          <View style={styles.sessionInfo}>
            <Text style={styles.intervalsCount}>{activeSession.intervalsCompleted}</Text>
            <Text style={styles.intervalsLabel}>intervals</Text>
          </View>
        )}
      </View>

      {/* Center - Timer dominates */}
      <View style={styles.centerSection}>
        <Pressable
          onPress={activeSession ? handleTimerPress : undefined}
          onLongPress={activeSession ? handleEnd : undefined}
          delayLongPress={600}
          style={styles.timerPressable}
        >
          <FlipTimer seconds={activeSession ? timerSeconds : settings.intervalMinutes * 60} />
        </Pressable>

        {!activeSession && (
          <View style={styles.startContainer}>
            <Button
              title="Start Focus"
              onPress={handleStart}
              variant="primary"
              size="large"
              style={styles.startButton}
            />
          </View>
        )}
      </View>

      {/* Minimal bottom section */}
      <View style={[styles.bottomSection, { paddingBottom: bottomPadding }]}>
        {activeSession && (
          <Text style={styles.statusHint}>
            {isTimerRunning ? 'tap to pause · hold to end' : 'paused · tap to resume'}
          </Text>
        )}
      </View>

      <CheckInModal
        visible={isCheckInModalVisible}
        onClose={() => setCheckInModalVisible(false)}
        onContinue={handleCheckInContinue}
        onTakeBreak={handleCheckInBreak}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg.primary,
  },
  topSection: {
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    minHeight: 60,
  },
  sessionInfo: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  intervalsCount: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text.secondary,
    fontVariant: ['tabular-nums'],
  },
  intervalsLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.text.muted,
    letterSpacing: 0.5,
  },
  centerSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  timerPressable: {
    width: '100%',
    alignItems: 'center',
  },
  startContainer: {
    marginTop: Spacing.xxl,
  },
  startButton: {
    minWidth: 180,
    paddingHorizontal: 32,
  },
  bottomSection: {
    alignItems: 'center',
    paddingHorizontal: 24,
    minHeight: 60,
  },
  statusHint: {
    fontSize: 12,
    color: Colors.text.muted,
    opacity: 0.5,
    letterSpacing: 0.5,
  },
});
