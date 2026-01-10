import { Platform } from 'react-native';

// Font family selection
const displayFont = Platform.select({
  ios: 'SF Pro Display',
  android: 'Roboto',
  default: 'System',
});

const numericFont = Platform.select({
  ios: 'SF Pro Rounded',
  android: 'Roboto',
  default: 'System',
});

export const Fonts = {
  display: {
    family: displayFont,
    weights: {
      regular: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
    },
  },
  numeric: {
    family: numericFont,
    // Tabular numerals for timer alignment
    featureSettings: ['tnum', 'lnum'],
  },
};

// Typography scale
export const FontSizes = {
  // Countdown numbers - hero display
  countdown: 96,
  countdownLarge: 120,

  // Interval display
  interval: 32,

  // Section titles
  title: 16,

  // Labels and body
  label: 15,
  labelSmall: 13,

  // Body text
  body: 16,
  bodySmall: 14,

  // Caption
  caption: 12,
};

// Font weights
export const FontWeights = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
};

// Letter spacing
export const LetterSpacing = {
  tight: -2, // For large countdown
  normal: -0.5, // For titles
  wide: 0.5, // For labels
  extraWide: 1.5, // For uppercase labels
};
