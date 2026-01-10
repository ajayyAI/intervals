import type { TextStyle } from 'react-native';
import { FontSizes, FontWeights, Fonts, LetterSpacing } from './font';

// Typography presets
export const Typography: Record<string, TextStyle> = {
  // Countdown timer - hero display
  countdown: {
    fontFamily: Fonts.numeric.family,
    fontSize: FontSizes.countdown,
    fontWeight: FontWeights.semibold,
    letterSpacing: LetterSpacing.tight,
    fontVariant: ['tabular-nums'],
  },
  countdownLarge: {
    fontFamily: Fonts.numeric.family,
    fontSize: FontSizes.countdownLarge,
    fontWeight: FontWeights.semibold,
    letterSpacing: LetterSpacing.tight,
    fontVariant: ['tabular-nums'],
  },

  // Interval display
  interval: {
    fontFamily: Fonts.numeric.family,
    fontSize: FontSizes.interval,
    fontWeight: FontWeights.medium,
    letterSpacing: LetterSpacing.normal,
    fontVariant: ['tabular-nums'],
  },
  intervalSmall: {
    fontFamily: Fonts.numeric.family,
    fontSize: 24,
    fontWeight: FontWeights.medium,
    letterSpacing: LetterSpacing.normal,
    fontVariant: ['tabular-nums'],
  },

  // Headings
  h1: {
    fontFamily: Fonts.display.family,
    fontSize: 28,
    fontWeight: FontWeights.semibold,
    letterSpacing: LetterSpacing.normal,
  },
  h2: {
    fontFamily: Fonts.display.family,
    fontSize: 22,
    fontWeight: FontWeights.semibold,
    letterSpacing: LetterSpacing.normal,
  },
  h3: {
    fontFamily: Fonts.display.family,
    fontSize: 18,
    fontWeight: FontWeights.medium,
    letterSpacing: 0,
  },

  // Section titles
  title: {
    fontFamily: Fonts.display.family,
    fontSize: FontSizes.title,
    fontWeight: FontWeights.medium,
    letterSpacing: 0,
  },

  // Body text
  body: {
    fontFamily: Fonts.display.family,
    fontSize: FontSizes.body,
    fontWeight: FontWeights.regular,
    lineHeight: 24,
  },
  bodySmall: {
    fontFamily: Fonts.display.family,
    fontSize: FontSizes.bodySmall,
    fontWeight: FontWeights.regular,
    lineHeight: 20,
  },

  // Labels
  label: {
    fontFamily: Fonts.display.family,
    fontSize: FontSizes.label,
    fontWeight: FontWeights.regular,
    letterSpacing: LetterSpacing.wide,
  },
  labelSmall: {
    fontFamily: Fonts.display.family,
    fontSize: FontSizes.labelSmall,
    fontWeight: FontWeights.regular,
    letterSpacing: LetterSpacing.wide,
  },
  labelUppercase: {
    fontFamily: Fonts.display.family,
    fontSize: FontSizes.labelSmall,
    fontWeight: FontWeights.medium,
    letterSpacing: LetterSpacing.extraWide,
    textTransform: 'uppercase',
  },

  // Caption
  caption: {
    fontFamily: Fonts.display.family,
    fontSize: FontSizes.caption,
    fontWeight: FontWeights.regular,
    letterSpacing: 0.2,
  },

  // Button text
  button: {
    fontFamily: Fonts.display.family,
    fontSize: 16,
    fontWeight: FontWeights.medium,
    letterSpacing: 0.3,
  },
  buttonSmall: {
    fontFamily: Fonts.display.family,
    fontSize: 14,
    fontWeight: FontWeights.medium,
    letterSpacing: 0.2,
  },
};
