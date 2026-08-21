import React, { useEffect, useMemo, useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { Redirect } from "expo-router";
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { authService } from "../src/services/auth/authService";
import { type AppTheme, useTheme } from "../src/theme";

/* ============================================================
   SHIVORA SPLASH — FINAL CINEMATIC V9
   ============================================================

   Assets:
   assets/logo.png
   assets/splash-phone.png
   assets/splash-film-reel.png
   assets/splash-hero.png
   assets/splash-ai.png
   assets/splash-magic.png
   assets/splash-clapper.png
   assets/splash-music.png

   DESIGN RULES:
   - No artificial glow disc is rendered underneath the phone.
   - Phone is only the opening device.
   - Reel begins at the phone screen position.
   - Reel and hero cross-fade instead of stacking.
   - Hero is the dominant visual.
   - Icons sit close to the hero and enter one-by-one.
   - Exact existing assets/logo.png is the only final logo.
   - Loading is invisible until the final stage.
   - Final flash is subtle, not a full white wash.
   - No bottom home-indicator is rendered by this component.
   ============================================================ */

const PHONE = require("../assets/splash-phone.png");
const FILM_REEL = require("../assets/splash-film-reel.png");
const HERO = require("../assets/splash-hero.png");
const AI_ICON = require("../assets/splash-ai.png");
const MAGIC_ICON = require("../assets/splash-magic.png");
const CLAPPER_ICON = require("../assets/splash-clapper.png");
const MUSIC_ICON = require("../assets/splash-music.png");
const LOGO = require("../assets/logo.png");

type Destination =
  | "/(tabs)/home"
  | "/auth/profile-setup"
  | "/auth/welcome"
  | null;

const PARTICLES = [
  [0.08, 0.15, 2],
  [0.17, 0.25, 1.5],
  [0.25, 0.12, 1.5],
  [0.34, 0.22, 2],
  [0.44, 0.13, 1.5],
  [0.53, 0.24, 2],
  [0.65, 0.14, 1.5],
  [0.75, 0.23, 2],
  [0.86, 0.16, 1.5],
  [0.93, 0.29, 2],
  [0.11, 0.47, 1.5],
  [0.24, 0.55, 2],
  [0.78, 0.48, 1.5],
  [0.89, 0.57, 2],
] as const;

const AnimatedImage = Animated.createAnimatedComponent(Image);

const EASE_OUT = Easing.out(Easing.cubic);
const EASE_IN_OUT = Easing.inOut(Easing.cubic);

export default function Index() {
  const theme = useTheme();
  const { width, height } = useWindowDimensions();

  const [destination, setDestination] =
    useState<Destination>(null);

  const metrics = useMemo(
    () => getMetrics(width, height),
    [width, height],
  );

  const styles = useMemo(
    () => createStyles(theme, metrics),
    [theme, metrics],
  );

  /* ==========================================================
     MASTER VALUES
     ========================================================== */

  const screenOpacity = useSharedValue(1);
  const particlesOpacity = useSharedValue(0);

  const phoneProgress = useSharedValue(0);
  const phoneExit = useSharedValue(1);
   const reelProgress = useSharedValue(0);
  const reelExit = useSharedValue(0);
  const reelGlow = useSharedValue(0);

  const heroProgress = useSharedValue(0);
  const heroGlow = useSharedValue(0);

  const aiProgress = useSharedValue(0);
  const magicProgress = useSharedValue(0);
  const clapperProgress = useSharedValue(0);
  const musicProgress = useSharedValue(0);

  const logoProgress = useSharedValue(0);
  const taglineProgress = useSharedValue(0);

  const loadingProgress = useSharedValue(0);
  const loadingGlow = useSharedValue(0);

  const sweepProgress = useSharedValue(0);
  const finalFlash = useSharedValue(0);

  /* ==========================================================
     SCREEN
     ========================================================== */

  const screenStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
  }));

  const particlesStyle = useAnimatedStyle(() => ({
    opacity: particlesOpacity.value,
  }));

  /* ==========================================================
     PHONE
     ========================================================== */

  const phoneStyle = useAnimatedStyle(() => {
    const p = phoneProgress.value;

    return {
      opacity: p * phoneExit.value,
      transform: [
        {
          translateY: interpolate(
            p,
            [0, 1],
            [metrics.phoneEnterY, 0],
            Extrapolation.CLAMP,
          ),
        },
        {
          scale: interpolate(
            p,
            [0, 1],
            [0.90, 1],
            Extrapolation.CLAMP,
          ),
        },
      ],
    };
  });

  /* ==========================================================
     REEL
     ========================================================== */

  const reelStyle = useAnimatedStyle(() => {
    const p = reelProgress.value;
    const visibility =
      1 - reelExit.value;

    return {
      opacity: p * visibility,
      transform: [
        {
          translateY: interpolate(
            p,
            [0, 0.28, 0.62, 1],
            [
              metrics.reelStartY,
              metrics.reelLift1Y,
              metrics.reelLift2Y,
              metrics.reelEndY,
            ],
            Extrapolation.CLAMP,
          ),
        },
        {
          scale: interpolate(
            p,
            [0, 0.26, 0.62, 1],
            [0.08, 0.24, 0.58, 0.92],
            Extrapolation.CLAMP,
          ),
        },
        {
          rotate: `${interpolate(
            p,
            [0, 0.35, 0.70, 1],
            [-7, 5, -1.5, 0],
            Extrapolation.CLAMP,
          )}deg`,
        },
      ],
    };
  });

  const reelGlowStyle = useAnimatedStyle(() => ({
    opacity:
      reelGlow.value *
      (1 - reelExit.value),
    transform: [
      {
        scale: interpolate(
          reelGlow.value,
          [0, 1],
          [0.72, 1],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  /* ==========================================================
     HERO
     ========================================================== */

  const heroStyle = useAnimatedStyle(() => {
    const p = heroProgress.value;

    return {
      opacity: p,
      transform: [
        {
          translateY: interpolate(
            p,
            [0, 1],
            [metrics.heroEnterY, 0],
            Extrapolation.CLAMP,
          ),
        },
        {
          scale: interpolate(
            p,
            [0, 1],
            [0.76, 1],
            Extrapolation.CLAMP,
          ),
        },
      ],
    };
  });

  const heroGlowStyle = useAnimatedStyle(() => ({
    opacity: heroGlow.value,
    transform: [
      {
        scale: interpolate(
          heroGlow.value,
          [0, 1],
          [0.82, 1.06],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  /* ==========================================================
     ICONS
     ========================================================== */

  const aiStyle = useAnimatedStyle(() => {
    const p = aiProgress.value;

    return {
      opacity: p,
      transform: [
        {
          translateX: interpolate(
            p,
            [0, 1],
            [-14, 0],
            Extrapolation.CLAMP,
          ),
        },
        {
          translateY: interpolate(
            p,
            [0, 1],
            [12, 0],
            Extrapolation.CLAMP,
          ),
        },
        {
          scale: interpolate(
            p,
            [0, 1],
            [0.65, 1],
            Extrapolation.CLAMP,
          ),
        },
      ],
    };
  });

  const magicStyle = useAnimatedStyle(() => {
    const p = magicProgress.value;

    return {
      opacity: p,
      transform: [
        {
          translateX: interpolate(
            p,
            [0, 1],
            [-12, 0],
            Extrapolation.CLAMP,
          ),
        },
        {
          translateY: interpolate(
            p,
            [0, 1],
            [12, 0],
            Extrapolation.CLAMP,
          ),
        },
        {
          scale: interpolate(
            p,
            [0, 1],
            [0.65, 1],
            Extrapolation.CLAMP,
          ),
        },
      ],
    };
  });

  const clapperStyle =
    useAnimatedStyle(() => {
      const p = clapperProgress.value;

      return {
        opacity: p,
        transform: [
          {
            translateX: interpolate(
              p,
              [0, 1],
              [12, 0],
              Extrapolation.CLAMP,
            ),
          },
          {
            translateY: interpolate(
              p,
              [0, 1],
              [12, 0],
              Extrapolation.CLAMP,
            ),
          },
          {
            scale: interpolate(
              p,
              [0, 1],
              [0.65, 1],
              Extrapolation.CLAMP,
            ),
          },
        ],
      };
    });

  const musicStyle =
    useAnimatedStyle(() => {
      const p = musicProgress.value;

      return {
        opacity: p,
        transform: [
          {
            translateX: interpolate(
              p,
              [0, 1],
              [12, 0],
              Extrapolation.CLAMP,
            ),
          },
          {
            translateY: interpolate(
              p,
              [0, 1],
              [12, 0],
              Extrapolation.CLAMP,
            ),
          },
          {
            scale: interpolate(
              p,
              [0, 1],
              [0.65, 1],
              Extrapolation.CLAMP,
            ),
          },
        ],
      };
    });

  /* ==========================================================
     BRAND
     ========================================================== */

  const logoStyle = useAnimatedStyle(() => {
    const p = logoProgress.value;

    return {
      opacity: p,
      transform: [
        {
          translateY: interpolate(
            p,
            [0, 1],
            [16, 0],
            Extrapolation.CLAMP,
          ),
        },
        {
          scale: interpolate(
            p,
            [0, 1],
            [0.88, 1],
            Extrapolation.CLAMP,
          ),
        },
      ],
    };
  });

  const taglineStyle =
    useAnimatedStyle(() => {
      const p = taglineProgress.value;

      return {
        opacity: p,
        transform: [
          {
            translateY: interpolate(
              p,
              [0, 1],
              [8, 0],
              Extrapolation.CLAMP,
            ),
          },
        ],
      };
    });

  /* ==========================================================
     LIGHT SWEEP
     ========================================================== */

  const sweepStyle =
    useAnimatedStyle(() => ({
      opacity: interpolate(
        sweepProgress.value,
        [0, 0.20, 0.82, 1],
        [0, 0.8, 0.8, 0],
        Extrapolation.CLAMP,
      ),
      transform: [
        {
          translateX: interpolate(
            sweepProgress.value,
            [0, 1],
            [
              -metrics.sweepDistance,
              metrics.sweepDistance,
            ],
            Extrapolation.CLAMP,
          ),
        },
      ],
    }));

  /* ==========================================================
     LOADING
     ========================================================== */

  const loadingContainerStyle =
    useAnimatedStyle(() => {
      const p = loadingProgress.value;

      return {
        opacity: interpolate(
          p,
          [0, 0.04, 1],
          [0, 1, 1],
          Extrapolation.CLAMP,
        ),
        transform: [
          {
            translateY: interpolate(
              p,
              [0, 1],
              [10, 0],
              Extrapolation.CLAMP,
            ),
          },
        ],
      };
    });

  const loadingFillStyle =
    useAnimatedStyle(() => ({
      transform: [
        {
          scaleX: loadingProgress.value,
        },
      ],
    }));

  const loadingGlowStyle =
    useAnimatedStyle(() => ({
      opacity: loadingGlow.value,
      transform: [
        {
          scale: interpolate(
            loadingGlow.value,
            [0, 1],
            [0.70, 1],
            Extrapolation.CLAMP,
          ),
        },
      ],
    }));

  /* ==========================================================
     FINAL FLASH
     ========================================================== */

  const finalFlashStyle =
    useAnimatedStyle(() => ({
      opacity: finalFlash.value,
    }));

  /* ==========================================================
     TIMELINE
     ========================================================== */

  useEffect(() => {
    let mounted = true;

    const wait = (ms: number) =>
      new Promise<void>((resolve) =>
        setTimeout(resolve, ms),
      );

    /* Background particles. */
    particlesOpacity.value = withTiming(
      0.48,
      {
        duration: 450,
        easing: EASE_OUT,
      },
    );

    /* --------------------------------------------------------
       0.00 - 0.62
       PHONE
       -------------------------------------------------------- */

    phoneProgress.value = withTiming(
      1,
      {
        duration: 620,
        easing: EASE_OUT,
      },
    );

    /* --------------------------------------------------------
       0.70 - 1.88
       REEL EMERGES FROM PHONE
       -------------------------------------------------------- */

    reelProgress.value = withDelay(
      700,
      withTiming(
        1,
        {
          duration: 1180,
          easing: EASE_IN_OUT,
        },
      ),
    );

    reelGlow.value = withDelay(
      800,
      withTiming(
        1,
        {
          duration: 500,
          easing: EASE_IN_OUT,
        },
      ),
    );

    /* --------------------------------------------------------
       1.76 - 2.42
       PHONE EXIT + REEL -> HERO CROSSFADE
       -------------------------------------------------------- */

    phoneExit.value = withDelay(
      1700,
      withTiming(
        0,
        {
          duration: 500,
          easing: EASE_IN_OUT,
        },
      ),
    );

    reelExit.value = withDelay(
      1810,
      withTiming(
        1,
        {
          duration: 400,
          easing: EASE_IN_OUT,
        },
      ),
    );

    heroProgress.value = withDelay(
      1700,
      withTiming(
        1,
        {
          duration: 700,
          easing: EASE_OUT,
        },
      ),
    );

    heroGlow.value = withDelay(
      2240,
      withSequence(
        withTiming(
          1,
          {
            duration: 180,
            easing: EASE_OUT,
          },
        ),
        withTiming(
          0,
          {
            duration: 360,
            easing: EASE_IN_OUT,
          },
        ),
      ),
    );

    /* --------------------------------------------------------
       2.55 - 3.55
       ICONS
       -------------------------------------------------------- */

    aiProgress.value = withDelay(
      2550,
      withTiming(
        1,
        {
          duration: 280,
          easing: EASE_OUT,
        },
      ),
    );

    magicProgress.value = withDelay(
      2780,
      withTiming(
        1,
        {
          duration: 280,
          easing: EASE_OUT,
        },
      ),
    );

    clapperProgress.value = withDelay(
      3010,
      withTiming(
        1,
        {
          duration: 280,
          easing: EASE_OUT,
        },
      ),
    );

    musicProgress.value = withDelay(
      3240,
      withTiming(
        1,
        {
          duration: 280,
          easing: EASE_OUT,
        },
      ),
    );

    /* --------------------------------------------------------
       3.55 - 4.22
       LOGO
       -------------------------------------------------------- */

    logoProgress.value = withDelay(
      3500,
      withTiming(
        1,
        {
          duration: 720,
          easing: EASE_OUT,
        },
      ),
    );

    /* --------------------------------------------------------
       4.00 - 4.58
       TAGLINE
       -------------------------------------------------------- */

    taglineProgress.value = withDelay(
      4050,
      withTiming(
        1,
        {
          duration: 500,
          easing: EASE_OUT,
        },
      ),
    );

    /* --------------------------------------------------------
       4.18 - 4.88
       LIGHT SWEEP
       -------------------------------------------------------- */

    sweepProgress.value = withDelay(
      4180,
      withTiming(
        1,
        {
          duration: 700,
          easing: EASE_IN_OUT,
        },
      ),
    );

    /* --------------------------------------------------------
       4.72 - 5.82
       LOADING
       -------------------------------------------------------- */

    loadingProgress.value = withDelay(
      4920,
      withTiming(
        1,
        {
          duration: 900,
          easing: EASE_IN_OUT,
        },
      ),
    );

    loadingGlow.value = withDelay(
      5000,
      withTiming(
        1,
        {
          duration: 400,
          easing: EASE_IN_OUT,
        },
      ),
    );

    /* --------------------------------------------------------
       5.86 - 6.18
       FINAL TRANSITION
       -------------------------------------------------------- */

    finalFlash.value = withDelay(
      5860,
      withSequence(
        withTiming(
          0.14,
          {
            duration: 90,
            easing: EASE_OUT,
          },
        ),
        withTiming(
          0,
          {
            duration: 230,
            easing: EASE_IN_OUT,
          },
        ),
      ),
    );

    screenOpacity.value = withDelay(
      5980,
      withTiming(
        0,
        {
          duration: 220,
          easing: EASE_IN_OUT,
        },
      ),
    );

    /* Existing auth flow. */
    const resolveInitialRoute =
      async () => {
        await wait(6200);

        try {
          const user =
            await authService.getCurrentUser();

          if (!mounted) {
            return;
          }

          setDestination(
            user
              ? user.isProfileComplete
                ? "/(tabs)/home"
                : "/auth/profile-setup"
              : "/auth/welcome",
          );
        } catch (error) {
          console.error(
            "Failed to resolve initial route:",
            error,
          );

          if (mounted) {
            setDestination(
              "/auth/welcome",
            );
          }
        }
      };

    void resolveInitialRoute();

    return () => {
      mounted = false;
    };
  }, []);

  if (destination) {
    return (
      <Redirect href={destination} />
    );
  }

  return (
    <Animated.View
      style={[
        styles.screen,
        screenStyle,
      ]}
    >
      {/* Background */}
      <View style={styles.background} />

      {/* Particles */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.particles,
          particlesStyle,
        ]}
      >
        {PARTICLES.map(
          ([x, y, size], index) => (
            <View
              key={`particle-${index}`}
              style={[
                styles.particle,
                {
                  left: x * width,
                  top: y * height,
                  width: size,
                  height: size,
                  borderRadius:
                    size / 2,
                },
              ]}
            />
          ),
        )}
      </Animated.View>

      {/* ======================================================
          PHONE — OPENING ONLY
          ====================================================== */}
      <View
        pointerEvents="none"
        style={styles.phoneArea}
      >
        <Animated.View
          style={[
            styles.phoneAnimatedLayer,
            phoneStyle,
          ]}
        >
          <Image
            source={PHONE}
            resizeMode="contain"
            style={styles.phone}
          />
        </Animated.View>
      </View>

      {/* ======================================================
          FILM REEL — EMERGES FROM PHONE
          ====================================================== */}
      <View
        pointerEvents="none"
        style={styles.reelArea}
      >
        <Animated.View
          style={[
            styles.reelAnimatedLayer,
            reelStyle,
          ]}
        >
          <Animated.View
            style={[
              styles.reelGlow,
              reelGlowStyle,
            ]}
          />

          <Image
            source={FILM_REEL}
            resizeMode="contain"
            style={styles.reel}
          />
        </Animated.View>
      </View>

      {/* ======================================================
          FINAL HERO
          ====================================================== */}
      <View
        pointerEvents="none"
        style={styles.heroArea}
      >
        <Animated.View
          style={[
            styles.heroAnimatedLayer,
            heroStyle,
          ]}
        >
          <Animated.View
            style={[
              styles.heroGlow,
              heroGlowStyle,
            ]}
          />

          <Image
            source={HERO}
            resizeMode="contain"
            style={styles.hero}
          />
        </Animated.View>
      </View>

      {/* ======================================================
          ICONS — CLOSE TO HERO
          ====================================================== */}

      <View
        pointerEvents="none"
        style={[
          styles.iconSlot,
          styles.aiSlot,
        ]}
      >
        <Animated.View
          style={[
            styles.iconAnimatedLayer,
            aiStyle,
          ]}
        >
          <Image
            source={AI_ICON}
            resizeMode="contain"
            style={styles.iconImage}
          />
        </Animated.View>
      </View>

      <View
        pointerEvents="none"
        style={[
          styles.iconSlot,
          styles.magicSlot,
        ]}
      >
        <Animated.View
          style={[
            styles.iconAnimatedLayer,
            magicStyle,
          ]}
        >
          <Image
            source={MAGIC_ICON}
            resizeMode="contain"
            style={styles.iconImage}
          />
        </Animated.View>
      </View>

      <View
        pointerEvents="none"
        style={[
          styles.iconSlot,
          styles.clapperSlot,
        ]}
      >
        <Animated.View
          style={[
            styles.iconAnimatedLayer,
            clapperStyle,
          ]}
        >
          <Image
            source={CLAPPER_ICON}
            resizeMode="contain"
            style={styles.iconImage}
          />
        </Animated.View>
      </View>

      <View
        pointerEvents="none"
        style={[
          styles.iconSlot,
          styles.musicSlot,
        ]}
      >
        <Animated.View
          style={[
            styles.iconAnimatedLayer,
            musicStyle,
          ]}
        >
          <Image
            source={MUSIC_ICON}
            resizeMode="contain"
            style={styles.iconImage}
          />
        </Animated.View>
      </View>

      {/* Light sweep */}
      <View
        pointerEvents="none"
        style={styles.sweepClip}
      >
        <Animated.View
          style={[
            styles.sweep,
            sweepStyle,
          ]}
        />
      </View>

      {/* ======================================================
          FINAL LOGO — SAME assets/logo.png
          ====================================================== */}
      <View
        pointerEvents="none"
        style={styles.logoArea}
      >
        <Animated.View
          style={[
            styles.logoAnimatedLayer,
            logoStyle,
          ]}
        >
          <Image
            source={LOGO}
            resizeMode="contain"
            style={styles.logo}
          />
        </Animated.View>
      </View>

      {/* Tagline */}
      <View
        pointerEvents="none"
        style={styles.taglineArea}
      >
        <Animated.View
          style={taglineStyle}
        >
          <Text style={styles.tagline}>
            CREATE STORIES THAT MOVE.
          </Text>
        </Animated.View>
      </View>

      {/* ======================================================
          LOADING — INVISIBLE UNTIL 4.72s
          ====================================================== */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.loadingArea,
          loadingContainerStyle,
        ]}
      >
        <Text style={styles.loadingText}>
          • LOADING •
        </Text>

        <View
          style={styles.loadingTrack}
        >
          <Animated.View
            style={[
              styles.loadingFill,
              loadingFillStyle,
            ]}
          />
        </View>

        <Animated.View
          style={[
            styles.loadingGlow,
            loadingGlowStyle,
          ]}
        />
      </Animated.View>

      {/* Final transition */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.finalFlash,
          finalFlashStyle,
        ]}
      />
    </Animated.View>
  );
}

/* ============================================================
   RESPONSIVE METRICS
   ============================================================ */

type Metrics = {
  width: number;
  height: number;

  phoneWidth: number;
  phoneHeight: number;
  phoneBottom: number;
  phoneEnterY: number;

  reelWidth: number;
  reelHeight: number;
  reelTop: number;
  reelStartY: number;
  reelLift1Y: number;
  reelLift2Y: number;
  reelEndY: number;

  heroWidth: number;
  heroHeight: number;
  heroTop: number;
  heroEnterY: number;

  logoWidth: number;
  logoHeight: number;
  logoTop: number;

  taglineTop: number;

  iconSize: number;
  musicIconSize: number;

  loadingBottom: number;

  sweepDistance: number;
};

function getMetrics(
  width: number,
  height: number,
): Metrics {
  const compact = height < 830;
  const veryCompact = height < 750;

  /*
   * Phone is deliberately oversized for the opening beat,
   * approximately 2x the previous version while staying within the screen.
   */
  // Approximately 2x the previous phone size, capped so the phone
  // still fits cleanly inside the device width.
  const phoneWidth = Math.min(
    width * 0.98,
    520,
  );

  const phoneHeight =
    phoneWidth * 1.56;

  const phoneBottom =
    veryCompact ? 58 : compact ? 66 : 74;

  /*
   * Final hero is intentionally dominant.
   */
  const heroWidth = Math.min(
    width * 0.95,
    500,
  );

  const heroHeight =
    heroWidth * 0.84;

  const heroTop =
    veryCompact
      ? height * 0.145
      : compact
        ? height * 0.14
        : height * 0.135;

  /*
   * Reel is narrower than hero and begins exactly around
   * the top area of the opening phone.
   */
  const reelWidth = Math.min(
    width * 0.44,
    235,
  );

  const reelHeight =
    reelWidth * 1.58;

  const phoneTop =
    height -
    phoneBottom -
    phoneHeight;

  /*
   * The reel starts from the visible phone screen area,
   * not from above the phone.
   */
  const reelStartCenter =
    phoneTop +
    phoneHeight * 0.42;

  const reelTop =
    reelStartCenter -
    reelHeight / 2;

  const reelStartY = 0;

  const reelLift1Y =
    -(height * 0.10);

  const reelLift2Y =
    -(height * 0.24);

  const reelEndY =
    -(height * 0.36);

  // Approximately 2x the V5 icon size.
  const iconSize = Math.min(
    width * 0.30,
    144,
  );

  // Music icon only: 2x the current V6 icon size.
  const musicIconSize = Math.min(
    width * 0.60,
    288,
  );

  // Approximately 2x the V5 logo width.
  // Capped so it remains fully visible on smaller phones.
  const logoWidth = Math.min(
    width * 0.98,
    560,
  );

  const logoHeight =
    compact ? 118 : 132;

  const logoTop =
    veryCompact
      ? height * 0.625
      : compact
        ? height * 0.61
        : height * 0.595;

  return {
    width,
    height,

    phoneWidth,
    phoneHeight,
    phoneBottom,
    phoneEnterY:
      veryCompact ? 72 : 88,

    reelWidth,
    reelHeight,
    reelTop,
    reelStartY,
    reelLift1Y,
    reelLift2Y,
    reelEndY,

    heroWidth,
    heroHeight,
    heroTop,
    heroEnterY:
      veryCompact ? 42 : 52,

    logoWidth,
    logoHeight,
    logoTop,

    taglineTop:
      logoTop +
      logoHeight +
      10,

    iconSize,
    musicIconSize,

    loadingBottom:
      veryCompact ? 58 : 66,

    sweepDistance:
      width * 1.30,
  };
}

/* ============================================================
   STYLES
   ============================================================ */

function createStyles(
  theme: AppTheme,
  metrics: Metrics,
) {
  const cyan =
    theme.colors.primary || "#00E5FF";

  return StyleSheet.create({
    screen: {
      flex: 1,
      overflow: "hidden",
      backgroundColor:
        theme.colors.background,
    },

    background: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor:
        theme.colors.background,
    },

    particles: {
      ...StyleSheet.absoluteFillObject,
    },

    particle: {
      position: "absolute",
      backgroundColor: cyan,
      opacity: 0.60,
    },

    /* ========================================================
       PHONE
       ======================================================== */

    phoneArea: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: metrics.phoneBottom,
      height: metrics.phoneHeight,
      alignItems: "center",
      justifyContent: "center",
      zIndex: 2,
    },

    phoneAnimatedLayer: {
      width: metrics.phoneWidth,
      height: metrics.phoneHeight,
      alignItems: "center",
      justifyContent: "center",
    },

    phone: {
      width: "100%",
      height: "100%",
    },

    /* ========================================================
       REEL
       ======================================================== */

    reelArea: {
      position: "absolute",
      left: 0,
      right: 0,
      top: metrics.reelTop,
      height: metrics.reelHeight,
      alignItems: "center",
      justifyContent: "center",
      zIndex: 4,
    },

    reelAnimatedLayer: {
      width: metrics.reelWidth,
      height: metrics.reelHeight,
      alignItems: "center",
      justifyContent: "center",
    },

    reel: {
      width: "100%",
      height: "100%",
    },

    reelGlow: {
      position: "absolute",
      width:
        metrics.reelWidth * 0.72,
      height:
        metrics.reelWidth * 0.72,
      borderRadius: 999,
      backgroundColor: `${cyan}13`,
      shadowColor: cyan,
      shadowOpacity: 0.42,
      shadowRadius: 25,
      elevation: 7,
    },

    /* ========================================================
       HERO
       ======================================================== */

    heroArea: {
      position: "absolute",
      left: 0,
      right: 0,
      top: metrics.heroTop,
      height: metrics.heroHeight,
      alignItems: "center",
      justifyContent: "center",
      zIndex: 5,
    },

    heroAnimatedLayer: {
      width: metrics.heroWidth,
      height: metrics.heroHeight,
      alignItems: "center",
      justifyContent: "center",
    },

    hero: {
      width: "100%",
      height: "100%",
    },

    heroGlow: {
      position: "absolute",
      width:
        metrics.heroWidth * 0.72,
      height:
        metrics.heroWidth * 0.38,
      borderRadius: 999,
      backgroundColor: `${cyan}16`,
      shadowColor: cyan,
      shadowOpacity: 0.40,
      shadowRadius: 30,
      elevation: 8,
    },

    /* ========================================================
       ICONS
       ======================================================== */

    iconSlot: {
      position: "absolute",
      width: metrics.iconSize,
      height: metrics.iconSize,
      zIndex: 7,
    },

    iconAnimatedLayer: {
      width: "100%",
      height: "100%",
    },

    iconImage: {
      width: "100%",
      height: "100%",
    },

    /*
     * Icons intentionally sit closer to the hero than the
     * previous version, so they read as one composition.
     */
    aiSlot: {
      left: metrics.width * 0.035,
      top: metrics.height * 0.275,
    },

    magicSlot: {
      left: metrics.width * 0.035,
      top: metrics.height * 0.49,
    },

    clapperSlot: {
      right: metrics.width * 0.025,
      top: metrics.height * 0.30,
    },

    musicSlot: {
      // Music icon remains 2x size, but is moved upward and slightly right
      // so it sits beside the hero instead of colliding with the logo.
      right: metrics.width * 0.00,
      top: metrics.height * 0.41,
      width: metrics.musicIconSize,
      height: metrics.musicIconSize,
    },

    /* ========================================================
       LIGHT SWEEP
       ======================================================== */

    sweepClip: {
      position: "absolute",
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      overflow: "hidden",
      zIndex: 8,
    },

    sweep: {
      position: "absolute",
      top: "13%",
      bottom: "27%",
      width: 30,
      backgroundColor: `${cyan}1C`,
      shadowColor: cyan,
      shadowOpacity: 0.62,
      shadowRadius: 22,
      elevation: 4,
      transform: [
        {
          skewX: "-10deg",
        },
      ],
    },

    /* ========================================================
       LOGO
       ======================================================== */

    logoArea: {
      position: "absolute",
      left: 0,
      right: 0,
      top: metrics.logoTop,
      height: metrics.logoHeight,
      alignItems: "center",
      justifyContent: "center",
      zIndex: 10,
    },

    logoAnimatedLayer: {
      width: metrics.logoWidth,
      height: metrics.logoHeight,
      alignItems: "center",
      justifyContent: "center",
    },

    logo: {
      width: "100%",
      height: "100%",
    },

    /* ========================================================
       TAGLINE
       ======================================================== */

    taglineArea: {
      position: "absolute",
      left: 0,
      right: 0,
      top: metrics.taglineTop,
      alignItems: "center",
      zIndex: 10,
    },

    tagline: {
      color: cyan,
      fontSize:
        metrics.width < 380
          ? 13
          : 14,
      fontWeight: "700",
      letterSpacing: 1.55,
      textAlign: "center",
    },

    /* ========================================================
       LOADING
       ======================================================== */

    loadingArea: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: metrics.loadingBottom,
      alignItems: "center",
      zIndex: 11,
    },

    loadingText: {
      color: cyan,
      fontSize: 12,
      fontWeight: "700",
      letterSpacing: 2.15,
      marginBottom: 11,
    },

    loadingTrack: {
      width:
        metrics.width * 0.56,
      height: 6,
      borderRadius: 20,
      overflow: "hidden",
      backgroundColor: `${cyan}26`,
    },

    loadingFill: {
      width: "100%",
      height: "100%",
      borderRadius: 20,
      backgroundColor: cyan,
      transformOrigin: "left",
    },

    loadingGlow: {
      position: "absolute",
      width:
        metrics.width * 0.56,
      height: 14,
      bottom: 0,
      borderRadius: 20,
      backgroundColor: `${cyan}1B`,
      shadowColor: cyan,
      shadowOpacity: 0.50,
      shadowRadius: 11,
      elevation: 4,
    },

    /* ========================================================
       FINAL FLASH
       ======================================================== */

    finalFlash: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "#D8FFFF",
      zIndex: 20,
    },
  });
}