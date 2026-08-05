import { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  FadeIn,
  FadeInUp,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { Button } from "../../src/components/Button";
import { TextInput } from "../../src/components/TextInput";
import { authService } from "../../src/services/auth/authService";
import { useTheme } from "../../src/theme";

const countries = [
  { flag: "🇮🇳", code: "+91", label: "India", numberLength: 10 },
  { flag: "🇺🇸", code: "+1", label: "United States", numberLength: 10 },
  { flag: "🇬🇧", code: "+44", label: "United Kingdom", numberLength: 10 },
] as const;

type Country = (typeof countries)[number];

export default function LoginScreen() {
  const router = useRouter();
  const theme = useTheme();
  const styles = createStyles();
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
      [theme.colors.border, theme.colors.primary],
    ),
    shadowOpacity: inputFocus.value * 0.35,
  }));

  const handlePhoneChange = (value: string) => {
    setPhone(value.replace(/\D/g, ""));
    if (error) {
      setError(undefined);
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

        <Animated.View entering={FadeInUp.duration(560)} style={styles.logoGroup}>
          <View style={styles.logoFilmTop}>
            <Ionicons color={theme.colors.primary} name="film-outline" size={58} />
          </View>
          <View style={styles.logoFilmBottom}>
            <Ionicons color={theme.colors.primary} name="film-outline" size={58} />
          </View>
          <View style={styles.iconTile}>
            <Ionicons color={theme.colors.primary} name="aperture-outline" size={38} />
          </View>
        </Animated.View>
        <Animated.Text entering={FadeInUp.delay(100).duration(520)} style={styles.brand}>
          Shiv<Text style={styles.brandAccent}>o</Text>ra
        </Animated.Text>

        <Animated.View entering={FadeInUp.delay(180).duration(600)} style={styles.formCard}>
          <Text style={styles.title}>Continue with mobile</Text>
          <Text style={styles.subtitle}>
            We&apos;ll send a secure verification code to your phone.
          </Text>
          <Text style={styles.label}>Mobile number</Text>
          <Animated.View entering={FadeIn.delay(300).duration(460)} style={[styles.phoneFocusFrame, inputFocusStyle]}>
            <View style={styles.phoneRow}>
              <Pressable
                accessibilityLabel="Select country code"
                accessibilityRole="button"
                onPress={() => setIsCountryPickerOpen(true)}
                style={styles.countryPicker}
              >
                <Text style={styles.countryFlag}>{country.flag}</Text>
                <Text style={styles.countryCode}>{country.code}</Text>
                <Ionicons color={theme.colors.textSecondary} name="chevron-down" size={15} />
              </Pressable>
              <View style={styles.phoneInput}>
                <TextInput
                  accessibilityLabel="Mobile number"
                  keyboardType="phone-pad"
                  maxLength={country.numberLength}
                  onBlur={() => {
                    inputFocus.value = withTiming(0, { duration: 180 });
                  }}
                  onChangeText={handlePhoneChange}
                  onFocus={() => {
                    inputFocus.value = withTiming(1, { duration: 180 });
                  }}
                  placeholder="Enter mobile number"
                  value={phone}
                />
              </View>
            </View>
          </Animated.View>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <View style={styles.helperRow}>
            <Ionicons color={theme.colors.textSecondary} name="lock-closed-outline" size={15} />
            <Text style={styles.helperText}>Your number is only used to secure your Shivora account.</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(360).duration(520)} style={styles.continueAction}>
          <Button
            disabled={phone.length !== country.numberLength}
            fullWidth
            loading={isSubmitting}
            onPress={() => void continueWithPhone()}
            rightIcon={<Ionicons color={theme.colors.textInverse} name="arrow-forward" size={20} />}
            size="large"
          >
            Continue
          </Button>
        </Animated.View>
      </ScrollView>

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
    </SafeAreaView>
  );

  function createStyles() {
    return StyleSheet.create({
      screen: { flex: 1, backgroundColor: theme.colors.background },
      content: { padding: theme.spacing[24], paddingBottom: theme.spacing[64] },
      backButton: {
        alignItems: "center",
        borderColor: theme.colors.border,
        borderRadius: theme.radius.round,
        borderWidth: 1,
        height: 42,
        justifyContent: "center",
        width: 42,
      },
      logoGroup: {
        alignItems: "center",
        alignSelf: "center",
        height: 118,
        justifyContent: "center",
        marginTop: theme.spacing[20],
        position: "relative",
        width: 118,
      },
      logoFilmTop: { position: "absolute", right: 6, top: 0, transform: [{ rotate: "-28deg" }] },
      logoFilmBottom: { bottom: 0, left: 6, position: "absolute", transform: [{ rotate: "152deg" }] },
      iconTile: {
        alignItems: "center",
        backgroundColor: `${theme.colors.primary}16`,
        borderColor: theme.colors.primary,
        borderRadius: theme.radius.round,
        borderWidth: 1,
        height: 68,
        justifyContent: "center",
        width: 68,
      },
      brand: { color: theme.colors.textPrimary, marginTop: theme.spacing[8], textAlign: "center", ...theme.typography.display },
      brandAccent: { color: theme.colors.primary },
      title: { color: theme.colors.textPrimary, ...theme.typography.title },
      subtitle: { color: theme.colors.textSecondary, marginTop: theme.spacing[4], ...theme.typography.bodySmall },
      formCard: {
        backgroundColor: theme.colors.card,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.large,
        borderWidth: 1,
        marginTop: theme.spacing[24],
        padding: theme.spacing[20],
      },
      label: { color: theme.colors.textPrimary, marginTop: theme.spacing[24], ...theme.typography.bodySmall },
      phoneFocusFrame: {
        borderRadius: theme.radius.medium,
        borderWidth: 1,
        marginTop: theme.spacing[8],
        padding: 1,
        shadowColor: theme.colors.primary,
        shadowOffset: { height: 0, width: 0 },
        shadowRadius: 10,
      },
      phoneRow: { alignItems: "flex-start", flexDirection: "row", gap: theme.spacing[8], marginTop: theme.spacing[8] },
      countryPicker: {
        alignItems: "center",
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.medium,
        borderWidth: 1,
        flexDirection: "row",
        gap: theme.spacing[4],
        height: 50,
        justifyContent: "center",
        paddingHorizontal: theme.spacing[8],
      },
      countryFlag: { ...theme.typography.body },
      countryCode: { color: theme.colors.textPrimary, ...theme.typography.bodySmall },
      phoneInput: { flex: 1 },
      helperRow: { alignItems: "flex-start", flexDirection: "row", marginTop: theme.spacing[16] },
      helperText: { color: theme.colors.textSecondary, flex: 1, marginLeft: theme.spacing[8], ...theme.typography.caption },
      errorText: { color: theme.colors.error, marginTop: theme.spacing[8], ...theme.typography.caption },
      continueAction: { marginTop: theme.spacing[24] },
      modalBackdrop: { backgroundColor: `${theme.colors.background}CC`, flex: 1, justifyContent: "flex-end" },
      countrySheet: {
        backgroundColor: theme.colors.card,
        borderTopLeftRadius: theme.radius.xl,
        borderTopRightRadius: theme.radius.xl,
        padding: theme.spacing[24],
      },
      sheetHandle: { alignSelf: "center", backgroundColor: theme.colors.border, borderRadius: theme.radius.round, height: 4, width: 44 },
      sheetTitle: { color: theme.colors.textPrimary, marginTop: theme.spacing[20], ...theme.typography.title },
      countryOption: { alignItems: "center", flexDirection: "row", paddingVertical: theme.spacing[16] },
      countryOptionLabel: { color: theme.colors.textPrimary, flex: 1, marginLeft: theme.spacing[12], ...theme.typography.body },
      countryOptionCode: { color: theme.colors.textSecondary, ...theme.typography.body },
    });
  }
}
