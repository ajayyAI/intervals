import { Card } from '@/components';
import { useStore } from '@/store/useStore';
import { Colors, Layout, Spacing, Typography } from '@/theme';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function InsightsScreen() {
  const { sessions, notes } = useStore();

  const stats = useMemo(() => {
    const completed = sessions.filter((s) => s.status === 'completed');
    const totalSeconds = completed.reduce((sum, s) => sum + s.totalSeconds, 0);
    const totalIntervals = completed.reduce((sum, s) => sum + s.intervalsCompleted, 0);

    // Last 7 days
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recentSessions = completed.filter((s) => new Date(s.startedAt) >= weekAgo);
    const recentSeconds = recentSessions.reduce((sum, s) => sum + s.totalSeconds, 0);

    return {
      totalSessions: completed.length,
      totalHours: Math.round((totalSeconds / 3600) * 10) / 10,
      totalIntervals,
      totalNotes: notes.length,
      weeklyHours: Math.round((recentSeconds / 3600) * 10) / 10,
      weeklySessions: recentSessions.length,
    };
  }, [sessions, notes]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Insights</Text>
        </View>

        {/* This Week */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>This Week</Text>
          <View style={styles.statGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.weeklyHours}</Text>
              <Text style={styles.statLabel}>Hours</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.weeklySessions}</Text>
              <Text style={styles.statLabel}>Sessions</Text>
            </View>
          </View>
        </Card>

        {/* All Time */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>All Time</Text>
          <View style={styles.statGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.totalHours}</Text>
              <Text style={styles.statLabel}>Hours</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.totalSessions}</Text>
              <Text style={styles.statLabel}>Sessions</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.totalIntervals}</Text>
              <Text style={styles.statLabel}>Intervals</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.totalNotes}</Text>
              <Text style={styles.statLabel}>Notes</Text>
            </View>
          </View>
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
  sectionTitle: {
    ...Typography.labelUppercase,
    color: Colors.text.muted,
    marginBottom: Spacing.lg,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xl,
  },
  statItem: {
    flex: 1,
    minWidth: 80,
    alignItems: 'center',
  },
  statValue: {
    ...Typography.countdown,
    color: Colors.text.primary,
    fontSize: 40,
  },
  statLabel: {
    ...Typography.labelSmall,
    color: Colors.text.muted,
    marginTop: Spacing.xs,
  },
});
