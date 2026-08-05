import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "../../src/components/Button";
import { Dropdown, type DropdownOption } from "../../src/components/Dropdown";
import { TextInput } from "../../src/components/TextInput";
import { promptService } from "../../src/services/ai/promptService";
import { creditService } from "../../src/services/credits/creditService";
import { useTheme } from "../../src/theme";

const languageOptions: DropdownOption[] = [
  { label: "English", value: "en" },
  { label: "Hindi", value: "hi" },
  { label: "Spanish", value: "es" },
  { label: "French", value: "fr" },
];

const characterOptions: DropdownOption[] = [
  { label: "No character", value: "none" },
  { label: "Studio Presenter", value: "presenter" },
  { label: "Creative Narrator", value: "narrator" },
];

const voiceOptions: DropdownOption[] = [
  { label: "Natural Voice", value: "natural" },
  { label: "Energetic Voice", value: "energetic" },
  { label: "Calm Voice", value: "calm" },
];

const styleOptions: DropdownOption[] = [
  { label: "Cinematic", value: "cinematic" },
  { label: "Hyper Real", value: "real" },
  { label: "3D Animation", value: "3d" },
];

const aspectRatioOptions: DropdownOption[] = [
  { label: "9:16 Portrait", value: "9:16" },
  { label: "1:1 Square", value: "1:1" },
  { label: "16:9 Landscape", value: "16:9" },
];

const durationOptions: DropdownOption[] = [
  { label: "15 seconds", value: "15" },
  { label: "30 seconds", value: "30" },
  { label: "60 seconds", value: "60" },
];

const cameraOptions: DropdownOption[] = [
  { label: "Static", value: "static" },
  { label: "Slow Push In", value: "push" },
  { label: "Orbit", value: "orbit" },
];

const lightingOptions: DropdownOption[] = [
  { label: "Natural", value: "natural" },
  { label: "Golden Hour", value: "golden" },
  { label: "Studio", value: "studio" },
];

const creativityOptions: DropdownOption[] = [
  { label: "Balanced", value: "balanced" },
  { label: "Precise", value: "precise" },
  { label: "Experimental", value: "experimental" },
];

export default function CreateScreen() {
  const router = useRouter();
  const theme = useTheme();
  const styles = createStyles();
  const [story, setStory] = useState("");
  const [language, setLanguage] = useState<string | null>("en");
  const [character, setCharacter] = useState<string | null>("none");
  const [voice, setVoice] = useState<string | null>("natural");
  const [videoStyle, setVideoStyle] = useState<string | null>("cinematic");
  const [aspectRatio, setAspectRatio] = useState<string | null>("9:16");
  const [duration, setDuration] = useState<string | null>("30");
  const [cameraMotion, setCameraMotion] = useState<string | null>("static");
  const [lighting, setLighting] = useState<string | null>("natural");
  const [creativity, setCreativity] = useState<string | null>("balanced");
  const [seed, setSeed] = useState("");
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const handleGenerateImages = async () => {
    const prompt = await promptService.enhancePrompt(story);
    await creditService.deductCredits(18);

    router.push({
      pathname: "/generating-images",
      params: { prompt: prompt.enhancedPrompt },
    });
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.brandMark}>
            <Ionicons
              color={theme.colors.primary}
              name="videocam-outline"
              size={24}
            />
          </View>
          <View style={styles.headerCopy}>
            <Text style={styles.title}>Create Video</Text>
            <Text style={styles.subtitle}>Build your next AI video short.</Text>
          </View>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroArtwork}>
            <Ionicons color={theme.colors.primary} name="play-circle" size={72} />
          </View>
          <Text style={styles.heroLabel}>AI Video Studio</Text>
          <Text style={styles.heroHeadline}>
            Every viral video starts with an idea.{"\n"}
            <Text style={styles.heroAccent}>Yours starts here.</Text>
          </Text>
          <Text style={styles.heroText}>
            Write your story and let AI create stunning videos.
          </Text>
          <View style={styles.heroButton}>
            <Button
              fullWidth
              leftIcon={
                <Ionicons
                  color={theme.colors.textInverse}
                  name="albums-outline"
                  size={18}
                />
              }
            >
              Start with a Template
            </Button>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Your Story</Text>
        <TextInput
          helperText="The more detail you provide, the better the result."
          label="Describe your video idea"
          multiline
          onChangeText={setStory}
          placeholder="Describe your video idea..."
          showCharacterCount
          value={story}
        />

        <Text style={styles.sectionTitle}>Video Settings</Text>
        <View style={styles.settingsStack}>
          <Dropdown
            label="Language"
            onChange={(option) => setLanguage(option?.value ?? null)}
            options={languageOptions}
            value={language}
          />
          <Dropdown
            label="Character"
            onChange={(option) => setCharacter(option?.value ?? null)}
            options={characterOptions}
            value={character}
          />
          <Dropdown
            label="Voice"
            onChange={(option) => setVoice(option?.value ?? null)}
            options={voiceOptions}
            value={voice}
          />
          <Dropdown
            label="Video Style"
            onChange={(option) => setVideoStyle(option?.value ?? null)}
            options={styleOptions}
            value={videoStyle}
          />
          <Dropdown
            label="Aspect Ratio"
            onChange={(option) => setAspectRatio(option?.value ?? null)}
            options={aspectRatioOptions}
            value={aspectRatio}
          />
          <Dropdown
            label="Duration"
            onChange={(option) => setDuration(option?.value ?? null)}
            options={durationOptions}
            value={duration}
          />
        </View>

        <View style={styles.advancedCard}>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ expanded: advancedOpen }}
            onPress={() => setAdvancedOpen((isOpen) => !isOpen)}
            style={styles.advancedHeader}
          >
            <View style={styles.advancedTitleRow}>
              <View style={styles.advancedIcon}>
                <Ionicons color={theme.colors.secondary} name="options-outline" size={20} />
              </View>
              <View>
                <Text style={styles.advancedTitle}>Advanced Settings</Text>
                <Text style={styles.advancedSubtitle}>
                  Fine-tune your generation controls.
                </Text>
              </View>
            </View>
            <Ionicons
              color={theme.colors.textSecondary}
              name={advancedOpen ? "chevron-up" : "chevron-down"}
              size={20}
            />
          </Pressable>

          {advancedOpen ? (
            <View style={styles.advancedBody}>
              <Dropdown
                label="Camera Motion"
                onChange={(option) => setCameraMotion(option?.value ?? null)}
                options={cameraOptions}
                value={cameraMotion}
              />
              <Dropdown
                label="Lighting"
                onChange={(option) => setLighting(option?.value ?? null)}
                options={lightingOptions}
                value={lighting}
              />
              <Dropdown
                label="Creativity"
                onChange={(option) => setCreativity(option?.value ?? null)}
                options={creativityOptions}
                value={creativity}
              />
              <TextInput
                label="Seed"
                onChangeText={setSeed}
                placeholder="Optional seed value"
                value={seed}
              />
            </View>
          ) : null}
        </View>

        <Text style={styles.sectionTitle}>Generate</Text>
        <View style={styles.creditsCard}>
          <View style={styles.creditsIcon}>
            <Ionicons color={theme.colors.warning} name="flash" size={22} />
          </View>
          <View style={styles.creditsCopy}>
            <Text style={styles.creditsTitle}>Estimated Credits</Text>
            <Text style={styles.creditsSubtitle}>
              Based on your current video settings.
            </Text>
          </View>
          <Text style={styles.creditsValue}>18</Text>
        </View>

        <View style={styles.generateActions}>
          <Button
            fullWidth
            leftIcon={
              <Ionicons
                color={theme.colors.textInverse}
                name="sparkles"
                size={18}
              />
            }
            size="large"
          >
            Generate AI Video
          </Button>
          <Button
            fullWidth
            onPress={() => void handleGenerateImages()}
            size="large"
            variant="outline"
          >
            Generate Images
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );

  function createStyles() {
    return StyleSheet.create({
      screen: {
        flex: 1,
        backgroundColor: theme.colors.background,
      },
      content: {
        padding: theme.spacing[24],
        paddingBottom: theme.spacing[64],
      },
      header: {
        alignItems: "center",
        flexDirection: "row",
      },
      brandMark: {
        alignItems: "center",
        backgroundColor: `${theme.colors.primary}1A`,
        borderRadius: theme.radius.medium,
        height: 48,
        justifyContent: "center",
        width: 48,
      },
      headerCopy: {
        marginLeft: theme.spacing[12],
      },
      title: {
        color: theme.colors.textPrimary,
        ...theme.typography.heading,
      },
      subtitle: {
        color: theme.colors.textSecondary,
        marginTop: theme.spacing[4],
        ...theme.typography.bodySmall,
      },
      heroCard: {
        backgroundColor: theme.colors.card,
        borderColor: theme.colors.primary,
        borderRadius: theme.radius.xl,
        borderWidth: 1,
        marginTop: theme.spacing[24],
        padding: theme.spacing[20],
        ...theme.shadows.medium,
      },
      heroArtwork: {
        alignItems: "center",
        alignSelf: "flex-end",
        backgroundColor: `${theme.colors.primary}12`,
        borderRadius: theme.radius.round,
        height: 84,
        justifyContent: "center",
        marginBottom: -theme.spacing[16],
        marginTop: -theme.spacing[8],
        width: 84,
      },
      heroLabel: {
        color: theme.colors.textPrimary,
        ...theme.typography.title,
      },
      heroHeadline: {
        color: theme.colors.textPrimary,
        fontSize: 26,
        fontWeight: "800",
        letterSpacing: -0.4,
        lineHeight: 33,
        marginTop: theme.spacing[12],
      },
      heroAccent: {
        color: theme.colors.primary,
      },
      heroText: {
        color: theme.colors.textSecondary,
        marginTop: theme.spacing[12],
        ...theme.typography.body,
      },
      heroButton: {
        marginTop: theme.spacing[20],
      },
      sectionTitle: {
        color: theme.colors.textPrimary,
        marginBottom: theme.spacing[12],
        marginTop: theme.spacing[32],
        ...theme.typography.title,
      },
      settingsStack: {
        gap: theme.spacing[16],
      },
      advancedCard: {
        backgroundColor: theme.colors.card,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.large,
        borderWidth: 1,
        marginTop: theme.spacing[32],
        overflow: "hidden",
      },
      advancedHeader: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
        padding: theme.spacing[16],
      },
      advancedTitleRow: {
        alignItems: "center",
        flexDirection: "row",
        flex: 1,
      },
      advancedIcon: {
        alignItems: "center",
        backgroundColor: `${theme.colors.secondary}1A`,
        borderRadius: theme.radius.medium,
        height: 40,
        justifyContent: "center",
        marginRight: theme.spacing[12],
        width: 40,
      },
      advancedTitle: {
        color: theme.colors.textPrimary,
        ...theme.typography.body,
        fontWeight: "700",
      },
      advancedSubtitle: {
        color: theme.colors.textSecondary,
        marginTop: theme.spacing[4],
        ...theme.typography.caption,
      },
      advancedBody: {
        borderTopColor: theme.colors.border,
        borderTopWidth: 1,
        gap: theme.spacing[16],
        padding: theme.spacing[16],
      },
      creditsCard: {
        alignItems: "center",
        backgroundColor: theme.colors.card,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.large,
        borderWidth: 1,
        flexDirection: "row",
        padding: theme.spacing[16],
      },
      creditsIcon: {
        alignItems: "center",
        backgroundColor: `${theme.colors.warning}1A`,
        borderRadius: theme.radius.medium,
        height: 44,
        justifyContent: "center",
        width: 44,
      },
      creditsCopy: {
        flex: 1,
        marginLeft: theme.spacing[12],
      },
      creditsTitle: {
        color: theme.colors.textPrimary,
        ...theme.typography.body,
        fontWeight: "700",
      },
      creditsSubtitle: {
        color: theme.colors.textSecondary,
        marginTop: theme.spacing[4],
        ...theme.typography.caption,
      },
      creditsValue: {
        color: theme.colors.warning,
        ...theme.typography.title,
      },
      generateActions: {
        gap: theme.spacing[12],
        marginTop: theme.spacing[16],
      },
    });
  }
}
