import React, { useState } from "react";
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

const COLORS = {
  background: "#020A10",
  surface: "#071A24",
  text: "#F5F8FA",
  secondary: "#B2C0C7",
  muted: "#7E919A",
  cyan: "#06D8D2",
  cyanBright: "#00E7DF",
  border: "#103C4A",
  borderSoft: "#123341",
  purple: "#A94EFF",
  purpleBright: "#C36BFF",
};

type LanguageOption = {
  id: "en" | "hi" | "pa";
  label: string;
  badge?: string;
};

const LANGUAGES: LanguageOption[] = [
  {
    id: "en",
    label: "English (US)",
    badge: "Default",
  },
  {
    id: "hi",
    label: "हिंदी (Hindi)",
  },
  {
    id: "pa",
    label: "ਪੰਜਾਬੀ (Punjabi)",
  },
];

export default function LanguageScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const isSmall = width <= 375;
  const horizontalPadding = isSmall ? 16 : 22;

  const [selectedLanguage, setSelectedLanguage] =
    useState<LanguageOption["id"]>("en");

  const hasPendingChange = selectedLanguage !== "en";

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/settings" as any);
  };

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
              size={32}
              color={COLORS.text}
            />
          </Pressable>

          <View style={styles.headerCopy}>
            <View style={styles.titleRow}>
              <Text style={styles.headerTitle}>
                Language
              </Text>
              <Text style={styles.titleSparkle}>
                ✦
              </Text>
            </View>

            <Text style={styles.headerSubtitle}>
              Choose your preferred language
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
          <View style={styles.languageCard}>
            {LANGUAGES.map((item, index) => {
              const selected =
                selectedLanguage === item.id;

              return (
                <React.Fragment key={item.id}>
                  <Pressable
                    onPress={() =>
                      setSelectedLanguage(item.id)
                    }
                    style={({ pressed }) => [
                      styles.languageRow,
                      pressed && styles.rowPressed,
                    ]}
                    accessibilityRole="radio"
                    accessibilityState={{
                      selected,
                    }}
                    accessibilityLabel={`Select ${item.label}`}
                  >
                    <Text
                      style={styles.languageTitle}
                      numberOfLines={1}
                    >
                      {item.label}
                    </Text>

                    <View style={styles.rowRight}>
                      {item.badge ? (
                        <View style={styles.defaultBadge}>
                          <Text
                            style={styles.defaultBadgeText}
                          >
                            {item.badge}
                          </Text>
                        </View>
                      ) : null}

                      <View
                        style={[
                          styles.radioOuter,
                          selected &&
                            styles.radioOuterSelected,
                        ]}
                      >
                        {selected ? (
                          <View
                            style={styles.radioInner}
                          />
                        ) : null}
                      </View>
                    </View>
                  </Pressable>

                  {index <
                  LANGUAGES.length - 1 ? (
                    <View style={styles.separator} />
                  ) : null}
                </React.Fragment>
              );
            })}
          </View>

          <LinearGradient
            colors={[
              "#08212A",
              "#151230",
            ]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.infoCard}
          >
            <Ionicons
              name="color-wand-outline"
              size={24}
              color={COLORS.cyan}
              style={styles.infoIcon}
            />

            <Text style={styles.infoText}>
              Changes will apply instantly across the
              app.
            </Text>
          </LinearGradient>

          {hasPendingChange ? (
            <Pressable
              onPress={() => {
                // API/global language persistence will be wired later.
                // For now, return to Settings after confirming the selection.
                router.back();
              }}
              style={({ pressed }) => [
                styles.saveButton,
                pressed && styles.saveButtonPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Save language"
            >
              <LinearGradient
                colors={[
                  "#08D8D1",
                  "#2578FF",
                  "#8C2EFF",
                ]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.saveButtonGradient}
              >
                <Text style={styles.saveButtonText}>
                  Save
                </Text>

                <Ionicons
                  name="arrow-forward"
                  size={20}
                  color="#FFFFFF"
                />
              </LinearGradient>
            </Pressable>
          ) : null}

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
    opacity: 0.78,
  },

  rowPressed: {
    backgroundColor: "rgba(8,216,209,0.035)",
  },

  header: {
    height: 118,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backButton: {
    width: 46,
    height: 45,
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: "#174B5D",
    backgroundColor: "#061720",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  headerCopy: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    marginTop: -1,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    color: COLORS.text,
    fontSize: 25,
    lineHeight: 30,
    fontWeight: "800",
    letterSpacing: -0.65,
    textAlign: "center",
  },

  titleSparkle: {
    color: COLORS.purpleBright,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: "800",
    marginLeft: 2,
    marginTop: -1,
  },

  headerSubtitle: {
    color: COLORS.secondary,
    fontSize: 10.6,
    lineHeight: 15,
    marginTop: 5,
    textAlign: "center",
  },

  headerSpacer: {
    width: 46,
    height: 45,
    flexShrink: 0,
  },

  scrollContent: {
    paddingTop: 0,
    paddingBottom: 28,
  },

  languageCard: {
    width: "100%",
    borderRadius: 17,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#061722",
    overflow: "hidden",
  },

  languageRow: {
    minHeight: 76,
    paddingHorizontal: 18,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  languageTitle: {
    flex: 1,
    color: COLORS.text,
    fontSize: 13.7,
    lineHeight: 19,
    fontWeight: "700",
  },

  rowRight: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
  },

  defaultBadge: {
    height: 21,
    paddingHorizontal: 8,
    borderRadius: 11,
    backgroundColor: "#1C2A34",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  defaultBadgeText: {
    color: "#C8D2D7",
    fontSize: 8.7,
    lineHeight: 11,
    fontWeight: "700",
  },

  radioOuter: {
    width: 21,
    height: 21,
    borderRadius: 10.5,
    borderWidth: 1.5,
    borderColor: "#8B9AA1",
    alignItems: "center",
    justifyContent: "center",
  },

  radioOuterSelected: {
    borderColor: COLORS.cyan,
    borderWidth: 1.8,
  },

  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.cyan,
  },

  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#12303B",
    marginLeft: 1,
    marginRight: 1,
  },

  infoCard: {
    minHeight: 68,
    marginTop: 48,
    paddingHorizontal: 15,
    paddingVertical: 11,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#28315A",
    flexDirection: "row",
    alignItems: "center",
  },

  infoIcon: {
    width: 30,
    marginRight: 12,
  },

  infoText: {
    flex: 1,
    maxWidth: "76%",
    color: COLORS.cyan,
    fontSize: 10.5,
    lineHeight: 15,
    fontWeight: "700",
  },

  saveButton: {
    height: 50,
    marginTop: 14,
    borderRadius: 25,
    overflow: "hidden",
  },

  saveButtonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.995 }],
  },

  saveButtonGradient: {
    flex: 1,
    paddingHorizontal: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "800",
  },

  bottomSpace: {
    height: 24,
  },
});