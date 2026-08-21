import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { authService } from "../../../src/services/auth/authService";

/* ============================================================
   FINAL APPROVED ASSETS

   assets/logo.png
   assets/create-stories-hero.png
   ============================================================ */

const LOGO = require("../../../assets/logo.png");
const HERO = require("../../../assets/create-stories-hero.png");

/* ============================================================
   SHIVORA THEME
   ============================================================ */

const COLORS = {
  background: "#02070D",
  white: "#FFFFFF",
  secondary: "#AAB7C2",
  cyan: "#00E5FF",
  blue: "#2C78FF",
  purple: "#8B2EFF",
};

/* ============================================================
   SCREEN
   ============================================================ */

export default function WelcomeScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();

  const [guestLoading, setGuestLoading] = useState(false);

  const layout = useMemo(
    () => getLayout(width, height),
    [width, height],
  );

  const styles = useMemo(
    () => createStyles(layout),
    [layout],
  );

  /* ==========================================================
     CTA PRESS ANIMATION
     ========================================================== */

  const buttonScale = useSharedValue(1);

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const animateButton = () => {
    buttonScale.value = withSequence(
      withTiming(0.975, {
        duration: 90,
        easing: Easing.out(Easing.quad),
      }),
      withTiming(1, {
        duration: 140,
        easing: Easing.out(Easing.quad),
      }),
    );
  };

  /* ==========================================================
     NAVIGATION
     ========================================================== */

  const handleGetStarted = () => {
    animateButton();
    router.push("/auth/login");
  };

  const handleGuest = async () => {
    if (guestLoading) {
      return;
    }

    setGuestLoading(true);

    try {
      await authService.continueAsGuest();
      router.replace("/home");
    } catch (error) {
      console.error(
        "Continue as Guest failed:",
        error,
      );
    } finally {
      setGuestLoading(false);
    }
  };

  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      style={styles.safeArea}
    >
      <View style={styles.screen}>
        {/* ==================================================
            LOGO
            The logo.png is a wide asset. Its visual artwork
            was previously being clipped by a short height.
            The larger height below is intentional.
        ================================================== */}

        <Animated.View
          entering={FadeInDown
            .delay(60)
            .duration(650)}
          style={styles.logoSection}
        >
          <Image
            source={LOGO}
            resizeMode="contain"
            accessibilityLabel="Shivora"
            style={styles.logo}
          />
        </Animated.View>

        {/* ==================================================
            HERO
            Large dominant composition, matching reference.
        ================================================== */}

        <Animated.View
          entering={FadeIn
            .delay(120)
            .duration(850)}
          style={styles.heroSection}
        >
          <Image
            source={HERO}
            resizeMode="contain"
            accessibilityLabel="Shivora cinematic film and camera artwork"
            style={styles.hero}
          />
        </Animated.View>

        {/* ==================================================
            COPY
        ================================================== */}

        <Animated.View
          entering={FadeInUp
            .delay(230)
            .duration(600)}
          style={styles.copySection}
        >
          <View style={styles.titleLine}>
            <Text style={styles.title}>
              Create Stories
            </Text>

            <Text style={styles.spark}>
              ✦
            </Text>
          </View>

          <View style={styles.titleLine}>
            <Text style={styles.title}>
              That{" "}
              <Text style={styles.titleAccent}>
                Move
              </Text>
            </Text>

            <Text
              style={[
                styles.spark,
                styles.secondSpark,
              ]}
            >
              ✦
            </Text>
          </View>

          <View style={styles.titleUnderline} />

          <Text style={styles.subtitle}>
            Transform your ideas into cinematic{"\n"}
            videos powered by AI.
          </Text>
        </Animated.View>

        {/* ==================================================
            ACTIONS
        ================================================== */}

        <View style={styles.actions}>
          <Animated.View
            entering={FadeInUp
              .delay(350)
              .duration(600)}
            style={[
              styles.buttonOuter,
              buttonAnimatedStyle,
            ]}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Get Started"
              onPress={handleGetStarted}
              onPressIn={animateButton}
              style={({ pressed }) => [
                styles.button,
                pressed &&
                  styles.buttonPressed,
              ]}
            >
              <LinearGradient
                colors={[
                  COLORS.cyan,
                  COLORS.blue,
                  COLORS.purple,
                ]}
                start={{
                  x: 0,
                  y: 0.5,
                }}
                end={{
                  x: 1,
                  y: 0.5,
                }}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>
                  Get Started
                </Text>

                <Ionicons
                  name="arrow-forward"
                  size={28}
                  color={COLORS.white}
                  style={styles.buttonArrow}
                />
              </LinearGradient>
            </Pressable>
          </Animated.View>

          <Animated.View
            entering={FadeIn
              .delay(620)
              .duration(450)}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Continue as Guest"
              disabled={guestLoading}
              onPress={() => {
                void handleGuest();
              }}
              style={({ pressed }) => [
                styles.guest,
                pressed &&
                  styles.guestPressed,
              ]}
            >
              {guestLoading ? (
                <ActivityIndicator
                  color={COLORS.cyan}
                  size="small"
                />
              ) : (
                <>
                  <Text style={styles.guestText}>
                    Continue as Guest
                  </Text>

                  <View
                    style={styles.guestLine}
                  />
                </>
              )}
            </Pressable>
          </Animated.View>
        </View>


      </View>
    </SafeAreaView>
  );
}

/* ============================================================
   LAYOUT

   Key correction:
   The previous version sized the logo mainly by height and
   squeezed the whole hero into a smaller vertical region.

   The approved reference is visually hero-dominant, so the
   logo and hero are deliberately given a larger vertical
   budget. The CTA remains anchored after the content.
   ============================================================ */

type Layout = {
  width: number;
  height: number;
  compact: boolean;
  veryCompact: boolean;

  logoWidth: number;
  logoHeight: number;

  heroWidth: number;
  heroHeight: number;

  titleSize: number;
  titleLineHeight: number;

  subtitleSize: number;
  subtitleLineHeight: number;

  buttonHeight: number;
};

function getLayout(
  width: number,
  height: number,
): Layout {
  const compact = height < 820;
  const veryCompact = height < 760;

  /*
   * logo.png is a wide 2:1-ish asset. A tall render box is
   * required to make the visible logo match the approved
   * reference.
   */
  const logoHeight = clamp(
    Math.round(height * (
      veryCompact
        ? 0.105
        : compact
          ? 0.112
          : 0.118
    )),
    112,
    165,
  );

  const logoWidth = clamp(
    Math.round(width * 1.50),
    750,
    820,
  );

  /*
   * The hero is the primary visual. Use most of the upper
   * screen instead of shrinking it around its width.
   */
  const heroHeight = clamp(
    Math.round(height * (
      veryCompact
        ? 0.525
        : compact
          ? 0.55
          : 0.575
    )),
    490,
    1025,
  );

  const heroWidth = Math.min(
    Math.round(heroHeight * (2 / 3)),
    Math.round(width * 0.98),
  );

  return {
    width,
    height,
    compact,
    veryCompact,

    logoWidth,
    logoHeight,

    heroWidth,
    heroHeight,

    titleSize: veryCompact
      ? 25
      : compact
        ? 28
        : 30,

    titleLineHeight: veryCompact
      ? 29
      : compact
        ? 32
        : 35,

    subtitleSize: veryCompact
      ? 15
      : compact
        ? 16
        : 17,

    subtitleLineHeight: veryCompact
      ? 21
      : compact
        ? 23
        : 25,

    buttonHeight: veryCompact
      ? 56
      : compact
        ? 60
        : 64,
  };
}

function clamp(
  value: number,
  min: number,
  max: number,
) {
  return Math.max(
    min,
    Math.min(max, value),
  );
}

/* ============================================================
   STYLES
   ============================================================ */

function createStyles(
  layout: Layout,
) {
  const {
    width,
    height,
    compact,
    veryCompact,
    logoWidth,
    logoHeight,
    heroWidth,
    heroHeight,
    titleSize,
    titleLineHeight,
    subtitleSize,
    subtitleLineHeight,
    buttonHeight,
  } = layout;

  const horizontalPadding = clamp(
    Math.round(width * 0.05),
    20,
    32,
  );

  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor:
        COLORS.background,
    },

    screen: {
      flex: 1,
      alignItems: "center",
      backgroundColor:
        COLORS.background,
      overflow: "hidden",
    },

    /* ========================================================
       LOGO
       ======================================================== */

    logoSection: {
      width: "100%",
      height: logoHeight,
      alignItems: "center",
      justifyContent: "center",
      marginTop:
        veryCompact
          ? 0
          : compact
            ? 2
            : 4,
      flexShrink: 0,
      zIndex: 5,
    },

    logo: {
      width: logoWidth,
      height: logoHeight,
      transform: [{ scaleX: 1.5 }],
    },

    /* ========================================================
       HERO
       The logo keeps its exact vertical position.
       Only the hero artwork is pulled upward.
       ======================================================== */

    heroSection: {
      width: heroWidth,
      height: heroHeight,
      alignItems: "center",
      justifyContent: "center",
      marginTop:
        veryCompact
          ? -55
          : compact
            ? -58
            : -60,
      flexShrink: 0,
      zIndex: 1,
    },

    hero: {
      width: heroWidth,
      height: heroHeight,
    },

    /* ========================================================
       COPY
       ======================================================== */

    copySection: {
      width:
        width - horizontalPadding * 2,
      alignItems: "center",
      justifyContent: "center",
      marginTop:
        veryCompact
          ? -20
          : compact
            ? -22
            : -24,
      flexShrink: 0,
      zIndex: 6,
    },

    titleLine: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "center",
    },

    title: {
      color: COLORS.white,
      fontSize: titleSize,
      lineHeight: titleLineHeight,
      fontWeight: "800",
      letterSpacing: -1.15,
      textAlign: "center",
    },

    titleAccent: {
      color: COLORS.cyan,
      textShadowColor:
        "rgba(0,229,255,0.32)",
      textShadowOffset: {
        width: 0,
        height: 0,
      },
      textShadowRadius: 10,
    },

    spark: {
      color: COLORS.cyan,
      fontSize:
        veryCompact
          ? 11
          : compact
            ? 12
            : 13,
      lineHeight:
        veryCompact
          ? 20
          : compact
            ? 22
            : 24,
      marginLeft: 5,
      marginTop: 4,
    },

    secondSpark: {
      fontSize:
        veryCompact
          ? 10
          : compact
            ? 11
            : 12,
      marginTop: 5,
    },

    titleUnderline: {
      width:
        veryCompact
          ? 112
          : compact
            ? 126
            : 140,
      height: 2,
      borderRadius: 2,
      backgroundColor:
        COLORS.cyan,
      marginTop: -1,
      marginBottom:
        veryCompact
          ? 7
          : compact
            ? 9
            : 11,
      opacity: 0.95,
    },

    subtitle: {
      color: COLORS.secondary,
      fontSize: subtitleSize,
      lineHeight: subtitleLineHeight,
      fontWeight: "400",
      textAlign: "center",
      letterSpacing: 0,
    },

    /* ========================================================
       ACTIONS
       ======================================================== */

    actions: {
      width:
        width - horizontalPadding * 2,
      alignItems: "center",
      marginTop:
        veryCompact
          ? 13
          : compact
            ? 17
            : 20,
      flexShrink: 0,
      zIndex: 10,
    },

    buttonOuter: {
      width: "100%",
      height: buttonHeight,
      borderRadius:
        buttonHeight / 2,
      shadowColor: COLORS.cyan,
      shadowOffset: {
        width: 0,
        height: 0,
      },
      shadowOpacity: 0.34,
      shadowRadius: 18,
      elevation: 10,
    },

    button: {
      width: "100%",
      height: buttonHeight,
      borderRadius:
        buttonHeight / 2,
      overflow: "hidden",
    },

    buttonPressed: {
      opacity: 0.96,
    },

    buttonGradient: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },

    buttonText: {
      color: COLORS.white,
      fontSize:
        veryCompact
          ? 18
          : compact
            ? 20
            : 21,
      lineHeight:
        veryCompact
          ? 22
          : compact
            ? 24
            : 26,
      fontWeight: "800",
      letterSpacing: -0.3,
    },

    buttonArrow: {
      marginLeft:
        veryCompact
          ? 15
          : compact
            ? 16
            : 17,
    },

    guest: {
      minWidth: 205,
      minHeight: 48,
      alignItems: "center",
      justifyContent: "center",
      marginTop:
        veryCompact
          ? 7
          : compact
            ? 9
            : 11,
      paddingHorizontal: 8,
    },

    guestPressed: {
      opacity: 0.65,
    },

    guestText: {
      color: COLORS.cyan,
      fontSize:
        veryCompact
          ? 15
          : compact
            ? 16
            : 17,
      lineHeight:
        veryCompact
          ? 19
          : compact
            ? 20
            : 21,
      fontWeight: "600",
      textAlign: "center",
    },

    guestLine: {
      width:
        veryCompact
          ? 150
          : compact
            ? 170
            : 185,
      height: 1.5,
      borderRadius: 2,
      backgroundColor:
        COLORS.cyan,
      marginTop: 4,
    },


  });
}