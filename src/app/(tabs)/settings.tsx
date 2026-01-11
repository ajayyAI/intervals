import { useHaptics } from '@/hooks/useHaptics';
import { useSoundPreview } from '@/hooks/useSounds';
import { AVAILABLE_SOUNDS, type SoundName } from '@/services/audio';
import { requestNotificationPermissions } from '@/services/notifications';
import { useStore } from '@/store/useStore';
import { Colors, Layout, Spacing, Typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const INTERVAL_OPTIONS = [1, 15, 20, 25, 30, 45, 60];

// Projects Section Component
const ProjectsSection = () => {
  const { projects } = useStore();
  const router = useRouter();
  const haptics = useHaptics();

  const handleManage = () => {
    haptics.impact('light');
    router.push('/projects/manage');
  };

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionHeaderTitle}>PROJECTS</Text>
      <TouchableOpacity onPress={handleManage} style={styles.manageButton}>
        <View style={styles.manageContent}>
          <View style={styles.manageIconBg}>
            <Ionicons name="folder-open-outline" size={20} color={Colors.text.primary} />
          </View>
          <View>
            <Text style={styles.manageTitle}>Manage Projects</Text>
            <Text style={styles.manageSubtitle}>{projects.length} active categories</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={16} color={Colors.text.muted} />
      </TouchableOpacity>
    </View>
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
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPadding }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Interval Duration */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeaderTitle}>INTERVAL LENGTH</Text>
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
        </View>

        {/* Projects */}
        <ProjectsSection />

        {/* Sound & Notifications */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeaderTitle}>PREFERENCES</Text>

          <View style={styles.preferenceGroup}>
            {/* Sound Toggle */}
            <View style={styles.toggleRow}>
              <View>
                <Text style={styles.toggleLabel}>Sound</Text>
                <Text style={styles.toggleHint}>Chime at intervals</Text>
              </View>
              <Switch
                value={settings.soundEnabled}
                onValueChange={handleSoundToggle}
                trackColor={{ false: Colors.bg.card, true: Colors.text.secondary }}
                thumbColor={settings.soundEnabled ? Colors.text.primary : Colors.text.muted}
              />
            </View>

            {/* Sound Selection */}
            {settings.soundEnabled && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.soundScroll}
              >
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
                        size={16}
                        color={isSelected ? Colors.bg.primary : Colors.text.secondary}
                      />
                      <Text style={[styles.soundText, isSelected && styles.soundTextActive]}>
                        {sound.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}

            <View style={styles.divider} />

            {/* Haptic Toggle */}
            <View style={styles.toggleRow}>
              <View>
                <Text style={styles.toggleLabel}>Haptic</Text>
                <Text style={styles.toggleHint}>Vibration feedback</Text>
              </View>
              <Switch
                value={settings.hapticEnabled}
                onValueChange={handleHapticToggle}
                trackColor={{ false: Colors.bg.card, true: Colors.text.secondary }}
                thumbColor={settings.hapticEnabled ? Colors.text.primary : Colors.text.muted}
              />
            </View>

            <View style={styles.divider} />

            {/* Notification Toggle */}
            <View style={styles.toggleRow}>
              <View>
                <Text style={styles.toggleLabel}>Notifications</Text>
                <Text style={styles.toggleHint}>Background alerts</Text>
              </View>
              <Switch
                value={settings.notificationsEnabled}
                onValueChange={handleNotificationToggle}
                trackColor={{ false: Colors.bg.card, true: Colors.text.secondary }}
                thumbColor={settings.notificationsEnabled ? Colors.text.primary : Colors.text.muted}
              />
            </View>
          </View>
        </View>

        {/* About */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeaderTitle}>ABOUT</Text>
          <View style={styles.aboutContainer}>
            <Text style={styles.versionText}>
              Intervals v{Constants.expoConfig?.version ?? '1.0.0'}
            </Text>
            <Text style={styles.tagline}>Focus Rituals</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg.primary,
  },
  header: {
    paddingHorizontal: Layout.screenPadding,
    paddingBottom: Spacing.lg,
  },
  title: {
    ...Typography.h1,
    color: Colors.text.primary,
    fontSize: 32,
  },
  scrollContent: {
    paddingHorizontal: Layout.screenPadding,
  },
  sectionContainer: {
    marginBottom: 40,
  },
  sectionHeaderTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.text.muted,
    letterSpacing: 2,
    marginBottom: Spacing.md,
  },

  // Interval
  intervalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  intervalButton: {
    backgroundColor: Colors.bg.elevated,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    minWidth: 72,
    flex: 1,
  },
  intervalButtonActive: {
    backgroundColor: Colors.text.primary,
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

  // Projects
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: Colors.bg.elevated,
    borderRadius: 20,
  },
  manageContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  manageIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.bg.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  manageTitle: {
    ...Typography.body,
    color: Colors.text.primary,
    fontWeight: '500',
    fontSize: 16,
  },
  manageSubtitle: {
    ...Typography.caption,
    color: Colors.text.muted,
  },

  // Preferences
  preferenceGroup: {
    backgroundColor: Colors.bg.elevated,
    borderRadius: 24,
    padding: 8,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  toggleLabel: {
    ...Typography.body,
    fontWeight: '500',
    color: Colors.text.primary,
    fontSize: 16,
  },
  toggleHint: {
    ...Typography.caption,
    color: Colors.text.muted,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.bg.primary, // Cutout effect
    marginHorizontal: 16,
  },
  soundScroll: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
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
    backgroundColor: Colors.bg.card,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 6,
  },
  soundButtonActive: {
    backgroundColor: Colors.text.primary,
  },
  soundText: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  soundTextActive: {
    color: Colors.bg.primary,
  },

  // About
  aboutContainer: {
    alignItems: 'flex-start',
  },
  versionText: {
    ...Typography.body,
    color: Colors.text.secondary,
  },
  tagline: {
    ...Typography.caption,
    color: Colors.text.muted,
  },
});
