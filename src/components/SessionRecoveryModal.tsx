import { useHaptics } from '@/hooks/useHaptics';
import { type Session, useStore } from '@/store/useStore';
import { Colors, Spacing, Typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';

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

  // Use snapshot if available, otherwise fallback to current project list
  const projectSnapshot = session.projectSnapshot;
  const currentProject = projects.find((p) => p.id === session.projectId);

  const displayProject =
    projectSnapshot ||
    (currentProject
      ? {
          name: currentProject.name,
          icon: currentProject.icon,
          color: currentProject.color,
        }
      : null);

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
            <View style={styles.header}>
              <View style={styles.iconCircle}>
                <Ionicons name="time" size={32} color={Colors.accent} />
              </View>
              <Text style={styles.title}>Session Paused</Text>
              <Text style={styles.subtitle}>
                {displayProject ? displayProject.name : 'Focus Session'}
              </Text>
            </View>

            <View style={styles.actions}>
              <Button title="Resume" onPress={handleResume} variant="primary" size="large" />
              <Button
                title="End Session"
                onPress={handleSaveEnd}
                variant="secondary"
                size="medium"
              />
              <TouchableOpacity onPress={handleDiscard} style={styles.discardButton}>
                <Text style={styles.discardText}>Discard</Text>
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
    paddingHorizontal: Spacing.xl, // Tighter horizontal padding for focus
  },
  card: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.bg.elevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    ...Typography.h2,
    color: Colors.text.primary,
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.body,
    color: Colors.text.muted,
    textAlign: 'center',
  },
  actions: {
    width: '100%',
    gap: Spacing.md,
  },
  discardButton: {
    alignItems: 'center',
    padding: Spacing.sm,
  },
  discardText: {
    ...Typography.caption,
    color: Colors.text.muted,
  },
});
