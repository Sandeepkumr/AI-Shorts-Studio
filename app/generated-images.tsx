import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "../src/components/Button";
import {
  imageService,
  type GeneratedImage,
} from "../src/services/ai/imageService";
import { useTheme } from "../src/theme";

export default function GeneratedImagesScreen() {
  const router = useRouter();
  const theme = useTheme();
  const styles = createStyles();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [concepts, setConcepts] = useState<GeneratedImage[]>([]);
  const selectionScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let isMounted = true;

    const loadImages = async () => {
      const images = await imageService.getGeneratedImages();

      if (isMounted) {
        setConcepts(images);
      }
    };

    void loadImages();

    return () => {
      isMounted = false;
    };
  }, []);

  const selectImage = (imageId: string) => {
    setSelectedImage(imageId);
    selectionScale.setValue(0.96);
    Animated.spring(selectionScale, {
      damping: 12,
      stiffness: 220,
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heading}>
          <View style={styles.headingIcon}>
            <Ionicons color={theme.colors.primary} name="images" size={24} />
          </View>
          <Text style={styles.title}>Generated Images</Text>
          <Text style={styles.subtitle}>
            Choose the image direction you want to turn into a video.
          </Text>
        </View>

        <View style={styles.imagesList}>
          {concepts.map((concept) => {
            const selected = concept.id === selectedImage;
            const accentColor =
              concept.accent === "primary"
                ? theme.colors.primary
                : theme.colors.secondary;

            return (
              <Pressable
                key={concept.id}
                accessibilityLabel={`Select ${concept.title}`}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                onPress={() => selectImage(concept.id)}
              >
                <Animated.View
                  style={[
                    styles.imageCard,
                    selected && styles.imageCardSelected,
                    selected && { transform: [{ scale: selectionScale }] },
                  ]}
                >
                  <View
                    style={[
                      styles.imagePlaceholder,
                      { backgroundColor: `${accentColor}22` },
                    ]}
                  >
                    <View
                      style={[
                        styles.imageIconOrb,
                        { backgroundColor: `${accentColor}24` },
                      ]}
                    >
                      <Ionicons
                        color={accentColor}
                        name={
                          concept.id === "concept-a"
                            ? "film-outline"
                            : "aperture-outline"
                        }
                        size={56}
                      />
                    </View>
                    <Ionicons
                      color={accentColor}
                      name="sparkles"
                      size={22}
                      style={styles.imageSparkle}
                    />
                  </View>

                  <View style={styles.imageMeta}>
                    <Text style={styles.imageTitle}>{concept.title}</Text>
                    <View style={styles.badges}>
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{concept.resolution}</Text>
                      </View>
                      <View style={[styles.badge, styles.aiBadge]}>
                        <Ionicons color={theme.colors.primary} name="sparkles" size={13} />
                        <Text style={[styles.badgeText, styles.aiBadgeText]}>AI Generated</Text>
                      </View>
                    </View>
                  </View>

                  {selected ? (
                    <View style={styles.selectedMark}>
                      <Ionicons color={theme.colors.textInverse} name="checkmark" size={18} />
                    </View>
                  ) : null}
                </Animated.View>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.bottomAction}>
          <Button
            disabled={!selectedImage}
            fullWidth
            onPress={() => router.push("/voice-selection")}
            size="large"
          >
            Continue
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );

  function createStyles() {
    return StyleSheet.create({
      screen: { flex: 1, backgroundColor: theme.colors.background },
      content: {
        padding: theme.spacing[24],
        paddingBottom: theme.spacing[64],
      },
      heading: {
        alignItems: "flex-start",
      },
      headingIcon: {
        alignItems: "center",
        backgroundColor: `${theme.colors.primary}1A`,
        borderRadius: theme.radius.medium,
        height: 48,
        justifyContent: "center",
        width: 48,
      },
      title: {
        color: theme.colors.textPrimary,
        marginTop: theme.spacing[16],
        ...theme.typography.heading,
      },
      subtitle: {
        color: theme.colors.textSecondary,
        marginTop: theme.spacing[8],
        ...theme.typography.body,
      },
      imagesList: { gap: theme.spacing[16], marginTop: theme.spacing[32] },
      imageCard: {
        backgroundColor: theme.colors.card,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.large,
        borderWidth: 1,
        overflow: "hidden",
        position: "relative",
      },
      imageCardSelected: {
        borderColor: theme.colors.primary,
        borderWidth: 2,
        ...theme.shadows.medium,
      },
      imagePlaceholder: {
        alignItems: "center",
        height: 206,
        justifyContent: "center",
        position: "relative",
      },
      imageIconOrb: {
        alignItems: "center",
        borderRadius: theme.radius.round,
        height: 112,
        justifyContent: "center",
        width: 112,
      },
      imageSparkle: { position: "absolute", right: 32, top: 28 },
      imageMeta: { padding: theme.spacing[16] },
      imageTitle: { color: theme.colors.textPrimary, ...theme.typography.title },
      badges: { flexDirection: "row", gap: theme.spacing[8], marginTop: theme.spacing[12] },
      badge: {
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.small,
        borderWidth: 1,
        paddingHorizontal: theme.spacing[8],
        paddingVertical: theme.spacing[4],
      },
      badgeText: { color: theme.colors.textSecondary, ...theme.typography.caption },
      aiBadge: { alignItems: "center", flexDirection: "row" },
      aiBadgeText: { color: theme.colors.primary, marginLeft: theme.spacing[4] },
      selectedMark: {
        alignItems: "center",
        backgroundColor: theme.colors.primary,
        borderRadius: theme.radius.round,
        height: 30,
        justifyContent: "center",
        position: "absolute",
        right: theme.spacing[12],
        top: theme.spacing[12],
        width: 30,
      },
      bottomAction: { marginTop: theme.spacing[32] },
    });
  }
}
