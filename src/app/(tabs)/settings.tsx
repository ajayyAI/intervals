import { Card } from '@/components';
import { AVAILABLE_SOUNDS, type SoundName } from '@/services/audio';
import { useStore } from '@/store/useStore';
import { Colors, Layout, Spacing, Typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer } from 'expo-audio';
import Constants from 'expo-constants';
import * as Haptics from 'expo-haptics';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const INTERVAL_OPTIONS = [15, 20, 25, 30, 45, 60];

// Sound sources for preview
const SOUND_SOURCES: Record<SoundName, number> = {
  glass: require('../../assets/sounds/glass.mp3'),
  wood: require('../../assets/sounds/wood.mp3'),
  bell: require('../../assets/sounds/bell.mp3'),
  chime: require('../../assets/sounds/chime.mp3'),
  bowl: require('../../assets/sounds/bowl.mp3'),
};

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { settings, updateSettings } = useStore();
  const bottomPadding = Math.max(insets.bottom, 16) + 64 + 24;

  // Audio players for each sound (for preview)
  const glassPlayer = useAudioPlayer(SOUND_SOURCES.glass);
  const woodPlayer = useAudioPlayer(SOUND_SOURCES.wood);
  const bellPlayer = useAudioPlayer(SOUND_SOURCES.bell);
  const chimePlayer = useAudioPlayer(SOUND_SOURCES.chime);
  const bowlPlayer = useAudioPlayer(SOUND_SOURCES.bowl);

  const players: Record<SoundName, ReturnType<typeof useAudioPlayer>> = {
    glass: glassPlayer,
    wood: woodPlayer,
    bell: bellPlayer,
    chime: chimePlayer,
    bowl: bowlPlayer,
  };

  const handleIntervalChange = async (minutes: number) => {
    if (settings.hapticEnabled) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    updateSettings({ intervalMinutes: minutes });
  };

  const handleToggle = async (key: keyof typeof settings, value: boolean) => {
    if (key !== 'hapticEnabled' && settings.hapticEnabled) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    updateSettings({ [key]: value });
  };

  const handleSoundSelect = async (soundId: SoundName) => {
    if (settings.hapticEnabled) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    updateSettings({ selectedSound: soundId });

    // Preview the sound
    const player = players[soundId];
    if (player) {
      player.seekTo(0);
      player.play();
    }
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
              onValueChange={(v) => handleToggle('soundEnabled', v)}
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
              onValueChange={(v) => handleToggle('hapticEnabled', v)}
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
              onValueChange={(v) => handleToggle('notificationsEnabled', v)}
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
          <Text style={styles.tagline}>A premium interval focus system</Text>
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
});
