import { Colors } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';

export const RitualGraphic = () => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.5, { duration: 4000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const coreStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(scale.value, [1, 1.2], [1, 0.9]) }],
  }));

  return (
    <View style={styles.graphicBox}>
      <Animated.View
        style={[
          styles.circle,
          {
            width: 200,
            height: 200,
            borderWidth: 1,
            borderColor: Colors.accent,
          },
          animatedStyle,
        ]}
      />
      <Animated.View
        style={[
          styles.circle,
          {
            width: 140,
            height: 140,
            borderWidth: 2,
            borderColor: Colors.text.muted,
            opacity: 0.3,
          },
          coreStyle,
        ]}
      />

      <View style={[styles.circle, { width: 12, height: 12, backgroundColor: Colors.accent }]} />
    </View>
  );
};

export const FlowGraphic = () => {
  const rotation1 = useSharedValue(0);
  const rotation2 = useSharedValue(0);

  useEffect(() => {
    rotation1.value = withRepeat(
      withTiming(360, { duration: 8000, easing: Easing.linear }),
      -1,
      false
    );
    rotation2.value = withRepeat(
      withTiming(-360, { duration: 12000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const style1 = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation1.value}deg` }],
  }));

  const style2 = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation2.value}deg` }],
  }));

  return (
    <View style={styles.graphicBox}>
      <Animated.View style={[styles.loopContainer, style1]}>
        <View style={[styles.dot, { top: 0, alignSelf: 'center' }]} />
        <View style={[styles.orbit, { width: 220, height: 220 }]} />
      </Animated.View>

      <Animated.View style={[styles.loopContainer, style2, { position: 'absolute' }]}>
        <View style={[styles.dot, { bottom: 0, alignSelf: 'center' }]} />
        <View style={[styles.orbit, { width: 160, height: 160, borderColor: Colors.text.muted }]} />
      </Animated.View>

      <Ionicons name="infinite" size={64} color={Colors.text.primary} />
    </View>
  );
};

export const FocusGraphic = () => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }),
        withDelay(1000, withTiming(0, { duration: 0 })) // Reset instantly after delay
      ),
      -1,
      false
    );
  }, []);

  const outerRingStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(progress.value, [0, 0.6], [2, 1]) }],
    opacity: interpolate(progress.value, [0, 0.6, 0.9], [0, 1, 0]),
  }));

  const coreCircleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(progress.value, [0, 0.6], [0, 1]) }],
    opacity: interpolate(progress.value, [0, 0.2], [0, 1]),
  }));

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(progress.value, [0.6, 0.8], [0, 1], Extrapolation.CLAMP) }],
    opacity: interpolate(progress.value, [0.6, 0.7], [0, 1]),
  }));

  return (
    <View style={styles.graphicBox}>
      {/* Focusing Ring */}
      <Animated.View
        style={[
          styles.circle,
          {
            width: 120,
            height: 120,
            borderWidth: 2,
            borderColor: Colors.accent,
            opacity: 0.5,
          },
          outerRingStyle,
        ]}
      />

      {/* Core " Moment" */}
      <Animated.View
        style={[
          styles.circle,
          {
            width: 80,
            height: 80,
            backgroundColor: Colors.bg.elevated,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: Colors.border,
          },
          coreCircleStyle,
        ]}
      >
        <Animated.View style={checkStyle}>
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: Colors.accent,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: Colors.accent,
              shadowOpacity: 0.5,
              shadowRadius: 16,
              shadowOffset: { width: 0, height: 0 },
            }}
          >
            <Ionicons name="checkmark" size={28} color={Colors.bg.primary} />
          </View>
        </Animated.View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  graphicBox: {
    width: 300,
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    borderRadius: 999,
    position: 'absolute',
  },
  loopContainer: {
    width: 300,
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
  },
  orbit: {
    borderWidth: 1,
    borderColor: Colors.accent,
    borderRadius: 999,
    position: 'absolute',
    opacity: 0.5,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.accent,
    position: 'absolute',
  },
});
