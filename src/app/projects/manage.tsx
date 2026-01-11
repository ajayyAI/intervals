import { CreateProjectModal } from '@/components';
import { useHaptics } from '@/hooks/useHaptics';
import { useStore } from '@/store/useStore';
import { Colors, Layout, Spacing, Typography } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ManageProjectsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { projects, deleteProject } = useStore();
  const [isCreateModalVisible, setCreateModalVisible] = useState(false);
  const haptics = useHaptics();

  const handleBack = () => {
    haptics.impact('light');
    router.back();
  };

  const handleDelete = (id: string, name: string) => {
    haptics.impact('light');
    Alert.alert('Delete Project', `Remove "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          haptics.notification('success');
          deleteProject(id);
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: (typeof projects)[0] }) => (
    <View style={styles.projectRow}>
      <View style={styles.projectInfo}>
        <View style={styles.projectIconBadge}>
          <Ionicons
            name={item.icon as keyof typeof Ionicons.glyphMap}
            size={18}
            color={Colors.text.primary}
          />
        </View>
        <Text style={styles.projectLabel}>{item.name}</Text>
      </View>
      {!item.isDefault && (
        <TouchableOpacity
          onPress={() => handleDelete(item.id, item.name)}
          style={styles.deleteButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="trash-outline" size={20} color={Colors.text.muted} />
        </TouchableOpacity>
      )}
      {item.isDefault && (
        <Ionicons
          name="lock-closed-outline"
          size={16}
          color={Colors.text.muted}
          style={{ opacity: 0.5, marginRight: 8 }}
        />
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Manage Projects</Text>
        <TouchableOpacity
          onPress={() => {
            haptics.impact('medium');
            setCreateModalVisible(true);
          }}
          style={styles.addButton}
        >
          <Ionicons name="add" size={24} color={Colors.text.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={projects}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      />

      <CreateProjectModal
        visible={isCreateModalVisible}
        onClose={() => setCreateModalVisible(false)}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Layout.screenPadding,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: 4,
    marginLeft: -4,
  },
  addButton: {
    padding: 4,
    marginRight: -4,
  },
  title: {
    ...Typography.h3,
    color: Colors.text.primary,
  },
  listContent: {
    padding: Layout.screenPadding,
    gap: Spacing.sm,
  },
  projectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: Colors.bg.elevated,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  projectInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  projectIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.bg.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  projectLabel: {
    ...Typography.body,
    fontSize: 16,
    color: Colors.text.primary,
    fontWeight: '500',
  },
  deleteButton: {
    padding: 8,
    marginRight: -8,
  },
});
