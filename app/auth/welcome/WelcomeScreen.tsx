import { useMemo, useState } from "react";
import { FlatList, Image, Pressable, Text, useWindowDimensions, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  Poppins_400Regular,
  Poppins_600SemiBold,
  Poppins_800ExtraBold,
  useFonts,
} from "@expo-google-fonts/poppins";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeIn, FadeInUp, type SharedValue, useSharedValue } from "react-native-reanimated";

import {
  particles,
  type Particle,
  useHeadlineEntrance,
  useIndicatorMotion,
  useParticleMotion,
  useWelcomeEntrance,
} from "./animations";
import { createWelcomeStyles, welcomeColors } from "./styles";
import { Button } from "../../../src/components/Button";
import { authService } from "../../../src/services/auth/authService";
import { useTheme } from "../../../src/theme";

const HERO_ART = require("../../../assets/hero3.png");
const LOGO_ART = require("../../../assets/logo.png");
const PAGES = ["welcome-1", "welcome-2", "welcome-3"] as const;

function FloatingParticle({ delay, kind, left, opacity, size, top }: Particle) {
  const theme = useTheme();
  const styles = useMemo(() => createWelcomeStyles(theme, false, 280), [theme]);
  const animatedStyle = useParticleMotion(delay, opacity);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.particle,
        {
          height: size,
          left,
          shadowOpacity: size > 3 ? 0.55 : 0.3,
          shadowRadius: size > 3 ? 5 : 2,
          top,
          width: size,
        },
        animatedStyle,
      ]}
    >
      {kind === "sparkle" ? (
        <>
          <View style={[styles.sparkleArm, { width: size * 2.4 }]} />
          <View style={[styles.sparkleArm, styles.sparkleArmVertical, { width: size * 2.4 }]} />
        </>
      ) : null}
    </Animated.View>
  );
}

function PageIndicator({ index, pageWidth, scrollX }: { index: number; pageWidth: number; scrollX: SharedValue<number> }) {
  const theme = useTheme();
  const styles = useMemo(() => createWelcomeStyles(theme, false, 280), [theme]);
  const animatedStyle = useIndicatorMotion(index, pageWidth, scrollX);

  return <Animated.View style={[styles.indicator, animatedStyle]} />;
}

function WelcomePage({ compact, heroSize, width }: { compact: boolean; heroSize: number; width: number }) {
  const theme = useTheme();
  const styles = useMemo(() => createWelcomeStyles(theme, compact, heroSize), [compact, heroSize, theme]);
  const { headlineStyle, subtitleStyle } = useHeadlineEntrance();

  return (
    <View style={[styles.page, { width }]}>
      <View style={styles.heroWrap}>
        <View style={styles.heroGlow} />
        <Image accessibilityLabel="Shivora cinematic camera illustration" source={HERO_ART} style={styles.heroImage} />
      </View>
      <Animated.View style={[styles.headlineWrap, headlineStyle]}>
        <Text style={styles.headline}>Create Stories{"\n"}That <Text style={styles.headlineAccent}>Move</Text></Text>
      </Animated.View>
      <Animated.Text style={[styles.subtitle, subtitleStyle]}>
        Transform your ideas into cinematic{"\n"}videos powered by AI.
      </Animated.Text>
    </View>
  );
}

export default function WelcomeScreen() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_800ExtraBold,
  });
  const router = useRouter();
  const theme = useTheme();
  const { height, width } = useWindowDimensions();
  const compact = height < 760;
  const heroSize = Math.min(width - theme.spacing[48], compact ? 264 : 320);
  const styles = useMemo(() => createWelcomeStyles(theme, compact, heroSize), [compact, heroSize, theme]);
  const scrollX = useSharedValue(0);
  const { logoStyle, screenStyle } = useWelcomeEntrance();
  const [isContinuingAsGuest, setIsContinuingAsGuest] = useState(false);

  const continueAsGuest = async () => {
    setIsContinuingAsGuest(true);

    try {
      await authService.continueAsGuest();
      router.replace("/(tabs)/home");
    } finally {
      setIsContinuingAsGuest(false);
    }
  };

  if (!fontsLoaded) {
    return <SafeAreaView style={styles.safeArea} />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.View style={[styles.screen, screenStyle]}>
        <View pointerEvents="none" style={styles.particleLayer}>
          {particles.map((particle) => <FloatingParticle key={`${particle.left}-${particle.top}`} {...particle} />)}
        </View>

        <Animated.View style={[styles.header, logoStyle]}>
          <View style={styles.brandLockup}>
            <View style={styles.brandMarkClip}>
              <Image source={LOGO_ART} style={styles.brandMarkSource} />
            </View>
        
          </View>
        </Animated.View>

        <FlatList
          data={PAGES}
          decelerationRate="fast"
          horizontal
          keyExtractor={(item) => item}
          onScroll={(event) => {
            scrollX.value = event.nativeEvent.contentOffset.x;
          }}
          pagingEnabled
          renderItem={() => <WelcomePage compact={compact} heroSize={heroSize} width={width} />}
          scrollEventThrottle={16}
          showsHorizontalScrollIndicator={false}
          style={styles.pager}
        />

        <View style={styles.footer}>
          <Animated.View entering={FadeIn.delay(1000).duration(400)} style={styles.indicatorRow}>
            {PAGES.map((_, index) => <PageIndicator index={index} key={index} pageWidth={width} scrollX={scrollX} />)}
          </Animated.View>
          <Animated.View entering={FadeInUp.delay(500).duration(600)}>
            <LinearGradient
              colors={[welcomeColors.buttonStart, welcomeColors.buttonEnd]}
              end={{ x: 1, y: 0 }}
              start={{ x: 0, y: 1 }}
              style={styles.primaryGradient}
            >
              <Button
                fullWidth
                onPress={() => router.push("/auth/login")}
                rightIcon={<Ionicons color={theme.colors.background} name="arrow-forward" size={24} />}
                size="large"
                style={styles.primaryButton}
                textStyle={styles.primaryButtonText}
                variant="ghost"
              >
                Get Started
              </Button>
            </LinearGradient>
          </Animated.View>
          <Animated.View entering={FadeIn.delay(1400).duration(400)}>
            <Pressable
              accessibilityLabel="Continue as guest"
              accessibilityRole="button"
              disabled={isContinuingAsGuest}
              onPress={() => void continueAsGuest()}
              style={styles.guestAction}
            >
              <Text style={styles.guestText}>{isContinuingAsGuest ? "Continuing…" : "Continue as Guest"}</Text>
            </Pressable>
          </Animated.View>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}
