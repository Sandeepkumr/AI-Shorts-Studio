import { forwardRef, useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput as NativeTextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  FadeIn,
  FadeInUp,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { Button } from "../../src/components/Button";
import { TextInput } from "../../src/components/TextInput";
import { authService } from "../../src/services/auth/authService";
import { useTheme } from "../../src/theme";

const OTP_LENGTH = 6;

type OtpCellProps = {
  active: boolean;
  index: number;
  onBackspace: () => void;
  onChangeText: (value: string) => void;
  onFocus: () => void;
  value: string;
};

const OtpCell = forwardRef<NativeTextInput, OtpCellProps>(function OtpCell(
  { active, index, onBackspace, onChangeText, onFocus, value },
  ref,
) {
  const theme = useTheme();
  const styles = createOtpCellStyles();
  const scale = useSharedValue(1);
  const focus = useSharedValue(active ? 1 : 0);

  useEffect(() => {
    focus.value = withTiming(active ? 1 : 0, { duration: 160 });
  }, [active, focus]);

  useEffect(() => {
    if (value) {
      scale.value = withSequence(withSpring(1.1), withSpring(1));
    }
  }, [scale, value]);

  const animatedStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      focus.value,
      [0, 1],
      [theme.colors.border, theme.colors.primary],
    ),
    shadowOpacity: focus.value * 0.36,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.cell, animatedStyle]}>
      <TextInput
        ref={ref}
        accessibilityLabel={`Verification code digit ${index + 1}`}
        inputStyle={styles.inputText}
        keyboardType="number-pad"
        maxLength={1}
        onChangeText={onChangeText}
        onFocus={onFocus}
        onKeyPress={({ nativeEvent }) => {
          if (nativeEvent.key === "Backspace" && !value) {
            onBackspace();
          }
        }}
        value={value}
      />
    </Animated.View>
  );

  function createOtpCellStyles() {
    return StyleSheet.create({
      cell: {
        borderRadius: theme.radius.medium,
        borderWidth: 1,
        flex: 1,
        shadowColor: theme.colors.primary,
        shadowOffset: { height: 0, width: 0 },
        shadowRadius: 10,
      },
      inputText: { textAlign: "center", ...theme.typography.title },
    });
  }
});

export default function OtpVerificationScreen() {
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone?: string }>();
  const theme = useTheme();
  const styles = createStyles();
  const [otp, setOtp] = useState(Array<string>(OTP_LENGTH).fill(""));
  const [remainingSeconds, setRemainingSeconds] = useState(30);
  const [error, setError] = useState<string | undefined>();
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputsRef = useRef<Array<NativeTextInput | null>>([]);
  const resolvedPhone = typeof phone === "string" ? phone : "";
  const otpValue = otp.join("");

  useEffect(() => {
    if (remainingSeconds === 0) {
      return;
    }

    const timer = setInterval(() => {
      setRemainingSeconds((seconds) => Math.max(0, seconds - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [remainingSeconds]);

  const updateOtp = (value: string, index: number) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    setOtp((currentOtp) => {
      const nextOtp = [...currentOtp];
      nextOtp[index] = digit;
      return nextOtp;
    });
    setError(undefined);

    if (digit && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const verifyOtp = async () => {
    if (otpValue.length !== OTP_LENGTH || !resolvedPhone) {
      setError("Enter the complete 6-digit verification code.");
      return;
    }

    setIsVerifying(true);

    try {
      const result = await authService.verifyOtp(resolvedPhone, otpValue);

      if (!result.success || !result.user) {
        setError(result.error ?? "Unable to verify this code.");
        return;
      }

      router.replace(
        result.user.isProfileComplete ? "/(tabs)/home" : "/auth/profile-setup",
      );
    } finally {
      setIsVerifying(false);
    }
  };

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
      inputsRef.current[0]?.focus();
    } finally {
      setIsResending(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Pressable
          accessibilityLabel="Go back"
          accessibilityRole="button"
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons color={theme.colors.textPrimary} name="chevron-back" size={24} />
        </Pressable>

        <Animated.View entering={FadeInUp.delay(80).duration(620)} style={styles.verificationIllustration}>
          <View style={styles.illustrationGlow} />
          <View style={styles.orbitLarge} />
          <View style={styles.orbitSmall} />
          <View style={styles.shieldTile}>
            <Ionicons color={theme.colors.primary} name="shield-checkmark-outline" size={86} />
          </View>
          <Ionicons color={theme.colors.primary} name="sparkles" size={17} style={styles.sparkleOne} />
          <Ionicons color={theme.colors.secondary} name="sparkles" size={14} style={styles.sparkleTwo} />
        </Animated.View>
        <Animated.Text entering={FadeInUp.delay(160).duration(520)} style={styles.title}>Verify your number</Animated.Text>
        <Animated.Text entering={FadeIn.delay(260).duration(450)} style={styles.subtitle}>
          Enter the 6-digit verification code{"\n"}sent to <Text style={styles.phoneText}>{resolvedPhone || "your mobile number"}</Text>
        </Animated.Text>

        <Animated.View entering={FadeInUp.delay(300).duration(520)} style={styles.otpRow}>
          {otp.map((digit, index) => (
            <OtpCell
              key={index}
              ref={(input) => {
                inputsRef.current[index] = input;
              }}
              active={activeIndex === index}
              index={index}
              onChangeText={(value) => updateOtp(value, index)}
              onBackspace={() => {
                if (index > 0) {
                  inputsRef.current[index - 1]?.focus();
                }
              }}
              onFocus={() => setActiveIndex(index)}
              value={digit}
            />
          ))}
        </Animated.View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Animated.View entering={FadeIn.delay(420).duration(440)} style={styles.timerRow}>
          <Ionicons color={theme.colors.textSecondary} name="time-outline" size={18} />
          <Text style={styles.timerText}>
            {remainingSeconds > 0
              ? `Resend code in 00:${String(remainingSeconds).padStart(2, "0")}`
              : "Didn’t receive a code?"}
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(460).duration(500)} style={styles.actions}>
          <Button
            disabled={otpValue.length !== OTP_LENGTH}
            fullWidth
            loading={isVerifying}
            onPress={() => void verifyOtp()}
            rightIcon={<Ionicons color={theme.colors.textInverse} name="arrow-forward" size={20} />}
            size="large"
          >
            Verify
          </Button>
          <Pressable
            accessibilityLabel="Resend verification code"
            accessibilityRole="button"
            accessibilityState={{ disabled: remainingSeconds > 0 || isResending }}
            disabled={remainingSeconds > 0 || isResending}
            onPress={() => void resendCode()}
            style={styles.resendButton}
          >
            <Text style={styles.resendText}>
              Didn’t receive code? <Text style={styles.resendLink}>{isResending ? "Sending…" : "Resend"}</Text>
            </Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );

  function createStyles() {
    return StyleSheet.create({
      screen: { flex: 1, backgroundColor: theme.colors.background },
      content: { padding: theme.spacing[24], paddingBottom: theme.spacing[48] },
      backButton: {
        alignItems: "center",
        borderColor: theme.colors.border,
        borderRadius: theme.radius.round,
        borderWidth: 1,
        height: 42,
        justifyContent: "center",
        width: 42,
      },
      verificationIllustration: {
        alignItems: "center",
        alignSelf: "center",
        height: 194,
        justifyContent: "center",
        marginTop: theme.spacing[12],
        position: "relative",
        width: 240,
      },
      illustrationGlow: {
        backgroundColor: `${theme.colors.primary}16`,
        borderRadius: theme.radius.round,
        height: 138,
        position: "absolute",
        width: 138,
      },
      orbitLarge: {
        borderColor: `${theme.colors.primary}60`,
        borderRadius: theme.radius.round,
        borderWidth: 1,
        height: 102,
        position: "absolute",
        transform: [{ rotate: "-18deg" }],
        width: 232,
      },
      orbitSmall: {
        borderColor: `${theme.colors.secondary}50`,
        borderRadius: theme.radius.round,
        borderWidth: 1,
        height: 72,
        position: "absolute",
        transform: [{ rotate: "23deg" }],
        width: 208,
      },
      shieldTile: {
        alignItems: "center",
        backgroundColor: theme.colors.card,
        borderColor: theme.colors.primary,
        borderRadius: theme.radius.round,
        borderWidth: 1,
        height: 128,
        justifyContent: "center",
        width: 128,
        ...theme.shadows.large,
      },
      sparkleOne: { position: "absolute", right: theme.spacing[12], top: theme.spacing[24] },
      sparkleTwo: { bottom: theme.spacing[20], left: theme.spacing[20], position: "absolute" },
      title: { color: theme.colors.textPrimary, marginTop: theme.spacing[12], textAlign: "center", ...theme.typography.heading },
      subtitle: { color: theme.colors.textSecondary, marginTop: theme.spacing[12], textAlign: "center", ...theme.typography.body },
      phoneText: { color: theme.colors.primary, ...theme.typography.body },
      otpRow: { flexDirection: "row", gap: theme.spacing[8], marginTop: theme.spacing[32] },
      errorText: { color: theme.colors.error, marginTop: theme.spacing[12], ...theme.typography.caption },
      timerRow: { alignItems: "center", flexDirection: "row", justifyContent: "center", marginTop: theme.spacing[32] },
      timerText: { color: theme.colors.textSecondary, marginLeft: theme.spacing[8], ...theme.typography.bodySmall },
      actions: { gap: theme.spacing[12], marginTop: theme.spacing[32] },
      resendButton: { alignItems: "center", paddingVertical: theme.spacing[8] },
      resendText: { color: theme.colors.textSecondary, ...theme.typography.bodySmall },
      resendLink: { color: remainingSeconds === 0 ? theme.colors.primary : theme.colors.textSecondary },
    });
  }
}
