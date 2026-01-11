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
  const { activeSession } = useStore();
  const { submitCheckIn } = useStore();
  const [note, setNote] = useState('');

  const handleContinue = () => {
    submitCheckIn(note);
    setNote('');
    onContinue();
  };

  const handleEndSession = () => {
    submitCheckIn(note);
    setNote('');
    onTakeBreak();
  };

  const intervalsCompleted = activeSession?.intervalsCompleted ?? 0;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />

        <View style={styles.modalContent}>
          <Card elevated style={styles.card}>
            {/* Success indicator */}
            <View style={styles.successBadge}>
              <Text style={styles.successEmoji}>✓</Text>
            </View>

            {/* Header */}
            <Text style={styles.title}>Interval Complete</Text>
            <Text style={styles.statsText}>
              {intervalsCompleted} {intervalsCompleted === 1 ? 'interval' : 'intervals'} done
            </Text>

            {/* Note input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Quick reflection</Text>
              <TextInput
                style={styles.input}
                placeholder="What did you accomplish?"
                placeholderTextColor={Colors.text.muted}
                value={note}
                onChangeText={setNote}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                returnKeyType="done"
                submitBehavior="blurAndSubmit"
              />
            </View>

            {/* Actions - stacked full-width buttons */}
            <View style={styles.buttonStack}>
              <Button
                title="Continue Focus"
                onPress={handleContinue}
                variant="primary"
                size="large"
              />
              <Button
                title="End Session"
                onPress={handleEndSession}
                variant="secondary"
                size="medium"
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
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    paddingHorizontal: Layout.screenPadding,
  },
  card: {
    padding: Spacing.xl,
    paddingTop: Spacing.xxl,
  },
  successBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: Spacing.lg,
  },
  successEmoji: {
    fontSize: 28,
    color: Colors.bg.primary,
    fontWeight: '700',
  },
  title: {
    ...Typography.h2,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  statsText: {
    ...Typography.bodySmall,
    color: Colors.text.muted,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  inputContainer: {
    marginBottom: Spacing.xl,
  },
  inputLabel: {
    ...Typography.caption,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  input: {
    backgroundColor: Colors.bg.primary,
    borderRadius: Layout.inputRadius,
    padding: Spacing.md,
    color: Colors.text.primary,
    fontSize: 16,
    minHeight: 88,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  buttonStack: {
    gap: Spacing.sm,
  },
});
