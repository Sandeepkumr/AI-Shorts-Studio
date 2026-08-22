import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { authService } from "../../src/services/auth/authService";
import { useTheme } from "../../src/theme";

/* ============================================================
   ASSETS
   ============================================================ */

const SHIVORA_LOGO = require("../../assets/logo.png");
const BOTTOM_FILM_REEL = require("../../assets/otp-bottom-film-reel.png");
const USER_AVATAR = require("../../assets/user-avatar.png");

/* ============================================================
   COLORS
   ============================================================ */

const COLORS = {
  background: "#02080D",

  panel: "#06141D",
  panelLight: "#081B26",
  panelDeep: "#041018",

  white: "#FFFFFF",
  text: "#F5F9FC",
  secondary: "#AABBC5",
  muted: "#70838E",

  cyan: "#00E5F5",
  cyanBright: "#00F7FF",

  blue: "#287BFF",
  purple: "#8B2EFF",

  border: "#164B5D",
  borderBright: "#08AFC4",

  success: "#00E5F5",
  error: "#FF6B86",
};

type FocusedField = "name" | "email" | null;

/* ============================================================
   SCREEN
   ============================================================ */

export default function CreateProfileSetupScreen() {
  const router = useRouter();
  const theme = useTheme();

  const { width, height } = useWindowDimensions();

  /*
   * Keep the original viewport dimensions frozen.
   *
   * The reference screen does this so the bottom reel keeps the exact
   * same size and position instead of reacting to viewport changes.
   */
  const initialViewport = useRef({
    width,
    height,
  }).current;

  const designWidth = initialViewport.width;
  const designHeight = initialViewport.height;

  const {
    phone,
    mode,
    editName,
    editEmail,
  } = useLocalSearchParams<{
    phone?: string;
    mode?: string;
    editName?: string;
    editEmail?: string;
  }>();

  const isEditMode = mode === "edit";

  const compact = designHeight < 900;

  const styles = useMemo(
    () =>
      createStyles(
        designWidth,
        designHeight,
        compact,
        theme,
        isEditMode,
      ),
    [compact, designHeight, designWidth, isEditMode, theme],
  );

  /* ============================================================
     STATE
     ============================================================ */

  const [name, setName] = useState(
    isEditMode && typeof editName === "string"
      ? editName
      : "",
  );

  const [email, setEmail] = useState(
    isEditMode && typeof editEmail === "string"
      ? editEmail
      : "",
  );
  const [error, setError] = useState<string | undefined>();

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [focusedField, setFocusedField] =
    useState<FocusedField>(null);

  const nameInputRef = useRef<TextInput>(null);
  const emailInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (!isEditMode) return;

    if (typeof editName === "string") {
      setName(editName);
    }

    if (typeof editEmail === "string") {
      setEmail(editEmail);
    }
  }, [editEmail, editName, isEditMode]);

  /* ============================================================
     ANIMATION VALUES
     ============================================================ */

  const avatarScale = useSharedValue(1);
  const avatarGlow = useSharedValue(0.55);
  const buttonGlow = useSharedValue(0.55);

  /* ============================================================
     ANIMATIONS
     ============================================================ */

  useEffect(() => {
    avatarScale.value = withRepeat(
      withSequence(
        withSpring(1.035, {
          damping: 12,
          stiffness: 90,
        }),
        withSpring(1, {
          damping: 12,
          stiffness: 90,
        }),
      ),
      -1,
      false,
    );

    avatarGlow.value = withRepeat(
      withSequence(
        withTiming(1, {
          duration: 1700,
        }),
        withTiming(0.55, {
          duration: 1700,
        }),
      ),
      -1,
      false,
    );

    buttonGlow.value = withRepeat(
      withSequence(
        withTiming(1, {
          duration: 1300,
        }),
        withTiming(0.55, {
          duration: 1300,
        }),
      ),
      -1,
      false,
    );
  }, [
    avatarGlow,
    avatarScale,
    buttonGlow,
  ]);

  const avatarAnimatedStyle =
    useAnimatedStyle(() => ({
      transform: [
        {
          scale: avatarScale.value,
        },
      ],
    }));

  const avatarGlowStyle =
    useAnimatedStyle(() => ({
      opacity: avatarGlow.value,
      transform: [
        {
          scale:
            0.94 + avatarGlow.value * 0.08,
        },
      ],
    }));

  const buttonGlowStyle =
    useAnimatedStyle(() => ({
      opacity: buttonGlow.value,
    }));

  /* ============================================================
     PHONE
     ============================================================ */

  const formattedPhone = (() => {
    if (
      typeof phone !== "string" ||
      !phone
    ) {
      return "";
    }

    if (phone.startsWith("+91")) {
      return `+91 ${phone.slice(3)}`;
    }

    if (phone.startsWith("+44")) {
      return `+44 ${phone.slice(3)}`;
    }

    if (phone.startsWith("+1")) {
      return `+1 ${phone.slice(2)}`;
    }

    return phone;
  })();

  const flag = (() => {
    if (
      typeof phone !== "string" ||
      !phone
    ) {
      return "🇮🇳";
    }

    if (phone.startsWith("+1")) {
      return "🇺🇸";
    }

    if (phone.startsWith("+44")) {
      return "🇬🇧";
    }

    return "🇮🇳";
  })();

  /* ============================================================
     VALIDATION
     ============================================================ */

  const canContinue =
    name.trim().length >= 2;

  const clearError = () => {
    if (error) {
      setError(undefined);
    }
  };

  /* ============================================================
     SAVE PROFILE
     ============================================================ */

  const saveProfile = async () => {
    Keyboard.dismiss();

    if (name.trim().length < 2) {
      setError(
        "Please enter your name to continue.",
      );
      return;
    }

    setError(undefined);
    setIsSubmitting(true);

    try {
      /*
       * The supplied auth service currently exposes completeProfile().
       * We keep using that existing service method so the screen does
       * not invent a new backend API contract.
       *
       * When an updateProfile() endpoint is added to authService, the
       * edit branch can be switched to that method without changing
       * this screen's UI or navigation.
       */
      await authService.completeProfile({
        name: name.trim(),
        username: "",
      });

      if (isEditMode) {
        router.back();
      } else {
        router.replace("/(tabs)/home");
      }
    } catch (profileError) {
      setError(
        profileError instanceof Error
          ? profileError.message
          : "Unable to save your profile.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ============================================================
     BACK
     ============================================================ */

  const goBack = () => {
    Keyboard.dismiss();

    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  };

  /* ============================================================
     RENDER
     ============================================================ */

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top", "bottom"]}
    >
      <View style={styles.screen}>
          {/* ==================================================
              BACKGROUND LIGHT
          ================================================== */}

          {!isEditMode && (
            <View
              pointerEvents="none"
              style={styles.topAmbientGlow}
            />
          )}

          {!isEditMode && (
            <>
              <View
                pointerEvents="none"
                style={styles.centerAmbientGlow}
              />

              <View
                pointerEvents="none"
                style={styles.bottomAmbientGlow}
              />
            </>
          )}

          {/* ==================================================
              BOTTOM CINEMATIC REEL

              IMPORTANT:
              pointerEvents is NOT placed on Image.
          ================================================== */}

          <Image
            source={BOTTOM_FILM_REEL}
            resizeMode="stretch"
            style={styles.bottomFilmReel}
          />

          {/* ==================================================
              BACK BUTTON
          ================================================== */}

          <Animated.View
            entering={FadeIn.duration(450)}
            style={styles.backButtonWrapper}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go back"
              hitSlop={10}
              onPress={goBack}
              style={({ pressed }) => [
                styles.backButton,
                pressed &&
                  styles.backButtonPressed,
              ]}
            >
              <Ionicons
                name="chevron-back"
                size={27}
                color={COLORS.white}
              />
            </Pressable>
          </Animated.View>

          {/* ==================================================
              KEYBOARD
          ================================================== */}

          <KeyboardAvoidingView
            behavior={
              Platform.OS === "ios"
                ? "padding"
                : undefined
            }
            style={styles.keyboard}
          >
            <ScrollView
              bounces={false}
              contentContainerStyle={
                styles.scrollContent
              }
              keyboardShouldPersistTaps="always"
              keyboardDismissMode="none"
              showsVerticalScrollIndicator={false}
            >
              {/* ==================================================
                  BRAND
              ================================================== */}

              <Animated.View
                entering={FadeInDown
                  .delay(80)
                  .duration(600)}
                style={styles.brandSection}
              >
                <Image
                  source={SHIVORA_LOGO}
                  resizeMode="contain"
                  style={styles.logo}
                />

                <View
                  style={styles.brandAccentRow}
                >
                  <View
                    style={styles.brandLine}
                  />

                  <View
                    style={styles.brandDot}
                  />

                  <Text
                    style={styles.brandText}
                  >
                    AI VIDEO CREATION
                  </Text>

                  <View
                    style={styles.brandDot}
                  />

                  <View
                    style={styles.brandLine}
                  />
                </View>
              </Animated.View>

              {/* ==================================================
                  HERO TITLE
              ================================================== */}

              <Animated.View
                entering={FadeInUp
                  .delay(150)
                  .duration(600)}
                style={styles.heroTitleSection}
              >
                {isEditMode ? (
                  <Text
                    style={styles.editTitle}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.82}
                  >
                    Edit your{" "}
                    <Text style={styles.titleAccent}>
                      profile
                    </Text>
                    <Text style={styles.titleSparkle}> ✦</Text>
                  </Text>
                ) : (
                  <>
                    <Text style={styles.title}>
                      Create your
                    </Text>

                    <View
                      style={styles.titleAccentRow}
                    >
                      <Text style={styles.titleAccent}>
                        profile
                      </Text>

                      <Text
                        style={styles.titleSparkle}
                      >
                        ✦
                      </Text>
                    </View>
                  </>
                )}

                <Text style={styles.subtitle}>
                  {isEditMode
                    ? "Update your Shivora profile"
                    : "Let’s personalize your Shivora experience"}
                </Text>

                <View
                  style={styles.subtitleDivider}
                >
                  <View
                    style={styles.dividerLine}
                  />

                  <View
                    style={styles.dividerCenter}
                  >
                    <View
                      style={styles.dividerDot}
                    />
                    <View
                      style={styles.dividerDotSmall}
                    />
                    <View
                      style={styles.dividerDot}
                    />
                  </View>

                  <View
                    style={styles.dividerLine}
                  />
                </View>
              </Animated.View>

              {/* ==================================================
                  CREATOR IDENTITY
              ================================================== */}

              <Animated.View
                entering={FadeInUp
                  .delay(230)
                  .duration(650)}
                style={styles.identitySection}
              >
                {/* Ambient glow */}

                <Animated.View
                  pointerEvents="none"
                  style={[
                    styles.avatarGlow,
                    avatarGlowStyle,
                  ]}
                />

                {/* Orbit ring */}

                <View
                  pointerEvents="none"
                  style={styles.orbitRing}
                />

                <View
                  pointerEvents="none"
                  style={styles.orbitRingInner}
                />

                {/* Avatar */}

                <Animated.View
                  style={[
                    styles.avatarWrapper,
                    avatarAnimatedStyle,
                  ]}
                >
                  <LinearGradient
                    colors={[
                      COLORS.cyan,
                      COLORS.blue,
                      COLORS.purple,
                    ]}
                    start={{
                      x: 0.05,
                      y: 0.05,
                    }}
                    end={{
                      x: 0.95,
                      y: 0.95,
                    }}
                    style={styles.avatarGradient}
                  >
                    <View
                      style={styles.avatarInner}
                    >
                      {isEditMode ? (
                        <Image
                          source={USER_AVATAR}
                          resizeMode="cover"
                          style={styles.avatarImage}
                        />
                      ) : (
                        <Ionicons
                          name="person-outline"
                          size={
                            compact ? 51 : 58
                          }
                          color="#7B8A94"
                        />
                      )}
                    </View>
                  </LinearGradient>

                  {/* Camera */}

                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={isEditMode ? "Change profile photo" : "Add profile photo"}
                    onPress={() => undefined}
                    style={({ pressed }) => [
                      styles.cameraButton,
                      isEditMode && styles.editCameraButton,
                      pressed &&
                        styles.cameraPressed,
                    ]}
                  >
                    <LinearGradient
                      colors={[
                        COLORS.cyanBright,
                        "#00B8FF",
                      ]}
                      start={{
                        x: 0,
                        y: 0,
                      }}
                      end={{
                        x: 1,
                        y: 1,
                      }}
                      style={styles.cameraGradient}
                    >
                      <Ionicons
                        name="camera-outline"
                        size={isEditMode ? 17 : 25}
                        color="#031017"
                      />
                    </LinearGradient>
                  </Pressable>
                </Animated.View>

                {/* Sparkles */}

                <Text
                  pointerEvents="none"
                  style={[
                    styles.sparkle,
                    styles.sparkleOne,
                  ]}
                >
                  ✦
                </Text>

                <Text
                  pointerEvents="none"
                  style={[
                    styles.sparkle,
                    styles.sparkleTwo,
                  ]}
                >
                  ✧
                </Text>

                <Text
                  pointerEvents="none"
                  style={[
                    styles.sparkle,
                    styles.sparkleThree,
                  ]}
                >
                  ✦
                </Text>

                <Text
                  pointerEvents="none"
                  style={[
                    styles.sparkle,
                    styles.sparkleFour,
                  ]}
                >
                  ·
                </Text>

                {/* Creator identity copy is intentionally hidden in Edit mode.
                    Create Profile keeps the original badge/title/subtitle. */}
                {!isEditMode && (
                  <>
                    <View
                      style={styles.creatorBadge}
                    >
                      <View
                        style={styles.creatorBadgeDot}
                      />

                      <Text
                        style={styles.creatorBadgeText}
                      >
                        YOUR CREATOR IDENTITY
                      </Text>
                    </View>

                    <Text
                      style={styles.photoTitle}
                    >
                      Add your photo
                    </Text>

                    <Text
                      style={styles.photoSubtitle}
                    >
                      Show the world your creator identity
                    </Text>
                  </>
                )}
              </Animated.View>

              {/* ==================================================
                  FORM
              ================================================== */}

              <View style={styles.form}>
                {/* ==================================================
                    NAME
                ================================================== */}

                <Animated.View
                  entering={FadeInUp
                    .delay(320)
                    .duration(500)}
                  style={styles.fieldGroup}
                >
                  <Text
                    style={styles.fieldLabel}
                  >
                    Full name
                  </Text>

                  <View
                    style={[
                      styles.inputCard,
                      focusedField === "name" &&
                        styles.inputCardFocused,
                      error &&
                        name.trim().length < 2 &&
                        styles.inputCardError,
                    ]}
                  >
                    <View
                      style={styles.inputIconBox}
                    >
                      <Ionicons
                        name="person-outline"
                        size={22}
                        color={
                          focusedField ===
                          "name"
                            ? COLORS.cyan
                            : "#79909B"
                        }
                      />
                    </View>

                    <TextInput
                      accessibilityLabel="Full name"
                      editable={!isSubmitting}
                      showSoftInputOnFocus={true}
                      autoCapitalize="words"
                      autoCorrect={false}
                      onTouchStart={() => {
                        if (!isSubmitting) {
                          requestAnimationFrame(() => {
                            nameInputRef.current?.focus();
                          });
                        }
                      }}
                      onBlur={() =>
                        setFocusedField(
                          null,
                        )
                      }
                      onChangeText={(value) => {
                        setName(value);
                        clearError();
                      }}
                      onFocus={() =>
                        setFocusedField(
                          "name",
                        )
                      }
                      placeholder="Enter your full name"
                      placeholderTextColor="#657A85"
                      returnKeyType="next"
                      style={styles.input}
                      value={name}
                      ref={nameInputRef}
                    />


                  </View>
                </Animated.View>

                {/* ==================================================
                    EMAIL
                ================================================== */}

                <Animated.View
                  entering={FadeInUp
                    .delay(390)
                    .duration(500)}
                  style={styles.fieldGroup}
                >
                  <Text
                    style={styles.fieldLabel}
                  >
                    Email address
                  </Text>

                  <View
                    style={[
                      styles.inputCard,
                      focusedField === "email" &&
                        styles.inputCardFocused,
                    ]}
                  >
                    <View
                      style={styles.inputIconBox}
                    >
                      <Ionicons
                        name="mail-outline"
                        size={22}
                        color={
                          focusedField ===
                          "email"
                            ? COLORS.cyan
                            : "#79909B"
                        }
                      />
                    </View>

                    <TextInput
                      accessibilityLabel="Email address"
                      editable={!isSubmitting}
                      showSoftInputOnFocus={true}
                      autoCapitalize="none"
                      autoCorrect={false}
                      keyboardType="email-address"
                      onTouchStart={() => {
                        if (!isSubmitting) {
                          requestAnimationFrame(() => {
                            emailInputRef.current?.focus();
                          });
                        }
                      }}
                      onBlur={() =>
                        setFocusedField(
                          null,
                        )
                      }
                      onChangeText={(value) => {
                        setEmail(value);
                        clearError();
                      }}
                      onFocus={() =>
                        setFocusedField(
                          "email",
                        )
                      }
                      placeholder="Enter your email address"
                      placeholderTextColor="#657A85"
                      returnKeyType="done"
                      style={styles.input}
                      value={email}
                      ref={emailInputRef}
                    />
                  </View>
                </Animated.View>

                {/* ==================================================
                    MOBILE
                ================================================== */}

                <Animated.View
                  entering={FadeInUp
                    .delay(460)
                    .duration(500)}
                  style={styles.fieldGroup}
                >
                  <Text
                    style={styles.fieldLabel}
                  >
                    Mobile number
                  </Text>

                  <View
                    style={
                      styles.phoneCard
                    }
                  >
                    <View
                      style={
                        styles.phoneIconBox
                      }
                    >
                      <Ionicons
                        name="call-outline"
                        size={21}
                        color={COLORS.cyan}
                      />
                    </View>

                    <Text
                      style={styles.flag}
                    >
                      {flag}
                    </Text>

                    <Text
                      numberOfLines={1}
                      style={styles.phoneNumber}
                    >
                      {formattedPhone ||
                        "Verified mobile number"}
                    </Text>

                    <View
                      style={
                        styles.verifiedBadge
                      }
                    >
                      <Ionicons
                        name="checkmark"
                        size={22}
                        color="#021017"
                      />
                    </View>
                  </View>

                  <View
                    style={
                      styles.verifiedRow
                    }
                  >
                    <View
                      style={
                        styles.verifiedIcon
                      }
                    >
                      <Ionicons
                        name="shield-checkmark"
                        size={14}
                        color={COLORS.cyan}
                      />
                    </View>

                    <Text
                      style={
                        styles.verifiedText
                      }
                    >
                      This number is verified
                    </Text>

                    <View
                      style={
                        styles.verifiedLine
                      }
                    />
                  </View>
                </Animated.View>

                {/* ==================================================
                    ERROR
                ================================================== */}

                {error ? (
                  <Animated.View
                    entering={FadeIn.duration(
                      220,
                    )}
                    style={
                      styles.errorContainer
                    }
                  >
                    <Ionicons
                      name="alert-circle-outline"
                      size={18}
                      color={COLORS.error}
                    />

                    <Text
                      style={styles.errorText}
                    >
                      {error}
                    </Text>
                  </Animated.View>
                ) : null}
              </View>

              {/* ==================================================
                  CTA
              ================================================== */}

              <Animated.View
                entering={FadeInUp
                  .delay(530)
                  .duration(600)}
                style={styles.ctaSection}
              >
                {!isEditMode && (
                  <Animated.View
                    pointerEvents="none"
                    style={[
                      styles.ctaGlow,
                      buttonGlowStyle,
                    ]}
                  />
                )}

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={
                    isEditMode
                      ? "Save profile changes"
                      : "Create Profile"
                  }
                  accessibilityState={{
                    disabled:
                      !canContinue ||
                      isSubmitting,
                    busy: isSubmitting,
                  }}
                  disabled={
                    !canContinue ||
                    isSubmitting
                  }
                  onPress={() =>
                    void saveProfile()
                  }
                  style={({ pressed }) => [
                    styles.ctaButton,
                    isEditMode && styles.ctaButtonEdit,
                    (!canContinue ||
                      isSubmitting) &&
                      styles.ctaDisabled,
                    pressed &&
                      canContinue &&
                      !isSubmitting &&
                      styles.ctaPressed,
                  ]}
                >
                  <LinearGradient
                    colors={[
                      "#00DFF0",
                      "#247EFF",
                      "#8B2EFF",
                    ]}
                    start={{
                      x: 0,
                      y: 0.5,
                    }}
                    end={{
                      x: 1,
                      y: 0.5,
                    }}
                    style={styles.ctaGradient}
                  >
                    {isSubmitting ? (
                      <>
                        <ActivityIndicator
                          size="small"
                          color="#FFFFFF"
                        />

                        <Text
                          style={
                            styles.ctaText
                          }
                        >
                          {isEditMode
                            ? "Saving…"
                            : "Creating…"}
                        </Text>
                      </>
                    ) : (
                      <>
                        <Text
                          style={
                            styles.ctaText
                          }
                        >
                          {isEditMode
                            ? "Save Changes"
                            : "Create Profile"}
                        </Text>

                        <View
                          style={
                            styles.ctaArrow
                          }
                        >
                          <Ionicons
                            name="arrow-forward"
                            size={27}
                            color="#FFFFFF"
                          />
                        </View>
                      </>
                    )}
                  </LinearGradient>
                </Pressable>
              </Animated.View>

              {/* ==================================================
                  TERMS
              ================================================== */}

              {!isEditMode && (
<Animated.View
                entering={FadeIn
                  .delay(650)
                  .duration(500)}
                style={styles.terms}
              >
                <View
                  style={styles.lockCircle}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={13}
                    color="#738791"
                  />
                </View>

                <Text
                  style={styles.termsText}
                >
                  <Text
                    style={styles.termsLink}
                  >
                    Terms of Service
                  </Text>{" "}
                  and{" "}
                  <Text
                    style={styles.termsLink}
                  >
                    Privacy Policy
                  </Text>
                  .
                </Text>
              </Animated.View>
              )}

              <View
                style={styles.bottomSpacer}
              />
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
    </SafeAreaView>
  );
}

/* ============================================================
   STYLES
   ============================================================ */

function createStyles(
  screenWidth: number,
  screenHeight: number,
  compact: boolean,
  theme: ReturnType<typeof useTheme>,
  isEditMode: boolean,
) {
  return StyleSheet.create({
    /* ========================================================
       ROOT
    ======================================================== */

    safeArea: {
      flex: 1,
      backgroundColor: COLORS.background,
    },

    screen: {
      width: screenWidth,
      height: screenHeight,
      backgroundColor: COLORS.background,
      overflow: "hidden",
    },

    keyboard: {
      flex: 1,
    },

    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: compact ? 20 : 24,
      paddingTop: isEditMode ? (compact ? 10 : 12) : (compact ? 57 : 64),
      paddingBottom: 20,
    },

    /* ========================================================
       AMBIENT GLOW
    ======================================================== */

    topAmbientGlow: {
      position: "absolute",
      top: -screenHeight * 0.05,
      left: screenWidth * 0.08,
      width: screenWidth * 0.84,
      height: screenWidth * 0.68,
      borderRadius: screenWidth,
      backgroundColor:
        "rgba(0, 211, 255, 0.045)",
    },

    centerAmbientGlow: {
      position: "absolute",
      top: screenHeight * 0.30,
      left: screenWidth * 0.10,
      width: screenWidth * 0.80,
      height: screenWidth * 0.80,
      borderRadius: screenWidth,
      backgroundColor:
        "rgba(56, 66, 255, 0.025)",
    },

    bottomAmbientGlow: {
      position: "absolute",
      bottom: -screenWidth * 0.12,
      left: -screenWidth * 0.1,
      width: screenWidth * 1.2,
      height: screenWidth * 0.48,
      borderRadius: screenWidth,
      backgroundColor:
        "rgba(0, 181, 255, 0.035)",
    },

    /* ========================================================
       BOTTOM REEL
    ======================================================== */

    bottomFilmReel: {
      position: "absolute",
      left: -6,
      bottom: -2,
      width: screenWidth + 12,
      height: screenWidth * 0.54,
      opacity: 1,
      zIndex: 1,
    },

    /* ========================================================
       BACK BUTTON
    ======================================================== */

    backButtonWrapper: {
      position: "absolute",
      top: compact ? 9 : 11,
      left: compact ? 16 : 18,
      zIndex: 50,
    },

    backButton: {
      width: 42,
      height: 42,
      borderRadius: 14,
      borderWidth: 1.35,
      borderColor: "#15576B",
      backgroundColor: "#061822",
      alignItems: "center",
      justifyContent: "center",
    },

    backButtonPressed: {
      opacity: 0.72,
      transform: [
        {
          scale: 0.95,
        },
      ],
    },

    /* ========================================================
       BRAND
    ======================================================== */

    brandSection: {
      alignItems: "center",
      marginTop: isEditMode ? (compact ? 0 : 2) : (compact ? 4 : 8),
    },

    logo: {
      width: isEditMode ? (compact ? 196 : 210) : (compact ? 190 : 215),
      height: isEditMode ? (compact ? 76 : 84) : (compact ? 72 : 80),
    },

    brandAccentRow: {
      width: "74%",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginTop: compact ? -5 : -3,
    },

    brandLine: {
      flex: 1,
      height: 1,
      backgroundColor:
        "rgba(0, 229, 245, 0.28)",
    },

    brandDot: {
      width: 3,
      height: 3,
      borderRadius: 2,
      backgroundColor: COLORS.cyan,
      marginHorizontal: 5,
    },

    brandText: {
      color: "#6E929D",
      fontSize: compact ? 8 : 8.5,
      fontWeight: "700",
      letterSpacing: 1.6,
      marginHorizontal: 6,
    },

    /* ========================================================
       HERO TITLE
    ======================================================== */

    heroTitleSection: {
      alignItems: "center",
      marginTop: isEditMode ? (compact ? 2 : 3) : (compact ? 9 : 13),
    },

    editTitle: {
      marginTop: 20,
      color: COLORS.white,
      fontSize: 29,
      lineHeight: 35,
      fontWeight: "800",
      letterSpacing: -1.05,
      textAlign: "center",
    },

    title: {
      color: COLORS.white,
      fontSize: isEditMode ? (compact ? 24 : 26) : (compact ? 30 : 35),
      lineHeight: isEditMode ? (compact ? 29 : 32) : (compact ? 36 : 42),
      fontWeight: "800",
      letterSpacing: -1.1,
    },

    titleAccentRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: -2,
    },

    titleAccent: {
      fontSize: isEditMode ? (compact ? 26 : 28) : (compact ? 32 : 37),
      lineHeight: isEditMode ? (compact ? 31 : 34) : (compact ? 38 : 44),
      fontWeight: "800",
      letterSpacing: -1.1,
      color: COLORS.cyan,
      textShadowColor:
        "rgba(0, 229, 245, 0.32)",
      textShadowOffset: {
        width: 0,
        height: 0,
      },
      textShadowRadius: 12,
    },

    titleSparkle: {
      color: "#9C5CFF",
      fontSize: isEditMode ? (compact ? 13 : 15) : (compact ? 18 : 21),
      marginLeft: 8,
      marginTop: -17,
      textShadowColor: "#8B2EFF",
      textShadowOffset: {
        width: 0,
        height: 0,
      },
      textShadowRadius: 8,
    },

    subtitle: {
      color: COLORS.secondary,
      fontSize: isEditMode ? (compact ? 12.5 : 13.5) : (compact ? 13.5 : 15),
      lineHeight: isEditMode ? (compact ? 18 : 19) : (compact ? 20 : 21),
      textAlign: "center",
      marginTop: 5,
    },

    subtitleDivider: {
      width: "56%",
      flexDirection: "row",
      alignItems: "center",
      marginTop: isEditMode ? (compact ? 6 : 7) : (compact ? 8 : 10),
    },

    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor:
        "rgba(0, 229, 245, 0.18)",
    },

    dividerCenter: {
      flexDirection: "row",
      alignItems: "center",
      marginHorizontal: 8,
    },

    dividerDot: {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: COLORS.cyan,
    },

    dividerDotSmall: {
      width: 2,
      height: 2,
      borderRadius: 1,
      backgroundColor: "#8B2EFF",
      marginHorizontal: 4,
    },

    /* ========================================================
       CREATOR IDENTITY
    ======================================================== */

    identitySection: {
      alignItems: "center",
      position: "relative",
      marginTop: isEditMode ? (compact ? 10 : 12) : (compact ? 14 : 18),
    },

    avatarGlow: {
      position: "absolute",
      top: compact ? 0 : 2,
      width: isEditMode ? (compact ? 126 : 132) : (compact ? 174 : 202),
      height: isEditMode ? (compact ? 126 : 132) : (compact ? 174 : 202),
      borderRadius: 110,
      backgroundColor:
        "rgba(0, 217, 255, 0.09)",
      shadowColor: COLORS.cyan,
      shadowOffset: {
        width: 0,
        height: 0,
      },
      shadowOpacity: 0.75,
      shadowRadius: 34,
      elevation: 12,
    },

    orbitRing: {
      position: "absolute",
      top: isEditMode ? (compact ? -5 : -6) : (compact ? -7 : -8),
      width: isEditMode ? (compact ? 130 : 136) : (compact ? 178 : 206),
      height: isEditMode ? (compact ? 130 : 136) : (compact ? 178 : 206),
      borderRadius: 110,
      borderWidth: 1,
      borderColor:
        "rgba(0, 229, 245, 0.17)",
    },

    orbitRingInner: {
      position: "absolute",
      top: isEditMode ? (compact ? 4 : 5) : (compact ? 5 : 6),
      width: isEditMode ? (compact ? 116 : 122) : (compact ? 160 : 187),
      height: isEditMode ? (compact ? 116 : 122) : (compact ? 160 : 187),
      borderRadius: 110,
      borderWidth: 1,
      borderColor:
        "rgba(139, 46, 255, 0.15)",
    },

    avatarWrapper: {
      width: isEditMode ? (compact ? 120 : 124) : (compact ? 150 : 174),
      height: isEditMode ? (compact ? 120 : 124) : (compact ? 150 : 174),
      borderRadius: 100,
      position: "relative",
    },

    avatarGradient: {
      width: "100%",
      height: "100%",
      borderRadius: 100,
      padding: 3,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: COLORS.cyan,
      shadowOffset: {
        width: 0,
        height: 0,
      },
      shadowOpacity: 0.5,
      shadowRadius: 18,
      elevation: 10,
    },

    avatarInner: {
      width: "100%",
      height: "100%",
      borderRadius: 100,
      backgroundColor: "#071722",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor:
        "rgba(255,255,255,0.04)",
      overflow: "hidden",
    },

    avatarImage: {
      width: "100%",
      height: "100%",
    },

    editCameraButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
    },

    cameraButton: {
      position: "absolute",
      right: compact ? 0 : 1,
      bottom: compact ? 1 : 3,
      width: isEditMode ? (compact ? 44 : 48) : (compact ? 50 : 54),
      height: isEditMode ? (compact ? 44 : 48) : (compact ? 50 : 54),
      borderRadius: 100,
      backgroundColor: "#031017",
      borderWidth: 2,
      borderColor: "#031017",
      padding: 2,
      shadowColor: COLORS.cyan,
      shadowOffset: {
        width: 0,
        height: 0,
      },
      shadowOpacity: 0.65,
      shadowRadius: 12,
      elevation: 12,
    },

    cameraGradient: {
      flex: 1,
      borderRadius: 100,
      alignItems: "center",
      justifyContent: "center",
    },

    cameraPressed: {
      transform: [
        {
          scale: 0.92,
        },
      ],
    },

    sparkle: {
      position: "absolute",
      fontWeight: "700",
      textShadowOffset: {
        width: 0,
        height: 0,
      },
    },

    sparkleOne: {
      top: compact ? 8 : 10,
      left: "27%",
      color: COLORS.cyan,
      fontSize: isEditMode ? (compact ? 14 : 16) : (compact ? 17 : 20),
      textShadowColor: COLORS.cyan,
      textShadowRadius: 9,
    },

    sparkleTwo: {
      top: compact ? 32 : 38,
      right: "22%",
      color: "#B16CFF",
      fontSize: isEditMode ? (compact ? 16 : 19) : (compact ? 20 : 24),
      textShadowColor: COLORS.purple,
      textShadowRadius: 9,
    },

    sparkleThree: {
      bottom: compact ? 47 : 55,
      left: "21%",
      color: "#70BFFF",
      fontSize: isEditMode ? (compact ? 11 : 13) : (compact ? 13 : 15),
      textShadowColor: COLORS.blue,
      textShadowRadius: 8,
    },

    sparkleFour: {
      bottom: compact ? 67 : 78,
      right: "20%",
      color: COLORS.cyan,
      fontSize: isEditMode ? (compact ? 13 : 15) : (compact ? 16 : 18),
      textShadowColor: COLORS.cyan,
      textShadowRadius: 8,
    },

    creatorBadge: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: isEditMode ? (compact ? 5 : 6) : (compact ? 8 : 10),
      paddingHorizontal: isEditMode ? 8 : 10,
      height: isEditMode ? 17 : 23,
      borderRadius: 20,
      borderWidth: 1,
      borderColor:
        "rgba(0,229,245,0.20)",
      backgroundColor:
        "rgba(0,229,245,0.045)",
    },

    creatorBadgeDot: {
      width: 5,
      height: 5,
      borderRadius: 3,
      backgroundColor: COLORS.cyan,
      marginRight: 6,
      shadowColor: COLORS.cyan,
      shadowRadius: 6,
      shadowOpacity: 0.7,
    },

    creatorBadgeText: {
      color: "#69A9B5",
      fontSize: isEditMode ? 7.2 : 8.5,
      lineHeight: isEditMode ? 9 : 11,
      fontWeight: "800",
      letterSpacing: 1.4,
    },

    photoTitle: {
      color: COLORS.white,
      fontSize: isEditMode ? (compact ? 15 : 16) : (compact ? 16 : 17),
      lineHeight: isEditMode ? 19 : 21,
      fontWeight: "700",
      marginTop: 5,
    },

    photoSubtitle: {
      color: COLORS.secondary,
      fontSize: isEditMode ? (compact ? 10.5 : 11.5) : (compact ? 11 : 12),
      lineHeight: isEditMode ? 15 : 16,
      marginTop: 2,
    },

    /* ========================================================
       FORM
    ======================================================== */

    form: {
      marginTop: isEditMode ? (compact ? 5 : 6) : (compact ? 14 : 18),
    },

    fieldGroup: {
      marginBottom: compact ? 12 : 15,
    },

    labelRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    fieldLabel: {
      color: COLORS.white,
      fontSize: compact ? 14 : 15,
      lineHeight: 19,
      fontWeight: "700",
      marginBottom: compact ? 6 : 7,
    },

    optional: {
      color: "#5F7B86",
      fontSize: 8.5,
      lineHeight: 12,
      fontWeight: "800",
      letterSpacing: 1.1,
      marginBottom: compact ? 6 : 7,
    },

    inputCard: {
      height: compact ? 58 : 62,
      borderRadius: compact ? 17 : 19,
      borderWidth: 1.15,
      borderColor: "#153D4D",
      backgroundColor:
        "rgba(6,20,29,0.88)",
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
    },

    inputCardFocused: {
      borderColor: COLORS.cyan,
      backgroundColor:
        "rgba(6,24,33,0.98)",
      shadowColor: COLORS.cyan,
      shadowOffset: {
        width: 0,
        height: 0,
      },
      shadowOpacity: 0.18,
      shadowRadius: 12,
      elevation: 5,
    },

    inputCardError: {
      borderColor: COLORS.error,
    },

    inputIconBox: {
      width: 39,
      height: 39,
      borderRadius: 12,
      backgroundColor:
        "rgba(0,229,245,0.055)",
      borderWidth: 1,
      borderColor:
        "rgba(0,229,245,0.08)",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 9,
    },

    input: {
      flex: 1,
      color: COLORS.white,
      fontSize: compact ? 15 : 16,
      lineHeight: 20,
      paddingVertical: 0,
      paddingHorizontal: 0,
      includeFontPadding: false,
    },

    /* ========================================================
       PHONE
    ======================================================== */

    phoneCard: {
      height: compact ? 66 : 70,
      borderRadius: compact ? 18 : 20,
      borderWidth: 1.2,
      borderColor: "#07849A",
      backgroundColor:
        "rgba(4,22,30,0.96)",
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 11,
      shadowColor: COLORS.cyan,
      shadowOffset: {
        width: 0,
        height: 0,
      },
      shadowOpacity: 0.10,
      shadowRadius: 12,
      elevation: 4,
    },

    phoneIconBox: {
      width: 39,
      height: 39,
      borderRadius: 12,
      backgroundColor:
        "rgba(0,229,245,0.065)",
      borderWidth: 1,
      borderColor:
        "rgba(0,229,245,0.12)",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 8,
    },

    flag: {
      fontSize: compact ? 22 : 24,
      marginRight: 8,
    },

    phoneNumber: {
      flex: 1,
      color: COLORS.white,
      fontSize: compact ? 15 : 16,
      lineHeight: 21,
      fontWeight: "600",
    },

    verifiedBadge: {
      width: compact ? 40 : 44,
      height: compact ? 40 : 44,
      borderRadius: 100,
      backgroundColor: COLORS.cyan,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: COLORS.cyan,
      shadowOffset: {
        width: 0,
        height: 0,
      },
      shadowOpacity: 0.42,
      shadowRadius: 11,
      elevation: 8,
    },

    verifiedRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 6,
      paddingLeft: 3,
    },

    verifiedIcon: {
      width: 20,
      height: 20,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
    },

    verifiedText: {
      color: COLORS.cyan,
      fontSize: compact ? 11.5 : 12.5,
      lineHeight: 16,
      fontWeight: "600",
      marginLeft: 4,
    },

    verifiedLine: {
      flex: 1,
      height: 1,
      backgroundColor:
        "rgba(0,229,245,0.10)",
      marginLeft: 9,
    },

    /* ========================================================
       ERROR
    ======================================================== */

    errorContainer: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: 13,
      borderWidth: 1,
      borderColor:
        "rgba(255,107,134,0.28)",
      backgroundColor:
        "rgba(255,107,134,0.07)",
      paddingHorizontal: 11,
      paddingVertical: 9,
      marginTop: -3,
    },

    errorText: {
      flex: 1,
      color: COLORS.error,
      fontSize: 12,
      lineHeight: 17,
      marginLeft: 7,
    },

    /* ========================================================
       CTA
    ======================================================== */

    ctaSection: {
      position: "relative",
      width: "100%",
      marginTop: compact ? 1 : 4,
    },

    ctaGlow: {
      position: "absolute",
      left: "7%",
      right: "7%",
      top: -7,
      height: compact ? 68 : 74,
      borderRadius: 40,
      backgroundColor:
        "rgba(0,216,255,0.15)",
      shadowColor: COLORS.cyan,
      shadowOffset: {
        width: 0,
        height: 0,
      },
      shadowOpacity: 0.8,
      shadowRadius: 24,
      elevation: 10,
    },

    ctaButton: {
      height: compact ? 58 : 62,
      width: "100%",
      borderRadius: compact ? 29 : 31,
      overflow: "hidden",
      borderWidth: 1,
      borderColor:
        "rgba(255,255,255,0.14)",
      shadowColor: COLORS.blue,
      shadowOffset: {
        width: 0,
        height: 7,
      },
      shadowOpacity: 0.24,
      shadowRadius: 15,
      elevation: 10,
    },

    // Edit mode: no shadow/glow underneath Save Changes.
    ctaButtonEdit: {
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },

    ctaGradient: {
      flex: 1,
      width: "100%",
      height: "100%",
      borderRadius: compact ? 29 : 31,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },

    ctaText: {
      color: COLORS.white,
      fontSize: compact ? 18 : 19,
      lineHeight: 24,
      fontWeight: "800",
      marginRight: 12,
    },

    ctaArrow: {
      width: 34,
      height: 34,
      alignItems: "center",
      justifyContent: "center",
    },

    ctaDisabled: {
      opacity: 0.42,
      shadowOpacity: 0,
      elevation: 0,
    },

    ctaPressed: {
      transform: [
        {
          scale: 0.985,
        },
      ],
    },

    /* ========================================================
       TERMS
    ======================================================== */

    terms: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "center",
      marginTop: compact ? 12 : 14,
      paddingHorizontal: 7,
    },

    lockCircle: {
      width: 19,
      height: 19,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 1,
    },

    termsText: {
      flex: 1,
      color: "#71838E",
      fontSize: compact ? 10.5 : 11.5,
      lineHeight: compact ? 15 : 17,
      textAlign: "center",
      marginLeft: 3,
    },

    termsLink: {
      color: "#B5C2C9",
      textDecorationLine: "underline",
    },

    bottomSpacer: {
      height: compact ? 110 : 135,
    },

    themePlaceholder: {
      backgroundColor: theme.colors.background,
    },
  });
}