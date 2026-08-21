import React, { useCallback, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

/* ============================================================
   SHIVORA — IMAGE TO VIDEO / STORY PLAN
   File: app/view-scenes.tsx

   IMPORTANT:
   - Header / progress / hero / summary use the same compact
     sizing system as the supplied reference code.
   - Only the Story Scenes list scrolls.
   - Bottom info, CTA and footer stay fixed.
   - Existing visual language is preserved.
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
  hero: require('../assets/clapperboard-art.png'),

  scene01: require('../assets/scene-01.png'),
  scene02: require('../assets/scene-02.png'),
  scene03: require('../assets/scene-03.png'),
  scene04: require('../assets/scene-04.png'),
} as const;

const DESIGN_WIDTH = 428;

type Scene = {
  id: string;
  title: string;
  description: string;
  dialogue: string;
  image: any;
};

const SCENES: Scene[] = [
  {
    id: '1',
    title: 'Vamika enters the burger shop',
    description:
      'Vamika walks into the burger shop looking curious and excited.',
    dialogue: 'Hello! I want to try the best burger you have.',
    image: ASSETS.scene01,
  },
  {
    id: '2',
    title: 'Shopkeeper greets Vamika',
    description:
      'The shopkeeper greets Vamika with a warm smile.',
    dialogue:
      'Hi there! Welcome. Let me recommend our special burger.',
    image: ASSETS.scene02,
  },
  {
    id: '3',
    title: 'Vamika asks for his favorite burger',
    description:
      'Vamika asks the shopkeeper about his favorite burger.',
    dialogue: 'Which one is your favorite burger?',
    image: ASSETS.scene03,
  },
  {
    id: '4',
    title: 'Shopkeeper recommends a special burger',
    description:
      'The shopkeeper recommends their special burger.',
    dialogue:
      'Our special burger is the one I recommend!',
    image: ASSETS.scene04,
  },
  {
    id: '5',
    title: 'Vamika receives the burger',
    description:
      'Vamika receives the burger happily and thanks the shopkeeper.',
    dialogue: 'Thank you! This looks delicious.',
    image: ASSETS.scene03,
  },
  {
    id: '6',
    title: 'They smile and the story ends',
    description:
      'Vamika and the shopkeeper smile together. A happy ending!',
    dialogue: 'Enjoy your burger!',
    image: ASSETS.scene02,
  },
];

export default function ViewScenesScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const scale = Math.min(width / DESIGN_WIDTH, 1);

  const [selectedScene, setSelectedScene] = useState<string | null>(null);

  const horizontalPadding = width <= 375 ? 16 : 22;

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  }, [router]);

  const handleContinue = useCallback(() => {
    router.push('/review-scenes-for-image-to-video');
  }, [router]);

  const handleEdit = useCallback((sceneId: string) => {
    setSelectedScene(sceneId);
    // Scene editor route can be connected here later.
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.background}
      />

      <View style={styles.screen}>
        {/* ======================================================
            HEADER — SAME COMPACT REFERENCE SIZING
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
              PROGRESS
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
              value="4"
              label="Scenes"
              active
              scale={scale}
            />

            <ProgressLine />

            <ProgressStep
              value="5"
              label="Preview"
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
                  AI Created Your Story Plan
                </Text>

                <Text style={styles.heroSpark}>✦</Text>
              </View>

              <Text style={styles.heroDescription}>
                <Text style={styles.heroAccent}>Shivora</Text>
                {' has created the perfect scenes, actions'}
              </Text>

              <Text style={styles.heroDescription}>
                {'and dialogues for your story.'}
              </Text>
            </View>

            <Image
              source={ASSETS.hero}
              resizeMode="contain"
              style={styles.heroImage}
            />
          </View>

          {/* ====================================================
              SUMMARY CARD
          ==================================================== */}

          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <SummaryItem
                icon="videocam-outline"
                value="6"
                label="Scenes"
                subLabel="Planned"
                iconColor={COLORS.purple}
                iconBackground="#25103D"
              />

              <SummaryItem
                icon="chatbubble-ellipses-outline"
                value="12"
                label="Dialogues"
                subLabel="Generated"
                iconColor={COLORS.green}
                iconBackground="#073D35"
              />

              <SummaryItem
                icon="time-outline"
                value="~ 02:30"
                label="Video Length"
                subLabel="Estimated"
                iconColor={COLORS.cyan}
                iconBackground="#073A44"
                compactValue
              />
            </View>

            <View style={styles.summaryHint}>
              <Text style={styles.summaryHintSpark}>✦</Text>

              <Text
                style={styles.summaryHintText}
                numberOfLines={2}
              >
                You can review and edit scenes & dialogues in preview.
              </Text>
            </View>
          </View>

          {/* ====================================================
              SCENE LIST AREA — ONLY THIS PART SCROLLS
          ==================================================== */}

          <View style={styles.sceneArea}>
            <View style={styles.sceneHeadingRow}>
              <Text style={styles.sceneHeading}>
                Story Scenes Overview
              </Text>

              <Text style={styles.sceneHeadingSpark}>✦</Text>
            </View>

            <ScrollView
              style={styles.sceneScroll}
              contentContainerStyle={[
                styles.sceneScrollContent,
                {
                  paddingBottom: 10 * scale,
                },
              ]}
              showsVerticalScrollIndicator
              scrollEnabled
              bounces
              alwaysBounceVertical
              nestedScrollEnabled
              keyboardShouldPersistTaps="handled"
            >
              {SCENES.map((scene, index) => (
                <SceneRow
                  key={scene.id}
                  scene={scene}
                  index={index}
                  scale={scale}
                  selected={selectedScene === scene.id}
                  onEdit={() => handleEdit(scene.id)}
                />
              ))}
            </ScrollView>
          </View>

          {/* ====================================================
              FIXED INFO
          ==================================================== */}

          <View
            style={[
              styles.bottomInfo,
              {
                borderRadius: 14 * scale,
              },
            ]}
          >
            <View style={styles.bottomInfoIcon}>
              <Text style={styles.bottomInfoSpark}>✦</Text>
            </View>

            <Text style={styles.bottomInfoText}>
              You can modify scenes, actions and dialogues
              {'\n'}
              in the next step before generating the video.
            </Text>
          </View>

          {/* ====================================================
              FIXED CTA
          ==================================================== */}

          <Pressable
            onPress={handleContinue}
            style={({ pressed }) => [
              styles.continueButton,
              pressed && styles.continuePressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Continue to Preview"
          >
            <Text style={styles.continueText}>
              Continue to Preview
            </Text>

            <Ionicons
              name="arrow-forward"
              size={31}
              color={COLORS.black}
            />
          </Pressable>

          {/* ====================================================
              FIXED FOOTER
          ==================================================== */}

          <View style={styles.footer}>
            <Ionicons
              name="lock-closed-outline"
              size={14}
              color={COLORS.muted}
            />

            <Text style={styles.footerText}>
              Your characters are private and secure.
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

/* ==============================================================
   SUMMARY ITEM
============================================================== */

function SummaryItem({
  icon,
  value,
  label,
  subLabel,
  iconColor,
  iconBackground,
  compactValue = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  label: string;
  subLabel: string;
  iconColor: string;
  iconBackground: string;
  compactValue?: boolean;
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
          size={27}
          color={iconColor}
        />
      </View>

      <View style={styles.summaryCopy}>
        <Text
          style={[
            styles.summaryValue,
            compactValue && styles.summaryValueCompact,
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.65}
        >
          {value}
        </Text>

        <Text
          style={styles.summaryLabel}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.65}
        >
          {label}
        </Text>

        <Text
          style={styles.summarySubLabel}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.65}
        >
          {subLabel}
        </Text>
      </View>
    </View>
  );
}

/* ==============================================================
   SCENE ROW
============================================================== */

function SceneRow({
  scene,
  index,
  scale,
  selected,
  onEdit,
}: {
  scene: Scene;
  index: number;
  scale: number;
  selected: boolean;
  onEdit: () => void;
}) {
  return (
    <View
      style={[
        styles.sceneRow,
        selected && styles.sceneRowSelected,
      ]}
    >
      <View style={styles.sceneNumberWrap}>
        <View
          style={[
            styles.sceneNumber,
            {
              width: 34 * scale,
              height: 34 * scale,
              borderRadius: 17 * scale,
            },
          ]}
        >
          <Text
            style={[
              styles.sceneNumberText,
              {
                fontSize: 16 * scale,
              },
            ]}
          >
            {index + 1}
          </Text>
        </View>
      </View>

      <Image
        source={scene.image}
        resizeMode="cover"
        style={[
          styles.sceneImage,
          {
            width: 126 * scale,
            height: 105 * scale,
            borderRadius: 12 * scale,
          },
        ]}
      />

      <View style={styles.sceneCopy}>
        <Text
          style={[
            styles.sceneTitle,
            {
              fontSize: 15 * scale,
              lineHeight: 20 * scale,
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
              fontSize: 12 * scale,
              lineHeight: 18 * scale,
            },
          ]}
          numberOfLines={3}
        >
          {scene.description}
        </Text>
      </View>

      <View style={styles.dialogueColumn}>
        <Text
          style={[
            styles.dialogueHeading,
            {
              fontSize: 12 * scale,
              lineHeight: 16 * scale,
            },
          ]}
          numberOfLines={2}
          adjustsFontSizeToFit
          minimumFontScale={0.68}
        >
          Dialogues
        </Text>

        <View
          style={[
            styles.dialogueBox,
            {
              width: 90 * scale,
              minHeight: 70 * scale,
              borderRadius: 12 * scale,
            },
          ]}
        >
          <Text
            style={[
              styles.quote,
              {
                fontSize: 23 * scale,
              },
            ]}
          >
            “
          </Text>

          <Text
            style={[
              styles.dialogueText,
              {
                fontSize: 9.2 * scale,
                lineHeight: 13 * scale,
              },
            ]}
            numberOfLines={3}
          >
            {scene.dialogue}
          </Text>
        </View>

        <Pressable
          onPress={onEdit}
          style={({ pressed }) => [
            styles.editButton,
            {
              height: 34 * scale,
              minWidth: 84 * scale,
              borderRadius: 12 * scale,
            },
            pressed && styles.pressed,
          ]}
          hitSlop={6}
          accessibilityRole="button"
          accessibilityLabel={`Edit scene ${scene.id}`}
        >
          <Ionicons
            name="pencil-outline"
            size={15 * scale}
            color={COLORS.purple}
          />

          <Text
            style={[
              styles.editText,
              {
                fontSize: 11 * scale,
              },
            ]}
          >
            Edit
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

/* ==============================================================
   PROGRESS STEP
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

/* ==============================================================
   PROGRESS LINE
============================================================== */

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
     HEADER — MATCHES SUPPLIED REFERENCE
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
    paddingHorizontal: 4,
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
     PROGRESS — MATCHES SUPPLIED REFERENCE
  ============================================================ */

  progressRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 14,
    marginBottom: 14,
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
     HERO — COMPACT, SAME AS REFERENCE
  ============================================================ */

  hero: {
    height: 146,
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
    marginTop: 9,
  },

  heroAccent: {
    color: COLORS.cyan,
    fontWeight: '800',
  },

  heroImage: {
    width: 145,
    height: 100,
    marginRight: -4,
  },

  /* ============================================================
     SUMMARY
  ============================================================ */

  summaryCard: {
    width: '100%',
    minHeight: 145,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    backgroundColor: COLORS.card,
    padding: 10,
    marginBottom: 8,
  },

  summaryRow: {
    flexDirection: 'row',
    gap: 8,
  },

  summaryItem: {
    flex: 1,
    minWidth: 0,
    height: 96,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 13,
    backgroundColor: COLORS.cardSoft,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    overflow: 'hidden',
  },

  summaryIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  summaryCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 6,
  },

  summaryValue: {
    color: COLORS.white,
    fontSize: 24,
    lineHeight: 27,
    fontWeight: '800',
  },

  summaryValueCompact: {
    fontSize: 16,
    lineHeight: 19,
  },

  summaryLabel: {
    color: COLORS.white,
    fontSize: 10,
    lineHeight: 13,
    marginTop: 2,
  },

  summarySubLabel: {
    color: COLORS.textMuted,
    fontSize: 8.5,
    lineHeight: 11,
    marginTop: 1,
  },

  summaryHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },

  summaryHintSpark: {
    color: COLORS.cyan,
    fontSize: 18,
    marginRight: 7,
  },

  summaryHintText: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: 10.5,
    lineHeight: 15,
  },

  /* ============================================================
     SCENES
  ============================================================ */

  sceneArea: {
    flex: 1,
    minHeight: 0,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    backgroundColor: COLORS.card,
    overflow: 'hidden',
  },

  sceneHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 5,
  },

  sceneHeading: {
    color: COLORS.white,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '800',
  },

  sceneHeadingSpark: {
    color: COLORS.cyan,
    fontSize: 17,
    marginLeft: 4,
  },

  sceneScroll: {
    flex: 1,
  },

  sceneScrollContent: {
    paddingHorizontal: 7,
  },

  sceneRow: {
    minHeight: 139,
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },

  sceneRowSelected: {
    backgroundColor: '#06161E',
  },

  sceneNumberWrap: {
    width: 34,
    alignItems: 'center',
    paddingTop: 2,
  },

  sceneNumber: {
    borderWidth: 1.5,
    borderColor: COLORS.cyan,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#03131B',
  },

  sceneNumberText: {
    color: COLORS.cyan,
    fontWeight: '800',
  },

  sceneImage: {
    backgroundColor: COLORS.cardSoft,
    flexShrink: 0,
  },

  sceneCopy: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 6,
    paddingTop: 1,
  },

  sceneTitle: {
    color: COLORS.cyan,
    fontWeight: '800',
  },

  sceneDescription: {
    color: COLORS.textSecondary,
    marginTop: 8,
  },

  dialogueColumn: {
    width: 94,
    alignItems: 'center',
    flexShrink: 0,
  },

  dialogueHeading: {
    color: COLORS.purple,
    fontWeight: '800',
    textAlign: 'center',
  },

  dialogueBox: {
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.cardSoft,
    paddingHorizontal: 6,
    paddingVertical: 5,
    overflow: 'hidden',
  },

  quote: {
    color: COLORS.purple,
    fontWeight: '900',
    lineHeight: 20,
  },

  dialogueText: {
    color: COLORS.textSecondary,
  },

  editButton: {
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.cardSoft,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
  },

  editText: {
    color: COLORS.purple,
    fontWeight: '800',
    marginLeft: 3,
  },

  /* ============================================================
     FIXED INFO
  ============================================================ */

  bottomInfo: {
    height: 69,
    flexShrink: 0,
    width: '100%',
    borderWidth: 1,
    borderColor: '#116075',
    backgroundColor: '#041721',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginTop: 5,
  },

  bottomInfoIcon: {
    width: 31,
    height: 31,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  bottomInfoSpark: {
    color: COLORS.cyan,
    fontSize: 28,
    lineHeight: 31,
    fontWeight: '800',
  },

  bottomInfoText: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: 11,
    lineHeight: 16,
    marginLeft: 10,
    includeFontPadding: false,
  },

  /* ============================================================
     CTA
  ============================================================ */

  continueButton: {
    height: 55,
    flexShrink: 0,
    width: '100%',
    marginTop: 6,
    borderRadius: 28,
    backgroundColor: COLORS.cyan,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  continuePressed: {
    opacity: 0.9,
    transform: [{ scale: 0.985 }],
  },

  continueText: {
    color: COLORS.black,
    fontSize: 17,
    fontWeight: '900',
    marginRight: 18,
    includeFontPadding: false,
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
  },

  footerText: {
    color: COLORS.muted,
    fontSize: 10,
    marginLeft: 4,
  },
});