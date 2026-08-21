import React, { useCallback, useState } from 'react';
import {
  Alert,
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
import * as ImagePicker from 'expo-image-picker';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

type CharacterType = 'main' | 'supporting';

type Character = {
  id: string;
  name: string;
  type: CharacterType;
  description: string;
  image: any;
  uploadedImage: string | null;
};

const COLORS = {
  background: '#020A12',
  card: '#04121A',
  cardSoft: '#061821',

  cyan: '#00E5F5',
  cyanDark: '#008894',

  purple: '#C35CFF',
  purpleDark: '#24123B',

  white: '#FFFFFF',
  black: '#001015',

  textSecondary: '#C6D0D8',
  textMuted: '#8C99A4',
  muted: '#8C99A4',

  border: '#183B4A',
  divider: '#213844',
};

const ASSETS = {
  coin: require('../assets/coin.png'),
  hero: require('../assets/character-setup-hero.png'),
  vamika: require('../assets/vamika-character.png'),
  shopkeeper: require('../assets/shopkeeper-character.png'),
  aiCharacterMain: require('../assets/ai-character-main2.png'),
};

const INITIAL_CHARACTERS: Character[] = [
  {
    id: 'vamika',
    name: 'Vamika',
    type: 'main',
    description:
      'A cute little girl who loves exploring and enjoys every moment.',
    image: ASSETS.vamika,
    uploadedImage: null,
  },
  {
    id: 'shopkeeper',
    name: 'Shopkeeper',
    type: 'supporting',
    description:
      'The shop owner who prepares delicious burgers.',
    image: ASSETS.shopkeeper,
    uploadedImage: null,
  },
];

const DESIGN_WIDTH = 428;

export default function UploadImageScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const scale = Math.min(width / DESIGN_WIDTH, 1);

  const [characters, setCharacters] = useState<Character[]>(
    INITIAL_CHARACTERS,
  );

  const [uploadingCharacterId, setUploadingCharacterId] =
    useState<string | null>(null);

  /* ============================================================
     GALLERY
  ============================================================ */

  const openGallery = useCallback(
    async (characterId: string) => {
      try {
        const permission =
          await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permission.granted) {
          Alert.alert(
            'Gallery Permission Required',
            'Please allow photo access from Settings to choose a character image.',
          );
          return;
        }

        const result =
          await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.9,
          });

        if (result.canceled || !result.assets?.[0]?.uri) {
          return;
        }

        const uri = result.assets[0].uri;

        setCharacters((current) =>
          current.map((character) =>
            character.id === characterId
              ? {
                  ...character,
                  uploadedImage: uri,
                }
              : character,
          ),
        );
      } catch (error) {
        console.error('Gallery error:', error);

        Alert.alert(
          'Gallery Error',
          'Unable to select the image. Please try again.',
        );
      }
    },
    [],
  );

  /* ============================================================
     CAMERA
  ============================================================ */

  const openCamera = useCallback(
    async (characterId: string) => {
      try {
        const permission =
          await ImagePicker.requestCameraPermissionsAsync();

        if (!permission.granted) {
          Alert.alert(
            'Camera Permission Required',
            'Please allow camera access from Settings to capture a character image.',
          );
          return;
        }

        const result =
          await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.9,
          });

        if (result.canceled || !result.assets?.[0]?.uri) {
          return;
        }

        const uri = result.assets[0].uri;

        setCharacters((current) =>
          current.map((character) =>
            character.id === characterId
              ? {
                  ...character,
                  uploadedImage: uri,
                }
              : character,
          ),
        );
      } catch (error) {
        console.error('Camera error:', error);

        Alert.alert(
          'Camera Error',
          'Unable to capture the image. Please try again.',
        );
      }
    },
    [],
  );

  /* ============================================================
     IMAGE SOURCE POPUP
  ============================================================ */

  const chooseImageSource = useCallback(
    (characterId: string) => {
      setUploadingCharacterId(characterId);

      Alert.alert(
        'Add Character Image',
        'Choose how you want to add the image.',
        [
          {
            text: 'Camera',
            onPress: async () => {
              try {
                await openCamera(characterId);
              } finally {
                setUploadingCharacterId(null);
              }
            },
          },
          {
            text: 'Gallery',
            onPress: async () => {
              try {
                await openGallery(characterId);
              } finally {
                setUploadingCharacterId(null);
              }
            },
          },
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => {
              setUploadingCharacterId(null);
            },
          },
        ],
      );
    },
    [openCamera, openGallery],
  );

  /* ============================================================
     CONTINUE
     NO POPUP
  ============================================================ */

  const handleContinue = useCallback(() => {
    router.push('/select-characters');
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
              active
              scale={scale}
            />

            <ProgressLine active />

            <ProgressStep
              value="✓"
              label="Analyze"
              active
              scale={scale}
            />

            <ProgressLine active />

            <ProgressStep
              value="3"
              label="Characters"
              active
              scale={scale}
            />

            <ProgressLine />

            <ProgressStep
              value="4"
              label="Scenes"
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
                  minimumFontScale={0.75}
                >
                  Let&apos;s Set Up Your Characters
                </Text>

                <Text style={styles.heroSpark}>✦</Text>
              </View>

              <Text style={styles.heroSubtitle}>
                <Text style={styles.cyanText}>Shivora</Text>
                {' has identified '}
                <Text style={styles.cyanText}>
                  {characters.length}
                </Text>
                {characters.length === 1
                  ? ' character for your story.'
                  : ' characters for your story.'}
              </Text>

              <Text style={styles.heroDescription}>
                Add images or use AI to bring them to life.
              </Text>
            </View>

            <Image
              source={ASSETS.hero}
              resizeMode="contain"
              style={styles.heroImage}
            />
          </View>

          {/* ====================================================
              CHARACTERS — ONLY THIS AREA SCROLLS
          ==================================================== */}

          <View style={styles.characterArea}>
            <ScrollView
              style={styles.characterScroll}
              contentContainerStyle={
                styles.characterScrollContent
              }
              showsVerticalScrollIndicator={true}
              scrollEnabled={true}
              bounces={true}
              alwaysBounceVertical={true}
              nestedScrollEnabled={true}
              keyboardShouldPersistTaps="handled"
              directionalLockEnabled={true}
              overScrollMode="always"
            >
              {characters.map((character, index) => (
                <CharacterCard
                  key={character.id}
                  character={character}
                  index={index}
                  isMain={character.type === 'main'}
                  scale={scale}
                  uploading={
                    uploadingCharacterId === character.id
                  }
                  onUpload={() =>
                    chooseImageSource(character.id)
                  }
                />
              ))}
            </ScrollView>
          </View>

          {/* ====================================================
              FIXED:
              WHY MAIN CHARACTER IMAGE
          ==================================================== */}

          <View
            style={[
              styles.importanceCard,
              {
                borderRadius: 14 * scale,
              },
            ]}
          >
            <View style={styles.importanceIcon}>
              <Text style={styles.importanceSparkle}>✦</Text>
            </View>

            <View style={styles.importanceCopy}>
              <Text style={styles.importanceTitle}>
                Why main character image is important?
              </Text>

              <Text style={styles.importanceDescription}>
                Using your own image for the main character helps
                maintain consistency across all scenes and facial
                expressions.
              </Text>
            </View>

            <View style={styles.importanceExamples}>
              <ExampleThumb
                source={ASSETS.vamika}
                positive
                scale={scale}
              />

              <ExampleThumb
                source={ASSETS.aiCharacterMain}
                positive={false}
                scale={scale}
              />
            </View>
          </View>

          {/* ====================================================
              FIXED LOCK
          ==================================================== */}

          <View
            style={[
              styles.lockCard,
              {
                borderRadius: 15 * scale,
              },
            ]}
          >
            <MaterialCommunityIcons
              name="lock-outline"
              size={25}
              color={COLORS.cyan}
            />

            <Text style={styles.lockText}>
              Your characters will be locked once selected and used
              consistently throughout the video.
            </Text>
          </View>

          {/* ====================================================
              FIXED CTA
              NO ALERT / POPUP
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
   CHARACTER CARD
============================================================== */

function CharacterCard({
  character,
  index,
  isMain,
  scale,
  uploading,
  onUpload,
}: {
  character: Character;
  index: number;
  isMain: boolean;
  scale: number;
  uploading: boolean;
  onUpload: () => void;
}) {
  return (
    <View
      style={[
        styles.characterCard,
        {
          borderRadius: 15 * scale,
          padding: 9 * scale,
        },
        isMain
          ? styles.characterCardMain
          : styles.characterCardSupport,
      ]}
    >
      {/* ======================================================
          SMALL NUMBER
      ====================================================== */}

      <View
        style={[
          styles.cardNumber,
          {
            width: 28 * scale,
            height: 28 * scale,
            borderRadius: 14 * scale,
            top: 9 * scale,
            left: 9 * scale,
          },
          isMain
            ? styles.cardNumberMain
            : styles.cardNumberSupport,
        ]}
      >
        <Text
          style={[
            styles.cardNumberText,
            {
              fontSize: 13 * scale,
            },
          ]}
        >
          {index + 1}
        </Text>
      </View>

      {/* ======================================================
          IMAGE
      ====================================================== */}

      <View
        style={[
          styles.cardImageColumn,
          {
            width: 104 * scale,
          },
        ]}
      >
        <Image
          source={
            character.uploadedImage
              ? { uri: character.uploadedImage }
              : character.image
          }
          style={[
            styles.characterImage,
            {
              width: 96 * scale,
              height: 156 * scale,
              borderRadius: 12 * scale,
            },
          ]}
          resizeMode="cover"
        />
      </View>

      {/* ======================================================
          CHARACTER INFO
      ====================================================== */}

      <View
        style={[
          styles.cardMiddle,
          {
            paddingTop: 10 * scale,
            paddingHorizontal: 7 * scale,
          },
        ]}
      >
        <Text
          style={[
            styles.characterName,
            {
              fontSize: 16 * scale,
            },
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.8}
        >
          {character.name}
        </Text>

        <View
          style={[
            styles.roleBadge,
            {
              paddingHorizontal: 7 * scale,
              paddingVertical: 4 * scale,
            },
          ]}
        >
          <Text
            style={[
              styles.roleText,
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

        <Text
          style={[
            styles.characterDescription,
            {
              fontSize: 10 * scale,
              lineHeight: 14 * scale,
            },
          ]}
          numberOfLines={3}
        >
          {character.description}
        </Text>

        <View
          style={[
            styles.smallInfoBox,
            {
              marginTop: 7 * scale,
              padding: 6 * scale,
            },
          ]}
        >
          <View
            style={[
              styles.smallInfoCircle,
              {
                width: 18 * scale,
                height: 18 * scale,
                borderRadius: 9 * scale,
              },
            ]}
          >
            <Text
              style={[
                styles.smallInfoText,
                {
                  fontSize: 9 * scale,
                },
              ]}
            >
              i
            </Text>
          </View>

          <Text
            style={[
              styles.smallInfoCopy,
              {
                fontSize: 8.5 * scale,
                lineHeight: 11.5 * scale,
              },
            ]}
            numberOfLines={5}
          >
            {isMain
              ? 'Main characters are highly recommended to use your own image for best results.'
              : 'Supporting characters can be AI generated or added by you.'}
          </Text>
        </View>
      </View>

      {/* ======================================================
          DIVIDER
      ====================================================== */}

      <View style={styles.verticalDivider} />

      {/* ======================================================
          ACTION
      ====================================================== */}

      <View
        style={[
          styles.cardAction,
          {
            width: 108 * scale,
            paddingTop: 10 * scale,
            paddingLeft: 7 * scale,
            paddingRight: 5 * scale,
          },
        ]}
      >
        {isMain ? (
          <>
            <Text
              style={[
                styles.actionHeading,
                {
                  fontSize: 12 * scale,
                  lineHeight: 15 * scale,
                },
              ]}
              numberOfLines={2}
              adjustsFontSizeToFit
              minimumFontScale={0.75}
            >
              Main Character Image
            </Text>

            <Pressable
              onPress={onUpload}
              style={({ pressed }) => [
                styles.uploadBox,
                {
                  width: 96 * scale,
                  height: 133 * scale,
                  borderRadius: 12 * scale,
                },
                pressed && styles.uploadPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Upload image for ${character.name}`}
            >
              {character.uploadedImage ? (
                <>
                  <View
                    style={[
                      styles.addedCircle,
                      {
                        width: 39 * scale,
                        height: 39 * scale,
                        borderRadius: 20 * scale,
                      },
                    ]}
                  >
                    <Ionicons
                      name="checkmark"
                      size={20}
                      color={COLORS.black}
                    />
                  </View>

                  <Text
                    style={[
                      styles.addedTitle,
                      {
                        fontSize: 11 * scale,
                      },
                    ]}
                  >
                    Image Added
                  </Text>

                  <Text
                    style={[
                      styles.addedSub,
                      {
                        fontSize: 8.5 * scale,
                      },
                    ]}
                  >
                    Tap to change
                  </Text>
                </>
              ) : (
                <>
                  <MaterialCommunityIcons
                    name="cloud-upload-outline"
                    size={30}
                    color={COLORS.cyan}
                  />

                  <Text
                    style={[
                      styles.addedTitle,
                      {
                        fontSize: 11 * scale,
                      },
                    ]}
                  >
                    Add Image
                  </Text>

                  <Text
                    style={[
                      styles.addedSub,
                      {
                        fontSize: 8.5 * scale,
                      },
                    ]}
                  >
                    Tap to upload
                  </Text>
                </>
              )}
            </Pressable>

            <Text
              style={[
                styles.fileType,
                {
                  fontSize: 7.5 * scale,
                },
              ]}
            >
              JPG, PNG • Max 10MB
            </Text>

            {uploading && (
              <Text style={styles.uploadingText}>
                Opening...
              </Text>
            )}
          </>
        ) : (
          <>
            <Text
              style={[
                styles.actionHeading,
                {
                  fontSize: 12 * scale,
                },
              ]}
            >
              Choose Character
            </Text>

            <Pressable
              onPress={() =>
                Alert.alert(
                  'AI Character',
                  'AI character generation can be connected here next.',
                )
              }
              style={({ pressed }) => [
                styles.actionButton,
                styles.aiButton,
                {
                  width: 96 * scale,
                  height: 52 * scale,
                  borderRadius: 11 * scale,
                },
                pressed && styles.uploadPressed,
              ]}
            >
              <MaterialCommunityIcons
                name="robot-outline"
                size={23}
                color={COLORS.purple}
              />

              <View style={styles.actionButtonCopy}>
                <Text
                  style={[
                    styles.actionButtonTitle,
                    {
                      fontSize: 10 * scale,
                      lineHeight: 12 * scale,
                    },
                  ]}
                  numberOfLines={2}
                  adjustsFontSizeToFit
                  minimumFontScale={0.72}
                >
                  Use AI Character
                </Text>

                <Text
                  style={[
                    styles.actionButtonSub,
                    {
                      fontSize: 8 * scale,
                    },
                  ]}
                >
                  Let Shivora create
                </Text>
              </View>
            </Pressable>

            <Pressable
              onPress={onUpload}
              style={({ pressed }) => [
                styles.actionButton,
                styles.imageButton,
                {
                  width: 96 * scale,
                  height: 52 * scale,
                  borderRadius: 11 * scale,
                },
                pressed && styles.uploadPressed,
              ]}
            >
              <MaterialCommunityIcons
                name="cloud-upload-outline"
                size={23}
                color={COLORS.cyan}
              />

              <View style={styles.actionButtonCopy}>
                <Text
                  style={[
                    styles.actionButtonTitle,
                    styles.imageButtonTitle,
                    {
                      fontSize: 10 * scale,
                      lineHeight: 12 * scale,
                    },
                  ]}
                  numberOfLines={2}
                  adjustsFontSizeToFit
                  minimumFontScale={0.72}
                >
                  Add My Image
                </Text>

                <Text
                  style={[
                    styles.actionButtonSub,
                    {
                      fontSize: 8 * scale,
                    },
                  ]}
                >
                  Upload from gallery
                </Text>
              </View>
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}

/* ==============================================================
   EXAMPLE THUMB
============================================================== */

function ExampleThumb({
  source,
  positive,
  scale,
}: {
  source: any;
  positive: boolean;
  scale: number;
}) {
  return (
    <View style={styles.exampleWrapper}>
      <Image
        source={source}
        style={[
          styles.exampleImage,
          {
            width: 55 * scale,
            height: 55 * scale,
            borderRadius: 9 * scale,
          },
        ]}
        resizeMode="cover"
      />

      <View
        style={[
          styles.exampleBadge,
          positive
            ? styles.examplePositive
            : styles.exampleNegative,
          {
            width: 20 * scale,
            height: 20 * scale,
            borderRadius: 10 * scale,
          },
        ]}
      >
        <Ionicons
          name={positive ? 'checkmark' : 'close'}
          size={11}
          color={positive ? COLORS.black : COLORS.white}
        />
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
  scale,
}: {
  value: string;
  label: string;
  active?: boolean;
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
          active
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
            active
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
          active && styles.progressLabelActive,
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
    paddingTop: 3,
    paddingBottom: 3,
  },

  pressed: {
    opacity: 0.7,
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
    color: '#001114',
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
    height: 132,
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

  heroSubtitle: {
    color: COLORS.white,
    fontSize: 12.5,
    lineHeight: 18,
    marginTop: 8,
  },

  heroDescription: {
    color: COLORS.white,
    fontSize: 12.5,
    lineHeight: 18,
    marginTop: 3,
  },

  cyanText: {
    color: COLORS.cyan,
    fontWeight: '700',
  },

  heroImage: {
    width: 136,
    height: 96,
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
    minHeight: 207,
    borderWidth: 1,
    backgroundColor: COLORS.card,
    padding: 9,
    flexDirection: 'row',
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 9,
  },

  characterCardMain: {
    borderColor: COLORS.cyan,
  },

  characterCardSupport: {
    borderColor: COLORS.purple,
  },

  cardNumber: {
    position: 'absolute',
    zIndex: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  cardNumberMain: {
    backgroundColor: COLORS.cyan,
  },

  cardNumberSupport: {
    backgroundColor: COLORS.purple,
  },

  cardNumberText: {
    color: COLORS.black,
    fontWeight: '800',
    fontSize: 13,
  },

  cardImageColumn: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  characterImage: {
    backgroundColor: '#0A1820',
  },

  cardMiddle: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'flex-start',
  },

  characterName: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '800',
    includeFontPadding: false,
  },

  roleBadge: {
    alignSelf: 'flex-start',
    marginTop: 5,
    backgroundColor: '#26183F',
    maxWidth: '100%',
  },

  roleText: {
    color: COLORS.purple,
    fontWeight: '700',
  },

  characterDescription: {
    color: COLORS.white,
    includeFontPadding: false,
  },

  smallInfoBox: {
    borderWidth: 1,
    borderColor: '#243747',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  smallInfoCircle: {
    borderWidth: 1.3,
    borderColor: COLORS.cyan,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginRight: 5,
  },

  smallInfoText: {
    color: COLORS.cyan,
    fontWeight: '800',
  },

  smallInfoCopy: {
    flex: 1,
    color: COLORS.textSecondary,
  },

  verticalDivider: {
    width: 1,
    backgroundColor: COLORS.divider,
    marginVertical: 11,
  },

  cardAction: {
    alignItems: 'flex-start',
  },

  actionHeading: {
    color: COLORS.cyan,
    fontWeight: '700',
    includeFontPadding: false,
    marginBottom: 6,
  },

  uploadBox: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: COLORS.cyanDark,
    backgroundColor: '#03151D',
    justifyContent: 'center',
    alignItems: 'center',
  },

  uploadPressed: {
    opacity: 0.76,
  },

  addedCircle: {
    backgroundColor: COLORS.cyan,
    justifyContent: 'center',
    alignItems: 'center',
  },

  addedTitle: {
    color: COLORS.cyan,
    fontWeight: '800',
    includeFontPadding: false,
    marginTop: 3,
  },

  addedSub: {
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  fileType: {
    color: COLORS.textMuted,
    textAlign: 'center',
    width: '100%',
    marginTop: 4,
  },

  uploadingText: {
    color: COLORS.cyan,
    width: '100%',
    textAlign: 'center',
    marginTop: 2,
    fontSize: 8,
  },

  actionButton: {
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginBottom: 6,
  },

  aiButton: {
    borderColor: COLORS.purple,
    backgroundColor: '#110B1E',
  },

  imageButton: {
    borderColor: COLORS.cyan,
    backgroundColor: '#03151D',
  },

  actionButtonCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 5,
  },

  actionButtonTitle: {
    color: COLORS.white,
    fontWeight: '800',
    includeFontPadding: false,
  },

  imageButtonTitle: {
    color: COLORS.cyan,
  },

  actionButtonSub: {
    color: COLORS.textMuted,
    marginTop: 1,
  },

  /* ============================================================
     FIXED IMPORTANCE CARD
  ============================================================ */

  importanceCard: {
    height: 86,
    flexShrink: 0,
    width: '100%',
    borderWidth: 1,
    borderColor: '#113848',
    backgroundColor: '#04121A',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    marginTop: 5,
    marginBottom: 5,
  },

  importanceIcon: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },

  importanceSparkle: {
    color: COLORS.cyan,
    fontSize: 23,
  },

  importanceCopy: {
    flex: 1,
    minWidth: 0,
    paddingRight: 4,
  },

  importanceTitle: {
    color: COLORS.white,
    fontSize: 12.5,
    lineHeight: 16,
    fontWeight: '700',
    includeFontPadding: false,
  },

  importanceDescription: {
    color: COLORS.textSecondary,
    fontSize: 10,
    lineHeight: 14,
    marginTop: 5,
    includeFontPadding: false,
  },

  importanceExamples: {
    flexDirection: 'row',
    gap: 4,
  },

  exampleWrapper: {
    position: 'relative',
  },

  exampleImage: {
    backgroundColor: '#0A1820',
  },

  exampleBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    justifyContent: 'center',
    alignItems: 'center',
  },

  examplePositive: {
    backgroundColor: COLORS.cyan,
  },

  exampleNegative: {
    backgroundColor: '#E91E63',
  },

  /* ============================================================
     FIXED LOCK
  ============================================================ */

  lockCard: {
    height: 51,
    flexShrink: 0,
    width: '100%',
    borderWidth: 1,
    borderColor: '#153947',
    backgroundColor: '#04121A',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 11,
  },

  lockText: {
    flex: 1,
    marginLeft: 8,
    color: COLORS.textSecondary,
    fontSize: 10.5,
    lineHeight: 15,
    includeFontPadding: false,
  },

  /* ============================================================
     FIXED CTA
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
     FIXED FOOTER
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