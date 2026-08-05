import { StyleSheet } from "react-native";

import type { AppTheme } from "../../theme";

export function createTextInputStyles(theme: AppTheme) {
  const { colors, radius, spacing, typography } = theme;

  return StyleSheet.create({
    container: {
      width: "100%",
    },
    label: {
      color: colors.textPrimary,
      marginBottom: spacing[8],
      ...typography.caption,
    },
    inputContainer: {
      alignItems: "center",
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: radius.medium,
      borderWidth: 1,
      flexDirection: "row",
      minHeight: 52,
      paddingHorizontal: spacing[12],
    },
    inputContainerError: {
      borderColor: colors.error,
    },
    inputContainerSuccess: {
      borderColor: colors.success,
    },
    inputContainerDisabled: {
      backgroundColor: colors.disabled,
      opacity: 0.6,
    },
    input: {
      color: colors.textPrimary,
      flex: 1,
      minHeight: 50,
      paddingHorizontal: spacing[8],
      ...typography.body,
    },
    multilineInput: {
      minHeight: 120,
      paddingTop: spacing[16],
      textAlignVertical: "top",
    },
    iconContainer: {
      alignItems: "center",
      justifyContent: "center",
    },
    rightActions: {
      alignItems: "center",
      flexDirection: "row",
    },
    actionButton: {
      alignItems: "center",
      justifyContent: "center",
      minHeight: 32,
      minWidth: 32,
    },
    actionText: {
      color: colors.primary,
      fontSize: 13,
      fontWeight: "700",
    },
    clearText: {
      color: colors.textSecondary,
      fontSize: 22,
      lineHeight: 22,
    },
    footer: {
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: spacing[8],
    },
    helperText: {
      color: colors.textSecondary,
      flex: 1,
      ...typography.caption,
    },
    errorText: {
      color: colors.error,
      flex: 1,
      ...typography.caption,
    },
    successText: {
      color: colors.success,
      flex: 1,
      ...typography.caption,
    },
    counter: {
      color: colors.textSecondary,
      marginLeft: spacing[12],
      ...typography.caption,
    },
  });
}
