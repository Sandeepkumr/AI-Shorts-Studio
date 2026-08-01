import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { darkColors, lightColors, type ThemeColors } from "./colors";
import { iconNames, iconSizes } from "./icons";
import { radius } from "./radius";
import { shadows } from "./shadows";
import { spacing } from "./spacing";
import { typography } from "./typography";

export type ThemeMode = "light" | "dark";

export type AppTheme = {
  mode: ThemeMode;
  colors: ThemeColors;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
  shadows: typeof shadows;
  icons: {
    names: typeof iconNames;
    sizes: typeof iconSizes;
  };
};

export const lightTheme: AppTheme = {
  mode: "light",
  colors: lightColors,
  spacing,
  radius,
  typography,
  shadows,
  icons: { names: iconNames, sizes: iconSizes },
};

export const darkTheme: AppTheme = {
  mode: "dark",
  colors: darkColors,
  spacing,
  radius,
  typography,
  shadows,
  icons: { names: iconNames, sizes: iconSizes },
};

type ThemeContextValue = {
  theme: AppTheme;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
};

type ThemeProviderProps = {
  children: ReactNode;
  initialMode?: ThemeMode;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({
  children,
  initialMode = "dark",
}: ThemeProviderProps) {
  const [mode, setMode] = useState<ThemeMode>(initialMode);

  const toggleTheme = useCallback(() => {
    setMode((currentMode) => (currentMode === "dark" ? "light" : "dark"));
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme: mode === "dark" ? darkTheme : lightTheme,
      mode,
      setMode,
      toggleTheme,
    }),
    [mode, toggleTheme],
  );

  return createElement(ThemeContext.Provider, { value }, children);
}

export function useTheme(): AppTheme {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider.");
  }

  return context.theme;
}

export function useThemeMode(): Omit<ThemeContextValue, "theme"> {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useThemeMode must be used within a ThemeProvider.");
  }

  const { theme: _theme, ...themeMode } = context;
  return themeMode;
}
