import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  BackHandler,
  Easing,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

/* =========================================================
   ASSETS
   This file lives at:
   app/(tabs)/create video screen text to video.tsx
   ========================================================= */

const ASSETS = {
  textVideoHero: require('../../assets/text-video-hero.png'),
  magicFeather: require('../../assets/magic-feather.png'),
  aiCharacter: require('../../assets/ai-character.png'),
  characterBlueprint: require('../../assets/character-blueprint.png'),
  aiSuggestion: require('../../assets/ai-suggestion.png'),
  shivoraLoader: require('../../assets/shivora-loader.png'),
};

/* =========================================================
   THEME
   ========================================================= */

const COLORS = {
  background: '#020A10',
  surface: '#071923',
  surfaceAlt: '#061720',
  inputSurface: '#061822',

  text: '#F5F7F8',
  secondary: '#B1C0C7',
  muted: '#81939D',

  cyan: '#08D9D0',
  cyanBright: '#00E7E0',
  border: '#123A48',
  borderBright: '#00B7B2',

  purple: '#A35CFF',
  purpleSurface: '#190D31',
};

const MAX_STORY_LENGTH = 2000;

const API_BASE_URL = "http://192.168.31.189:4000";

const EXAMPLE_TEXT =
  'A brave little robot explores a magical forest, meets friendly creatures and discovers a hidden treasure.';

const AI_ITEMS = [
  { icon: 'happy-outline' as const, label: 'Characters' },
  { icon: 'film-outline' as const, label: 'Scenes' },
  { icon: 'color-wand-outline' as const, label: 'Animations' },
  { icon: 'chatbubble-ellipses-outline' as const, label: 'Dialogues' },
  { icon: 'pulse-outline' as const, label: 'Voiceover' },
];


/* =========================================================
   SHIVORA ANALYSIS LOADER
   ========================================================= */

function ShivoraAnalysisLoader() {
  const rotation = useRef(
    new Animated.Value(0),
  ).current;

  const pulse = useRef(
    new Animated.Value(1),
  ).current;

  useEffect(() => {
    const rotateLoop =
      Animated.loop(
        Animated.timing(rotation, {
          toValue: 1,
          duration: 4800,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      );

    const pulseLoop =
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, {
            toValue: 1.035,
            duration: 900,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulse, {
            toValue: 1,
            duration: 900,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      );

    rotateLoop.start();
    pulseLoop.start();

    return () => {
      rotateLoop.stop();
      pulseLoop.stop();
    };
  }, [pulse, rotation]);

  const rotate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View
      style={styles.analysisLoaderOverlay}
      pointerEvents="auto"
      accessibilityViewIsModal
      accessibilityLabel="Shivora is analyzing your story"
    >
      <View style={styles.analysisLoaderBackdrop} />

      <View style={styles.analysisLoaderContent}>
        <Animated.View
          style={[
            styles.analysisLoaderArtworkWrap,
            {
              transform: [
                { rotate },
                { scale: pulse },
              ],
            },
          ]}
        >
          <Image
            source={ASSETS.shivoraLoader}
            resizeMode="contain"
            style={styles.analysisLoaderArtwork}
          />
        </Animated.View>

        <Text style={styles.analysisLoaderTitle}>
          Analyzing your story...
        </Text>

        <Text style={styles.analysisLoaderSubtitle}>
          Creating characters & scenes
        </Text>

        <View style={styles.analysisLoaderDots}>
          <AnimatedDot delay={0} />
          <AnimatedDot delay={180} />
          <AnimatedDot delay={360} />
          <AnimatedDot delay={540} />
        </View>
      </View>
    </View>
  );
}

function AnimatedDot({
  delay,
}: {
  delay: number;
}) {
  const opacity = useRef(
    new Animated.Value(0.35),
  ).current;

  useEffect(() => {
    const loop =
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 450,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.35,
            duration: 450,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.delay(
            Math.max(0, 540 - delay),
          ),
        ]),
      );

    loop.start();

    return () => {
      loop.stop();
    };
  }, [delay, opacity]);

  return (
    <Animated.View
      style={[
        styles.analysisLoaderDot,
        { opacity },
      ]}
    />
  );
}

/* =========================================================
   SCREEN
   ========================================================= */

export default function CreateVideoScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [story, setStory] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (!isAnalyzing) {
      return;
    }

    const subscription =
      BackHandler.addEventListener(
        'hardwareBackPress',
        () => true,
      );

    return () => {
      subscription.remove();
    };
  }, [isAnalyzing]);

  /*
   * The reference image is a compact iPhone layout.
   * Keep the same proportions from the previous Home screen:
   * moderate horizontal padding, compact vertical rhythm.
   */
  const side = width <= 375 ? 18 : 20;
  const contentWidth = width - side * 2;
  const aiItemWidth = (contentWidth - 24) / 5;

  const updateStory = (value: string) => {
    setStory(value.slice(0, MAX_STORY_LENGTH));
  };

  const handleContinue = async () => {
    const cleanStory = story.trim();

    if (!cleanStory) {
      Alert.alert(
        'Add your story',
        'Describe your story before continuing.'
      );
      return;
    }

    if (isAnalyzing) {
      return;
    }

    setIsAnalyzing(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/story/analyze`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            story: cleanStory,
          }),
        },
      );

      type StoryCharacterPayload = {
        id: string;
        name: string;
        role: string;
        visualDescription: string;
        imagePrompt: string;
        imageUrl?: string;
      };

      type StoryCharacterPlanPayload = {
        characterId: string;
        actions: string[];
        emotion: string;
        expression: string;
        bodyLanguage: string[];
        startState: string;
        endState: string;
      };

      type StoryContinuityPayload = {
        previousSceneNumber?: number;
        inheritedCharacterStates?: Record<string, string>;
        locationContinues?: boolean;
        requiredContinuity?: string[];
      };

      type StoryBeatPayload = {
        sceneNumber: number;
        id?: string;
        title: string;
        description: string;
        narration: string;
        durationSeconds: number;
        location?: string;
        visibleCharacterIds: string[];
        actions: string[];
        characterPlans: StoryCharacterPlanPayload[];
        startState: string;
        endState: string;
        continuity?: StoryContinuityPayload;
      };

      const data = (await response.json()) as {
        success?: boolean;
        title?: string;
        summary?: string;
        characters?: StoryCharacterPayload[];
        storyBeats?: StoryBeatPayload[];
        scenes?: StoryBeatPayload[];
        storyEvents?: unknown[];
        error?: string;
      };

      const structuredStoryBeats =
        Array.isArray(data.storyBeats) &&
        data.storyBeats.length > 0
          ? data.storyBeats
          : Array.isArray(data.scenes)
            ? data.scenes
            : [];

      if (
        !response.ok ||
        !data.success ||
        structuredStoryBeats.length === 0
      ) {
        throw new Error(
          data.error || 'Unable to analyze your story.',
        );
      }

      console.log(
        '[T2V] OpenAI characters received:',
        data.characters,
      );

      console.log(
        '[T2V] Structured story beats received:',
        structuredStoryBeats,
      );

      /*
       * IMPORTANT:
       * Preserve the complete story manifest when moving from Story
       * Analysis -> Customize. Do not reduce story beats to the old
       * title/description/narration-only scene shape.
       *
       * The video-intelligence pipeline needs characterPlans, visible
       * character IDs, actions, states and continuity later.
       */
      const analysisPayload = {
        title: data.title ?? '',
        summary: data.summary ?? '',
        characters: Array.isArray(data.characters)
          ? data.characters
          : [],
        storyBeats: structuredStoryBeats,

        // Preserve semantic story events from Story Analysis.
        // The optimizer uses these events as the canonical source of
        // truth for beat planning, so they must survive the
        // Analysis -> Customize -> Optimize handoff.
        storyEvents: Array.isArray(data.storyEvents)
          ? data.storyEvents
          : [],

        // Backward-compatible alias used by existing Customize/Preview
        // screens. The full structured beat objects are preserved here.
        scenes: structuredStoryBeats,
      };

      router.push({
        pathname: '/customize-story' as any,
        params: {
          story: cleanStory,
          analysis: JSON.stringify(
            analysisPayload,
          ),
          characters: JSON.stringify(
            Array.isArray(data.characters)
              ? data.characters
              : [],
          ),
        },
      });
    } catch (error) {
      console.error(
        'Story analysis error:',
        error,
      );

      Alert.alert(
        'Unable to Analyze Story',
        error instanceof Error
          ? error.message
          : 'Something went wrong while analyzing your story. Please try again.',
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleExample = () => {
    setStory(EXAMPLE_TEXT);
  };

  const handleAISuggestion = () => {
    setStory(EXAMPLE_TEXT);
  };

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.keyboard}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {/* =================================================
              HEADER — MATCH APPROVED REFERENCE SCREEN
             ================================================= */}
          <View
            style={[
              styles.header,
              { paddingHorizontal: side },
            ]}
          >
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [
                styles.backButton,
                pressed && styles.pressed,
              ]}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Ionicons
                name="chevron-back"
                size={33}
                color={COLORS.text}
              />
            </Pressable>

            <View style={styles.headerCenter}>
              <Text
                style={styles.headerTitle}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.78}
              >
                Text to <Text style={styles.cyan}>Video</Text>
                <Text style={styles.headerSparkle}>✦</Text>
              </Text>
            </View>

            <View style={styles.creditPill}>
              <Ionicons
                name="layers-outline"
                size={20}
                color={COLORS.cyan}
              />
              <Text style={styles.creditValue}>
                12,450
              </Text>
              <Text style={styles.creditPlus}>
                +
              </Text>
            </View>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[
              styles.scrollContent,
              { paddingHorizontal: side },
            ]}
          >
            {/* =================================================
                HEADER
               ================================================= */}

            {/* =================================================
                HERO
               ================================================= */}

            <View style={styles.heroCard}>
              <Image
                source={ASSETS.textVideoHero}
                style={styles.heroArtwork}
                resizeMode="contain"
              />

              <View style={styles.heroCopy}>
                <Text style={styles.heroTitle}>
                  Describe your idea
                </Text>

                <Text style={styles.heroDescription}>
                  Write your story idea and let AI create{`\n`}
                  a stunning animated video with{`\n`}
                  characters, scenes and voice.
                </Text>
              </View>
            </View>

            {/* =================================================
                STORY INPUT
               ================================================= */}

            <View style={styles.storyCard}>
              {/* top prompt row */}
              <View style={styles.promptRow}>
                <Ionicons
                  name="pencil-outline"
                  size={25}
                  color={COLORS.secondary}
                />

                <Text style={styles.promptPlaceholder}>
                  Describe your story idea in detail...
                </Text>
              </View>

              <Pressable
                style={styles.examplePill}
                onPress={handleExample}
              >
                <Ionicons
                  name="sparkles"
                  size={15}
                  color={COLORS.cyan}
                />
                <Text style={styles.exampleText}>Example</Text>
              </Pressable>

              {/* editable story area */}
              <View style={styles.storyEditorWrap}>
                <TextInput
                  value={story}
                  onChangeText={updateStory}
                  multiline
                  textAlignVertical="top"
                  style={styles.storyEditor}
                  placeholder=""
                  maxLength={MAX_STORY_LENGTH}
                  scrollEnabled
                />

                {!story && (
                  <Text style={styles.storyExampleText} pointerEvents="none">
                    {EXAMPLE_TEXT}
                  </Text>
                )}

                <Image
                  source={ASSETS.magicFeather}
                  resizeMode="contain"
                  style={styles.magicFeather}
                />
              </View>

              <Text style={styles.characterCount}>
                {story.length} / {MAX_STORY_LENGTH}
              </Text>
            </View>

            {/* =================================================
                AI OUTPUT
               ================================================= */}

            <View style={styles.aiOutputCard}>
              <View style={styles.aiOutputTitleRow}>
                <Text style={styles.aiOutputTitle}>
                  What AI will generate for you
                </Text>
                <Ionicons
                  name="sparkles"
                  size={17}
                  color={COLORS.cyan}
                />
              </View>

              <View style={styles.aiItemsRow}>
                {AI_ITEMS.map((item) => (
                  <View
                    key={item.label}
                    style={[
                      styles.aiItem,
                      { width: aiItemWidth },
                    ]}
                  >
                    <View style={styles.aiIconCircle}>
                      <Ionicons
                        name={item.icon}
                        size={26}
                        color={COLORS.cyanBright}
                      />
                    </View>

                    <Text
                      numberOfLines={1}
                      style={styles.aiItemLabel}
                    >
                      {item.label}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* =================================================
                AI CHARACTER
               ================================================= */}

            <View style={styles.characterCard}>
              <Image
                source={ASSETS.aiCharacter}
                style={styles.characterImage}
                resizeMode="contain"
              />

              <View style={styles.characterCopy}>
                <Text style={styles.characterTitle}>
                  AI will create
                </Text>

                <Text style={styles.characterDescription}>
                  Unique characters and maintain{`\n`}
                  their style throughout your story.
                </Text>
              </View>

              <View style={styles.characterDots}>
                <View style={styles.smallDot} />
                <View style={styles.smallDot} />
                <View style={styles.smallDot} />
                <View style={[styles.smallDot, styles.brightDot]} />
                <View style={[styles.smallDot, styles.brightDot]} />
              </View>

              <Image
                source={ASSETS.characterBlueprint}
                style={styles.blueprintImage}
                resizeMode="contain"
              />
            </View>

            {/* =================================================
                AI SUGGESTION
               ================================================= */}

            <View style={styles.suggestionCard}>
              <Image
                source={ASSETS.aiSuggestion}
                style={styles.suggestionIcon}
                resizeMode="contain"
              />

              <View style={styles.suggestionCopy}>
                <Text style={styles.suggestionTitle}>
                  Need inspiration?
                </Text>

                <Text style={styles.suggestionDescription}>
                  Use AI to get ideas and prompts{`\n`}
                  for your video.
                </Text>
              </View>

              <Pressable
                style={styles.suggestionButton}
                onPress={handleAISuggestion}
              >
                <Ionicons
                  name="sparkles"
                  size={16}
                  color={COLORS.text}
                />
                <Text
                  numberOfLines={1}
                  style={styles.suggestionButtonText}
                >
                  Get AI Suggestion
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={19}
                  color={COLORS.text}
                />
              </Pressable>
            </View>


            {/* =================================================
                CONTINUE
               ================================================= */}

            {/* =================================================
                CONTINUE
               ================================================= */}
            <Pressable
              style={({ pressed }) => [
                styles.continueButton,
                pressed && styles.pressed,
                isAnalyzing && styles.continueDisabled,
              ]}
              onPress={() => {
                void handleContinue();
              }}
              disabled={isAnalyzing}
              accessibilityRole="button"
              accessibilityLabel="Continue"
              accessibilityState={{
                disabled: isAnalyzing,
                busy: isAnalyzing,
              }}
            >
              <LinearGradient
                colors={['#00CFFF', '#2C75FF', '#8C2EFF']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.continueGradient}
              >
                {isAnalyzing ? (
                  <ActivityIndicator
                    color="#FFFFFF"
                    size="small"
                  />
                ) : (
                  <>
                    <Text style={styles.continueText}>
                      Continue
                    </Text>

                    <Ionicons
                      name="arrow-forward"
                      size={29}
                      color="#FFFFFF"
                      style={styles.continueArrow}
                    />
                  </>
                )}
              </LinearGradient>
            </Pressable>

          </ScrollView>

        </KeyboardAvoidingView>
      </SafeAreaView>

      {isAnalyzing && (
        <ShivoraAnalysisLoader />
      )}
    </View>
  );
}

/* =========================================================
   STYLES
   Reference: attached 853 x 1844 screen.
   Logical layout is tuned for a ~390pt wide iPhone.
   ========================================================= */

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  keyboard: {
    flex: 1,
  },

  scrollContent: {
    paddingTop: 6,
    paddingBottom: 14,
  },

  /* =======================================================
     HEADER
     ======================================================= */

  header: {
    width: '100%',
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
    flexShrink: 0,
  },

  headerCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 0,
    paddingHorizontal: 2,
  },

  headerTitle: {
    color: COLORS.text,
    fontSize: 20,
    lineHeight: 23,
    fontWeight: '800',
    letterSpacing: -0.7,
    includeFontPadding: false,
    textAlign: 'center',
  },

  cyan: {
    color: COLORS.cyan,
  },

  headerSparkle: {
    color: COLORS.cyan,
    fontSize: 17,
    fontWeight: '900',
    marginLeft: 1,
  },

  creditPill: {
    width: 124,
    height: 40,
    borderRadius: 17,
    borderWidth: 1.2,
    borderColor: '#154A5D',
    backgroundColor: '#061822',
    paddingHorizontal: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  creditValue: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },

  creditPlus: {
    color: COLORS.cyan,
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '400',
    marginLeft: 6,
  },

  /* =======================================================
     HERO
     ======================================================= */

  heroCard: {
    height: 126,
    borderRadius: 19,
    borderWidth: 1.2,
    borderColor: COLORS.cyan,
    backgroundColor: '#071924',
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 12,
  },

  heroArtwork: {
    position: 'absolute',
    right: -8,
    top: 1,
    width: '66%',
    height: '100%',
  },

  heroCopy: {
    position: 'absolute',
    left: 22,
    top: 21,
    width: '48%',
    zIndex: 3,
  },

  heroTitle: {
    color: COLORS.text,
    fontSize: 19,
    lineHeight: 24,
    fontWeight: '600',
  },

  heroDescription: {
    color: COLORS.secondary,
    fontSize: 11.5,
    lineHeight: 18,
    marginTop: 5,
  },

  /* =======================================================
     STORY CARD
     ======================================================= */

  storyCard: {
    height: 218,
    borderRadius: 19,
    borderWidth: 1.3,
    borderColor: COLORS.cyan,
    backgroundColor: COLORS.inputSurface,
    paddingHorizontal: 14,
    paddingTop: 13,
    paddingBottom: 10,
    overflow: 'hidden',
    marginBottom: 12,
  },

  promptRow: {
    height: 32,
    flexDirection: 'row',
    alignItems: 'center',
  },

  promptPlaceholder: {
    flex: 1,
    marginLeft: 9,
    color: COLORS.secondary,
    fontSize: 13,
    lineHeight: 18,
  },

  promptInput: {
    flex: 1,
    marginLeft: 9,
    padding: 0,
    color: COLORS.secondary,
    fontSize: 11.8,
    lineHeight: 16,
  },

  examplePill: {
    alignSelf: 'flex-start',
    height: 29,
    paddingHorizontal: 10,
    borderRadius: 15,
    backgroundColor: '#063B45',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 7,
  },

  exampleText: {
    color: COLORS.cyan,
    fontSize: 10.5,
    lineHeight: 14,
    fontWeight: '500',
  },

  storyEditorWrap: {
    flex: 1,
    marginTop: 6,
    position: 'relative',
    overflow: 'hidden',
  },

  storyEditor: {
    flex: 1,
    padding: 0,
    paddingRight: 92,
    color: COLORS.text,
    fontSize: 13,
    lineHeight: 20,
    zIndex: 2,
  },

  storyExampleText: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '67%',
    color: COLORS.text,
    fontSize: 13,
    lineHeight: 20,
  },

  magicFeather: {
    position: 'absolute',
    right: -4,
    top: -4,
    width: 118,
    height: 136,
    opacity: 0.95,
    zIndex: 1,
  },

  characterCount: {
    color: COLORS.cyan,
    fontSize: 10,
    lineHeight: 14,
    marginTop: 2,
  },

  /* =======================================================
     AI OUTPUT
     ======================================================= */

  aiOutputCard: {
    height: 116,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 11,
    paddingTop: 11,
    marginBottom: 12,
  },

  aiOutputTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  aiOutputTitle: {
    color: COLORS.text,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '600',
  },

  aiItemsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },

  aiItem: {
    alignItems: 'center',
  },

  aiIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#082632',
    borderWidth: 1,
    borderColor: '#124555',
    alignItems: 'center',
    justifyContent: 'center',
  },

  aiItemLabel: {
    color: COLORS.secondary,
    fontSize: 9.5,
    lineHeight: 13,
    marginTop: 4,
  },

  /* =======================================================
     CHARACTER CARD
     ======================================================= */

  characterCard: {
    height: 105,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surfaceAlt,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 12,
  },

  characterImage: {
    position: 'absolute',
    left: 7,
    bottom: -1,
    width: 112,
    height: 104,
  },

  characterCopy: {
    position: 'absolute',
    left: 122,
    top: 20,
    width: 137,
  },

  characterTitle: {
    color: COLORS.cyan,
    fontSize: 13.5,
    lineHeight: 18,
    fontWeight: '600',
  },

  characterDescription: {
    color: COLORS.secondary,
    fontSize: 9.5,
    lineHeight: 14,
    marginTop: 5,
  },

  characterDots: {
    position: 'absolute',
    right: 113,
    top: 51,
    flexDirection: 'row',
    gap: 4,
  },

  smallDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#0A6670',
  },

  brightDot: {
    backgroundColor: COLORS.cyan,
  },

  blueprintImage: {
    position: 'absolute',
    right: 8,
    top: 8,
    width: 86,
    height: 84,
  },

  /* =======================================================
     SUGGESTION
     ======================================================= */

  suggestionCard: {
    minHeight: 86,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginBottom: 14,
  },

  suggestionIcon: {
    width: 46,
    height: 46,
    flexShrink: 0,
  },

  suggestionCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 8,
    marginRight: 7,
    justifyContent: 'center',
  },

  suggestionTitle: {
    color: COLORS.text,
    fontSize: 12.5,
    lineHeight: 17,
    fontWeight: '600',
  },

  suggestionDescription: {
    color: COLORS.secondary,
    fontSize: 9.5,
    lineHeight: 14,
    marginTop: 3,
  },

  suggestionButton: {
    flexShrink: 0,
    width: 142,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: COLORS.purple,
    backgroundColor: '#180E35',
    paddingHorizontal: 7,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },

  suggestionButtonText: {
    color: COLORS.text,
    fontSize: 10.5,
    lineHeight: 15,
    fontWeight: '500',
    flexShrink: 1,
  },

  /* =======================================================
     TIPS
     ======================================================= */

  tipsCard: {
    height: 61,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surfaceAlt,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginBottom: 12,
  },

  tipIconBox: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  tipCopy: {
    flex: 1,
    marginLeft: 7,
    marginRight: 8,
  },

  tipTitle: {
    color: COLORS.cyan,
    fontSize: 11.5,
    lineHeight: 15,
    fontWeight: '600',
  },

  tipDescription: {
    color: COLORS.secondary,
    fontSize: 9.5,
    lineHeight: 14,
    marginTop: 2,
  },

  tipRight: {
    width: 38,
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  tipDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#163642',
    marginRight: 8,
  },

  /* =======================================================
     CONTINUE
     ======================================================= */

  /* =======================================================
     SHIVORA ANALYSIS LOADER
     ======================================================= */

  analysisLoaderOverlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 9999,
    elevation: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },

  analysisLoaderBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(2, 10, 16, 0.96)',
  },

  analysisLoaderContent: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },

  analysisLoaderArtworkWrap: {
    width: 135,
    height: 135,
    alignItems: 'center',
    justifyContent: 'center',
  },

  analysisLoaderArtwork: {
    width: '100%',
    height: '100%',
  },

  analysisLoaderTitle: {
    color: COLORS.text,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 8,
  },

  analysisLoaderSubtitle: {
    color: COLORS.secondary,
    fontSize: 12.5,
    lineHeight: 18,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 6,
  },

  analysisLoaderDots: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },

  analysisLoaderDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.cyan,
    marginHorizontal: 4,
  },

  pressed: {
    opacity: 0.78,
  },

  continueDisabled: {
    opacity: 0.6,
  },

  continueButton: {
    width: '100%',
    height: 55,
    marginTop: 0,
    marginBottom: 4,
    minHeight: 55,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: COLORS.cyan,
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.22,
    shadowRadius: 11,
    elevation: 7,
  },

  continueGradient: {
    width: '100%',
    height: 55,
    minHeight: 55,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  continueText: {
    color: '#FFFFFF',
    fontSize: 17,
    lineHeight: 21,
    fontWeight: '700',
    marginRight: 20,
  },

  continueArrow: {
    marginLeft: 0,
  },


});