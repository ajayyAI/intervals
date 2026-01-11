import { useHaptics } from '@/hooks/useHaptics';
import { useStore } from '@/store/useStore';
import { Colors, Spacing, Typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import type React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
      <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill}>
        <View style={styles.container}>
          <View style={styles.modalContent}>
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
                <View style={[styles.iconWrapper, styles.addIconWrapper]}>
                  <Ionicons name="add" size={24} color={Colors.text.muted} />
                </View>
                <Text style={styles.addText}>Manage</Text>
              </TouchableOpacity>
            </View>

            {/* Cancel */}
            <TouchableOpacity onPress={onClose} style={styles.cancelButton} activeOpacity={0.6}>
              <View style={styles.closeCircle}>
                <Ionicons name="close" size={20} color={Colors.text.primary} />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: Colors.bg.elevated,
    borderRadius: 24,
    padding: Spacing.xl,
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
    borderRadius: 20,
    backgroundColor: Colors.bg.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  addIconWrapper: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  projectName: {
    ...Typography.caption,
    color: Colors.text.primary,
    fontWeight: '500',
    textAlign: 'center',
  },
  addButton: {
    opacity: 0.8,
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
  closeCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.bg.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
