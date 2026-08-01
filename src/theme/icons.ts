export const iconSizes = {
  small: 16,
  medium: 20,
  large: 24,
  xl: 32,
} as const;

export const iconNames = {
  back: "chevron-left",
  close: "x",
  create: "sparkles",
  download: "download",
  home: "home",
  play: "play",
  profile: "user",
  projects: "folder",
  settings: "settings",
  share: "share",
} as const;

export type IconName = keyof typeof iconNames;
export type IconSize = keyof typeof iconSizes;
