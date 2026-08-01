import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "../src/components/Button";
import { ThemeProvider, useTheme } from "../src/theme";

function ComponentShowcaseContent() {
  const theme = useTheme();
  const styles = createStyles();

  return (
    <SafeAreaView edges={["top"]} style={styles.screen}>
      <Stack.Screen options={{ title: "Button Showcase" }} />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.pageTitle}>Button Showcase</Text>
        <Text style={styles.pageSubtitle}>
          Development testing for Button variants, states, and sizes.
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Primary</Text>
          <Button>Primary Button</Button>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Secondary</Text>
          <Button variant="secondary">Secondary Button</Button>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Outline</Text>
          <Button variant="outline">Outline Button</Button>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ghost</Text>
          <Button variant="ghost">Ghost Button</Button>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Danger</Text>
          <Button variant="danger">Danger Button</Button>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Loading</Text>
          <Button loading>Loading Button</Button>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Disabled</Text>
          <Button disabled>Disabled Button</Button>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Small</Text>
          <Button size="small">Small Button</Button>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Medium</Text>
          <Button size="medium">Medium Button</Button>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Large</Text>
          <Button size="large">Large Button</Button>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Full Width</Text>
          <Button fullWidth>Full Width Button</Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );

  function createStyles() {
    return StyleSheet.create({
      screen: {
        flex: 1,
        backgroundColor: theme.colors.background,
      },
      content: {
        padding: theme.spacing[24],
        paddingBottom: theme.spacing[64],
      },
      pageTitle: {
        color: theme.colors.textPrimary,
        ...theme.typography.heading,
      },
      pageSubtitle: {
        color: theme.colors.textSecondary,
        marginTop: theme.spacing[8],
        ...theme.typography.body,
      },
      section: {
        gap: theme.spacing[12],
        marginTop: theme.spacing[32],
      },
      sectionTitle: {
        color: theme.colors.textPrimary,
        ...theme.typography.title,
      },
    });
  }
}

export default function ComponentShowcaseScreen() {
  return (
    <ThemeProvider>
      <ComponentShowcaseContent />
    </ThemeProvider>
  );
}
