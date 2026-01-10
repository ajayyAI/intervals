import { Colors } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 16);

  return (
    <View style={styles.container}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            position: 'absolute',
            bottom: bottomPadding,
            left: 20,
            right: 20,
            height: 64,
            backgroundColor: Colors.bg.tabBar,
            borderRadius: 32,
            borderTopWidth: 0,
            borderWidth: 1,
            borderColor: Colors.border,
            paddingHorizontal: 8,
            elevation: 0,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 16,
          },
          tabBarItemStyle: {
            paddingVertical: 8,
            borderRadius: 24,
            marginHorizontal: 4,
          },
          tabBarActiveTintColor: Colors.tab.active,
          tabBarInactiveTintColor: Colors.tab.inactive,
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '600',
            letterSpacing: 0.3,
            marginTop: 2,
          },
          tabBarIconStyle: {
            marginBottom: -2,
          },
          sceneStyle: {
            backgroundColor: Colors.bg.primary,
          },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: 'Timer',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'time' : 'time-outline'} size={22} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: 'History',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'list' : 'list-outline'} size={22} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="insights"
          options={{
            title: 'Insights',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? 'stats-chart' : 'stats-chart-outline'}
                size={22}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'settings' : 'settings-outline'} size={22} color={color} />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg.primary,
  },
});
