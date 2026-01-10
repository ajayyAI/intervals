const FONT_FAMILY_DISPLAY = 'SF Pro Display';

// For numeric display, we use the same font with tabular numerals feature
// SF Pro Rounded is not available, so we use Display with tnum feature
const FONT_FAMILY_NUMERIC = FONT_FAMILY_DISPLAY;

export const Fonts = {
  display: {
    regular: FONT_FAMILY_DISPLAY,
    medium: FONT_FAMILY_DISPLAY,
    semibold: FONT_FAMILY_DISPLAY,
  },
  numeric: {
    family: FONT_FAMILY_NUMERIC,
    medium: FONT_FAMILY_NUMERIC,
    semibold: FONT_FAMILY_NUMERIC,
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
