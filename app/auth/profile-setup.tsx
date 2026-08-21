import React, { useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  Pressable,
  StyleSheet,
  TouchableWithoutFeedback,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { authService } from "../../src/services/auth/authService";

/* ============================================================
   ASSETS
   ============================================================ */

const SHIVORA_LOGO = require("../../assets/logo.png");
const BOTTOM_FILM_REEL = require("../../assets/otp-bottom-film-reel.png");

/* ============================================================
   COLORS
   ============================================================ */

const COLORS = {
  background: "#02070D",

  white: "#FFFFFF",
  text: "#F7FAFC",
  textSecondary: "#A7B7C2",
  textMuted: "#7A8B96",

  cyan: "#00E5FF",
  cyanBright: "#00F5FF",
  blue: "#287EFF",
  purple: "#9D4EDD",

  borderSoft: "#10384A",
  borderBright: "#008EA8",

  input: "#020B12",
  placeholder: "#667B88",

  error: "#FF4D6D",
};

type FocusedField = "name" | "email" | null;

/* ============================================================
   SCREEN
   ============================================================ */

export default function ProfileSetupScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();

  // Freeze the design viewport. React Native can report a smaller
  // window height while the iOS keyboard is visible. We deliberately
  // keep the original design height so the UI does not jump/reflow.
  const initialViewport = useRef({
    width,
    height,
  }).current;

  const designWidth = initialViewport.width;
  const designHeight = initialViewport.height;

  const { phone } = useLocalSearchParams<{
    phone?: string;
  }>();

  const verySmall = designHeight < 780;
  const small = designHeight < 840;

  const styles = useMemo(
    () =>
      createStyles(
        designWidth,
        designHeight,
        small,
        verySmall,
      ),
    [designHeight, designWidth, small, verySmall],
  );

  /* ============================================================
     STATE
     ============================================================ */

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profileImage, setProfileImage] =
    useState<string | null>(null);

  const [focusedField, setFocusedField] =
    useState<FocusedField>(null);

  const [error, setError] = useState<
    string | undefined
  >();

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const nameInputRef = useRef<TextInput>(null);
  const emailInputRef = useRef<TextInput>(null);

  /* ============================================================
     KEYBOARD / INPUT FOCUS
     ============================================================ */

  const dismissKeyboard = () => {
    Keyboard.dismiss();
    setFocusedField(null);
  };

  const focusName = () => {
    setFocusedField("name");

    requestAnimationFrame(() => {
      nameInputRef.current?.focus();
    });
  };

  const focusEmail = () => {
    setFocusedField("email");

    requestAnimationFrame(() => {
      emailInputRef.current?.focus();
    });
  };

  /* ============================================================
     PHONE
     ============================================================ */

  const formattedPhone = useMemo(() => {
    if (
      typeof phone !== "string" ||
      !phone
    ) {
      return "+91 7889184205";
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
  }, [phone]);

  const phoneFlag = useMemo(() => {
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
  }, [phone]);

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
     IMAGE PICKER
     Camera + Gallery
     ============================================================ */

  const openGallery = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Gallery Permission Required",
          "Please allow photo library access from Settings to choose a profile photo.",
        );
        return;
      }

      const result =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.9,
        });

      if (
        !result.canceled &&
        result.assets.length > 0
      ) {
        setProfileImage(
          result.assets[0].uri,
        );
      }
    } catch (pickerError) {
      console.error(
        "Gallery picker error:",
        pickerError,
      );

      Alert.alert(
        "Unable to Select Photo",
        "Something went wrong while selecting the photo.",
      );
    }
  };

  const openCamera = async () => {
    try {
      const permission =
        await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Camera Permission Required",
          "Please allow camera access from Settings to take a profile photo.",
        );
        return;
      }

      const result =
        await ImagePicker.launchCameraAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.9,
        });

      if (
        !result.canceled &&
        result.assets.length > 0
      ) {
        setProfileImage(
          result.assets[0].uri,
        );
      }
    } catch (cameraError) {
      console.error(
        "Camera picker error:",
        cameraError,
      );

      Alert.alert(
        "Unable to Open Camera",
        "Something went wrong while opening the camera.",
      );
    }
  };

  const handleProfileImagePress = () => {
    dismissKeyboard();

    Alert.alert(
      "Add Profile Photo",
      "Choose how you want to add your photo.",
      [
        {
          text: "Camera",
          onPress: () => {
            void openCamera();
          },
        },
        {
          text: "Gallery",
          onPress: () => {
            void openGallery();
          },
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ],
      {
        cancelable: true,
      },
    );
  };

  /* ============================================================
     SAVE PROFILE
     ============================================================ */

  const handleSaveProfile = async () => {
    dismissKeyboard();

    if (!canContinue) {
      setError(
        "Please enter your name to continue.",
      );
      return;
    }

    setError(undefined);
    setIsSubmitting(true);

    try {
      /*
       * Preserve existing profile completion flow.
       * The profile image is selected locally for now.
       */
      await authService.completeProfile({
        name: name.trim(),
        username: "",
      });

      /*
       * Open home.tsx after successful profile creation.
       */
      router.replace("/(tabs)/home");
    } catch (saveError) {
      console.error(
        "Profile save error:",
        saveError,
      );

      setError(
        saveError instanceof Error
          ? saveError.message
          : "Failed to create profile. Try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ============================================================
     BACK
     ============================================================ */

  const goBack = () => {
    dismissKeyboard();

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
      edges={["top", "bottom"]}
      style={styles.safeArea}
    >
      <TouchableWithoutFeedback
        onPress={dismissKeyboard}
        accessible={false}
      >
        <View style={styles.screen}>
        {/* ==================================================
            BACKGROUND
        ================================================== */}

        <View
          pointerEvents="none"
          style={styles.centerAmbient}
        />

        {/* ==================================================
            BACK BUTTON
        ================================================== */}

        <Pressable
          accessibilityLabel="Go back"
          accessibilityRole="button"
          hitSlop={12}
          onPress={goBack}
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.pressedOpacity,
          ]}
        >
          <Ionicons
            name="chevron-back"
            size={27}
            color={COLORS.white}
          />
        </Pressable>

        {/* ==================================================
            MAIN CONTENT
        ================================================== */}

        <View style={styles.content}>
          {/* ==================================================
              LOGO
          ================================================== */}

          <View style={styles.header}>
            <Image
              source={SHIVORA_LOGO}
              accessibilityLabel="Shivora"
              resizeMode="contain"
              style={styles.logo}
            />

            <View style={styles.brandDivider}>
              <View style={styles.brandLine} />

              <View style={styles.brandDot} />

              <Text style={styles.brandText}>
                AI VIDEO CREATION
              </Text>

              <View style={styles.brandDot} />

              <View style={styles.brandLine} />
            </View>
          </View>

          {/* ==================================================
              TITLE
          ================================================== */}

          <View style={styles.titleBlock}>
            <Text style={styles.title}>
              Create your{" "}
              <Text style={styles.titleAccent}>
                profile
              </Text>
              <Text style={styles.titleSpark}>
                {" "}✦
              </Text>
            </Text>

            <View style={styles.subtitleRow}>
              <View style={styles.subtitleLine} />

              <Text style={styles.subtitle}>
                Let’s personalize your Shivora experience
              </Text>

              <View style={styles.subtitleLine} />
            </View>

            <View style={styles.miniDivider}>
              <View style={styles.miniLine} />

              <View style={styles.miniDots}>
                <View style={styles.miniDot} />

                <View
                  style={styles.miniDotTiny}
                />

                <View style={styles.miniDot} />
              </View>

              <View style={styles.miniLine} />
            </View>
          </View>

          {/* ==================================================
              PROFILE PHOTO
          ================================================== */}

          <View style={styles.avatarBlock}>
            <View
              pointerEvents="none"
              style={styles.avatarGlow}
            />

            <View
              pointerEvents="none"
              style={styles.avatarOrbitOuter}
            />

            <View
              pointerEvents="none"
              style={styles.avatarOrbitInner}
            />

            <View
              style={styles.avatarRingOuter}
            >
              <LinearGradient
                colors={[
                  COLORS.cyan,
                  COLORS.blue,
                  COLORS.purple,
                ]}
                start={{
                  x: 0.02,
                  y: 0.02,
                }}
                end={{
                  x: 0.98,
                  y: 0.98,
                }}
                style={
                  styles.avatarGradientBorder
                }
              >
                <View
                  style={styles.avatarInnerBg}
                >
                  {profileImage ? (
                    <Image
                      source={{
                        uri: profileImage,
                      }}
                      resizeMode="cover"
                      style={styles.profileImage}
                    />
                  ) : (
                    <Ionicons
                      name="person-outline"
                      size={
                        verySmall
                          ? 35
                          : small
                            ? 39
                            : 43
                      }
                      color="#7B8A94"
                    />
                  )}
                </View>
              </LinearGradient>

              {/* CAMERA / GALLERY */}

              <Pressable
                accessibilityLabel="Add profile photo"
                accessibilityRole="button"
                hitSlop={8}
                onPress={handleProfileImagePress}
                style={({ pressed }) => [
                  styles.cameraBtn,
                  pressed &&
                    styles.cameraPressed,
                ]}
              >
                <LinearGradient
                  colors={[
                    COLORS.cyanBright,
                    "#00B7E8",
                  ]}
                  start={{
                    x: 0,
                    y: 0,
                  }}
                  end={{
                    x: 1,
                    y: 1,
                  }}
                  style={
                    styles.cameraBtnGradient
                  }
                >
                  <Ionicons
                    name={
                      profileImage
                        ? "create-outline"
                        : "camera-outline"
                    }
                    size={
                      verySmall
                        ? 17
                        : 19
                    }
                    color="#02070D"
                  />
                </LinearGradient>
              </Pressable>

              {/* SPARKLES */}

              <Text
                pointerEvents="none"
                style={styles.sparkle1}
              >
                ✦
              </Text>

              <Text
                pointerEvents="none"
                style={styles.sparkle2}
              >
                ✧
              </Text>

              <Text
                pointerEvents="none"
                style={styles.sparkle3}
              >
                ✦
              </Text>
            </View>
          </View>

          {/* ==================================================
              FORM
          ================================================== */}

          <View style={styles.formArea}>
            {/* FULL NAME */}

            <Pressable
              style={styles.formCard}
              onPress={focusName}
              android_ripple={{
                color: "rgba(0,229,255,0.04)",
              }}
            >
              <View
                style={styles.formHeader}
              >
                <Ionicons
                  name="person-outline"
                  size={19}
                  color={COLORS.cyan}
                />

                <Text
                  style={styles.formTitle}
                >
                  Full name
                </Text>
              </View>

              <View
                style={[
                  styles.inputBox,
                  focusedField ===
                    "name" &&
                    styles.inputBoxFocused,
                  error &&
                    name.trim().length <
                      2 &&
                    styles.inputBoxError,
                ]}
              >
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={
                    focusedField ===
                    "name"
                      ? COLORS.cyan
                      : COLORS.placeholder
                  }
                  style={styles.inputIcon}
                />

                <TextInput
                  ref={nameInputRef}
                  accessibilityLabel="Full name"
                  autoCapitalize="words"
                  autoCorrect={false}
                  showSoftInputOnFocus
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
                  placeholderTextColor={
                    COLORS.placeholder
                  }
                  returnKeyType="next"
                  onSubmitEditing={focusEmail}
                  blurOnSubmit={false}
                  style={styles.input}
                  value={name}
                />
              </View>
            </Pressable>

            {/* EMAIL */}

            <Pressable
              style={styles.formCard}
              onPress={focusEmail}
              android_ripple={{
                color: "rgba(0,229,255,0.04)",
              }}
            >
              <View
                style={styles.formHeader}
              >
                <Ionicons
                  name="mail-outline"
                  size={19}
                  color={COLORS.cyan}
                />

                <Text
                  style={styles.formTitle}
                >
                  Email address
                </Text>
              </View>

              <View
                style={[
                  styles.inputBox,
                  focusedField ===
                    "email" &&
                    styles.inputBoxFocused,
                ]}
              >
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={
                    focusedField ===
                    "email"
                      ? COLORS.cyan
                      : COLORS.placeholder
                  }
                  style={styles.inputIcon}
                />

                <TextInput
                  ref={emailInputRef}
                  accessibilityLabel="Email address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
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
                  placeholderTextColor={
                    COLORS.placeholder
                  }
                  returnKeyType="done"
                  onSubmitEditing={dismissKeyboard}
                  style={styles.input}
                  value={email}
                />
              </View>
            </Pressable>

            {/* MOBILE */}

            <View
              style={[
                styles.formCard,
                styles.verifiedCard,
              ]}
            >
              <View
                style={styles.formHeader}
              >
                <Ionicons
                  name="call-outline"
                  size={19}
                  color={COLORS.cyan}
                />

                <Text
                  style={styles.formTitle}
                >
                  Mobile number
                </Text>
              </View>

              <View
                style={styles.phoneDisplayBox}
              >
                <Ionicons
                  name="call-outline"
                  size={20}
                  color={COLORS.cyan}
                  style={styles.inputIcon}
                />

                <Text style={styles.flag}>
                  {phoneFlag}
                </Text>

                <Text
                  numberOfLines={1}
                  style={styles.phoneText}
                >
                  {formattedPhone}
                </Text>

                <View
                  style={styles.checkCircle}
                >
                  <Ionicons
                    name="checkmark"
                    size={21}
                    color="#02070D"
                  />
                </View>
              </View>

              <View
                style={styles.verifiedTagRow}
              >
                <Ionicons
                  name="shield-checkmark"
                  size={15}
                  color={COLORS.cyan}
                />

                <Text
                  style={
                    styles.verifiedTagText
                  }
                >
                  This number is verified
                </Text>

                <View
                  style={styles.verifiedLine}
                />
              </View>
            </View>

            {error ? (
              <Text
                style={styles.errorText}
              >
                {error}
              </Text>
            ) : null}
          </View>

          {/* ==================================================
              CREATE PROFILE
          ================================================== */}

          <View style={styles.actionBlock}>
            <Pressable
              disabled={
                !canContinue ||
                isSubmitting
              }
              onPress={() =>
                void handleSaveProfile()
              }
              accessibilityRole="button"
              accessibilityLabel="Create Profile"
              accessibilityState={{
                disabled:
                  !canContinue ||
                  isSubmitting,
                busy: isSubmitting,
              }}
              style={({ pressed }) => [
                styles.ctaBtn,
                (!canContinue ||
                  isSubmitting) &&
                  styles.ctaDisabled,
                pressed &&
                  canContinue &&
                  !isSubmitting &&
                  styles.pressedOpacity,
              ]}
            >
              <LinearGradient
                colors={[
                  "#00E5FF",
                  "#287EFF",
                  "#9D4EDD",
                ]}
                start={{
                  x: 0,
                  y: 0.5,
                }}
                end={{
                  x: 1,
                  y: 0.5,
                }}
                style={
                  styles.ctaGradient
                }
              >
                {isSubmitting ? (
                  <ActivityIndicator
                    color="#FFFFFF"
                    size="small"
                  />
                ) : (
                  <>
                    <Text
                      style={styles.ctaText}
                    >
                      Create Profile
                    </Text>

                    <Ionicons
                      name="arrow-forward"
                      size={24}
                      color="#FFFFFF"
                    />
                  </>
                )}
              </LinearGradient>
            </Pressable>

            <View
              style={styles.termsRow}
            >
              <Ionicons
                name="lock-closed-outline"
                size={12}
                color={COLORS.textMuted}
              />

              <Text
                style={styles.termsText}
              >
                By continuing, you agree to our{" "}
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
            </View>
          </View>
        </View>

        {/* ==================================================
            BOTTOM FILM REEL
        ================================================== */}

        <Image
          source={BOTTOM_FILM_REEL}
          resizeMode="stretch"
          style={styles.bottomReel}
        />
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

/* ============================================================
   STYLES
   ============================================================ */

function createStyles(
  screenWidth: number,
  screenHeight: number,
  small: boolean,
  verySmall: boolean,
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

    content: {
      flex: 1,
      paddingHorizontal: small ? 19 : 21,
      paddingTop: verySmall
        ? 8
        : small
          ? 11
          : 14,
      paddingBottom: verySmall
        ? 20
        : 24,
      zIndex: 5,
    },

    /* ========================================================
       BACKGROUND
    ======================================================== */

    centerAmbient: {
      position: "absolute",
      top: screenHeight * 0.27,
      left: screenWidth * 0.09,
      width: screenWidth * 0.82,
      height: screenWidth * 0.82,
      borderRadius: screenWidth,
      backgroundColor:
        "rgba(68,62,255,0.018)",
    },

    /* ========================================================
       BACK BUTTON
    ======================================================== */

    backButton: {
      position: "absolute",
      top: verySmall ? 8 : 11,
      left: 16,
      width: 44,
      height: 44,
      borderRadius: 14,
      borderWidth: 1.15,
      borderColor:
        "rgba(0,229,255,0.22)",
      backgroundColor:
        "rgba(7,22,32,0.82)",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 30,
    },

    pressedOpacity: {
      opacity: 0.75,
    },

    /* ========================================================
       HEADER
    ======================================================== */

    header: {
      alignItems: "center",
      width: "100%",
    },

    logo: {
      width: verySmall
        ? 205
        : small
          ? 225
          : 245,
      height: verySmall
        ? 62
        : small
          ? 68
          : 74,
    },

    brandDivider: {
      width: "65%",
      flexDirection: "row",
      alignItems: "center",
      marginTop: 1,
    },

    brandLine: {
      flex: 1,
      height: 1,
      backgroundColor:
        "rgba(0,229,255,0.22)",
    },

    brandDot: {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: COLORS.cyan,
      marginHorizontal: 5,
    },

    brandText: {
      color: "#668E9A",
      fontSize: verySmall ? 7 : 8,
      fontWeight: "700",
      letterSpacing: 1.3,
    },

    /* ========================================================
       TITLE
    ======================================================== */

    titleBlock: {
      alignItems: "center",
      marginTop: verySmall
        ? 5
        : small
          ? 7
          : 9,
    },

    title: {
      color: COLORS.white,
      fontSize: verySmall
        ? 23
        : small
          ? 25
          : 27,
      lineHeight: verySmall
        ? 28
        : small
          ? 31
          : 33,
      fontWeight: "800",
      letterSpacing: -0.5,
      textAlign: "center",
    },

    titleAccent: {
      color: COLORS.cyan,
      textShadowColor:
        "rgba(0,229,255,0.38)",
      textShadowOffset: {
        width: 0,
        height: 0,
      },
      textShadowRadius: 8,
    },

    titleSpark: {
      color: COLORS.purple,
      fontSize: 14,
    },

    subtitleRow: {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginTop: 3,
    },

    subtitle: {
      color: COLORS.textSecondary,
      fontSize: verySmall
        ? 10.5
        : small
          ? 11.5
          : 13,
      lineHeight: verySmall
        ? 14
        : small
          ? 16
          : 18,
      textAlign: "center",
      marginHorizontal: 7,
    },

    subtitleLine: {
      flex: 1,
      maxWidth: 52,
      height: 1,
      backgroundColor: COLORS.cyan,
      opacity: 0.5,
    },

    miniDivider: {
      width: "48%",
      flexDirection: "row",
      alignItems: "center",
      marginTop: 4,
    },

    miniLine: {
      flex: 1,
      height: 1,
      backgroundColor:
        "rgba(0,229,255,0.14)",
    },

    miniDots: {
      flexDirection: "row",
      alignItems: "center",
      marginHorizontal: 6,
    },

    miniDot: {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: COLORS.cyan,
    },

    miniDotTiny: {
      width: 2,
      height: 2,
      borderRadius: 1,
      backgroundColor: COLORS.purple,
      marginHorizontal: 4,
    },

    /* ========================================================
       AVATAR
    ======================================================== */

    avatarBlock: {
      alignItems: "center",

      marginTop: verySmall
        ? 16
        : small
          ? 18
          : 21,

      marginBottom: verySmall
        ? 2
        : small
          ? 4
          : 6,

      position: "relative",
    },

    avatarGlow: {
      position: "absolute",
      top: -5,
      width: verySmall
        ? 116
        : small
          ? 128
          : 140,
      height: verySmall
        ? 116
        : small
          ? 128
          : 140,
      borderRadius: 100,
      backgroundColor:
        "rgba(0,215,255,0.07)",
    },

    avatarOrbitOuter: {
      position: "absolute",
      top: -6,
      width: verySmall
        ? 124
        : small
          ? 136
          : 148,
      height: verySmall
        ? 124
        : small
          ? 136
          : 148,
      borderRadius: 100,
      borderWidth: 1,
      borderColor:
        "rgba(0,229,255,0.17)",
    },

    avatarOrbitInner: {
      position: "absolute",
      top: 0,
      width: verySmall
        ? 112
        : small
          ? 124
          : 136,
      height: verySmall
        ? 112
        : small
          ? 124
          : 136,
      borderRadius: 100,
      borderWidth: 1,
      borderColor:
        "rgba(157,78,221,0.17)",
    },

    avatarRingOuter: {
      width: verySmall
        ? 108
        : small
          ? 120
          : 132,
      height: verySmall
        ? 108
        : small
          ? 120
          : 132,
      position: "relative",
      alignItems: "center",
      justifyContent: "center",
    },

    avatarGradientBorder: {
      width: "100%",
      height: "100%",
      borderRadius: 100,
      padding: 3,
    },

    avatarInnerBg: {
      flex: 1,
      borderRadius: 100,
      backgroundColor: "#030D16",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    },

    profileImage: {
      width: "100%",
      height: "100%",
      borderRadius: 100,
    },

    cameraBtn: {
      position: "absolute",
      bottom: 0,
      right: -1,
      width: verySmall
        ? 34
        : small
          ? 38
          : 41,
      height: verySmall
        ? 34
        : small
          ? 38
          : 41,
      borderRadius: 100,
      padding: 2,
      backgroundColor: "#02070D",
      borderWidth: 2,
      borderColor: "#02070D",
    },

    cameraBtnGradient: {
      flex: 1,
      borderRadius: 100,
      alignItems: "center",
      justifyContent: "center",
    },

    cameraPressed: {
      transform: [{ scale: 0.92 }],
    },

    sparkle1: {
      position: "absolute",
      top: -2,
      left: -2,
      color: COLORS.cyan,
      fontSize: 14,
      textShadowColor: COLORS.cyan,
      textShadowRadius: 7,
    },

    sparkle2: {
      position: "absolute",
      top: 20,
      right: -9,
      color: COLORS.purple,
      fontSize: 15,
      textShadowColor: COLORS.purple,
      textShadowRadius: 7,
    },

    sparkle3: {
      position: "absolute",
      bottom: 23,
      left: -4,
      color: "#62B8FF",
      fontSize: 11,
    },

    /* ========================================================
       FORM
    ======================================================== */

    formArea: {
      marginTop: verySmall
        ? 10
        : small
          ? 13
          : 16,
      gap: verySmall
        ? 5
        : small
          ? 7
          : 9,
    },

    formCard: {
      backgroundColor:
        "rgba(4,16,26,0.94)",
      borderRadius: 15,
      padding: verySmall ? 8 : 10,
      borderWidth: 1.1,
      borderColor:
        "rgba(18,58,76,0.98)",
    },

    verifiedCard: {
      borderColor:
        "rgba(0,229,255,0.45)",
    },

    formHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 6,
    },

    formTitle: {
      color: COLORS.white,
      fontSize: verySmall
        ? 13
        : small
          ? 14
          : 15,
      fontWeight: "700",
      marginLeft: 6,
    },

    inputBox: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: COLORS.input,
      borderRadius: 11,
      borderWidth: 1.1,
      borderColor:
        "rgba(18,61,78,0.98)",
      paddingHorizontal: 10,
      height: verySmall
        ? 43
        : small
          ? 47
          : 50,
    },

    inputBoxFocused: {
      borderColor: COLORS.cyan,
      shadowColor: COLORS.cyan,
      shadowOffset: {
        width: 0,
        height: 0,
      },
      shadowOpacity: 0.16,
      shadowRadius: 8,
      elevation: 3,
    },

    inputBoxError: {
      borderColor: COLORS.error,
    },

    inputIcon: {
      marginRight: 8,
    },

    input: {
      flex: 1,
      color: COLORS.white,
      fontSize: verySmall
        ? 13
        : small
          ? 14
          : 15,
      lineHeight: 19,
      paddingVertical: 0,
      paddingHorizontal: 0,
      includeFontPadding: false,
    },

    /* ========================================================
       PHONE
    ======================================================== */

    phoneDisplayBox: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: COLORS.input,
      borderRadius: 11,
      borderWidth: 1.1,
      borderColor:
        "rgba(0,142,168,0.95)",
      paddingHorizontal: 10,
      height: verySmall
        ? 44
        : small
          ? 48
          : 51,
    },

    flag: {
      fontSize: verySmall
        ? 17
        : small
          ? 18
          : 20,
      marginRight: 6,
    },

    phoneText: {
      flex: 1,
      color: COLORS.white,
      fontSize: verySmall
        ? 13
        : small
          ? 14
          : 15,
      fontWeight: "600",
    },

    checkCircle: {
      width: verySmall
        ? 31
        : small
          ? 34
          : 37,
      height: verySmall
        ? 31
        : small
          ? 34
          : 37,
      borderRadius: 100,
      backgroundColor: COLORS.cyan,
      alignItems: "center",
      justifyContent: "center",
    },

    verifiedTagRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 4,
      paddingHorizontal: 1,
    },

    verifiedTagText: {
      color: COLORS.cyan,
      fontSize: verySmall
        ? 9
        : small
          ? 9.5
          : 10.5,
      fontWeight: "600",
      marginLeft: 4,
    },

    verifiedLine: {
      flex: 1,
      height: 1,
      backgroundColor:
        "rgba(0,229,255,0.08)",
      marginLeft: 7,
    },

    errorText: {
      color: COLORS.error,
      fontSize: 10,
      textAlign: "center",
      marginTop: 0,
    },

    /* ========================================================
       ACTION
    ======================================================== */

    actionBlock: {
      marginTop: verySmall
        ? 13
        : small
          ? 15
          : 17,
      paddingTop: 0,
      paddingBottom: verySmall
        ? 4
        : small
          ? 6
          : 7,
      zIndex: 10,
    },

    ctaBtn: {
      height: verySmall
        ? 43
        : small
          ? 47
          : 51,
      borderRadius: 27,
      overflow: "hidden",
      borderWidth: 1,
      borderColor:
        "rgba(255,255,255,0.18)",
    },

    ctaGradient: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 9,
    },

    ctaText: {
      color: COLORS.white,
      fontSize: verySmall
        ? 13
        : small
          ? 14
          : 15,
      fontWeight: "800",
    },

    ctaDisabled: {
      opacity: 0.5,
    },

    termsRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginTop: 5,
      paddingHorizontal: 2,
    },

    termsText: {
      flex: 1,
      color: COLORS.textMuted,
      fontSize: verySmall
        ? 8
        : small
          ? 8.5
          : 9,
      lineHeight: verySmall
        ? 10
        : small
          ? 11
          : 12,
      textAlign: "center",
      marginLeft: 3,
    },

    termsLink: {
      color: COLORS.cyan,
      textDecorationLine: "underline",
    },

    /* ========================================================
       BOTTOM REEL
    ======================================================== */

    bottomReel: {
      position: "absolute",
      left: -6,
      bottom: -2,
      width: screenWidth + 12,
      height: screenWidth * 0.54,
      opacity: 1,
      zIndex: 1,
    },
  });
}