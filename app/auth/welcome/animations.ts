import { useEffect } from "react";
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import type { SharedValue } from "react-native-reanimated";

export type Particle = {
  delay: number;
  kind?: "sparkle";
  left: `${number}%`;
  opacity: number;
  size: number;
  top: `${number}%`;
};

export const particles = [
  { delay: 0, left: "8%", opacity: 0.3, size: 2, top: "22%" },
  { delay: 180, left: "13%", opacity: 0.56, size: 3, top: "29%" },
  { delay: 360, left: "18%", opacity: 0.24, size: 1, top: "37%" },
  { delay: 540, left: "22%", opacity: 0.68, size: 2, top: "19%" },
  { delay: 720, left: "24%", opacity: 0.4, size: 4, top: "44%" },
  { delay: 900, left: "28%", opacity: 0.8, size: 2, top: "32%" },
  { delay: 1080, left: "31%", opacity: 0.32, size: 1, top: "26%" },
  { delay: 1260, left: "34%", opacity: 0.62, size: 3, top: "49%" },
  { delay: 1440, left: "37%", opacity: 0.46, size: 2, top: "17%" },
  { delay: 1620, left: "40%", opacity: 0.72, size: 4, top: "38%" },
  { delay: 1800, left: "44%", opacity: 0.28, size: 1, top: "24%" },
  { delay: 1980, left: "47%", opacity: 0.58, size: 2, top: "54%" },
  { delay: 2160, left: "50%", opacity: 0.35, size: 1, top: "15%" },
  { delay: 2340, left: "53%", opacity: 0.84, size: 3, top: "29%" },
  { delay: 2520, left: "56%", opacity: 0.42, size: 2, top: "46%" },
  { delay: 2700, left: "59%", opacity: 0.64, size: 4, top: "35%" },
  { delay: 2880, left: "62%", opacity: 0.26, size: 1, top: "22%" },
  { delay: 3060, left: "65%", opacity: 0.76, size: 2, top: "51%" },
  { delay: 3240, left: "68%", opacity: 0.38, size: 3, top: "18%" },
  { delay: 3420, left: "71%", opacity: 0.6, size: 2, top: "42%" },
  { delay: 3600, left: "74%", opacity: 0.22, size: 1, top: "31%" },
  { delay: 3780, left: "77%", opacity: 0.82, size: 4, top: "25%" },
  { delay: 3960, left: "80%", opacity: 0.44, size: 2, top: "48%" },
  { delay: 4140, left: "83%", opacity: 0.66, size: 3, top: "36%" },
  { delay: 4320, left: "87%", opacity: 0.3, size: 1, top: "20%" },
  { delay: 4500, left: "90%", opacity: 0.54, size: 2, top: "44%" },
  { delay: 4680, left: "11%", opacity: 0.7, size: 3, top: "54%" },
  { delay: 4860, left: "20%", opacity: 0.25, size: 1, top: "56%" },
  { delay: 5040, left: "30%", opacity: 0.48, size: 2, top: "57%" },
  { delay: 5220, left: "42%", opacity: 0.86, size: 3, top: "57%" },
  { delay: 5400, left: "54%", opacity: 0.36, size: 2, top: "58%" },
  { delay: 5580, left: "67%", opacity: 0.74, size: 3, top: "55%" },
  { delay: 5760, left: "79%", opacity: 0.28, size: 1, top: "56%" },
  { delay: 5940, left: "88%", opacity: 0.52, size: 2, top: "53%" },
  { delay: 620, kind: "sparkle", left: "16%", opacity: 0.54, size: 4, top: "34%" },
  { delay: 1760, kind: "sparkle", left: "27%", opacity: 0.42, size: 3, top: "23%" },
  { delay: 2920, kind: "sparkle", left: "73%", opacity: 0.56, size: 4, top: "39%" },
  { delay: 4080, kind: "sparkle", left: "84%", opacity: 0.46, size: 3, top: "29%" },
  { delay: 5260, kind: "sparkle", left: "24%", opacity: 0.44, size: 3, top: "50%" },
  { delay: 5840, kind: "sparkle", left: "76%", opacity: 0.5, size: 4, top: "52%" },
] as const satisfies readonly Particle[];

export function useWelcomeEntrance() {
  const screenOpacity = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.8);

  useEffect(() => {
    screenOpacity.value = withTiming(1, { duration: 400, easing: Easing.out(Easing.ease) });
    logoOpacity.value = withTiming(1, { duration: 700, easing: Easing.out(Easing.ease) });
    logoScale.value = withTiming(1, { duration: 700, easing: Easing.out(Easing.ease) });
  }, [logoOpacity, logoScale, screenOpacity]);

  const screenStyle = useAnimatedStyle(() => ({ opacity: screenOpacity.value }));
  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  return { logoStyle, screenStyle };
}

export function useHeadlineEntrance() {
  const offset = useSharedValue(30);
  const opacity = useSharedValue(0);
  const subtitleOpacity = useSharedValue(0);

  useEffect(() => {
    offset.value = withTiming(0, { duration: 600, easing: Easing.out(Easing.ease) });
    opacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.ease) });
    subtitleOpacity.value = withDelay(
      300,
      withTiming(1, { duration: 600, easing: Easing.out(Easing.ease) }),
    );
  }, [offset, opacity, subtitleOpacity]);

  const headlineStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: offset.value }],
  }));
  const subtitleStyle = useAnimatedStyle(() => ({ opacity: subtitleOpacity.value }));

  return { headlineStyle, subtitleStyle };
}

export function useParticleMotion(delay: number, peakOpacity: number) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 5000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 5000, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        false,
      ),
    );
  }, [delay, progress]);

  return useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [peakOpacity * 0.7, peakOpacity]),
    transform: [{ translateY: interpolate(progress.value, [0, 1], [5, -5]) }],
  }));
}

export function useIndicatorMotion(index: number, pageWidth: number, scrollX: SharedValue<number>) {
  return useAnimatedStyle(() => {
    const inputRange = [(index - 1) * pageWidth, index * pageWidth, (index + 1) * pageWidth];

    return {
      backgroundColor: interpolateColor(
        scrollX.value,
        inputRange,
        ["rgba(255, 255, 255, 0.2)", "#16D6A3", "rgba(255, 255, 255, 0.2)"],
      ),
      width: interpolate(scrollX.value, inputRange, [6, 44, 6], Extrapolation.CLAMP),
    };
  });
}

export type WelcomeAnimatedStyle = ReturnType<typeof useAnimatedStyle>;
export { Animated };
