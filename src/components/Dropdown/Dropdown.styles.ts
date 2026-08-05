import { StyleSheet } from "react-native";

import type { AppTheme } from "../../theme";

export function createDropdownStyles(theme: AppTheme) {
  const { colors, radius, shadows, spacing, typography } = theme;

  return StyleSheet.create({
    container: {
      width: "100%",
    },
    label: {
      color: colors.textPrimary,
      marginBottom: spacing[8],
      ...typography.caption,
    },
    trigger: {
      alignItems: "center",
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: radius.medium,
      borderWidth: 1,
      flexDirection: "row",
      minHeight: 52,
      paddingHorizontal: spacing[12],
    },
    triggerError: {
      borderColor: colors.error,
    },
    triggerSuccess: {
      borderColor: colors.success,
    },
    triggerDisabled: {
      backgroundColor: colors.disabled,
      opacity: 0.6,
    },
    triggerText: {
      color: colors.textPrimary,
      flex: 1,
      marginRight: spacing[8],
      ...typography.body,
    },
    placeholder: {
      color: colors.textSecondary,
    },
    actionButton: {
      alignItems: "center",
      justifyContent: "center",
      minHeight: 32,
      minWidth: 32,
    },
    clearText: {
      color: colors.textSecondary,
      fontSize: 22,
      lineHeight: 22,
    },
    chevron: {
      color: colors.textSecondary,
      fontSize: 20,
      lineHeight: 20,
    },
    helperText: {
      color: colors.textSecondary,
      marginTop: spacing[8],
      ...typography.caption,
    },
    errorText: {
      color: colors.error,
      marginTop: spacing[8],
      ...typography.caption,
    },
    successText: {
      color: colors.success,
      marginTop: spacing[8],
      ...typography.caption,
    },
    modalRoot: {
      flex: 1,
      justifyContent: "flex-end",
    },
    backdrop: {
      backgroundColor: colors.overlay,
      bottom: 0,
      left: 0,
      position: "absolute",
      right: 0,
      top: 0,
    },
    sheet: {
      backgroundColor: colors.background,
      borderTopLeftRadius: radius.xl,
      borderTopRightRadius: radius.xl,
      maxHeight: "82%",
      minHeight: 260,
      paddingBottom: spacing[24],
      paddingTop: spacing[12],
      ...shadows.large,
    },
    handle: {
      alignSelf: "center",
      backgroundColor: colors.border,
      borderRadius: radius.round,
      height: 4,
      marginBottom: spacing[16],
      width: 44,
    },
    header: {
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "space-between",
      paddingBottom: spacing[16],
      paddingHorizontal: spacing[20],
    },
    sheetTitle: {
      color: colors.textPrimary,
      flex: 1,
      ...typography.title,
    },
    searchContainer: {
      alignItems: "center",
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: radius.medium,
      borderWidth: 1,
      flexDirection: "row",
      marginBottom: spacing[12],
      marginHorizontal: spacing[20],
      minHeight: 46,
      paddingHorizontal: spacing[12],
    },
    searchInput: {
      color: colors.textPrimary,
      flex: 1,
      paddingHorizontal: spacing[8],
      paddingVertical: spacing[8],
      ...typography.body,
    },
    listContent: {
      paddingHorizontal: spacing[12],
    },
    option: {
      alignItems: "center",
      borderRadius: radius.medium,
      flexDirection: "row",
      minHeight: 56,
      paddingHorizontal: spacing[12],
      paddingVertical: spacing[8],
    },
    optionSelected: {
      backgroundColor: `${colors.primary}1A`,
    },
    optionDisabled: {
      opacity: 0.45,
    },
    optionTextContainer: {
      flex: 1,
    },
    optionLabel: {
      color: colors.textPrimary,
      ...typography.body,
    },
    optionLabelSelected: {
      color: colors.primary,
      fontWeight: "700",
    },
    optionDescription: {
      color: colors.textSecondary,
      marginTop: spacing[4],
      ...typography.caption,
    },
    checkmark: {
      color: colors.primary,
      fontSize: 20,
      fontWeight: "800",
    },
    emptyState: {
      alignItems: "center",
      padding: spacing[40],
    },
    emptyText: {
      color: colors.textSecondary,
      ...typography.body,
    },
  });
}
