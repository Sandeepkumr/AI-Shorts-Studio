import React, { useState } from "react";
import {
  Alert,
  Image,
  Modal,
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
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

/*
 * ============================================================
 * MY ACCOUNT
 * ============================================================
 *
 * Route:
 *   app/profile.tsx
 *
 * MVP account screen:
 *   - Profile / avatar
 *   - Credits
 *   - Subscription / Upgrade
 *   - Edit Profile
 *   - Settings
 *   - Help & Support
 *   - Logout
 *
 * Uses the same Shivora visual language as the existing
 * Text-to-Video / Image-to-Video / Characters / Projects screens:
 * dark navy background, cyan borders, purple accents and
 * cyan -> blue -> purple CTA gradients.
 *
 * Existing assets:
 *   ../assets/user-avatar.png
 *   ../assets/coin.png
 * ============================================================
 */

const ASSETS = {
  userAvatar: require("../assets/user-avatar.png"),
  coin: require("../assets/coin.png"),
};
type ShivoraProfileSession = {
  phone: string;
  name: string;
  email: string;
  avatar: any;
};

const getProfileSession = (): ShivoraProfileSession => {
  const root = globalThis as typeof globalThis & {
    __shivoraProfile?: ShivoraProfileSession;
  };

  return root.__shivoraProfile ?? {
    phone: "",
    name: "",
    email: "",
    avatar: ASSETS.userAvatar,
  };
};


const COLORS = {
  background: "#020A10",
  surface: "#071A24",
  surfaceAlt: "#061822",
  card: "#071722",

  text: "#F6F8FA",
  secondary: "#B3C1C8",
  muted: "#84959E",

  cyan: "#08D8D1",
  cyanBright: "#00E7DF",
  border: "#123E4D",
  cyanBorder: "#00D8D0",

  purple: "#B05CFF",
  purpleBright: "#C777FF",
  purpleSurface: "#180B31",
  purpleBorder: "#7E35D5",

  danger: "#FF6670",
  dangerBorder: "#5E2630",
  dangerSurface: "#1B0D13",

  green: "#2DE39A",
};

type RowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  title: string;
  subtitle: string;
  onPress: () => void;
};

export default function MyAccountScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const profile = getProfileSession();

  const isSmall = width <= 375;
  const isLarge = width >= 430;
  const horizontalPadding = isSmall ? 18 : isLarge ? 27 : 22;

  const [logoutVisible, setLogoutVisible] = useState(false);

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/" as any);
  };

  const openCreate = () => {
    Alert.alert(
      "Create New Video",
      "Choose how you want to create your video.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Text to Video",
          onPress: () =>
            router.push(
              "/create-video-screen-t2v" as any
            ),
        },
        {
          text: "Image to Video",
          onPress: () =>
            router.push(
              "/add-story-image-to-video" as any
            ),
        },
      ]
    );
  };

  const openCredits = () => {
    router.push("/credits" as any);
  };

  const openEditProfile = () => {
    const latestProfile = getProfileSession();

    router.push({
      pathname: "/auth/create-profile-setup" as any,
      params: {
        mode: "edit",
        editName: latestProfile.name,
        editEmail: latestProfile.email,
        phone: latestProfile.phone,
      },
    });
  };

  const openSettings = () => {
    router.push("/settings" as any);
  };

  const openSubscription = () => {
    Alert.alert(
      "Subscription",
      "Your subscription and upgrade flow will open here."
    );
  };

  const openHelp = () => {
    Alert.alert(
      "Help & Support",
      "Support center will open here."
    );
  };

  const confirmLogout = () => {
    setLogoutVisible(false);

    Alert.alert(
      "Logged Out",
      "Connect this action to your auth sign-out service."
    );
  };

  const AccountRow = ({
    icon,
    iconColor,
    title,
    subtitle,
    onPress,
  }: RowProps) => (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.accountRow,
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
          size={21}
          color={iconColor}
        />
      </View>

      <View style={styles.rowCopy}>
        <Text style={styles.rowTitle}>
          {title}
        </Text>
        <Text style={styles.rowSubtitle}>
          {subtitle}
        </Text>
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
        {/* ========================================================
            HEADER
           ======================================================== */}
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
              size={33}
              color={COLORS.text}
            />
          </Pressable>

          <View style={styles.headerCopy}>
            <Text
              style={styles.headerTitle}
              numberOfLines={1}
            >
              My Account
            </Text>

            <Text style={styles.headerSubtitle}>
              Manage your account and preferences
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
              paddingBottom: 120,
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* ========================================================
              PROFILE IDENTITY
             ======================================================== */}
          <View style={styles.profileIdentity}>
            <View style={styles.avatarRingOuter}>
              <LinearGradient
                colors={["#00D7D1", "#2578FF", "#9A34FF"]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.avatarRing}
              >
                <View style={styles.avatarInner}>
                  <Image
                    source={profile.avatar || ASSETS.userAvatar}
                    resizeMode="cover"
                    style={styles.avatar}
                  />
                </View>
              </LinearGradient>

              <Pressable
                onPress={openEditProfile}
                style={({ pressed }) => [
                  styles.cameraButton,
                  pressed && styles.pressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Change profile photo"
              >
                <Ionicons
                  name="camera-outline"
                  size={17}
                  color="#031013"
                />
              </Pressable>
            </View>

            <View style={styles.identityCopy}>
              <Text style={styles.userName}>
                {profile.name || "Your Name"}
              </Text>

              <Text
                style={styles.userEmail}
                numberOfLines={1}
              >
                {profile.email || "Add your email"}
              </Text>

              <View style={styles.planBadge}>
                <Ionicons
                  name="sparkles-outline"
                  size={14}
                  color={COLORS.purpleBright}
                />
                <Text style={styles.planBadgeText}>
                  Free Plan
                </Text>
              </View>
            </View>
          </View>

          {/* ========================================================
              CREDITS CARD
             ======================================================== */}
          <Pressable
            onPress={openCredits}
            style={({ pressed }) => [
              styles.creditsCard,
              pressed && styles.cardPressed,
            ]}
          >
            <View style={styles.creditInfo}>
              <Text style={styles.creditsLabel}>
                Your Credits
              </Text>

              <View style={styles.creditValueRow}>
                <Text style={styles.creditsValue}>
                  12,450
                </Text>

                <Image
                  source={ASSETS.coin}
                  resizeMode="contain"
                  style={styles.creditImage}
                />
              </View>
            </View>

            <View style={styles.addCreditsButton}>
              <Text style={styles.addCreditsText}>
                + Add Credits
              </Text>
            </View>
          </Pressable>

          {/* ========================================================
              UPGRADE CARD
             ======================================================== */}
          <View style={styles.upgradeCard}>
            <View style={styles.upgradeGlow} />

            <View style={styles.upgradeIcon}>
              <Ionicons
                name="diamond-outline"
                size={26}
                color={COLORS.purpleBright}
              />
            </View>

            <View style={styles.upgradeCopy}>
              <Text style={styles.upgradeTitle}>
                Upgrade to Shivora Pro
              </Text>

              <Text style={styles.upgradeDescription}>
                Unlock premium features, more credits,
                faster generation and more.
              </Text>

              <Pressable
                onPress={openSubscription}
                style={({ pressed }) => [
                  styles.upgradeButton,
                  pressed && styles.cardPressed,
                ]}
              >
                <LinearGradient
                  colors={[
                    "#00CFFF",
                    "#2C75FF",
                    "#8C2EFF",
                  ]}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={styles.upgradeGradient}
                >
                  <Text style={styles.upgradeButtonText}>
                    Upgrade Now
                  </Text>

                  <Ionicons
                    name="arrow-forward"
                    size={18}
                    color="#FFFFFF"
                  />
                </LinearGradient>
              </Pressable>
            </View>
          </View>

          {/* ========================================================
              ACCOUNT ACTIONS
             ======================================================== */}
          <View style={styles.sectionCard}>
            <AccountRow
              icon="person-outline"
              iconColor={COLORS.cyan}
              title="Edit Profile"
              subtitle="Update your personal information"
              onPress={openEditProfile}
            />

            <View style={styles.separator} />

            <AccountRow
              icon="settings-outline"
              iconColor={COLORS.cyan}
              title="Settings"
              subtitle="App preferences"
              onPress={openSettings}
            />

            <View style={styles.separator} />

            <AccountRow
              icon="help-circle-outline"
              iconColor={COLORS.cyan}
              title="Help & Support"
              subtitle="Get help and contact support"
              onPress={openHelp}
            />
          </View>

          {/* ========================================================
              LOGOUT
             ======================================================== */}
          <Pressable
            onPress={() => setLogoutVisible(true)}
            style={({ pressed }) => [
              styles.logoutCard,
              pressed && styles.cardPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Log out"
          >
            <View style={styles.logoutIcon}>
              <Ionicons
                name="log-out-outline"
                size={23}
                color={COLORS.danger}
              />
            </View>

            <View style={styles.logoutCopy}>
              <Text style={styles.logoutTitle}>
                Log Out
              </Text>

              <Text style={styles.logoutSubtitle}>
                Sign out from your account
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={20}
              color={COLORS.danger}
            />
          </Pressable>
        </ScrollView>

        {/* ========================================================
            LOGOUT CONFIRMATION
           ======================================================== */}
        <Modal
          visible={logoutVisible}
          transparent
          animationType="fade"
          statusBarTranslucent
          onRequestClose={() =>
            setLogoutVisible(false)
          }
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setLogoutVisible(false)}
          >
            <Pressable
              style={styles.logoutModal}
              onPress={() => {}}
            >
              <View style={styles.modalIcon}>
                <Ionicons
                  name="log-out-outline"
                  size={28}
                  color={COLORS.danger}
                />
              </View>

              <Text style={styles.modalTitle}>
                Log Out?
              </Text>

              <Text style={styles.modalMessage}>
                Are you sure you want to sign out of
                Shivora?
              </Text>

              <View style={styles.modalActions}>
                <Pressable
                  onPress={() =>
                    setLogoutVisible(false)
                  }
                  style={styles.cancelButton}
                >
                  <Text style={styles.cancelText}>
                    Cancel
                  </Text>
                </Pressable>

                <Pressable
                  onPress={confirmLogout}
                  style={styles.logoutConfirmButton}
                >
                  <Text
                    style={styles.logoutConfirmText}
                  >
                    Log Out
                  </Text>
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
        </Modal>
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
    backgroundColor: "rgba(8, 216, 209, 0.045)",
  },

  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.995 }],
  },

  /* ============================================================
     HEADER
     ============================================================ */

  header: {
    height: 70,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  },

  headerTitle: {
    color: COLORS.text,
    fontSize: 20,
    lineHeight: 24,
    fontWeight: "800",
    letterSpacing: -0.5,
    includeFontPadding: false,
    textAlign: "center",
  },

  headerSubtitle: {
    color: COLORS.secondary,
    fontSize: 9.8,
    lineHeight: 14,
    marginTop: 3,
    textAlign: "center",
  },

  headerSpacer: {
    width: 45,
    height: 43,
    flexShrink: 0,
  },

  /* ============================================================
     MAIN
     ============================================================ */

  scrollContent: {
    paddingTop: 7,
    gap: 11,
  },

  profileIdentity: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 123,
  },

  avatarRingOuter: {
    width: 111,
    height: 111,
    borderRadius: 55.5,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.cyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.28,
    shadowRadius: 13,
    elevation: 7,
  },

  avatarRing: {
    width: 111,
    height: 111,
    borderRadius: 55.5,
    padding: 3,
  },

  avatarInner: {
    flex: 1,
    borderRadius: 52,
    overflow: "hidden",
    borderWidth: 1.1,
    borderColor: "#08202C",
    backgroundColor: "#081720",
  },

  avatar: {
    width: "100%",
    height: "100%",
  },

  cameraButton: {
    position: "absolute",
    right: -1,
    bottom: 2,
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.2,
    borderColor: "#7CF2EE",
    backgroundColor: COLORS.cyan,
    alignItems: "center",
    justifyContent: "center",
  },

  identityCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 18,
    paddingRight: 4,
  },

  userName: {
    color: COLORS.text,
    fontSize: 20,
    lineHeight: 25,
    fontWeight: "800",
  },

  userEmail: {
    color: COLORS.secondary,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
  },

  planBadge: {
    alignSelf: "flex-start",
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#6E38A2",
    backgroundColor: "#180C29",
    paddingHorizontal: 10,
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  planBadgeText: {
    color: COLORS.purpleBright,
    fontSize: 9.5,
    lineHeight: 13,
    fontWeight: "700",
  },

  /* ============================================================
     CREDITS
     ============================================================ */

  creditsCard: {
    minHeight: 74,
    borderRadius: 17,
    borderWidth: 1.15,
    borderColor: COLORS.cyanBorder,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 13,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  creditInfo: {
    flex: 1,
    minWidth: 0,
  },

  creditsLabel: {
    color: COLORS.secondary,
    fontSize: 9.8,
    lineHeight: 14,
  },

  creditValueRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 1,
  },

  creditsValue: {
    color: COLORS.cyan,
    fontSize: 23,
    lineHeight: 28,
    fontWeight: "800",
  },

  creditImage: {
    width: 34,
    height: 34,
    marginLeft: 8,
  },

  addCreditsButton: {
    height: 39,
    borderRadius: 20,
    borderWidth: 1.15,
    borderColor: COLORS.cyan,
    backgroundColor: "#061922",
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  addCreditsText: {
    color: COLORS.text,
    fontSize: 10.5,
    lineHeight: 14,
    fontWeight: "700",
  },

  /* ============================================================
     UPGRADE
     ============================================================ */

  upgradeCard: {
    minHeight: 133,
    borderRadius: 18,
    borderWidth: 1.1,
    borderColor: COLORS.purpleBorder,
    backgroundColor: "#120D24",
    overflow: "hidden",
    padding: 13,
    flexDirection: "row",
  },

  upgradeGlow: {
    position: "absolute",
    left: -30,
    top: -30,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(64, 88, 255, 0.11)",
  },

  upgradeIcon: {
    width: 55,
    height: 55,
    borderRadius: 20,
    backgroundColor: "rgba(58, 55, 130, 0.32)",
    borderWidth: 1,
    borderColor: "#463796",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  upgradeCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 11,
  },

  upgradeTitle: {
    color: COLORS.text,
    fontSize: 14.5,
    lineHeight: 19,
    fontWeight: "800",
  },

  upgradeDescription: {
    color: COLORS.secondary,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 4,
    maxWidth: 240,
  },

  upgradeButton: {
    alignSelf: "flex-start",
    height: 33,
    minWidth: 116,
    borderRadius: 17,
    overflow: "hidden",
    marginTop: 9,
  },

  upgradeGradient: {
    flex: 1,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },

  upgradeButtonText: {
    color: "#FFFFFF",
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "800",
  },

  /* ============================================================
     ACCOUNT ACTION CARD
     ============================================================ */

  sectionCard: {
    borderRadius: 17,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    overflow: "hidden",
  },

  accountRow: {
    minHeight: 65,
    paddingHorizontal: 11,
    paddingVertical: 9,
    flexDirection: "row",
    alignItems: "center",
  },

  rowIcon: {
    width: 40,
    height: 40,
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
  },

  rowTitle: {
    color: COLORS.text,
    fontSize: 12.5,
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
    marginLeft: 62,
  },

  /* ============================================================
     LOGOUT
     ============================================================ */

  logoutCard: {
    minHeight: 68,
    borderRadius: 17,
    borderWidth: 1.1,
    borderColor: COLORS.dangerBorder,
    backgroundColor: COLORS.dangerSurface,
    paddingHorizontal: 11,
    paddingVertical: 9,
    flexDirection: "row",
    alignItems: "center",
  },

  logoutIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#7A333D",
    backgroundColor: "#220F15",
    alignItems: "center",
    justifyContent: "center",
  },

  logoutCopy: {
    flex: 1,
    minWidth: 0,
    marginLeft: 11,
  },

  logoutTitle: {
    color: COLORS.danger,
    fontSize: 12.5,
    fontWeight: "800",
  },

  logoutSubtitle: {
    color: COLORS.secondary,
    fontSize: 9.2,
    marginTop: 3,
  },

  /* ============================================================
     LOGOUT MODAL
     ============================================================ */

  modalOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 22,
  },

  logoutModal: {
    width: "100%",
    maxWidth: 380,
    borderRadius: 22,
    borderWidth: 1.1,
    borderColor: COLORS.dangerBorder,
    backgroundColor: "#071820",
    padding: 18,
  },

  modalIcon: {
    width: 55,
    height: 55,
    borderRadius: 18,
    alignSelf: "center",
    backgroundColor: "#220F15",
    borderWidth: 1,
    borderColor: "#7A333D",
    alignItems: "center",
    justifyContent: "center",
  },

  modalTitle: {
    color: COLORS.text,
    fontSize: 19,
    lineHeight: 24,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 12,
  },

  modalMessage: {
    color: COLORS.secondary,
    fontSize: 11.5,
    lineHeight: 17,
    textAlign: "center",
    marginTop: 6,
  },

  modalActions: {
    flexDirection: "row",
    gap: 9,
    marginTop: 17,
  },

  cancelButton: {
    flex: 1,
    height: 45,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },

  cancelText: {
    color: COLORS.text,
    fontSize: 12.5,
    fontWeight: "700",
  },

  logoutConfirmButton: {
    flex: 1,
    height: 45,
    borderRadius: 23,
    backgroundColor: COLORS.danger,
    alignItems: "center",
    justifyContent: "center",
  },

  logoutConfirmText: {
    color: "#1A060A",
    fontSize: 12.5,
    fontWeight: "800",
  },
});