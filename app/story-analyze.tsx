import React from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";

/*
 * ============================================================
 * IMAGE TO VIDEO — STORY ANALYSIS SCREEN
 * ============================================================
 *
 * File:
 *   app/image-video-analysis.tsx
 *
 * Assets:
 *   assets/story-analysis-complete.png
 *   assets/ai-character-main2.png
 *   assets/ai-character-shopkeeper2.png
 *   assets/coin.png
 *
 * Because this file lives directly inside /app, the correct
 * asset path is ../assets/...
 * ============================================================
 */

const ASSETS = {
  analysis: require("../assets/story-analysis-complete.png"),
  mainCharacter: require("../assets/ai-character-main2.png"),
  shopkeeper: require("../assets/ai-character-shopkeeper2.png"),
  coin: require("../assets/coin.png"),
};

const COLORS = {
  background: "#020A10",
  card: "#071A24",
  cardAlt: "#061720",
  border: "#123C4A",
  borderSoft: "#173847",

  text: "#F5F7F9",
  secondary: "#B6C3CB",
  muted: "#80939E",

  cyan: "#08DED8",
  cyanBright: "#00ECE5",
  cyanDeep: "#073A42",

  purple: "#A95CFF",
  purpleBright: "#C777FF",
  purpleSurface: "#26103F",

  green: "#10E3B1",
};

type CharacterData = {
  id: string;
  name: string;
  role: "Main Character" | "Supporting Character";
  badge: "Required" | "Optional";
  description: string;
  note: string;
  accent: "purple" | "cyan";
  image: any;
};

const DEFAULT_CHARACTERS: CharacterData[] = [
  {
    id: "vamika",
    name: "Vamika",
    role: "Main Character",
    badge: "Required",
    description:
      "The main character identified from your story.",
    note:
      "Main character image will be selected in the next step.",
    accent: "purple",
    image: ASSETS.mainCharacter,
  },
  {
    id: "shopkeeper",
    name: "Shopkeeper",
    role: "Supporting Character",
    badge: "Optional",
    description:
      "The shop owner who prepares delicious burgers.",
    note:
      "You can use Shivora's character or provide your own image in the next step.",
    accent: "cyan",
    image: ASSETS.shopkeeper,
  },
  {
    id: "vamika-supporting",
    name: "Vamika",
    role: "Supporting Character",
    badge: "Optional",
    description:
      "An additional Vamika character detected for testing the character list.",
    note:
      "This extra character is included to demonstrate the vertical character scroll.",
    accent: "cyan",
    image: ASSETS.mainCharacter,
  },
];

const getCharactersFromParams = (
  rawCharacters: string | string[] | undefined
): CharacterData[] => {
  if (!rawCharacters) return DEFAULT_CHARACTERS;

  const raw = Array.isArray(rawCharacters)
    ? rawCharacters[0]
    : rawCharacters;

  try {
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed) || parsed.length === 0) {
      return DEFAULT_CHARACTERS;
    }

    return parsed.map((item: any, index: number) => {
      const isMain =
        item.role === "Main Character" ||
        item.role === "main" ||
        index === 0;

      return {
        id:
          String(item.id ?? item.name ?? `character-${index}`)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-"),
        name: String(
          item.name ?? (isMain ? "Vamika" : `Character ${index + 1}`)
        ),
        role: isMain
          ? "Main Character"
          : "Supporting Character",
        badge: isMain ? "Required" : "Optional",
        description: String(
          item.description ??
            (isMain
              ? "The main character identified from your story."
              : "A supporting character identified from your story.")
        ),
        note: String(
          item.note ??
            (isMain
              ? "Main character image will be selected in the next step."
              : "You can use Shivora's character or provide your own image in the next step.")
        ),
        accent: isMain ? "purple" : "cyan",
        image:
          index === 0
            ? ASSETS.mainCharacter
            : ASSETS.shopkeeper,
      };
    });
  } catch {
    return DEFAULT_CHARACTERS;
  }
};

const STATIC_SCENE_COUNT = 4;
const STATIC_DIALOGUE_COUNT = 6;

/* ============================================================
   SCREEN
   ============================================================ */

export default function ImageVideoAnalysisScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const params = useLocalSearchParams<{
    characters?: string;
  }>();

  const horizontalPadding = width <= 375 ? 16 : 22;
  const contentWidth = width - horizontalPadding * 2;

  /*
   * Fixed viewport for ONLY the character list.
   * This is intentionally not flex-based so FlatList always receives
   * a real height and can scroll reliably when there are 3+ characters.
   */
  // Only this viewport scrolls. Two cards fit completely;
  // three or more cards become vertically scrollable.
  const characterViewportHeight =
    height <= 760 ? 272 : height <= 850 ? 286 : 300;

  const characters = getCharactersFromParams(
    params.characters
  );

  const characterCount = characters.length;

  const stats = [
    {
      value: String(characterCount),
      label: "Characters",
      icon: "people-outline" as const,
      color: COLORS.purple,
    },
    {
      value: String(STATIC_SCENE_COUNT),
      label: "Scenes",
      icon: "film-outline" as const,
      color: COLORS.cyan,
    },
    {
      value: String(STATIC_DIALOGUE_COUNT),
      label: "Dialogues",
      icon: "chatbubble-ellipses-outline" as const,
      color: COLORS.green,
    },
  ];

  const backWidth = 48;
  const creditWidth = width <= 375 ? 112 : 124;

  // Keep the title in one line. This prevents the previous
  // "Image / to Video" wrap seen in the result screenshot.
  const titleWidth = Math.max(120, contentWidth - backWidth - creditWidth - 14);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  };

  const handleContinue = () => {
    router.push("/image-video-characters");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.background}
      />

      <View style={styles.screen}>
        {/* ======================================================
            HEADER
           ====================================================== */}

        <View
          style={[
            styles.header,
            { paddingHorizontal: horizontalPadding },
          ]}
        >
          <Pressable
            onPress={handleBack}
            hitSlop={10}
            style={({ pressed }) => [
              styles.backButton,
              { width: backWidth },
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              name="chevron-back"
              size={33}
              color={COLORS.text}
            />
          </Pressable>

          <View
            style={[
              styles.headerTitleWrap,
              { width: titleWidth },
            ]}
          >
            <Text
              numberOfLines={1}
              style={styles.headerTitle}
            >
              Image to{" "}
              <Text style={styles.headerTitleAccent}>
                Video
              </Text>
              <Text style={styles.headerSparkle}>✦</Text>
            </Text>
          </View>

          <View
            style={[
              styles.creditPill,
              { width: creditWidth },
            ]}
          >
            <Image
              source={ASSETS.coin}
              resizeMode="contain"
              style={styles.coinIcon}
            />
            <Text style={styles.creditValue}>
              12,450
            </Text>
            <Text style={styles.creditPlus}>+</Text>
          </View>
        </View>

        {/* ======================================================
            FIXED SCREEN CONTENT

            The whole screen does NOT scroll.
            Only the character list below has its own
            bounded vertical ScrollView.
           ====================================================== */}

        <View
          style={[
            styles.content,
            { paddingHorizontal: horizontalPadding },
          ]}
        >
          {/* ====================================================
              STEP PROGRESS
             ==================================================== */}

          <View style={styles.progressRow}>
            <ProgressStep
              value="✓"
              label="Story"
              active
              completed
            />
            <ProgressLine active />

            <ProgressStep
              value="2"
              label="Analyze"
              active
            />
            <ProgressLine active />

            <ProgressStep
              value="3"
              label="Characters"
            />
            <ProgressLine />

            <ProgressStep
              value="4"
              label="Scenes"
            />
            <ProgressLine />

            <ProgressStep
              value="5"
              label="Preview"
            />
          </View>

          {/* ====================================================
              ANALYSIS COMPLETE
             ==================================================== */}

          <View style={styles.analysisCard}>
            <View style={styles.analysisHero}>
              <View
                style={[
                  styles.analysisCopy,
                  { width: contentWidth * 0.66 },
                ]}
              >
                <Text
                  style={styles.analysisTitle}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.78}
                >
                  Story Analysis Complete
                  <Text style={styles.titleSparkle}> ✦</Text>
                </Text>

                <Text style={styles.analysisDescription}>
                  Shivora has analyzed your story
                  {"\n"}
                  and identified the key elements.
                </Text>
              </View>

              <Image
                source={ASSETS.analysis}
                resizeMode="contain"
                style={[
                  styles.analysisArtwork,
                  {
                    width: contentWidth * 0.28,
                    height: contentWidth * 0.23,
                  },
                ]}
              />
            </View>

            <View style={styles.statsRow}>
              {stats.map((stat, index) => (
                <View
                  key={stat.label}
                  style={[
                    styles.statItem,
                    index < stats.length - 1 &&
                      styles.statDivider,
                  ]}
                >
                  <Ionicons
                    name={stat.icon}
                    size={22}
                    color={stat.color}
                  />

                  <Text style={styles.statValue}>
                    {stat.value}
                  </Text>

                  <Text
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.74}
                    style={styles.statLabel}
                  >
                    {stat.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* ====================================================
              CHARACTERS REQUIRED
             ==================================================== */}

          <View style={styles.characterSection}>
            <Text style={styles.sectionTitle}>
              Your story needs{" "}
              <Text style={styles.sectionAccent}>
                {characterCount}{" "}
                {characterCount === 1
                  ? "character"
                  : "characters"}
              </Text>
            </Text>

            <Text style={styles.sectionDescription}>
              We've identified the main and supporting characters
              {"\n"}
              required to bring your story to life.
            </Text>

            {/* ==================================================
                CHARACTER LIST

                The list has its own bounded vertical scroll area.
                This keeps the surrounding screen stable while
                supporting 2, 3, 4, 5 or more characters.
               ================================================== */}

            <View
              style={[
                styles.characterScroller,
                { height: characterViewportHeight },
              ]}
            >
              <ScrollView
                style={styles.characterScrollView}
                contentContainerStyle={styles.characterScrollerContent}
                showsVerticalScrollIndicator={characterCount > 2}
                scrollEnabled={characterCount > 2}
                bounces={false}
                alwaysBounceVertical={false}
                nestedScrollEnabled
                directionalLockEnabled
                keyboardShouldPersistTaps="handled"
                overScrollMode="never"
              >
                {characters.map((character, index) => (
                  <CharacterPreview
                    key={character.id}
                    image={character.image}
                    name={character.name}
                    role={character.role}
                    badge={character.badge}
                    badgeStyle={
                      character.accent === "purple"
                        ? "purple"
                        : "cyan"
                    }
                    description={character.description}
                    note={character.note}
                    accent={character.accent}
                    index={index}
                    isLast={index === characters.length - 1}
                  />
                ))}
              </ScrollView>
            </View>

            {/* ==================================================
                INFORMATION CARD
               ================================================== */}

            <View style={styles.infoCard}>
              <View style={styles.infoCircle}>
                <Text style={styles.infoSparkle}>✦</Text>
                <Text style={styles.infoAi}>AI</Text>
              </View>

              <Text style={styles.infoText}>
                After you set up your characters, Shivora will create
                {"\n"}
                the scenes and dialogues based on your story.
              </Text>
            </View>
          </View>

          {/* ====================================================
              CONTINUE
             ==================================================== */}

          <Pressable
            onPress={handleContinue}
            style={({ pressed }) => [
              styles.continueButton,
              pressed && styles.continuePressed,
            ]}
          >
            <Text style={styles.continueText}>
              Continue to Characters
            </Text>

            <Ionicons
              name="arrow-forward"
              size={31}
              color="#001114"
            />
          </Pressable>

          <View style={styles.bottomSpace} />
        </View>
      </View>
    </SafeAreaView>
  );
}

/* ============================================================
   PROGRESS
   ============================================================ */

function ProgressStep({
  value,
  label,
  active = false,
  completed = false,
}: {
  value: string;
  label: string;
  active?: boolean;
  completed?: boolean;
}) {
  return (
    <View style={styles.progressStep}>
      <View
        style={[
          styles.progressCircle,
          active && styles.progressCircleActive,
        ]}
      >
        <Text
          style={[
            styles.progressValue,
            active && styles.progressValueActive,
          ]}
        >
          {value}
        </Text>
      </View>

      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.72}
        style={[
          styles.progressLabel,
          active && styles.progressLabelActive,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

function ProgressLine({
  active = false,
}: {
  active?: boolean;
}) {
  return (
    <View
      style={[
        styles.progressLine,
        active && styles.progressLineActive,
      ]}
    />
  );
}

/* ============================================================
   CHARACTER PREVIEW
   ============================================================ */

function CharacterPreview({
  image,
  name,
  role,
  badge,
  badgeStyle,
  description,
  note,
  accent,
  index,
  isLast,
}: {
  image: any;
  name: string;
  role: string;
  badge: string;
  badgeStyle: "purple" | "cyan";
  description: string;
  note: string;
  accent: "purple" | "cyan";
  index: number;
  isLast: boolean;
}) {
  return (
    <View
      style={[
        styles.characterCard,
        isLast && styles.characterCardLast,
      ]}
      accessibilityLabel={`Character ${index + 1}: ${name}`}
    >
      <View
        style={[
          styles.characterImageWrap,
          accent === "purple"
            ? styles.characterImageWrapPurple
            : styles.characterImageWrapCyan,
        ]}
      >
        <Image
          source={image}
          resizeMode="contain"
          style={styles.characterImage}
        />
      </View>

      <View style={styles.characterContent}>
        <View style={styles.characterTitleRow}>
          <Text
            numberOfLines={1}
            style={styles.characterName}
          >
            {name}
          </Text>

          <View
            style={[
              styles.rolePill,
              accent === "purple"
                ? styles.rolePillPurple
                : styles.rolePillCyan,
            ]}
          >
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.72}
              style={[
                styles.rolePillText,
                accent === "purple"
                  ? styles.rolePillTextPurple
                  : styles.rolePillTextCyan,
              ]}
            >
              {role}
            </Text>
          </View>
        </View>

        <Text
          numberOfLines={2}
          style={styles.characterDescription}
        >
          {description}
        </Text>

        <View style={styles.noteRow}>
          <View
            style={[
              styles.infoDot,
              accent === "purple"
                ? styles.infoDotPurple
                : styles.infoDotCyan,
            ]}
          >
            <Text
              style={[
                styles.infoDotText,
                accent === "purple"
                  ? styles.infoDotTextPurple
                  : styles.infoDotTextCyan,
              ]}
            >
              i
            </Text>
          </View>

          <Text
            numberOfLines={2}
            style={styles.noteText}
          >
            {note}
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.statusBadge,
          badgeStyle === "purple"
            ? styles.statusBadgePurple
            : styles.statusBadgeCyan,
        ]}
      >
        <Text
          style={[
            styles.statusBadgeText,
            badgeStyle === "purple"
              ? styles.statusBadgeTextPurple
              : styles.statusBadgeTextCyan,
          ]}
        >
          {badge}
        </Text>
      </View>
    </View>
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

  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  content: {
    flex: 1,
    paddingTop: 3,
    paddingBottom: 3,
  },

  pressed: {
    opacity: 0.7,
  },

  /* ==========================================================
     HEADER
     ========================================================== */

  header: {
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backButton: {
    height: 46,
    borderRadius: 15,
    borderWidth: 1.3,
    borderColor: "#154A5D",
    backgroundColor: "#061822",
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitleWrap: {
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    color: COLORS.text,
    fontSize: 20,
    lineHeight: 23,
    fontWeight: "800",
    letterSpacing: -0.7,
  },

  headerTitleAccent: {
    color: COLORS.cyan,
  },

  headerSparkle: {
    color: COLORS.cyan,
    fontSize: 17,
    fontWeight: "900",
  },

  creditPill: {
    height: 40,
    borderRadius: 17,
    borderWidth: 1.2,
    borderColor: "#154A5D",
    backgroundColor: "#061822",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 9,
  },

  coinIcon: {
    width: 20,
    height: 20,
    marginRight: 4,
  },

  creditValue: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: "600",
  },

  creditPlus: {
    color: COLORS.cyan,
    fontSize: 20,
    lineHeight: 28,
    marginLeft: 6,
  },

  /* ==========================================================
     PROGRESS
     ========================================================== */

  progressRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 10,
    marginBottom: 16,
  },

  progressStep: {
    width: 38,
    alignItems: "center",
  },

  progressCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#172C3B",
    alignItems: "center",
    justifyContent: "center",
  },

  progressCircleActive: {
    backgroundColor: COLORS.cyan,
  },

  progressValue: {
    color: "#93A6B2",
    fontSize: 12,
    fontWeight: "700",
  },

  progressValueActive: {
    color: "#001114",
  },

  progressLabel: {
    marginTop: 4,
    color: "#AAB6BF",
    fontSize: 8.3,
    fontWeight: "500",
    textAlign: "center",
  },

  progressLabelActive: {
    color: COLORS.cyan,
    fontWeight: "700",
  },

  progressLine: {
    flex: 1,
    height: 1.5,
    backgroundColor: "#183847",
    marginTop: 15,
    marginHorizontal: 3,
  },

  progressLineActive: {
    backgroundColor: COLORS.cyan,
  },

  /* ==========================================================
     ANALYSIS CARD
     ========================================================== */

  analysisCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: "#5428A4",
    paddingHorizontal: 8,
    paddingTop: 7,
    paddingBottom: 6,
    marginBottom: 12,
    overflow: "hidden",
  },

  analysisHero: {
    height: 108,
    position: "relative",
  },

  analysisCopy: {
    position: "absolute",
    left: 8,
    top: 10,
    zIndex: 5,
  },

  analysisTitle: {
    color: COLORS.text,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "800",
    letterSpacing: -0.35,
    includeFontPadding: false,
  },

  titleSparkle: {
    color: COLORS.cyan,
    fontSize: 22,
  },

  analysisDescription: {
    color: "#D0DAE0",
    fontSize: 9.3,
    lineHeight: 14,
    marginTop: 6,
  },

  analysisArtwork: {
    position: "absolute",
    right: -4,
    bottom: -2,
    zIndex: 2,
  },

  /* ==========================================================
     STATS
     ========================================================== */

  statsRow: {
    flexDirection: "row",
    width: "100%",
    borderTopWidth: 1,
    borderTopColor: "#133646",
    paddingTop: 3,
  },

  statItem: {
    flex: 1,
    minHeight: 58,
    alignItems: "center",
    justifyContent: "center",
  },

  statDivider: {
    borderRightWidth: 1,
    borderRightColor: "#173947",
  },

  statValue: {
    marginTop: 1,
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 17,
  },

  statLabel: {
    marginTop: 0,
    color: "#BCC8CF",
    fontSize: 8,
    fontWeight: "500",
    textAlign: "center",
  },

  /* ==========================================================
     CHARACTER SECTION
     ========================================================== */

  characterSection: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    borderWidth: 1.2,
    borderColor: COLORS.border,
    padding: 12,
    marginBottom: 10,
    overflow: "hidden",
  },

  sectionTitle: {
    color: COLORS.text,
    fontSize: 19,
    lineHeight: 24,
    fontWeight: "800",
  },

  sectionAccent: {
    color: COLORS.cyan,
  },

  sectionDescription: {
    color: COLORS.secondary,
    fontSize: 10,
    lineHeight: 14,
    marginTop: 3,
    marginBottom: 9,
  },

  /* ==========================================================
     CHARACTER SCROLLER
     ========================================================== */

  characterScroller: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 6,
    backgroundColor: "#061822",
    paddingVertical: 1,
  },

  characterScrollView: {
    flex: 1,
  },

  characterScrollerContent: {
    paddingTop: 0,
    paddingBottom: 2,
  },

  /* ==========================================================
     CHARACTER CARD
     ========================================================== */

  characterCard: {
    height: 136,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#123E50",
    backgroundColor: "#061822",
    padding: 10,
    flexDirection: "row",
    position: "relative",
    overflow: "hidden",
    marginBottom: 8,
  },

  characterCardLast: {
    marginBottom: 0,
  },

  characterImageWrap: {
    width: 94,
    height: 124,
    borderRadius: 54,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginRight: 9,
    marginTop: 3,
    transform: [{ translateY: -6 }],
  },

  characterImageWrapPurple: {
    backgroundColor: "#17183A",
    borderWidth: 1,
    borderColor: "#4F3D88",
  },

  characterImageWrapCyan: {
    backgroundColor: "#0C2D37",
    borderWidth: 1,
    borderColor: "#195A6D",
  },

  characterImage: {
    width: 106,
    height: 130,
  },

  characterContent: {
    flex: 1,
    paddingTop: 4,
    paddingRight: 48,
    minWidth: 0,
  },

  characterTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },

  characterName: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "800",
    marginRight: 7,
    maxWidth: "100%",
  },

  rolePill: {
    minHeight: 23,
    paddingHorizontal: 7,
    borderRadius: 12,
    justifyContent: "center",
    marginTop: 2,
    maxWidth: "100%",
  },

  rolePillPurple: {
    backgroundColor: "#2A1547",
  },

  rolePillCyan: {
    backgroundColor: "#073A42",
  },

  rolePillText: {
    fontSize: 8.3,
    fontWeight: "600",
  },

  rolePillTextPurple: {
    color: COLORS.purpleBright,
  },

  rolePillTextCyan: {
    color: COLORS.cyan,
  },

  characterDescription: {
    color: "#C7D1D6",
    fontSize: 10.5,
    lineHeight: 15,
    marginTop: 6,
    paddingRight: 2,
  },

  noteRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 8,
  },

  infoDot: {
    width: 17,
    height: 17,
    borderRadius: 9,
    borderWidth: 1.2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 7,
    marginTop: 1,
  },

  infoDotPurple: {
    borderColor: COLORS.purple,
  },

  infoDotCyan: {
    borderColor: COLORS.cyan,
  },

  infoDotText: {
    fontSize: 9,
    fontWeight: "800",
  },

  infoDotTextPurple: {
    color: COLORS.purpleBright,
  },

  infoDotTextCyan: {
    color: COLORS.cyan,
  },

  noteText: {
    flex: 1,
    color: COLORS.secondary,
    fontSize: 9,
    lineHeight: 13,
  },

  statusBadge: {
    position: "absolute",
    right: 10,
    top: 10,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 13,
  },

  statusBadgePurple: {
    backgroundColor: "#2A1547",
  },

  statusBadgeCyan: {
    backgroundColor: "#073D45",
  },

  statusBadgeText: {
    fontSize: 8.3,
    fontWeight: "700",
  },

  statusBadgeTextPurple: {
    color: COLORS.purpleBright,
  },

  statusBadgeTextCyan: {
    color: COLORS.cyan,
  },

  /* ==========================================================
     CHARACTER SCROLL HINT
     ========================================================== */

  /* ==========================================================
     INFO CARD
     ========================================================== */

  infoCard: {
    height: 50,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#0A5961",
    backgroundColor: "#06222B",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 9,
    paddingVertical: 7,
    marginTop: 2,
  },

  infoCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#084651",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  infoSparkle: {
    color: COLORS.cyan,
    fontSize: 12,
    lineHeight: 13,
    position: "absolute",
    top: 7,
    left: 10,
  },

  infoAi: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: "800",
    marginTop: 11,
  },

  infoText: {
    flex: 1,
    color: "#CFD9DE",
    fontSize: 9,
    lineHeight: 13,
  },

  /* ==========================================================
     CTA
     ========================================================== */

  continueButton: {
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.cyan,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.cyan,
    shadowOpacity: 0.25,
    shadowRadius: 13,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    elevation: 7,
  },

  continuePressed: {
    opacity: 0.84,
    transform: [{ scale: 0.985 }],
  },

  continueText: {
    color: "#001114",
    fontSize: 15,
    fontWeight: "800",
    marginRight: 15,
  },

  bottomSpace: {
    height: 5,
  },
});
