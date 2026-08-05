import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  imageService,
  type ImageGenerationStep,
} from "../src/services/ai/imageService";
import { useTheme } from "../src/theme";

export default function GeneratingImagesScreen() {
  const router = useRouter();
  const { prompt } = useLocalSearchParams<{ prompt?: string }>();
  const theme = useTheme();
  const styles = createStyles();
  const [activeStep, setActiveStep] = useState(0);
  const [generationSteps, setGenerationSteps] = useState<ImageGenerationStep[]>([]);
  const progress = generationSteps.length
    ? ((activeStep + 1) / generationSteps.length) * 100
    : 0;

  useEffect(() => {
    let isMounted = true;

    const runGeneration = async () => {
      const steps = await imageService.getGenerationSteps();

      if (!isMounted) {
        return;
      }

      setGenerationSteps(steps);

      await imageService.generateImages({
        prompt,
        onProgress: (stepIndex) => {
          if (isMounted) {
            setActiveStep(stepIndex);
          }
        },
      });

      if (isMounted) {
        router.replace("/generated-images");
      }
    };

    void runGeneration();

    return () => {
      isMounted = false;
    };
  }, [prompt, router]);

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        <View style={styles.artwork}>
          <View style={styles.artworkHalo}>
            <Ionicons color={theme.colors.primary} name="images" size={52} />
          </View>
          <View style={styles.sparkleOne}>
            <Ionicons color={theme.colors.secondary} name="sparkles" size={18} />
          </View>
          <View style={styles.sparkleTwo}>
            <Ionicons color={theme.colors.primary} name="sparkles" size={14} />
          </View>
        </View>

        <Text style={styles.title}>Generating Images</Text>
        <Text style={styles.subtitle}>
          Our creative engine is turning your story into cinematic concepts.
        </Text>

        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Generation progress</Text>
            <Text style={styles.progressValue}>{Math.round(progress)}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        </View>

        <View style={styles.stepsCard}>
          {generationSteps.map((step, index) => {
            const complete = index < activeStep;
            const current = index === activeStep;

            return (
              <View key={step} style={styles.stepRow}>
                <View
                  style={[
                    styles.stepIcon,
                    (complete || current) && styles.stepIconActive,
                  ]}
                >
                  {current ? (
                    <ActivityIndicator color={theme.colors.textInverse} size="small" />
                  ) : complete ? (
                    <Ionicons
                      color={theme.colors.textInverse}
                      name="checkmark"
                      size={16}
                    />
                  ) : null}
                </View>
                <Text
                  style={[
                    styles.stepText,
                    (complete || current) && styles.stepTextActive,
                  ]}
                >
                  {step}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={styles.timeCard}>
          <Ionicons color={theme.colors.warning} name="time-outline" size={20} />
          <Text style={styles.timeText}>Usually takes 10–20 seconds</Text>
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
      artwork: {
        alignItems: "center",
        height: 152,
        justifyContent: "center",
        marginBottom: theme.spacing[32],
        position: "relative",
        width: 152,
      },
      artworkHalo: {
        alignItems: "center",
        backgroundColor: `${theme.colors.primary}1A`,
        borderColor: theme.colors.primary,
        borderRadius: theme.radius.round,
        borderWidth: 1,
        height: 120,
        justifyContent: "center",
        width: 120,
      },
      sparkleOne: { position: "absolute", right: 8, top: 16 },
      sparkleTwo: { bottom: 20, left: 10, position: "absolute" },
      title: {
        color: theme.colors.textPrimary,
        textAlign: "center",
        ...theme.typography.heading,
      },
      subtitle: {
        color: theme.colors.textSecondary,
        marginTop: theme.spacing[12],
        maxWidth: 320,
        textAlign: "center",
        ...theme.typography.body,
      },
      progressSection: {
        alignSelf: "stretch",
        marginTop: theme.spacing[40],
      },
      progressHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
      },
      progressLabel: { color: theme.colors.textPrimary, ...theme.typography.bodySmall },
      progressValue: { color: theme.colors.primary, ...theme.typography.bodySmall },
      progressTrack: {
        backgroundColor: theme.colors.border,
        borderRadius: theme.radius.round,
        height: 10,
        marginTop: theme.spacing[8],
        overflow: "hidden",
      },
      progressFill: {
        backgroundColor: theme.colors.primary,
        borderRadius: theme.radius.round,
        height: "100%",
      },
      stepsCard: {
        alignSelf: "stretch",
        backgroundColor: theme.colors.card,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.large,
        borderWidth: 1,
        marginTop: theme.spacing[24],
        padding: theme.spacing[20],
      },
      stepRow: {
        alignItems: "center",
        flexDirection: "row",
        marginBottom: theme.spacing[16],
      },
      stepIcon: {
        alignItems: "center",
        backgroundColor: theme.colors.border,
        borderRadius: theme.radius.round,
        height: 24,
        justifyContent: "center",
        width: 24,
      },
      stepIconActive: { backgroundColor: theme.colors.primary },
      stepText: {
        color: theme.colors.textSecondary,
        marginLeft: theme.spacing[12],
        ...theme.typography.body,
      },
      stepTextActive: { color: theme.colors.textPrimary, fontWeight: "600" },
      timeCard: {
        alignItems: "center",
        flexDirection: "row",
        marginTop: theme.spacing[24],
      },
      timeText: {
        color: theme.colors.textSecondary,
        marginLeft: theme.spacing[8],
        ...theme.typography.bodySmall,
      },
    });
  }
}
