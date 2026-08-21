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
  cyanBright: "#00E7DF",
  border: "#123E4D",
  cyanBorder: "#00D8D0",
  purple: "#B05CFF",
  purpleBright: "#C777FF",
};

type SettingsRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  title: string;
  subtitle: string;
  onPress: () => void;
};

export default function SettingsScreen() {
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

    router.replace("/My Account" as any);
  };

  const openLanguage = () => {
    router.push("/language" as any);
  };

  const openNotifications = () => {
    router.push("/notifications-settings" as any);
  };

  const openTheme = () => {
    router.push("/theme-settings" as any);
  };

  const openAbout = () => {
    router.push("/about-shivora" as any);
  };

  const SettingsRow = ({
    icon,
    iconColor,
    title,
    subtitle,
    onPress,
  }: SettingsRowProps) => (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.settingsRow,
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
          size={23}
          color={iconColor}
        />
      </View>

      <View style={styles.rowCopy}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowSubtitle}>{subtitle}</Text>
      </View>

      <Ionicons
        name="chevron-forward"
        size={22}
        color="#AFC0C8"
      />
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.background}
      />

      <View style={styles.screen}>
        <View
          style={[
            styles.header,
            {
              paddingHorizontal: horizontalPadding,
            },
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

          <View style={styles.headerCenter}>
            <View style={styles.titleRow}>
              <Text style={styles.headerTitle}>Settings</Text>
              <Text style={styles.titleSparkle}>✦</Text>
            </View>

            <Text style={styles.headerSubtitle}>
              Customize your experience
            </Text>
          </View>

          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingHorizontal: horizontalPadding,
            },
          ]}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <SettingsRow
            icon="globe-outline"
            iconColor={COLORS.cyan}
            title="Language"
            subtitle="Choose your preferred language"
            onPress={openLanguage}
          />

          <SettingsRow
            icon="notifications-outline"
            iconColor={COLORS.cyan}
            title="Notifications"
            subtitle="Manage your notification preferences"
            onPress={openNotifications}
          />

          <SettingsRow
            icon="moon-outline"
            iconColor={COLORS.purple}
            title="Theme"
            subtitle="Choose your app appearance"
            onPress={openTheme}
          />

          <SettingsRow
            icon="information-circle-outline"
            iconColor={COLORS.cyan}
            title="About Shivora"
            subtitle="App version and information"
            onPress={openAbout}
          />

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
    opacity: 0.92,
    transform: [{ scale: 0.995 }],
  },

  header: {
    height: 138,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingTop: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(18,62,77,0.22)",
  },

  backButton: {
    width: 45,
    height: 43,
    marginTop: 20,
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: "#154A5D",
    backgroundColor: "#061822",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  headerCenter: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
    justifyContent: "flex-start",
  },

  headerSpacer: {
    width: 45,
    height: 43,
    marginTop: 20,
    flexShrink: 0,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: -1,
  },

  headerTitle: {
    color: COLORS.text,
    fontSize: 29,
    lineHeight: 34,
    fontWeight: "800",
    letterSpacing: -0.9,
    textAlign: "center",
    marginTop: 8,
  },

  titleSparkle: {
    color: COLORS.purpleBright,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "800",
    marginLeft: 2,
    marginTop: 1,
  },

  headerSubtitle: {
    color: COLORS.secondary,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
    textAlign: "center",
  },

  scrollContent: {
    paddingTop: 10,
    paddingBottom: 28,
  },

  settingsRow: {
    minHeight: 95,
    marginBottom: 13,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderRadius: 16,
    borderWidth: 1.15,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    flexDirection: "row",
    alignItems: "center",
  },

  rowIcon: {
    width: 50,
    height: 50,
    borderRadius: 15,
    borderWidth: 1.05,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  rowCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 13,
    marginRight: 8,
  },

  rowTitle: {
    color: COLORS.text,
    fontSize: 15.5,
    lineHeight: 20,
    fontWeight: "700",
  },

  rowSubtitle: {
    color: COLORS.secondary,
    fontSize: 11.2,
    lineHeight: 15,
    marginTop: 4,
  },

  bottomSpace: {
    height: 18,
  },
});