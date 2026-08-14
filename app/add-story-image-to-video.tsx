import React, { useMemo, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

/*
 * ============================================================
 * IMAGE TO VIDEO — STORY SCREEN
 * ============================================================
 *
 * File:
 *   app/add-story-image-to-video.tsx
 *
 * IMPORTANT:
 * This file is directly inside /app, so assets must use:
 *   ../assets/filename.png
 *
 * Do NOT use ../../assets here.
 * ============================================================
 */

const ASSETS = {
  imageVideoHero: require("../assets/image-video-hero.png"),
  magicFeather: require("../assets/magic-feather.png"),
  aiSuggestion: require("../assets/ai-suggestion.png"),
  coin: require("../assets/coin.png"),
};

const COLORS = {
  background: "#020A10",

  surface: "#071A24",
  inputSurface: "#03131D",
  inputInner: "#020C14",

  text: "#F6F8FA",
  secondary: "#B3C1C8",
  muted: "#84959E",

  cyan: "#08D8D1",
  cyanBright: "#00E7DF",

  border: "#123E4D",
  cyanBorder: "#00D8D0",

  purpleSurface: "#180B31",
  purpleBorder: "#7E35D5",
  purple: "#B05CFF",
};

/* ============================================================
   DATA
   ============================================================ */

const AI_ITEMS = [
  {
    icon: "happy-outline" as const,
    label: "Characters",
  },
  {
    icon: "film-outline" as const,
    label: "Scenes",
  },
  {
    icon: "color-wand-outline" as const,
    label: "Actions",
  },
  {
    icon: "chatbubble-ellipses-outline" as const,
    label: "Dialogues",
  },
  {
    icon: "pulse-outline" as const,
    label: "Voice",
  },
];

const AI_SUGGESTION =
  "A little girl named Vamika explores a beautiful garden, discovers a colorful butterfly, follows it through the flowers, and happily watches it fly into the sky.";

const MAX_STORY_LENGTH = 2000;

/* ============================================================
   SCREEN
   ============================================================ */

export default function AddStoryImageToVideo() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const [story, setStory] = useState("");
  const [suggesting, setSuggesting] = useState(false);

  const isSmall = width <= 375;
  const isLarge = width >= 430;

  const horizontalPadding = isSmall
    ? 18
    : isLarge
      ? 27
      : 22;

  const contentWidth = width - horizontalPadding * 2;

  // Keep the title readable on compact iPhones without allowing
  // React Native's text auto-fit to collapse it to a tiny size.
  const headerTitleSize = Math.min(24, Math.max(18, width * 0.06));

  /*
   * Five equal columns.
   * The old implementation used extra flex items for dividers,
   * which caused the fifth "Voice" item to overflow the card.
   */
  const aiColumnWidth = useMemo(
    () => contentWidth / AI_ITEMS.length,
    [contentWidth]
  );

  /* ==========================================================
     NAVIGATION
     ========================================================== */

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/" as any);
    }
  };

  const continueToAnalysis = () => {
    const cleanStory = story.trim();

    if (!cleanStory) {
      Alert.alert(
        "Add your story",
        "Please describe your story before continuing."
      );
      return;
    }

    /*
     * This is the next screen in the planned Image-to-Video flow:
     *
     * Story
     *   ↓
     * AI Analysis
     *
     * Change only this route when that screen is created.
     */
    router.push({
      pathname: "/story-analyze" as any,
      params: {
        story: cleanStory,
      },
    });
  };

  /* ==========================================================
     AI SUGGESTION
     * ========================================================== */

  const generateSuggestion = async () => {
    if (suggesting) return;

    setSuggesting(true);

    try {
      /*
       * Temporary local suggestion.
       * Replace this section later with the real AI API.
       */
      await new Promise((resolve) =>
        setTimeout(resolve, 450)
      );

      setStory(AI_SUGGESTION);
    } catch {
      Alert.alert(
        "Unable to generate suggestion",
        "Please try again."
      );
    } finally {
      setSuggesting(false);
    }
  };

  const onStoryChange = (value: string) => {
    setStory(value.slice(0, MAX_STORY_LENGTH));
  };

  /* ==========================================================
     RENDER
     ========================================================== */

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top", "bottom"]}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.background}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={
          Platform.OS === "ios" ? "padding" : undefined
        }
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingHorizontal: horizontalPadding,
            },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        >
          {/* ==================================================
              HEADER
             ================================================== */}

          <View style={styles.header}>
            <Pressable
              onPress={goBack}
              hitSlop={10}
              style={({ pressed }) => [
                styles.backButton,
                pressed && styles.pressed,
              ]}
            >
              <Ionicons
                name="chevron-back"
                size={31}
                color={COLORS.text}
              />
            </Pressable>

            <View style={styles.headerCenter}>
              <Text
                numberOfLines={1}
                style={[
                  styles.headerTitle,
                  {
                    fontSize: headerTitleSize,
                    lineHeight: headerTitleSize + 5,
                  },
                ]}
              >
                Image to{" "}
                <Text style={styles.cyanText}>
                  Video
                </Text>
                <Text style={styles.headerSparkle}>
                  {" "}✦
                </Text>
              </Text>
            </View>

            <View style={styles.creditPill}>
              {/* The coin artwork is retained, but the sizing is
                  controlled so it does not visually dominate. */}
              <Image
                source={ASSETS.coin}
                resizeMode="contain"
                style={styles.coinImage}
              />

              <Text style={styles.creditValue}>
                12,450
              </Text>

              <Ionicons
                name="add"
                size={25}
                color={COLORS.cyan}
              />
            </View>
          </View>

          {/* ==================================================
              HERO
             ================================================== */}

          <View style={styles.heroCard}>
            <View style={styles.heroText}>
              <Text style={styles.heroTitle}>
                Bring Your Image
              </Text>

              <Text style={styles.heroAccent}>
                to Life{" "}
                <Text style={styles.heroSparkle}>
                  ✦
                </Text>
              </Text>

              <Text style={styles.heroDescription}>
                Tell Shivora your story and let AI
                understand the characters, scenes,
                actions and dialogue needed to
                create your video.
              </Text>
            </View>

            <Image
              source={ASSETS.imageVideoHero}
              resizeMode="contain"
              style={styles.heroImage}
            />
          </View>

          {/* ==================================================
              STORY
             ================================================== */}

          <View style={styles.storyCard}>
            <View style={styles.storyHeading}>
              <Ionicons
                name="pencil-outline"
                size={29}
                color={COLORS.secondary}
                style={styles.pencil}
              />

              <Text
                numberOfLines={1}
                style={styles.storyHeadingText}
              >
                Describe your story idea in detail...
              </Text>
            </View>

            <View style={styles.storyInputBox}>
              <TextInput
                value={story}
                onChangeText={onStoryChange}
                multiline
                textAlignVertical="top"
                maxLength={MAX_STORY_LENGTH}
                placeholder="Write your story here..."
                placeholderTextColor={COLORS.secondary}
                selectionColor={COLORS.cyan}
                cursorColor={COLORS.cyan}
                autoCorrect
                autoCapitalize="sentences"
                style={styles.storyInput}
              />

              <Image
                source={ASSETS.magicFeather}
                resizeMode="contain"
                style={styles.feather}
              />

              <Text style={styles.counter}>
                {story.length} / {MAX_STORY_LENGTH}
              </Text>
            </View>
          </View>

          {/* ==================================================
              AI UNDERSTANDS
             ================================================== */}

          <View style={styles.understandCard}>
            <View style={styles.understandHeading}>
              <Text
                numberOfLines={1}
                style={styles.understandTitle}
              >
                What AI will understand from your story
              </Text>

              <Text style={styles.cyanSparkle}>
                ✦
              </Text>
            </View>

            <View style={styles.aiRow}>
              {AI_ITEMS.map((item, index) => (
                <View
                  key={item.label}
                  style={[
                    styles.aiColumn,
                    {
                      width: aiColumnWidth,
                      borderRightWidth:
                        index === AI_ITEMS.length - 1
                          ? 0
                          : StyleSheet.hairlineWidth,
                    },
                  ]}
                >
                  <View style={styles.aiCircle}>
                    <Ionicons
                      name={item.icon}
                      size={27}
                      color={COLORS.cyanBright}
                    />
                  </View>

                  <Text
                    numberOfLines={1}
                    style={styles.aiLabel}
                  >
                    {item.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* ==================================================
              AI SUGGESTION
             ================================================== */}

          <View style={styles.suggestionCard}>
            <Image
              source={ASSETS.aiSuggestion}
              resizeMode="contain"
              style={styles.suggestionImage}
            />

            <View style={styles.suggestionCopy}>
              <Text style={styles.suggestionTitle}>
                Need inspiration?
              </Text>

              <Text style={styles.suggestionDescription}>
                Use AI to get ideas and prompts
                {"\n"}
                for your video.
              </Text>
            </View>

            <Pressable
              onPress={generateSuggestion}
              disabled={suggesting}
              style={({ pressed }) => [
                styles.suggestionButton,
                suggesting &&
                  styles.suggestionDisabled,
                pressed &&
                  !suggesting &&
                  styles.pressed,
              ]}
            >
              <Ionicons
                name="sparkles"
                size={18}
                color={COLORS.text}
              />

              <Text
                numberOfLines={1}
                style={styles.suggestionButtonText}
              >
                {suggesting
                  ? "Creating..."
                  : "Get AI Suggestion"}
              </Text>

              {!suggesting && (
                <Ionicons
                  name="chevron-forward"
                  size={21}
                  color={COLORS.text}
                />
              )}
            </Pressable>
          </View>

          {/* ==================================================
              CONTINUE
             ================================================== */}

          <Pressable
            onPress={continueToAnalysis}
            style={({ pressed }) => [
              styles.continueButton,
              !story.trim() &&
                styles.continueDisabled,
              pressed &&
                !!story.trim() &&
                styles.continuePressed,
            ]}
          >
            <Text style={styles.continueText}>
              Continue
            </Text>

            <Ionicons
              name="arrow-forward"
              size={31}
              color="#001114"
              style={styles.continueArrow}
            />
          </Pressable>

          <View style={styles.bottomSpace} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ============================================================
   STYLES
   ============================================================ */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  flex: {
    flex: 1,
  },

  scrollContent: {
    paddingTop: 7,
    paddingBottom: 22,
  },

  /* ==========================================================
     HEADER
     ========================================================== */

  header: {
    height: 67,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 13,
  },

  backButton: {
    width: 49,
    height: 49,
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: COLORS.border,
    backgroundColor: "#06151E",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  headerCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 2,
    minWidth: 0,
  },

  headerTitle: {
    color: COLORS.text,
    lineHeight: 32,
    fontWeight: "700",
    letterSpacing: -0.7,
    textAlign: "center",
  },

  cyanText: {
    color: COLORS.cyan,
  },

  headerSparkle: {
    color: COLORS.cyan,
    fontSize: 23,
    fontWeight: "800",
  },

  creditPill: {
    height: 43,
    minWidth: 119,
    borderRadius: 22,
    borderWidth: 1.1,
    borderColor: COLORS.border,
    backgroundColor: "#061720",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 9,
    flexShrink: 0,
  },

  coinImage: {
    width: 23,
    height: 23,
    marginRight: 4,
  },

  creditValue: {
    color: COLORS.text,
    fontSize: 15,
    lineHeight: 19,
    fontWeight: "500",
  },

  /* ==========================================================
     HERO
     ========================================================== */

  heroCard: {
    height: 160,
    borderRadius: 20,
    borderWidth: 1.25,
    borderColor: "#4336B7",
    backgroundColor: "#080A22",
    overflow: "hidden",
    position: "relative",
    marginBottom: 15,
  },

  heroText: {
    position: "absolute",
    left: 20,
    top: 19,
    width: "43%",
    zIndex: 4,
  },

  heroTitle: {
    color: COLORS.text,
    fontSize: 20,
    lineHeight: 24,
    fontWeight: "700",
    letterSpacing: -0.3,
  },

  heroAccent: {
    color: COLORS.cyan,
    fontSize: 21,
    lineHeight: 25,
    fontWeight: "800",
  },

  heroSparkle: {
    color: COLORS.cyan,
    fontSize: 20,
  },

  heroDescription: {
    marginTop: 8,
    color: COLORS.secondary,
    fontSize: 10.7,
    lineHeight: 17,
    maxWidth: 177,
  },

  heroImage: {
    position: "absolute",
    right: -8,
    bottom: -5,
    width: "59%",
    height: "109%",
    zIndex: 2,
  },

  /* ==========================================================
     STORY
     ========================================================== */

  storyCard: {
    height: 292,
    borderRadius: 20,
    borderWidth: 1.25,
    borderColor: COLORS.cyanBorder,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 13,
    paddingTop: 14,
    paddingBottom: 13,
    marginBottom: 15,
    overflow: "hidden",
  },

  storyHeading: {
    height: 38,
    flexDirection: "row",
    alignItems: "center",
  },

  pencil: {
    marginLeft: 1,
    marginRight: 9,
  },

  storyHeadingText: {
    flex: 1,
    color: COLORS.secondary,
    fontSize: 14.5,
    lineHeight: 20,
    fontWeight: "500",
  },

  storyInputBox: {
    flex: 1,
    marginTop: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#2A4D5D",
    backgroundColor: COLORS.inputInner,
    overflow: "hidden",
    position: "relative",
  },

  storyInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 14.5,
    lineHeight: 22,
    paddingHorizontal: 13,
    paddingTop: 11,
    paddingRight: 94,
    paddingBottom: 34,
  },

  feather: {
    position: "absolute",
    right: -4,
    bottom: 3,
    width: 132,
    height: 151,
    opacity: 0.94,
  },

  counter: {
    position: "absolute",
    left: 14,
    bottom: 11,
    color: COLORS.cyan,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "500",
  },

  /* ==========================================================
     AI UNDERSTANDS
     ========================================================== */

  understandCard: {
    height: 117,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    paddingTop: 11,
    paddingBottom: 8,
    marginBottom: 13,
    overflow: "hidden",
  },

  understandHeading: {
    height: 25,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },

  understandTitle: {
    flex: 1,
    color: COLORS.text,
    fontSize: 12.8,
    lineHeight: 17,
    fontWeight: "600",
  },

  cyanSparkle: {
    color: COLORS.cyan,
    fontSize: 20,
    lineHeight: 22,
    marginLeft: 5,
  },

  aiRow: {
    flex: 1,
    flexDirection: "row",
    marginTop: 5,
  },

  aiColumn: {
    height: 68,
    alignItems: "center",
    justifyContent: "flex-start",
    borderColor: "#173846",
  },

  aiCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#124859",
    backgroundColor: "#082A36",
    alignItems: "center",
    justifyContent: "center",
  },

  aiLabel: {
    width: "100%",
    color: COLORS.secondary,
    fontSize: 8.8,
    lineHeight: 13,
    fontWeight: "500",
    textAlign: "center",
    marginTop: 4,
    paddingHorizontal: 2,
  },

  /* ==========================================================
     SUGGESTION
     ========================================================== */

  suggestionCard: {
    height: 78,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: "#3A2464",
    backgroundColor: COLORS.purpleSurface,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 9,
    marginBottom: 13,
  },

  suggestionImage: {
    width: 57,
    height: 57,
    flexShrink: 0,
  },

  suggestionCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 8,
    marginRight: 7,
  },

  suggestionTitle: {
    color: COLORS.text,
    fontSize: 12.5,
    lineHeight: 17,
    fontWeight: "600",
  },

  suggestionDescription: {
    color: COLORS.secondary,
    fontSize: 9.6,
    lineHeight: 14,
    marginTop: 2,
  },

  suggestionButton: {
    width: 148,
    height: 42,
    borderRadius: 21,
    borderWidth: 1.2,
    borderColor: COLORS.purple,
    backgroundColor: "#1A0E38",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    gap: 4,
    flexShrink: 0,
  },

  suggestionDisabled: {
    opacity: 0.55,
  },

  suggestionButtonText: {
    color: COLORS.text,
    fontSize: 10.5,
    lineHeight: 14,
    fontWeight: "600",
    flexShrink: 1,
    textAlign: "center",
  },

  /* ==========================================================
     CONTINUE
     ========================================================== */

  continueButton: {
    height: 49,
    borderRadius: 25,
    backgroundColor: COLORS.cyan,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    shadowColor: COLORS.cyan,
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 7,
  },

  continueDisabled: {
    opacity: 0.5,
  },

  continuePressed: {
    transform: [{ scale: 0.985 }],
  },

  continueText: {
    color: "#001114",
    fontSize: 17.5,
    lineHeight: 22,
    fontWeight: "700",
  },

  continueArrow: {
    position: "absolute",
    right: 17,
  },

  bottomSpace: {
    height: 2,
  },

  pressed: {
    opacity: 0.72,
  },
});