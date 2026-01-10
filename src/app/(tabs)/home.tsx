import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState } from 'react';
import { AppState, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, CheckInModal, FlipTimer } from '../../components';
import { useIntervalChime } from '../../services/audio';
import {
  cancelNotification,
  requestNotificationPermissions,
  scheduleIntervalNotification,
} from '../../services/notifications';
import { useStore } from '../../store/useStore';
import { Colors, Layout, Spacing, Typography } from '../../theme';

export default function HomeScreen() {
  const {
    activeSession,
    currentLabel,
    timerSeconds,
    isTimerRunning,
    isCheckInModalVisible,
    settings,
    setCurrentLabel,
    setTimerSeconds,
    setIsTimerRunning,
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
  const [currentTime, setCurrentTime] = useState(new Date());

  // Audio chime hook
  const { playChime } = useIntervalChime(
    settings.selectedSound as 'glass' | 'wood' | 'bell' | 'chime' | 'bowl'
  );

  useEffect(() => {
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute
    return () => clearInterval(clockInterval);
  }, []);

  // Request notification permissions on mount
  useEffect(() => {
    if (settings.notificationsEnabled) {
      requestNotificationPermissions();
    }
  }, [settings.notificationsEnabled]);

  // Timer countdown
  useEffect(() => {
    if (isTimerRunning && timerSeconds > 0) {
      timerRef.current = setInterval(() => {
        setTimerSeconds(timerSeconds - 1);
        setLocalElapsed((prev) => prev + 1);
      }, 1000);
    } else if (timerSeconds === 0 && isTimerRunning && activeSession) {
      // Interval complete - show check-in
      if (settings.hapticEnabled) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
      if (settings.soundEnabled) {
        playChime();
      }
      completeInterval();
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, timerSeconds, activeSession]);

  // Background state handling
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (appState.current.match(/inactive|background/) && nextState === 'active') {
        if (isTimerRunning && startTimeRef.current > 0) {
          const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
          const remaining = Math.max(0, settings.intervalMinutes * 60 - elapsed);
          setTimerSeconds(remaining);
        }
      }
      appState.current = nextState;
    });

    return () => subscription.remove();
  }, [isTimerRunning, settings.intervalMinutes]);

  const handleStart = async () => {
    if (!currentLabel.trim()) {
      if (settings.hapticEnabled) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      return;
    }

    if (settings.hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }

    // Schedule background notification
    if (settings.notificationsEnabled) {
      const intervalSeconds = settings.intervalMinutes * 60;
      notificationIdRef.current = await scheduleIntervalNotification(intervalSeconds, currentLabel);
    }

    startTimeRef.current = Date.now();
    setLocalElapsed(0);
    startSession(currentLabel);
  };

  const handleTimerPress = async () => {
    if (!activeSession) return;

    if (settings.hapticEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (isTimerRunning) {
      // Cancel notification on pause
      if (notificationIdRef.current) {
        await cancelNotification(notificationIdRef.current);
        notificationIdRef.current = null;
      }
      pauseSession();
    } else {
      // Reschedule notification on resume
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
    // Cancel any pending notification
    if (notificationIdRef.current) {
      await cancelNotification(notificationIdRef.current);
      notificationIdRef.current = null;
    }
    endSession();
    setLocalElapsed(0);
    startTimeRef.current = 0;
  };

  const handleCheckInContinue = async () => {
    // Schedule notification for next interval
    if (settings.notificationsEnabled && activeSession) {
      notificationIdRef.current = await scheduleIntervalNotification(
        settings.intervalMinutes * 60,
        activeSession.label
      );
    }
    startTimeRef.current = Date.now();
    setIsTimerRunning(true);
  };

  const handleCheckInBreak = async () => {
    // Cancel any pending notification
    if (notificationIdRef.current) {
      await cancelNotification(notificationIdRef.current);
      notificationIdRef.current = null;
    }
    endSession();
    setLocalElapsed(0);
    startTimeRef.current = 0;
  };

  const formatNextChime = () => {
    if (!activeSession) return '';
    const now = new Date();
    const nextChime = new Date(now.getTime() + timerSeconds * 1000);
    return nextChime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Current Time */}
        <Text style={styles.currentTime}>
          {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>

        {/* Main Timer - Tappable */}
        <Pressable onPress={handleTimerPress} onLongPress={activeSession ? handleEnd : undefined}>
          <View style={styles.timerContainer}>
            <FlipTimer seconds={activeSession ? timerSeconds : settings.intervalMinutes * 60} />
          </View>
        </Pressable>

        {/* Status / Next Chime */}
        {activeSession ? (
          <View style={styles.statusContainer}>
            <Text style={styles.statusLabel}>{isTimerRunning ? 'NEXT CHIME' : 'PAUSED'}</Text>
            {isTimerRunning && <Text style={styles.nextChime}>{formatNextChime()}</Text>}
            <Text style={styles.sessionLabel}>{activeSession.label}</Text>
          </View>
        ) : (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.labelInput}
              placeholder="Session label"
              placeholderTextColor={Colors.text.muted}
              value={currentLabel}
              onChangeText={setCurrentLabel}
              returnKeyType="done"
              onSubmitEditing={handleStart}
            />
            <Button
              title="Begin"
              onPress={handleStart}
              variant="primary"
              size="large"
              disabled={!currentLabel.trim()}
              style={styles.startButton}
            />
          </View>
        )}

        {/* Session Stats */}
        {activeSession && (
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{activeSession.intervalsCompleted}</Text>
              <Text style={styles.statLabel}>Intervals</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{Math.floor(localElapsed / 60)}m</Text>
              <Text style={styles.statLabel}>Focus Time</Text>
            </View>
          </View>
        )}
      </View>

      {/* Hints */}
      {activeSession && (
        <View style={styles.hintsContainer}>
          <Text style={styles.hint}>Tap to {isTimerRunning ? 'pause' : 'resume'}</Text>
          <Text style={styles.hint}>Hold to end</Text>
        </View>
      )}

      <CheckInModal
        visible={isCheckInModalVisible}
        onClose={() => setCheckInModalVisible(false)}
        onContinue={handleCheckInContinue}
        onTakeBreak={handleCheckInBreak}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: Layout.screenPadding,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentTime: {
    ...Typography.labelSmall,
    color: Colors.text.muted,
    letterSpacing: 2,
    marginBottom: Spacing.xxl,
  },
  timerContainer: {
    marginVertical: Spacing.xl,
  },
  statusContainer: {
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  statusLabel: {
    ...Typography.labelUppercase,
    color: Colors.text.muted,
    marginBottom: Spacing.xs,
  },
  nextChime: {
    ...Typography.interval,
    color: Colors.text.secondary,
  },
  sessionLabel: {
    ...Typography.body,
    color: Colors.text.secondary,
    marginTop: Spacing.md,
  },
  inputContainer: {
    width: '100%',
    marginTop: Spacing.xxl,
    gap: Spacing.md,
  },
  labelInput: {
    backgroundColor: Colors.bg.card,
    borderRadius: Layout.inputRadius,
    padding: Spacing.md,
    paddingHorizontal: Spacing.lg,
    ...Typography.body,
    color: Colors.text.primary,
    textAlign: 'center',
  },
  startButton: {
    width: '100%',
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.xxl,
    marginTop: Spacing.xxl,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...Typography.interval,
    color: Colors.text.primary,
  },
  statLabel: {
    ...Typography.labelSmall,
    color: Colors.text.muted,
    marginTop: Spacing.xs,
  },
  hintsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  hint: {
    ...Typography.caption,
    color: Colors.text.muted,
  },
});
