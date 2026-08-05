import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "../../src/components/Button";
import { useTheme } from "../../src/theme";

export default function ProjectsScreen() {
  const theme = useTheme();
  const styles = createStyles();

  return (
    <SafeAreaView edges={["top"]} style={styles.screen}>
      <View style={styles.content}>
        <Text style={styles.title}>Projects</Text>
        <Text style={styles.subtitle}>
          Keep every draft, generated video, and export in one place.
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your project library</Text>
          <Text style={styles.cardText}>
            Saved projects, filters, and search tools will appear here.
          </Text>
          <View style={styles.button}>
            <Button fullWidth variant="outline">
              Browse Projects
            </Button>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );

  function createStyles() {
    return StyleSheet.create({
      screen: { flex: 1, backgroundColor: theme.colors.background },
      content: { flex: 1, padding: theme.spacing[24] },
      title: { color: theme.colors.textPrimary, ...theme.typography.heading },
      subtitle: {
        color: theme.colors.textSecondary,
        marginTop: theme.spacing[8],
        ...theme.typography.body,
      },
      card: {
        backgroundColor: theme.colors.card,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.large,
        borderWidth: 1,
        marginTop: theme.spacing[32],
        padding: theme.spacing[20],
      },
      cardTitle: { color: theme.colors.textPrimary, ...theme.typography.title },
      cardText: {
        color: theme.colors.textSecondary,
        marginTop: theme.spacing[8],
        ...theme.typography.body,
      },
      button: { marginTop: theme.spacing[20] },
    });
  }
}
