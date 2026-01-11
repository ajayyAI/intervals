import {
  FlowGraphic,
  FocusGraphic,
  RitualGraphic,
} from '@/components/onboarding/OnboardingGraphics';
import { OnboardingSlide } from '@/components/onboarding/OnboardingSlide';
import { Pagination } from '@/components/onboarding/Pagination';
import { useStore } from '@/store/useStore';
import { Colors, Typography } from '@/theme';
import { router } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
  FlatList,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SLIDES = [
  {
    id: 'ritual',
    title: 'Time as a Ritual',
    description:
      'Intervals is not a clock. It is a system for deep work. Let time flow automatically while you focus on what matters.',
    Graphic: RitualGraphic,
  },
  {
    id: 'flow',
    title: 'Uninterrupted Flow',
    description:
      'No start buttons. No stop buttons. A continuous loop of focus and rest, guided by gentle sounds.',
    Graphic: FlowGraphic,
  },
  {
    id: 'focus',
    title: 'Capture the Moment',
    description:
      'After each interval, capture a quick note. Build a history of your focus and track your progress effortlessy.',
    Graphic: FocusGraphic,
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const updateSettings = useStore((state) => state.updateSettings);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const slideSize = event.nativeEvent.layoutMeasurement.width;
      const index = event.nativeEvent.contentOffset.x / slideSize;
      const roundIndex = Math.round(index);
      if (roundIndex !== currentIndex) {
        setCurrentIndex(roundIndex);
      }
    },
    [currentIndex]
  );

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    updateSettings({ onboardingCompleted: true });
    router.replace('/(tabs)/home');
  };

  const handleSkip = () => {
    handleComplete();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={{ flex: 1 }} />
        <TouchableOpacity onPress={handleSkip} hitSlop={20}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={handleScroll}
        renderItem={({ item }) => (
          <OnboardingSlide title={item.title} description={item.description}>
            <item.Graphic />
          </OnboardingSlide>
        )}
      />

      <View style={styles.footer}>
        <Pagination total={SLIDES.length} selectedIndex={currentIndex} />

        <TouchableOpacity style={styles.button} onPress={handleNext} activeOpacity={0.8}>
          <Text style={styles.buttonText}>
            {currentIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg.primary,
  },
  header: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 16,
    alignItems: 'center',
  },
  skipText: {
    ...Typography.buttonSmall,
    color: Colors.text.muted,
  },
  footer: {
    paddingHorizontal: 32,
    paddingBottom: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  button: {
    backgroundColor: Colors.text.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 100,
  },
  buttonText: {
    ...Typography.button,
    color: Colors.bg.primary,
  },
});
