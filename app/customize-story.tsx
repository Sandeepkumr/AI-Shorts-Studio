import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
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
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const COLORS = {
  background: '#020A12',
  card: '#04121A',
  cardSoft: '#061822',

  cyan: '#00E5F5',
  cyanDark: '#008894',

  purple: '#C35CFF',
  purpleDark: '#211333',

  white: '#FFFFFF',
  black: '#001015',

  textSecondary: '#C6D0D8',
  textMuted: '#8C99A4',
  muted: '#8C99A4',

  border: '#183B4A',
  borderBright: '#154A5D',
  divider: '#213844',

  selectedDark: '#071820',
} as const;

const ASSETS = {
  coin: require('../assets/coin.png'),
  introHero: require('../assets/text-video-hero.png'),

  style3d: require('../assets/style-3d-animation.png'),
  styleCinematic: require('../assets/style-cinematic.png'),
  styleRealistic: require('../assets/style-realistic.png'),
  styleAnime: require('../assets/style-anime.png'),
  styleCartoon: require('../assets/style-cartoon.png'),


} as const;


const API_BASE_URL =
  'http://192.168.31.189:4000';

type StyleId =
  | '3d'
  | 'cinematic'
  | 'realistic'
  | 'anime'
  | 'cartoon';

type Duration = 15 | 30 | 60;
type Ratio = '9:16' | '16:9' | '1:1';
type Voice = 'auto' | 'male' | 'female' | 'none';
type Camera =
  | 'auto'
  | 'cinematic'
  | 'close-up'
  | 'wide'
  | 'dynamic';

type Language =
  | 'English (US)'
  | 'English (UK)'
  | 'Hindi'
  | 'Punjabi'
  | 'Spanish'
  | 'French'
  | 'German'
  | 'Japanese'
  | 'Korean';

type CustomizationState = {
  duration?: Duration;
  ratio?: Ratio;
  style?: StyleId;
  language?: Language;
  voice?: Voice;
  camera?: Camera;
};

const parseCustomizationState = (
  value: string | string[] | undefined,
): CustomizationState => {
  if (typeof value !== "string" || !value.trim()) {
    return {};
  }

  try {
    const parsed = JSON.parse(value) as CustomizationState;

    if (
      !parsed ||
      typeof parsed !== "object" ||
      Array.isArray(parsed)
    ) {
      return {};
    }

    return parsed;
  } catch (error) {
    console.error(
      "Customize Story customization parse error:",
      error,
    );
    return {};
  }
};


const LANGUAGE_OPTIONS: Array<{
  label: Language;
  subtitle: string;
}> = [
  { label: 'English (US)', subtitle: 'English' },
  { label: 'English (UK)', subtitle: 'English' },
  { label: 'Hindi', subtitle: 'हिन्दी' },
  { label: 'Punjabi', subtitle: 'ਪੰਜਾਬੀ' },
  { label: 'Spanish', subtitle: 'Español' },
  { label: 'French', subtitle: 'Français' },
  { label: 'German', subtitle: 'Deutsch' },
  { label: 'Japanese', subtitle: '日本語' },
  { label: 'Korean', subtitle: '한국어' },
];

const STYLE_OPTIONS: Array<{
  id: StyleId;
  label: string;
  image: any;
}> = [
  {
    id: '3d',
    label: '3D Animation',
    image: ASSETS.style3d,
  },
  {
    id: 'cinematic',
    label: 'Cinematic',
    image: ASSETS.styleCinematic,
  },
  {
    id: 'realistic',
    label: 'Realistic',
    image: ASSETS.styleRealistic,
  },
  {
    id: 'anime',
    label: 'Anime',
    image: ASSETS.styleAnime,
  },
  {
    id: 'cartoon',
    label: 'Cartoon',
    image: ASSETS.styleCartoon,
  },
];

export default function CustomizeVideoScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const {
    analysis,
    story,
    customization,
  } = useLocalSearchParams<{
    analysis?: string;
    story?: string;
    customization?: string;
  }>();

  const parsedCustomization =
    parseCustomizationState(
      customization,
    );

  const scale = Math.min(width / 428, 1);
  const horizontalPadding = width <= 375 ? 16 : 22;

  const [duration, setDuration] =
    useState<Duration>(
      parsedCustomization.duration ?? 30,
    );
  const [ratio, setRatio] =
    useState<Ratio>(
      parsedCustomization.ratio ?? '9:16',
    );
  const [style, setStyle] =
    useState<StyleId>(
      parsedCustomization.style ?? '3d',
    );
  const [language, setLanguage] =
    useState<Language>(
      parsedCustomization.language ??
        'English (US)',
    );
  const [voice, setVoice] =
    useState<Voice>(
      parsedCustomization.voice ?? 'auto',
    );
  const [camera, setCamera] =
    useState<Camera>(
      parsedCustomization.camera ?? 'auto',
    );

  const [showLanguageDropdown, setShowLanguageDropdown] =
    useState(false);

  const [isOptimizing, setIsOptimizing] =
    useState(false);

  console.log(
    '[CUSTOMIZE STORY] restored settings:',
    parsedCustomization,
  );

  const goBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  }, [router]);

  const handleContinue = useCallback(async () => {
    if (isOptimizing) {
      return;
    }

    const cleanStory =
      typeof story === 'string'
        ? story.trim()
        : '';

    if (!cleanStory) {
      Alert.alert(
        'Story Missing',
        'Your story could not be found. Please go back and enter your story again.',
      );
      return;
    }

    if (
      typeof analysis !== 'string' ||
      !analysis.trim()
    ) {
      Alert.alert(
        'Story Analysis Missing',
        'The AI story analysis could not be found. Please go back and analyze your story again.',
      );
      return;
    }

    let parsedAnalysis: unknown;

    try {
      parsedAnalysis =
        JSON.parse(analysis);
    } catch (error) {
      console.error(
        '[CUSTOMIZE STORY] Analysis JSON parse error:',
        error,
      );

      Alert.alert(
        'Analysis Error',
        'The current story analysis is invalid. Please go back and analyze your story again.',
      );
      return;
    }

    if (
      !parsedAnalysis ||
      typeof parsedAnalysis !== 'object' ||
      Array.isArray(parsedAnalysis)
    ) {
      Alert.alert(
        'Analysis Error',
        'The current story analysis is invalid. Please go back and analyze your story again.',
      );
      return;
    }

    const customizationPayload = {
      duration,
      ratio,
      style,
      language,
      voice,
      camera,
    };

    const optimizeRequestBody = {
      story: cleanStory,
      analysis: parsedAnalysis,
      requestedDurationSeconds: duration,
      language,
    };

    console.log(
      '[CUSTOMIZE STORY] sending customization:',
      customizationPayload,
    );

    console.log(
      '[CUSTOMIZE STORY] optimizing storyboard:',
      optimizeRequestBody,
    );

    setIsOptimizing(true);

    try {
      const response =
        await fetch(
          `${API_BASE_URL}/story/optimize`,
          {
            method: 'POST',
            headers: {
              'Content-Type':
                'application/json',
            },
            body: JSON.stringify(
              optimizeRequestBody,
            ),
          },
        );

      const data =
        (await response.json()) as {
          success?: boolean;
          version?: number;
          title?: string;
          summary?: string;
          requestedDurationSeconds?:
            | 15
            | 30
            | 60;
          characters?: unknown[];
          storyBeats?: unknown[];
          scenes?: unknown[];
          error?: string;
        };

      console.log(
        '[CUSTOMIZE STORY] optimizer response:',
        data,
      );

      if (
        !response.ok ||
        !data.success ||
        !Array.isArray(data.storyBeats) ||
        data.storyBeats.length === 0
      ) {
        throw new Error(
          data.error ||
            'Unable to optimize the storyboard.',
        );
      }

      const optimizedAnalysis = {
        version: 1 as const,
        title:
          data.title ||
          'Untitled Story',
        summary:
          data.summary ||
          cleanStory,
        requestedDurationSeconds:
          duration,
        characters:
          Array.isArray(data.characters)
            ? data.characters
            : [],
        storyBeats:
          data.storyBeats,
      };

      console.log(
        '[CUSTOMIZE STORY] optimized storyboard:',
        optimizedAnalysis,
      );

      router.replace({
        pathname: '/ai-preview',
        params: {
          story: cleanStory,
          analysis:
            JSON.stringify(
              optimizedAnalysis,
            ),
          config:
            JSON.stringify(
              customizationPayload,
            ),
          customization:
            JSON.stringify(
              customizationPayload,
            ),
        },
      });
    } catch (error) {
      console.error(
        '[CUSTOMIZE STORY] storyboard optimization error:',
        error,
      );

      Alert.alert(
        'Unable to Prepare Storyboard',
        error instanceof Error
          ? error.message
          : 'Something went wrong while preparing your storyboard. Please try again.',
      );
    } finally {
      setIsOptimizing(false);
    }
  }, [
    analysis,
    camera,
    duration,
    isOptimizing,
    language,
    ratio,
    router,
    story,
    style,
    voice,
  ]);

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
        {/* ======================================================
            HEADER — SAME COMPACT REFERENCE SYSTEM
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
            onPress={goBack}
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
              <Text style={styles.headerTitleAccent}>
                Video
              </Text>
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

        {/* ======================================================
            MAIN SCROLL
        ====================================================== */}

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingHorizontal: horizontalPadding,
              paddingBottom: 102 * scale,
            },
          ]}
        >
          {/* ====================================================
              INTRO
          ==================================================== */}

          <View style={styles.introSection}>
            <View style={styles.introIconBox}>
              <Ionicons
                name="document-text-outline"
                size={32}
                color={COLORS.cyan}
              />
              <Text style={styles.introSparkOne}>✦</Text>
              <Text style={styles.introSparkTwo}>✦</Text>
            </View>

            <View style={styles.introCopy}>
              <Text
                style={styles.introTitle}
                numberOfLines={2}
              >
                Customize Your Video
              </Text>

              <Text style={styles.introDescription}>
                Set your preferences and customize
              </Text>

              <Text style={styles.introDescription}>
                how you want your video.
              </Text>
            </View>

            <View style={styles.introHeroWrap}>
              <Image
                source={ASSETS.introHero}
                resizeMode="contain"
                style={styles.introHeroImage}
              />
            </View>
          </View>

          {/* ====================================================
              VIDEO DURATION
          ==================================================== */}

          <SectionCard>
            <SectionHeading title="Video Duration" />

            <View style={styles.threeOptionRow}>
              {[15, 30, 60].map((value) => {
                const selected = duration === value;

                return (
                  <ChoiceButton
                    key={value}
                    label={`${value} sec`}
                    selected={selected}
                    onPress={() =>
                      setDuration(value as Duration)
                    }
                  />
                );
              })}
            </View>

            <View style={styles.recommendRow}>
              <Text style={styles.recommendSpark}>✦</Text>
              <Text style={styles.recommendText}>
                Recommended: 30 sec for your story
              </Text>
            </View>
          </SectionCard>

          {/* ====================================================
              ASPECT RATIO
          ==================================================== */}

          <SectionCard>
            <SectionHeading title="Aspect Ratio" />

            <View style={styles.threeOptionRow}>
              <RatioButton
                icon="phone-portrait-outline"
                value="9:16"
                label="Portrait"
                selected={ratio === '9:16'}
                onPress={() => setRatio('9:16')}
              />

              <RatioButton
                icon="phone-landscape-outline"
                value="16:9"
                label="Landscape"
                selected={ratio === '16:9'}
                onPress={() => setRatio('16:9')}
              />

              <RatioButton
                icon="square-outline"
                value="1:1"
                label="Square"
                selected={ratio === '1:1'}
                onPress={() => setRatio('1:1')}
              />
            </View>
          </SectionCard>

          {/* ====================================================
              VIDEO STYLE
          ==================================================== */}

          <SectionCard style={styles.styleCard}>
            <View style={styles.sectionTopRow}>
              <SectionHeading title="Video Style" compact />

              <View style={styles.autoBadge}>
                <Text style={styles.autoSpark}>✦</Text>
                <Text style={styles.autoText}>Auto</Text>
              </View>
            </View>

            <View style={styles.styleRow}>
              {STYLE_OPTIONS.map((item) => {
                const selected = style === item.id;

                return (
                  <Pressable
                    key={item.id}
                    onPress={() => setStyle(item.id)}
                    style={({ pressed }) => [
                      styles.styleItem,
                      pressed && styles.pressed,
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={item.label}
                  >
                    <View
                      style={[
                        styles.styleImageWrap,
                        selected &&
                          styles.styleImageWrapSelected,
                      ]}
                    >
                      <Image
                        source={item.image}
                        resizeMode="cover"
                        style={styles.styleImage}
                      />

                      {selected && (
                        <View style={styles.styleSelectedCorner}>
                          <Ionicons
                            name="checkmark"
                            size={12}
                            color={COLORS.black}
                          />
                        </View>
                      )}
                    </View>

                    <Text
                      style={[
                        styles.styleLabel,
                        selected &&
                          styles.styleLabelSelected,
                      ]}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      minimumFontScale={0.65}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </SectionCard>

          {/* ====================================================
              LANGUAGE
          ==================================================== */}

          <SectionCard style={styles.languageCard}>
            <SectionHeading title="Language" compact />

            <Pressable
              onPress={() => setShowLanguageDropdown(true)}
              style={({ pressed }) => [
                styles.languageSelector,
                pressed && styles.pressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Select language, current language ${language}`}
            >
              <View style={styles.languageSelectorLeft}>
                <View style={styles.languageIconCircle}>
                  <Ionicons
                    name="globe-outline"
                    size={18}
                    color={COLORS.cyan}
                  />
                </View>

                <View style={styles.languageTextWrap}>
                  <Text
                    style={styles.languageSelectedText}
                    numberOfLines={1}
                  >
                    {language}
                  </Text>

                  <Text
                    style={styles.languageSubtext}
                    numberOfLines={1}
                  >
                    Voiceover & captions
                  </Text>
                </View>
              </View>

              <Ionicons
                name="chevron-down"
                size={20}
                color={COLORS.textSecondary}
              />
            </Pressable>

            <Text style={styles.languageHelper}>
              Select the language for your video's voiceover and captions.
            </Text>
          </SectionCard>

          {/* ====================================================
              VOICE
          ==================================================== */}

          <SectionCard style={styles.compactSectionCard}>
            <View style={styles.voiceHeadingRow}>
              <SectionHeading title="Voice" compact />

              <Text style={styles.voiceHelper}>
                AI will choose best voice for each character
              </Text>
            </View>

            <View style={styles.fourOptionRow}>
              <VoiceButton
                icon="pulse-outline"
                label="AI Auto"
                selected={voice === 'auto'}
                color={COLORS.cyan}
                onPress={() => setVoice('auto')}
              />

              <VoiceButton
                icon="person-outline"
                label="Male"
                selected={voice === 'male'}
                color={COLORS.purple}
                onPress={() => setVoice('male')}
              />

              <VoiceButton
                icon="mic-outline"
                label="Female"
                selected={voice === 'female'}
                color={COLORS.purple}
                onPress={() => setVoice('female')}
              />

              <VoiceButton
                icon="mic-off-outline"
                label="No Voice"
                selected={voice === 'none'}
                color={COLORS.purple}
                onPress={() => setVoice('none')}
              />
            </View>
          </SectionCard>

          {/* ====================================================
              CAMERA
          ==================================================== */}

          <SectionCard style={styles.compactSectionCard}>
            <View style={styles.sectionTopRow}>
              <SectionHeading title="Camera" compact />

              <View style={styles.autoBadge}>
                <Text style={styles.autoSpark}>✦</Text>
                <Text style={styles.autoText}>Auto</Text>
              </View>
            </View>

            <View style={styles.cameraRow}>
              <CameraButton
                icon="camera-outline"
                label="Auto"
                selected={camera === 'auto'}
                onPress={() => setCamera('auto')}
              />

              <CameraButton
                icon="videocam-outline"
                label="Cinematic"
                selected={camera === 'cinematic'}
                onPress={() => setCamera('cinematic')}
              />

              <CameraButton
                icon="scan-outline"
                label="Close-up"
                selected={camera === 'close-up'}
                onPress={() => setCamera('close-up')}
              />

              <CameraButton
                icon="expand-outline"
                label="Wide"
                selected={camera === 'wide'}
                onPress={() => setCamera('wide')}
              />

              <CameraButton
                icon="play-circle-outline"
                label="Dynamic"
                selected={camera === 'dynamic'}
                onPress={() => setCamera('dynamic')}
              />
            </View>
          </SectionCard>
        </ScrollView>

        {/* ======================================================
            FIXED CONTINUE
        ====================================================== */}

        <View style={styles.fixedBottom}>
          <Pressable
            onPress={() => {
              void handleContinue();
            }}
            disabled={isOptimizing}
            style={({ pressed }) => [
              styles.continueButton,
              isOptimizing &&
                styles.continueDisabled,
              pressed && styles.continuePressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Continue"
          >
            <LinearGradient
              colors={['#00CFFF', '#2C75FF', '#8C2EFF']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.continueGradient}
            >
              {isOptimizing ? (
                <>
                  <ActivityIndicator
                    size="small"
                    color={COLORS.white}
                  />

                  <Text style={styles.continueText}>
                    Preparing Story...
                  </Text>
                </>
              ) : (
                <>
                  <Text style={styles.continueText}>
                    Continue
                  </Text>

                  <Ionicons
                    name="arrow-forward"
                    size={29}
                    color={COLORS.white}
                  />
                </>
              )}
            </LinearGradient>
          </Pressable>
        </View>

        <Modal
          visible={showLanguageDropdown}
          transparent
          animationType="fade"
          statusBarTranslucent
          onRequestClose={() => setShowLanguageDropdown(false)}
        >
          <View style={styles.languageModalOverlay}>
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={() => setShowLanguageDropdown(false)}
              accessibilityLabel="Close language selector"
            />

            <View style={styles.languageModal}>
              <View style={styles.languageModalHeader}>
                <View>
                  <Text style={styles.languageModalTitle}>
                    Select Language
                  </Text>
                  <Text style={styles.languageModalSubtitle}>
                    Voiceover & captions
                  </Text>
                </View>

                <Pressable
                  onPress={() => setShowLanguageDropdown(false)}
                  hitSlop={8}
                  style={({ pressed }) => [
                    styles.languageModalClose,
                    pressed && styles.pressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Close language selector"
                >
                  <Ionicons
                    name="close"
                    size={20}
                    color={COLORS.textSecondary}
                  />
                </Pressable>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                style={styles.languageOptionsScroll}
                contentContainerStyle={styles.languageOptionsContent}
              >
                {LANGUAGE_OPTIONS.map((item) => {
                  const selected = language === item.label;

                  return (
                    <Pressable
                      key={item.label}
                      onPress={() => {
                        setLanguage(item.label);
                        setShowLanguageDropdown(false);
                      }}
                      style={({ pressed }) => [
                        styles.languageOption,
                        selected && styles.languageOptionSelected,
                        pressed && styles.pressed,
                      ]}
                      accessibilityRole="radio"
                      accessibilityState={{ selected }}
                      accessibilityLabel={`Select ${item.label}`}
                    >
                      <View style={styles.languageOptionIcon}>
                        <Ionicons
                          name="globe-outline"
                          size={18}
                          color={
                            selected
                              ? COLORS.cyan
                              : COLORS.textSecondary
                          }
                        />
                      </View>

                      <View style={styles.languageOptionCopy}>
                        <Text
                          style={[
                            styles.languageOptionTitle,
                            selected &&
                              styles.languageOptionTitleSelected,
                          ]}
                        >
                          {item.label}
                        </Text>
                        <Text style={styles.languageOptionSubtitle}>
                          {item.subtitle}
                        </Text>
                      </View>

                      {selected && (
                        <View style={styles.languageCheck}>
                          <Ionicons
                            name="checkmark"
                            size={17}
                            color={COLORS.black}
                          />
                        </View>
                      )}
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        </Modal>


      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ==============================================================
   SECTION COMPONENTS
============================================================== */

function SectionCard({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: any;
}) {
  return (
    <View style={[styles.sectionCard, style]}>
      {children}
    </View>
  );
}

function SectionHeading({
  title,
  compact = false,
}: {
  title: string;
  compact?: boolean;
}) {
  return (
    <View style={styles.sectionHeadingRow}>
      <Text
        style={[
          styles.sectionTitle,
          compact && styles.sectionTitleCompact,
        ]}
      >
        {title}
      </Text>

      <Text style={styles.headingSpark}>✦</Text>
    </View>
  );
}

function ChoiceButton({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.choiceButton,
        selected && styles.choiceButtonSelected,
        pressed && styles.pressed,
      ]}
    >
      <Text
        style={[
          styles.choiceText,
          selected && styles.choiceTextSelected,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function RatioButton({
  icon,
  value,
  label,
  selected,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.ratioButton,
        selected && styles.ratioButtonSelected,
        pressed && styles.pressed,
      ]}
    >
      <Ionicons
        name={icon}
        size={22}
        color={COLORS.cyan}
      />

      <Text style={styles.ratioValue}>{value}</Text>

      <Text style={styles.ratioLabel}>{label}</Text>
    </Pressable>
  );
}

function VoiceButton({
  icon,
  label,
  selected,
  color,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  selected: boolean;
  color: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.voiceButton,
        selected && styles.voiceButtonSelected,
        pressed && styles.pressed,
      ]}
    >
      <Ionicons
        name={icon}
        size={19}
        color={selected ? COLORS.cyan : color}
      />

      <Text
        style={[
          styles.voiceButtonText,
          selected && styles.voiceButtonTextSelected,
        ]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.65}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function CameraButton({
  icon,
  label,
  selected,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.cameraButton,
        selected && styles.cameraButtonSelected,
        pressed && styles.pressed,
      ]}
    >
      <Ionicons
        name={icon}
        size={17}
        color={selected ? COLORS.cyan : COLORS.textSecondary}
      />

      <Text
        style={[
          styles.cameraText,
          selected && styles.cameraTextSelected,
        ]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.6}
      >
        {label}
      </Text>
    </Pressable>
  );
}

/* ==============================================================
   STYLES — REFERENCE SIZING
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
     MAIN SCROLL
  ============================================================ */

  scrollContent: {
    paddingTop: 11,
    gap: 7,
  },

  /* ============================================================
     INTRO
  ============================================================ */

  introSection: {
    minHeight: 112,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    backgroundColor: COLORS.card,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },

  introIconBox: {
    width: 52,
    height: 82,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    position: 'relative',
  },

  introSparkOne: {
    position: 'absolute',
    top: 5,
    left: 2,
    color: COLORS.cyan,
    fontSize: 13,
  },

  introSparkTwo: {
    position: 'absolute',
    right: 3,
    bottom: 7,
    color: COLORS.cyan,
    fontSize: 12,
  },

  introCopy: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 6,
    paddingRight: 8,
  },

  introTitle: {
    color: COLORS.white,
    fontSize: 18,
    lineHeight: 21,
    fontWeight: '800',
    marginBottom: 6,
    includeFontPadding: false,
  },

  introDescription: {
    color: COLORS.textSecondary,
    fontSize: 11,
    lineHeight: 16,
    includeFontPadding: false,
  },

  introHeroWrap: {
    width: 155,
    height: 98,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: -1,
  },

  introHeroImage: {
    width: 155,
    height: 98,
  },

  /* ============================================================
     SECTION CARD
  ============================================================ */

  sectionCard: {
    width: '100%',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    backgroundColor: COLORS.card,
    padding: 10,
  },

  compactSectionCard: {
    paddingVertical: 8,
  },

  sectionTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  sectionHeadingWithOptional: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  sectionTitle: {
    color: COLORS.white,
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '800',
  },

  sectionTitleCompact: {
    fontSize: 14,
    lineHeight: 18,
  },

  headingSpark: {
    color: COLORS.cyan,
    fontSize: 16,
    marginLeft: 6,
  },

  optionalText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginLeft: 5,
  },

  autoBadge: {
    height: 29,
    minWidth: 64,
    borderRadius: 14,
    backgroundColor: '#052B34',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },

  autoSpark: {
    color: COLORS.cyan,
    fontSize: 15,
    marginRight: 4,
  },

  autoText: {
    color: COLORS.cyan,
    fontSize: 10,
    fontWeight: '600',
  },

  /* ============================================================
     DURATION
  ============================================================ */

  threeOptionRow: {
    width: '100%',
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },

  choiceButton: {
    flex: 1,
    height: 41,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#03131B',
    alignItems: 'center',
    justifyContent: 'center',
  },

  choiceButtonSelected: {
    borderColor: COLORS.cyan,
    backgroundColor: COLORS.selectedDark,
  },

  choiceText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '500',
  },

  choiceTextSelected: {
    color: COLORS.white,
  },

  recommendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },

  recommendSpark: {
    color: COLORS.cyan,
    fontSize: 17,
    marginRight: 6,
  },

  recommendText: {
    color: COLORS.cyan,
    fontSize: 10.5,
    fontWeight: '500',
  },

  /* ============================================================
     RATIO
  ============================================================ */

  ratioButton: {
    flex: 1,
    minHeight: 86,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#03131B',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
  },

  ratioButtonSelected: {
    borderColor: COLORS.cyan,
    backgroundColor: COLORS.selectedDark,
  },

  ratioValue: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },

  ratioLabel: {
    color: COLORS.textSecondary,
    fontSize: 10.5,
    marginTop: 2,
  },

  /* ============================================================
     VIDEO STYLE
  ============================================================ */

  styleCard: {
    paddingBottom: 9,
  },

  /* ============================================================
     LANGUAGE
     ============================================================ */

  languageCard: {
    paddingBottom: 10,
  },

  languageSelector: {
    minHeight: 54,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#03131B',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginTop: 9,
  },

  languageSelectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
    flex: 1,
  },

  languageIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#072833',
    borderWidth: 1,
    borderColor: '#124555',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  languageTextWrap: {
    flex: 1,
    minWidth: 0,
    marginLeft: 9,
  },

  languageSelectedText: {
    color: COLORS.white,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },

  languageSubtext: {
    color: COLORS.textMuted,
    fontSize: 9,
    lineHeight: 12,
    marginTop: 1,
  },

  languageHelper: {
    color: COLORS.textSecondary,
    fontSize: 9.5,
    lineHeight: 14,
    marginTop: 6,
  },

  languageModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },

  languageModal: {
    width: '100%',
    maxWidth: 520,
    maxHeight: '78%',
    borderRadius: 22,
    borderWidth: 1.2,
    borderColor: COLORS.borderBright,
    backgroundColor: '#020B16',
    paddingHorizontal: 14,
    paddingTop: 15,
    paddingBottom: 12,
    shadowColor: COLORS.cyan,
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 18,
  },

  languageModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 3,
    marginBottom: 8,
  },

  languageModalTitle: {
    color: COLORS.white,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '700',
  },

  languageModalSubtitle: {
    color: COLORS.textMuted,
    fontSize: 10,
    lineHeight: 14,
    marginTop: 2,
  },

  languageModalClose: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#061522',
    alignItems: 'center',
    justifyContent: 'center',
  },

  languageOptionsScroll: {
    maxHeight: 470,
  },

  languageOptionsContent: {
    paddingTop: 2,
    paddingBottom: 2,
    gap: 7,
  },

  languageOption: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#03131B',
    borderRadius: 11,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
  },

  languageOptionSelected: {
    borderColor: COLORS.cyan,
    backgroundColor: COLORS.selectedDark,
  },

  languageOptionIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#072833',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  languageOptionCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 9,
  },

  languageOptionTitle: {
    color: COLORS.white,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  },

  languageOptionTitleSelected: {
    color: COLORS.cyan,
    fontWeight: '600',
  },

  languageOptionSubtitle: {
    color: COLORS.textMuted,
    fontSize: 9,
    lineHeight: 12,
    marginTop: 1,
  },

  languageCheck: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.cyan,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },

  styleRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 9,
  },

  styleItem: {
    width: '18.5%',
    alignItems: 'center',
  },

  styleImageWrap: {
    width: '100%',
    aspectRatio: 1.45,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#0A1820',
    position: 'relative',
  },

  styleImageWrapSelected: {
    borderWidth: 1.5,
    borderColor: COLORS.cyan,
  },

  styleImage: {
    width: '100%',
    height: '100%',
  },

  styleSelectedCorner: {
    position: 'absolute',
    right: 4,
    top: 4,
    width: 17,
    height: 17,
    borderRadius: 9,
    backgroundColor: COLORS.cyan,
    alignItems: 'center',
    justifyContent: 'center',
  },

  styleLabel: {
    color: COLORS.textSecondary,
    fontSize: 8.7,
    lineHeight: 11,
    textAlign: 'center',
    marginTop: 5,
  },

  styleLabelSelected: {
    color: COLORS.white,
    fontWeight: '600',
  },

  /* ============================================================
     VOICE
  ============================================================ */

  voiceHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
  },

  voiceHelper: {
    flex: 1,
    marginLeft: 7,
    color: COLORS.textMuted,
    fontSize: 8.5,
  },

  fourOptionRow: {
    width: '100%',
    flexDirection: 'row',
    gap: 7,
    marginTop: 7,
  },

  voiceButton: {
    flex: 1,
    minWidth: 0,
    height: 42,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#03131B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },

  voiceButtonSelected: {
    borderColor: COLORS.cyan,
    backgroundColor: COLORS.selectedDark,
  },

  voiceButtonText: {
    color: COLORS.white,
    fontSize: 10.5,
    marginLeft: 6,
  },

  voiceButtonTextSelected: {
    color: COLORS.white,
    fontWeight: '500',
  },

  /* ============================================================
     CAMERA
  ============================================================ */

  cameraRow: {
    width: '100%',
    flexDirection: 'row',
    gap: 7,
    marginTop: 7,
  },

  cameraButton: {
    flex: 1,
    minWidth: 0,
    height: 41,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#03131B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },

  cameraButtonSelected: {
    borderColor: COLORS.cyan,
    backgroundColor: COLORS.selectedDark,
  },

  cameraText: {
    color: COLORS.textSecondary,
    fontSize: 8.8,
    marginLeft: 4,
  },

  cameraTextSelected: {
    color: COLORS.white,
  },


































  /* ============================================================
     FIXED CONTINUE
  ============================================================ */

  fixedBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.background,
    paddingHorizontal: 22,
    paddingTop: 6,
    paddingBottom: 7,
  },

  continueButton: {
    width: '100%',
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
  },

  continueGradient: {
    flex: 1,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  continuePressed: {
    opacity: 0.9,
    transform: [{ scale: 0.985 }],
  },

  continueDisabled: {
    opacity: 0.62,
  },

  continueText: {
    color: COLORS.white,
    fontSize: 17,
    lineHeight: 21,
    fontWeight: '500',
    marginRight: 20,
  },
});