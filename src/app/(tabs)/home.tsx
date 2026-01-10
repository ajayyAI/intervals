import { Button, CheckInModal, FlipTimer } from '@/components';
import { useIntervalChime } from '@/services/audio';
import {
  cancelNotification,
  requestNotificationPermissions,
  scheduleIntervalNotification,
} from '@/services/notifications';
import { useStore } from '@/store/useStore';
import { Colors, Spacing, Typography } from '@/theme';
import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState } from 'react';
import { AppState, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
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

  const { playChime } = useIntervalChime(
    settings.selectedSound as 'glass' | 'wood' | 'bell' | 'chime' | 'bowl'
  );

  useEffect(() => {
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(clockInterval);
  }, []);

  useEffect(() => {
    if (settings.notificationsEnabled) {
      requestNotificationPermissions();
    }
  }, [settings.notificationsEnabled]);

  useEffect(() => {
    if (isTimerRunning && timerSeconds > 0) {
      timerRef.current = setInterval(() => {
        setTimerSeconds(timerSeconds - 1);
        setLocalElapsed((prev) => prev + 1);
      }, 1000);
    } else if (timerSeconds === 0 && isTimerRunning && activeSession) {
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
    setIsTimerRunning(true);
  };

  const handleCheckInBreak = async () => {
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
    <View style={styles.container}>
      {/* Top section with current time */}
      <View style={[styles.topSection, { paddingTop: insets.top + 20 }]}>
        <Text style={styles.currentTime}>
          {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>

      {/* Center section - Timer dominates */}
      <View style={styles.centerSection}>
        <Pressable
          onPress={handleTimerPress}
          onLongPress={activeSession ? handleEnd : undefined}
          style={styles.timerPressable}
        >
          <FlipTimer seconds={activeSession ? timerSeconds : settings.intervalMinutes * 60} />
        </Pressable>

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
              placeholder="What are you focusing on?"
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
      </View>

      {/* Bottom section - Stats and hints */}
      <View style={styles.bottomSection}>
        {activeSession && (
          <>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{activeSession.intervalsCompleted}</Text>
                <Text style={styles.statLabel}>Intervals</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{Math.floor(localElapsed / 60)}m</Text>
                <Text style={styles.statLabel}>Focus Time</Text>
              </View>
            </View>
            <View style={styles.hintsContainer}>
              <Text style={styles.hint}>Tap to {isTimerRunning ? 'pause' : 'resume'}</Text>
              <Text style={styles.hintDot}>·</Text>
              <Text style={styles.hint}>Hold to end</Text>
            </View>
          </>
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
    alignItems: 'center',
    paddingBottom: Spacing.lg,
  },
  currentTime: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.muted,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  centerSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  timerPressable: {
    alignItems: 'center',
  },
  statusContainer: {
    alignItems: 'center',
    marginTop: Spacing.xxl,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.text.muted,
    letterSpacing: 3,
    marginBottom: Spacing.xs,
  },
  nextChime: {
    fontSize: 28,
    fontWeight: '500',
    color: Colors.text.secondary,
    fontVariant: ['tabular-nums'],
    letterSpacing: -0.5,
  },
  sessionLabel: {
    ...Typography.body,
    color: Colors.text.secondary,
    marginTop: Spacing.md,
    opacity: 0.8,
  },
  inputContainer: {
    width: '100%',
    maxWidth: 320,
    marginTop: Spacing.xxl,
    gap: Spacing.md,
  },
  labelInput: {
    backgroundColor: Colors.bg.card,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    fontSize: 16,
    color: Colors.text.primary,
    textAlign: 'center',
  },
  startButton: {
    width: '100%',
  },
  bottomSection: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    minHeight: 100,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  statItem: {
    alignItems: 'center',
    minWidth: 80,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.border,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '600',
    color: Colors.text.primary,
    fontVariant: ['tabular-nums'],
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.text.muted,
    letterSpacing: 1,
    marginTop: 4,
    textTransform: 'uppercase',
  },
  hintsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  hint: {
    fontSize: 12,
    color: Colors.text.muted,
    opacity: 0.6,
  },
  hintDot: {
    fontSize: 12,
    color: Colors.text.muted,
    opacity: 0.4,
  },
});
