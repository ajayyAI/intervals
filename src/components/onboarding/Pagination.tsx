import { Colors } from '@/theme';
import type React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

interface PaginationProps {
  total: number;
  selectedIndex: number;
}

export const Pagination: React.FC<PaginationProps> = ({ total, selectedIndex }) => {
  return (
    <View style={styles.container}>
      {Array.from({ length: total }).map((_, index) => (
        <Dot key={index} isActive={index === selectedIndex} />
      ))}
    </View>
  );
};

const Dot = ({ isActive }: { isActive: boolean }) => {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: withTiming(isActive ? 24 : 6, { duration: 300 }),
      backgroundColor: withTiming(isActive ? Colors.text.primary : Colors.text.muted, {
        duration: 300,
      }),
      opacity: withTiming(isActive ? 1 : 0.3, { duration: 300 }),
    };
  });

  return <Animated.View style={[styles.dot, animatedStyle]} />;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    height: 24,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
});
