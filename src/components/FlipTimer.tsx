import { Colors, Shadows } from '@/theme';
import type React from 'react';
import { useEffect, useRef } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Calculate digit size based on screen width for maximum impact
const DIGIT_WIDTH = Math.floor((SCREEN_WIDTH - 80) / 4.5);
const DIGIT_HEIGHT = Math.floor(DIGIT_WIDTH * 1.4);
const FONT_SIZE = Math.floor(DIGIT_WIDTH * 1.1);

interface FlipTimerProps {
  seconds: number;
  showHours?: boolean;
}

interface FlipDigitProps {
  digit: string;
  prevDigit: string;
}

const FlipDigit: React.FC<FlipDigitProps> = ({ digit, prevDigit }) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const prevDigitRef = useRef(prevDigit);

  useEffect(() => {
    if (digit !== prevDigitRef.current) {
      scale.value = 0.96;
      opacity.value = 0.7;
      scale.value = withTiming(1, {
        duration: 250,
        easing: Easing.out(Easing.back(1.5)),
      });
      opacity.value = withTiming(1, {
        duration: 200,
        easing: Easing.out(Easing.cubic),
      });
      prevDigitRef.current = digit;
    }
  }, [digit, scale, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.digitWrapper, animatedStyle]}>
      {/* Top half */}
      <View style={styles.halfTop}>
        <View style={styles.digitInner}>
          <Text style={styles.digitText}>{digit}</Text>
        </View>
      </View>
      {/* Bottom half */}
      <View style={styles.halfBottom}>
        <View style={[styles.digitInner, styles.digitInnerBottom]}>
          <Text style={styles.digitText}>{digit}</Text>
        </View>
      </View>
      {/* Center divider line */}
      <View style={styles.centerLine} />
    </Animated.View>
  );
};

interface DigitPairProps {
  value: string;
}

const DigitPair: React.FC<DigitPairProps> = ({ value }) => {
  const digits = value.padStart(2, '0');
  const prevValue = useRef(digits);

  useEffect(() => {
    prevValue.current = digits;
  }, [digits]);

  return (
    <View style={styles.pairCard}>
      <FlipDigit digit={digits[0]} prevDigit={prevValue.current[0]} />
      <View style={styles.digitGap} />
      <FlipDigit digit={digits[1]} prevDigit={prevValue.current[1]} />
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

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pairCard: {
    flexDirection: 'row',
    backgroundColor: Colors.bg.card,
    borderRadius: 16,
    padding: 8,
    ...Shadows.timer,
  },
  digitGap: {
    width: 4,
  },
  digitWrapper: {
    width: DIGIT_WIDTH,
    height: DIGIT_HEIGHT,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: Colors.bg.elevated,
  },
  halfTop: {
    height: DIGIT_HEIGHT / 2,
    overflow: 'hidden',
    backgroundColor: Colors.bg.elevated,
  },
  halfBottom: {
    height: DIGIT_HEIGHT / 2,
    overflow: 'hidden',
    backgroundColor: '#1a1d24',
  },
  digitInner: {
    height: DIGIT_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  digitInnerBottom: {
    marginTop: -DIGIT_HEIGHT / 2,
  },
  digitText: {
    fontSize: FONT_SIZE,
    fontWeight: '600',
    color: Colors.text.primary,
    fontVariant: ['tabular-nums'],
    letterSpacing: -2,
    includeFontPadding: false,
  },
  centerLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: DIGIT_HEIGHT / 2 - 1,
    height: 2,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  separator: {
    fontSize: FONT_SIZE * 0.7,
    fontWeight: '300',
    color: Colors.text.muted,
    marginHorizontal: 6,
    opacity: 0.6,
  },
});
