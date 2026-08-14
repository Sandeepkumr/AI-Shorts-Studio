import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  FadeIn,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { Button } from "../../src/components/Button";
import { TextInput } from "../../src/components/TextInput";
import { authService } from "../../src/services/auth/authService";
import { useTheme } from "../../src/theme";

export default function ProfileSetupScreen() {
  const router = useRouter();
  const theme = useTheme();
  const styles = createStyles();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const avatarPulse = useSharedValue(1);
  const avatarStyle = useAnimatedStyle(() => ({
    opacity: 0.72 + avatarPulse.value * 0.28,
    transform: [{ scale: avatarPulse.value }],
  }));

  useEffect(() => {
    avatarPulse.value = withRepeat(
      withSequence(
        withTiming(1.04, { duration: 1700 }),
        withTiming(1, { duration: 1700 }),
      ),
      -1,
      false,
    );
  }, [avatarPulse]);

  const continueToHome = async () => {
    if (name.trim().length < 2) {
      setError("Please enter your name to continue.");
      return;
    }

    setIsSubmitting(true);

    try {
      await authService.completeProfile({ name, username });
      router.replace("/(tabs)/home");
    } catch (profileError) {
      setError(profileError instanceof Error ? profileError.message : "Unable to save your profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Animated.View entering={FadeInUp.duration(540)} style={styles.iconTile}>
          <Ionicons color={theme.colors.primary} name="person-outline" size={32} />
        </Animated.View>
        <Animated.Text entering={FadeInUp.delay(100).duration(500)} style={styles.title}>Let’s set up your profile</Animated.Text>
        <Animated.Text entering={FadeIn.delay(220).duration(440)} style={styles.subtitle}>Tell us a little about yourself.</Animated.Text>

        <Animated.View entering={FadeInUp.delay(260).duration(520)} style={styles.profilePictureSection}>
          <Animated.View style={[styles.avatarPlaceholder, avatarStyle]}>
            <Ionicons color={theme.colors.primary} name="person" size={38} />
          </Animated.View>
          <View style={styles.profilePictureCopy}>
            <Text style={styles.profilePictureTitle}>Profile picture</Text>
            <Text style={styles.profilePictureHint}>Optional — you can add one later.</Text>
          </View>
          <Pressable accessibilityRole="button" style={styles.addPictureButton}>
            <Ionicons color={theme.colors.primary} name="add" size={20} />
          </Pressable>
        </Animated.View>

        <View style={styles.form}>
          <Animated.View entering={FadeInUp.delay(340).duration(480)}>
            <TextInput
              errorText={error}
              label="Full name"
              onChangeText={(value) => {
                setName(value);
                if (error) {
                  setError(undefined);
                }
              }}
              placeholder="Enter your name"
              value={name}
            />
          </Animated.View>
          <Animated.View entering={FadeInUp.delay(410).duration(480)}>
            <TextInput
              helperText="Optional — this can be changed later."
              label="Display name"
              onChangeText={setUsername}
              placeholder="Enter display name"
              value={username}
            />
          </Animated.View>
        </View>

        <Animated.View entering={FadeInUp.delay(500).duration(500)}>
          <Button
            disabled={name.trim().length < 2}
            fullWidth
            loading={isSubmitting}
            onPress={() => void continueToHome()}
            rightIcon={<Ionicons color={theme.colors.textInverse} name="arrow-forward" size={20} />}
            size="large"
          >
            Continue
          </Button>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );

  function createStyles() {
    return StyleSheet.create({
      screen: { flex: 1, backgroundColor: theme.colors.background },
      content: { padding: theme.spacing[24], paddingTop: theme.spacing[48] },
      iconTile: {
        alignItems: "center",
        backgroundColor: `${theme.colors.primary}1A`,
        borderRadius: theme.radius.large,
        height: 64,
        justifyContent: "center",
        width: 64,
      },
      title: { color: theme.colors.textPrimary, marginTop: theme.spacing[24], ...theme.typography.heading },
      subtitle: { color: theme.colors.textSecondary, marginTop: theme.spacing[8], ...theme.typography.body },
      profilePictureSection: {
        alignItems: "center",
        backgroundColor: theme.colors.card,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.large,
        borderWidth: 1,
        flexDirection: "row",
        marginTop: theme.spacing[32],
        padding: theme.spacing[16],
      },
      avatarPlaceholder: {
        alignItems: "center",
        backgroundColor: `${theme.colors.primary}1A`,
        borderRadius: theme.radius.round,
        height: 64,
        justifyContent: "center",
        width: 64,
      },
      profilePictureCopy: { flex: 1, marginLeft: theme.spacing[12] },
      profilePictureTitle: { color: theme.colors.textPrimary, ...theme.typography.body },
      profilePictureHint: { color: theme.colors.textSecondary, marginTop: theme.spacing[4], ...theme.typography.caption },
      addPictureButton: {
        alignItems: "center",
        backgroundColor: `${theme.colors.primary}18`,
        borderRadius: theme.radius.round,
        height: 36,
        justifyContent: "center",
        width: 36,
      },
      form: { gap: theme.spacing[16], marginTop: theme.spacing[24], marginBottom: theme.spacing[32] },
    });
  }
}
