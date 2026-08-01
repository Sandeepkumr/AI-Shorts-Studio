export const radius = {
  small: 8,
  medium: 12,
  large: 16,
  xl: 24,
  round: 9999,
} as const;

export type Radius = typeof radius;
