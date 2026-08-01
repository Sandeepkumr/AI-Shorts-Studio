import type { ViewStyle } from "react-native";

export const shadows = {
  small: {
    elevation: 2,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  medium: {
    elevation: 6,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
  },
  large: {
    elevation: 12,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.18,
    shadowRadius: 28,
  },
} satisfies Record<string, ViewStyle>;

export type Shadows = typeof shadows;
