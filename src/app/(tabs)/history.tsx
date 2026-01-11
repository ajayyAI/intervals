import { Card } from '@/components';
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
    const project = getProject(item.projectId);

    return (
      <Card style={styles.sessionCard}>
        <View style={styles.sessionHeader}>
          <View style={styles.sessionLabelRow}>
            {project && (
              <View style={styles.projectBadge}>
                <Ionicons
                  name={project.icon as keyof typeof Ionicons.glyphMap}
                  size={12}
                  color={Colors.text.secondary}
                />
              </View>
            )}
            <Text style={styles.sessionLabel}>{item.label}</Text>
          </View>
          <Text style={styles.sessionDate}>{formatDate(item.startedAt)}</Text>
        </View>

        <View style={styles.sessionStats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{item.intervalsCompleted}</Text>
            <Text style={styles.statLabel}>Intervals</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{formatDuration(item.totalSeconds)}</Text>
            <Text style={styles.statLabel}>Duration</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{sessionNotes.length}</Text>
            <Text style={styles.statLabel}>Notes</Text>
          </View>
        </View>

        {sessionNotes.length > 0 && (
          <View style={styles.notesContainer}>
            {sessionNotes.slice(0, 2).map((note) => (
              <Text key={note.id} style={styles.noteText} numberOfLines={1}>
                • {note.note}
              </Text>
            ))}
            {sessionNotes.length > 2 && (
              <Text style={styles.moreNotes}>+{sessionNotes.length - 2} more</Text>
            )}
          </View>
        )}
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
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
  },
  title: {
    ...Typography.h1,
    color: Colors.text.primary,
  },
  subtitle: {
    ...Typography.bodySmall,
    color: Colors.text.muted,
    marginTop: Spacing.xs,
  },
  sessionCard: {
    marginBottom: Spacing.md,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sessionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  projectBadge: {
    width: 22,
    height: 22,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bg.elevated,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sessionLabel: {
    ...Typography.title,
    color: Colors.text.primary,
  },
  sessionDate: {
    ...Typography.caption,
    color: Colors.text.muted,
  },
  sessionStats: {
    flexDirection: 'row',
    gap: Spacing.xl,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.text.muted,
    marginTop: 2,
  },
  notesContainer: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  noteText: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  moreNotes: {
    ...Typography.caption,
    color: Colors.text.secondary,
    marginTop: 4,
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
