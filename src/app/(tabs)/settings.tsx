import { Card } from '@/components';
import { useHaptics } from '@/hooks/useHaptics';
import { useSoundPreview } from '@/hooks/useSounds';
import { AVAILABLE_SOUNDS, type SoundName } from '@/services/audio';
import { requestNotificationPermissions } from '@/services/notifications';
import { useStore } from '@/store/useStore';
import { Colors, Layout, Spacing, Typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useState } from 'react';
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const INTERVAL_OPTIONS = [1, 15, 20, 25, 30, 45, 60];

const PROJECT_ICONS = [
  'briefcase-outline',
  'book-outline',
  'person-outline',
  'brush-outline',
  'code-slash-outline',
  'fitness-outline',
  'home-outline',
  'globe-outline',
];

// Projects Section Component
const ProjectsSection = () => {
  const { projects, createProject, deleteProject } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(PROJECT_ICONS[0]);
  const haptics = useHaptics();

  const handleAdd = () => {
    if (!newName.trim()) return;
    haptics.impact('medium');
    createProject({
      name: newName.trim(),
      color: '#52525B',
      icon: selectedIcon,
    });
    setNewName('');
    setIsAdding(false);
    setSelectedIcon(PROJECT_ICONS[0]);
  };

  const handleDelete = (id: string, name: string) => {
    haptics.impact('light');
    Alert.alert('Delete Project', `Remove "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteProject(id),
      },
    ]);
  };

  return (
    <Card style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name="folder-outline" size={20} color={Colors.text.secondary} />
        <Text style={styles.sectionTitle}>Projects</Text>
      </View>
      <Text style={styles.sectionHint}>Categories for your focus sessions</Text>

      {/* Project List */}
      <View style={styles.projectList}>
        {projects.map((project) => (
          <View key={project.id} style={styles.projectRow}>
            <View style={styles.projectInfo}>
              <Ionicons
                name={project.icon as keyof typeof Ionicons.glyphMap}
                size={18}
                color={Colors.text.secondary}
              />
              <Text style={styles.projectLabel}>{project.name}</Text>
            </View>
            {!project.isDefault && (
              <TouchableOpacity
                onPress={() => handleDelete(project.id, project.name)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close-circle" size={20} color={Colors.text.muted} />
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>

      {/* Add Project */}
      {isAdding ? (
        <View style={styles.addForm}>
          <TextInput
            style={styles.addInput}
            placeholder="Project name"
            placeholderTextColor={Colors.text.muted}
            value={newName}
            onChangeText={setNewName}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleAdd}
          />
          <View style={styles.iconPicker}>
            {PROJECT_ICONS.map((icon) => (
              <TouchableOpacity
                key={icon}
                onPress={() => setSelectedIcon(icon)}
                style={[styles.iconOption, selectedIcon === icon && styles.iconOptionActive]}
              >
                <Ionicons
                  name={icon as keyof typeof Ionicons.glyphMap}
                  size={18}
                  color={selectedIcon === icon ? Colors.text.primary : Colors.text.muted}
                />
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.addActions}>
            <TouchableOpacity onPress={() => setIsAdding(false)} style={styles.addCancelBtn}>
              <Text style={styles.addCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleAdd}
              style={[styles.addSaveBtn, !newName.trim() && styles.addSaveBtnDisabled]}
              disabled={!newName.trim()}
            >
              <Text style={styles.addSaveText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          onPress={() => {
            haptics.selection();
            setIsAdding(true);
          }}
          style={styles.addButton}
        >
          <Ionicons name="add" size={18} color={Colors.text.secondary} />
          <Text style={styles.addButtonText}>Add Project</Text>
        </TouchableOpacity>
      )}
    </Card>
  );
};

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { settings, updateSettings } = useStore();
  const bottomPadding = Math.max(insets.bottom, 16) + 64 + 24;

  const haptics = useHaptics();
  const { playSound } = useSoundPreview();

  const handleIntervalChange = (minutes: number) => {
    haptics.selection();
    updateSettings({ intervalMinutes: minutes });
  };

  const handleHapticToggle = (value: boolean) => {
    haptics.impact('light', true);
    updateSettings({ hapticEnabled: value });
  };

  const handleSoundToggle = (value: boolean) => {
    haptics.impact('light');
    updateSettings({ soundEnabled: value });
  };

  const handleNotificationToggle = async (value: boolean) => {
    haptics.impact('light');

    if (value) {
      const granted = await requestNotificationPermissions();
      if (!granted) {
        Alert.alert(
          'Notifications Disabled',
          'Please enable notifications in your device settings to receive interval alerts.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ]
        );
        return;
      }
    }

    updateSettings({ notificationsEnabled: value });
  };

  const handleSoundSelect = (soundId: SoundName) => {
    haptics.selection();
    updateSettings({ selectedSound: soundId });
    playSound(soundId);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPadding }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <Text style={styles.title}>Settings</Text>
        </View>

        {/* Interval Duration */}
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="timer-outline" size={20} color={Colors.text.secondary} />
            <Text style={styles.sectionTitle}>Interval Duration</Text>
          </View>
          <Text style={styles.sectionHint}>Time between check-ins</Text>

          <View style={styles.intervalGrid}>
            {INTERVAL_OPTIONS.map((minutes) => (
              <TouchableOpacity
                key={minutes}
                onPress={() => handleIntervalChange(minutes)}
                style={[
                  styles.intervalButton,
                  settings.intervalMinutes === minutes && styles.intervalButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.intervalText,
                    settings.intervalMinutes === minutes && styles.intervalTextActive,
                  ]}
                >
                  {minutes}
                </Text>
                <Text
                  style={[
                    styles.intervalUnit,
                    settings.intervalMinutes === minutes && styles.intervalUnitActive,
                  ]}
                >
                  min
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Projects */}
        <ProjectsSection />

        {/* Sound & Notifications */}
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="notifications-outline" size={20} color={Colors.text.secondary} />
            <Text style={styles.sectionTitle}>Alerts</Text>
          </View>

          <View style={styles.toggleRow}>
            <View>
              <Text style={styles.toggleLabel}>Sound</Text>
              <Text style={styles.toggleHint}>Play chime at intervals</Text>
            </View>
            <Switch
              value={settings.soundEnabled}
              onValueChange={handleSoundToggle}
              trackColor={{ false: Colors.bg.elevated, true: Colors.text.muted }}
              thumbColor={settings.soundEnabled ? Colors.text.primary : Colors.text.secondary}
            />
          </View>

          {/* Sound Selection */}
          {settings.soundEnabled && (
            <View style={styles.soundGrid}>
              {AVAILABLE_SOUNDS.map((sound) => {
                const isSelected = settings.selectedSound === sound.id;
                return (
                  <TouchableOpacity
                    key={sound.id}
                    onPress={() => handleSoundSelect(sound.id)}
                    style={[styles.soundButton, isSelected && styles.soundButtonActive]}
                  >
                    <Ionicons
                      name={isSelected ? 'musical-notes' : 'musical-notes-outline'}
                      size={18}
                      color={isSelected ? Colors.bg.primary : Colors.text.secondary}
                    />
                    <Text style={[styles.soundText, isSelected && styles.soundTextActive]}>
                      {sound.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          <View style={styles.divider} />

          <View style={styles.toggleRow}>
            <View>
              <Text style={styles.toggleLabel}>Haptic</Text>
              <Text style={styles.toggleHint}>Vibration feedback</Text>
            </View>
            <Switch
              value={settings.hapticEnabled}
              onValueChange={handleHapticToggle}
              trackColor={{ false: Colors.bg.elevated, true: Colors.text.muted }}
              thumbColor={settings.hapticEnabled ? Colors.text.primary : Colors.text.secondary}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.toggleRow}>
            <View>
              <Text style={styles.toggleLabel}>Notifications</Text>
              <Text style={styles.toggleHint}>Background alerts</Text>
            </View>
            <Switch
              value={settings.notificationsEnabled}
              onValueChange={handleNotificationToggle}
              trackColor={{ false: Colors.bg.elevated, true: Colors.text.muted }}
              thumbColor={
                settings.notificationsEnabled ? Colors.text.primary : Colors.text.secondary
              }
            />
          </View>
        </Card>

        {/* About */}
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle-outline" size={20} color={Colors.text.secondary} />
            <Text style={styles.sectionTitle}>About</Text>
          </View>
          <Text style={styles.versionText}>
            Intervals v{Constants.expoConfig?.version ?? '1.0.0'}
          </Text>
          <Text style={styles.tagline}>An interval focus system</Text>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg.primary,
  },
  scrollContent: {
    padding: Layout.screenPadding,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  title: {
    ...Typography.h1,
    color: Colors.text.primary,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  sectionTitle: {
    ...Typography.title,
    color: Colors.text.primary,
  },
  sectionHint: {
    ...Typography.caption,
    color: Colors.text.muted,
    marginBottom: Spacing.lg,
  },
  intervalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  intervalButton: {
    backgroundColor: Colors.bg.primary,
    borderRadius: 16,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    minWidth: 72,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  intervalButtonActive: {
    backgroundColor: Colors.text.primary,
    borderColor: Colors.text.primary,
  },
  intervalText: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  intervalTextActive: {
    color: Colors.bg.primary,
  },
  intervalUnit: {
    ...Typography.caption,
    color: Colors.text.muted,
    marginTop: 2,
  },
  intervalUnitActive: {
    color: Colors.bg.primary,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  toggleLabel: {
    ...Typography.body,
    color: Colors.text.primary,
  },
  toggleHint: {
    ...Typography.caption,
    color: Colors.text.muted,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.sm,
  },
  soundGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    marginTop: Spacing.xs,
  },
  soundButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bg.elevated,
    borderRadius: 12,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  soundButtonActive: {
    backgroundColor: Colors.text.primary,
  },
  soundText: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
  },
  soundTextActive: {
    color: Colors.bg.primary,
    fontWeight: '600',
  },
  versionText: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
    marginTop: Spacing.sm,
  },
  tagline: {
    ...Typography.caption,
    color: Colors.text.muted,
    marginTop: Spacing.xs,
  },
  // Projects section
  projectList: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  projectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.bg.primary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  projectInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  projectLabel: {
    ...Typography.body,
    color: Colors.text.primary,
  },
  addForm: {
    gap: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.bg.primary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  addInput: {
    backgroundColor: Colors.bg.elevated,
    borderRadius: 8,
    padding: Spacing.md,
    color: Colors.text.primary,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  iconPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  iconOption: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.bg.elevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  iconOptionActive: {
    borderColor: Colors.text.primary,
  },
  addActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.sm,
  },
  addCancelBtn: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  addCancelText: {
    ...Typography.body,
    color: Colors.text.muted,
  },
  addSaveBtn: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.text.primary,
    borderRadius: 8,
  },
  addSaveBtnDisabled: {
    opacity: 0.5,
  },
  addSaveText: {
    ...Typography.body,
    color: Colors.bg.primary,
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.bg.primary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  addButtonText: {
    ...Typography.body,
    color: Colors.text.secondary,
  },
});
