import type React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { Colors, Layout, Shadows } from '../theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  elevated?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, style, elevated = false }) => {
  return (
    <View style={[styles.card, elevated && Shadows.cardElevated, !elevated && Shadows.card, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bg.card,
    borderRadius: Layout.cardRadius,
    padding: Layout.cardPadding,
  },
});
