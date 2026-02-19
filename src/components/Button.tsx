import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors, typography, borderRadius, spacing } from '../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'large' | 'medium' | 'small';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'large',
  disabled = false,
  loading = false,
  style,
  icon,
}) => {
  const buttonStyles: ViewStyle[] = [
    styles.base,
    styles[`${variant}Button`],
    styles[`${size}Size`],
    disabled && styles.disabled,
    style as ViewStyle,
  ].filter(Boolean) as ViewStyle[];

  const textStyles: TextStyle[] = [
    styles.baseText,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    disabled && styles.disabledText,
  ].filter(Boolean) as TextStyle[];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' || variant === 'ghost' ? colors.primary : colors.textOnPrimary}
        />
      ) : (
        <>
          {icon}
          <Text style={textStyles}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  baseText: {
    ...typography.button,
  },

  primaryButton: {
    backgroundColor: colors.primary,
  },
  primaryText: {
    color: colors.textOnPrimary,
  },

  secondaryButton: {
    backgroundColor: colors.secondary,
  },
  secondaryText: {
    color: colors.textOnSecondary,
  },

  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  outlineText: {
    color: colors.primary,
  },

  ghostButton: {
    backgroundColor: 'transparent',
  },
  ghostText: {
    color: colors.primary,
  },

  largeSize: {
    paddingVertical: 16,
    paddingHorizontal: spacing.lg,
    minHeight: 56,
  },
  largeText: {
    fontSize: 17,
  },

  mediumSize: {
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    minHeight: 48,
  },
  mediumText: {
    fontSize: 15,
  },

  smallSize: {
    paddingVertical: 8,
    paddingHorizontal: spacing.md,
    minHeight: 36,
  },
  smallText: {
    fontSize: 14,
  },

  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    opacity: 0.7,
  },
});
