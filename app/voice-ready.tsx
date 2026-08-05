import { useEffect, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "../src/components/Button";
import { voiceService, type VoiceProfile } from "../src/services/ai/voiceService";
import { useTheme } from "../src/theme";

export default function VoiceReadyScreen() {
  const router = useRouter();
  const { voice } = useLocalSearchParams<{ voice?: string }>();
  const theme = useTheme();
  const styles = createStyles();
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<VoiceProfile | null>(null);
  const playbackRequestId = useRef(0);

  useEffect(() => {
    let isMounted = true;

    const loadVoice = async () => {
      const voiceProfile = await voiceService.getVoiceById(voice ?? "emma");

      if (isMounted) {
        setSelectedVoice(voiceProfile);
      }
    };

    void loadVoice();

    return () => {
      isMounted = false;
      playbackRequestId.current += 1;
    };
  }, [voice]);

  const togglePlayback = async () => {
    if (isPlaying) {
      playbackRequestId.current += 1;
      setIsPlaying(false);
      return;
    }

    const requestId = playbackRequestId.current + 1;
    playbackRequestId.current = requestId;
    setIsPlaying(true);
    await voiceService.playPreview(selectedVoice?.id ?? voice ?? "emma");

    if (playbackRequestId.current === requestId) {
      setIsPlaying(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        <View style={styles.successIcon}>
          <Ionicons color={theme.colors.textInverse} name="checkmark" size={34} />
        </View>
        <Text style={styles.title}>Voice Ready</Text>
        <Text style={styles.subtitle}>
          Your narration track is ready to bring the story to life.
        </Text>

        <View style={styles.voiceCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(selectedVoice?.initials ?? "EM").toUpperCase()}
            </Text>
          </View>
          <View style={styles.voiceCopy}>
            <Text style={styles.voiceLabel}>SELECTED VOICE</Text>
            <Text style={styles.voiceName}>{selectedVoice?.name ?? "Emma"}</Text>
          </View>
          <Text style={styles.duration}>00:14</Text>
        </View>

        <Pressable
          accessibilityLabel={isPlaying ? "Pause voice preview" : "Play voice preview"}
          accessibilityRole="button"
          onPress={() => void togglePlayback()}
          style={styles.player}
        >
          <View style={styles.playButton}>
            <Ionicons
              color={theme.colors.textInverse}
              name={isPlaying ? "pause" : "play"}
              size={20}
            />
          </View>
          <View style={styles.waveform}>
            {[18, 30, 22, 38, 26, 34, 20, 30].map((height, index) => (
              <Animated.View
                key={`${height}-${index}`}
                style={[styles.waveBar, { height }]}
              />
            ))}
          </View>
          <Text style={styles.playText}>{isPlaying ? "Playing" : "Play"}</Text>
        </Pressable>

        <View style={styles.continueButton}>
          <Button
            fullWidth
            onPress={() => router.push("/video-generation")}
            size="large"
          >
            Continue
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );

  function createStyles() {
    return StyleSheet.create({
      screen: { flex: 1, backgroundColor: theme.colors.background },
      content: {
        alignItems: "center",
        flex: 1,
        justifyContent: "center",
        padding: theme.spacing[24],
      },
      successIcon: {
        alignItems: "center",
        backgroundColor: theme.colors.success,
        borderRadius: theme.radius.round,
        height: 76,
        justifyContent: "center",
        width: 76,
      },
      title: {
        color: theme.colors.textPrimary,
        marginTop: theme.spacing[24],
        ...theme.typography.heading,
      },
      subtitle: {
        color: theme.colors.textSecondary,
        marginTop: theme.spacing[12],
        textAlign: "center",
        ...theme.typography.body,
      },
      voiceCard: {
        alignItems: "center",
        alignSelf: "stretch",
        backgroundColor: theme.colors.card,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.large,
        borderWidth: 1,
        flexDirection: "row",
        marginTop: theme.spacing[32],
        padding: theme.spacing[16],
      },
      avatar: {
        alignItems: "center",
        backgroundColor: `${theme.colors.primary}22`,
        borderRadius: theme.radius.round,
        height: 48,
        justifyContent: "center",
        width: 48,
      },
      avatarText: { color: theme.colors.primary, fontWeight: "800" },
      voiceCopy: { flex: 1, marginLeft: theme.spacing[12] },
      voiceLabel: { color: theme.colors.textSecondary, ...theme.typography.caption },
      voiceName: {
        color: theme.colors.textPrimary,
        marginTop: theme.spacing[4],
        ...theme.typography.title,
      },
      duration: { color: theme.colors.primary, ...theme.typography.body },
      player: {
        alignItems: "center",
        alignSelf: "stretch",
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.large,
        borderWidth: 1,
        flexDirection: "row",
        marginTop: theme.spacing[16],
        padding: theme.spacing[16],
      },
      playButton: {
        alignItems: "center",
        backgroundColor: theme.colors.primary,
        borderRadius: theme.radius.round,
        height: 42,
        justifyContent: "center",
        width: 42,
      },
      waveform: {
        alignItems: "center",
        flex: 1,
        flexDirection: "row",
        gap: theme.spacing[4],
        justifyContent: "center",
        marginHorizontal: theme.spacing[12],
      },
      waveBar: { backgroundColor: theme.colors.primary, borderRadius: theme.radius.round, width: 3 },
      playText: { color: theme.colors.textSecondary, ...theme.typography.caption },
      continueButton: { alignSelf: "stretch", marginTop: theme.spacing[24] },
    });
  }
}
