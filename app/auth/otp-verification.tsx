import {
  forwardRef,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { authService } from "../../src/services/auth/authService";
import { useTheme } from "../../src/theme";

/* ============================================================
   ASSETS
   ============================================================ */

const MOBILE_LOGIN_HERO = require("../../assets/mobile-login-hero.png");

const OTP_BOTTOM_FILM_REEL = require("../../assets/otp-bottom-film-reel.png");

/* ============================================================
   DESIGN TOKENS
   ============================================================ */

const COLORS = {
  background: "#02080D",
  card: "#06151E",
  cardSoft: "#071923",
  text: "#F7FAFC",
  secondary: "#AFC0CC",
  muted: "#728593",
  cyan: "#08DDE8",
  cyanBright: "#00F3FF",
  border: "#164B5D",
  borderBright: "#0FE5F4",
  divider: "#1F3A47",
  blue: "#2C79FF",
  purple: "#8A2BFF",
  error: "#FF6B86",
};

const OTP_LENGTH = 6;

/* ============================================================
   OTP CELL
   ============================================================ */

type OtpCellProps = {
  active: boolean;
  index: number;
  onBackspace: () => void;
  onChangeText: (value: string) => void;
  onFocus: () => void;
  value: string;
  styles: ReturnType<typeof createStyles>;
};

const OtpCell = forwardRef<TextInput, OtpCellProps>(function OtpCell(
  {
    active,
    index,
    onBackspace,
    onChangeText,
    onFocus,
    value,
    styles,
  },
  ref,
) {
  const focus = useSharedValue(active ? 1 : 0);
  const scale = useSharedValue(1);

  useEffect(() => {
    focus.value = withTiming(active ? 1 : 0, {
      duration: 160,
    });
  }, [active, focus]);

  useEffect(() => {
    if (value) {
      scale.value = withSequence(
        withSpring(1.07),
        withSpring(1),
      );
    }
  }, [scale, value]);

  const animatedStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      focus.value,
      [0, 1],
      [COLORS.border, COLORS.cyan],
    ),
    shadowOpacity: focus.value * 0.34,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.otpCell, animatedStyle]}>
      <TextInput
        ref={ref}
        accessibilityLabel={`Verification code digit ${index + 1}`}
        autoCorrect={false}
        caretHidden={false}
        keyboardType="number-pad"
        maxLength={1}
        onChangeText={onChangeText}
        onFocus={onFocus}
        onKeyPress={({ nativeEvent }) => {
          if (nativeEvent.key === "Backspace" && !value) {
            onBackspace();
          }
        }}
        selectionColor={COLORS.cyan}
        style={styles.otpInput}
        textAlign="center"
        value={value}
      />
    </Animated.View>
  );
});

/* ============================================================
   SCREEN
   ============================================================ */

export default function OtpVerificationScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const theme = useTheme();

  /*
   * Freeze the original viewport dimensions.
   *
   * iOS can report a smaller window height when the keyboard
   * appears. Profile Setup deliberately keeps its original
   * design viewport, so the bottom reel does not resize or move.
   * OTP uses the same approach so both screens match.
   */
  const initialViewport = useRef({
    width,
    height,
  }).current;

  const designWidth = initialViewport.width;
  const designHeight = initialViewport.height;

  const compact = designHeight < 900;

  const stylesForScreen = useMemo(
    () =>
      createStyles(
        designWidth,
        designHeight,
        compact,
        theme,
      ),
    [
      compact,
      designHeight,
      designWidth,
      theme,
    ],
  );

  const { phone } = useLocalSearchParams<{
    phone?: string;
  }>();

  const [otp, setOtp] = useState<string[]>(
    Array<string>(OTP_LENGTH).fill(""),
  );

  const [remainingSeconds, setRemainingSeconds] = useState(30);
  const [error, setError] = useState<string | undefined>();
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const inputsRef = useRef<Array<TextInput | null>>([]);

  const resolvedPhone =
    typeof phone === "string" ? phone : "";

  const otpValue = otp.join("");

  /* ============================================================
     PHONE FORMAT
     ============================================================ */

  const formattedPhone = (() => {
    if (!resolvedPhone) {
      return "";
    }

    const codes = ["+91", "+44", "+1"];

    for (const code of codes) {
      if (resolvedPhone.startsWith(code)) {
        return `${code} ${resolvedPhone.slice(code.length)}`;
      }
    }

    return resolvedPhone;
  })();

  /* ============================================================
     TIMER
     ============================================================ */

  useEffect(() => {
    if (remainingSeconds === 0) {
      return;
    }

    const timer = setInterval(() => {
      setRemainingSeconds((seconds) =>
        Math.max(0, seconds - 1),
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [remainingSeconds]);

  /* ============================================================
     OTP INPUT
     ============================================================ */

  const updateOtp = (value: string, index: number) => {
    const digit = value.replace(/\D/g, "").slice(-1);

    setOtp((currentOtp) => {
      const nextOtp = [...currentOtp];
      nextOtp[index] = digit;
      return nextOtp;
    });

    setError(undefined);

    if (digit && index < OTP_LENGTH - 1) {
      setActiveIndex(index + 1);

      requestAnimationFrame(() => {
        inputsRef.current[index + 1]?.focus();
      });
    }

    if (digit && index === OTP_LENGTH - 1) {
      setActiveIndex(index);
      Keyboard.dismiss();
    }
  };

  /* ============================================================
     VERIFY OTP
     ============================================================ */

  const verifyOtp = async () => {
    Keyboard.dismiss();

    if (
      otpValue.length !== OTP_LENGTH ||
      !resolvedPhone
    ) {
      setError(
        "Enter the complete 6-digit verification code.",
      );
      return;
    }

    setIsVerifying(true);

    try {
      const result = await authService.verifyOtp(
        resolvedPhone,
        otpValue,
      );

      if (!result.success || !result.user) {
        setError(
          result.error ?? "Unable to verify this code.",
        );
        return;
      }

      router.replace({
        pathname: result.user.isProfileComplete
          ? "/(tabs)/home"
          : "/auth/profile-setup",
        params: {
          phone: resolvedPhone,
        },
      });
    } finally {
      setIsVerifying(false);
    }
  };

  /* ============================================================
     RESEND OTP
     ============================================================ */

  const resendCode = async () => {
    if (!resolvedPhone || remainingSeconds > 0) {
      return;
    }

    setIsResending(true);

    try {
      await authService.loginWithPhone(resolvedPhone);

      setOtp(Array<string>(OTP_LENGTH).fill(""));
      setError(undefined);
      setRemainingSeconds(30);
      setActiveIndex(0);

      requestAnimationFrame(() => {
        inputsRef.current[0]?.focus();
      });
    } finally {
      setIsResending(false);
    }
  };

  /* ============================================================
     RENDER
     ============================================================ */

  return (
    <SafeAreaView
      style={stylesForScreen.safeArea}
      edges={["top", "bottom"]}
    >
      <TouchableWithoutFeedback
        accessible={false}
        onPress={Keyboard.dismiss}
      >
        <View style={stylesForScreen.root}>
          {/* ==================================================
              BACKGROUND
          ================================================== */}

          <View
            pointerEvents="none"
            style={stylesForScreen.backgroundGlow}
          />

          {/* ==================================================
              BOTTOM FILM REEL
          ================================================== */}

          <Image
            source={OTP_BOTTOM_FILM_REEL}
            resizeMode="stretch"
            style={stylesForScreen.bottomFilmReel}
          />

          {/* ==================================================
              KEYBOARD AREA
          ================================================== */}

          <KeyboardAvoidingView
            behavior={
              Platform.OS === "ios"
                ? "padding"
                : undefined
            }
            style={stylesForScreen.keyboard}
          >
            <ScrollView
              bounces={false}
              contentContainerStyle={
                stylesForScreen.content
              }
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* ==================================================
                  HEADER
              ================================================== */}

              <Animated.View
                entering={FadeIn.duration(450)}
                style={stylesForScreen.header}
              >
                <Pressable
                  accessibilityLabel="Go back"
                  accessibilityRole="button"
                  hitSlop={10}
                  onPress={() => {
                    Keyboard.dismiss();
                    router.back();
                  }}
                  style={({ pressed }) => [
                    stylesForScreen.backButton,
                    pressed &&
                      stylesForScreen.backButtonPressed,
                  ]}
                >
                  <Ionicons
                    color={COLORS.text}
                    name="chevron-back"
                    size={28}
                  />
                </Pressable>
              </Animated.View>

              {/* ==================================================
                  HERO
              ================================================== */}

              <Animated.View
                entering={FadeInDown.delay(80).duration(650)}
                style={stylesForScreen.hero}
              >
                <Image
                  accessibilityLabel="Shivora AI Video Creation"
                  source={MOBILE_LOGIN_HERO}
                  resizeMode="contain"
                  style={stylesForScreen.heroImage}
                />
              </Animated.View>

              {/* ==================================================
                  VERIFICATION CARD
              ================================================== */}

              <Animated.View
                entering={FadeInUp.delay(160).duration(650)}
                style={stylesForScreen.verifyCard}
              >
                <View style={stylesForScreen.securityBadge}>
                  <Ionicons
                    color={COLORS.cyan}
                    name="shield-checkmark-outline"
                    size={28}
                  />
                </View>

                <Text style={stylesForScreen.title}>
                  Verify your number
                </Text>

                <Text style={stylesForScreen.subtitle}>
                  Enter the 6-digit verification code{"\n"}
                  sent to{" "}
                  <Text style={stylesForScreen.phoneText}>
                    {formattedPhone ||
                      "your mobile number"}
                  </Text>
                </Text>

                {/* ==================================================
                    OTP CELLS
                ================================================== */}

                <Animated.View
                  entering={FadeInUp.delay(260).duration(
                    520,
                  )}
                  style={stylesForScreen.otpRow}
                >
                  {otp.map((digit, index) => (
                    <OtpCell
                      key={index}
                      ref={(input) => {
                        inputsRef.current[index] = input;
                      }}
                      active={activeIndex === index}
                      index={index}
                      onBackspace={() => {
                        if (index > 0) {
                          setActiveIndex(index - 1);
                          inputsRef.current[
                            index - 1
                          ]?.focus();
                        }
                      }}
                      onChangeText={(value) =>
                        updateOtp(value, index)
                      }
                      onFocus={() =>
                        setActiveIndex(index)
                      }
                      value={digit}
                      styles={stylesForScreen}
                    />
                  ))}
                </Animated.View>

                {/* ==================================================
                    ERROR
                ================================================== */}

                {error ? (
                  <Text
                    accessibilityRole="alert"
                    style={stylesForScreen.errorText}
                  >
                    {error}
                  </Text>
                ) : null}

                {/* ==================================================
                    RESEND TIMER
                ================================================== */}

                <Animated.View
                  entering={FadeIn.delay(340).duration(450)}
                  style={stylesForScreen.timerPill}
                >
                  <Ionicons
                    color={COLORS.secondary}
                    name="time-outline"
                    size={19}
                  />

                  <Text
                    style={stylesForScreen.timerText}
                  >
                    {remainingSeconds > 0
                      ? "Resend code in "
                      : "You can "}

                    <Text
                      style={stylesForScreen.timerAccent}
                    >
                      {remainingSeconds > 0
                        ? `00:${String(
                            remainingSeconds,
                          ).padStart(2, "0")}`
                        : "Resend"}
                    </Text>
                  </Text>
                </Animated.View>

                {/* ==================================================
                    VERIFY CTA
                ================================================== */}

                <Pressable
                  accessibilityLabel="Verify"
                  accessibilityRole="button"
                  accessibilityState={{
                    busy: isVerifying,
                    disabled:
                      otpValue.length !== OTP_LENGTH ||
                      isVerifying,
                  }}
                  disabled={
                    otpValue.length !== OTP_LENGTH ||
                    isVerifying
                  }
                  onPress={() => void verifyOtp()}
                  style={({ pressed }) => [
                    stylesForScreen.verifyButton,
                    otpValue.length !== OTP_LENGTH &&
                      stylesForScreen.verifyDisabled,
                    pressed &&
                      otpValue.length === OTP_LENGTH &&
                      !isVerifying &&
                      stylesForScreen.verifyPressed,
                  ]}
                >
                  <LinearGradient
                    colors={[
                      "#08DDE8",
                      "#2C79FF",
                      "#8A2BFF",
                    ]}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={stylesForScreen.verifyGradient}
                  >
                    {isVerifying ? (
                      <ActivityIndicator
                        color="#FFFFFF"
                        size="small"
                      />
                    ) : (
                      <>
                        <Text
                          style={stylesForScreen.verifyText}
                        >
                          Verify
                        </Text>

                        <Ionicons
                          color="#FFFFFF"
                          name="arrow-forward"
                          size={28}
                          style={stylesForScreen.verifyArrow}
                        />
                      </>
                    )}
                  </LinearGradient>
                </Pressable>
              </Animated.View>

              {/* ==================================================
                  RESEND ACTION
              ================================================== */}

              <Animated.View
                entering={FadeInUp.delay(410).duration(480)}
                style={stylesForScreen.resendArea}
              >
                <Text
                  style={stylesForScreen.resendText}
                >
                  Didn’t receive code?{" "}
                  <Text
                    onPress={
                      remainingSeconds === 0 &&
                      !isResending
                        ? () => void resendCode()
                        : undefined
                    }
                    style={[
                      stylesForScreen.resendLink,
                      remainingSeconds > 0 &&
                        stylesForScreen.resendDisabled,
                    ]}
                  >
                    {isResending
                      ? "Sending…"
                      : "Resend"}
                  </Text>
                </Text>
              </Animated.View>
            </ScrollView>
          </KeyboardAvoidingView>
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
  isCompact: boolean,
  theme: ReturnType<typeof useTheme>,
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

    root: {
      width: screenWidth,
      height: screenHeight,
      backgroundColor: COLORS.background,
      overflow: "hidden",
    },

    keyboard: {
      flex: 1,
    },

    content: {
      flexGrow: 1,
      paddingHorizontal: isCompact ? 21 : 27,
      paddingTop: isCompact ? 3 : 8,
      paddingBottom: isCompact ? 20 : 26,
    },

    backgroundGlow: {
      position: "absolute",
      top: screenHeight * 0.12,
      left: screenWidth * 0.12,
      width: screenWidth * 0.76,
      height: screenWidth * 0.58,
      borderRadius: screenWidth,
      backgroundColor: "rgba(0, 213, 255, 0.028)",
    },

    /* ========================================================
       BOTTOM FILM REEL
       Full width with -10 / -10 edge extension
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
       HEADER / BACK BUTTON
    ======================================================== */

    header: {
      width: "100%",
      height: isCompact ? 48 : 54,
      justifyContent: "center",
      alignItems: "flex-start",
      zIndex: 10,
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
      opacity: 0.76,
      transform: [{ scale: 0.95 }],
    },

    /* ========================================================
       HERO
    ======================================================== */

    hero: {
      width: "100%",
      height: isCompact
        ? Math.min(screenWidth * 0.56, 170)
        : Math.min(screenWidth * 0.64, 210),
      alignItems: "center",
      justifyContent: "center",
      marginTop: -9,
      marginBottom: isCompact ? -2 : 0,
      zIndex: 2,
    },

    heroImage: {
      width: "88%",
      height: "88%",
    },

    /* ========================================================
       VERIFICATION CARD
    ======================================================== */

    verifyCard: {
      width: "100%",
      backgroundColor: "rgba(5, 18, 27, 0.975)",
      borderWidth: 1.25,
      borderColor: "#087991",
      borderRadius: isCompact ? 23 : 28,
      paddingHorizontal: isCompact ? 18 : 26,
      paddingTop: isCompact ? 29 : 34,
      paddingBottom: isCompact ? 18 : 22,
      marginTop: isCompact ? 0 : 1,
      zIndex: 5,
      shadowColor: COLORS.cyan,
      shadowOffset: {
        width: 0,
        height: 0,
      },
      shadowOpacity: 0.11,
      shadowRadius: 17,
      elevation: 7,
    },

    securityBadge: {
      position: "absolute",
      top: isCompact ? -22 : -26,
      alignSelf: "center",
      width: isCompact ? 48 : 56,
      height: isCompact ? 48 : 56,
      borderRadius: 100,
      backgroundColor: "#031119",
      borderWidth: 1.25,
      borderColor: COLORS.cyan,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: COLORS.cyan,
      shadowOffset: {
        width: 0,
        height: 0,
      },
      shadowOpacity: 0.38,
      shadowRadius: 15,
      elevation: 8,
    },

    title: {
      color: COLORS.text,
      textAlign: "center",
      fontSize: isCompact ? 22 : 26,
      lineHeight: isCompact ? 28 : 32,
      fontWeight: "700",
      letterSpacing: -0.5,
    },

    subtitle: {
      color: COLORS.secondary,
      textAlign: "center",
      fontSize: isCompact ? 13 : 14,
      lineHeight: isCompact ? 19 : 20,
      marginTop: 6,
    },

    phoneText: {
      color: COLORS.cyan,
      fontWeight: "600",
    },

    /* ========================================================
       OTP
    ======================================================== */

    otpRow: {
      width: "100%",
      flexDirection: "row",
      gap: isCompact ? 7 : 9,
      marginTop: isCompact ? 24 : 28,
    },

    otpCell: {
      flex: 1,
      height: isCompact ? 56 : 62,
      minWidth: 0,
      borderWidth: 1.4,
      borderRadius: isCompact ? 15 : 17,
      borderColor: COLORS.border,
      backgroundColor: "#05111A",
      shadowColor: COLORS.cyan,
      shadowOffset: {
        width: 0,
        height: 0,
      },
      shadowRadius: 11,
    },

    otpInput: {
      flex: 1,
      color: COLORS.text,
      fontSize: isCompact ? 24 : 28,
      lineHeight: isCompact ? 28 : 33,
      fontWeight: "600",
      padding: 0,
      includeFontPadding: false,
    },

    errorText: {
      color: COLORS.error,
      textAlign: "center",
      fontSize: 12,
      lineHeight: 17,
      marginTop: 8,
    },

    /* ========================================================
       TIMER
    ======================================================== */

    timerPill: {
      alignSelf: "center",
      minHeight: isCompact ? 42 : 46,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: "#122A39",
      backgroundColor: "rgba(5, 17, 27, 0.82)",
      paddingHorizontal: isCompact ? 16 : 18,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginTop: isCompact ? 20 : 24,
    },

    timerText: {
      color: COLORS.secondary,
      fontSize: isCompact ? 13 : 14,
      marginLeft: 9,
    },

    timerAccent: {
      color: COLORS.cyan,
      fontWeight: "600",
    },

    /* ========================================================
       VERIFY BUTTON
    ======================================================== */

    verifyButton: {
      width: "100%",
      height: isCompact ? 54 : 60,
      borderRadius: isCompact ? 27 : 30,
      overflow: "hidden",
      marginTop: isCompact ? 24 : 29,
      shadowColor: COLORS.cyan,
      shadowOffset: {
        width: 0,
        height: 7,
      },
      shadowOpacity: 0.24,
      shadowRadius: 13,
      elevation: 8,
    },

    verifyGradient: {
      width: "100%",
      height: "100%",
      borderRadius: isCompact ? 27 : 30,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },

    verifyDisabled: {
      opacity: 0.46,
    },

    verifyPressed: {
      transform: [{ scale: 0.985 }],
    },

    verifyText: {
      color: "#FFFFFF",
      fontSize: isCompact ? 17 : 18,
      lineHeight: 23,
      fontWeight: "700",
      marginRight: 16,
    },

    verifyArrow: {
      marginTop: 1,
    },

    /* ========================================================
       RESEND
    ======================================================== */

    resendArea: {
      alignItems: "center",
      marginTop: isCompact ? 13 : 17,
      zIndex: 4,
    },

    resendText: {
      color: COLORS.secondary,
      fontSize: isCompact ? 14 : 15,
      lineHeight: isCompact ? 20 : 21,
    },

    resendLink: {
      color: COLORS.cyan,
      fontWeight: "600",
    },

    resendDisabled: {
      opacity: 0.72,
    },

    /* ========================================================
       THEME PLACEHOLDER
    ======================================================== */

    themePlaceholder: {
      backgroundColor: theme.colors.background,
    },
  });
}