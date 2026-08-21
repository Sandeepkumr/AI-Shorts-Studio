import React, { useCallback, useState } from 'react';
import {
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
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
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

  vamika: require('../assets/vamika-character.png'),
  shopkeeper: require('../assets/shopkeeper-character.png'),

  magic: require('../assets/magic-feather.png'),
} as const;

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

const DEFAULT_APPEARANCE =
  'Alex has red hair, fair skin, blue hoodie and white sneakers. The shopkeeper has black hair, beard and wears a black apron.';

export default function CustomizeVideoScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const scale = Math.min(width / 428, 1);
  const horizontalPadding = width <= 375 ? 16 : 22;

  const [duration, setDuration] = useState<Duration>(30);
  const [ratio, setRatio] = useState<Ratio>('9:16');
  const [style, setStyle] = useState<StyleId>('3d');
  const [language, setLanguage] =
    useState<Language>('English (US)');
  const [voice, setVoice] = useState<Voice>('auto');
  const [camera, setCamera] = useState<Camera>('auto');
  const [appearance, setAppearance] =
    useState(DEFAULT_APPEARANCE);

  const [showSaveCharactersModal, setShowSaveCharactersModal] =
    useState(false);

  const [showLanguageDropdown, setShowLanguageDropdown] =
    useState(false);

  const [saveAlex, setSaveAlex] = useState(true);
  const [saveShopkeeper, setSaveShopkeeper] = useState(true);

  const [characterNames, setCharacterNames] = useState({
    '1': 'Alex',
    '2': 'Shopkeeper',
  });

  const goBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  }, [router]);

  const handleContinue = useCallback(() => {
    setShowSaveCharactersModal(true);
  }, []);

  const continueWithoutSaving = useCallback(() => {
    setShowSaveCharactersModal(false);
    router.push('/ai-preview');
  }, [router]);

  const saveCharactersAndContinue = useCallback(() => {
    // The selected character names are already kept in local state.
    // This is the integration point for the real character-library API.
    setShowSaveCharactersModal(false);
    router.push('/ai-preview');
  }, [router]);

  const appendMagicSuggestion = useCallback(() => {
    setAppearance(
      'Alex has red hair, fair skin, blue hoodie and white sneakers. The shopkeeper has black hair, beard and wears a black apron.',
    );
  }, []);

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
              CHARACTERS
          ==================================================== */}

          <SectionCard>
            <View style={styles.sectionTopRow}>
              <SectionHeading title="Characters in Your Story" compact />

              <View style={styles.detectedRow}>
                <Ionicons
                  name="people-outline"
                  size={16}
                  color={COLORS.cyan}
                />
                <Text style={styles.detectedText}>2</Text>
                <Text style={styles.detectedText}>
                  characters detected
                </Text>
              </View>
            </View>

            <CharacterRow
              image={ASSETS.vamika}
              characterNumber="1"
              name={characterNames['1']}
              onNameChange={(name) =>
                setCharacterNames((current) => ({
                  ...current,
                  '1': name,
                }))
              }
            />

            <CharacterRow
              image={ASSETS.shopkeeper}
              characterNumber="2"
              name={characterNames['2']}
              onNameChange={(name) =>
                setCharacterNames((current) => ({
                  ...current,
                  '2': name,
                }))
              }
            />

            <Pressable
              onPress={() =>
                router.push({
                  pathname: '/characters' as any,
                  params: { mode: 'select' },
                })
              }
              style={({ pressed }) => [
                styles.savedCharacterButton,
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.savedCharacterIcon}>
                <Ionicons
                  name="person-outline"
                  size={25}
                  color={COLORS.cyan}
                />
              </View>

              <View style={styles.savedCharacterCopy}>
                <Text style={styles.savedCharacterTitle}>
                  Use Saved Character
                </Text>

                <Text style={styles.savedCharacterSubtitle}>
                  Choose from your character library
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={20}
                color={COLORS.white}
              />
            </Pressable>
          </SectionCard>

          {/* ====================================================
              CHARACTER APPEARANCE
          ==================================================== */}

          <SectionCard>
            <View style={styles.sectionHeadingWithOptional}>
              <Text style={styles.sectionTitle}>
                Character Appearance
              </Text>

              <Text style={styles.optionalText}>
                (Optional)
              </Text>

              <Text style={styles.headingSpark}>✦</Text>
            </View>

            <Text style={styles.helperDescription}>
              Describe how your characters should look.
            </Text>

            <Text style={styles.helperDescription}>
              You can include details like hair color, skin tone,
              clothing, accessories, etc.
            </Text>

            <View style={styles.appearanceInputWrap}>
              <TextInput
                value={appearance}
                onChangeText={setAppearance}
                multiline
                maxLength={1000}
                textAlignVertical="top"
                placeholder="Describe your characters..."
                placeholderTextColor={COLORS.textMuted}
                style={styles.appearanceInput}
              />

              <Pressable
                onPress={appendMagicSuggestion}
                style={({ pressed }) => [
                  styles.magicButton,
                  pressed && styles.pressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Generate appearance suggestion"
              >
                <Image
                  source={ASSETS.magic}
                  resizeMode="contain"
                  style={styles.magicIcon}
                />
              </Pressable>

              <Text style={styles.characterCount}>
                {appearance.length}/1000
              </Text>
            </View>
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
            onPress={handleContinue}
            style={({ pressed }) => [
              styles.continueButton,
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
              <Text style={styles.continueText}>
                Continue
              </Text>

              <Ionicons
                name="arrow-forward"
                size={29}
                color={COLORS.white}
              />
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

        <Modal
          visible={showSaveCharactersModal}
          transparent
          animationType="fade"
          statusBarTranslucent
          onRequestClose={() => setShowSaveCharactersModal(false)}
        >
          <View style={styles.modalOverlay}>
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={() => setShowSaveCharactersModal(false)}
              accessibilityLabel="Close save characters modal"
            />

            <View style={styles.saveModal}>
              <Pressable
                onPress={() => setShowSaveCharactersModal(false)}
                hitSlop={10}
                style={({ pressed }) => [
                  styles.modalCloseButton,
                  pressed && styles.pressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <Ionicons
                  name="close"
                  size={24}
                  color={COLORS.textSecondary}
                />
              </Pressable>

              <View style={styles.modalBookmarkGlow}>
                <View style={styles.modalBookmarkCircle}>
                  <Ionicons
                    name="bookmark"
                    size={25}
                    color={COLORS.purple}
                  />
                </View>

                <Text style={styles.modalSparkLeft}>✦</Text>
                <Text style={styles.modalSparkRight}>✦</Text>
                <Text style={styles.modalSparkTop}>✦</Text>
              </View>

              <Text style={styles.modalTitle}>
                Save Characters?
              </Text>

              <Text style={styles.modalDescription}>
                These new characters are ready.
                {'\n'}
                Save them to your library so you can use them again
                {'\n'}
                in future videos.
              </Text>

              <SaveCharacterRow
                image={ASSETS.vamika}
                name={characterNames['1']}
                description="Red hair, fair skin, blue hoodie and white sneakers."
                selected={saveAlex}
                onToggle={() => setSaveAlex((value) => !value)}
              />

              <SaveCharacterRow
                image={ASSETS.shopkeeper}
                name={characterNames['2']}
                description="Black hair, beard and wears a black apron."
                selected={saveShopkeeper}
                onToggle={() =>
                  setSaveShopkeeper((value) => !value)
                }
              />

              <View style={styles.modalInfoBar}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={23}
                  color={COLORS.cyan}
                />

                <Text style={styles.modalInfoText}>
                  Saved characters will maintain their look across all your
                  videos.
                </Text>
              </View>

              <View style={styles.modalActions}>
                <Pressable
                  onPress={continueWithoutSaving}
                  style={({ pressed }) => [
                    styles.dontSaveButton,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={styles.dontSaveText}>
                    Don’t Save
                  </Text>
                </Pressable>

                <Pressable
                  onPress={saveCharactersAndContinue}
                  style={({ pressed }) => [
                    styles.saveContinueButton,
                    pressed && styles.pressed,
                  ]}
                >
                  <LinearGradient
                    colors={['#00CFFF', '#2C75FF', '#8C2EFF']}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={styles.saveContinueGradient}
                  >
                    <Text style={styles.saveContinueSpark}>✦</Text>

                    <Text style={styles.saveContinueText}>
                      Save & Continue
                    </Text>

                    <Text style={styles.saveContinueSpark}>✦</Text>
                  </LinearGradient>
                </Pressable>
              </View>

              <View style={styles.modalFooter}>
                <Ionicons
                  name="lock-closed-outline"
                  size={14}
                  color={COLORS.textMuted}
                />

                <Text style={styles.modalFooterText}>
                  You can manage your saved characters in
                  {'\n'}
                  My Characters anytime.
                </Text>
              </View>
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

function CharacterRow({
  image,
  characterNumber,
  name,
  onNameChange,
}: {
  image: any;
  characterNumber: string;
  name: string;
  onNameChange: (name: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(name);

  const startEditing = () => {
    setDraftName(name);
    setEditing(true);
  };

  const saveName = () => {
    const trimmed = draftName.trim();

    if (trimmed.length > 0) {
      onNameChange(trimmed);
      setDraftName(trimmed);
    } else {
      setDraftName(name);
    }

    setEditing(false);
  };

  return (
    <View style={styles.characterRow}>
      <Image
        source={image}
        resizeMode="cover"
        style={styles.characterThumb}
      />

      <View style={styles.characterRowCopy}>
        <Text style={styles.characterRowNumber}>
          Character {characterNumber}
        </Text>

        {editing ? (
          <TextInput
            value={draftName}
            onChangeText={setDraftName}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={saveName}
            onBlur={saveName}
            selectTextOnFocus
            maxLength={40}
            style={styles.characterNameInput}
            placeholder="Enter character name"
            placeholderTextColor={COLORS.textMuted}
          />
        ) : (
          <Text
            style={styles.characterRowName}
            numberOfLines={1}
          >
            {name}
          </Text>
        )}
      </View>

      <Pressable
        onPress={editing ? saveName : startEditing}
        style={({ pressed }) => [
          styles.characterEditButton,
          pressed && styles.pressed,
        ]}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={
          editing
            ? `Save character ${characterNumber} name`
            : `Edit character ${characterNumber} name`
        }
      >
        <Ionicons
          name={editing ? 'checkmark-outline' : 'pencil-outline'}
          size={20}
          color={COLORS.cyan}
        />
      </Pressable>
    </View>
  );
}

function SaveCharacterRow({
  image,
  name,
  description,
  selected,
  onToggle,
}: {
  image: any;
  name: string;
  description: string;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <View style={styles.modalCharacterRow}>
      <View style={styles.modalCharacterImageWrap}>
        <Image
          source={image}
          resizeMode="cover"
          style={styles.modalCharacterImage}
        />
      </View>

      <View style={styles.modalCharacterCopy}>
        <Text
          style={styles.modalCharacterName}
          numberOfLines={1}
        >
          {name}
        </Text>

        <View style={styles.modalNewBadge}>
          <Text style={styles.modalNewBadgeText}>
            New Character
          </Text>
        </View>

        <Text
          style={styles.modalCharacterDescription}
          numberOfLines={2}
        >
          {description}
        </Text>
      </View>

      <Pressable
        onPress={onToggle}
        style={({ pressed }) => [
          styles.modalCheckButton,
          selected
            ? styles.modalCheckButtonSelected
            : styles.modalCheckButtonUnselected,
          pressed && styles.pressed,
        ]}
        hitSlop={6}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: selected }}
        accessibilityLabel={`Save ${name}`}
      >
        {selected && (
          <Ionicons
            name="checkmark"
            size={27}
            color={COLORS.black}
          />
        )}
      </Pressable>
    </View>
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
     CHARACTERS
  ============================================================ */

  detectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  detectedText: {
    color: COLORS.textMuted,
    fontSize: 9.5,
  },

  characterRow: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.cardSoft,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    marginTop: 7,
  },

  characterThumb: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0A1820',
  },

  characterRowCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 8,
  },

  characterRowNumber: {
    color: COLORS.textSecondary,
    fontSize: 9.5,
    lineHeight: 12,
  },

  characterRowName: {
    color: COLORS.white,
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '500',
    marginTop: 1,
  },

  characterNameInput: {
    color: COLORS.white,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    marginTop: 1,
    paddingVertical: 0,
    paddingHorizontal: 0,
    minHeight: 20,
  },

  characterEditButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },

  savedCharacterButton: {
    minHeight: 49,
    borderWidth: 1,
    borderColor: COLORS.borderBright,
    borderStyle: 'dashed',
    borderRadius: 10,
    backgroundColor: '#03131B',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginTop: 7,
  },

  savedCharacterIcon: {
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },

  savedCharacterCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 5,
  },

  savedCharacterTitle: {
    color: COLORS.cyan,
    fontSize: 11.5,
    lineHeight: 15,
    fontWeight: '600',
  },

  savedCharacterSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 9.5,
    lineHeight: 13,
    marginTop: 2,
  },

  /* ============================================================
     APPEARANCE
  ============================================================ */

  helperDescription: {
    color: COLORS.textSecondary,
    fontSize: 10.5,
    lineHeight: 16,
    marginTop: 5,
  },

  appearanceInputWrap: {
    minHeight: 120,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#03131B',
    borderRadius: 9,
    marginTop: 8,
    overflow: 'hidden',
    position: 'relative',
  },

  appearanceInput: {
    minHeight: 118,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 28,
    paddingRight: 58,
    color: COLORS.textSecondary,
    fontSize: 11.5,
    lineHeight: 18,
  },

  magicButton: {
    position: 'absolute',
    right: 9,
    bottom: 8,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#201342',
    alignItems: 'center',
    justifyContent: 'center',
  },

  magicIcon: {
    width: 30,
    height: 30,
  },

  characterCount: {
    position: 'absolute',
    left: 11,
    bottom: 8,
    color: COLORS.cyan,
    fontSize: 9,
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
     SAVE CHARACTERS MODAL
  ============================================================ */

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.76)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },

  saveModal: {
    width: '100%',
    maxWidth: 620,
    maxHeight: '89%',
    borderRadius: 26,
    borderWidth: 1.4,
    borderColor: '#293A8A',
    backgroundColor: '#020B16',
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 18,
    alignItems: 'stretch',
    shadowColor: '#6A2CFF',
    shadowOpacity: 0.28,
    shadowRadius: 32,
    elevation: 20,
  },

  modalCloseButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 16,
    borderWidth: 1.1,
    borderColor: COLORS.border,
    backgroundColor: '#061522',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },

  modalBookmarkGlow: {
    width: 92,
    height: 86,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 3,
  },

  modalBookmarkCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1.2,
    borderColor: '#6638BB',
    backgroundColor: '#18103B',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.purple,
    shadowOpacity: 0.7,
    shadowRadius: 20,
    elevation: 10,
  },

  modalSparkLeft: {
    position: 'absolute',
    left: 0,
    top: 28,
    color: COLORS.cyan,
    fontSize: 21,
  },

  modalSparkRight: {
    position: 'absolute',
    right: 0,
    top: 25,
    color: COLORS.purple,
    fontSize: 20,
  },

  modalSparkTop: {
    position: 'absolute',
    right: 21,
    top: 3,
    color: '#7656FF',
    fontSize: 15,
  },

  modalTitle: {
    color: COLORS.white,
    textAlign: 'center',
    fontSize: 24,
    lineHeight: 29,
    fontWeight: '700',
    marginTop: 4,
  },

  modalDescription: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 10,
    marginBottom: 16,
  },

  modalCharacterRow: {
    minHeight: 109,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 15,
    backgroundColor: '#03131D',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginBottom: 10,
  },

  modalCharacterImageWrap: {
    width: 92,
    height: 92,
    borderRadius: 18,
    borderWidth: 1.1,
    borderColor: '#0E5C71',
    backgroundColor: '#071A23',
    overflow: 'hidden',
    flexShrink: 0,
  },

  modalCharacterImage: {
    width: '100%',
    height: '100%',
  },

  modalCharacterCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 12,
    paddingRight: 7,
  },

  modalCharacterName: {
    color: COLORS.white,
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '700',
  },

  modalNewBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#281440',
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 5,
    marginTop: 5,
  },

  modalNewBadgeText: {
    color: COLORS.purple,
    fontSize: 10.5,
    lineHeight: 13,
    fontWeight: '600',
  },

  modalCharacterDescription: {
    color: COLORS.textSecondary,
    fontSize: 11.5,
    lineHeight: 17,
    marginTop: 7,
  },

  modalCheckButton: {
    width: 51,
    height: 51,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  modalCheckButtonSelected: {
    backgroundColor: COLORS.cyan,
    borderWidth: 1,
    borderColor: '#067A92',
    shadowColor: COLORS.cyan,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },

  modalCheckButtonUnselected: {
    backgroundColor: '#04131C',
    borderWidth: 1.4,
    borderColor: '#244558',
  },

  modalInfoBar: {
    minHeight: 58,
    borderWidth: 1,
    borderColor: '#0A5262',
    borderRadius: 14,
    backgroundColor: '#041D27',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginTop: 1,
  },

  modalInfoText: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: 11.5,
    lineHeight: 17,
    marginLeft: 9,
  },

  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },

  dontSaveButton: {
    flex: 1,
    height: 57,
    borderRadius: 15,
    borderWidth: 1.3,
    borderColor: '#53657E',
    backgroundColor: '#030E18',
    alignItems: 'center',
    justifyContent: 'center',
  },

  dontSaveText: {
    color: COLORS.white,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
  },

  saveContinueButton: {
    flex: 1,
    height: 57,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: COLORS.cyan,
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },

  saveContinueGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },

  saveContinueText: {
    color: COLORS.white,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    marginHorizontal: 9,
  },

  saveContinueSpark: {
    color: '#B8D8FF',
    fontSize: 15,
  },

  modalFooter: {
    minHeight: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },

  modalFooterText: {
    color: COLORS.textMuted,
    fontSize: 10.5,
    lineHeight: 15,
    textAlign: 'center',
    marginLeft: 6,
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

  continueText: {
    color: COLORS.white,
    fontSize: 17,
    lineHeight: 21,
    fontWeight: '500',
    marginRight: 20,
  },
});