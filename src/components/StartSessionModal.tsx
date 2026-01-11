import { useHaptics } from '@/hooks/useHaptics';
import { useStore } from '@/store/useStore';
import { Colors, Spacing, Typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import type React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Card } from './Card';

interface StartSessionModalProps {
  visible: boolean;
  onClose: () => void;
}

export const StartSessionModal: React.FC<StartSessionModalProps> = ({ visible, onClose }) => {
  const { projects, startSession, settings } = useStore();
  const haptics = useHaptics();

  const handleSelectProject = (projectId: string) => {
    haptics.impact('medium');
    startSession(projectId);
  };

  const handleManageProjects = () => {
    onClose();
    haptics.impact('light');
    router.push('/(tabs)/settings');
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />

        <View style={styles.modalContent}>
          <Card elevated style={styles.card}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Start Focus</Text>
              <Text style={styles.subtitle}>{settings.intervalMinutes} min intervals</Text>
            </View>

            {/* Project Grid */}
            <View style={styles.projectGrid}>
              {projects.map((project) => (
                <TouchableOpacity
                  key={project.id}
                  onPress={() => handleSelectProject(project.id)}
                  activeOpacity={0.6}
                  style={styles.projectButton}
                >
                  <View style={styles.iconWrapper}>
                    <Ionicons
                      name={project.icon as keyof typeof Ionicons.glyphMap}
                      size={24}
                      color={Colors.text.primary}
                    />
                  </View>
                  <Text style={styles.projectName}>{project.name}</Text>
                </TouchableOpacity>
              ))}

              {/* Add/Manage Projects button */}
              <TouchableOpacity
                onPress={handleManageProjects}
                activeOpacity={0.6}
                style={[styles.projectButton, styles.addButton]}
              >
                <View style={styles.iconWrapper}>
                  <Ionicons name="add" size={24} color={Colors.text.muted} />
                </View>
                <Text style={styles.addText}>Manage</Text>
              </TouchableOpacity>
            </View>

            {/* Cancel */}
            <TouchableOpacity onPress={onClose} style={styles.cancelButton} activeOpacity={0.6}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
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
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    ...Typography.h2,
    color: Colors.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    ...Typography.bodySmall,
    color: Colors.text.muted,
  },
  projectGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -Spacing.xs,
    marginBottom: Spacing.md,
  },
  projectButton: {
    width: '33.33%',
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  iconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: Colors.bg.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  projectName: {
    ...Typography.caption,
    color: Colors.text.primary,
    fontWeight: '500',
    textAlign: 'center',
  },
  addButton: {
    opacity: 0.7,
  },
  addText: {
    ...Typography.caption,
    color: Colors.text.muted,
    textAlign: 'center',
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    marginTop: Spacing.sm,
  },
  cancelText: {
    ...Typography.body,
    color: Colors.text.muted,
  },
});
