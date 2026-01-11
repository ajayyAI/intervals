import {
  Button,
  CheckInModal,
  FlipTimer,
  SessionRecoveryModal,
  StartSessionModal,
} from '@/components';
import { useHaptics } from '@/hooks/useHaptics';
import { useIntervalChime } from '@/hooks/useSounds';
import {
  cancelAllNotifications,
  cancelNotification,
  requestNotificationPermissions,
  scheduleIntervalNotification,
} from '@/services/notifications';
import { useStore } from '@/store/useStore';
import { Colors, Spacing } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { AppState, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const {
    activeSession,
    sessions,
    timerSeconds,
    isTimerRunning,
    isCheckInModalVisible,
    isStartSessionModalVisible,
    settings,
    projects,
    elapsedSeconds,
    setTimerSeconds,
    setElapsedSeconds,
    setCheckInModalVisible,
    setStartSessionModalVisible,
    pauseSession,
    resumeSession,
    endSession,
    completeInterval,
    restoreSession,
    discardSession,
    endOrphanedSession,
    _hasHydrated,
  } = useStore();

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const notificationIdRef = useRef<string | null>(null);
  const appState = useRef(AppState.currentState);
  const hasCheckedRecovery = useRef(false);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);

  const haptics = useHaptics();
  const { play: playChime } = useIntervalChime();

  const activeProject = activeSession
    ? projects.find((p) => p.id === activeSession.projectId)
    : null;

  useEffect(() => {
    if (settings.notificationsEnabled) {
      requestNotificationPermissions();
    }
  }, [settings.notificationsEnabled]);

  const [orphanedSession, setOrphanedSession] = useState<typeof activeSession>(null);

  useEffect(() => {
    if (!_hasHydrated || hasCheckedRecovery.current) return;
    hasCheckedRecovery.current = true;

    const orphaned = sessions.find((s) => s.status === 'active');

    if (orphaned && !activeSession) {
      // Found an orphaned session that wasn't properly ended
      const sessionAge = Date.now() - new Date(orphaned.startedAt).getTime();
      const twentyFourHours = 24 * 60 * 60 * 1000;

      if (sessionAge > twentyFourHours) {
        discardSession(orphaned.id);
      } else {
        setOrphanedSession(orphaned);
        setShowRecoveryModal(true);
      }
    }
  }, [_hasHydrated, sessions, activeSession, discardSession]);

  useEffect(() => {
    const scheduleNotificationForSession = async () => {
      if (activeSession && isTimerRunning && timerSeconds > 0 && !notificationIdRef.current) {
        if (settings.notificationsEnabled) {
          notificationIdRef.current = await scheduleIntervalNotification(timerSeconds);
        }
        if (startTimeRef.current === 0) {
          startTimeRef.current = Date.now();
          setElapsedSeconds(0);
        }
      }
    };
    scheduleNotificationForSession();
  }, [activeSession?.id, isTimerRunning, settings.notificationsEnabled]);

  useEffect(() => {
    if (!activeSession) {
      cancelAllNotifications();
      notificationIdRef.current = null;
      startTimeRef.current = 0;
    }
  }, [activeSession]);

  useEffect(() => {
    if (isTimerRunning && timerSeconds > 0) {
      timerRef.current = setInterval(() => {
        setTimerSeconds(timerSeconds - 1);
        setElapsedSeconds(elapsedSeconds + 1);
      }, 1000);
    } else if (timerSeconds === 0 && isTimerRunning && activeSession) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      // Cancel the notification that was scheduled for this interval
      if (notificationIdRef.current) {
        cancelNotification(notificationIdRef.current);
        notificationIdRef.current = null;
      }

      haptics.notification('success');

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
    elapsedSeconds,
    activeSession,
    settings.soundEnabled,
    playChime,
    completeInterval,
    setTimerSeconds,
    setElapsedSeconds,
    haptics,
  ]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextState) => {
      if (appState.current.match(/inactive|background/) && nextState === 'active') {
        if (isTimerRunning && startTimeRef.current > 0) {
          const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
          const remaining = Math.max(0, settings.intervalMinutes * 60 - elapsed);
          setTimerSeconds(remaining);
          // Also sync elapsed seconds
          setElapsedSeconds(elapsed);

          // If timer completed while in background, trigger completion
          if (remaining === 0) {
            if (notificationIdRef.current) {
              await cancelNotification(notificationIdRef.current);
              notificationIdRef.current = null;
            }
            completeInterval();
          }
        }
      }

      if (nextState === 'background' && !activeSession) {
        await cancelAllNotifications();
      }

      appState.current = nextState;
    });

    return () => subscription.remove();
  }, [
    isTimerRunning,
    settings.intervalMinutes,
    setTimerSeconds,
    setElapsedSeconds,
    activeSession,
    completeInterval,
  ]);

  const handleStartPress = () => {
    haptics.impact('medium');
    setStartSessionModalVisible(true);
  };

  const handleTimerPress = async () => {
    if (!activeSession) return;

    haptics.impact('light');

    if (isTimerRunning) {
      if (notificationIdRef.current) {
        await cancelNotification(notificationIdRef.current);
        notificationIdRef.current = null;
      }
      pauseSession();
    } else {
      if (settings.notificationsEnabled) {
        notificationIdRef.current = await scheduleIntervalNotification(timerSeconds);
      }
      startTimeRef.current = Date.now() - elapsedSeconds * 1000;
      resumeSession();
    }
  };

  const handleEnd = async () => {
    haptics.impact('heavy');

    if (notificationIdRef.current) {
      await cancelNotification(notificationIdRef.current);
      notificationIdRef.current = null;
    }
    await cancelAllNotifications();
    endSession();
    startTimeRef.current = 0;
  };

  const handleCheckInContinue = async () => {
    // Cancel any stale notifications before scheduling new one
    if (notificationIdRef.current) {
      await cancelNotification(notificationIdRef.current);
      notificationIdRef.current = null;
    }
    await cancelAllNotifications();

    if (settings.notificationsEnabled && activeSession) {
      notificationIdRef.current = await scheduleIntervalNotification(settings.intervalMinutes * 60);
    }
    startTimeRef.current = Date.now();
  };

  const handleCheckInBreak = async () => {
    if (notificationIdRef.current) {
      await cancelNotification(notificationIdRef.current);
      notificationIdRef.current = null;
    }
    await cancelAllNotifications();
    endSession();
    startTimeRef.current = 0;
  };

  // Recovery modal handlers
  const handleRecoveryResume = async () => {
    if (!orphanedSession) return;
    setShowRecoveryModal(false);

    restoreSession(orphanedSession);

    if (settings.notificationsEnabled) {
      const state = useStore.getState();
      notificationIdRef.current = await scheduleIntervalNotification(state.timerSeconds);
    }

    const elapsed = Math.floor((Date.now() - new Date(orphanedSession.startedAt).getTime()) / 1000);
    startTimeRef.current = Date.now() - elapsed * 1000;

    resumeSession();
    setOrphanedSession(null);
  };

  const handleRecoverySaveEnd = async () => {
    if (!orphanedSession) return;
    setShowRecoveryModal(false);
    await cancelAllNotifications();

    const elapsed = Math.floor((Date.now() - new Date(orphanedSession.startedAt).getTime()) / 1000);
    endOrphanedSession(orphanedSession.id, elapsed);
    setOrphanedSession(null);
  };

  const handleRecoveryDiscard = async () => {
    if (!orphanedSession) return;
    setShowRecoveryModal(false);
    await cancelAllNotifications();
    discardSession(orphanedSession.id);
    setOrphanedSession(null);
  };

  const bottomPadding = Math.max(insets.bottom, 16) + 64 + 24;

  return (
    <View style={styles.container}>
      <View style={[styles.topSection, { paddingTop: insets.top + 16 }]}>
        {activeSession && activeProject && (
          <View style={styles.sessionInfo}>
            <View style={styles.projectBadge}>
              <Ionicons
                name={activeProject.icon as keyof typeof Ionicons.glyphMap}
                size={14}
                color={Colors.text.secondary}
              />
            </View>
            <Text style={styles.projectName}>{activeProject.name}</Text>
            <Text style={styles.separator}>·</Text>
            <Text style={styles.intervalsCount}>{activeSession.intervalsCompleted}</Text>
            <Text style={styles.intervalsLabel}>intervals</Text>
          </View>
        )}
      </View>

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
              onPress={handleStartPress}
              variant="primary"
              size="large"
              style={styles.startButton}
              noHaptic
            />
          </View>
        )}
      </View>

      <View style={[styles.bottomSection, { paddingBottom: bottomPadding }]}>
        {activeSession && (
          <Text style={styles.statusHint}>
            {isTimerRunning ? 'tap to pause · hold to end' : 'paused · tap to resume'}
          </Text>
        )}
      </View>

      <StartSessionModal
        visible={isStartSessionModalVisible}
        onClose={() => setStartSessionModalVisible(false)}
      />

      <CheckInModal
        visible={isCheckInModalVisible}
        onClose={() => setCheckInModalVisible(false)}
        onContinue={handleCheckInContinue}
        onTakeBreak={handleCheckInBreak}
      />

      <SessionRecoveryModal
        visible={showRecoveryModal}
        session={orphanedSession}
        onResume={handleRecoveryResume}
        onSaveEnd={handleRecoverySaveEnd}
        onDiscard={handleRecoveryDiscard}
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
    paddingHorizontal: 24,
    minHeight: 60,
  },
  sessionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  projectBadge: {
    width: 24,
    height: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bg.elevated,
  },
  projectName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  separator: {
    fontSize: 14,
    color: Colors.text.muted,
    marginHorizontal: 2,
  },
  intervalsCount: {
    fontSize: 14,
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
