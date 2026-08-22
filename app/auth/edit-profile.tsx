import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { authService } from "../../src/services/auth/authService";

/* ============================================================
   ASSETS
   ============================================================ */

const SHIVORA_LOGO = require("../../assets/logo.png");
const USER_AVATAR = require("../../assets/user-avatar.png");

/* ============================================================
   COLORS
   ============================================================ */

const COLORS = {
  background: "#02070D",
  white: "#FFFFFF",
  text: "#F7FAFC",
  textSecondary: "#A7B7C2",
  textMuted: "#7A8B96",

  cyan: "#00E5FF",
  cyanBright: "#00F5FF",
  blue: "#287EFF",
  purple: "#9D4EDD",

  input: "#020B12",
  inputBorder: "#10384A",
  inputBorderBright: "#007F98",
  placeholder: "#667B88",

  success: "#00E5FF",
  error: "#FF4D6D",
};

type FocusedField = "name" | "email" | null;

export default function EditProfileScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();

  const compact = height < 760;
  const isSmallWidth = width <= 375;

  const styles = useMemo(
    () =>
      createStyles(
        width,
        height,
        compact,
        isSmallWidth,
      ),
    [compact, height, isSmallWidth, width],
  );

  /* ============================================================
     STATE
     ============================================================ */

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [profileImageUrl, setProfileImageUrl] =
    useState<string | null>(null);

  const [focusedField, setFocusedField] =
    useState<FocusedField>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const nameInputRef =
    useRef<TextInput>(null);

  const emailInputRef =
    useRef<TextInput>(null);

  /* ============================================================
     LOAD PROFILE
     ============================================================ */

  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      try {
        const user =
          await authService.getCurrentUser();

        if (!mounted) {
          return;
        }

        if (!user || user.isGuest) {
          router.replace("/auth/login" as any);
          return;
        }

        setName(user.name ?? "");
        setEmail(user.email ?? "");
        setPhone(user.phone ?? "");
        setProfileImageUrl(
          user.profileImageUrl ?? null,
        );
      } catch (error) {
        console.error(
          "Edit profile load error:",
          error,
        );

        Alert.alert(
          "Unable to Load Profile",
          "We could not load your profile. Please try again.",
        );
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    void loadProfile();

    return () => {
      mounted = false;
    };
  }, [router]);

  /* ============================================================
     KEYBOARD / INPUT FOCUS
     ============================================================ */

  const focusName = () => {
    if (isSubmitting) {
      return;
    }

    setFocusedField("name");

    requestAnimationFrame(() => {
      nameInputRef.current?.focus();
    });
  };

  const focusEmail = () => {
    if (isSubmitting) {
      return;
    }

    setFocusedField("email");

    requestAnimationFrame(() => {
      emailInputRef.current?.focus();
    });
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
    setFocusedField(null);
  };

  /* ============================================================
     PROFILE IMAGE
     ============================================================ */

  const uploadImage = async (
    uri: string,
  ): Promise<string> => {
    const formData = new FormData();

    formData.append(
      "image",
      {
        uri,
        name: `profile-${Date.now()}.jpg`,
        type: "image/jpeg",
      } as any,
    );

    const response = await fetch(
      "http://192.168.31.189:4000/auth/profile-image",
      {
        method: "POST",
        body: formData,
      },
    );

    const data =
      (await response.json()) as {
        success: boolean;
        imageUrl?: string;
        message?: string;
      };

    if (
      !response.ok ||
      !data.success ||
      !data.imageUrl
    ) {
      throw new Error(
        data.message ??
          "Unable to upload profile photo.",
      );
    }

    return `http://192.168.31.189:4000${data.imageUrl}`;
  };

  const chooseProfilePhoto = () => {
    dismissKeyboard();

    Alert.alert(
      "Profile Photo",
      "Choose how you want to update your photo.",
      [
        {
          text: "Camera",
          onPress: () => {
            void openCamera();
          },
        },
        {
          text: "Gallery",
          onPress: () => {
            void openGallery();
          },
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ],
      {
        cancelable: true,
      },
    );
  };

  const openGallery = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Gallery Permission Required",
          "Please allow photo library access from Settings to choose a profile photo.",
        );
        return;
      }

      const result =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.9,
        });

      if (
        !result.canceled &&
        result.assets.length > 0
      ) {
        const uri =
          result.assets[0].uri;

        setIsSubmitting(true);

        try {
          const uploadedUrl =
            await uploadImage(uri);

          setProfileImageUrl(
            uploadedUrl,
          );
        } finally {
          setIsSubmitting(false);
        }
      }
    } catch (error) {
      console.error(
        "Gallery picker error:",
        error,
      );

      Alert.alert(
        "Unable to Select Photo",
        "Something went wrong while selecting the photo.",
      );
    }
  };

  const openCamera = async () => {
    try {
      const permission =
        await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Camera Permission Required",
          "Please allow camera access from Settings to take a profile photo.",
        );
        return;
      }

      const result =
        await ImagePicker.launchCameraAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.9,
        });

      if (
        !result.canceled &&
        result.assets.length > 0
      ) {
        const uri =
          result.assets[0].uri;

        setIsSubmitting(true);

        try {
          const uploadedUrl =
            await uploadImage(uri);

          setProfileImageUrl(
            uploadedUrl,
          );
        } finally {
          setIsSubmitting(false);
        }
      }
    } catch (error) {
      console.error(
        "Camera picker error:",
        error,
      );

      Alert.alert(
        "Unable to Open Camera",
        "Something went wrong while opening the camera.",
      );
    }
  };

  /* ============================================================
     SAVE
     ============================================================ */

  const saveChanges = async () => {
    dismissKeyboard();

    if (name.trim().length < 2) {
      Alert.alert(
        "Name Required",
        "Please enter your full name.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      await authService.completeProfile({
        name: name.trim(),
        email:
          email.trim() || undefined,
        username: "",
        profileImageUrl:
          profileImageUrl?.trim() ||
          undefined,
      });

      router.back();
    } catch (error) {
      console.error(
        "Edit profile save error:",
        error,
      );

      Alert.alert(
        "Unable to Save",
        error instanceof Error
          ? error.message
          : "Unable to save your profile.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const formattedPhone = phone
    ? phone.startsWith("+91")
      ? `+91 ${phone.slice(3)}`
      : phone
    : "Not available";

  /* ============================================================
     LOADING
     ============================================================ */

  if (isLoading) {
    return (
      <SafeAreaView
        edges={["top", "bottom"]}
        style={styles.safeArea}
      >
        <View style={styles.loading}>
          <ActivityIndicator
            size="large"
            color={COLORS.cyan}
          />
        </View>
      </SafeAreaView>
    );
  }

  /* ============================================================
     SCREEN
     ============================================================ */

  return (
    <SafeAreaView
      edges={["top", "bottom"]}
      style={styles.safeArea}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        <View style={styles.screen}>
          {/* ==================================================
              HEADER
             ================================================== */}

          <View style={styles.header}>
            <Pressable
              onPress={() => {
                dismissKeyboard();
                router.back();
              }}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              style={({ pressed }) => [
                styles.backButton,
                pressed &&
                  styles.pressedOpacity,
              ]}
            >
              <Ionicons
                name="chevron-back"
                size={33}
                color={COLORS.white}
              />
            </Pressable>

            <Image
              source={SHIVORA_LOGO}
              resizeMode="contain"
              style={styles.logo}
              accessibilityLabel="Shivora"
            />

            <View
              style={styles.headerSpacer}
            />
          </View>

          <View style={styles.content}>
            {/* =================================================
                TITLE
               ================================================= */}

            <View style={styles.titleBlock}>
              <Text style={styles.title}>
                Edit{" "}
                <Text
                  style={styles.titleAccent}
                >
                  Profile
                </Text>
                <Text
                  style={styles.titleSpark}
                >
                  ✦
                </Text>
              </Text>

              <Text
                style={styles.subtitle}
              >
                Update your personal information
              </Text>
            </View>

            {/* =================================================
                PROFILE PHOTO
               ================================================= */}

            <View style={styles.avatarSection}>
              <Pressable
                onPress={chooseProfilePhoto}
                disabled={isSubmitting}
                accessibilityRole="button"
                accessibilityLabel="Change profile photo"
                style={({ pressed }) => [
                  styles.avatarOuter,
                  pressed &&
                    styles.avatarPressed,
                ]}
              >
                <View
                  style={styles.avatarGlow}
                  pointerEvents="none"
                />

                <LinearGradient
                  colors={[
                    COLORS.purple,
                    "#2578FF",
                    COLORS.cyan,
                  ]}
                  start={{
                    x: 0.12,
                    y: 0.05,
                  }}
                  end={{
                    x: 0.9,
                    y: 0.95,
                  }}
                  style={styles.avatarRingOuter}
                >
                  <View
                    style={styles.avatarRingInner}
                  >
                    <Image
                      source={
                        profileImageUrl
                          ? {
                              uri: profileImageUrl,
                            }
                          : USER_AVATAR
                      }
                      resizeMode="cover"
                      style={styles.avatar}
                    />
                  </View>
                </LinearGradient>

                <View
                  style={styles.cameraBadge}
                >
                  <Ionicons
                    name="camera-outline"
                    size={18}
                    color="#031018"
                  />
                </View>
              </Pressable>
            </View>

            {/* =================================================
                FULL NAME
               ================================================= */}

            <View style={styles.fields}>
              <Pressable
                onPress={focusName}
                disabled={isSubmitting}
                style={styles.fieldCard}
              >
                <View
                  style={styles.fieldHeader}
                >
                  <Ionicons
                    name="person-outline"
                    size={21}
                    color={COLORS.cyan}
                  />

                  <Text
                    style={styles.fieldTitle}
                  >
                    Full name
                  </Text>
                </View>

                <View
                  style={[
                    styles.inputBox,
                    focusedField ===
                      "name" &&
                      styles.inputBoxFocused,
                  ]}
                  onTouchStart={() => {
                    if (!isSubmitting) {
                      requestAnimationFrame(() => {
                        nameInputRef.current?.focus();
                      });
                    }
                  }}
                >
                  <View
                    pointerEvents="none"
                    style={styles.iconSlot}
                  >
                    <Ionicons
                      name="person-outline"
                      size={20}
                      color={
                        focusedField ===
                        "name"
                          ? COLORS.cyan
                          : COLORS.placeholder
                      }
                    />
                  </View>

                  <TextInput
                    ref={nameInputRef}
                    value={name}
                    onChangeText={setName}
                    onFocus={() =>
                      setFocusedField(
                        "name",
                      )
                    }
                    onBlur={() =>
                      setFocusedField(null)
                    }
                    onTouchStart={() => {
                      requestAnimationFrame(
                        () => {
                          nameInputRef.current?.focus();
                        },
                      );
                    }}
                    placeholder="Enter your full name"
                    placeholderTextColor={
                      COLORS.placeholder
                    }
                    autoCapitalize="words"
                    autoCorrect={false}
                    showSoftInputOnFocus={true}
                    returnKeyType="next"
                    onSubmitEditing={
                      focusEmail
                    }
                    blurOnSubmit={false}
                    editable={!isSubmitting}
                    style={styles.input}
                  />
                </View>
              </Pressable>

              {/* =================================================
                  EMAIL
                 ================================================= */}

              <Pressable
                onPress={focusEmail}
                disabled={isSubmitting}
                style={styles.fieldCard}
              >
                <View
                  style={styles.fieldHeader}
                >
                  <Ionicons
                    name="mail-outline"
                    size={21}
                    color={COLORS.cyan}
                  />

                  <Text
                    style={styles.fieldTitle}
                  >
                    Email address
                  </Text>
                </View>

                <View
                  style={[
                    styles.inputBox,
                    focusedField ===
                      "email" &&
                      styles.inputBoxFocused,
                  ]}
                  onTouchStart={() => {
                    if (!isSubmitting) {
                      requestAnimationFrame(() => {
                        emailInputRef.current?.focus();
                      });
                    }
                  }}
                >
                  <View
                    pointerEvents="none"
                    style={styles.iconSlot}
                  >
                    <Ionicons
                      name="mail-outline"
                      size={20}
                      color={
                        focusedField ===
                        "email"
                          ? COLORS.cyan
                          : COLORS.placeholder
                      }
                    />
                  </View>

                  <TextInput
                    ref={emailInputRef}
                    value={email}
                    onChangeText={setEmail}
                    onFocus={() =>
                      setFocusedField(
                        "email",
                      )
                    }
                    onBlur={() =>
                      setFocusedField(null)
                    }
                    onTouchStart={() => {
                      requestAnimationFrame(
                        () => {
                          emailInputRef.current?.focus();
                        },
                      );
                    }}
                    placeholder="Enter your email address"
                    placeholderTextColor={
                      COLORS.placeholder
                    }
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    showSoftInputOnFocus={true}
                    returnKeyType="done"
                    onSubmitEditing={
                      dismissKeyboard
                    }
                    editable={!isSubmitting}
                    style={styles.input}
                  />
                </View>
              </Pressable>

              {/* =================================================
                  MOBILE NUMBER
                 ================================================= */}

              <View
                style={styles.fieldCard}
              >
                <View
                  style={styles.fieldHeader}
                >
                  <Ionicons
                    name="call-outline"
                    size={21}
                    color={COLORS.cyan}
                  />

                  <Text
                    style={styles.fieldTitle}
                  >
                    Mobile number
                  </Text>
                </View>

                <View
                  style={styles.phoneBox}
                >
                  <View
                    pointerEvents="none"
                    style={styles.iconSlot}
                  >
                    <Ionicons
                      name="call-outline"
                      size={20}
                      color={COLORS.cyan}
                    />
                  </View>

                  <Text
                    style={styles.flag}
                  >
                    {phone.startsWith(
                      "+44",
                    )
                      ? "🇬🇧"
                      : phone.startsWith(
                            "+1",
                          )
                        ? "🇺🇸"
                        : "🇮🇳"}
                  </Text>

                  <Text
                    numberOfLines={1}
                    style={styles.phoneText}
                  >
                    {formattedPhone}
                  </Text>

                  <View
                    style={
                      styles.verifiedCircle
                    }
                  >
                    <Ionicons
                      name="checkmark"
                      size={21}
                      color="#031018"
                    />
                  </View>
                </View>

                <View
                  style={styles.verifiedRow}
                >
                  <Ionicons
                    name="shield-checkmark"
                    size={15}
                    color={COLORS.cyan}
                  />

                  <Text
                    style={styles.verifiedText}
                  >
                    This number is verified
                  </Text>
                </View>
              </View>
            </View>

            {/* =================================================
                SAVE
               ================================================= */}

            <Pressable
              onPress={() =>
                void saveChanges()
              }
              disabled={isSubmitting}
              accessibilityRole="button"
              accessibilityLabel="Save Changes"
              style={({ pressed }) => [
                styles.saveButton,
                pressed &&
                  !isSubmitting &&
                  styles.pressedOpacity,
                isSubmitting &&
                  styles.saveDisabled,
              ]}
            >
              <LinearGradient
                colors={[
                  "#00CFFF",
                  "#2D7AFF",
                  "#8C2EFF",
                ]}
                start={{
                  x: 0,
                  y: 0.5,
                }}
                end={{
                  x: 1,
                  y: 0.5,
                }}
                style={
                  styles.saveGradient
                }
              >
                {isSubmitting ? (
                  <ActivityIndicator
                    color="#FFFFFF"
                    size="small"
                  />
                ) : (
                  <>
                    <Text
                      style={styles.saveText}
                    >
                      Save Changes
                    </Text>

                    <Ionicons
                      name="arrow-forward"
                      size={25}
                      color="#FFFFFF"
                    />
                  </>
                )}
              </LinearGradient>
            </Pressable>

            <View
              style={styles.bottomSpace}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ============================================================
   STYLES
   ============================================================ */

function createStyles(
  screenWidth: number,
  screenHeight: number,
  compact: boolean,
  isSmallWidth: boolean,
) {
  const horizontalPadding =
    isSmallWidth ? 20 : screenWidth >= 430 ? 25 : 22;

  const fieldHeight =
    compact ? 50 : 52;

  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: COLORS.background,
    },

    flex: {
      flex: 1,
    },

    screen: {
      flex: 1,
      backgroundColor: COLORS.background,
    },

    content: {
      flex: 1,
      paddingTop: compact ? 0 : 2,
      paddingHorizontal: horizontalPadding,
      paddingBottom: 8,
    },

    loading: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: COLORS.background,
    },

    /* ========================================================
       HEADER
       ======================================================== */

    header: {
      height: compact ? 62 : 68,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal:
        isSmallWidth ? 17 : 19,
    },

    backButton: {
      width: 45,
      height: 43,
      borderRadius: 14,
      borderWidth: 1.3,
      borderColor:
        "rgba(0,229,255,0.42)",
      backgroundColor:
        "rgba(6,24,34,0.9)",
      alignItems: "center",
      justifyContent: "center",
      shadowColor: COLORS.cyan,
      shadowOpacity: 0.15,
      shadowRadius: 10,
      shadowOffset: {
        width: 0,
        height: 0,
      },
      elevation: 4,
    },

    logo: {
      width: compact ? 168 : 186,
      height: compact ? 69 : 75,
    },

    headerSpacer: {
      width: compact ? 54 : 56,
    },

    /* ========================================================
       TITLE
       ======================================================== */

    scrollContent: {
      paddingTop: compact ? 0 : 2,
      paddingHorizontal: horizontalPadding,
      paddingBottom: 8,
    },

    titleBlock: {
      alignItems: "center",
      marginTop: 18,
    },

    title: {
      color: COLORS.white,
      fontSize: compact ? 25 : 27,
      lineHeight: compact ? 30 : 32,
      fontWeight: "800",
      letterSpacing: -0.9,
      textAlign: "center",
    },

    titleAccent: {
      color: COLORS.cyan,
      textShadowColor:
        "rgba(0,229,255,0.32)",
      textShadowOffset: {
        width: 0,
        height: 0,
      },
      textShadowRadius: 7,
    },

    titleSpark: {
      color: COLORS.purple,
      fontSize: 18,
      marginLeft: 2,
    },

    subtitle: {
      color: COLORS.textSecondary,
      fontSize: compact ? 12 : 12.5,
      lineHeight: 17,
      marginTop: 3,
      textAlign: "center",
    },

    /* ========================================================
       AVATAR
       ======================================================== */

    avatarSection: {
      alignItems: "center",
      marginTop: compact ? 14 : 16,
      marginBottom: compact ? 12 : 14,
    },

    avatarOuter: {
      width: compact ? 126 : 140,
      height: compact ? 126 : 140,
      position: "relative",
      alignItems: "center",
      justifyContent: "center",
    },

    avatarGlow: {
      position: "absolute",
      width: compact ? 122 : 136,
      height: compact ? 122 : 136,
      borderRadius: 100,
      backgroundColor:
        "rgba(0,229,255,0.08)",
      shadowColor: COLORS.cyan,
      shadowOpacity: 0.32,
      shadowRadius: 28,
      shadowOffset: {
        width: 0,
        height: 0,
      },
    },

    avatarRingOuter: {
      width: "100%",
      height: "100%",
      borderRadius: 100,
      padding: 3,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: COLORS.cyan,
      shadowOpacity: 0.32,
      shadowRadius: 12,
      shadowOffset: {
        width: 0,
        height: 0,
      },
      elevation: 6,
    },

    avatarRingInner: {
      flex: 1,
      width: "100%",
      borderRadius: 100,
      overflow: "hidden",
      backgroundColor: "#061019",
      borderWidth: 1,
      borderColor: "#0D2430",
    },

    avatar: {
      width: "100%",
      height: "100%",
    },

    cameraBadge: {
      position: "absolute",
      right: -2,
      bottom: -1,
      width: compact ? 38 : 41,
      height: compact ? 38 : 41,
      borderRadius: 100,
      backgroundColor: COLORS.cyan,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 3,
      borderColor: COLORS.background,
      shadowColor: COLORS.cyan,
      shadowOpacity: 0.25,
      shadowRadius: 8,
      shadowOffset: {
        width: 0,
        height: 0,
      },
      elevation: 5,
    },

    avatarPressed: {
      opacity: 0.85,
      transform: [{ scale: 0.985 }],
    },

    /* ========================================================
       FIELDS
       ======================================================== */

    fields: {
      gap: compact ? 7 : 9,
    },

    fieldCard: {
      borderRadius: 18,
      borderWidth: 1.15,
      borderColor: COLORS.inputBorder,
      backgroundColor:
        "rgba(4,17,27,0.96)",
      paddingHorizontal: compact ? 9 : 10,
      paddingTop: compact ? 8 : 9,
      paddingBottom: compact ? 8 : 9,
    },

    fieldHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 5,
    },

    fieldTitle: {
      color: COLORS.white,
      fontSize: compact ? 15 : 15.5,
      lineHeight: 20,
      fontWeight: "800",
      marginLeft: 8,
    },

    inputBox: {
      minHeight: fieldHeight,
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1.15,
      borderColor: "#113A49",
      borderRadius: 12,
      backgroundColor: COLORS.input,
      paddingHorizontal: 12,
    },

    inputBoxFocused: {
      borderColor: COLORS.cyan,
      shadowColor: COLORS.cyan,
      shadowOpacity: 0.17,
      shadowRadius: 10,
      shadowOffset: {
        width: 0,
        height: 0,
      },
      elevation: 4,
    },

    iconSlot: {
      width: 28,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 5,
    },

    input: {
      flex: 1,
      color: COLORS.white,
      fontSize: compact ? 15 : 15.5,
      lineHeight: 20,
      paddingVertical: 0,
      paddingHorizontal: 0,
      includeFontPadding: false,
      minHeight: fieldHeight - 4,
    },

    /* ========================================================
       PHONE
       ======================================================== */

    phoneBox: {
      minHeight: fieldHeight,
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1.15,
      borderColor:
        "rgba(0,229,255,0.22)",
      borderRadius: 12,
      backgroundColor:
        "rgba(3,14,22,0.98)",
      paddingHorizontal: 12,
    },

    flag: {
      fontSize: compact ? 19 : 20,
      marginLeft: 3,
      marginRight: 8,
    },

    phoneText: {
      flex: 1,
      color: COLORS.white,
      fontSize: compact ? 15 : 15.5,
      fontWeight: "700",
    },

    verifiedCircle: {
      width: compact ? 34 : 38,
      height: compact ? 34 : 38,
      borderRadius: 100,
      backgroundColor: COLORS.cyan,
      alignItems: "center",
      justifyContent: "center",
    },

    verifiedRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 6,
      paddingHorizontal: 2,
    },

    verifiedText: {
      color: COLORS.cyan,
      fontSize: 10.5,
      lineHeight: 14,
      fontWeight: "700",
      marginLeft: 5,
    },

    /* ========================================================
       SAVE BUTTON
       ======================================================== */

    saveButton: {
      height: compact ? 52 : 56,
      borderRadius: 31,
      overflow: "hidden",
      marginTop: compact ? 24 : 30,
      borderWidth: 1,
      borderColor:
        "rgba(255,255,255,0.18)",
      shadowColor: COLORS.purple,
      shadowOpacity: 0.2,
      shadowRadius: 12,
      shadowOffset: {
        width: 0,
        height: 0,
      },
      elevation: 5,
    },

    saveGradient: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
    },

    saveText: {
      color: COLORS.white,
      fontSize: compact ? 17 : 18,
      lineHeight: 23,
      fontWeight: "800",
    },

    saveDisabled: {
      opacity: 0.6,
    },

    pressedOpacity: {
      opacity: 0.82,
    },

    bottomSpace: {
      height: 2,
    },
  });
}