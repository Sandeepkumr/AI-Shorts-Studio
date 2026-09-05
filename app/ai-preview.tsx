import React, { useCallback } from 'react';
import {
  Alert,
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
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';

const COLORS = {
  background: '#020A12',
  card: '#04121A',
  cardSoft: '#061822',
  cyan: '#00E5F5',
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
  hero: require('../assets/text-video-hero.png'),
} as const;

const API_BASE_URL =
  'http://192.168.31.189:4000';

const resolveCharacterImageUrl = (
  imageUrl?: string,
): string | undefined => {
  if (!imageUrl) {
    return undefined;
  }

  const normalizedUrl = imageUrl.trim();

  if (!normalizedUrl) {
    return undefined;
  }

  if (
    normalizedUrl.startsWith('http://') ||
    normalizedUrl.startsWith('https://')
  ) {
    return normalizedUrl;
  }

  return `${API_BASE_URL}${
    normalizedUrl.startsWith('/') ? '' : '/'
  }${normalizedUrl}`;
};

type PreviewCharacter = {
  id: string;
  name: string;
  role: string;
  visualDescription: string;
  imagePrompt?: string;
  imageUrl?: string;
};

type CharacterPlan = {
  characterId: string;
  actions: string[];
  emotion: string;
  expression: string;
  bodyLanguage: string[];
  startState: string;
  endState: string;
};

type StoryContinuity = {
  previousSceneNumber?: number;
  inheritedCharacterStates?: Record<string, string>;
  locationContinues?: boolean;
  requiredContinuity?: string[];
};

type DialogueLine = {
  characterId: string;
  text: string;
  emotion?: string;
  delivery?: string;
};

type PreviewScene = {
  sceneNumber: number;
  id?: string;
  title: string;
  description: string;
  narration: string;
  dialogue?: DialogueLine[];
  durationSeconds: number;
  location?: string;
  visibleCharacterIds?: string[];
  actions?: string[];
  characterPlans?: CharacterPlan[];
  startState?: string;
  endState?: string;
  continuity?: StoryContinuity;
};

type StoryAnalysisPayload = {
  title?: string;
  summary?: string;
  characters?: PreviewCharacter[];
  scenes?: PreviewScene[];
  storyBeats?: PreviewScene[];
};

type PreviewConfig = {
  duration?: number;
  ratio?: string;
  style?: string;
  language?: string;
  voice?: string;
  camera?: string;
};

const FALLBACK_SCENES: PreviewScene[] = [
  {
    sceneNumber: 1,
    title: 'Scene 1',
    description: 'The story begins.',
    narration: '',
    dialogue: [],
    durationSeconds: 5,
  },
  {
    sceneNumber: 2,
    title: 'Scene 2',
    description: 'The story continues.',
    narration: '',
    dialogue: [],
    durationSeconds: 5,
  },
];

export default function AIPreviewConfirmationScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const [isGenerating, setIsGenerating] =
    React.useState(false);

  const {
    story,
    analysis,
    config,
    customization,
  } = useLocalSearchParams<{
    story?: string;
    analysis?: string;
    config?: string;
    customization?: string;
  }>();

  const parseJson = <T,>(
    value: string | string[] | undefined,
    fallback: T,
  ): T => {
    if (typeof value !== 'string' || !value.trim()) {
      return fallback;
    }

    try {
      return JSON.parse(value) as T;
    } catch (error) {
      console.error(
        '[AI PREVIEW] JSON parse error:',
        error,
      );
      return fallback;
    }
  };

  const storyAnalysis =
    parseJson<StoryAnalysisPayload>(analysis, {});

  const previewConfig =
    parseJson<PreviewConfig>(
      typeof customization === 'string'
        ? customization
        : config,
      {},
    );

  /*
   * Characters remain internal T2V generation data.
   * They are detected by AI and sent to the backend,
   * but are intentionally NOT shown as a user-editable
   * Character Library section in this flow.
   */
  const aiCharacters =
    Array.isArray(storyAnalysis.characters)
      ? storyAnalysis.characters
      : [];

  const manifestScenes =
    Array.isArray(storyAnalysis.storyBeats) &&
    storyAnalysis.storyBeats.length > 0
      ? storyAnalysis.storyBeats
      : Array.isArray(storyAnalysis.scenes) &&
          storyAnalysis.scenes.length > 0
        ? storyAnalysis.scenes
        : FALLBACK_SCENES;

  const previewScenes = manifestScenes;

  const scenePlans = manifestScenes.map((scene) => ({
    sceneNumber: scene.sceneNumber,
    id: scene.id,
    title: scene.title,
    description: scene.description,
    narration: scene.narration,
    dialogue: scene.dialogue ?? [],
    durationSeconds: scene.durationSeconds,
    location: scene.location,
    visibleCharacterIds: scene.visibleCharacterIds ?? [],
    actions: scene.actions ?? [],
    characterPlans: scene.characterPlans ?? [],
    startState: scene.startState ?? scene.description,
    endState: scene.endState ?? scene.description,
    continuity: scene.continuity ?? {
      previousSceneNumber: undefined,
      inheritedCharacterStates: {},
      locationContinues: scene.sceneNumber > 1,
      requiredContinuity: [],
    },
  }));

  const requestedDuration =
    Number(previewConfig.duration) || 30;

  const safeDuration =
    requestedDuration === 15 ||
    requestedDuration === 30 ||
    requestedDuration === 60
      ? requestedDuration
      : 30;

  const plannedDuration =
    previewScenes.reduce(
      (total, scene) =>
        total + Number(scene.durationSeconds || 0),
      0,
    );

  const getCharacterName = useCallback(
    (characterId: string) => {
      const character = aiCharacters.find(
        (item) => item.id === characterId,
      );

      return character?.name ?? 'Character';
    },
    [aiCharacters],
  );

  console.log(
    '[AI PREVIEW] story:',
    story,
  );

  console.log(
    '[AI PREVIEW] scenes:',
    previewScenes,
  );

  console.log(
    '[AI PREVIEW] config:',
    previewConfig,
  );

  console.log(
    '[AI PREVIEW] AI characters (internal):',
    aiCharacters,
  );

  console.log(
    '[AI PREVIEW] displayed settings:',
    {
      duration: safeDuration,
      ratio: previewConfig.ratio,
      style: previewConfig.style,
      language: previewConfig.language,
      voice: previewConfig.voice,
      camera: previewConfig.camera,
    },
  );

  const horizontalPadding = width <= 375 ? 16 : 22;

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  }, [router]);

  const handleEditScenes = useCallback(() => {
    router.push({
      pathname: '/review-scenes' as any,
      params: {
        story: typeof story === 'string' ? story : '',
        analysis:
          typeof analysis === 'string'
            ? analysis
            : '',
        config:
          typeof config === 'string'
            ? config
            : '',
        customization:
          typeof customization === 'string'
            ? customization
            : '',
      },
    });
  }, [analysis, config, customization, router, story]);

  const handleEditSettings = useCallback(() => {
    router.back();
  }, [router]);

  const handleGenerate = useCallback(async () => {
    if (isGenerating) {
      return;
    }

    const storyPrompt =
      typeof story === 'string' &&
      story.trim()
        ? story.trim()
        : storyAnalysis.summary?.trim() ||
          previewScenes[0]?.description ||
          'Create a cinematic short video scene.';

    const scenePrompts =
      previewScenes.length > 0
        ? previewScenes.map((scene) => {
            const dialogueText =
              (scene.dialogue ?? [])
                .map(
                  (line) =>
                    `${getCharacterName(line.characterId)}: ${line.text}`,
                )
                .join(' | ');

            return [
              `Scene ${scene.sceneNumber}: ${scene.title}.`,
              scene.description,
              dialogueText
                ? `Dialogue: ${dialogueText}`
                : '',
            ]
              .filter(Boolean)
              .join(' ');
          })
        : [storyPrompt];

    const narration =
      previewScenes
        .map((scene) => scene.narration?.trim())
        .filter(Boolean)
        .join(' ') ||
      storyAnalysis.summary?.trim() ||
      storyPrompt;

    const ratio =
      previewConfig.ratio === '16:9'
        ? '16:9'
        : previewConfig.ratio === '1:1'
          ? '1:1'
          : '9:16';

    const style =
      previewConfig.style?.trim() || '3d';

    const language =
      previewConfig.language?.trim() ||
      'English (US)';

    const voice =
      previewConfig.voice?.trim() || 'auto';

    const camera =
      previewConfig.camera?.trim() || 'auto';

    /*
     * Keep AI-detected characters in the generation payload.
     * They are internal story-generation data, not user-selected
     * Character Library entries.
     */
    const characters =
      aiCharacters.map((character) => ({
        id: character.id,
        name: character.name,
        role: character.role,
        visualDescription:
          character.visualDescription,
        imagePrompt:
          character.imagePrompt,
        imageUrl:
          resolveCharacterImageUrl(
            character.imageUrl,
          ),
        source: 'ai' as const,
      }));

    const promptParts = [
      storyPrompt,

      characters.length > 0
        ? `AI-detected story characters:\n${characters
            .map(
              (character) =>
                `${character.name} (${character.role}): ${character.visualDescription}`,
            )
            .join('\n')}`
        : '',

      `Visual style: ${style}.`,
      `Camera: ${camera}.`,
      `Language for narration and dialogue: ${language}.`,
      `Generate the story as a coherent multi-scene video.`,
    ].filter(Boolean);

    const combinedPrompt =
      promptParts.join('\n\n');

    setIsGenerating(true);

    try {
      const requestBody = {
        prompt: combinedPrompt,
        scenePlans,
        scenePrompts,
        narration:
          voice === 'none'
            ? undefined
            : narration,
        durationSeconds: safeDuration,
        resolution: '480p',
        aspectRatio: ratio,
        style,
        language,
        voice,
        camera,
        characters,
        story:
          typeof story === 'string'
            ? story
            : '',
      };

      console.log(
        '[AI PREVIEW] Sending complete video generation request:',
        requestBody,
      );

      const response =
        await fetch(
          `${API_BASE_URL}/video/generate`,
          {
            method: 'POST',
            headers: {
              'Content-Type':
                'application/json',
            },
            body: JSON.stringify(
              requestBody,
            ),
          },
        );

      const data =
        (await response.json()) as {
          success?: boolean;
          jobId?: string;
          status?: string;
          stage?: string;
          progress?: number;
          video?: string;
          error?: string;
          durationSeconds?: number;
          model?: string;
        };

      if (
        !response.ok ||
        !data.success ||
        !data.jobId
      ) {
        throw new Error(
          data.error ||
            'Unable to start video generation.',
        );
      }

      console.log(
        '[AI PREVIEW] Video generation job created:',
        data,
      );

      router.push({
        pathname:
          '/video-generating' as any,
        params: {
          jobId: data.jobId,
          story:
            typeof story === 'string'
              ? story
              : '',
          title:
            storyAnalysis.title ?? '',
          duration: String(safeDuration),
          ratio,
          style,
          language,
          voice,
          camera,
          analysis:
            typeof analysis === 'string'
              ? analysis
              : '',
          config:
            JSON.stringify({
              duration: safeDuration,
              ratio,
              style,
              language,
              voice,
              camera,
            }),
          status:
            data.status ?? 'queued',
          stage:
            data.stage ?? 'preparing',
          progress: String(
            data.progress ?? 0,
          ),
        },
      });
    } catch (error) {
      console.error(
        '[AI PREVIEW] Video generation error:',
        error,
      );

      Alert.alert(
        'Unable to Start Video Generation',
        error instanceof Error
          ? error.message
          : 'Something went wrong while starting your video generation.',
      );
    } finally {
      setIsGenerating(false);
    }
  }, [
    aiCharacters,
    analysis,
    getCharacterName,
    isGenerating,
    previewConfig,
    previewScenes,
    router,
    scenePlans,
    story,
    storyAnalysis.summary,
    storyAnalysis.title,
  ]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.background}
      />

      <View style={styles.screen}>
        <View
          style={[
            styles.header,
            {
              paddingHorizontal:
                horizontalPadding,
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
              Text to{' '}
              <Text
                style={styles.headerTitleAccent}
              >
                Video
              </Text>
              <Text style={styles.headerSparkle}>
                ✦
              </Text>
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
            <Text style={styles.creditValue}>
              12,450
            </Text>
            <Text style={styles.creditPlus}>
              +
            </Text>
          </Pressable>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingHorizontal:
                horizontalPadding,
              paddingBottom: 112,
            },
          ]}
        >
          <View style={styles.heroCard}>
            <View style={styles.heroIconWrap}>
              <Ionicons
                name="document-text-outline"
                size={36}
                color={COLORS.cyan}
              />
              <Text style={styles.heroSparkOne}>
                ✦
              </Text>
              <Text style={styles.heroSparkTwo}>
                ✦
              </Text>
            </View>

            <View style={styles.heroCopy}>
              <Text style={styles.heroTitle}>
                AI Preview
              </Text>
              <Text style={styles.heroDescription}>
                Review and confirm the details.
              </Text>
              <Text style={styles.heroDescription}>
                You can edit anything before generating.
              </Text>
            </View>

            <Image
              source={ASSETS.hero}
              resizeMode="contain"
              style={styles.heroImage}
            />
          </View>

          <SectionCard>
            <View style={styles.sectionTopRow}>
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionTitle}>
                  Your Story
                </Text>
                <Text style={styles.sectionSpark}>
                  ✦
                </Text>
              </View>

              <PillButton
                icon="sparkles-outline"
                label="AI Summary"
                color={COLORS.cyan}
                onPress={() => undefined}
              />
            </View>

            <Text style={styles.storyText}>
              {storyAnalysis.summary ||
                (typeof story === 'string' &&
                story.trim()
                  ? story
                  : 'Your story is ready for review.')}
            </Text>
          </SectionCard>

          <SectionCard>
            <View style={styles.sectionTopRow}>
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionTitle}>
                  Planned Scenes ({previewScenes.length})
                </Text>
                <Text style={styles.sectionSpark}>
                  ✦
                </Text>
              </View>

              <PillButton
                icon="create-outline"
                label="Edit Scenes"
                color={COLORS.cyan}
                onPress={handleEditScenes}
              />
            </View>

            <View style={styles.dynamicSceneList}>
              {previewScenes.map((scene) => (
                <View
                  key={`scene-${scene.sceneNumber}`}
                  style={styles.dynamicScene}
                >
                  <View style={styles.dynamicSceneBadge}>
                    <Text style={styles.sceneBadgeText}>
                      {String(
                        scene.sceneNumber,
                      ).padStart(2, '0')}
                    </Text>
                  </View>

                  <View style={styles.dynamicSceneCopy}>
                    <Text
                      style={styles.dynamicSceneTitle}
                      numberOfLines={2}
                    >
                      {scene.title}
                    </Text>

                    <Text
                      style={styles.dynamicSceneDescription}
                      numberOfLines={3}
                    >
                      {scene.description}
                    </Text>

                    {scene.dialogue &&
                    scene.dialogue.length > 0 ? (
                      <Text
                        style={styles.dynamicSceneDialogue}
                        numberOfLines={4}
                      >
                        {scene.dialogue
                          .map(
                            (line) =>
                              `${getCharacterName(line.characterId)}: ${line.text}`,
                          )
                          .join(' • ')}
                      </Text>
                    ) : null}

                    <Text style={styles.dynamicSceneMeta}>
                      {scene.durationSeconds}s
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.sceneSummaryRow}>
              <Ionicons
                name="film-outline"
                size={20}
                color={COLORS.cyan}
              />
              <Text style={styles.sceneSummaryText}>
                {previewScenes.length} scenes • {safeDuration}s target
                {plannedDuration !== safeDuration
                  ? ` • ${plannedDuration}s storyboard`
                  : ''}
              </Text>
            </View>
          </SectionCard>

          <SectionCard>
            <View style={styles.sectionTopRow}>
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionTitle}>
                  Video Settings
                </Text>
                <Text style={styles.sectionSpark}>
                  ✦
                </Text>
              </View>

              <PillButton
                icon="create-outline"
                label="Edit"
                color={COLORS.cyan}
                onPress={handleEditSettings}
              />
            </View>

            <View style={styles.settingsGrid}>
              <SettingItem
                icon="time-outline"
                value={`${safeDuration} sec`}
                label="Duration"
              />

              <SettingItem
                icon="phone-portrait-outline"
                value={previewConfig.ratio ?? '9:16'}
                label="Aspect Ratio"
              />

              <SettingItem
                icon="film-outline"
                value={
                  previewConfig.style === '3d'
                    ? '3D Animation'
                    : previewConfig.style
                      ? String(
                          previewConfig.style,
                        )
                      : '3D Animation'
                }
                label="Video Style"
              />

              <SettingItem
                icon="globe-outline"
                value={
                  previewConfig.language ??
                  'English (US)'
                }
                label="Language"
              />

              <SettingItem
                icon="pulse-outline"
                value={
                  previewConfig.voice === 'auto'
                    ? 'AI Auto'
                    : previewConfig.voice
                      ? String(
                          previewConfig.voice,
                        )
                      : 'AI Auto'
                }
                label="Voice"
              />

              <SettingItem
                icon="camera-outline"
                value={
                  previewConfig.camera ?? 'auto'
                }
                label="Camera"
              />
            </View>
          </SectionCard>
        </ScrollView>

        <View style={styles.fixedBottom}>
          <Pressable
            onPress={() => {
              void handleGenerate();
            }}
            disabled={isGenerating}
            style={({ pressed }) => [
              styles.generateButton,
              isGenerating &&
                styles.generateDisabled,
              pressed && styles.generatePressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Generate Video"
            accessibilityState={{
              disabled: isGenerating,
              busy: isGenerating,
            }}
          >
            <LinearGradient
              colors={[
                '#00CFFF',
                '#2C75FF',
                '#8C2EFF',
              ]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.generateGradient}
            >
              <Text style={styles.generateText}>
                {isGenerating
                  ? 'Generating...'
                  : 'Generate Video'}
              </Text>

              <Text style={styles.generateSparkles}>
                ✦✦
              </Text>

              <Ionicons
                name="arrow-forward"
                size={31}
                color={COLORS.white}
              />
            </LinearGradient>
          </Pressable>

          <View style={styles.footer}>
            <Ionicons
              name="lock-closed-outline"
              size={15}
              color={COLORS.textMuted}
            />
            <Text style={styles.footerText}>
              Your generation is private and secure.
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

function SectionCard({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <View style={styles.sectionCard}>
      {children}
    </View>
  );
}

function PillButton({
  icon,
  label,
  color,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.pillButton,
        pressed && styles.pressed,
      ]}
    >
      <Ionicons
        name={icon}
        size={16}
        color={color}
      />
      <Text
        style={[
          styles.pillButtonText,
          { color },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function SettingItem({
  icon,
  value,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  label: string;
}) {
  return (
    <View style={styles.settingItem}>
      <Ionicons
        name={icon}
        size={27}
        color={COLORS.cyan}
      />

      <Text
        style={styles.settingValue}
        numberOfLines={2}
        adjustsFontSizeToFit
        minimumFontScale={0.65}
      >
        {value}
      </Text>

      <Text
        style={styles.settingLabel}
        numberOfLines={2}
        adjustsFontSizeToFit
        minimumFontScale={0.65}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  pressed: {
    opacity: 0.72,
  },

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

  scrollContent: {
    paddingTop: 11,
    gap: 7,
  },

  heroCard: {
    minHeight: 101,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#4F39A2',
    backgroundColor: '#030E1B',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    overflow: 'hidden',
  },

  heroIconWrap: {
    width: 70,
    height: 75,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    flexShrink: 0,
  },

  heroSparkOne: {
    position: 'absolute',
    top: 7,
    left: 1,
    color: COLORS.cyan,
    fontSize: 15,
  },

  heroSparkTwo: {
    position: 'absolute',
    bottom: 2,
    right: 0,
    color: COLORS.cyan,
    fontSize: 13,
  },

  heroCopy: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 7,
  },

  heroTitle: {
    color: COLORS.white,
    fontSize: 17,
    lineHeight: 21,
    fontWeight: '800',
    marginBottom: 7,
  },

  heroDescription: {
    color: COLORS.textSecondary,
    fontSize: 11.2,
    lineHeight: 17,
  },

  heroImage: {
    width: 175,
    height: 96,
    marginRight: -7,
    flexShrink: 0,
  },

  sectionCard: {
    width: '100%',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    backgroundColor: COLORS.card,
    padding: 10,
  },

  sectionTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
    flexShrink: 1,
  },

  sectionTitle: {
    color: COLORS.white,
    fontSize: 14.5,
    lineHeight: 18,
    fontWeight: '700',
  },

  sectionSpark: {
    color: COLORS.cyan,
    fontSize: 16,
    marginLeft: 5,
  },

  pillButton: {
    minHeight: 32,
    borderWidth: 1,
    borderColor: COLORS.borderBright,
    borderRadius: 14,
    backgroundColor: '#031721',
    paddingHorizontal: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    flexShrink: 0,
  },

  pillButtonText: {
    fontSize: 9.5,
    fontWeight: '600',
  },

  storyText: {
    color: COLORS.textSecondary,
    fontSize: 12.2,
    lineHeight: 19,
    marginTop: 10,
  },

  dynamicSceneList: {
    width: '100%',
    gap: 8,
    marginTop: 10,
  },

  dynamicScene: {
    width: '100%',
    minHeight: 74,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.cardSoft,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 8,
  },

  dynamicSceneBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.cyan,
    backgroundColor: '#061822',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  sceneBadgeText: {
    color: COLORS.cyan,
    fontSize: 10,
    fontWeight: '700',
  },

  dynamicSceneCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 9,
    paddingRight: 5,
  },

  dynamicSceneTitle: {
    color: COLORS.white,
    fontSize: 11.5,
    lineHeight: 15,
    fontWeight: '700',
  },

  dynamicSceneDescription: {
    color: COLORS.textSecondary,
    fontSize: 9.5,
    lineHeight: 13,
    marginTop: 3,
  },

  dynamicSceneDialogue: {
    color: '#D8B7FF',
    fontSize: 9.2,
    lineHeight: 13,
    marginTop: 4,
  },

  dynamicSceneMeta: {
    color: COLORS.cyan,
    fontSize: 9,
    lineHeight: 12,
    marginTop: 3,
    fontWeight: '600',
  },

  sceneSummaryRow: {
    marginTop: 9,
    minHeight: 34,
    borderRadius: 9,
    backgroundColor: '#05242C',
    borderWidth: 1,
    borderColor: '#104C5A',
    paddingHorizontal: 9,
    flexDirection: 'row',
    alignItems: 'center',
  },

  sceneSummaryText: {
    color: COLORS.textSecondary,
    fontSize: 9.5,
    lineHeight: 13,
    marginLeft: 7,
    flex: 1,
  },

  settingsGrid: {
    width: '100%',
    marginTop: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },

  settingItem: {
    width: '31.8%',
    minHeight: 88,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.cardSoft,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },

  settingValue: {
    color: COLORS.white,
    fontSize: 10,
    lineHeight: 13,
    textAlign: 'center',
    marginTop: 6,
    fontWeight: '500',
  },

  settingLabel: {
    color: COLORS.textSecondary,
    fontSize: 9,
    lineHeight: 12,
    textAlign: 'center',
    marginTop: 2,
  },

  fixedBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.background,
    paddingHorizontal: 14,
    paddingTop: 6,
    paddingBottom: 6,
  },

  generateButton: {
    width: '100%',
    height: 55,
    borderRadius: 28,
    overflow: 'hidden',
  },

  generateDisabled: {
    opacity: 0.62,
  },

  generatePressed: {
    opacity: 0.9,
    transform: [{ scale: 0.985 }],
  },

  generateGradient: {
    flex: 1,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  generateText: {
    color: COLORS.white,
    fontSize: 17,
    lineHeight: 21,
    fontWeight: '700',
    marginRight: 10,
  },

  generateSparkles: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
    marginRight: 14,
  },

  footer: {
    height: 27,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },

  footerText: {
    color: COLORS.textMuted,
    fontSize: 9.5,
  },
});