import { useEffect, useState } from "react";
import { Image, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { Redirect } from "expo-router";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

import { authService } from "../src/services/auth/authService";
import { type AppTheme, useTheme } from "../src/theme";

const AnimatedImage = Animated.createAnimatedComponent(Image);

const particlePositions = [
  [0.08, 0.2, 3], [0.21, 0.15, 2], [0.33, 0.31, 3], [0.45, 0.12, 2],
  [0.59, 0.23, 3], [0.72, 0.17, 2], [0.84, 0.32, 3], [0.15, 0.49, 2],
  [0.28, 0.41, 3], [0.69, 0.46, 2], [0.9, 0.53, 3], [0.08, 0.62, 2],
] as const;

export default function Index() {
  const theme = useTheme();
  const styles = createStyles(theme);
  const { height, width } = useWindowDimensions();
  const [destination, setDestination] = useState<
    "/(tabs)/home" | "/auth/profile-setup" | "/auth/welcome" | null
  >(null);
  const backgroundOpacity = useSharedValue(0);
  const particlesOpacity = useSharedValue(0);
  const logoProgress = useSharedValue(0);
  const glowOpacity = useSharedValue(0);
  const lensRotation = useSharedValue(0);
  const horizonOpacity = useSharedValue(0);
  const progress = useSharedValue(0);
  const screenOpacity = useSharedValue(1);

  const backgroundStyle = useAnimatedStyle(() => ({ opacity: backgroundOpacity.value }));
  const particlesStyle = useAnimatedStyle(() => ({ opacity: particlesOpacity.value }));
  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoProgress.value,
    transform: [{ scale: interpolate(logoProgress.value, [0, 1], [0.94, 1]) }],
  }));
  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: interpolate(glowOpacity.value, [0, 1], [0.88, 1]) }],
  }));
  const lensStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${lensRotation.value}deg` }],
  }));
  const horizonStyle = useAnimatedStyle(() => ({ opacity: horizonOpacity.value }));
  const progressStyle = useAnimatedStyle(() => ({ transform: [{ scaleX: progress.value }] }));
  const fadeStyle = useAnimatedStyle(() => ({ opacity: screenOpacity.value }));

  useEffect(() => {
    let isMounted = true;
    const wait = (milliseconds: number) =>
      new Promise<void>((resolve) => setTimeout(resolve, milliseconds));

    backgroundOpacity.value = withTiming(1, { duration: 320, easing: Easing.out(Easing.ease) });
    particlesOpacity.value = withDelay(300, withTiming(0.55, { duration: 820, easing: Easing.out(Easing.ease) }));
    logoProgress.value = withDelay(500, withTiming(1, { duration: 780, easing: Easing.out(Easing.cubic) }));
    glowOpacity.value = withDelay(800, withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }));
    lensRotation.value = withDelay(1200, withTiming(8, { duration: 900, easing: Easing.inOut(Easing.ease) }));
    horizonOpacity.value = withDelay(1500, withTiming(1, { duration: 1000, easing: Easing.out(Easing.ease) }));
    progress.value = withDelay(1800, withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }));
    screenOpacity.value = withDelay(2800, withTiming(0, { duration: 200, easing: Easing.inOut(Easing.ease) }));

    const resolveInitialRoute = async () => {
      await wait(2900);
      const user = await authService.getCurrentUser();

      if (!isMounted) {
        return;
      }

      setDestination(user ? (user.isProfileComplete ? "/(tabs)/home" : "/auth/profile-setup") : "/auth/welcome");
    };

    void resolveInitialRoute();

    return () => {
      isMounted = false;
    };
  }, [backgroundOpacity, glowOpacity, horizonOpacity, lensRotation, logoProgress, particlesOpacity, progress, screenOpacity]);

  if (destination) {
    return <Redirect href={destination} />;
  }

  const heroWidth = Math.min(width * 0.78, 360);
  const heroHeight = heroWidth * (620 / 540);
  const wordmarkWidth = Math.min(width * 0.68, 330);
  const horizonWidth = Math.max(width, 440);

  return (
    <Animated.View style={[styles.screen, fadeStyle]}>
      <Animated.View style={[styles.background, backgroundStyle]} />
      <Animated.View pointerEvents="none" style={[styles.particles, particlesStyle]}>
        {particlePositions.map(([left, top, size], index) => (
          <View
            key={index}
            style={[
              styles.particle,
              {
                height: size,
                left: `${left * 100}%`,
                top: `${top * 100}%`,
                width: size,
              },
            ]}
          />
        ))}
      </Animated.View>

      <View style={[styles.heroArea, { top: Math.max(height * 0.12, 92) }]}>
        <Animated.View style={[styles.heroGlowOuter, glowStyle]} />
        <Animated.View style={[styles.heroGlowInner, glowStyle]} />
        <Animated.View style={[styles.heroMask, logoStyle, lensStyle]}>
          <AnimatedImage
            resizeMode="contain"
            source={require("../assets/shivora-splash-hero.png")}
            style={{ height: heroHeight, width: heroWidth }}
          />
        </Animated.View>
      </View>

      <Animated.View style={[styles.wordmark, logoStyle, { width: wordmarkWidth }]}>
        <Text style={styles.wordmarkText}>
          Shiv<Text style={styles.wordmarkAccent}>o</Text>ra
        </Text>
        <Text style={styles.tagline}>CREATE STORIES THAT MOVE.</Text>
      </Animated.View>

      <Animated.View style={[styles.horizonBloomOuter, horizonStyle, { bottom: Math.max(height * 0.18, 126) }]} />
      <Animated.View style={[styles.horizonBloomCore, horizonStyle, { bottom: Math.max(height * 0.205, 144) }]} />
      <AnimatedImage
        resizeMode="contain"
        source={require("../assets/shivora-splash-horizon.png")}
        style={[styles.horizon, horizonStyle, { bottom: Math.max(height * 0.16, 110), width: horizonWidth }]}
      />

      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressBloom, progressStyle]} />
        <Animated.View style={[styles.progressFill, progressStyle]} />
      </View>
    </Animated.View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    screen: {
      backgroundColor: theme.colors.background,
      flex: 1,
      overflow: "hidden",
    },
    background: {
      backgroundColor: theme.colors.background,
      bottom: 0,
      left: 0,
      position: "absolute",
      right: 0,
      top: 0,
    },
    particles: { bottom: 0, left: 0, position: "absolute", right: 0, top: 0 },
    particle: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.radius.round,
      opacity: 0.85,
      position: "absolute",
    },
    heroArea: { alignItems: "center", left: 0, position: "absolute", right: 0 },
    heroGlowOuter: {
      backgroundColor: `${theme.colors.primary}0C`,
      borderRadius: theme.radius.round,
      height: 300,
      position: "absolute",
      top: 44,
      width: 300,
    },
    heroGlowInner: {
      backgroundColor: `${theme.colors.primary}1A`,
      borderRadius: theme.radius.round,
      height: 210,
      position: "absolute",
      top: 80,
      width: 210,
    },
    heroMask: {
      borderRadius: theme.radius.round,
      overflow: "hidden",
    },
    wordmark: { alignItems: "center", alignSelf: "center", position: "absolute", top: "52%" },
    wordmarkText: {
      color: theme.colors.textPrimary,
      fontSize: 58,
      fontWeight: "400",
      letterSpacing: -2.2,
      lineHeight: 68,
    },
    wordmarkAccent: { color: theme.colors.primary },
    tagline: {
      color: theme.colors.primary,
      fontSize: theme.typography.caption.fontSize,
      fontWeight: theme.typography.caption.fontWeight,
      letterSpacing: 2.4,
      lineHeight: theme.typography.caption.lineHeight,
      marginTop: theme.spacing[4],
    },
    horizon: { alignSelf: "center", height: 250, position: "absolute" },
    horizonBloomOuter: {
      alignSelf: "center",
      backgroundColor: `${theme.colors.primary}12`,
      borderRadius: theme.radius.round,
      height: 170,
      position: "absolute",
      width: "88%",
    },
    horizonBloomCore: {
      alignSelf: "center",
      backgroundColor: `${theme.colors.primary}2A`,
      borderRadius: theme.radius.round,
      height: 54,
      position: "absolute",
      width: "38%",
    },
    progressTrack: {
      alignSelf: "center",
      backgroundColor: `${theme.colors.primary}33`,
      borderRadius: theme.radius.round,
      bottom: theme.spacing[32],
      height: 7,
      overflow: "hidden",
      position: "absolute",
      width: "58%",
    },
    progressBloom: {
      backgroundColor: `${theme.colors.primary}66`,
      borderRadius: theme.radius.round,
      bottom: -3,
      height: 13,
      left: 0,
      opacity: 0.5,
      position: "absolute",
      right: 0,
    },
    progressFill: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.radius.round,
      flex: 1,
      transformOrigin: "left",
    },
  });
