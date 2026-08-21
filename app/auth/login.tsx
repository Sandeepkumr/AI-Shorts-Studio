import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { authService } from "../../src/services/auth/authService";
import { useTheme } from "../../src/theme";

const MOBILE_LOGIN_HERO = require("../../assets/mobile-login-hero.png");
const BOTTOM_FILM_STRIPS = require("../../assets/bottom-film-strips.png");

const COLORS = {
  background: "#02080D",
  card: "#06151E",
  text: "#F7FAFC",
  secondary: "#AFC0CC",
  muted: "#728593",
  cyan: "#08DDE8",
  border: "#164B5D",
  divider: "#1F3A47",
  blue: "#2C79FF",
  purple: "#8A2BFF",
};

const countries = [
  { flag: "🇮🇳", code: "+91", label: "India", numberLength: 10 },
  { flag: "🇺🇸", code: "+1", label: "United States", numberLength: 10 },
  { flag: "🇬🇧", code: "+44", label: "United Kingdom", numberLength: 10 },
] as const;

type Country = (typeof countries)[number];

export default function LoginScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { width, height } = useWindowDimensions();
  const compact = height < 900;
  const styles = useMemo(
    () => createStyles(width, height, compact, theme),
    [width, height, compact, theme],
  );
  const [country, setCountry] = useState<Country>(countries[0]);
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCountryPickerOpen, setIsCountryPickerOpen] = useState(false);
  const inputFocus = useSharedValue(0);
  const inputFocusStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      inputFocus.value,
      [0, 1],
      [COLORS.border, COLORS.cyan],
    ),
    shadowOpacity: inputFocus.value * 0.28,
  }));

  const handlePhoneChange = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, country.numberLength);

    setPhone(digits);

    if (error) {
      setError(undefined);
    }

    if (digits.length === country.numberLength) {
      Keyboard.dismiss();
    }
  };

  const continueWithPhone = async () => {
    if (phone.length !== country.numberLength) {
      setError(`Enter a valid ${country.numberLength}-digit mobile number.`);
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await authService.loginWithPhone(`${country.code}${phone}`);
      router.push({ pathname: "/auth/otp-verification", params: { phone: result.phone } });
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Unable to continue.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
      <View style={styles.root}>
        <TouchableWithoutFeedback
          onPress={Keyboard.dismiss}
          accessible={false}
        >
          <View style={styles.touchSurface}>
            <View pointerEvents="none" style={styles.topGlow} />
            <View pointerEvents="none" style={styles.centerGlow} />

            <Image
              source={BOTTOM_FILM_STRIPS}
              resizeMode="stretch"
              style={styles.bottomFilmStrips}
            />

            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : undefined}
              style={styles.keyboard}
            >
              <View style={styles.content}>
          <Animated.View
            entering={FadeIn.delay(40).duration(450)}
            style={styles.header}
          >
            <Pressable
              accessibilityLabel="Go back"
              accessibilityRole="button"
              hitSlop={10}
              onPress={() => router.back()}
              style={({ pressed }) => [
                styles.backButton,
                pressed && styles.backButtonPressed,
              ]}
            >
              <Ionicons
                color={COLORS.text}
                name="chevron-back"
                size={33}
              />
            </Pressable>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(100).duration(700)}
            style={styles.hero}
          >
            <Image
              accessibilityLabel="Shivora AI Video Creation"
              source={MOBILE_LOGIN_HERO}
              resizeMode="contain"
              style={styles.heroImage}
            />
          </Animated.View>

          <Animated.View
            entering={FadeInUp.delay(180).duration(700)}
            style={styles.loginCard}
          >
            <View style={styles.securityBadge}>
              <Ionicons
                color={COLORS.cyan}
                name="shield-checkmark-outline"
                size={30}
              />
            </View>

            <Text style={styles.title}>Continue with mobile</Text>

            <Text style={styles.subtitle}>
              We'll send a secure verification{"\n"}
              code to your phone.
            </Text>

            <Text style={styles.label}>Mobile number</Text>

            <Animated.View
              style={[
                styles.phoneFocusFrame,
                inputFocusStyle,
              ]}
            >
              <View style={styles.phoneRow}>
                <Pressable
                  accessibilityLabel="Select country code"
                  accessibilityRole="button"
                  onPress={() => setIsCountryPickerOpen(true)}
                  style={styles.countryPicker}
                >
                  <Text style={styles.countryFlag}>
                    {country.flag}
                  </Text>

                  <Text style={styles.countryCode}>
                    {country.code}
                  </Text>

                  <Ionicons
                    color={COLORS.secondary}
                    name="chevron-down"
                    size={17}
                  />
                </Pressable>

                <View style={styles.phoneDivider} />

                <View style={styles.phoneInput}>
                  <TextInput
                    accessibilityLabel="Mobile number"
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="phone-pad"
                    maxLength={country.numberLength}
                    onBlur={() => {
                      inputFocus.value = withTiming(0, {
                        duration: 180,
                      });
                    }}
                    onChangeText={handlePhoneChange}
                    onFocus={() => {
                      inputFocus.value = withTiming(1, {
                        duration: 180,
                      });
                    }}
                    placeholder="Enter mobile number"
                    placeholderTextColor={COLORS.muted}
                    style={styles.nativeInput}
                    value={phone}
                  />
                </View>
              </View>
            </Animated.View>

            {error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : null}

            <View style={styles.helperRow}>
              <Ionicons
                color={COLORS.cyan}
                name="lock-closed-outline"
                size={21}
              />

              <Text style={styles.helperText}>
                Your number is only used to{"\n"}
                secure your Shivora account.
              </Text>
            </View>

            <Pressable
              accessibilityLabel="Continue"
              accessibilityRole="button"
              accessibilityState={{
                disabled:
                  phone.length !== country.numberLength ||
                  isSubmitting,
                busy: isSubmitting,
              }}
              disabled={
                phone.length !== country.numberLength ||
                isSubmitting
              }
              onPress={() => void continueWithPhone()}
              style={({ pressed }) => [
                styles.continueButton,
                phone.length !== country.numberLength &&
                  styles.continueDisabled,
                pressed &&
                  phone.length === country.numberLength &&
                  !isSubmitting &&
                  styles.continuePressed,
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
                style={styles.continueGradient}
              >
                {isSubmitting ? (
                  <ActivityIndicator
                    color="#FFFFFF"
                    size="small"
                  />
                ) : (
                  <>
                    <Text style={styles.continueText}>
                      Continue
                    </Text>

                    <Ionicons
                      color="#FFFFFF"
                      name="arrow-forward"
                      size={28}
                      style={styles.continueArrow}
                    />
                  </>
                )}
              </LinearGradient>
            </Pressable>
          </Animated.View>

          <Animated.View
            entering={FadeInUp.delay(320).duration(650)}
            style={styles.benefits}
          >
            <View style={styles.benefit}>
              <Ionicons
                color={COLORS.cyan}
                name="shield-checkmark-outline"
                size={31}
              />
              <Text style={styles.benefitTitle}>
                Secure & Private
              </Text>
              <Text style={styles.benefitSubtitle}>
                Your data is safe{"\n"}with us
              </Text>
            </View>

            <View style={styles.benefitDivider} />

            <View style={styles.benefit}>
              <Ionicons
                color={COLORS.cyan}
                name="flash-outline"
                size={32}
              />
              <Text style={styles.benefitTitle}>
                Fast & Easy
              </Text>
              <Text style={styles.benefitSubtitle}>
                Get started in{"\n"}seconds
              </Text>
            </View>

            <View style={styles.benefitDivider} />

            <View style={styles.benefit}>
              <Ionicons
                color={COLORS.cyan}
                name="ribbon-outline"
                size={32}
              />
              <Text style={styles.benefitTitle}>
                Trusted by{"\n"}Creators
              </Text>
              <Text style={styles.benefitSubtitle}>
                Loved by thousands{"\n"}of users
              </Text>
            </View>
          </Animated.View>
        </View>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>

      <Modal
        animationType="slide"
        onRequestClose={() => setIsCountryPickerOpen(false)}
        transparent
        visible={isCountryPickerOpen}
      >
        <Pressable
          accessibilityLabel="Close country picker"
          onPress={() => setIsCountryPickerOpen(false)}
          style={styles.modalBackdrop}
        >
          <Pressable onPress={() => undefined} style={styles.countrySheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Select country</Text>
            {countries.map((option) => (
              <Pressable
                key={option.code}
                accessibilityRole="button"
                onPress={() => {
                  setCountry(option);
                  setPhone("");
                  setError(undefined);
                  setIsCountryPickerOpen(false);
                }}
                style={styles.countryOption}
              >
                <Text style={styles.countryFlag}>{option.flag}</Text>
                <Text style={styles.countryOptionLabel}>{option.label}</Text>
                <Text style={styles.countryOptionCode}>{option.code}</Text>
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
      </View>
    </SafeAreaView>
  );
}

function createStyles(
  screenWidth: number,
  screenHeight: number,
  isCompact: boolean,
  theme: ReturnType<typeof useTheme>,
) {
    return StyleSheet.create({
      screen: {
        flex: 1,
        backgroundColor: COLORS.background,
      },

      root: {
        flex: 1,
        backgroundColor: COLORS.background,
        overflow: "hidden",
      },

      touchSurface: {
        flex: 1,
      },

      keyboard: {
        flex: 1,
      },

      content: {
        flex: 1,
        zIndex: 2,
        paddingHorizontal: isCompact ? 21 : 27,
        paddingTop: isCompact ? 3 : 8,
        paddingBottom: 0,
        justifyContent: "flex-start",
      },

      topGlow: {
        position: "absolute",
        width: 1,
        height: 1,
        opacity: 0,
      },

      centerGlow: {
        position: "absolute",
        width: 1,
        height: 1,
        opacity: 0,
      },

      bottomFilmStrips: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: -5,
        width: "100%",
        height: screenWidth * 0.27,
        opacity: 0.56,
        zIndex: 0,
      },

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
        width: "100%",
        height: "100%",
      },

      loginCard: {
        width: "100%",
        backgroundColor: "rgba(5, 18, 27, 0.98)",
        borderWidth: 1.2,
        borderColor: "#087991",
        borderRadius: isCompact ? 23 : 28,
        paddingHorizontal: isCompact ? 18 : 26,
        paddingTop: isCompact ? 28 : 36,
        paddingBottom: isCompact ? 11 : 15,
        marginTop: isCompact ? 0 : 1,
        zIndex: 5,
        shadowColor: COLORS.cyan,
        shadowOffset: {
          width: 0,
          height: 0,
        },
        shadowOpacity: 0.11,
        shadowRadius: 18,
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
        shadowRadius: 16,
        elevation: 8,
      },

      title: {
        color: COLORS.text,
        textAlign: "center",
        fontSize: isCompact ? 20 : 24,
        lineHeight: isCompact ? 26 : 30,
        fontWeight: "700",
        letterSpacing: -0.4,
      },

      subtitle: {
        color: COLORS.secondary,
        textAlign: "center",
        fontSize: isCompact ? 12 : 13.5,
        lineHeight: isCompact ? 17 : 19,
        marginTop: 3,
      },

      label: {
        color: COLORS.text,
        fontSize: isCompact ? 13 : 14,
        lineHeight: 18,
        fontWeight: "600",
        marginTop: isCompact ? 11 : 15,
        marginBottom: 5,
      },

      phoneFocusFrame: {
        width: "100%",
        borderRadius: 17,
        borderWidth: 1.25,
        borderColor: COLORS.border,
        backgroundColor: "rgba(4, 14, 22, 0.92)",
        shadowColor: COLORS.cyan,
        shadowOffset: {
          width: 0,
          height: 0,
        },
        shadowRadius: 10,
        padding: 1,
      },

      phoneRow: {
        width: "100%",
        height: isCompact ? 52 : 58,
        flexDirection: "row",
        alignItems: "center",
      },

      countryPicker: {
        minWidth: isCompact ? 105 : 116,
        height: "100%",
        paddingHorizontal: 7,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
      },

      countryFlag: {
        fontSize: isCompact ? 19 : 21,
        marginRight: 6,
      },

      countryCode: {
        color: COLORS.text,
        fontSize: isCompact ? 14 : 15,
        fontWeight: "500",
        marginRight: 7,
      },

      phoneDivider: {
        width: 1,
        height: "56%",
        backgroundColor: COLORS.divider,
      },

      phoneInput: {
        flex: 1,
        height: "100%",
      },

      nativeInput: {
        flex: 1,
        height: "100%",
        color: COLORS.text,
        fontSize: isCompact ? 15 : 16,
        paddingHorizontal: 12,
        paddingVertical: 0,
      },

      helperRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginTop: isCompact ? 9 : 13,
        paddingHorizontal: 2,
      },

      helperText: {
        flex: 1,
        color: COLORS.secondary,
        marginLeft: 12,
        fontSize: isCompact ? 11.5 : 12.5,
        lineHeight: isCompact ? 16.5 : 19,
      },

      errorText: {
        color: "#FF6B86",
        fontSize: 12,
        lineHeight: 17,
        marginTop: 7,
      },

      continueButton: {
        width: "100%",
        height: isCompact ? 54 : 60,
        marginTop: isCompact ? 12 : 17,
        borderRadius: isCompact ? 25 : 29,
        overflow: "hidden",
        shadowColor: COLORS.cyan,
        shadowOffset: {
          width: 0,
          height: 7,
        },
        shadowOpacity: 0.24,
        shadowRadius: 13,
        elevation: 8,
      },

      continueDisabled: {
        opacity: 0.76,
      },

      continuePressed: {
        transform: [{ scale: 0.985 }],
      },

      continueGradient: {
        width: "100%",
        height: "100%",
        borderRadius: isCompact ? 29 : 32,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
      },

      continueText: {
        color: "#FFFFFF",
        fontSize: isCompact ? 17 : 18,
        lineHeight: 22,
        fontWeight: "700",
        marginRight: 15,
      },

      continueArrow: {
        marginTop: 1,
      },

      benefits: {
        width: "100%",
        flexDirection: "row",
        alignItems: "stretch",
        justifyContent: "space-between",
        marginTop: isCompact ? 14 : 20,
        paddingHorizontal: 2,
        paddingVertical: isCompact ? 4 : 7,
        backgroundColor: "rgba(2, 12, 18, 0.9)",
        borderRadius: 16,
        zIndex: 4,
      },

      benefit: {
        flex: 1,
        alignItems: "center",
        justifyContent: "flex-start",
      },

      benefitTitle: {
        color: COLORS.text,
        fontSize: isCompact ? 10 : 11.5,
        lineHeight: isCompact ? 14 : 16,
        fontWeight: "600",
        textAlign: "center",
        marginTop: 7,
        minHeight: 17,
      },

      benefitSubtitle: {
        color: COLORS.secondary,
        fontSize: isCompact ? 9 : 10,
        lineHeight: isCompact ? 13 : 14,
        textAlign: "center",
        marginTop: 3,
      },

      benefitDivider: {
        width: 1,
        height: isCompact ? 52 : 60,
        backgroundColor: "#183440",
        marginHorizontal: isCompact ? 3 : 7,
      },

      modalBackdrop: {
        backgroundColor: `${theme.colors.background}CC`,
        flex: 1,
        justifyContent: "flex-end",
      },

      countrySheet: {
        backgroundColor: theme.colors.card,
        borderTopLeftRadius: theme.radius.xl,
        borderTopRightRadius: theme.radius.xl,
        padding: theme.spacing[24],
      },

      sheetHandle: {
        alignSelf: "center",
        backgroundColor: theme.colors.border,
        borderRadius: theme.radius.round,
        height: 4,
        width: 44,
      },

      sheetTitle: {
        color: theme.colors.textPrimary,
        marginTop: theme.spacing[20],
        ...theme.typography.title,
      },

      countryOption: {
        alignItems: "center",
        flexDirection: "row",
        paddingVertical: theme.spacing[16],
      },

      countryOptionLabel: {
        color: theme.colors.textPrimary,
        flex: 1,
        marginLeft: theme.spacing[12],
        ...theme.typography.body,
      },

      countryOptionCode: {
        color: theme.colors.textSecondary,
        ...theme.typography.body,
      },
    });
}