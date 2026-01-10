import { Colors, Shadows } from '@/theme';
import type React from 'react';
import { memo, useEffect, useRef } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const CARD_WIDTH = SCREEN_WIDTH - 48;
const CARD_HEIGHT = Math.min(SCREEN_HEIGHT * 0.26, 200);
const DIGIT_HEIGHT = CARD_HEIGHT - 12;
const FONT_SIZE = Math.floor(DIGIT_HEIGHT * 0.75);

interface FlipTimerProps {
  seconds: number;
}

interface FlipDigitProps {
  digit: string;
}

const FlipDigit: React.FC<FlipDigitProps> = memo(({ digit }) => {
  const scale = useSharedValue(1);
  const lastDigit = useRef(digit);

  useEffect(() => {
    if (digit !== lastDigit.current) {
      scale.value = withSequence(
        withTiming(0.9, { duration: 80, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: 180, easing: Easing.out(Easing.back(1.3)) })
      );
      lastDigit.current = digit;
    }
  }, [digit, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.digitCard, animatedStyle]}>
      {/* Top half - clips bottom of text */}
      <View style={styles.halfTop}>
        <View style={styles.textContainer}>
          <Text style={styles.digitText}>{digit}</Text>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Bottom half - clips top of text */}
      <View style={styles.halfBottom}>
        <View style={[styles.textContainer, styles.textContainerBottom]}>
          <Text style={styles.digitText}>{digit}</Text>
        </View>
      </View>
    </Animated.View>
  );
});

interface FlipCardPairProps {
  value: string;
  label: string;
}

const FlipCardPair: React.FC<FlipCardPairProps> = memo(({ value, label }) => {
  const d1 = value[0] || '0';
  const d2 = value[1] || '0';

  return (
    <View style={styles.pairContainer}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.pairCard}>
        <FlipDigit digit={d1} />
        <View style={styles.digitGap} />
        <FlipDigit digit={d2} />
      </View>
    </View>
  );
});

export const FlipTimer: React.FC<FlipTimerProps> = ({ seconds }) => {
  const mins = Math.floor(Math.max(0, seconds) / 60);
  const secs = Math.max(0, seconds) % 60;

  return (
    <View style={styles.container}>
      <FlipCardPair value={mins.toString().padStart(2, '0')} label="MINUTES" />
      <View style={styles.cardGap} />
      <FlipCardPair value={secs.toString().padStart(2, '0')} label="SECONDS" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
  },
  pairContainer: {
    width: CARD_WIDTH,
    alignItems: 'center',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.text.muted,
    letterSpacing: 3,
    marginBottom: 10,
    opacity: 0.6,
  },
  pairCard: {
    flexDirection: 'row',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 16,
    backgroundColor: Colors.bg.card,
    padding: 6,
    ...Shadows.timer,
  },
  digitCard: {
    flex: 1,
    height: DIGIT_HEIGHT,
    borderRadius: 12,
    overflow: 'hidden',
  },
  digitGap: {
    width: 6,
  },
  halfTop: {
    height: DIGIT_HEIGHT / 2,
    backgroundColor: Colors.bg.elevated,
    overflow: 'hidden',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  halfBottom: {
    height: DIGIT_HEIGHT / 2,
    backgroundColor: '#1a1d24',
    overflow: 'hidden',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  textContainer: {
    height: DIGIT_HEIGHT,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainerBottom: {
    marginTop: -DIGIT_HEIGHT / 2,
  },
  digitText: {
    fontSize: FONT_SIZE,
    fontWeight: '700',
    color: Colors.text.primary,
    fontVariant: ['tabular-nums'],
    textAlign: 'center',
  },
  divider: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: DIGIT_HEIGHT / 2 - 1,
    height: 2,
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: 10,
  },
  cardGap: {
    height: 16,
  },
});
