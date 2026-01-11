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
      color: '#52525B',
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
      <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.modalBody}>
            <View style={styles.header}>
              <Text style={styles.title}>New Project</Text>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={Colors.text.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Project Name"
                  placeholderTextColor={Colors.text.muted}
                  value={name}
                  onChangeText={setName}
                  autoFocus={visible}
                  selectionColor={Colors.accent}
                />
              </View>

              <View style={styles.iconSection}>
                <Text style={styles.sectionLabel}>Icon</Text>
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
                        color={selectedIcon === icon ? Colors.bg.primary : Colors.text.secondary}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
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
          </View>
        </KeyboardAvoidingView>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  modalBody: {
    backgroundColor: Colors.bg.elevated,
    borderRadius: 24,
    padding: Spacing.xl,
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  title: {
    ...Typography.h2,
    color: Colors.text.primary,
  },
  closeButton: {
    padding: 4,
  },
  form: {
    gap: Spacing.xl,
  },
  inputContainer: {
    gap: Spacing.xs,
  },
  input: {
    backgroundColor: Colors.bg.card,
    borderRadius: 16,
    padding: 16,
    color: Colors.text.primary,
    fontSize: 18,
    fontWeight: '500',
  },
  iconSection: {
    gap: 12,
  },
  sectionLabel: {
    ...Typography.caption,
    color: Colors.text.muted,
    marginLeft: 4,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  iconOption: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.bg.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconOptionActive: {
    backgroundColor: Colors.accent,
  },
  disabledButton: {
    opacity: 0.5,
  },
});
