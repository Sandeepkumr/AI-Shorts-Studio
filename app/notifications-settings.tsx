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

type NotificationRowProps = {
  title: string;
  subtitle: string;
  value: boolean;
  disabled?: boolean;
  onToggle: () => void;
};

export default function NotificationsScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const isSmall = width <= 375;
  const isLarge = width >= 430;
  const horizontalPadding = isSmall ? 18 : isLarge ? 27 : 22;

  const [masterEnabled, setMasterEnabled] = useState(true);

  const [generationCompleted, setGenerationCompleted] =
    useState(true);
  const [generationFailed, setGenerationFailed] =
    useState(true);
  const [processingUpdates, setProcessingUpdates] =
    useState(true);

  const [creditsOffers, setCreditsOffers] =
    useState(true);
  const [newFeatures, setNewFeatures] =
    useState(true);

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/settings" as any);
  };

  const Toggle = ({
    value,
    disabled = false,
    onToggle,
  }: {
    value: boolean;
    disabled?: boolean;
    onToggle: () => void;
  }) => (
    <Pressable
      onPress={onToggle}
      disabled={disabled}
      hitSlop={6}
      accessibilityRole="switch"
      accessibilityState={{
        checked: value,
        disabled,
      }}
      style={({ pressed }) => [
        styles.toggle,
        value
          ? styles.toggleOn
          : styles.toggleOff,
        disabled && styles.toggleDisabled,
        pressed && !disabled && styles.togglePressed,
      ]}
    >
      <View
        style={[
          styles.toggleThumb,
          value && styles.toggleThumbOn,
        ]}
      />
    </Pressable>
  );

  const NotificationRow = ({
    title,
    subtitle,
    value,
    disabled = false,
    onToggle,
  }: NotificationRowProps) => (
    <View style={styles.notificationRow}>
      <View style={styles.notificationCopy}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowSubtitle}>{subtitle}</Text>
      </View>

      <Toggle
        value={disabled ? false : value}
        disabled={disabled}
        onToggle={onToggle}
      />
    </View>
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

          <View style={styles.headerCopy}>
            <View style={styles.titleRow}>
              <Text style={styles.headerTitle}>
                Notifications
              </Text>
              <Text style={styles.titleSparkle}>✦</Text>
            </View>

            <Text style={styles.headerSubtitle}>
              Manage your preferences
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
          <View style={styles.masterCard}>
            <View style={styles.masterCopy}>
              <Text style={styles.masterTitle}>
                Enable Notifications
              </Text>
              <Text style={styles.masterSubtitle}>
                Turn all notifications on or off
              </Text>
            </View>

            <Toggle
              value={masterEnabled}
              onToggle={() =>
                setMasterEnabled((current) => !current)
              }
            />
          </View>

          <Text style={styles.sectionLabel}>
            GENERATION UPDATES
          </Text>

          <View style={styles.sectionCard}>
            <NotificationRow
              title="Generation Completed"
              subtitle="Get notified when your video is ready"
              value={generationCompleted}
              disabled={!masterEnabled}
              onToggle={() =>
                setGenerationCompleted(
                  (current) => !current,
                )
              }
            />

            <View style={styles.separator} />

            <NotificationRow
              title="Generation Failed"
              subtitle="Get notified when generation fails"
              value={generationFailed}
              disabled={!masterEnabled}
              onToggle={() =>
                setGenerationFailed(
                  (current) => !current,
                )
              }
            />

            <View style={styles.separator} />

            <NotificationRow
              title="Processing Updates"
              subtitle="Get notified about progress"
              value={processingUpdates}
              disabled={!masterEnabled}
              onToggle={() =>
                setProcessingUpdates(
                  (current) => !current,
                )
              }
            />
          </View>

          <Text style={styles.sectionLabel}>
            ACCOUNT &amp; OFFERS
          </Text>

          <View style={styles.sectionCard}>
            <NotificationRow
              title="Credits & Offers"
              subtitle="Get notified about credits & offers"
              value={creditsOffers}
              disabled={!masterEnabled}
              onToggle={() =>
                setCreditsOffers(
                  (current) => !current,
                )
              }
            />

            <View style={styles.separator} />

            <NotificationRow
              title="New Features"
              subtitle="Get notified about new features"
              value={newFeatures}
              disabled={!masterEnabled}
              onToggle={() =>
                setNewFeatures(
                  (current) => !current,
                )
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

  masterCard: {
    minHeight: 68,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 13,
    paddingVertical: 11,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  masterCopy: {
    flex: 1,
    minWidth: 0,
    marginRight: 10,
  },

  masterTitle: {
    color: COLORS.text,
    fontSize: 11.5,
    lineHeight: 15,
    fontWeight: "700",
  },

  masterSubtitle: {
    color: COLORS.secondary,
    fontSize: 9,
    lineHeight: 13,
    marginTop: 2,
  },

  sectionLabel: {
    color: COLORS.muted,
    fontSize: 9,
    lineHeight: 12,
    fontWeight: "700",
    letterSpacing: 1,
    marginTop: 18,
    marginBottom: 7,
  },

  sectionCard: {
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    overflow: "hidden",
  },

  notificationRow: {
    minHeight: 64,
    paddingHorizontal: 12,
    paddingVertical: 9,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  notificationCopy: {
    flex: 1,
    minWidth: 0,
    marginRight: 10,
  },

  rowTitle: {
    color: COLORS.text,
    fontSize: 11.2,
    lineHeight: 15,
    fontWeight: "700",
  },

  rowSubtitle: {
    color: COLORS.secondary,
    fontSize: 8.8,
    lineHeight: 12,
    marginTop: 2,
  },

  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#14303B",
    marginLeft: 12,
  },

  toggle: {
    width: 40,
    height: 24,
    borderRadius: 12,
    paddingHorizontal: 3,
    justifyContent: "center",
    flexShrink: 0,
  },

  toggleOn: {
    backgroundColor: COLORS.cyan,
  },

  toggleOff: {
    backgroundColor: "#243842",
    borderWidth: 1,
    borderColor: "#38515B",
  },

  toggleDisabled: {
    opacity: 0.48,
  },

  togglePressed: {
    opacity: 0.82,
  },

  toggleThumb: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#FFFFFF",
    alignSelf: "flex-start",
  },

  toggleThumbOn: {
    alignSelf: "flex-end",
  },

  bottomSpace: {
    height: 24,
  },
});