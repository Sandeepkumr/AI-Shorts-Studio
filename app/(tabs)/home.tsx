import { useEffect, useState, type ComponentProps } from "react";
import { ScrollView, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "../../src/components/Button";
import {
  projectService,
  type Project,
} from "../../src/services/project/projectService";
import { creditService } from "../../src/services/credits/creditService";
import { useTheme } from "../../src/theme";

type IoniconName = ComponentProps<typeof Ionicons>["name"];
type Accent = "primary" | "secondary" | "success" | "warning";

const projectArtwork: Record<Project["artwork"], IoniconName> = {
  travel: "trail-sign",
  space: "planet",
  product: "cube",
};

const shortcuts: Array<{
  title: string;
  icon: IoniconName;
  accent: Accent;
}> = [
  { title: "New Video", icon: "add-circle-outline", accent: "primary" },
  { title: "Templates", icon: "grid-outline", accent: "secondary" },
  { title: "Characters", icon: "people-outline", accent: "primary" },
  { title: "Projects", icon: "folder-open-outline", accent: "warning" },
  { title: "AI Tools", icon: "sparkles-outline", accent: "secondary" },
];

export default function HomeScreen() {
  const theme = useTheme();
  const styles = createStyles();
  const [projects, setProjects] = useState<Project[]>([]);
  const [remainingCredits, setRemainingCredits] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadDashboardData = async () => {
      const [savedProjects, credits] = await Promise.all([
        projectService.getProjects(),
        creditService.getRemainingCredits(),
      ]);

      if (isMounted) {
        setProjects(savedProjects);
        setRemainingCredits(credits.remainingCredits);
      }
    };

    void loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  const accentColors: Record<Accent, string> = {
    primary: theme.colors.primary,
    secondary: theme.colors.secondary,
    success: theme.colors.success,
    warning: theme.colors.warning,
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.brandRow}>
          <Text style={styles.brand}>Shivora</Text>
          <View style={styles.creditsBadge}>
            <Ionicons color={theme.colors.warning} name="flash" size={18} />
            <Text style={styles.creditsText}>
              {remainingCredits === null ? "Credits" : `${remainingCredits} Credits`}
            </Text>
          </View>
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>Welcome back 👋</Text>
          <Text style={styles.subtitle}>
            Your AI video workspace is ready for the next idea.
          </Text>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroIconTile}>
              <Ionicons
                color={theme.colors.primary}
                name="videocam-outline"
                size={32}
              />
            </View>
            <View style={styles.heroArtwork}>
              <Ionicons
                color={theme.colors.primary}
                name="play-circle"
                size={76}
              />
            </View>
          </View>

          <Text style={styles.heroLabel}>Shivora</Text>
          <Text style={styles.heroHeadline}>
            Every viral video starts with an idea.{"\n"}
            <Text style={styles.heroHeadlineAccent}>Yours starts here.</Text>
          </Text>
          <Text style={styles.heroDescription}>
            Create stories that move.
          </Text>

          <View style={styles.heroButton}>
            <Button
              fullWidth
              leftIcon={
                <Ionicons
                  color={theme.colors.textInverse}
                  name="sparkles"
                  size={18}
                />
              }
            >
              Start Creating
            </Button>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Continue Creating</Text>
          <Pressable accessibilityRole="button" style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>View All</Text>
            <Ionicons
              color={theme.colors.primary}
              name="chevron-forward"
              size={18}
            />
          </Pressable>
        </View>

        <View style={styles.projectsList}>
          {projects.map((project) => {
            const accentColor = accentColors[project.accent];

            return (
              <View key={project.title} style={styles.projectCard}>
                <View
                  style={[
                    styles.thumbnail,
                    { backgroundColor: `${accentColor}24` },
                  ]}
                >
                  <Ionicons
                    color={accentColor}
                    name={projectArtwork[project.artwork]}
                    size={30}
                  />
                </View>

                <View style={styles.projectDetails}>
                  <Text numberOfLines={1} style={styles.projectTitle}>
                    {project.title}
                  </Text>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: `${accentColor}16`,
                        borderColor: accentColor,
                      },
                    ]}
                  >
                    <Text style={[styles.statusText, { color: accentColor }]}>
                      {project.status}
                    </Text>
                  </View>
                  <Text style={styles.lastEdited}>{project.editedAt}</Text>
                </View>

                <Pressable
                  accessibilityLabel={`${project.action} ${project.title}`}
                  accessibilityRole="button"
                  style={styles.projectAction}
                >
                  <Text style={[styles.projectActionText, { color: accentColor }]}>
                    {project.action}
                  </Text>
                </Pressable>
              </View>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>Quick Start</Text>
        <ScrollView
          contentContainerStyle={styles.shortcutsContent}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {shortcuts.map((shortcut) => {
            const accentColor = accentColors[shortcut.accent];

            return (
              <Pressable
                key={shortcut.title}
                accessibilityLabel={shortcut.title}
                accessibilityRole="button"
                style={styles.shortcutCard}
              >
                <Ionicons color={accentColor} name={shortcut.icon} size={30} />
                <Text style={styles.shortcutTitle}>{shortcut.title}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
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
      brandRow: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
      },
      brand: {
        color: theme.colors.textPrimary,
        ...theme.typography.title,
      },
      creditsBadge: {
        alignItems: "center",
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.round,
        borderWidth: 1,
        flexDirection: "row",
        paddingHorizontal: theme.spacing[12],
        paddingVertical: theme.spacing[8],
      },
      creditsText: {
        color: theme.colors.textPrimary,
        marginLeft: theme.spacing[4],
        ...theme.typography.caption,
      },
      header: {
        marginTop: theme.spacing[32],
      },
      title: {
        color: theme.colors.textPrimary,
        ...theme.typography.heading,
      },
      subtitle: {
        color: theme.colors.textSecondary,
        marginTop: theme.spacing[8],
        maxWidth: 340,
        ...theme.typography.body,
      },
      heroCard: {
        backgroundColor: theme.colors.card,
        borderColor: theme.colors.primary,
        borderRadius: theme.radius.xl,
        borderWidth: 1,
        marginTop: theme.spacing[24],
        overflow: "hidden",
        padding: theme.spacing[20],
        ...theme.shadows.medium,
      },
      heroTopRow: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
      },
      heroIconTile: {
        alignItems: "center",
        backgroundColor: `${theme.colors.primary}1A`,
        borderRadius: theme.radius.large,
        height: 64,
        justifyContent: "center",
        width: 64,
      },
      heroArtwork: {
        alignItems: "center",
        backgroundColor: `${theme.colors.primary}12`,
        borderRadius: theme.radius.round,
        height: 92,
        justifyContent: "center",
        width: 92,
      },
      heroLabel: {
        color: theme.colors.textPrimary,
        marginTop: theme.spacing[16],
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
      heroHeadlineAccent: {
        color: theme.colors.primary,
      },
      heroDescription: {
        color: theme.colors.textSecondary,
        marginTop: theme.spacing[12],
        ...theme.typography.body,
      },
      heroButton: {
        marginTop: theme.spacing[20],
      },
      sectionHeader: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: theme.spacing[12],
        marginTop: theme.spacing[32],
      },
      sectionTitle: {
        color: theme.colors.textPrimary,
        marginBottom: theme.spacing[12],
        marginTop: theme.spacing[32],
        ...theme.typography.title,
      },
      viewAllButton: {
        alignItems: "center",
        flexDirection: "row",
      },
      viewAllText: {
        color: theme.colors.primary,
        marginRight: theme.spacing[4],
        ...theme.typography.bodySmall,
      },
      projectsList: {
        gap: theme.spacing[8],
      },
      projectCard: {
        alignItems: "center",
        backgroundColor: theme.colors.card,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.large,
        borderWidth: 1,
        flexDirection: "row",
        minHeight: 112,
        padding: theme.spacing[12],
      },
      thumbnail: {
        alignItems: "center",
        borderRadius: theme.radius.medium,
        height: 72,
        justifyContent: "center",
        width: 72,
      },
      projectDetails: {
        flex: 1,
        marginLeft: theme.spacing[12],
        minWidth: 0,
      },
      projectTitle: {
        color: theme.colors.textPrimary,
        ...theme.typography.body,
        fontWeight: "700",
      },
      statusBadge: {
        alignSelf: "flex-start",
        borderRadius: theme.radius.small,
        borderWidth: 1,
        marginTop: theme.spacing[8],
        paddingHorizontal: theme.spacing[8],
        paddingVertical: theme.spacing[4],
      },
      statusText: {
        ...theme.typography.caption,
      },
      lastEdited: {
        color: theme.colors.textSecondary,
        marginTop: theme.spacing[8],
        ...theme.typography.caption,
      },
      projectAction: {
        alignItems: "center",
        borderColor: theme.colors.border,
        borderRadius: theme.radius.medium,
        borderWidth: 1,
        marginLeft: theme.spacing[8],
        paddingHorizontal: theme.spacing[8],
        paddingVertical: theme.spacing[8],
      },
      projectActionText: {
        fontSize: 12,
        fontWeight: "700",
        textAlign: "center",
      },
      shortcutsContent: {
        gap: theme.spacing[12],
        paddingRight: theme.spacing[24],
      },
      shortcutCard: {
        alignItems: "center",
        backgroundColor: theme.colors.card,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.large,
        borderWidth: 1,
        height: 122,
        justifyContent: "center",
        width: 116,
      },
      shortcutTitle: {
        color: theme.colors.textPrimary,
        marginTop: theme.spacing[12],
        textAlign: "center",
        ...theme.typography.bodySmall,
      },
    });
  }
}
