import { useStore } from '@/store/useStore';
import { Colors, Layout, Spacing, Typography } from '@/theme';
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
  View,
} from 'react-native';
import { Button } from './Button';
import { Card } from './Card';

interface CheckInModalProps {
  visible: boolean;
  onClose: () => void;
  onContinue: () => void;
  onTakeBreak: () => void;
}

export const CheckInModal: React.FC<CheckInModalProps> = ({
  visible,
  onClose,
  onContinue,
  onTakeBreak,
}) => {
  const { submitCheckIn } = useStore();
  const [note, setNote] = useState('');

  const handleContinue = () => {
    submitCheckIn(note);
    setNote('');
    onContinue();
  };

  const handleTakeBreak = () => {
    submitCheckIn(note);
    setNote('');
    onTakeBreak();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />

        <View style={styles.modalContent}>
          <Card elevated style={styles.card}>
            <Text style={styles.emoji}>✨</Text>
            <Text style={styles.title}>Interval Complete</Text>
            <Text style={styles.subtitle}>What did you accomplish?</Text>

            <TextInput
              style={styles.input}
              placeholder="Quick note (optional)"
              placeholderTextColor={Colors.text.muted}
              value={note}
              onChangeText={setNote}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              returnKeyType="done"
              submitBehavior="blurAndSubmit"
            />

            <View style={styles.buttonRow}>
              <Button
                title="End Session"
                onPress={handleTakeBreak}
                variant="ghost"
                style={styles.button}
              />
              <Button
                title="Continue"
                onPress={handleContinue}
                variant="primary"
                style={styles.button}
              />
            </View>
          </Card>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContent: {
    paddingHorizontal: Layout.screenPadding,
  },
  card: {
    padding: Spacing.xl,
  },
  emoji: {
    fontSize: 40,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.h2,
    color: Colors.text.primary,
    textAlign: 'center',
  },
  subtitle: {
    ...Typography.body,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  input: {
    backgroundColor: Colors.bg.primary,
    borderRadius: 12,
    padding: Spacing.md,
    color: Colors.text.primary,
    fontSize: 16,
    minHeight: 80,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  button: {
    flex: 1,
  },
});
