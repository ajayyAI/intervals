import { Card } from '@/components';
import { useStore } from '@/store/useStore';
import { Colors, Layout, Spacing, Typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { isToday, startOfDay, subDays } from 'date-fns';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function InsightsScreen() {
  const insets = useSafeAreaInsets();
  const { sessions, notes, projects } = useStore();
  const bottomPadding = Math.max(insets.bottom, 16) + 64 + 24;

  const stats = useMemo(() => {
    const completed = sessions.filter((s) => s.status === 'completed');
    const totalSeconds = completed.reduce((sum, s) => sum + s.totalSeconds, 0);
    const totalIntervals = completed.reduce((sum, s) => sum + s.intervalsCompleted, 0);

    // Today's stats
    const todaySessions = completed.filter((s) => isToday(new Date(s.startedAt)));
    const todaySeconds = todaySessions.reduce((sum, s) => sum + s.totalSeconds, 0);
    const todayIntervals = todaySessions.reduce((sum, s) => sum + s.intervalsCompleted, 0);

    // Last 7 days
    const weekAgo = subDays(new Date(), 7);
    const recentSessions = completed.filter((s) => new Date(s.startedAt) >= weekAgo);
    const recentSeconds = recentSessions.reduce((sum, s) => sum + s.totalSeconds, 0);

    // Project breakdown (this week)
    const projectStats = projects
      .map((project) => {
        const projectSessions = recentSessions.filter((s) => s.projectId === project.id);
        const seconds = projectSessions.reduce((sum, s) => sum + s.totalSeconds, 0);
        return {
          ...project,
          seconds,
          hours: Math.round((seconds / 3600) * 10) / 10,
          sessions: projectSessions.length,
        };
      })
      .filter((p) => p.seconds > 0)
      .sort((a, b) => b.seconds - a.seconds);

    const maxProjectSeconds = Math.max(...projectStats.map((p) => p.seconds), 1);

    // Streak calculation
    let streak = 0;
    let checkDate = startOfDay(new Date());

    // Check if there's a session today first
    const hasSessionToday = todaySessions.length > 0;
    if (!hasSessionToday) {
      // If no session today, start checking from yesterday
      checkDate = subDays(checkDate, 1);
    }

    while (true) {
      const dayStart = startOfDay(checkDate);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const hasSession = completed.some((s) => {
        const sessionDate = new Date(s.startedAt);
        return sessionDate >= dayStart && sessionDate < dayEnd;
      });

      if (hasSession) {
        streak++;
        checkDate = subDays(checkDate, 1);
      } else {
        break;
      }
    }

    return {
      totalSessions: completed.length,
      totalHours: Math.round((totalSeconds / 3600) * 10) / 10,
      totalIntervals,
      totalNotes: notes.length,
      weeklyHours: Math.round((recentSeconds / 3600) * 10) / 10,
      weeklySessions: recentSessions.length,
      todayHours: Math.round((todaySeconds / 3600) * 10) / 10,
      todayIntervals,
      projectStats,
      maxProjectSeconds,
      streak,
    };
  }, [sessions, notes, projects]);

  const formatHours = (hours: number) => {
    if (hours < 0.1) return '0';
    if (hours < 1) return `${Math.round(hours * 60)}m`;
    return hours.toFixed(1);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPadding }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <Text style={styles.title}>Insights</Text>
        </View>

        {/* Today's Focus */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Today</Text>
          <View style={styles.todayStats}>
            <View style={styles.todayMain}>
              <Text style={styles.todayHours}>{formatHours(stats.todayHours)}</Text>
              <Text style={styles.todayLabel}>hours focused</Text>
            </View>
            <View style={styles.todaySecondary}>
              <Text style={styles.todayIntervals}>{stats.todayIntervals}</Text>
              <Text style={styles.todayIntervalsLabel}>intervals</Text>
            </View>
          </View>
        </Card>

        {/* Streak */}
        {stats.streak > 0 && (
          <Card style={styles.streakCard}>
            <View style={styles.streakContent}>
              <View style={styles.streakIcon}>
                <Ionicons name="flash" size={22} color={Colors.text.secondary} />
              </View>
              <View>
                <Text style={styles.streakValue}>{stats.streak} day streak</Text>
                <Text style={styles.streakHint}>Keep the momentum going!</Text>
              </View>
            </View>
          </Card>
        )}

        {/* Projects Breakdown */}
        {stats.projectStats.length > 0 && (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>This Week by Project</Text>
            <View style={styles.projectList}>
              {stats.projectStats.map((project) => (
                <View key={project.id} style={styles.projectRow}>
                  <View style={styles.projectInfo}>
                    <Ionicons
                      name={project.icon as keyof typeof Ionicons.glyphMap}
                      size={16}
                      color={Colors.text.muted}
                    />
                    <Text style={styles.projectName}>{project.name}</Text>
                    <Text style={styles.projectHours}>{project.hours}h</Text>
                  </View>
                  <View style={styles.progressBarBg}>
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          backgroundColor: Colors.text.secondary,
                          width: `${(project.seconds / stats.maxProjectSeconds) * 100}%`,
                        },
                      ]}
                    />
                  </View>
                </View>
              ))}
            </View>
          </Card>
        )}

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
  sectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.text.muted,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: Spacing.lg,
  },
  // Today's stats
  todayStats: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  todayMain: {
    flex: 1,
  },
  todayHours: {
    fontSize: 56,
    fontWeight: '200',
    color: Colors.text.primary,
    fontVariant: ['tabular-nums'],
    lineHeight: 60,
  },
  todayLabel: {
    ...Typography.bodySmall,
    color: Colors.text.muted,
    marginTop: Spacing.xs,
  },
  todaySecondary: {
    alignItems: 'flex-end',
  },
  todayIntervals: {
    fontSize: 24,
    fontWeight: '300',
    color: Colors.text.secondary,
    fontVariant: ['tabular-nums'],
  },
  todayIntervalsLabel: {
    ...Typography.caption,
    color: Colors.text.muted,
  },
  // Streak
  streakCard: {
    marginBottom: Spacing.lg,
  },
  streakContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  streakIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.bg.primary,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakValue: {
    ...Typography.title,
    color: Colors.text.primary,
  },
  streakHint: {
    ...Typography.caption,
    color: Colors.text.muted,
  },
  // Project breakdown
  projectList: {
    gap: Spacing.md,
  },
  projectRow: {
    gap: Spacing.sm,
  },
  projectInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },

  projectName: {
    ...Typography.bodySmall,
    color: Colors.text.primary,
    flex: 1,
  },
  projectHours: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
    fontVariant: ['tabular-nums'],
  },
  progressBarBg: {
    height: 6,
    backgroundColor: Colors.bg.primary,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  // Stat grid
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
    fontSize: 36,
    fontWeight: '300',
    color: Colors.text.primary,
    fontVariant: ['tabular-nums'],
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.text.muted,
    letterSpacing: 0.5,
    marginTop: Spacing.xs,
    textTransform: 'uppercase',
  },
});
