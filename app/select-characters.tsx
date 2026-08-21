import React, { useCallback, useState } from 'react';
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
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

type CharacterRole = 'main' | 'supporting';

type CharacterOption = {
  id: string;
  name: string;
  role: CharacterRole;
  helperType: 'uploaded' | 'ai';
  helperText: string;
  option1: any;
  option2: any;
  selected: 1 | 2;
};

const COLORS = {
  background: '#020A12',
  card: '#04121A',

  cyan: '#00E5F5',
  cyanDark: '#008894',

  purple: '#C35CFF',

  white: '#FFFFFF',
  black: '#001015',

  textSecondary: '#C6D0D8',
  textMuted: '#8C99A4',
  muted: '#8C99A4',

  border: '#183B4A',
  divider: '#213844',

  selectionDark: '#071820',
  purpleDark: '#211333',
};

const ASSETS = {
  coin: require('../assets/coin.png'),
  hero: require('../assets/character-setup-hero.png'),

  vamikaOption1: require('../assets/vamika-option-1.png'),
  vamikaOption2: require('../assets/vamika-option-2.png'),

  shopkeeperOption1: require('../assets/shopkeeper-option-1.png'),
  shopkeeperOption2: require('../assets/shopkeeper-option-2.png'),
};

const INITIAL_CHARACTERS: CharacterOption[] = [
  {
    id: 'vamika',
    name: 'Vamika',
    role: 'main',
    helperType: 'uploaded',
    helperText:
      "We've enhanced your image while keeping her identity and appearance the same.",
    option1: ASSETS.vamikaOption1,
    option2: ASSETS.vamikaOption2,
    selected: 1,
  },
  {
    id: 'shopkeeper',
    name: 'Shopkeeper',
    role: 'supporting',
    helperType: 'ai',
    helperText:
      'We generated these options based on your story and context.',
    option1: ASSETS.shopkeeperOption1,
    option2: ASSETS.shopkeeperOption2,
    selected: 2,
  },
];

const DESIGN_WIDTH = 428;

export default function SelectCharactersScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const scale = Math.min(width / DESIGN_WIDTH, 1);

  const [characters, setCharacters] = useState<CharacterOption[]>(
    INITIAL_CHARACTERS,
  );

  const selectOption = useCallback(
    (characterId: string, option: 1 | 2) => {
      setCharacters((current) =>
        current.map((character) =>
          character.id === characterId
            ? {
                ...character,
                selected: option,
              }
            : character,
        ),
      );
    },
    [],
  );

  const handleContinue = useCallback(() => {
    router.push('/view-scenes');
  }, [router]);

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
              paddingHorizontal: width <= 375 ? 16 : 22,
            },
          ]}
        >
          <Pressable
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/');
              }
            }}
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

        {/* ======================================================
            CONTENT
        ====================================================== */}

        <View
          style={[
            styles.content,
            {
              paddingHorizontal: width <= 375 ? 16 : 22,
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
                  Choose Your Characters
                </Text>

                <Text style={styles.heroSpark}>✦</Text>
              </View>

              <Text style={styles.heroDescription}>
                We created 2 options for each character.
              </Text>

              <Text style={styles.heroDescription}>
                Select the version you like best for your video.
              </Text>
            </View>

            <Image
              source={ASSETS.hero}
              resizeMode="contain"
              style={styles.heroImage}
            />
          </View>

          {/* ====================================================
              CHARACTER CARDS
              ONLY THIS AREA SCROLLS
          ==================================================== */}

          <View style={styles.characterArea}>
            <ScrollView
              style={styles.characterScroll}
              contentContainerStyle={styles.characterScrollContent}
              showsVerticalScrollIndicator
              scrollEnabled
              bounces
              alwaysBounceVertical
              nestedScrollEnabled
              keyboardShouldPersistTaps="handled"
              directionalLockEnabled
              overScrollMode="always"
            >
              {characters.map((character, index) => (
                <CharacterSelectionCard
                  key={character.id}
                  character={character}
                  index={index}
                  scale={scale}
                  onSelect={selectOption}
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
            <MaterialCommunityIcons
              name="shield-check-outline"
              size={31}
              color={COLORS.cyan}
            />

            <Text style={styles.bottomInfoText}>
              Your selected characters will be used consistently
              across all scenes in your video.
            </Text>

            <View style={styles.bottomSparkles}>
              <Text style={styles.sparkleSmall}>✦</Text>
              <Text style={styles.sparkleLarge}>✦</Text>
            </View>
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
            accessibilityLabel="Continue to Scenes"
          >
            <Text style={styles.continueText}>
              Continue to Scenes
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
   CHARACTER SELECTION CARD
============================================================== */

function CharacterSelectionCard({
  character,
  index,
  scale,
  onSelect,
}: {
  character: CharacterOption;
  index: number;
  scale: number;
  onSelect: (characterId: string, option: 1 | 2) => void;
}) {
  const isMain = character.role === 'main';

  return (
    <View
      style={[
        styles.characterCard,
        {
          borderRadius: 16 * scale,
          padding: 10 * scale,
        },
        isMain
          ? styles.characterCardMain
          : styles.characterCardSupporting,
      ]}
    >
      {/* ======================================================
          LEFT SIDE
      ====================================================== */}

      <View
        style={[
          styles.characterInfo,
          {
            width: 150 * scale,
          },
        ]}
      >
        {/* NUMBER + ROLE */}

        <View style={styles.roleRow}>
          <View
            style={[
              styles.cardNumber,
              {
                width: 31 * scale,
                height: 31 * scale,
                borderRadius: 16 * scale,
              },
              isMain
                ? styles.cardNumberCyan
                : styles.cardNumberPurple,
            ]}
          >
            <Text
              style={[
                styles.cardNumberText,
                {
                  fontSize: 14 * scale,
                },
              ]}
            >
              {index + 1}
            </Text>
          </View>

          <View
            style={[
              styles.roleBadge,
              isMain
                ? styles.roleBadgeMain
                : styles.roleBadgeSupporting,
              {
                paddingHorizontal: 9 * scale,
                paddingVertical: 5 * scale,
                borderRadius: 11 * scale,
              },
            ]}
          >
            <Text
              style={[
                styles.roleText,
                isMain
                  ? styles.roleTextMain
                  : styles.roleTextSupporting,
                {
                  fontSize: 9.5 * scale,
                },
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.72}
            >
              {isMain
                ? 'Main Character'
                : 'Supporting Character'}
            </Text>
          </View>
        </View>

        {/* NAME */}

        <Text
          style={[
            styles.characterName,
            {
              fontSize: 18 * scale,
              lineHeight: 22 * scale,
            },
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.8}
        >
          {character.name}
        </Text>

        {/* DESCRIPTION */}

        {character.helperType === 'uploaded' ? (
          <View style={styles.uploadedDescription}>
            <Text
              style={[
                styles.characterDescription,
                {
                  fontSize: 11 * scale,
                  lineHeight: 17 * scale,
                },
              ]}
            >
              Based on your
            </Text>

            <View style={styles.uploadedLine}>
              <Text
                style={[
                  styles.uploadedImageText,
                  {
                    fontSize: 11 * scale,
                  },
                ]}
              >
                uploaded image
              </Text>

              <MaterialCommunityIcons
                name="cloud-upload-outline"
                size={18 * scale}
                color={COLORS.cyan}
              />
            </View>
          </View>
        ) : (
          <View
            style={[
              styles.aiBadge,
              {
                paddingHorizontal: 9 * scale,
                paddingVertical: 5 * scale,
                borderRadius: 10 * scale,
              },
            ]}
          >
            <Text
              style={[
                styles.aiBadgeText,
                {
                  fontSize: 10.5 * scale,
                },
              ]}
            >
              AI Generated
            </Text>
          </View>
        )}

        {/* HELPER */}

        <View
          style={[
            styles.helperBox,
            {
              borderRadius: 11 * scale,
              padding: 8 * scale,
            },
          ]}
        >
          <View
            style={[
              styles.helperIcon,
              {
                width: 20 * scale,
                height: 20 * scale,
                borderRadius: 10 * scale,
              },
            ]}
          >
            <Text
              style={[
                styles.helperIconText,
                {
                  fontSize: 11 * scale,
                },
              ]}
            >
              i
            </Text>
          </View>

          <Text
            style={[
              styles.helperText,
              {
                fontSize: 9 * scale,
                lineHeight: 13 * scale,
              },
            ]}
          >
            {character.helperText}
          </Text>
        </View>
      </View>

      {/* ======================================================
          DIVIDER
      ====================================================== */}

      <View style={styles.cardDivider} />

      {/* ======================================================
          RIGHT OPTIONS
      ====================================================== */}

      <View style={styles.optionsArea}>
        <Text
          style={[
            styles.chooseHeading,
            {
              fontSize: 12 * scale,
            },
          ]}
        >
          Choose the best version
        </Text>

        <View style={styles.optionsRow}>
          <CharacterOption
            image={character.option1}
            label="Option 1"
            selected={character.selected === 1}
            isMain={isMain}
            scale={scale}
            onPress={() => onSelect(character.id, 1)}
          />

          <CharacterOption
            image={character.option2}
            label="Option 2"
            selected={character.selected === 2}
            isMain={isMain}
            scale={scale}
            onPress={() => onSelect(character.id, 2)}
          />
        </View>

        {/* SELECTED STATUS */}

        <View
          style={[
            styles.selectedBox,
            isMain
              ? styles.selectedBoxCyan
              : styles.selectedBoxPurple,
            {
              height: 40 * scale,
              borderRadius: 10 * scale,
              marginTop: 7 * scale,
            },
          ]}
        >
          <View
            style={[
              styles.selectedCircle,
              isMain
                ? styles.selectedCircleCyan
                : styles.selectedCirclePurple,
              {
                width: 21 * scale,
                height: 21 * scale,
                borderRadius: 11 * scale,
              },
            ]}
          >
            <Ionicons
              name="checkmark"
              size={13 * scale}
              color={isMain ? COLORS.cyan : COLORS.purple}
            />
          </View>

          <Text
            style={[
              styles.selectedText,
              isMain
                ? styles.selectedTextCyan
                : styles.selectedTextPurple,
              {
                fontSize: 10.5 * scale,
              },
            ]}
          >
            Selected: Option {character.selected}
          </Text>
        </View>
      </View>
    </View>
  );
}

/* ==============================================================
   CHARACTER OPTION
============================================================== */

function CharacterOption({
  image,
  label,
  selected,
  isMain,
  scale,
  onPress,
}: {
  image: any;
  label: string;
  selected: boolean;
  isMain: boolean;
  scale: number;
  onPress: () => void;
}) {
  return (
    <View
      style={[
        styles.optionWrapper,
        {
          width: 78 * scale,
        },
      ]}
    >
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.optionImageButton,
          {
            width: 78 * scale,
            height: 102 * scale,
            borderRadius: 12 * scale,
          },
          selected
            ? isMain
              ? styles.optionSelectedCyan
              : styles.optionSelectedPurple
            : styles.optionUnselected,
          pressed && styles.optionPressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel={`${label}, ${
          selected ? 'selected' : 'not selected'
        }`}
      >
        <Image
          source={image}
          resizeMode="cover"
          style={[
            styles.optionImage,
            {
              width: 78 * scale,
              height: 102 * scale,
              borderRadius: 11 * scale,
            },
          ]}
        />

        {selected && (
          <View
            style={[
              styles.optionCheck,
              isMain
                ? styles.optionCheckCyan
                : styles.optionCheckPurple,
              {
                width: 22 * scale,
                height: 22 * scale,
                borderRadius: 11 * scale,
                right: 5 * scale,
                top: 5 * scale,
              },
            ]}
          >
            <Ionicons
              name="checkmark"
              size={13 * scale}
              color={isMain ? COLORS.black : COLORS.white}
            />
          </View>
        )}
      </Pressable>

      <Text
        style={[
          styles.optionLabel,
          selected &&
            (isMain
              ? styles.optionLabelSelectedCyan
              : styles.optionLabelSelectedPurple),
          {
            fontSize: 10.5 * scale,
          },
        ]}
      >
        {label}
      </Text>
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
  /* ============================================================
     SCREEN
  ============================================================ */

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
    color: '#93A6B2',
    fontSize: 12,
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
    fontSize: 8.3,
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

  heroImage: {
    width: 145,
    height: 100,
    marginRight: -4,
  },

  /* ============================================================
     CHARACTER AREA
     ONLY THIS AREA SCROLLS
  ============================================================ */

  characterArea: {
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
  },

  characterScroll: {
    flex: 1,
  },

  characterScrollContent: {
    paddingTop: 2,
    paddingBottom: 10,
  },

  /* ============================================================
     CHARACTER CARD
  ============================================================ */

  characterCard: {
    width: '100%',
    minHeight: 225,
    borderWidth: 1,
    backgroundColor: COLORS.card,
    flexDirection: 'row',
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 10,
  },

  characterCardMain: {
    borderColor: COLORS.cyan,
  },

  characterCardSupporting: {
    borderColor: COLORS.purple,
  },

  characterInfo: {
    minWidth: 0,
  },

  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 31,
  },

  cardNumber: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    flexShrink: 0,
  },

  cardNumberCyan: {
    backgroundColor: COLORS.cyan,
  },

  cardNumberPurple: {
    backgroundColor: COLORS.purple,
  },

  cardNumberText: {
    color: COLORS.black,
    fontWeight: '800',
  },

  roleBadge: {
    alignSelf: 'flex-start',
    maxWidth: '100%',
  },

  roleBadgeMain: {
    backgroundColor: '#062B34',
  },

  roleBadgeSupporting: {
    backgroundColor: '#26153D',
  },

  roleText: {
    fontWeight: '700',
  },

  roleTextMain: {
    color: COLORS.cyan,
  },

  roleTextSupporting: {
    color: COLORS.purple,
  },

  characterName: {
    color: COLORS.white,
    fontWeight: '800',
    includeFontPadding: false,
    marginTop: 13,
  },

  characterDescription: {
    color: COLORS.textSecondary,
    includeFontPadding: false,
    marginTop: 7,
  },

  uploadedDescription: {
    marginTop: 7,
  },

  uploadedLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },

  uploadedImageText: {
    color: COLORS.cyan,
    fontWeight: '600',
    marginRight: 4,
  },

  aiBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#201338',
    marginTop: 10,
  },

  aiBadgeText: {
    color: COLORS.purple,
    fontWeight: '600',
  },

  helperBox: {
    marginTop: 13,
    borderWidth: 1,
    borderColor: '#263A47',
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#031017',
  },

  helperIcon: {
    borderWidth: 1.3,
    borderColor: COLORS.cyan,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    marginRight: 6,
  },

  helperIconText: {
    color: COLORS.cyan,
    fontWeight: '800',
  },

  helperText: {
    flex: 1,
    color: COLORS.textSecondary,
  },

  cardDivider: {
    width: 1,
    backgroundColor: COLORS.divider,
    marginHorizontal: 10,
    marginVertical: 13,
  },

  /* ============================================================
     OPTIONS
  ============================================================ */

  optionsArea: {
    flex: 1,
    minWidth: 0,
    paddingTop: 12,
  },

  chooseHeading: {
    color: COLORS.textSecondary,
    includeFontPadding: false,
    marginBottom: 8,
  },

  optionsRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingRight: 2,
  },

  optionWrapper: {
    alignItems: 'center',
    flexShrink: 0,
  },

  optionImageButton: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#0A1820',
    borderWidth: 1,
  },

  optionUnselected: {
    borderColor: '#2B4452',
  },

  optionSelectedCyan: {
    borderColor: COLORS.cyan,
    borderWidth: 2,
  },

  optionSelectedPurple: {
    borderColor: COLORS.purple,
    borderWidth: 2,
  },

  optionPressed: {
    opacity: 0.82,
  },

  optionImage: {
    backgroundColor: '#0A1820',
  },

  optionCheck: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },

  optionCheckCyan: {
    backgroundColor: COLORS.cyan,
  },

  optionCheckPurple: {
    backgroundColor: COLORS.purple,
  },

  optionLabel: {
    color: COLORS.textSecondary,
    marginTop: 6,
    includeFontPadding: false,
  },

  optionLabelSelectedCyan: {
    color: COLORS.cyan,
    fontWeight: '700',
  },

  optionLabelSelectedPurple: {
    color: COLORS.purple,
    fontWeight: '700',
  },

  selectedBox: {
    width: '100%',
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  selectedBoxCyan: {
    borderColor: '#273B49',
    backgroundColor: COLORS.selectionDark,
  },

  selectedBoxPurple: {
    borderColor: '#273B49',
    backgroundColor: COLORS.selectionDark,
  },

  selectedCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 7,
    borderWidth: 1.5,
  },

  selectedCircleCyan: {
    borderColor: COLORS.cyan,
    backgroundColor: '#071820',
  },

  selectedCirclePurple: {
    borderColor: COLORS.purple,
    backgroundColor: '#211333',
  },

  selectedText: {
    fontWeight: '600',
    includeFontPadding: false,
  },

  selectedTextCyan: {
    color: COLORS.cyan,
  },

  selectedTextPurple: {
    color: COLORS.purple,
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

  bottomInfoText: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: 11,
    lineHeight: 16,
    marginLeft: 10,
    includeFontPadding: false,
  },

  bottomSparkles: {
    width: 29,
    alignItems: 'center',
    justifyContent: 'center',
  },

  sparkleSmall: {
    color: '#0E6B80',
    fontSize: 12,
    position: 'absolute',
    top: 2,
    right: 5,
  },

  sparkleLarge: {
    color: '#0E6B80',
    fontSize: 24,
    position: 'absolute',
    bottom: -8,
    right: -1,
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
    gap: 4,
  },

  footerText: {
    color: COLORS.muted,
    fontSize: 10,
  },
});