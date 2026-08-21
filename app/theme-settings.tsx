import React, { useState } from "react";
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
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

const ASSETS = {
  brush: require("../assets/theme-brush-art.png"),
  dark: require("../assets/theme-dark-icon.png"),
  light: require("../assets/theme-light-icon.png"),
  system: require("../assets/theme-system-icon.png"),
};

const COLORS = {
  background: "#020A10",
  surface: "#071A24",
  text: "#F6F8FA",
  secondary: "#B3C1C8",
  muted: "#7E919A",
  cyan: "#08D8D1",
  border: "#123E4D",
  cyanBorder: "#00D8D0",
  purpleBright: "#C777FF",
};

type ThemeId = "dark" | "light" | "system";

type ThemeOption = {
  id: ThemeId;
  title: string;
  subtitle: string;
  image: any;
};

const THEMES: ThemeOption[] = [
  {
    id: "dark",
    title: "Dark",
    subtitle: "Best for low light",
    image: ASSETS.dark,
  },
  {
    id: "light",
    title: "Light",
    subtitle: "Classic light appearance",
    image: ASSETS.light,
  },
  {
    id: "system",
    title: "System Default",
    subtitle: "Follow system appearance",
    image: ASSETS.system,
  },
];

export default function ThemeScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();

  const isSmall = width <= 375;
  const horizontalPadding = isSmall ? 16 : 22;

  const [selectedTheme, setSelectedTheme] =
    useState<ThemeId>("dark");

  const hasPendingChange = selectedTheme !== "dark";

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
                Theme
              </Text>
              <Text style={styles.titleSparkle}>
                ✦
              </Text>
            </View>

            <Text style={styles.headerSubtitle}>
              Choose your app appearance
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
          <View style={styles.themeCard}>
            {THEMES.map((item, index) => {
              const selected =
                selectedTheme === item.id;

              return (
                <React.Fragment key={item.id}>
                  <Pressable
                    onPress={() =>
                      setSelectedTheme(item.id)
                    }
                    style={({ pressed }) => [
                      styles.themeRow,
                      selected &&
                        styles.themeRowSelected,
                      pressed && styles.rowPressed,
                    ]}
                    accessibilityRole="radio"
                    accessibilityState={{
                      selected,
                    }}
                    accessibilityLabel={`Select ${item.title}`}
                  >
                    <View
                      style={[
                        styles.themeIconWrap,
                        selected &&
                          styles.themeIconWrapSelected,
                      ]}
                    >
                      <Image
                        source={item.image}
                        resizeMode="contain"
                        style={
                          item.id === "dark"
                            ? styles.themeIconDark
                            : item.id === "light"
                              ? styles.themeIconLight
                              : styles.themeIconSystem
                        }
                      />
                    </View>

                    <View style={styles.themeCopy}>
                      <Text style={styles.themeTitle}>
                        {item.title}
                      </Text>

                      <Text style={styles.themeSubtitle}>
                        {item.subtitle}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.radioOuter,
                        selected &&
                          styles.radioOuterSelected,
                      ]}
                    >
                      {selected ? (
                        <View style={styles.radioInner} />
                      ) : null}
                    </View>
                  </Pressable>

                  {index < THEMES.length - 1 ? (
                    <View style={styles.separator} />
                  ) : null}
                </React.Fragment>
              );
            })}
          </View>

          <Image
            source={ASSETS.brush}
            resizeMode="contain"
            style={styles.brushArtwork}
          />

          {hasPendingChange ? (
            <Pressable
              onPress={() => {
                router.back();
              }}
              style={({ pressed }) => [
                styles.saveButton,
                pressed && styles.saveButtonPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Save theme"
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
    opacity: 0.96,
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
    paddingBottom: 24,
  },

  themeCard: {
    width: "100%",
    borderRadius: 17,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#061722",
    overflow: "hidden",
  },

  themeRow: {
    minHeight: 86,
    paddingHorizontal: 16,
    paddingVertical: 11,
    flexDirection: "row",
    alignItems: "center",
  },

  themeRowSelected: {
    backgroundColor: "rgba(8,216,209,0.025)",
  },

  themeIconWrap: {
    width: 45,
    height: 45,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(179,193,200,0.22)",
    backgroundColor: "rgba(179,193,200,0.04)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    overflow: "hidden",
  },

  themeIconWrapSelected: {
    borderColor: "rgba(8,216,209,0.45)",
    backgroundColor: "rgba(8,216,209,0.055)",
  },

  themeIconDark: {
    width: 31,
    height: 31,
  },

  themeIconLight: {
    width: 29,
    height: 29,
  },

  themeIconSystem: {
    width: 29,
    height: 29,
  },

  themeCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 12,
    marginRight: 10,
  },

  themeTitle: {
    color: COLORS.text,
    fontSize: 13.5,
    lineHeight: 18,
    fontWeight: "700",
  },

  themeSubtitle: {
    color: COLORS.secondary,
    fontSize: 9.6,
    lineHeight: 14,
    marginTop: 3,
  },

  radioOuter: {
    width: 21,
    height: 21,
    borderRadius: 10.5,
    borderWidth: 1.5,
    borderColor: "#8B9AA1",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
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
    marginHorizontal: 1,
  },

  brushArtwork: {
    width: "100%",
    height: 272,
    marginTop: 8,
    alignSelf: "center",
    marginBottom: -2,
  },

  saveButton: {
    height: 50,
    marginTop: 8,
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