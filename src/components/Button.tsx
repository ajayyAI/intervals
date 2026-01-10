import { useHaptics } from '@/hooks/useHaptics';
import { Colors, Layout, Shadows, Spacing, Typography } from '@/theme';
import type React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  type ViewStyle,
} from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  icon?: React.ReactNode;
  noHaptic?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  icon,
  noHaptic = false,
}) => {
  const haptics = useHaptics();

  const handlePress = () => {
    if (disabled || loading) return;

    if (!noHaptic) {
      haptics.impact('medium');
    }
    onPress();
  };

  const getBackgroundColor = () => {
    if (disabled) return Colors.bg.elevated;
    switch (variant) {
      case 'primary':
        return Colors.accent;
      case 'secondary':
        return Colors.bg.card;
      case 'danger':
        return Colors.danger;
      case 'ghost':
        return 'transparent';
    }
  };

  const getTextColor = () => {
    if (disabled) return Colors.text.muted;
    switch (variant) {
      case 'primary':
        return Colors.bg.primary;
      case 'danger':
        return Colors.text.primary;
      case 'secondary':
      case 'ghost':
        return Colors.text.primary;
    }
  };

  const getHeight = () => {
    switch (size) {
      case 'small':
        return Layout.buttonHeightSmall;
      case 'large':
        return Layout.buttonHeight + 8;
      default:
        return Layout.buttonHeight;
    }
  };

  const getPadding = () => {
    switch (size) {
      case 'small':
        return { paddingHorizontal: Spacing.md };
      case 'large':
        return { paddingHorizontal: Spacing.xxl };
      default:
        return { paddingHorizontal: Spacing.xl };
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          height: getHeight(),
        },
        getPadding(),
        variant !== 'ghost' && Shadows.subtle,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <>
          {icon}
          <Text
            style={[
              size === 'small' ? Typography.buttonSmall : Typography.button,
              { color: getTextColor() },
              icon ? { marginLeft: Spacing.sm } : undefined,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Layout.buttonRadius,
  },
});
