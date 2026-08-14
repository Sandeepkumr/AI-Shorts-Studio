import React, { useMemo, useRef } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";

/**
 * Shivora — AI Preview
 *
 * File:
 * app/ai-preview.tsx
 *
 * Assets:
 * assets/ai-character-main.png
 * assets/ai-character-shopkeeper.png
 * assets/scene-01.png
 * assets/scene-02.png
 * assets/scene-03.png
 * assets/scene-04.png
 *
 * IMPORTANT:
 * This screen intentionally does NOT use ScrollView.
 * The layout is compact enough to fit on one iPhone screen.
 */

const ASSETS = {
  mainCharacter: require("../assets/ai-character-main.png"),
  shopkeeper: require("../assets/ai-character-shopkeeper.png"),
  scene01: require("../assets/scene-01.png"),
  scene02: require("../assets/scene-02.png"),
  scene03: require("../assets/scene-03.png"),
  scene04: require("../assets/scene-04.png"),
} as const;

const COLORS = {
  background: "#020A10",
  surface: "#071923",
  surfaceAlt: "#06151F",
  text: "#F5F7F8",
  secondary: "#AAB9C2",
  muted: "#7E919B",
  cyan: "#08D9D0",
  border: "#123B49",
  borderBright: "#0F5363",
  successSurface: "#063D37",
  black: "#001114",
};

const STORY_FALLBACK =
  "Ek ladka shop par gaya aur shopkeeper se burger manga.";

const STORY_SUMMARY =
  "A young boy visits a local burger shop and asks the shopkeeper for his favorite burger.";

const CHARACTERS = [
  {
    name: "Alex",
    role: "Main Character",
    description: "A young boy who loves burgers.",
    image: ASSETS.mainCharacter,
  },
  {
    name: "Shopkeeper",
    role: "Supporting Character",
    description: "A friendly shopkeeper who runs the burger shop.",
    image: ASSETS.shopkeeper,
  },
];

const SCENES = [
  {
    number: "01",
    image: ASSETS.scene01,
    title: "Boy enters a burger shop.",
  },
  {
    number: "02",
    image: ASSETS.scene02,
    title: "Boy asks the shopkeeper for his favorite burger.",
  },
  {
    number: "03",
    image: ASSETS.scene03,
    title: "Shopkeeper prepares the burger.",
  },
  {
    number: "04",
    image: ASSETS.scene04,
    title: "Boy receives his burger and is happy.",
  },
];

const VIDEO_STYLES = [
  {
    icon: "film-outline" as const,
    label: "3D",
    subLabel: "Animation",
  },
  {
    icon: "time-outline" as const,
    label: "~60",
    subLabel: "Seconds",
  },
  {
    icon: "phone-portrait-outline" as const,
    label: "9:16",
    subLabel: "Portrait",
  },
  {
    icon: "pulse-outline" as const,
    label: "AI Voice",
    subLabel: "Auto Generated",
  },
];

function getStory(value?: string | string[]) {
  const normalized = Array.isArray(value) ? value[0] : value;
  return normalized?.trim() || STORY_FALLBACK;
}

function Sparkle() {
  return <Text style={styles.sparkle}>✦</Text>;
}

function SectionTitle({
  title,
  right,
}: {
  title: string;
  right?: React.ReactNode;
}) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionTitleWrap}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Sparkle />
      </View>
      {right}
    </View>
  );
}

function VideoStyleItem({
  icon,
  label,
  subLabel,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  subLabel: string;
}) {
  return (
    <View style={styles.videoStyleItem}>
      <Ionicons name={icon} size={23} color={COLORS.cyan} />

      <Text numberOfLines={1} style={styles.videoStyleLabel}>
        {label}
      </Text>

      <Text
        numberOfLines={2}
        style={styles.videoStyleSubLabel}
      >
        {subLabel}
      </Text>
    </View>
  );
}

export default function AIPreviewScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const params = useLocalSearchParams<{ story?: string | string[] }>();
  const sceneScrollRef = useRef<ScrollView>(null);

  const story = useMemo(
    () => getStory(params.story),
    [params.story]
  );

  /*
   * Base design target: approximately iPhone 390x844.
   * We keep all vertical sections fixed/compact so the entire
   * screen fits without scrolling.
   */
  const narrow = width <= 375;
  const short = height <= 760;

  const horizontalPadding = narrow ? 16 : 20;
  const contentWidth = width - horizontalPadding * 2;

  const columnGap = narrow ? 8 : 10;
  const characterCardWidth =
    (contentWidth - columnGap) / 2;

  const characterImageWidth = narrow ? 66 : 72;
  const characterImageHeight = narrow ? 88 : 96;

  const sceneGap = narrow ? 8 : 10;
  const sceneCardWidth =
    (contentWidth - sceneGap) / 2;
  const sceneImageHeight = narrow ? 88 : 94;

  const verticalTight = short ? 0.92 : 1;

  const handleGenerate = () => {
    router.push('/video-generating');
  };

  return (
    <View style={styles.root}>
      <SafeAreaView
        edges={["top", "bottom"]}
        style={styles.safeArea}
      >
        <View
          style={[
            styles.container,
            {
              paddingHorizontal: horizontalPadding,
            },
          ]}
        >
          {/* HEADER */}
          <View style={[styles.header, { transform: [{ scaleY: verticalTight }] }]}>
            <Pressable
              style={styles.backButton}
              onPress={() => router.back()}
              hitSlop={8}
            >
              <Ionicons
                name="chevron-back"
                size={29}
                color={COLORS.text}
              />
            </Pressable>

            <View style={styles.headerTitleWrap}>
              <Text style={styles.headerTitle}>
                AI <Text style={styles.cyan}>Preview</Text>
              </Text>
              <Text style={styles.headerSparkle}>✦</Text>
            </View>

            <View style={styles.creditPill}>
              <Ionicons
                name="layers-outline"
                size={20}
                color={COLORS.cyan}
              />
              <Text style={styles.creditValue}>12,450</Text>
              <Text style={styles.creditPlus}>+</Text>
            </View>
          </View>

          <Text style={styles.headerSubtitle}>
            Shivora has understood your story and{"\n"}
            created a preview of your video.
          </Text>

          {/* STORY */}
          <View style={styles.storyCard}>
            <View style={styles.storyHeader}>
              <View style={styles.storyTitleWrap}>
                <Text style={styles.storyTitle}>Your Story</Text>
                <Pressable
                  onPress={() => router.back()}
                  hitSlop={8}
                >
                  <Ionicons
                    name="pencil"
                    size={20}
                    color={COLORS.cyan}
                  />
                </Pressable>
              </View>

              <View style={styles.goodBadge}>
                <Ionicons
                  name="checkmark"
                  size={16}
                  color={COLORS.cyan}
                />
                <Text style={styles.goodBadgeText}>
                  Story Looks Good
                </Text>
              </View>
            </View>

            <Text
              numberOfLines={2}
              style={styles.storyText}
            >
              {story}
            </Text>

            <Text style={styles.summaryLabel}>
              AI Summary
            </Text>

            <Text
              numberOfLines={2}
              style={styles.summaryText}
            >
              {STORY_SUMMARY}
            </Text>
          </View>

          {/* CHARACTERS */}
          <SectionTitle title="AI Generated Characters" />

          <View
            style={[
              styles.characterRow,
              { gap: columnGap },
            ]}
          >
            {CHARACTERS.map((character) => (
              <View
                key={character.name}
                style={[
                  styles.characterCard,
                  { width: characterCardWidth },
                ]}
              >
                <Image
                  source={character.image}
                  resizeMode="contain"
                  style={{
                    width: characterImageWidth,
                    height: characterImageHeight,
                  }}
                />

                <View style={styles.characterCopy}>
                  <Text
                    numberOfLines={1}
                    style={styles.characterName}
                  >
                    {character.name}
                  </Text>

                  <Text
                    numberOfLines={2}
                    style={styles.characterRole}
                  >
                    {character.role}
                  </Text>

                  <Text
                    numberOfLines={2}
                    style={styles.characterDescription}
                  >
                    {character.description}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* SCENES */}
          <SectionTitle
            title="AI Planned Scenes"
            right={
              <View style={styles.sceneCount}>
                <Ionicons
                  name="film-outline"
                  size={18}
                  color={COLORS.cyan}
                />
                <Text style={styles.sceneCountText}>
                  4 Scenes
                </Text>
              </View>
            }
          />

          <View style={styles.sceneRowArea}>
            <ScrollView
              ref={sceneScrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              bounces={false}
              directionalLockEnabled
              decelerationRate="fast"
              snapToInterval={sceneCardWidth * 2 + sceneGap + 16}
              snapToAlignment="start"
              contentContainerStyle={{
                paddingHorizontal: 8,
              }}
              style={styles.sceneScroll}
            >
              <View
                style={[
                  styles.sceneRow,
                  { gap: sceneGap },
                ]}
              >
                {SCENES.map((scene) => (
                  <View
                    key={scene.number}
                    style={[
                      styles.sceneItem,
                      { width: sceneCardWidth },
                    ]}
                  >
                    <View
                      style={[
                        styles.sceneImageWrap,
                        { height: sceneImageHeight },
                      ]}
                    >
                      <Image
                        source={scene.image}
                        resizeMode="cover"
                        style={styles.sceneImage}
                      />

                      <View style={styles.sceneNumber}>
                        <Text style={styles.sceneNumberText}>
                          {scene.number}
                        </Text>
                      </View>
                    </View>

                    <Text
                      numberOfLines={2}
                      style={styles.sceneTitle}
                    >
                      {scene.title}
                    </Text>
                  </View>
                ))}
              </View>
            </ScrollView>

            <Pressable
              accessibilityLabel="Previous planned scenes"
              style={[
                styles.sceneArrow,
                styles.sceneArrowLeft,
              ]}
              onPress={() =>
                sceneScrollRef.current?.scrollTo({
                  x: 0,
                  animated: true,
                })
              }
              hitSlop={8}
            >
              <Ionicons
                name="chevron-back"
                size={22}
                color={COLORS.text}
              />
            </Pressable>

            <Pressable
              accessibilityLabel="Next planned scenes"
              style={[
                styles.sceneArrow,
                styles.sceneArrowRight,
              ]}
              onPress={() =>
                sceneScrollRef.current?.scrollTo({
                  x: sceneCardWidth * 2 + sceneGap + 16,
                  animated: true,
                })
              }
              hitSlop={8}
            >
              <Ionicons
                name="chevron-forward"
                size={22}
                color={COLORS.text}
              />
            </Pressable>
          </View>

          {/* VIDEO STYLE */}
          <SectionTitle title="Video Style" />

          <View style={styles.videoStyleCard}>
            {VIDEO_STYLES.map((item) => (
              <VideoStyleItem
                key={item.label}
                icon={item.icon}
                label={item.label}
                subLabel={item.subLabel}
              />
            ))}
          </View>

          {/* GENERATE */}
          <Pressable
            style={({ pressed }) => [
              styles.generateButton,
              pressed && styles.generatePressed,
            ]}
            onPress={handleGenerate}
          >
            <Ionicons
              name="play"
              size={22}
              color="#FFFFFF"
            />

            <Text style={styles.generateText}>
              Generate Video
            </Text>

            <Ionicons
              name="arrow-forward"
              size={31}
              color="#FFFFFF"
              style={styles.generateArrow}
            />
          </Pressable>

          <View style={styles.secureRow}>
            <Ionicons
              name="lock-closed"
              size={16}
              color={COLORS.muted}
            />
            <Text style={styles.secureText}>
              Your generation is secure and private
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  container: {
    flex: 1,
    paddingTop: 5,
    paddingBottom: 7,
    justifyContent: "space-between",
  },

  /* HEADER */
  header: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backButton: {
    width: 47,
    height: 47,
    borderRadius: 15,
    borderWidth: 1.2,
    borderColor: COLORS.borderBright,
    backgroundColor: COLORS.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  headerTitleWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 6,
  },

  headerTitle: {
    color: COLORS.text,
    fontSize: 24,
    lineHeight: 29,
    fontWeight: "700",
    letterSpacing: -0.5,
  },

  cyan: {
    color: COLORS.cyan,
  },

  headerSparkle: {
    color: COLORS.cyan,
    fontSize: 22,
    lineHeight: 24,
    marginLeft: 3,
    marginTop: -13,
  },

  creditPill: {
    height: 40,
    minWidth: 113,
    borderRadius: 20,
    borderWidth: 1.1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surfaceAlt,
    paddingHorizontal: 9,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  creditValue: {
    marginLeft: 5,
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "500",
  },

  creditPlus: {
    marginLeft: 4,
    color: COLORS.cyan,
    fontSize: 23,
    lineHeight: 26,
    fontWeight: "300",
  },

  headerSubtitle: {
    marginTop: 2,
    color: COLORS.secondary,
    fontSize: 12.5,
    lineHeight: 17,
    textAlign: "center",
  },

  /* STORY */
  storyCard: {
    minHeight: 103,
    borderRadius: 16,
    borderWidth: 1.15,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },

  storyHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  storyTitleWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    flexShrink: 1,
  },

  storyTitle: {
    color: COLORS.text,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "700",
  },

  goodBadge: {
    height: 32,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1.1,
    borderColor: COLORS.cyan,
    backgroundColor: COLORS.successSurface,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flexShrink: 0,
  },

  goodBadgeText: {
    color: COLORS.cyan,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "600",
  },

  storyText: {
    marginTop: 8,
    color: COLORS.text,
    fontSize: 12.5,
    lineHeight: 17,
  },

  summaryLabel: {
    marginTop: 8,
    color: COLORS.cyan,
    fontSize: 11.5,
    lineHeight: 15,
  },

  summaryText: {
    marginTop: 3,
    color: COLORS.text,
    fontSize: 12.5,
    lineHeight: 17,
  },

  /* SECTION */
  sectionHeader: {
    minHeight: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  sectionTitleWrap: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: 0,
    flexShrink: 1,
  },

  sectionTitle: {
    color: COLORS.text,
    fontSize: 21,
    lineHeight: 25,
    fontWeight: "700",
    letterSpacing: -0.35,
  },

  sparkle: {
    color: COLORS.cyan,
    fontSize: 25,
    lineHeight: 27,
    marginLeft: 6,
    marginTop: -6,
  },

  /* CHARACTERS */
  characterRow: {
    flexDirection: "row",
  },

  characterCard: {
    height: 116,
    borderRadius: 16,
    borderWidth: 1.15,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 7,
    overflow: "hidden",
  },

  characterCopy: {
    flex: 1,
    minWidth: 0,
    paddingLeft: 6,
    paddingRight: 3,
  },

  characterName: {
    color: COLORS.text,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "700",
  },

  characterRole: {
    marginTop: 2,
    color: COLORS.cyan,
    fontSize: 10.5,
    lineHeight: 14,
  },

  characterDescription: {
    marginTop: 5,
    color: COLORS.secondary,
    fontSize: 10.5,
    lineHeight: 15,
  },

  /* SCENES */
  sceneCount: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  sceneCountText: {
    color: COLORS.secondary,
    fontSize: 13,
    lineHeight: 17,
  },

  sceneRowArea: {
    position: "relative",
    width: "100%",
    overflow: "hidden",
  },

  sceneScroll: {
    width: "100%",
  },

  sceneRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  sceneItem: {
    flexShrink: 0,
  },

  sceneImageWrap: {
    width: "100%",
    borderRadius: 12,
    borderWidth: 1.15,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    overflow: "hidden",
    position: "relative",
  },

  sceneImage: {
    width: "100%",
    height: "100%",
  },

  sceneNumber: {
    position: "absolute",
    left: 7,
    top: 7,
    width: 31,
    height: 31,
    borderRadius: 16,
    borderWidth: 1.6,
    borderColor: COLORS.cyan,
    backgroundColor: "#06333F",
    alignItems: "center",
    justifyContent: "center",
  },

  sceneNumberText: {
    color: COLORS.cyan,
    fontSize: 11.5,
    lineHeight: 15,
    fontWeight: "700",
  },

  sceneTitle: {
    marginTop: 4,
    minHeight: 30,
    color: COLORS.text,
    fontSize: 10.5,
    lineHeight: 14,
    paddingHorizontal: 1,
  },

  sceneArrow: {
    position: "absolute",
    top: 28,
    width: 32,
    height: 40,
    borderRadius: 20,
    zIndex: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(2, 10, 16, 0.86)",
    borderWidth: 1,
    borderColor: COLORS.borderBright,
  },

  sceneArrowLeft: {
    left: 0,
  },

  sceneArrowRight: {
    right: 0,
  },

  /* VIDEO STYLE */
  videoStyleCard: {
    height: 74,
    borderRadius: 15,
    borderWidth: 1.15,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 7,
    paddingVertical: 7,
    flexDirection: "row",
    gap: 6,
  },

  videoStyleItem: {
    flex: 1,
    minWidth: 0,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 2,
  },

  videoStyleLabel: {
    marginTop: 3,
    color: COLORS.text,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "600",
    textAlign: "center",
  },

  videoStyleSubLabel: {
    color: COLORS.secondary,
    fontSize: 8,
    lineHeight: 11,
    textAlign: "center",
  },

  /* GENERATE */
  generateButton: {
    height: 59,
    borderRadius: 30,
    backgroundColor: COLORS.cyan,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    shadowColor: COLORS.cyan,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.28,
    shadowRadius: 13,
    elevation: 7,
  },

  generatePressed: {
    opacity: 0.88,
  },

  generateText: {
    marginLeft: 10,
    color: COLORS.black,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "800",
  },

  generateArrow: {
    position: "absolute",
    right: 16,
  },

  secureRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },

  secureText: {
    color: COLORS.muted,
    fontSize: 9.5,
    lineHeight: 13,
  },
});