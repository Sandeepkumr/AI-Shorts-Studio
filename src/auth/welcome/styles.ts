import { StyleSheet } from "react-native";

import type { AppTheme } from "../../../src/theme";

export const welcomeColors = {
  accent: "#16D6A3",
  buttonEnd: "#10B981",
  buttonStart: "#18E0A8",
  subtitle: "#A1A8B3",
  textPrimary: "#FFFFFF",
} as const;

export function createWelcomeStyles(theme: AppTheme, compact: boolean, heroSize: number) {
  return StyleSheet.create({
    safeArea: { backgroundColor: theme.colors.background, flex: 1 },
    screen: { backgroundColor: theme.colors.background, flex: 1 },
    header: {
      alignItems: "center",
      justifyContent: "center",
      minHeight: compact ? 84 : 104,
      paddingTop: compact ? theme.spacing[20] : theme.spacing[24],
    },
    brandLockup: { alignItems: "center", marginTop: compact ? 35 : 40,
  marginLeft: compact ? -10 : -12,},

    brandMarkClip: {
      height: compact ? 30 : 38,
      overflow: "visible",
      width: compact ? 30 : 38,
    },
    brandMarkSource: {
      height: compact ? 85 : 100,
      left: compact ? -28 : -32,
      position: "absolute",
      top: compact ? -34 : -40,
      width: compact ? 128 : 150,
    },
    brand: {
      color: welcomeColors.textPrimary,
      fontFamily: "Poppins_600SemiBold",
      fontSize: compact ? 28 : 32,
      letterSpacing: -0.6,
      lineHeight: 38,
      marginTop: compact ? -2 : -4,
    },
    pager: { flex: 1 },
    page: { alignItems: "center", flex: 1, paddingHorizontal: theme.spacing[24] },
    heroWrap: {
      alignItems: "center",
      height: heroSize * (compact ? 1.02 : 1.1),
      justifyContent: "center",
      marginTop: compact ? theme.spacing[8] : 0,
      overflow: "visible",
      width: heroSize,
    },
    heroGlow: {
      backgroundColor: `${welcomeColors.accent}24`,
      borderRadius: theme.radius.round,
      height: heroSize * 0.62,
      opacity: 0,
      position: "absolute",
      width: heroSize * 3.15,
    },
    heroImage: {
      height: heroSize * 1.35 * (850 / 690),
      position: "absolute",
      resizeMode: "contain",
      top: -25,
      width: heroSize * 1.40,
    },
    headlineWrap: { marginTop: compact ? 30 : theme.spacing[32] + 
theme.spacing[4] },
    headline: {
      color: welcomeColors.textPrimary,
      fontFamily: "Poppins_600SemiBold",
      fontSize: compact ? 34 : 38,
      letterSpacing: -0.6,
      lineHeight: compact ? 42 : 48,
      textAlign: "center",
    },
    headlineAccent: { color: welcomeColors.accent },
    subtitle: {
      color: welcomeColors.subtitle,
      fontFamily: "Poppins_400Regular",
      fontSize: 18,
      lineHeight: 26,
      marginTop: compact ? theme.spacing[12] : theme.spacing[16],
      maxWidth: heroSize * 1.17,
      textAlign: "center",
    },
    footer: { paddingHorizontal: theme.spacing[24], paddingTop: theme.spacing[8] },
    indicatorRow: {
      alignItems: "center",
      flexDirection: "row",
      gap: 10,
      justifyContent: "center",
    },
    indicator: {
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      borderRadius: 3,
      height: 6,
    },
    primaryGradient: {
      borderRadius: 18,
      height: 58,
      marginTop: compact ? theme.spacing[20] : theme.spacing[32],
      shadowColor: welcomeColors.accent,
      shadowOffset: { height: 8, width: 0 },
      shadowOpacity: 0.25,
      shadowRadius: 10,
    },
    primaryButton: { borderRadius: 18, height: 58 },
    primaryButtonText: {
      color: theme.colors.background,
      fontFamily: "Poppins_600SemiBold",
      fontSize: 18,
    },
    guestAction: {
      alignItems: "center",
      marginTop: theme.spacing[20],
      paddingBottom: compact ? theme.spacing[8] : theme.spacing[12],
      paddingVertical: theme.spacing[8],
    },
    guestText: {
      color: "rgba(255, 255, 255, 0.6)",
      fontFamily: "Poppins_600SemiBold",
      fontSize: 16,
      textDecorationLine: "underline",
    },
    particleLayer: { ...StyleSheet.absoluteFill },
    particle: {
      alignItems: "center",
      backgroundColor: welcomeColors.accent,
      borderRadius: theme.radius.round,
      justifyContent: "center",
      position: "absolute",
      shadowColor: welcomeColors.accent,
      shadowOpacity: 0.45,
      shadowRadius: 5,
    },
    sparkleArm: {
      backgroundColor: welcomeColors.accent,
      height: 1,
      position: "absolute",
      shadowColor: welcomeColors.accent,
      shadowOpacity: 0.65,
      shadowRadius: 4,
    },
    sparkleArmVertical: { transform: [{ rotate: "90deg" }] },
  });
}
