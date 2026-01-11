import { useStore } from '@/store/useStore';
import { Colors, Layout, Spacing, Typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { eachDayOfInterval, format, isSameDay, isToday, startOfDay, subDays } from 'date-fns';
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

    const end = startOfDay(new Date());
    const start = subDays(end, 6);
    const last7Days = eachDayOfInterval({ start, end });

    const dailyActivity = last7Days.map((date) => {
      const daySessions = completed.filter((s) => isSameDay(new Date(s.startedAt), date));
      const seconds = daySessions.reduce((sum, s) => sum + s.totalSeconds, 0);
      return {
        date,
        seconds,
        label: format(date, 'EEEEE'), // S, M, T, W, T, F, S
        isToday: isSameDay(date, new Date()),
      };
    });

    const maxDailySeconds = Math.max(...dailyActivity.map((d) => d.seconds), 1);

    // Weekly totals
    const recentSessions = completed.filter((s) => new Date(s.startedAt) >= start);
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
    } // If has session today, current streak includes today, start checking from today (loop handles it)

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
      dailyActivity,
      maxDailySeconds,
    };
  }, [sessions, notes, projects]);

  const formatHours = (hours: number) => {
    if (hours < 0.1) return '0';
    if (hours < 1) return `${Math.round(hours * 60)}m`;
    return hours.toFixed(1);
  };

  return (
    <View style={styles.container}>
      {/* Header with Streak */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.title}>Insights</Text>
        {stats.streak > 0 && (
          <View style={styles.streakBadge}>
            <Ionicons name="flame" size={18} color={Colors.accent} />
            <Text style={styles.streakText}>{stats.streak}</Text>
          </View>
        )}
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPadding }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Today's Focus */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TODAY</Text>
          <View style={styles.heroStats}>
            <View>
              <Text style={styles.heroValue}>{formatHours(stats.todayHours)}</Text>
              <Text style={styles.heroLabel}>hours focused</Text>
            </View>
            <View style={styles.heroSecondary}>
              <Text style={styles.heroSecondaryValue}>{stats.todayIntervals}</Text>
              <Text style={styles.heroSecondaryLabel}>intervals</Text>
            </View>
          </View>
        </View>

        {/* Weekly Activity Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>THIS WEEK</Text>
          <View style={styles.chartContainer}>
            {stats.dailyActivity.map((day, index) => {
              const heightPercent = Math.max((day.seconds / stats.maxDailySeconds) * 100, 4); // Min height 4%
              return (
                <View key={index} style={styles.chartColumn}>
                  <View style={styles.barContainer}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: `${heightPercent}%`,
                          backgroundColor: day.isToday ? Colors.text.primary : Colors.bg.elevated,
                        },
                      ]}
                    />
                  </View>
                  <Text
                    style={[
                      styles.dayLabel,
                      day.isToday && { color: Colors.text.primary, fontWeight: '600' },
                    ]}
                  >
                    {day.label}
                  </Text>
                </View>
              );
            })}
          </View>
          <View style={styles.weeklySummary}>
            <Text style={styles.weeklySummaryText}>
              <Text style={{ color: Colors.text.primary }}>{stats.weeklyHours}h</Text> total this
              week
            </Text>
          </View>
        </View>

        {/* Projects Breakdown */}
        {stats.projectStats.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>PROJECTS</Text>
            <View style={styles.projectList}>
              {stats.projectStats.map((project) => (
                <View key={project.id} style={styles.projectRow}>
                  <View style={styles.projectInfo}>
                    <View style={styles.projectIcon}>
                      <Ionicons
                        name={project.icon as keyof typeof Ionicons.glyphMap}
                        size={14}
                        color={Colors.text.secondary}
                      />
                    </View>
                    <Text style={styles.projectName} numberOfLines={1}>
                      {project.name}
                    </Text>
                    <Text style={styles.projectHours}>{project.hours}h</Text>
                  </View>
                  <View style={styles.progressBarBg}>
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          width: `${(project.seconds / stats.maxProjectSeconds) * 100}%`,
                        },
                      ]}
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* All Time Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ALL TIME</Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Layout.screenPadding,
    marginBottom: Spacing.lg,
  },
  title: {
    ...Typography.h1,
    color: Colors.text.primary,
    fontSize: 32,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(184, 167, 125, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  streakText: {
    ...Typography.bodySmall,
    color: Colors.accent,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
    fontSize: 15,
  },
  scrollContent: {
    paddingHorizontal: Layout.screenPadding,
  },
  section: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.text.muted,
    letterSpacing: 2,
    marginBottom: Spacing.lg,
  },
  heroStats: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  heroValue: {
    fontSize: 64,
    fontWeight: '200',
    color: Colors.text.primary,
    fontVariant: ['tabular-nums'],
    lineHeight: 70,
    letterSpacing: -1,
  },
  heroLabel: {
    ...Typography.bodySmall,
    color: Colors.text.muted,
    marginTop: 4,
  },
  heroSecondary: {
    alignItems: 'flex-end',
    marginBottom: 6,
  },
  heroSecondaryValue: {
    fontSize: 32,
    fontWeight: '300',
    color: Colors.text.secondary,
    fontVariant: ['tabular-nums'],
  },
  heroSecondaryLabel: {
    ...Typography.caption,
    color: Colors.text.muted,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 120,
    alignItems: 'flex-end',
  },
  chartColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  barContainer: {
    width: 8,
    height: '100%',
    justifyContent: 'flex-end',
    backgroundColor: 'transparent',
    borderRadius: 4,
    overflow: 'hidden',
  },
  bar: {
    width: '100%',
    borderRadius: 4,
  },
  dayLabel: {
    fontSize: 11,
    color: Colors.text.muted,
    fontWeight: '500',
  },
  weeklySummary: {
    marginTop: Spacing.md,
    alignItems: 'flex-end',
  },
  weeklySummaryText: {
    ...Typography.caption,
    color: Colors.text.muted,
  },
  // Projects
  projectList: {
    gap: Spacing.lg,
  },
  projectRow: {
    gap: 8,
  },
  projectInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  projectIcon: {
    width: 24,
    alignItems: 'center',
  },
  projectName: {
    ...Typography.body,
    fontSize: 15,
    color: Colors.text.primary,
    flex: 1,
  },
  projectHours: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
    fontVariant: ['tabular-nums'],
  },
  progressBarBg: {
    height: 4,
    backgroundColor: Colors.bg.elevated,
    borderRadius: 2,
    overflow: 'hidden',
    marginLeft: 34,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.text.secondary,
    borderRadius: 2,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
  },
  statItem: {
    width: '45%',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '300',
    color: Colors.text.primary,
    fontVariant: ['tabular-nums'],
    marginBottom: 4,
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
