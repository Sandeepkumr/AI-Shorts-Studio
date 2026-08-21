import React, { useCallback } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

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

  alex: require('../assets/ai-character-main.png'),
  shopkeeper: require('../assets/shopkeeper-character.png'),

  scene01: require('../assets/scene-01.png'),
  scene02: require('../assets/scene-02.png'),
  scene03: require('../assets/scene-03.png'),
  scene04: require('../assets/scene-04.png'),
} as const;

const SCENES = [
  {
    id: '01',
    image: ASSETS.scene01,
    text: 'Alex enters the burger shop.',
  },
  {
    id: '02',
    image: ASSETS.scene02,
    text: 'Alex asks the shopkeeper for burger.',
  },
  {
    id: '03',
    image: ASSETS.scene03,
    text: 'Shopkeeper prepares the burger.',
  },
  {
    id: '04',
    image: ASSETS.scene04,
    text: 'Alex receives the burger and is happy.',
  },
];

export default function AIPreviewConfirmationScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const scale = Math.min(width / 428, 1);
  const horizontalPadding = width <= 375 ? 16 : 22;

  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  }, [router]);

  const handleEditCharacters = useCallback(() => {
    router.push('/select-characters');
  }, [router]);

  const handleEditScenes = useCallback(() => {
    router.push('/view-scenes');
  }, [router]);

  const handleEditSettings = useCallback(() => {
    router.back();
  }, [router]);

  const handleGenerate = useCallback(() => {
    router.push('/video-generating');
  }, [router]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.background}
      />

      <View style={styles.screen}>
        {/* ======================================================
            HEADER — SAME REFERENCE SYSTEM
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
              Text to{' '}
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
            MAIN SCROLL
        ====================================================== */}

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingHorizontal: horizontalPadding,
              paddingBottom: 112,
            },
          ]}
        >
          {/* ====================================================
              HERO
          ==================================================== */}

          <View style={styles.heroCard}>
            <View style={styles.heroIconWrap}>
              <Ionicons
                name="document-text-outline"
                size={36}
                color={COLORS.cyan}
              />
              <Text style={styles.heroSparkOne}>✦</Text>
              <Text style={styles.heroSparkTwo}>✦</Text>
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

          {/* ====================================================
              STORY
          ==================================================== */}

          <SectionCard>
            <View style={styles.sectionTopRow}>
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionTitle}>
                  Your Story
                </Text>
                <Text style={styles.sectionSpark}>✦</Text>
              </View>

              <PillButton
                icon="sparkles-outline"
                label="AI Summary"
                color={COLORS.cyan}
                onPress={() => undefined}
              />
            </View>

            <Text style={styles.storyText}>
              A young boy named Alex visits a local burger shop.
              {'\n'}
              He asks the shopkeeper for his favorite burger.
              {'\n'}
              The shopkeeper prepares the burger and gives it
              {'\n'}
              to Alex. Alex receives the burger and is happy.
            </Text>
          </SectionCard>

          {/* ====================================================
              CHARACTERS
          ==================================================== */}

          <SectionCard>
            <View style={styles.sectionTopRow}>
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionTitle}>
                  Your Characters (2)
                </Text>
                <Text style={styles.sectionSpark}>✦</Text>
              </View>

              <PillButton
                icon="create-outline"
                label="Edit All"
                color={COLORS.cyan}
                onPress={handleEditCharacters}
              />
            </View>

            <View style={styles.charactersRow}>
              <CharacterCard
                image={ASSETS.alex}
                name="Alex"
                role="Main Character"
                description="Young boy with red hair, fair skin, blue hoodie and white sneakers."
              />

              <CharacterCard
                image={ASSETS.shopkeeper}
                name="Shopkeeper"
                role="Supporting Character"
                description="Man with black hair, beard and black apron."
              />
            </View>

            <View style={styles.characterReuseCard}>
              <Ionicons
                name="people-outline"
                size={34}
                color={COLORS.cyan}
              />

              <View style={styles.reuseCopy}>
                <Text style={styles.reuseTitle}>
                  Character Reuse
                </Text>
                <Text style={styles.reuseDescription}>
                  These characters are saved in your library.
                  {'\n'}
                  You can reuse them in future videos.
                </Text>
              </View>

              <Pressable
                onPress={() => undefined}
                style={({ pressed }) => [
                  styles.viewCharactersButton,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.viewCharactersText}>
                  View My Characters
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={COLORS.white}
                />
              </Pressable>
            </View>
          </SectionCard>

          {/* ====================================================
              PLANNED SCENES
          ==================================================== */}

          <SectionCard>
            <View style={styles.sectionTopRow}>
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionTitle}>
                  Planned Scenes (4)
                </Text>
                <Text style={styles.sectionSpark}>✦</Text>
              </View>

              <PillButton
                icon="create-outline"
                label="Edit Scenes"
                color={COLORS.cyan}
                onPress={handleEditScenes}
              />
            </View>

            <View style={styles.sceneGrid}>
              {SCENES.map((scene) => (
                <View
                  key={scene.id}
                  style={styles.plannedScene}
                >
                  <View style={styles.sceneImageWrap}>
                    <Image
                      source={scene.image}
                      resizeMode="cover"
                      style={styles.sceneImage}
                    />
                    <View style={styles.sceneBadge}>
                      <Text style={styles.sceneBadgeText}>
                        {scene.id}
                      </Text>
                    </View>
                  </View>

                  <Text
                    style={styles.sceneText}
                    numberOfLines={3}
                  >
                    {scene.text}
                  </Text>
                </View>
              ))}
            </View>
          </SectionCard>

          {/* ====================================================
              VIDEO SETTINGS
          ==================================================== */}

          <SectionCard>
            <View style={styles.sectionTopRow}>
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionTitle}>
                  Video Settings
                </Text>
                <Text style={styles.sectionSpark}>✦</Text>
              </View>

              <PillButton
                icon="create-outline"
                label="Edit"
                color={COLORS.cyan}
                onPress={handleEditSettings}
              />
            </View>

            <View style={styles.settingsRow}>
              <SettingItem
                icon="time-outline"
                value="30 sec"
                label="Duration"
              />

              <SettingItem
                icon="phone-portrait-outline"
                value="9:16"
                label="Portrait"
              />

              <SettingItem
                icon="film-outline"
                value="3D Animation"
                label="Style"
              />

              <SettingItem
                icon="pulse-outline"
                value="AI Auto"
                label="Voice"
              />

              <SettingItem
                icon="camera-outline"
                value="Auto"
                label="Camera"
              />
            </View>
          </SectionCard>
        </ScrollView>

        {/* ======================================================
            FIXED GENERATE
        ====================================================== */}

        <View style={styles.fixedBottom}>
          <Pressable
            onPress={handleGenerate}
            style={({ pressed }) => [
              styles.generateButton,
              pressed && styles.generatePressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Generate Video"
          >
            <LinearGradient
              colors={['#00CFFF', '#2C75FF', '#8C2EFF']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.generateGradient}
            >
              <Text style={styles.generateText}>
                Generate Video
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

/* ==============================================================
   SECTION CARD
============================================================== */

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

/* ==============================================================
   PILL BUTTON
============================================================== */

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
          {
            color,
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

/* ==============================================================
   CHARACTER CARD
============================================================== */

function CharacterCard({
  image,
  name,
  role,
  description,
}: {
  image: any;
  name: string;
  role: string;
  description: string;
}) {
  return (
    <View style={styles.characterCard}>
      <Image
        source={image}
        resizeMode="cover"
        style={styles.characterImage}
      />

      <View style={styles.characterCopy}>
        <Text
          style={styles.characterName}
          numberOfLines={1}
        >
          {name}
        </Text>

        <Text style={styles.characterRole}>
          {role}
        </Text>

        <Text
          style={styles.characterDescription}
          numberOfLines={4}
        >
          {description}
        </Text>
      </View>

      <View style={styles.savedBadge}>
        <Ionicons
          name="checkmark"
          size={11}
          color={COLORS.black}
        />
        <Text style={styles.savedText}>
          Saved
        </Text>
      </View>
    </View>
  );
}

/* ==============================================================
   SETTING ITEM
============================================================== */

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

  pressed: {
    opacity: 0.72,
  },

  /* ============================================================
     HEADER — REFERENCE
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
     MAIN
  ============================================================ */

  scrollContent: {
    paddingTop: 11,
    gap: 7,
  },

  /* ============================================================
     HERO
  ============================================================ */

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

  /* ============================================================
     GENERIC CARD
  ============================================================ */

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

  /* ============================================================
     STORY
  ============================================================ */

  storyText: {
    color: COLORS.textSecondary,
    fontSize: 12.2,
    lineHeight: 19,
    marginTop: 10,
  },

  /* ============================================================
     CHARACTERS
  ============================================================ */

  charactersRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },

  characterCard: {
    flex: 1,
    minWidth: 0,
    minHeight: 137,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.cardSoft,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
    position: 'relative',
    overflow: 'hidden',
  },

  characterImage: {
    width: 70,
    height: 88,
    borderRadius: 9,
    backgroundColor: '#0A1820',
    flexShrink: 0,
  },

  characterCopy: {
    flex: 1,
    minWidth: 0,
    paddingLeft: 8,
    paddingRight: 2,
  },

  characterName: {
    color: COLORS.white,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
  },

  characterRole: {
    color: COLORS.cyan,
    fontSize: 9.5,
    lineHeight: 12,
    marginTop: 4,
  },

  characterDescription: {
    color: COLORS.textSecondary,
    fontSize: 9.5,
    lineHeight: 14,
    marginTop: 8,
  },

  savedBadge: {
    position: 'absolute',
    left: 8,
    bottom: 8,
    height: 24,
    paddingHorizontal: 7,
    borderRadius: 12,
    backgroundColor: '#062B35',
    borderWidth: 1,
    borderColor: '#0A7180',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },

  savedText: {
    color: COLORS.cyan,
    fontSize: 8.5,
    fontWeight: '600',
  },

  characterReuseCard: {
    marginTop: 10,
    minHeight: 70,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: COLORS.purple,
    backgroundColor: '#0B0B25',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },

  reuseCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 9,
  },

  reuseTitle: {
    color: COLORS.white,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '700',
  },

  reuseDescription: {
    color: COLORS.textSecondary,
    fontSize: 9.5,
    lineHeight: 14,
    marginTop: 3,
  },

  viewCharactersButton: {
    minWidth: 120,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: '#5934A0',
    backgroundColor: '#18112D',
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    flexShrink: 0,
  },

  viewCharactersText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: '600',
  },

  /* ============================================================
     PLANNED SCENES
  ============================================================ */

  sceneGrid: {
    flexDirection: 'row',
    gap: 7,
    marginTop: 10,
  },

  plannedScene: {
    flex: 1,
    minWidth: 0,
  },

  sceneImageWrap: {
    width: '100%',
    aspectRatio: 1.18,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#0A1820',
  },

  sceneImage: {
    width: '100%',
    height: '100%',
  },

  sceneBadge: {
    position: 'absolute',
    left: 4,
    top: 4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#061822',
    borderWidth: 1,
    borderColor: COLORS.cyan,
    alignItems: 'center',
    justifyContent: 'center',
  },

  sceneBadgeText: {
    color: COLORS.cyan,
    fontSize: 10,
    fontWeight: '700',
  },

  sceneText: {
    color: COLORS.textSecondary,
    fontSize: 9.5,
    lineHeight: 14,
    marginTop: 6,
  },

  /* ============================================================
     VIDEO SETTINGS
  ============================================================ */

  settingsRow: {
    flexDirection: 'row',
    gap: 7,
    marginTop: 10,
  },

  settingItem: {
    flex: 1,
    minWidth: 0,
    minHeight: 88,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.cardSoft,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },

  settingValue: {
    color: COLORS.white,
    fontSize: 10.5,
    lineHeight: 14,
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

  /* ============================================================
     FIXED GENERATE
  ============================================================ */

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