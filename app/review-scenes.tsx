import React, { useMemo, useState } from 'react';
import {
  Alert,
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
  green: '#10DFAF',
  white: '#FFFFFF',
  textSecondary: '#C6D0D8',
  textMuted: '#8C99A4',
  border: '#183B4A',
  borderBright: '#154A5D',
  divider: '#213844',
  danger: '#FF6B7A',
} as const;

type PreviewCharacter = {
  id: string;
  name: string;
  role: string;
  visualDescription: string;
  imagePrompt?: string;
  imageUrl?: string;
};

type DialogueLine = {
  characterId: string;
  text: string;
  emotion?: string;
  delivery?: string;
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

type EditableScene = PreviewScene & {
  dialogue: DialogueLine[];
};

const FALLBACK_SCENES: PreviewScene[] = [
  {
    sceneNumber: 1,
    id: 'scene-1',
    title: 'Scene 1',
    description: 'The story begins.',
    narration: '',
    dialogue: [],
    durationSeconds: 5,
  },
];

function parseJson<T>(
  value: string | string[] | undefined,
  fallback: T,
): T {
  if (typeof value !== 'string' || !value.trim()) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.error('[REVIEW SCENES] JSON parse error:', error);
    return fallback;
  }
}

function normalizeScene(scene: PreviewScene, index: number): EditableScene {
  return {
    ...scene,
    sceneNumber: Number(scene.sceneNumber) || index + 1,
    id: scene.id ?? `scene-${Number(scene.sceneNumber) || index + 1}`,
    title: scene.title ?? `Scene ${index + 1}`,
    description: scene.description ?? '',
    narration: scene.narration ?? '',
    dialogue: Array.isArray(scene.dialogue)
      ? scene.dialogue.map((line) => ({
          characterId: line.characterId ?? '',
          text: line.text ?? '',
          emotion: line.emotion,
          delivery: line.delivery,
        }))
      : [],
    durationSeconds:
      Number(scene.durationSeconds) > 0
        ? Number(scene.durationSeconds)
        : 5,
  };
}

export default function ReviewScenesScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();

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

  const storyAnalysis = useMemo(
    () => parseJson<StoryAnalysisPayload>(analysis, {}),
    [analysis],
  );

  const previewConfig = useMemo(
    () =>
      parseJson<PreviewConfig>(
        typeof customization === 'string'
          ? customization
          : config,
        {},
      ),
    [config, customization],
  );

  const initialScenes = useMemo(() => {
    const source =
      Array.isArray(storyAnalysis.storyBeats) &&
      storyAnalysis.storyBeats.length > 0
        ? storyAnalysis.storyBeats
        : Array.isArray(storyAnalysis.scenes) &&
            storyAnalysis.scenes.length > 0
          ? storyAnalysis.scenes
          : FALLBACK_SCENES;

    return source.map(normalizeScene);
  }, [storyAnalysis.scenes, storyAnalysis.storyBeats]);

  const [scenes, setScenes] = useState<EditableScene[]>(initialScenes);
  const [expandedScene, setExpandedScene] = useState<number | null>(
    initialScenes[0]?.sceneNumber ?? null,
  );

  const safeDuration =
    Number(previewConfig.duration) === 15 ||
    Number(previewConfig.duration) === 30 ||
    Number(previewConfig.duration) === 60
      ? Number(previewConfig.duration)
      : 30;

  const plannedDuration = scenes.reduce(
    (total, scene) =>
      total + (Number(scene.durationSeconds) || 0),
    0,
  );

  const getCharacterName = (characterId: string) => {
    const character = (storyAnalysis.characters ?? []).find(
      (item) => item.id === characterId,
    );

    return character?.name ?? 'Character';
  };

  const updateScene = (
    sceneNumber: number,
    changes: Partial<EditableScene>,
  ) => {
    setScenes((current) =>
      current.map((scene) =>
        scene.sceneNumber === sceneNumber
          ? { ...scene, ...changes }
          : scene,
      ),
    );
  };

  const updateDialogue = (
    sceneNumber: number,
    dialogueIndex: number,
    text: string,
  ) => {
    setScenes((current) =>
      current.map((scene) => {
        if (scene.sceneNumber !== sceneNumber) {
          return scene;
        }

        const nextDialogue = [...scene.dialogue];
        const existing = nextDialogue[dialogueIndex];

        if (!existing) {
          return scene;
        }

        nextDialogue[dialogueIndex] = {
          ...existing,
          text,
        };

        return {
          ...scene,
          dialogue: nextDialogue,
        };
      }),
    );
  };

  const removeDialogue = (
    sceneNumber: number,
    dialogueIndex: number,
  ) => {
    setScenes((current) =>
      current.map((scene) => {
        if (scene.sceneNumber !== sceneNumber) {
          return scene;
        }

        return {
          ...scene,
          dialogue: scene.dialogue.filter(
            (_, index) => index !== dialogueIndex,
          ),
        };
      }),
    );
  };

  const addDialogue = (sceneNumber: number) => {
    const characters = storyAnalysis.characters ?? [];
    const defaultCharacterId = characters[0]?.id ?? '';

    setScenes((current) =>
      current.map((scene) => {
        if (scene.sceneNumber !== sceneNumber) {
          return scene;
        }

        return {
          ...scene,
          dialogue: [
            ...scene.dialogue,
            {
              characterId: defaultCharacterId,
              text: '',
              emotion: 'neutral',
              delivery: 'natural',
            },
          ],
        };
      }),
    );
  };

  const buildUpdatedAnalysis = (): StoryAnalysisPayload => ({
    ...storyAnalysis,
    scenes: scenes,
    storyBeats: scenes,
  });

  const handleSaveAndReview = () => {
    const hasEmptyDialogue = scenes.some((scene) =>
      scene.dialogue.some((line) => !line.text.trim()),
    );

    if (hasEmptyDialogue) {
      Alert.alert(
        'Incomplete Dialogue',
        'Please enter text for every dialogue line or remove empty lines.',
      );
      return;
    }

    const updatedAnalysis = buildUpdatedAnalysis();

    console.log(
      '[REVIEW SCENES] Approved T2V scene plan:',
      updatedAnalysis,
    );

    router.replace({
      pathname: '/ai-preview' as any,
      params: {
        story: typeof story === 'string' ? story : '',
        analysis: JSON.stringify(updatedAnalysis),
        config:
          typeof config === 'string' ? config : '',
        customization:
          typeof customization === 'string'
            ? customization
            : JSON.stringify(previewConfig),
      },
    });
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/ai-preview' as any);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.background}
      />

      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View
          style={[
            styles.header,
            {
              paddingHorizontal: width <= 375 ? 16 : 22,
            },
          ]}
        >
          <Pressable
            onPress={handleBack}
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.pressed,
            ]}
            hitSlop={10}
          >
            <Ionicons
              name="chevron-back"
              size={30}
              color={COLORS.white}
            />
          </Pressable>

          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerTitle}>
              Review & Edit{' '}
              <Text style={styles.headerAccent}>Scenes</Text>
              <Text style={styles.sparkle}>✦</Text>
            </Text>
          </View>

          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.content,
            {
              paddingHorizontal: width <= 375 ? 16 : 22,
              paddingBottom: 145,
            },
          ]}
        >
          <View style={styles.heroCard}>
            <View style={styles.heroIcon}>
              <Ionicons
                name="create-outline"
                size={32}
                color={COLORS.cyan}
              />
            </View>

            <View style={styles.heroCopy}>
              <Text style={styles.heroTitle}>
                Final Scene Review
              </Text>
              <Text style={styles.heroDescription}>
                Edit your AI-generated scenes, narration,
                dialogue and timing before video production.
              </Text>
            </View>
          </View>

          <View style={styles.storyInfoCard}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionTitleRow}>
                <Ionicons
                  name="sparkles-outline"
                  size={17}
                  color={COLORS.cyan}
                />
                <Text style={styles.sectionTitle}>
                  Story
                </Text>
              </View>

              <View style={styles.approvedPill}>
                <Ionicons
                  name="checkmark-circle"
                  size={14}
                  color={COLORS.green}
                />
                <Text style={styles.approvedText}>
                  AI Planned
                </Text>
              </View>
            </View>

            <Text style={styles.storyTitle}>
              {storyAnalysis.title || 'Your Story'}
            </Text>

            <Text style={styles.storySummary}>
              {storyAnalysis.summary ||
                (typeof story === 'string' && story.trim()
                  ? story
                  : 'Your story is ready for final review.')}
            </Text>
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.summaryItem}>
              <Ionicons
                name="layers-outline"
                size={22}
                color={COLORS.cyan}
              />
              <Text style={styles.summaryValue}>
                {scenes.length}
              </Text>
              <Text style={styles.summaryLabel}>
                Scenes
              </Text>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.summaryItem}>
              <Ionicons
                name="time-outline"
                size={22}
                color={COLORS.cyan}
              />
              <Text style={styles.summaryValue}>
                {Math.round(plannedDuration)}s
              </Text>
              <Text style={styles.summaryLabel}>
                Storyboard
              </Text>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.summaryItem}>
              <Ionicons
                name="checkmark-circle-outline"
                size={22}
                color={
                  plannedDuration === safeDuration
                    ? COLORS.green
                    : COLORS.cyan
                }
              />
              <Text style={styles.summaryValue}>
                {safeDuration}s
              </Text>
              <Text style={styles.summaryLabel}>
                Target
              </Text>
            </View>
          </View>

          {plannedDuration !== safeDuration ? (
            <View style={styles.durationNotice}>
              <Ionicons
                name="information-circle-outline"
                size={20}
                color={COLORS.cyan}
              />
              <Text style={styles.durationNoticeText}>
                Your scene durations total {Math.round(plannedDuration)}s,
                while the selected video target is {safeDuration}s.
                You can adjust scene timing below before generating.
              </Text>
            </View>
          ) : null}

          <View style={styles.sectionBlock}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionTitle}>
                  Scenes
                </Text>
                <Text style={styles.sceneCount}>
                  {scenes.length}
                </Text>
              </View>

              <Text style={styles.sectionHint}>
                Tap a scene to edit
              </Text>
            </View>

            <View style={styles.sceneList}>
              {scenes.map((scene) => {
                const isExpanded =
                  expandedScene === scene.sceneNumber;

                return (
                  <View
                    key={
                      scene.id ??
                      `scene-${scene.sceneNumber}`
                    }
                    style={[
                      styles.sceneCard,
                      isExpanded && styles.sceneCardExpanded,
                    ]}
                  >
                    <Pressable
                      onPress={() =>
                        setExpandedScene(
                          isExpanded
                            ? null
                            : scene.sceneNumber,
                        )
                      }
                      style={({ pressed }) => [
                        styles.sceneHeader,
                        pressed && styles.pressed,
                      ]}
                    >
                      <View style={styles.sceneNumberWrap}>
                        <Text style={styles.sceneNumber}>
                          {String(
                            scene.sceneNumber,
                          ).padStart(2, '0')}
                        </Text>
                      </View>

                      <View style={styles.sceneHeaderCopy}>
                        <Text
                          style={styles.sceneTitle}
                          numberOfLines={2}
                        >
                          {scene.title ||
                            `Scene ${scene.sceneNumber}`}
                        </Text>

                        <Text
                          style={styles.scenePreview}
                          numberOfLines={2}
                        >
                          {scene.description ||
                            'No scene description.'}
                        </Text>

                        <View style={styles.sceneMetaRow}>
                          <View style={styles.metaPill}>
                            <Ionicons
                              name="time-outline"
                              size={12}
                              color={COLORS.cyan}
                            />
                            <Text style={styles.metaText}>
                              {scene.durationSeconds}s
                            </Text>
                          </View>

                          {scene.dialogue.length > 0 ? (
                            <View style={styles.metaPill}>
                              <Ionicons
                                name="chatbubble-outline"
                                size={12}
                                color={COLORS.purple}
                              />
                              <Text style={styles.metaText}>
                                {scene.dialogue.length}{' '}
                                dialogue
                              </Text>
                            </View>
                          ) : null}
                        </View>
                      </View>

                      <Ionicons
                        name={
                          isExpanded
                            ? 'chevron-up'
                            : 'chevron-down'
                        }
                        size={20}
                        color={COLORS.textSecondary}
                      />
                    </Pressable>

                    {isExpanded ? (
                      <View style={styles.editor}>
                        <FieldLabel label="Scene Title" />
                        <TextInput
                          value={scene.title}
                          onChangeText={(value) =>
                            updateScene(
                              scene.sceneNumber,
                              { title: value },
                            )
                          }
                          placeholder="Scene title"
                          placeholderTextColor={
                            COLORS.textMuted
                          }
                          style={styles.input}
                        />

                        <FieldLabel
                          label="Scene Description"
                        />
                        <TextInput
                          value={scene.description}
                          onChangeText={(value) =>
                            updateScene(
                              scene.sceneNumber,
                              {
                                description: value,
                              },
                            )
                          }
                          placeholder="Describe what happens in this scene..."
                          placeholderTextColor={
                            COLORS.textMuted
                          }
                          multiline
                          textAlignVertical="top"
                          style={[
                            styles.input,
                            styles.textArea,
                          ]}
                        />

                        <FieldLabel label="Narration" />
                        <TextInput
                          value={scene.narration}
                          onChangeText={(value) =>
                            updateScene(
                              scene.sceneNumber,
                              {
                                narration: value,
                              },
                            )
                          }
                          placeholder="Narration for this scene..."
                          placeholderTextColor={
                            COLORS.textMuted
                          }
                          multiline
                          textAlignVertical="top"
                          style={[
                            styles.input,
                            styles.textArea,
                          ]}
                        />

                        <FieldLabel
                          label="Duration (seconds)"
                        />
                        <TextInput
                          value={String(
                            scene.durationSeconds,
                          )}
                          onChangeText={(value) => {
                            const cleaned =
                              value.replace(
                                /[^0-9]/g,
                                '',
                              );

                            updateScene(
                              scene.sceneNumber,
                              {
                                durationSeconds:
                                  cleaned
                                    ? Number(cleaned)
                                    : 0,
                              },
                            );
                          }}
                          keyboardType="number-pad"
                          placeholder="5"
                          placeholderTextColor={
                            COLORS.textMuted
                          }
                          style={styles.input}
                        />

                        <View style={styles.dialogueHeader}>
                          <View style={styles.sectionTitleRow}>
                            <Ionicons
                              name="chatbubble-ellipses-outline"
                              size={17}
                              color={COLORS.purple}
                            />
                            <Text
                              style={styles.dialogueTitle}
                            >
                              Dialogue
                            </Text>
                          </View>

                          <Pressable
                            onPress={() =>
                              addDialogue(
                                scene.sceneNumber,
                              )
                            }
                            style={({ pressed }) => [
                              styles.addButton,
                              pressed &&
                                styles.pressed,
                            ]}
                          >
                            <Ionicons
                              name="add"
                              size={16}
                              color={COLORS.cyan}
                            />
                            <Text
                              style={
                                styles.addButtonText
                              }
                            >
                              Add
                            </Text>
                          </Pressable>
                        </View>

                        {scene.dialogue.length === 0 ? (
                          <View
                            style={
                              styles.noDialogueCard
                            }
                          >
                            <Text
                              style={
                                styles.noDialogueText
                              }
                            >
                              No dialogue in this scene.
                            </Text>
                          </View>
                        ) : (
                          <View style={styles.dialogueList}>
                            {scene.dialogue.map(
                              (line, dialogueIndex) => (
                                <View
                                  key={`${scene.sceneNumber}-dialogue-${dialogueIndex}`}
                                  style={
                                    styles.dialogueCard
                                  }
                                >
                                  <View
                                    style={
                                      styles.dialogueSpeakerRow
                                    }
                                  >
                                    <View
                                      style={
                                        styles.speakerBadge
                                      }
                                    >
                                      <Ionicons
                                        name="person-outline"
                                        size={14}
                                        color={
                                          COLORS.purple
                                        }
                                      />
                                    </View>

                                    <Text
                                      style={
                                        styles.speakerName
                                      }
                                    >
                                      {getCharacterName(
                                        line.characterId,
                                      )}
                                    </Text>

                                    <Pressable
                                      onPress={() =>
                                        removeDialogue(
                                          scene.sceneNumber,
                                          dialogueIndex,
                                        )
                                      }
                                      hitSlop={8}
                                      style={
                                        styles.deleteButton
                                      }
                                    >
                                      <Ionicons
                                        name="trash-outline"
                                        size={17}
                                        color={
                                          COLORS.danger
                                        }
                                      />
                                    </Pressable>
                                  </View>

                                  <TextInput
                                    value={line.text}
                                    onChangeText={(value) =>
                                      updateDialogue(
                                        scene.sceneNumber,
                                        dialogueIndex,
                                        value,
                                      )
                                    }
                                    placeholder="Enter dialogue..."
                                    placeholderTextColor={
                                      COLORS.textMuted
                                    }
                                    multiline
                                    textAlignVertical="top"
                                    style={[
                                      styles.input,
                                      styles.dialogueInput,
                                    ]}
                                  />

                                  {(line.emotion ||
                                    line.delivery) ? (
                                    <Text
                                      style={
                                        styles.dialogueMeta
                                      }
                                    >
                                      {line.emotion
                                        ? `Emotion: ${line.emotion}`
                                        : ''}
                                      {line.emotion &&
                                      line.delivery
                                        ? '  •  '
                                        : ''}
                                      {line.delivery
                                        ? `Delivery: ${line.delivery}`
                                        : ''}
                                    </Text>
                                  ) : null}
                                </View>
                              ),
                            )}
                          </View>
                        )}

                        {scene.actions &&
                        scene.actions.length > 0 ? (
                          <View style={styles.infoSection}>
                            <Text
                              style={styles.infoLabel}
                            >
                              AI Actions
                            </Text>
                            <Text
                              style={styles.infoText}
                            >
                              {scene.actions.join(' • ')}
                            </Text>
                          </View>
                        ) : null}

                        {scene.location ? (
                          <View style={styles.infoSection}>
                            <Text
                              style={styles.infoLabel}
                            >
                              Location
                            </Text>
                            <Text
                              style={styles.infoText}
                            >
                              {scene.location}
                            </Text>
                          </View>
                        ) : null}
                      </View>
                    ) : null}
                  </View>
                );
              })}
            </View>
          </View>

          <View style={styles.settingsCard}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionTitleRow}>
                <Ionicons
                  name="options-outline"
                  size={17}
                  color={COLORS.cyan}
                />
                <Text style={styles.sectionTitle}>
                  Video Settings
                </Text>
              </View>
            </View>

            <View style={styles.settingsGrid}>
              <SettingItem
                icon="time-outline"
                value={`${safeDuration}s`}
                label="Target Duration"
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
                    : previewConfig.style ||
                      '3D Animation'
                }
                label="Style"
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
                    : previewConfig.voice ||
                      'AI Auto'
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
          </View>
        </ScrollView>

        <View style={styles.fixedBottom}>
          <Pressable
            onPress={handleSaveAndReview}
            style={({ pressed }) => [
              styles.continueButton,
              pressed && styles.buttonPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Save scenes and return to AI Preview"
          >
            <LinearGradient
              colors={[
                '#00CFFF',
                '#2C75FF',
                '#8C2EFF',
              ]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.continueGradient}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={23}
                color={COLORS.white}
              />
              <Text style={styles.continueText}>
                Save & Continue
              </Text>
              <Ionicons
                name="arrow-forward"
                size={25}
                color={COLORS.white}
              />
            </LinearGradient>
          </Pressable>

          <View style={styles.footer}>
            <Ionicons
              name="shield-checkmark-outline"
              size={14}
              color={COLORS.textMuted}
            />
            <Text style={styles.footerText}>
              Your edits stay part of this video project.
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function FieldLabel({ label }: { label: string }) {
  return (
    <Text style={styles.fieldLabel}>
      {label}
    </Text>
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
        size={22}
        color={COLORS.cyan}
      />
      <Text
        style={styles.settingValue}
        numberOfLines={2}
      >
        {value}
      </Text>
      <Text
        style={styles.settingLabel}
        numberOfLines={2}
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
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 46,
    height: 44,
    borderRadius: 15,
    borderWidth: 1.2,
    borderColor: COLORS.borderBright,
    backgroundColor: COLORS.cardSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerAccent: {
    color: COLORS.cyan,
  },
  sparkle: {
    color: COLORS.cyan,
    fontSize: 16,
  },
  headerSpacer: {
    width: 46,
  },
  content: {
    paddingTop: 8,
    gap: 10,
  },
  heroCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#4F39A2',
    backgroundColor: '#030E1B',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroIcon: {
    width: 58,
    height: 58,
    borderRadius: 17,
    backgroundColor: '#061822',
    borderWidth: 1,
    borderColor: COLORS.borderBright,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  heroCopy: {
    flex: 1,
  },
  heroTitle: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 5,
  },
  heroDescription: {
    color: COLORS.textSecondary,
    fontSize: 11.5,
    lineHeight: 17,
  },
  storyInfoCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    padding: 13,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minWidth: 0,
  },
  sectionTitle: {
    color: COLORS.white,
    fontSize: 14.5,
    fontWeight: '700',
  },
  sectionHint: {
    color: COLORS.textMuted,
    fontSize: 9.5,
  },
  approvedPill: {
    minHeight: 27,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#175242',
    backgroundColor: '#06231F',
    paddingHorizontal: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  approvedText: {
    color: COLORS.green,
    fontSize: 9.5,
    fontWeight: '700',
  },
  storyTitle: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
    marginTop: 12,
  },
  storySummary: {
    color: COLORS.textSecondary,
    fontSize: 11.5,
    lineHeight: 18,
    marginTop: 6,
  },
  summaryCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    minHeight: 92,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingHorizontal: 6,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryDivider: {
    width: 1,
    height: 45,
    backgroundColor: COLORS.divider,
  },
  summaryValue: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '800',
    marginTop: 5,
  },
  summaryLabel: {
    color: COLORS.textMuted,
    fontSize: 9.5,
    marginTop: 2,
  },
  durationNotice: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#14506A',
    backgroundColor: '#05212B',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  durationNoticeText: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: 10,
    lineHeight: 15,
  },
  sectionBlock: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    padding: 10,
  },
  sceneCount: {
    color: COLORS.cyan,
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 2,
  },
  sceneList: {
    marginTop: 10,
    gap: 8,
  },
  sceneCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.cardSoft,
    overflow: 'hidden',
  },
  sceneCardExpanded: {
    borderColor: COLORS.borderBright,
  },
  sceneHeader: {
    minHeight: 86,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sceneNumberWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.cyan,
    backgroundColor: '#061822',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },
  sceneNumber: {
    color: COLORS.cyan,
    fontSize: 10.5,
    fontWeight: '800',
  },
  sceneHeaderCopy: {
    flex: 1,
    minWidth: 0,
    marginRight: 8,
  },
  sceneTitle: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
  },
  scenePreview: {
    color: COLORS.textSecondary,
    fontSize: 9.5,
    lineHeight: 14,
    marginTop: 3,
  },
  sceneMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginTop: 5,
  },
  metaPill: {
    minHeight: 21,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#04141D',
    paddingHorizontal: 7,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    color: COLORS.textMuted,
    fontSize: 8.5,
    fontWeight: '600',
  },
  editor: {
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    padding: 11,
  },
  fieldLabel: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '700',
    marginTop: 7,
    marginBottom: 5,
  },
  input: {
    minHeight: 43,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    backgroundColor: '#03131C',
    paddingHorizontal: 10,
    paddingVertical: 9,
    color: COLORS.white,
    fontSize: 11,
  },
  textArea: {
    minHeight: 82,
    lineHeight: 17,
  },
  dialogueHeader: {
    marginTop: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dialogueTitle: {
    color: COLORS.white,
    fontSize: 12.5,
    fontWeight: '700',
  },
  addButton: {
    minHeight: 30,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.borderBright,
    backgroundColor: '#031721',
    paddingHorizontal: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addButtonText: {
    color: COLORS.cyan,
    fontSize: 9.5,
    fontWeight: '700',
  },
  noDialogueCard: {
    marginTop: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#03131C',
    padding: 10,
  },
  noDialogueText: {
    color: COLORS.textMuted,
    fontSize: 9.5,
  },
  dialogueList: {
    marginTop: 8,
    gap: 8,
  },
  dialogueCard: {
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#2D2140',
    backgroundColor: '#0B0E17',
    padding: 9,
  },
  dialogueSpeakerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  speakerBadge: {
    width: 25,
    height: 25,
    borderRadius: 12.5,
    borderWidth: 1,
    borderColor: '#5C3F74',
    backgroundColor: '#211333',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 7,
  },
  speakerName: {
    flex: 1,
    color: COLORS.white,
    fontSize: 10.5,
    fontWeight: '700',
  },
  deleteButton: {
    width: 28,
    height: 28,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialogueInput: {
    marginTop: 7,
    minHeight: 68,
    borderColor: '#3A2A4B',
  },
  dialogueMeta: {
    color: COLORS.textMuted,
    fontSize: 8.5,
    lineHeight: 12,
    marginTop: 5,
  },
  infoSection: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  infoLabel: {
    color: COLORS.textMuted,
    fontSize: 9.5,
    fontWeight: '700',
    marginBottom: 4,
  },
  infoText: {
    color: COLORS.textSecondary,
    fontSize: 9.5,
    lineHeight: 14,
  },
  settingsCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    padding: 10,
  },
  settingsGrid: {
    marginTop: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
  },
  settingItem: {
    width: '31.8%',
    minHeight: 78,
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
    fontSize: 9.5,
    lineHeight: 12,
    textAlign: 'center',
    marginTop: 5,
    fontWeight: '700',
  },
  settingLabel: {
    color: COLORS.textSecondary,
    fontSize: 8.5,
    lineHeight: 11,
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
    paddingBottom: 7,
  },
  continueButton: {
    height: 55,
    borderRadius: 28,
    overflow: 'hidden',
  },
  buttonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.985 }],
  },
  continueGradient: {
    flex: 1,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueText: {
    color: COLORS.white,
    fontSize: 16.5,
    fontWeight: '700',
    marginHorizontal: 9,
  },
  footer: {
    height: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  footerText: {
    color: COLORS.textMuted,
    fontSize: 8.8,
  },
});