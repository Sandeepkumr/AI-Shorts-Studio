import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "../src/components/Button";
import { useTheme } from "../src/theme";

export default function VideoGenerationScreen() {
  const router = useRouter();
  const theme = useTheme();
  const styles = createStyles();

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        <View style={styles.iconTile}>
          <Ionicons color={theme.colors.primary} name="film-outline" size={42} />
        </View>
        <Text style={styles.title}>Video Generation</Text>
        <Text style={styles.subtitle}>
          This feature will be implemented next.
        </Text>
        <View style={styles.button}>
          <Button fullWidth onPress={() => router.back()} variant="outline">
            Back to Voice
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );

  function createStyles() {
    return StyleSheet.create({
      screen: { flex: 1, backgroundColor: theme.colors.background },
      content: {
        alignItems: "center",
        flex: 1,
        justifyContent: "center",
        padding: theme.spacing[24],
      },
      iconTile: {
        alignItems: "center",
        backgroundColor: `${theme.colors.primary}1A`,
        borderRadius: theme.radius.xl,
        height: 96,
        justifyContent: "center",
        width: 96,
      },
      title: {
        color: theme.colors.textPrimary,
        marginTop: theme.spacing[24],
        ...theme.typography.heading,
      },
      subtitle: {
        color: theme.colors.textSecondary,
        marginTop: theme.spacing[12],
        textAlign: "center",
        ...theme.typography.body,
      },
      button: { alignSelf: "stretch", marginTop: theme.spacing[32] },
    });
  }
}
