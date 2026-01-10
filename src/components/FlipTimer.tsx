import { Colors, Layout, Shadows, Typography } from '@/theme';
import type React from 'react';
import { useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface FlipTimerProps {
  seconds: number;
  showHours?: boolean;
}

interface FlipDigitProps {
  digit: string;
  prevDigit: string;
}

const FlipDigit: React.FC<FlipDigitProps> = ({ digit, prevDigit }) => {
  const opacity = useSharedValue(1);
  const prevDigitRef = useRef(prevDigit);

  useEffect(() => {
    if (digit !== prevDigitRef.current) {
      opacity.value = 0.7;
      opacity.value = withTiming(1, {
        duration: 200,
        easing: Easing.out(Easing.cubic),
      });
      prevDigitRef.current = digit;
    }
  }, [digit, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View style={styles.digitContainer}>
      <Animated.View style={[styles.digitCard, animatedStyle]}>
        <Text style={styles.digitText}>{digit}</Text>
      </Animated.View>
    </View>
  );
};

interface DigitPairProps {
  value: string;
  label?: string;
}

const DigitPair: React.FC<DigitPairProps> = ({ value, label }) => {
  const digits = value.padStart(2, '0');
  const prevValue = useRef(digits);

  useEffect(() => {
    prevValue.current = digits;
  }, [digits]);

  return (
    <View style={styles.pairContainer}>
      <View style={styles.pairCard}>
        <FlipDigit digit={digits[0]} prevDigit={prevValue.current[0]} />
        <FlipDigit digit={digits[1]} prevDigit={prevValue.current[1]} />
        <View style={styles.centerDivider} />
      </View>
      {label && <Text style={styles.pairLabel}>{label}</Text>}
    </View>
  );
};

export const FlipTimer: React.FC<FlipTimerProps> = ({ seconds, showHours = false }) => {
  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return {
      hours: hrs.toString().padStart(2, '0'),
      minutes: mins.toString().padStart(2, '0'),
      seconds: secs.toString().padStart(2, '0'),
    };
  };

  const time = formatTime(Math.max(0, seconds));
  const displayHours = showHours || Number.parseInt(time.hours) > 0;

  return (
    <View style={styles.container}>
      {displayHours && (
        <>
          <DigitPair value={time.hours} />
          <Text style={styles.separator}>:</Text>
        </>
      )}
      <DigitPair value={time.minutes} />
      <Text style={styles.separator}>:</Text>
      <DigitPair value={time.seconds} />
    </View>
  );
};

const DIGIT_WIDTH = 48;
const DIGIT_HEIGHT = 72;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pairContainer: {
    alignItems: 'center',
  },
  pairCard: {
    flexDirection: 'row',
    backgroundColor: Colors.bg.card,
    borderRadius: Layout.cardRadius,
    overflow: 'hidden',
    ...Shadows.timer,
  },
  pairLabel: {
    ...Typography.labelSmall,
    color: Colors.text.muted,
    marginTop: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  digitContainer: {
    width: DIGIT_WIDTH,
    height: DIGIT_HEIGHT,
    overflow: 'hidden',
  },
  digitCard: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.bg.card,
  },
  digitText: {
    ...Typography.countdown,
    color: Colors.text.primary,
    fontSize: 56,
  },
  centerDivider: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    height: 2,
    backgroundColor: Colors.bg.primary,
    marginTop: -1,
  },
  separator: {
    ...Typography.countdown,
    color: Colors.text.muted,
    fontSize: 48,
    marginHorizontal: 8,
    fontWeight: '300',
  },
});
