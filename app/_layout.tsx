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
      <Stack.Screen name="customize-story" />
      <Stack.Screen name="story-analyze" />
      <Stack.Screen name="characters" />
      <Stack.Screen name="projects" />
      <Stack.Screen name="coins" />
      <Stack.Screen name="select-characters" />
      <Stack.Screen name="upload-image" />
      <Stack.Screen name="view-scenes" />
      <Stack.Screen name="review-scenes" />
      <Stack.Screen name="review-scenes-for-image-to-video" />
      <Stack.Screen name="My Account" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="language" />
      <Stack.Screen name="notifications-settings" />
      <Stack.Screen name="theme-settings" />
      <Stack.Screen name="about-shivora" />
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
