import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "../../src/components/Button";
import { useTheme } from "../../src/theme";

export default function CharactersScreen() {
  const theme = useTheme();
  const styles = createStyles();

  return (
    <SafeAreaView edges={["top"]} style={styles.screen}>
      <View style={styles.content}>
        <Text style={styles.title}>Characters</Text>
        <Text style={styles.subtitle}>
          Build reusable AI characters for consistent video storytelling.
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Character library</Text>
          <Text style={styles.cardText}>
            Saved characters, appearances, and voice profiles will appear
            here.
          </Text>
          <View style={styles.button}>
            <Button fullWidth>Create Character</Button>
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
