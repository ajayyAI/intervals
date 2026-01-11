import { useStore } from '@/store/useStore';
import { Colors, Layout, Spacing, Typography } from '@/theme';
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
  View,
} from 'react-native';
import { Button } from './Button';

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
      <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Ionicons name="checkmark-circle-outline" size={64} color={Colors.accent} />
              </View>
              <Text style={styles.title}>Interval Complete</Text>
              <Text style={styles.statsText}>
                {intervalsCompleted} {intervalsCompleted === 1 ? 'interval' : 'intervals'} done
              </Text>
            </View>

            {/* Note input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Log your progress..."
                placeholderTextColor={Colors.text.muted}
                value={note}
                onChangeText={setNote}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                returnKeyType="done"
                submitBehavior="blurAndSubmit"
                selectionColor={Colors.accent}
              />
            </View>

            {/* Actions */}
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
          </View>
        </KeyboardAvoidingView>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    backgroundColor: Colors.bg.elevated,
    borderRadius: 24,
    padding: Spacing.xl,
    paddingTop: 48,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  iconContainer: {
    marginBottom: Spacing.md,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
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
  },
  inputContainer: {
    marginBottom: Spacing.xl,
  },
  input: {
    backgroundColor: Colors.bg.card,
    borderRadius: Layout.inputRadius,
    padding: Spacing.lg,
    color: Colors.text.primary,
    fontSize: 16,
    minHeight: 100,
  },
  buttonStack: {
    gap: Spacing.sm,
  },
});
