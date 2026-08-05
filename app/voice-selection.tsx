import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "../src/components/Button";
import {
  voiceService,
  type VoiceAccent,
  type VoiceProfile,
} from "../src/services/ai/voiceService";
import { useTheme } from "../src/theme";

export default function VoiceSelectionScreen() {
  const router = useRouter();
  const theme = useTheme();
  const styles = createStyles();
  const [selectedVoice, setSelectedVoice] = useState<string | null>(null);
  const [voices, setVoices] = useState<VoiceProfile[]>([]);
  const [loadingPreview, setLoadingPreview] = useState<string | null>(null);
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const selectionScale = useRef(new Animated.Value(1)).current;
  const previewRequestId = useRef(0);

  useEffect(() => {
    let isMounted = true;

    const loadVoices = async () => {
      const voiceProfiles = await voiceService.getVoices();

      if (isMounted) {
        setVoices(voiceProfiles);
      }
    };

    void loadVoices();

    return () => {
      isMounted = false;
      previewRequestId.current += 1;
    };
  }, []);

  const accentColors: Record<VoiceAccent, string> = {
    primary: theme.colors.primary,
    secondary: theme.colors.secondary,
    success: theme.colors.success,
    warning: theme.colors.warning,
  };

  const selectVoice = (voiceId: string) => {
    setSelectedVoice(voiceId);
    selectionScale.setValue(0.97);
    Animated.spring(selectionScale, {
      damping: 12,
      stiffness: 220,
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const previewVoice = async (voiceId: string) => {
    if (playingVoice === voiceId) {
      setPlayingVoice(null);
      return;
    }

    const requestId = previewRequestId.current + 1;
    previewRequestId.current = requestId;

    setLoadingPreview(voiceId);
    setPlayingVoice(null);
    await voiceService.previewVoice(voiceId);

    if (previewRequestId.current === requestId) {
      setLoadingPreview(null);
      setPlayingVoice(voiceId);
    }
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headingIcon}>
          <Ionicons color={theme.colors.primary} name="mic-outline" size={28} />
        </View>
        <Text style={styles.title}>Voice Selection</Text>
        <Text style={styles.subtitle}>
          Choose the narrator that brings your story to life.
        </Text>

        <View style={styles.voiceList}>
          {voices.map((voice) => {
            const selected = selectedVoice === voice.id;
            const accentColor = accentColors[voice.accent];
            const isLoading = loadingPreview === voice.id;
            const isPlaying = playingVoice === voice.id;

            return (
              <Animated.View
                key={voice.id}
                style={[
                  styles.voiceCard,
                  selected && styles.voiceCardSelected,
                  selected && { transform: [{ scale: selectionScale }] },
                ]}
              >
                <Pressable
                  accessibilityLabel={`Select ${voice.name}`}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  onPress={() => selectVoice(voice.id)}
                  style={styles.voiceContent}
                >
                  <View
                    style={[
                      styles.avatar,
                      { backgroundColor: `${accentColor}22` },
                    ]}
                  >
                    <Text style={[styles.avatarText, { color: accentColor }]}>
                      {voice.initials}
                    </Text>
                  </View>

                  <View style={styles.voiceDetails}>
                    <Text style={styles.voiceName}>{voice.name}</Text>
                    <Text style={styles.voiceDescription}>{voice.description}</Text>
                    <View style={styles.languageRow}>
                      <Ionicons
                        color={theme.colors.textSecondary}
                        name="language-outline"
                        size={14}
                      />
                      <Text style={styles.languageText}>{voice.language}</Text>
                    </View>
                  </View>

                  {selected ? (
                    <View style={styles.selectedMark}>
                      <Ionicons
                        color={theme.colors.textInverse}
                        name="checkmark"
                        size={18}
                      />
                    </View>
                  ) : null}
                </Pressable>

                <View style={styles.previewButton}>
                  <Button
                    loading={isLoading}
                    onPress={() => void previewVoice(voice.id)}
                    size="small"
                    variant="outline"
                  >
                    {isPlaying ? "Pause Preview" : "Preview"}
                  </Button>
                </View>
              </Animated.View>
            );
          })}
        </View>

        <View style={styles.continueButton}>
          <Button
            disabled={!selectedVoice}
            fullWidth
            onPress={() =>
              router.push({
                pathname: "/generating-voice",
                params: { voice: selectedVoice ?? "" },
              })
            }
            size="large"
          >
            Continue
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );

  function createStyles() {
    return StyleSheet.create({
      screen: { flex: 1, backgroundColor: theme.colors.background },
      content: {
        padding: theme.spacing[24],
        paddingBottom: theme.spacing[64],
      },
      headingIcon: {
        alignItems: "center",
        backgroundColor: `${theme.colors.primary}1A`,
        borderRadius: theme.radius.medium,
        height: 52,
        justifyContent: "center",
        width: 52,
      },
      title: {
        color: theme.colors.textPrimary,
        marginTop: theme.spacing[16],
        ...theme.typography.heading,
      },
      subtitle: {
        color: theme.colors.textSecondary,
        marginTop: theme.spacing[8],
        ...theme.typography.body,
      },
      voiceList: { gap: theme.spacing[12], marginTop: theme.spacing[32] },
      voiceCard: {
        backgroundColor: theme.colors.card,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.large,
        borderWidth: 1,
        overflow: "hidden",
      },
      voiceCardSelected: {
        borderColor: theme.colors.primary,
        borderWidth: 2,
        ...theme.shadows.medium,
      },
      voiceContent: {
        alignItems: "center",
        flexDirection: "row",
        padding: theme.spacing[16],
      },
      avatar: {
        alignItems: "center",
        borderRadius: theme.radius.round,
        height: 52,
        justifyContent: "center",
        width: 52,
      },
      avatarText: { fontSize: 15, fontWeight: "800" },
      voiceDetails: { flex: 1, marginLeft: theme.spacing[12] },
      voiceName: { color: theme.colors.textPrimary, ...theme.typography.title },
      voiceDescription: {
        color: theme.colors.textSecondary,
        marginTop: theme.spacing[4],
        ...theme.typography.bodySmall,
      },
      languageRow: {
        alignItems: "center",
        flexDirection: "row",
        marginTop: theme.spacing[8],
      },
      languageText: {
        color: theme.colors.textSecondary,
        marginLeft: theme.spacing[4],
        ...theme.typography.caption,
      },
      selectedMark: {
        alignItems: "center",
        backgroundColor: theme.colors.primary,
        borderRadius: theme.radius.round,
        height: 30,
        justifyContent: "center",
        width: 30,
      },
      previewButton: {
        alignItems: "flex-start",
        borderTopColor: theme.colors.border,
        borderTopWidth: 1,
        paddingHorizontal: theme.spacing[16],
        paddingBottom: theme.spacing[12],
        paddingTop: theme.spacing[12],
      },
      continueButton: { marginTop: theme.spacing[32] },
    });
  }
}
