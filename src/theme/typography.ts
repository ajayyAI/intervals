import type { TextStyle } from 'react-native';
import { FontSizes, FontWeights, Fonts, LetterSpacing } from './font';

// Typography presets
export const Typography: Record<string, TextStyle> = {
  // Countdown timer - hero display
  countdown: {
    fontFamily: Fonts.numeric.semibold,
    fontSize: FontSizes.countdown,
    fontWeight: FontWeights.semibold,
    letterSpacing: LetterSpacing.tight,
    fontVariant: ['tabular-nums'],
  },
  countdownLarge: {
    fontFamily: Fonts.numeric.semibold,
    fontSize: FontSizes.countdownLarge,
    fontWeight: FontWeights.semibold,
    letterSpacing: LetterSpacing.tight,
    fontVariant: ['tabular-nums'],
  },

  // Interval display
  interval: {
    fontFamily: Fonts.numeric.medium,
    fontSize: FontSizes.interval,
    fontWeight: FontWeights.medium,
    letterSpacing: LetterSpacing.normal,
    fontVariant: ['tabular-nums'],
  },
  intervalSmall: {
    fontFamily: Fonts.numeric.medium,
    fontSize: 24,
    fontWeight: FontWeights.medium,
    letterSpacing: LetterSpacing.normal,
    fontVariant: ['tabular-nums'],
  },

  // Headings
  h1: {
    fontFamily: Fonts.display.semibold,
    fontSize: 28,
    fontWeight: FontWeights.semibold,
    letterSpacing: LetterSpacing.normal,
  },
  h2: {
    fontFamily: Fonts.display.semibold,
    fontSize: 22,
    fontWeight: FontWeights.semibold,
    letterSpacing: LetterSpacing.normal,
  },
  h3: {
    fontFamily: Fonts.display.medium,
    fontSize: 18,
    fontWeight: FontWeights.medium,
    letterSpacing: 0,
  },

  // Section titles
  title: {
    fontFamily: Fonts.display.medium,
    fontSize: FontSizes.title,
    fontWeight: FontWeights.medium,
    letterSpacing: 0,
  },

  // Body text
  body: {
    fontFamily: Fonts.display.regular,
    fontSize: FontSizes.body,
    fontWeight: FontWeights.regular,
    lineHeight: 24,
  },
  bodySmall: {
    fontFamily: Fonts.display.regular,
    fontSize: FontSizes.bodySmall,
    fontWeight: FontWeights.regular,
    lineHeight: 20,
  },

  // Labels
  label: {
    fontFamily: Fonts.display.regular,
    fontSize: FontSizes.label,
    fontWeight: FontWeights.regular,
    letterSpacing: LetterSpacing.wide,
  },
  labelSmall: {
    fontFamily: Fonts.display.regular,
    fontSize: FontSizes.labelSmall,
    fontWeight: FontWeights.regular,
    letterSpacing: LetterSpacing.wide,
  },
  labelUppercase: {
    fontFamily: Fonts.display.medium,
    fontSize: FontSizes.labelSmall,
    fontWeight: FontWeights.medium,
    letterSpacing: LetterSpacing.extraWide,
    textTransform: 'uppercase',
  },

  // Caption
  caption: {
    fontFamily: Fonts.display.regular,
    fontSize: FontSizes.caption,
    fontWeight: FontWeights.regular,
    letterSpacing: 0.2,
  },

  // Button text
  button: {
    fontFamily: Fonts.display.medium,
    fontSize: 16,
    fontWeight: FontWeights.medium,
    letterSpacing: 0.3,
  },
  buttonSmall: {
    fontFamily: Fonts.display.medium,
    fontSize: 14,
    fontWeight: FontWeights.medium,
    letterSpacing: 0.2,
  },
};
