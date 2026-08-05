import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "../src/components/Button";
import { Dropdown, type DropdownOption } from "../src/components/Dropdown";
import { TextInput } from "../src/components/TextInput";
import { ThemeProvider, useTheme } from "../src/theme";

const languageOptions: DropdownOption[] = [
  { label: "English", value: "en" },
  { label: "Hindi", value: "hi" },
  { label: "Spanish", value: "es" },
  { label: "French", value: "fr" },
  { label: "German", value: "de" },
  { label: "Italian", value: "it" },
  { label: "Portuguese", value: "pt" },
  { label: "Japanese", value: "ja" },
  { label: "Chinese", value: "zh" },
  { label: "Korean", value: "ko" },
];

function ComponentShowcaseContent() {
  const theme = useTheme();
  const styles = createStyles();
  const [normalInput, setNormalInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [multilineInput, setMultilineInput] = useState("");
  const [errorInput, setErrorInput] = useState("AI");
  const [successInput, setSuccessInput] = useState("Shivora");
  const [language, setLanguage] = useState<string | null>(null);
  const [searchableLanguage, setSearchableLanguage] = useState<string | null>(
    null,
  );
  const [captionLanguage, setCaptionLanguage] = useState<string | null>("en");

  return (
    <SafeAreaView edges={["top"]} style={styles.screen}>
      <Stack.Screen options={{ title: "Button Showcase" }} />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.pageTitle}>Button Showcase</Text>
        <Text style={styles.pageSubtitle}>
          Development testing for Button variants, states, and sizes.
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Primary</Text>
          <Button>Primary Button</Button>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Secondary</Text>
          <Button variant="secondary">Secondary Button</Button>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Outline</Text>
          <Button variant="outline">Outline Button</Button>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ghost</Text>
          <Button variant="ghost">Ghost Button</Button>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Danger</Text>
          <Button variant="danger">Danger Button</Button>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Loading</Text>
          <Button loading>Loading Button</Button>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Disabled</Text>
          <Button disabled>Disabled Button</Button>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Small</Text>
          <Button size="small">Small Button</Button>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Medium</Text>
          <Button size="medium">Medium Button</Button>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Large</Text>
          <Button size="large">Large Button</Button>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Full Width</Text>
          <Button fullWidth>Full Width Button</Button>
        </View>

        <View style={styles.componentSection}>
          <Text style={styles.componentSectionTitle}>Text Inputs</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Normal Input</Text>
            <TextInput
              label="Project Title"
              onChangeText={setNormalInput}
              placeholder="Enter a project title"
              value={normalInput}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Password Input</Text>
            <TextInput
              label="Password"
              onChangeText={setPasswordInput}
              passwordToggle
              placeholder="Enter your password"
              secureTextEntry
              value={passwordInput}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Multiline Input</Text>
            <TextInput
              label="Video Prompt"
              multiline
              onChangeText={setMultilineInput}
              placeholder="Describe the video you want to create"
              showCharacterCount
              value={multilineInput}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Error Input</Text>
            <TextInput
              errorText="Project names must contain at least 3 characters."
              label="Project Title"
              onChangeText={setErrorInput}
              value={errorInput}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Success Input</Text>
            <TextInput
              label="Project Title"
              onChangeText={setSuccessInput}
              successText="This project name is available."
              value={successInput}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Disabled Input</Text>
            <TextInput
              disabled
              label="Workspace"
              value="Shivora"
            />
          </View>
        </View>

        <View style={styles.componentSection}>
          <Text style={styles.componentSectionTitle}>Dropdowns</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Normal Dropdown</Text>
            <Dropdown
              label="Language"
              onChange={(option) => setLanguage(option?.value ?? null)}
              options={languageOptions}
              placeholder="Select a language"
              value={language}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Searchable Dropdown</Text>
            <Dropdown
              label="Language"
              onChange={(option) =>
                setSearchableLanguage(option?.value ?? null)
              }
              options={languageOptions}
              placeholder="Search languages"
              searchable
              value={searchableLanguage}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Disabled Dropdown</Text>
            <Dropdown
              disabled
              label="Language"
              options={languageOptions}
              placeholder="Unavailable"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Loading Dropdown</Text>
            <Dropdown
              label="Language"
              loading
              options={languageOptions}
              placeholder="Loading languages"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dropdown with Helper Text</Text>
            <Dropdown
              clearable
              helperText="Choose the primary language for generated captions."
              label="Caption Language"
              onChange={(option) => setCaptionLanguage(option?.value ?? null)}
              options={languageOptions}
              placeholder="Select a caption language"
              value={captionLanguage}
            />
          </View>
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
      pageTitle: {
        color: theme.colors.textPrimary,
        ...theme.typography.heading,
      },
      pageSubtitle: {
        color: theme.colors.textSecondary,
        marginTop: theme.spacing[8],
        ...theme.typography.body,
      },
      section: {
        gap: theme.spacing[12],
        marginTop: theme.spacing[32],
      },
      componentSection: {
        marginTop: theme.spacing[48],
      },
      componentSectionTitle: {
        color: theme.colors.primary,
        fontSize: 13,
        fontWeight: "800",
        letterSpacing: 1.2,
      },
      sectionTitle: {
        color: theme.colors.textPrimary,
        ...theme.typography.title,
      },
    });
  }
}

export default function ComponentShowcaseScreen() {
  return (
    <ThemeProvider>
      <ComponentShowcaseContent />
    </ThemeProvider>
  );
}
