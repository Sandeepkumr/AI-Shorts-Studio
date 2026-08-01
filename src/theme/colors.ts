export type ThemeColors = {
  primary: string;
  primaryPressed: string;
  secondary: string;
  secondaryPressed: string;
  success: string;
  warning: string;
  error: string;
  background: string;
  surface: string;
  card: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  textInverse: string;
  disabled: string;
  overlay: string;
};

export const lightColors: ThemeColors = {
  primary: "#10A37F",
  primaryPressed: "#0B7D62",
  secondary: "#7C3AED",
  secondaryPressed: "#6330C2",
  success: "#16A34A",
  warning: "#D97706",
  error: "#DC2626",
  background: "#F8FAFC",
  surface: "#FFFFFF",
  card: "#FFFFFF",
  border: "#E2E8F0",
  textPrimary: "#0F172A",
  textSecondary: "#64748B",
  textInverse: "#FFFFFF",
  disabled: "#CBD5E1",
  overlay: "rgba(15, 23, 42, 0.48)",
};

export const darkColors: ThemeColors = {
  primary: "#10A37F",
  primaryPressed: "#0C876A",
  secondary: "#A78BFA",
  secondaryPressed: "#8B6EE8",
  success: "#4ADE80",
  warning: "#FBBF24",
  error: "#FB7185",
  background: "#0B0F14",
  surface: "#111827",
  card: "#151B25",
  border: "#273244",
  textPrimary: "#F8FAFC",
  textSecondary: "#94A3B8",
  textInverse: "#0B0F14",
  disabled: "#334155",
  overlay: "rgba(0, 0, 0, 0.64)",
};
