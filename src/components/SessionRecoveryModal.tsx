import { useHaptics } from '@/hooks/useHaptics';
import { type Session, useStore } from '@/store/useStore';
import { Colors, Spacing, Typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import { BlurView } from 'expo-blur';
import type React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button } from './Button';
import { Card } from './Card';

interface SessionRecoveryModalProps {
  visible: boolean;
  session: Session | null;
  onResume: () => void;
  onSaveEnd: () => void;
  onDiscard: () => void;
}

export const SessionRecoveryModal: React.FC<SessionRecoveryModalProps> = ({
  visible,
  session,
  onResume,
  onSaveEnd,
  onDiscard,
}) => {
  const { projects } = useStore();
  const haptics = useHaptics();

  if (!session) return null;

  const project = projects.find((p) => p.id === session.projectId);
  const elapsedMinutes =
    Math.floor(session.totalSeconds / 60) ||
    Math.floor((useStore.getState().elapsedSeconds || 0) / 60);
  const startedAgo = formatDistanceToNow(new Date(session.startedAt), { addSuffix: true });

  const handleResume = () => {
    haptics.impact('medium');
    onResume();
  };

  const handleSaveEnd = () => {
    haptics.impact('medium');
    onSaveEnd();
  };

  const handleDiscard = () => {
    haptics.impact('light');
    onDiscard();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />

        <View style={styles.modalContent}>
          <Card elevated style={styles.card}>
            <View style={styles.iconBadge}>
              <Ionicons name="time-outline" size={32} color={Colors.accent} />
            </View>

            <Text style={styles.title}>Unfinished Session</Text>

            <View style={styles.sessionInfo}>
              {project && (
                <View style={styles.projectRow}>
                  <View style={styles.projectBadge}>
                    <Ionicons
                      name={project.icon as keyof typeof Ionicons.glyphMap}
                      size={14}
                      color={Colors.text.secondary}
                    />
                  </View>
                  <Text style={styles.projectName}>{project.name}</Text>
                </View>
              )}
              <Text style={styles.statsText}>
                {elapsedMinutes > 0 ? `${elapsedMinutes}m elapsed` : 'Just started'} • Started{' '}
                {startedAgo}
              </Text>
              {session.intervalsCompleted > 0 && (
                <Text style={styles.intervalsText}>
                  {session.intervalsCompleted} interval{session.intervalsCompleted !== 1 ? 's' : ''}{' '}
                  completed
                </Text>
              )}
            </View>

            <View style={styles.buttonStack}>
              <Button title="Resume Timer" onPress={handleResume} variant="primary" size="large" />
              <Button
                title="Save & End"
                onPress={handleSaveEnd}
                variant="secondary"
                size="medium"
              />
              <TouchableOpacity onPress={handleDiscard} style={styles.discardButton}>
                <Text style={styles.discardText}>Discard Session</Text>
              </TouchableOpacity>
            </View>
          </Card>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
  },
  modalContent: {
    paddingHorizontal: Spacing.lg,
  },
  card: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  iconBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.bg.elevated, // More subtle background
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    ...Typography.h2,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  sessionInfo: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  projectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  projectBadge: {
    width: 24,
    height: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bg.primary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  projectName: {
    ...Typography.title,
    color: Colors.text.primary,
  },
  statsText: {
    ...Typography.bodySmall,
    color: Colors.text.muted,
    textAlign: 'center',
  },
  intervalsText: {
    ...Typography.caption,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
  },
  buttonStack: {
    gap: Spacing.sm,
  },
  discardButton: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    marginTop: Spacing.xs,
  },
  discardText: {
    ...Typography.bodySmall,
    color: Colors.text.muted,
  },
});
