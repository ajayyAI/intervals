import { type Session, useStore } from '@/store/useStore';
import { Colors, Layout, Spacing, Typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { format, isToday, isYesterday } from 'date-fns';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const { sessions, notes, projects } = useStore();
  const bottomPadding = Math.max(insets.bottom, 16) + 64 + 24;

  const completedSessions = sessions.filter((s) => s.status === 'completed');

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMM d');
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    const remainMins = mins % 60;
    return `${hrs}h ${remainMins}m`;
  };

  const getSessionNotes = (sessionId: string) => {
    return notes.filter((n) => n.sessionId === sessionId);
  };

  const getProject = (projectId: string) => {
    return projects.find((p) => p.id === projectId);
  };

  const renderSession = ({ item }: { item: Session }) => {
    const sessionNotes = getSessionNotes(item.id);
    // Use snapshot or fallback to current project list
    const projectSnapshot = item.projectSnapshot;
    const currentProject = getProject(item.projectId);

    const displayProject =
      projectSnapshot ||
      (currentProject
        ? {
            name: currentProject.name,
            icon: currentProject.icon,
            color: currentProject.color,
          }
        : null);

    return (
      <View style={styles.sessionRow}>
        <View style={styles.sessionMain}>
          <View style={styles.sessionHeader}>
            <View style={styles.sessionLabelRow}>
              {displayProject && (
                <View style={styles.projectBadge}>
                  <Ionicons
                    name={displayProject.icon as keyof typeof Ionicons.glyphMap}
                    size={14}
                    color={Colors.text.secondary}
                  />
                </View>
              )}
              <Text style={styles.sessionLabel} numberOfLines={1}>
                {displayProject ? displayProject.name : item.label}
              </Text>
            </View>
            <Text style={styles.sessionDuration}>{formatDuration(item.totalSeconds)}</Text>
          </View>

          <View style={styles.sessionMeta}>
            <Text style={styles.sessionDate}>{formatDate(item.startedAt)}</Text>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.sessionIntervals}>{item.intervalsCompleted} intervals</Text>
          </View>

          {sessionNotes.length > 0 && (
            <View style={styles.notesIndicator}>
              <Ionicons name="document-text" size={14} color={Colors.text.muted} />
              <Text style={styles.notesCount}>{sessionNotes.length} notes</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 32 }]}>
        <Text style={styles.title}>History</Text>
        <Text style={styles.subtitle}>{completedSessions.length} sessions</Text>
      </View>

      <FlashList
        data={completedSessions}
        renderItem={renderSession}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: Layout.screenPadding,
          paddingBottom: bottomPadding,
        }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No sessions yet</Text>
            <Text style={styles.emptyHint}>Complete a focus session to see it here</Text>
          </View>
        }
      />
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    ...Typography.h1,
    color: Colors.text.primary,
    fontSize: 32,
  },
  subtitle: {
    ...Typography.caption,
    color: Colors.text.muted,
  },
  sessionRow: {
    marginBottom: Spacing.xl,
    paddingBottom: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.bg.elevated, // Very subtle separator
  },
  sessionMain: {
    gap: 8,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 16,
  },
  projectBadge: {
    width: 24,
    alignItems: 'flex-start',
  },
  sessionLabel: {
    ...Typography.body,
    fontSize: 17,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  sessionDuration: {
    ...Typography.body,
    color: Colors.text.primary,
    fontVariant: ['tabular-nums'],
    fontWeight: '500',
  },
  sessionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 36, // Align with text start (24 icon + 12 gap)
  },
  sessionDate: {
    ...Typography.caption,
    color: Colors.text.muted,
  },
  bullet: {
    ...Typography.caption,
    color: Colors.text.muted,
  },
  sessionIntervals: {
    ...Typography.caption,
    color: Colors.text.muted,
  },
  notesIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingLeft: 36,
    marginTop: 4,
  },
  notesCount: {
    ...Typography.caption,
    color: Colors.text.muted,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxxl,
  },
  emptyText: {
    ...Typography.h3,
    color: Colors.text.secondary,
  },
  emptyHint: {
    ...Typography.bodySmall,
    color: Colors.text.muted,
    marginTop: Spacing.sm,
  },
});
