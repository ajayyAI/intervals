// Premium Interval Timer - Spacing & Layout System
// Generous breathing room for luxury feel

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
  huge: 96,
};

export const Layout = {
  // Screen
  screenPadding: 24,
  screenPaddingHorizontal: 20,

  // Cards
  cardPadding: 24,
  cardPaddingLarge: 32,
  cardRadius: 20,
  cardRadiusLarge: 28,

  // Buttons
  buttonRadius: 14,
  buttonHeight: 56,
  buttonHeightSmall: 44,

  // Inputs
  inputRadius: 14,
  inputHeight: 52,

  // Section spacing
  sectionSpacing: 40,
};

// Subtle shadows for depth without heaviness
export const Shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  cardElevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 8,
  },
  timer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 32,
    elevation: 12,
  },
  subtle: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 2,
  },
};
