import React, { useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

/* ============================================================
   SHIVORA — IMAGE TO VIDEO / PREVIEW
   Target route:
   app/ai-preview.tsx

   Reference:
   Uses the supplied Select Characters screen for:
   - header sizing
   - coin pill sizing
   - progress sizing
   - typography scale
   - compact spacing
   - fixed bottom CTA/footer behavior
============================================================ */

const COLORS = {
  background: '#020A12',
  card: '#04121A',
  cardSoft: '#061822',

  cyan: '#00E5F5',
  cyanDark: '#008894',

  purple: '#C35CFF',
  purpleDark: '#211333',

  green: '#10DFAF',

  white: '#FFFFFF',
  black: '#001015',

  textSecondary: '#C6D0D8',
  textMuted: '#8C99A4',
  muted: '#8C99A4',

  border: '#183B4A',
  borderBright: '#154A5D',
  divider: '#213844',
} as const;

const ASSETS = {
  coin: require('../assets/coin.png'),
  hero: require('../assets/video-preview-hero.png'),

  vamika: require('../assets/vamika-character.png'),
  shopkeeper: require('../assets/shopkeeper-character.png'),

  scene01: require('../assets/scene-01.png'),
  scene02: require('../assets/scene-02.png'),
  scene03: require('../assets/scene-03.png'),
  scene04: require('../assets/scene-04.png'),

  // Existing project assets.
  scene05: require('../assets/scene5.png'),
  scene06: require('../assets/scene6.png'),
};

const SCENES = [
  {
    id: 1,
    image: ASSETS.scene01,
    title: 'Vamika enters the burger shop',
    description:
      'Vamika walks into the burger shop looking curious and excited.',
  },
  {
    id: 2,
    image: ASSETS.scene02,
    title: 'Shopkeeper greets Vamika',
    description:
      'The shopkeeper greets Vamika with a warm smile.',
  },
  {
    id: 3,
    image: ASSETS.scene03,
    title: 'Vamika asks for his favorite burger',
    description:
      'Vamika asks the shopkeeper about his favorite burger.',
  },
  {
    id: 4,
    image: ASSETS.scene04,
    title: 'Shopkeeper recommends a special burger',
    description:
      'The shopkeeper recommends their special burger.',
  },
  {
    id: 5,
    image: ASSETS.scene05,
    title: 'Vamika receives the burger',
    description:
      'Vamika receives the burger happily and thanks the shopkeeper.',
  },
  {
    id: 6,
    image: ASSETS.scene06,
    title: 'They smile and the story ends',
    description:
      'Vamika and the shopkeeper smile together. A happy ending!',
  },
];

const DIALOGUE_COUNT = 12;
const VIDEO_LENGTH = '~ 02:30';

export default function AIPreviewScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const scale = Math.min(width / 428, 1);

  const [expanded, setExpanded] = useState(true);
  const [generating, setGenerating] = useState(false);

  const horizontalPadding = width <= 375 ? 16 : 22;

  const sceneCards = useMemo(
    () =>
      expanded
        ? SCENES
        : SCENES.slice(0, 3),
    [expanded],
  );

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  const handleGenerate = () => {
    setGenerating(true);

    // Keep the button functional without breaking the current flow.
    // Replace with your actual generation route when ready.
    setTimeout(() => {
      setGenerating(false);
      router.push('/video-generating');
    }, 350);
  };

  const handleEditCharacters = () => {
    router.push('/select-characters');
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
            {
              paddingHorizontal: horizontalPadding,
            },
          ]}
        >
          <Pressable
            onPress={handleBack}
            hitSlop={10}
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.pressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons
              name="chevron-back"
              size={33}
              color={COLORS.white}
            />
          </Pressable>

          <View style={styles.headerTitleWrap}>
            <Text
              style={styles.headerTitle}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.78}
            >
              Image to{' '}
              <Text style={styles.headerTitleAccent}>Video</Text>
              <Text style={styles.headerSparkle}>✦</Text>
            </Text>
          </View>

          <Pressable
            style={[
              styles.creditPill,
              {
                width: width <= 375 ? 112 : 124,
              },
            ]}
            onPress={() => router.push('/coins')}
          >
            <Image
              source={ASSETS.coin}
              resizeMode="contain"
              style={styles.coinIcon}
            />

            <Text style={styles.creditValue}>12,450</Text>

            <Text style={styles.creditPlus}>+</Text>
          </Pressable>
        </View>

        <View
          style={[
            styles.content,
            {
              paddingHorizontal: horizontalPadding,
            },
          ]}
        >
          {/* ====================================================
              PROGRESS — STEP 5 ACTIVE
          ==================================================== */}

          <View style={styles.progressRow}>
            <ProgressStep
              value="✓"
              label="Story"
              complete
              scale={scale}
            />

            <ProgressLine complete />

            <ProgressStep
              value="✓"
              label="Analyze"
              complete
              scale={scale}
            />

            <ProgressLine complete />

            <ProgressStep
              value="✓"
              label="Characters"
              complete
              scale={scale}
            />

            <ProgressLine complete />

            <ProgressStep
              value="✓"
              label="Scenes"
              complete
              scale={scale}
            />

            <ProgressLine complete />

            <ProgressStep
              value="5"
              label="Preview"
              active
              scale={scale}
            />
          </View>

          {/* ====================================================
              HERO
          ==================================================== */}

          <View style={styles.hero}>
            <View style={styles.heroCopy}>
              <View style={styles.heroTitleRow}>
                <Text
                  style={styles.heroTitle}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.73}
                >
                  Preview Your Video
                </Text>

                <Text style={styles.heroSpark}>✦</Text>
              </View>

              <Text style={styles.heroDescription}>
                Review your story, scenes, dialogues and
              </Text>

              <Text style={styles.heroDescription}>
                characters before generating the final video.
              </Text>
            </View>

            <Image
              source={ASSETS.hero}
              resizeMode="contain"
              style={styles.heroImage}
            />
          </View>

          {/* ====================================================
              CHARACTERS IN THIS VIDEO
          ==================================================== */}

          <View style={styles.charactersCard}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.sectionAccentTitle}>
                Characters in this video
              </Text>

              <Pressable
                onPress={handleEditCharacters}
                style={({ pressed }) => [
                  styles.smallEditButton,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons
                  name="pencil-outline"
                  size={14}
                  color={COLORS.cyan}
                />

                <Text style={styles.smallEditText}>
                  Edit
                </Text>
              </Pressable>
            </View>

            <View style={styles.charactersRow}>
              <CharacterPreview
                image={ASSETS.vamika}
                name="Vamika"
                role="Main Character"
                selectedOption={1}
                accent="cyan"
              />

              <View style={styles.characterDivider} />

              <CharacterPreview
                image={ASSETS.shopkeeper}
                name="Shopkeeper"
                role="Supporting Character"
                selectedOption={2}
                accent="purple"
              />
            </View>
          </View>

          {/* ====================================================
              SUMMARY STATS
          ==================================================== */}

          <View style={styles.statsCard}>
            <SummaryItem
              icon="videocam-outline"
              value="6"
              label="Scenes"
              iconColor={COLORS.purple}
              iconBackground={COLORS.purpleDark}
            />

            <View style={styles.statsDivider} />

            <SummaryItem
              icon="chatbubble-ellipses-outline"
              value="12"
              label="Dialogues"
              iconColor={COLORS.green}
              iconBackground="#073D35"
            />

            <View style={styles.statsDivider} />

            <SummaryItem
              icon="time-outline"
              value={VIDEO_LENGTH}
              label="Estimated Length"
              iconColor={COLORS.cyan}
              iconBackground="#073A44"
              compact
            />
          </View>

          {/* ====================================================
              SCENES PREVIEW
              ONLY THIS AREA SCROLLS
          ==================================================== */}

          <View style={styles.sceneArea}>
            <View style={styles.sceneHeader}>
              <Text style={styles.sceneHeaderTitle}>
                Scenes Preview
              </Text>

              <Pressable
                onPress={() => setExpanded((value) => !value)}
                style={({ pressed }) => [
                  styles.expandButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.expandText}>
                  {expanded ? 'Collapse All' : 'Expand All'}
                </Text>

                <Ionicons
                  name={expanded ? 'chevron-up' : 'chevron-down'}
                  size={15}
                  color={COLORS.cyan}
                />
              </Pressable>
            </View>

            <ScrollView
              style={styles.sceneScroll}
              contentContainerStyle={styles.sceneScrollContent}
              showsVerticalScrollIndicator
              scrollEnabled
              nestedScrollEnabled
              bounces
              alwaysBounceVertical
              keyboardShouldPersistTaps="handled"
              directionalLockEnabled
            >
              {sceneCards.map((scene) => (
                <ScenePreviewRow
                  key={scene.id}
                  scene={scene}
                  scale={scale}
                />
              ))}

              {!expanded && (
                <Pressable
                  onPress={() => setExpanded(true)}
                  style={({ pressed }) => [
                    styles.showAllButton,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={styles.showAllText}>
                    Show all 6 scenes
                  </Text>

                  <Ionicons
                    name="chevron-down"
                    size={16}
                    color={COLORS.cyan}
                  />
                </Pressable>
              )}
            </ScrollView>
          </View>

          {/* ====================================================
              FIXED INFO
          ==================================================== */}

          <View style={styles.bottomInfo}>
            <View style={styles.bottomInfoIcon}>
              <Text style={styles.bottomInfoSpark}>i</Text>
            </View>

            <Text style={styles.bottomInfoText}>
              You can edit any scene, dialogue, or character anytime
              before generating the video.
            </Text>
          </View>

          {/* ====================================================
              FIXED CTA
          ==================================================== */}

          <Pressable
            onPress={handleGenerate}
            disabled={generating}
            style={({ pressed }) => [
              styles.generateButton,
              pressed && !generating && styles.generateButtonPressed,
              generating && styles.generateButtonDisabled,
            ]}
          >
            <Text style={styles.generateText}>
              {generating ? 'Preparing Video…' : 'Generate Video'}
            </Text>

            {!generating && (
              <>
                <Text style={styles.generateSpark}>✦</Text>

                <Ionicons
                  name="arrow-forward"
                  size={31}
                  color={COLORS.white}
                />
              </>
            )}
          </Pressable>

          {/* ====================================================
              FOOTER
          ==================================================== */}

          <View style={styles.footer}>
            <Ionicons
              name="lock-closed-outline"
              size={14}
              color={COLORS.muted}
            />

            <Text style={styles.footerText}>
              Your story and characters are private and secure.
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

/* ==============================================================
   CHARACTER PREVIEW
============================================================== */

function CharacterPreview({
  image,
  name,
  role,
  selectedOption,
  accent,
}: {
  image: any;
  name: string;
  role: string;
  selectedOption: number;
  accent: 'cyan' | 'purple';
}) {
  const isCyan = accent === 'cyan';

  return (
    <View style={styles.characterPreview}>
      <Image
        source={image}
        resizeMode="cover"
        style={styles.characterPreviewImage}
      />

      <View style={styles.characterPreviewCopy}>
        <Text
          style={styles.characterPreviewName}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.72}
        >
          {name}
        </Text>

        <View
          style={[
            styles.characterRoleBadge,
            isCyan
              ? styles.characterRoleCyan
              : styles.characterRolePurple,
          ]}
        >
          <Text
            style={[
              styles.characterRoleText,
              isCyan
                ? styles.characterRoleTextCyan
                : styles.characterRoleTextPurple,
            ]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.68}
          >
            {role}
          </Text>
        </View>

        <View style={styles.selectedOptionRow}>
          <View style={styles.selectedCheck}>
            <Ionicons
              name="checkmark"
              size={10}
              color={COLORS.background}
            />
          </View>

          <Text style={styles.selectedOptionText}>
            Selected Option {selectedOption}
          </Text>
        </View>
      </View>
    </View>
  );
}

/* ==============================================================
   SUMMARY ITEM
============================================================== */

function SummaryItem({
  icon,
  value,
  label,
  iconColor,
  iconBackground,
  compact,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  label: string;
  iconColor: string;
  iconBackground: string;
  compact?: boolean;
}) {
  return (
    <View style={styles.summaryItem}>
      <View
        style={[
          styles.summaryIcon,
          {
            backgroundColor: iconBackground,
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={25}
          color={iconColor}
        />
      </View>

      <View style={styles.summaryCopy}>
        <Text
          style={[
            styles.summaryValue,
            compact && styles.summaryValueCompact,
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.62}
        >
          {value}
        </Text>

        <Text
          style={styles.summaryLabel}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.68}
        >
          {label}
        </Text>
      </View>
    </View>
  );
}

/* ==============================================================
   SCENE PREVIEW ROW
============================================================== */

function ScenePreviewRow({
  scene,
  scale,
}: {
  scene: (typeof SCENES)[number];
  scale: number;
}) {
  return (
    <View
      style={[
        styles.scenePreviewRow,
        {
          minHeight: 114 * scale,
        },
      ]}
    >
      {/* THUMBNAIL + OUTER NUMBER */}

      <View style={styles.sceneThumbnailWrap}>
        <View style={styles.sceneOuterNumber}>
          <Text style={styles.sceneOuterNumberText}>
            {scene.id}
          </Text>
        </View>

        <Image
          source={scene.image}
          resizeMode="cover"
          style={[
            styles.sceneThumbnail,
            {
              width: 105 * scale,
              height: 79 * scale,
              borderRadius: 10 * scale,
            },
          ]}
        />
      </View>

      {/* CENTER NUMBER + COPY */}

      <View style={styles.sceneCenter}>
        <View
          style={[
            styles.sceneInnerNumber,
            {
              width: 29 * scale,
              height: 29 * scale,
              borderRadius: 15 * scale,
            },
          ]}
        >
          <Text
            style={[
              styles.sceneInnerNumberText,
              {
                fontSize: 13 * scale,
              },
            ]}
          >
            {scene.id}
          </Text>
        </View>

        <View style={styles.sceneCopy}>
          <Text
            style={[
              styles.sceneTitle,
              {
                fontSize: 11.5 * scale,
                lineHeight: 15 * scale,
              },
            ]}
            numberOfLines={2}
          >
            {scene.title}
          </Text>

          <Text
            style={[
              styles.sceneDescription,
              {
                fontSize: 9 * scale,
                lineHeight: 13 * scale,
              },
            ]}
            numberOfLines={3}
          >
            {scene.description}
          </Text>
        </View>
      </View>

      {/* RIGHT ACTIONS */}

      <View style={styles.sceneActions}>
        <View style={styles.dialoguesBadge}>
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={13}
            color={COLORS.purple}
          />

          <Text style={styles.dialoguesBadgeText}>
            Dialogues (2)
          </Text>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.editSceneButton,
            pressed && styles.pressed,
          ]}
        >
          <Ionicons
            name="pencil-outline"
            size={13}
            color={COLORS.cyan}
          />

          <Text style={styles.editSceneText}>
            Edit Scene
          </Text>
        </Pressable>

        <Ionicons
          name="chevron-forward"
          size={18}
          color={COLORS.cyan}
          style={styles.sceneArrow}
        />
      </View>
    </View>
  );
}

/* ==============================================================
   PROGRESS
============================================================== */

function ProgressStep({
  value,
  label,
  active = false,
  complete = false,
  scale,
}: {
  value: string;
  label: string;
  active?: boolean;
  complete?: boolean;
  scale: number;
}) {
  return (
    <View
      style={[
        styles.progressStep,
        {
          width: 54 * scale,
        },
      ]}
    >
      <View
        style={[
          styles.progressCircle,
          {
            width: 34 * scale,
            height: 34 * scale,
            borderRadius: 17 * scale,
          },
          active || complete
            ? styles.progressCircleActive
            : styles.progressCircleInactive,
        ]}
      >
        <Text
          style={[
            styles.progressValue,
            {
              fontSize: 12 * scale,
            },
            active || complete
              ? styles.progressValueActive
              : styles.progressValueInactive,
          ]}
        >
          {value}
        </Text>
      </View>

      <Text
        style={[
          styles.progressLabel,
          {
            fontSize: 8.3 * scale,
          },
          (active || complete) &&
            styles.progressLabelActive,
        ]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.72}
      >
        {label}
      </Text>
    </View>
  );
}

function ProgressLine({
  active = false,
  complete = false,
}: {
  active?: boolean;
  complete?: boolean;
}) {
  return (
    <View
      style={[
        styles.progressLine,
        (active || complete) &&
          styles.progressLineActive,
      ]}
    />
  );
}

/* ==============================================================
   STYLES
============================================================== */

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
    minHeight: 0,
    paddingTop: 3,
    paddingBottom: 3,
  },

  pressed: {
    opacity: 0.72,
  },

  /* ============================================================
     HEADER
  ============================================================ */

  header: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  backButton: {
    width: 48,
    height: 46,
    borderRadius: 15,
    borderWidth: 1.3,
    borderColor: '#154A5D',
    backgroundColor: '#061822',
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitleWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 0,
  },

  headerTitle: {
    color: COLORS.white,
    fontSize: 20,
    lineHeight: 23,
    fontWeight: '800',
    letterSpacing: -0.7,
    includeFontPadding: false,
    textAlign: 'center',
  },

  headerTitleAccent: {
    color: COLORS.cyan,
  },

  headerSparkle: {
    color: COLORS.cyan,
    fontSize: 17,
    fontWeight: '900',
  },

  creditPill: {
    height: 40,
    borderRadius: 17,
    borderWidth: 1.2,
    borderColor: '#154A5D',
    backgroundColor: '#061822',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 9,
  },

  coinIcon: {
    width: 20,
    height: 20,
    marginRight: 4,
  },

  creditValue: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '600',
  },

  creditPlus: {
    color: COLORS.cyan,
    fontSize: 20,
    lineHeight: 28,
    marginLeft: 6,
  },

  /* ============================================================
     PROGRESS
  ============================================================ */

  progressRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 14,
    marginBottom: 12,
  },

  progressStep: {
    alignItems: 'center',
  },

  progressCircle: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  progressCircleActive: {
    backgroundColor: COLORS.cyan,
  },

  progressCircleInactive: {
    backgroundColor: '#172C3B',
    borderWidth: 1,
    borderColor: '#314558',
  },

  progressValue: {
    fontWeight: '700',
  },

  progressValueActive: {
    color: COLORS.black,
  },

  progressValueInactive: {
    color: '#93A6B2',
  },

  progressLabel: {
    marginTop: 4,
    color: '#AAB6BF',
    fontWeight: '500',
    textAlign: 'center',
  },

  progressLabelActive: {
    color: COLORS.cyan,
    fontWeight: '700',
  },

  progressLine: {
    flex: 1,
    height: 1.5,
    backgroundColor: '#183847',
    marginTop: 15,
    marginHorizontal: 3,
  },

  progressLineActive: {
    backgroundColor: COLORS.cyan,
  },

  /* ============================================================
     HERO
  ============================================================ */

  hero: {
    height: 130,
    flexDirection: 'row',
    alignItems: 'center',
  },

  heroCopy: {
    flex: 1,
    minWidth: 0,
  },

  heroTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  heroTitle: {
    color: COLORS.white,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '800',
    includeFontPadding: false,
    flexShrink: 1,
  },

  heroSpark: {
    color: COLORS.cyan,
    fontSize: 17,
    marginLeft: 4,
  },

  heroDescription: {
    color: COLORS.white,
    fontSize: 12.5,
    lineHeight: 18,
    marginTop: 8,
  },

  heroImage: {
    width: 145,
    height: 110,
    marginRight: -3,
  },

  /* ============================================================
     CHARACTER CARD
  ============================================================ */

  charactersCard: {
    width: '100%',
    minHeight: 100,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 15,
    backgroundColor: COLORS.card,
    padding: 10,
    marginBottom: 7,
  },

  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  sectionAccentTitle: {
    color: COLORS.cyan,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },

  smallEditButton: {
    height: 31,
    minWidth: 70,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.cardSoft,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },

  smallEditText: {
    color: COLORS.cyan,
    fontSize: 10,
    fontWeight: '600',
  },

  charactersRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  characterPreview: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },

  characterPreviewImage: {
    width: 62,
    height: 62,
    borderRadius: 10,
    backgroundColor: '#0A1820',
  },

  characterPreviewCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 8,
  },

  characterPreviewName: {
    color: COLORS.white,
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '700',
  },

  characterRoleBadge: {
    alignSelf: 'flex-start',
    marginTop: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    maxWidth: '100%',
  },

  characterRoleCyan: {
    backgroundColor: '#062D37',
  },

  characterRolePurple: {
    backgroundColor: '#26133A',
  },

  characterRoleText: {
    fontSize: 8.5,
    lineHeight: 11,
    fontWeight: '600',
  },

  characterRoleTextCyan: {
    color: COLORS.cyan,
  },

  characterRoleTextPurple: {
    color: COLORS.purple,
  },

  selectedOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },

  selectedCheck: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.cyan,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },

  selectedOptionText: {
    flexShrink: 1,
    color: COLORS.textSecondary,
    fontSize: 8.5,
  },

  characterDivider: {
    width: 1,
    height: 65,
    backgroundColor: COLORS.divider,
    marginHorizontal: 10,
  },

  /* ============================================================
     STATS
  ============================================================ */

  statsCard: {
    width: '100%',
    height: 72,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    backgroundColor: COLORS.card,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 7,
    paddingHorizontal: 9,
  },

  statsDivider: {
    width: 1,
    height: 46,
    backgroundColor: COLORS.divider,
    marginHorizontal: 5,
  },

  summaryItem: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },

  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  summaryCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 7,
  },

  summaryValue: {
    color: COLORS.white,
    fontSize: 20,
    lineHeight: 22,
    fontWeight: '800',
  },

  summaryValueCompact: {
    fontSize: 14,
    lineHeight: 17,
  },

  summaryLabel: {
    color: COLORS.white,
    fontSize: 9.5,
    lineHeight: 12,
    marginTop: 2,
  },

  /* ============================================================
     SCENE AREA
  ============================================================ */

  sceneArea: {
    flex: 1,
    minHeight: 0,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 15,
    backgroundColor: COLORS.card,
    overflow: 'hidden',
  },

  sceneHeader: {
    height: 49,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 11,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },

  sceneHeaderTitle: {
    color: COLORS.cyan,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
  },

  expandButton: {
    height: 31,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.borderBright,
    backgroundColor: COLORS.cardSoft,
    paddingHorizontal: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  expandText: {
    color: COLORS.cyan,
    fontSize: 9,
    fontWeight: '600',
  },

  sceneScroll: {
    flex: 1,
  },

  sceneScrollContent: {
    paddingHorizontal: 7,
    paddingBottom: 6,
  },

  scenePreviewRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
    paddingVertical: 7,
  },

  sceneThumbnailWrap: {
    width: 114,
    height: 83,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'flex-end',
    flexShrink: 0,
  },

  sceneOuterNumber: {
    position: 'absolute',
    left: 0,
    top: 2,
    zIndex: 5,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#03131B',
    borderWidth: 1.4,
    borderColor: COLORS.cyan,
    alignItems: 'center',
    justifyContent: 'center',
  },

  sceneOuterNumberText: {
    color: COLORS.cyan,
    fontSize: 15,
    fontWeight: '700',
  },

  sceneThumbnail: {
    backgroundColor: '#0A1820',
  },

  sceneCenter: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 6,
  },

  sceneInnerNumber: {
    flexShrink: 0,
    backgroundColor: COLORS.cyan,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },

  sceneInnerNumberText: {
    color: COLORS.black,
    fontWeight: '800',
  },

  sceneCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 6,
  },

  sceneTitle: {
    color: COLORS.white,
    fontWeight: '700',
  },

  sceneDescription: {
    color: COLORS.textSecondary,
    marginTop: 6,
  },

  sceneActions: {
    width: 118,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    position: 'relative',
  },

  dialoguesBadge: {
    width: 108,
    height: 33,
    borderRadius: 11,
    backgroundColor: '#1D1534',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },

  dialoguesBadgeText: {
    color: COLORS.purple,
    fontSize: 8.5,
    fontWeight: '700',
  },

  editSceneButton: {
    width: 108,
    height: 32,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.borderBright,
    backgroundColor: COLORS.cardSoft,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 5,
  },

  editSceneText: {
    color: COLORS.cyan,
    fontSize: 8.5,
    fontWeight: '600',
  },

  sceneArrow: {
    position: 'absolute',
    right: -2,
  },

  showAllButton: {
    height: 36,
    marginVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.borderBright,
    backgroundColor: COLORS.cardSoft,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },

  showAllText: {
    color: COLORS.cyan,
    fontSize: 9.5,
    fontWeight: '700',
  },

  /* ============================================================
     FIXED INFO
  ============================================================ */

  bottomInfo: {
    minHeight: 52,
    flexShrink: 0,
    width: '100%',
    borderWidth: 1,
    borderColor: COLORS.borderBright,
    backgroundColor: '#041721',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginTop: 5,
    borderRadius: 12,
  },

  bottomInfoIcon: {
    width: 27,
    height: 27,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.cyan,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  bottomInfoSpark: {
    color: COLORS.cyan,
    fontSize: 16,
    fontWeight: '800',
  },

  bottomInfoText: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: 9.5,
    lineHeight: 13,
    marginLeft: 8,
    includeFontPadding: false,
  },

  /* ============================================================
     FIXED CTA
  ============================================================ */

  generateButton: {
    height: 55,
    flexShrink: 0,
    width: '100%',
    marginTop: 5,
    borderRadius: 28,
    backgroundColor: COLORS.cyan,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  generateButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.985 }],
  },

  generateButtonDisabled: {
    opacity: 0.65,
  },

  generateText: {
    color: COLORS.black,
    fontSize: 17,
    fontWeight: '900',
    includeFontPadding: false,
  },

  generateSpark: {
    color: COLORS.black,
    fontSize: 19,
    fontWeight: '800',
    marginLeft: 12,
    marginRight: 17,
  },

  /* ============================================================
     FOOTER
  ============================================================ */

  footer: {
    height: 27,
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },

  footerText: {
    color: COLORS.muted,
    fontSize: 9.5,
  },
});