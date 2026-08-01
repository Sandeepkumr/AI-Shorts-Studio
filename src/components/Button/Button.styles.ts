import { StyleSheet, type TextStyle, type ViewStyle } from "react-native";

import type { AppTheme } from "../../theme";
import type { ButtonSize, ButtonVariant } from "./Button.types";

export function createButtonStyles(theme: AppTheme) {
  const { colors, radius, shadows, spacing, typography } = theme;

  const styles = StyleSheet.create({
    button: {
      alignItems: "center",
      borderRadius: radius.medium,
      justifyContent: "center",
      overflow: "hidden",
    },
    content: {
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "center",
    },
    fullWidth: {
      alignSelf: "stretch",
    },
    disabled: {
      opacity: 0.5,
    },
    leftIcon: {
      marginRight: spacing[8],
    },
    rightIcon: {
      marginLeft: spacing[8],
    },
  });

  const variants: Record<ButtonVariant, ViewStyle> = {
    primary: {
      backgroundColor: colors.primary,
      ...shadows.small,
    },
    secondary: {
      backgroundColor: colors.secondary,
      ...shadows.small,
    },
    outline: {
      backgroundColor: "transparent",
      borderColor: colors.border,
      borderWidth: 1,
    },
    ghost: {
      backgroundColor: "transparent",
    },
    danger: {
      backgroundColor: colors.error,
      ...shadows.small,
    },
  };

  const sizes: Record<ButtonSize, ViewStyle> = {
    small: {
      minHeight: 36,
      paddingHorizontal: spacing[12],
      paddingVertical: spacing[8],
    },
    medium: {
      minHeight: 48,
      paddingHorizontal: spacing[20],
      paddingVertical: spacing[12],
    },
    large: {
      minHeight: 56,
      paddingHorizontal: spacing[24],
      paddingVertical: spacing[16],
    },
  };

  const textVariants: Record<ButtonVariant, TextStyle> = {
    primary: { color: colors.textInverse },
    secondary: { color: colors.textInverse },
    outline: { color: colors.textPrimary },
    ghost: { color: colors.textPrimary },
    danger: { color: colors.textInverse },
  };

  const textSizes: Record<ButtonSize, TextStyle> = {
    small: { ...typography.caption },
    medium: { ...typography.button },
    large: { ...typography.button, fontSize: 17 },
  };

  return { sizes, styles, textSizes, textVariants, variants };
}
