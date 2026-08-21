import React from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

const COLORS = {
  background: "#020A10",
  surface: "#071A24",
  surfaceAlt: "#061822",
  text: "#F6F8FA",
  secondary: "#B3C1C8",
  muted: "#84959E",
  cyan: "#08D8D1",
  border: "#123E4D",
  cyanBorder: "#00D8D0",
  purple: "#B05CFF",
  purpleBright: "#C777FF",
};

const ASSETS = {
  logo: require("../assets/logo.png"),
};

type InfoRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  title: string;
  subtitle: string;
  onPress: () => void;
};

export default function AboutShivoraScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const isSmall = width <= 375;
  const isLarge = width >= 430;
  const horizontalPadding = isSmall ? 18 : isLarge ? 27 : 22;

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/settings" as any);
  };

  const showComingSoon = (title: string) => {
    // Keep the screen functional without creating extra routes yet.
    // Replace these handlers with real route screens later.
    console.log(`${title} selected`);
  };

  const InfoRow = ({
    icon,
    iconColor,
    title,
    subtitle,
    onPress,
  }: InfoRowProps) => (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.infoRow,
        pressed && styles.rowPressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <View
        style={[
          styles.rowIcon,
          {
            borderColor: `${iconColor}55`,
            backgroundColor: `${iconColor}10`,
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={20}
          color={iconColor}
        />
      </View>

      <View style={styles.rowCopy}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowSubtitle}>{subtitle}</Text>
      </View>

      <Ionicons
        name="chevron-forward"
        size={20}
        color={COLORS.secondary}
      />
    </Pressable>
  );

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={["top", "bottom"]}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.background}
      />

      <View style={styles.screen}>
        <View
          style={[
            styles.header,
            { paddingHorizontal: horizontalPadding },
          ]}
        >
          <Pressable
            onPress={goBack}
            hitSlop={10}
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.pressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons
              name="chevron-back"
              size={31}
              color={COLORS.text}
            />
          </Pressable>

          <View style={styles.headerCopy}>
            <View style={styles.titleRow}>
              <Text style={styles.headerTitle}>
                About Shivora
              </Text>
              <Text style={styles.titleSparkle}>✦</Text>
            </View>

            <Text style={styles.headerSubtitle}>
              App version and information
            </Text>
          </View>

          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingHorizontal: horizontalPadding },
          ]}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.appIdentity}>
            <Image
              source={ASSETS.logo}
              resizeMode="contain"
              style={styles.logo}
            />

            <Text style={styles.appName}>
              Shivora
            </Text>

            <Text style={styles.appTagline}>
              AI Video Generator
            </Text>

            <View style={styles.versionBadge}>
              <Text style={styles.versionText}>
                Version 1.0.0
              </Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <InfoRow
              icon="sparkles-outline"
              iconColor={COLORS.cyan}
              title="What’s New"
              subtitle="See what’s new in this version"
              onPress={() =>
                showComingSoon("What’s New")
              }
            />

            <View style={styles.separator} />

            <InfoRow
              icon="document-text-outline"
              iconColor={COLORS.secondary}
              title="Terms of Service"
              subtitle="Read our terms and conditions"
              onPress={() =>
                showComingSoon("Terms of Service")
              }
            />

            <View style={styles.separator} />

            <InfoRow
              icon="shield-checkmark-outline"
              iconColor={COLORS.secondary}
              title="Privacy Policy"
              subtitle="Read our privacy policy"
              onPress={() =>
                showComingSoon("Privacy Policy")
              }
            />

            <View style={styles.separator} />

            <InfoRow
              icon="headset-outline"
              iconColor={COLORS.cyan}
              title="Contact Support"
              subtitle="We’re here to help you"
              onPress={() =>
                showComingSoon("Contact Support")
              }
            />
          </View>

          <View style={styles.bottomSpace} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  flex: {
    flex: 1,
  },

  pressed: {
    opacity: 0.72,
  },

  rowPressed: {
    backgroundColor: "rgba(8,216,209,0.045)",
  },

  header: {
    height: 104,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(18,62,77,0.22)",
  },

  backButton: {
    width: 45,
    height: 43,
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: "#154A5D",
    backgroundColor: "#061822",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  headerCopy: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 11,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 7,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    color: COLORS.text,
    fontSize: 24,
    lineHeight: 29,
    fontWeight: "800",
    letterSpacing: -0.7,
    textAlign: "center",
  },

  titleSparkle: {
    color: COLORS.purpleBright,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "800",
    marginLeft: 2,
  },

  headerSubtitle: {
    color: COLORS.secondary,
    fontSize: 10.5,
    lineHeight: 15,
    marginTop: 4,
    textAlign: "center",
  },

  headerSpacer: {
    width: 45,
    height: 43,
    flexShrink: 0,
  },

  scrollContent: {
    paddingTop: 16,
    paddingBottom: 26,
  },

  appIdentity: {
    alignItems: "center",
    paddingVertical: 8,
  },

  logo: {
    width: 118,
    height: 72,
  },

  appName: {
    color: COLORS.text,
    fontSize: 20,
    lineHeight: 25,
    fontWeight: "800",
    marginTop: 1,
  },

  appTagline: {
    color: COLORS.secondary,
    fontSize: 10.5,
    lineHeight: 15,
    marginTop: 3,
  },

  versionBadge: {
    height: 24,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginTop: 7,
    backgroundColor: "#15232B",
    alignItems: "center",
    justifyContent: "center",
  },

  versionText: {
    color: COLORS.secondary,
    fontSize: 8.8,
    lineHeight: 12,
    fontWeight: "700",
  },

  infoCard: {
    marginTop: 15,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    overflow: "hidden",
  },

  infoRow: {
    minHeight: 73,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  rowIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  rowCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 11,
    marginRight: 8,
  },

  rowTitle: {
    color: COLORS.text,
    fontSize: 12.4,
    lineHeight: 17,
    fontWeight: "700",
  },

  rowSubtitle: {
    color: COLORS.secondary,
    fontSize: 9.2,
    lineHeight: 13,
    marginTop: 2,
  },

  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#14303B",
    marginLeft: 64,
  },

  bottomSpace: {
    height: 24,
  },
});