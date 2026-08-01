import type { TextStyle } from "react-native";

export const fontWeights = {
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
  extrabold: "800",
} as const;

export const fontSizes = {
  caption: 12,
  bodySmall: 14,
  body: 16,
  title: 20,
  heading: 28,
  display: 40,
} as const;

export const typography = {
  display: {
    fontSize: fontSizes.display,
    fontWeight: fontWeights.extrabold,
    letterSpacing: -1.2,
    lineHeight: 48,
  },
  heading: {
    fontSize: fontSizes.heading,
    fontWeight: fontWeights.bold,
    letterSpacing: -0.6,
    lineHeight: 36,
  },
  title: {
    fontSize: fontSizes.title,
    fontWeight: fontWeights.semibold,
    lineHeight: 28,
  },
  body: {
    fontSize: fontSizes.body,
    fontWeight: fontWeights.regular,
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: fontSizes.bodySmall,
    fontWeight: fontWeights.regular,
    lineHeight: 20,
  },
  caption: {
    fontSize: fontSizes.caption,
    fontWeight: fontWeights.medium,
    letterSpacing: 0.2,
    lineHeight: 16,
  },
  button: {
    fontSize: fontSizes.body,
    fontWeight: fontWeights.bold,
    lineHeight: 20,
  },
} satisfies Record<string, TextStyle>;

export type Typography = typeof typography;
