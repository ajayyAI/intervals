import { Card } from '@/components';
import { useStore } from '@/store/useStore';
import { Colors, Layout, Spacing, Typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import * as Haptics from 'expo-haptics';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const INTERVAL_OPTIONS = [15, 20, 25, 30, 45, 60];

export default function SettingsScreen() {
  const { settings, updateSettings } = useStore();

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

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
        </View>

        {/* Interval Duration */}
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="timer-outline" size={20} color={Colors.accent} />
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
            <Ionicons name="notifications-outline" size={20} color={Colors.accent} />
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
              trackColor={{ false: Colors.bg.elevated, true: Colors.accent }}
              thumbColor={Colors.text.primary}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.toggleRow}>
            <View>
              <Text style={styles.toggleLabel}>Haptic</Text>
              <Text style={styles.toggleHint}>Vibration feedback</Text>
            </View>
            <Switch
              value={settings.hapticEnabled}
              onValueChange={(v) => handleToggle('hapticEnabled', v)}
              trackColor={{ false: Colors.bg.elevated, true: Colors.accent }}
              thumbColor={Colors.text.primary}
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
              trackColor={{ false: Colors.bg.elevated, true: Colors.accent }}
              thumbColor={Colors.text.primary}
            />
          </View>
        </Card>

        {/* About */}
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle-outline" size={20} color={Colors.accent} />
            <Text style={styles.sectionTitle}>About</Text>
          </View>
          <Text style={styles.versionText}>
            Intervals v{Constants.expoConfig?.version ?? '1.0.0'}
          </Text>
          <Text style={styles.tagline}>A premium interval focus system</Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg.primary,
  },
  scrollContent: {
    padding: Layout.screenPadding,
    paddingBottom: 100,
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
    borderRadius: Layout.buttonRadius,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    minWidth: 72,
  },
  intervalButtonActive: {
    backgroundColor: Colors.accent,
  },
  intervalText: {
    ...Typography.intervalSmall,
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
