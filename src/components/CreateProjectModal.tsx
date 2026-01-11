import { useHaptics } from '@/hooks/useHaptics';
import { useStore } from '@/store/useStore';
import { Colors, Spacing, Typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import type React from 'react';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button } from './Button';
import { Card } from './Card';

const PROJECT_ICONS = [
  'briefcase-outline',
  'book-outline',
  'person-outline',
  'brush-outline',
  'code-slash-outline',
  'fitness-outline',
  'home-outline',
  'globe-outline',
  'leaf-outline',
  'moon-outline',
  'heart-outline',
  'star-outline',
];

interface CreateProjectModalProps {
  visible: boolean;
  onClose: () => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ visible, onClose }) => {
  const { createProject } = useStore();
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(PROJECT_ICONS[0]);
  const haptics = useHaptics();

  const handleCreate = () => {
    if (!name.trim()) return;

    haptics.notification('success');
    createProject({
      name: name.trim(),
      color: '#52525B', // Default color for now
      icon: selectedIcon,
    });

    setName('');
    setSelectedIcon(PROJECT_ICONS[0]);
    onClose();
  };

  const handleClose = () => {
    haptics.impact('light');
    setName('');
    setSelectedIcon(PROJECT_ICONS[0]);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.modalContent}>
            <Card elevated style={styles.card}>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Ionicons name="close" size={20} color={Colors.text.muted} />
              </TouchableOpacity>

              <View style={styles.header}>
                <View style={styles.iconCircle}>
                  <Ionicons name="folder-open" size={24} color={Colors.accent} />
                </View>
                <Text style={styles.title}>New Project</Text>
              </View>

              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <TextInput
                    style={styles.input}
                    placeholder="Project Name"
                    placeholderTextColor={Colors.text.muted}
                    value={name}
                    onChangeText={setName}
                    autoFocus={visible}
                  />
                </View>

                <View style={styles.iconGrid}>
                  {PROJECT_ICONS.map((icon) => (
                    <TouchableOpacity
                      key={icon}
                      onPress={() => {
                        haptics.selection();
                        setSelectedIcon(icon);
                      }}
                      style={[styles.iconOption, selectedIcon === icon && styles.iconOptionActive]}
                    >
                      <Ionicons
                        name={icon as keyof typeof Ionicons.glyphMap}
                        size={20}
                        color={selectedIcon === icon ? Colors.text.primary : Colors.text.muted}
                      />
                    </TouchableOpacity>
                  ))}
                </View>

                <Button
                  title="Create Project"
                  onPress={handleCreate}
                  variant="primary"
                  size="large"
                  disabled={!name.trim()}
                  style={[!name.trim() ? styles.disabledButton : undefined]}
                />
              </View>
            </Card>
          </View>
        </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
    width: '100%',
  },
  modalContent: {
    paddingHorizontal: Spacing.xl,
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  card: {
    padding: Spacing.xl,
    width: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    padding: 8,
    zIndex: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
    marginTop: Spacing.xs,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.bg.elevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  title: {
    ...Typography.h3,
    color: Colors.text.primary,
  },
  form: {
    gap: Spacing.lg,
  },
  inputGroup: {
    gap: Spacing.sm,
  },
  input: {
    backgroundColor: Colors.bg.elevated,
    borderRadius: 16,
    padding: Spacing.lg,
    color: Colors.text.primary,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    textAlign: 'center',
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  iconOption: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.bg.elevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  iconOptionActive: {
    borderColor: Colors.text.primary,
    backgroundColor: Colors.bg.primary,
  },
  disabledButton: {
    opacity: 0.5,
  },
});
