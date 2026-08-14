import { Stack } from "expo-router";

import { ThemeProvider, useTheme } from "../src/theme";

function RootNavigator() {
  const theme = useTheme();

  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: theme.colors.background },
        headerShown: false,
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="component-showcase" />
      <Stack.Screen name="add-story-image-to-video" />
      <Stack.Screen name="story-analyze" />
      <Stack.Screen name="select-characters" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootNavigator />
    </ThemeProvider>
  );
}
