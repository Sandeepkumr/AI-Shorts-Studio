import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { VideoView, useVideoPlayer } from "expo-video";
import * as VideoThumbnails from "expo-video-thumbnails";
import * as MediaLibrary from "expo-media-library";
import * as FileSystem from "expo-file-system/legacy";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import { projectStore } from "../src/services/projectStore";

/*
 * ============================================================
 * MY PROJECTS
 * ============================================================
 *
 * File:
 *   app/projects.tsx
 *
 * Features:
 *   - Back button
 *   - Credit balance
 *   - Search
 *   - Quick filters
 *   - Completed / Processing / Draft statuses
 *   - Favorites
 *   - Text to Video / Image to Video badges
 *   - Project overflow actions
 *   - Scrollable project list
 *   - Fixed "Create New Video" CTA
 *   - Responsive sizing based on existing Shivora screens
 *
 * Demo thumbnail assets:
 *   ../assets/project-alex-burger.png
 *   ../assets/project-vamika-feather.png
 *   ../assets/project-nature-cinematic.png
 *   ../assets/project-aria-space.png
 *   ../assets/project-elder-leo.png
 *
 * Existing fallback assets project1.png/project2.png/project3.png
 * are intentionally not used when the five new assets exist.
 * ============================================================
 */

const ASSETS = {
  coin: require("../assets/coin.png"),
  alexBurger: require("../assets/project-alex-burger.png"),
  vamikaFeather: require("../assets/project-vamika-feather.png"),
  natureCinematic: require("../assets/project-nature-cinematic.png"),
  ariaSpace: require("../assets/project-aria-space.png"),
  elderLeo: require("../assets/project-elder-leo.png"),
};

const COLORS = {
  background: "#020A10",
  surface: "#071A24",
  surfaceAlt: "#061822",
  text: "#F6F8FA",
  secondary: "#B3C1C8",
  muted: "#84959E",

  cyan: "#08D8D1",
  cyanBright: "#00E7DF",
  cyanBorder: "#00D8D0",
  border: "#123E4D",

  purple: "#B05CFF",
  purpleBright: "#C777FF",
  purpleSurface: "#180B31",
  purpleBorder: "#7E35D5",

  green: "#25D98A",
  greenSurface: "#092C24",

  processing: "#2CA8FF",
  processingSurface: "#08263A",

  draft: "#FFB14A",
  draftSurface: "#33230F",

  danger: "#FF5C68",
};

type ProjectType = "Text to Video" | "Image to Video";
type ProjectStatus = "Completed" | "Processing" | "Draft";

type Project = {
  id: string;
  title: string;
  type: ProjectType;
  duration: string;
  date: string;
  status: ProjectStatus;
  favorite: boolean;
  image: any;
  thumbnailUrl?: string;
  videoUrl?: string;
  ratio?: string;
  style?: string;
  language?: string;
  voice?: string;
  resolution?: string;
};

type Filter = "All" | ProjectType | "Favorites";

type MoreMenuState = {
  visible: boolean;
  project: Project | null;
};


const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  "http://192.168.31.189:4000";

const resolveProjectUrl = (
  value?: string,
): string => {
  const trimmed = value?.trim();

  if (!trimmed) {
    return "";
  }

  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://")
  ) {
    return trimmed;
  }

  return `${API_BASE_URL.replace(/\/+$/, "")}/${trimmed.replace(/^\/+/, "")}`;
};

const buildProjectThumbnail = async (
  videoUrl?: string,
): Promise<string | undefined> => {
  const resolvedVideoUrl =
    resolveProjectUrl(videoUrl);

  if (!resolvedVideoUrl) {
    return undefined;
  }

  try {
    const result =
      await VideoThumbnails.getThumbnailAsync(
        resolvedVideoUrl,
        {
          time: 0,
        },
      );

    return result.uri;
  } catch (error) {
    console.warn(
      "[PROJECTS] Failed to generate video thumbnail:",
      error,
    );

    return undefined;
  }
};

type FullScreenVideoModalProps = {
  project: Project | null;
  onClose: () => void;
};

function FullScreenVideoModal({
  project,
  onClose,
}: FullScreenVideoModalProps) {
  const videoUrl =
    resolveProjectUrl(
      project?.videoUrl,
    );

  const player =
    useVideoPlayer(
      videoUrl || null,
      (videoPlayer) => {
        videoPlayer.loop = false;

        if (videoUrl) {
          videoPlayer.play();
        }
      },
    );

  const [isSaving, setIsSaving] =
    useState(false);

  const saveToGallery =
    useCallback(async () => {
      if (!videoUrl) {
        Alert.alert(
          "Video unavailable",
          "This project does not have a playable video file.",
        );
        return;
      }

      try {
        setIsSaving(true);

        const permission =
          await MediaLibrary.requestPermissionsAsync();

        if (
          !permission.granted
        ) {
          Alert.alert(
            "Permission required",
            "Please allow Photos/Gallery access to save the video.",
          );
          return;
        }

        const fileName =
          `${project?.id || "shivora-video"}-${Date.now()}.mp4`;

        const targetUri =
          `${FileSystem.cacheDirectory}${fileName}`;

        const downloadResult =
          await FileSystem.downloadAsync(
            videoUrl,
            targetUri,
          );

        if (
          downloadResult.status !== 200
        ) {
          throw new Error(
            `Video download failed with status ${downloadResult.status}.`,
          );
        }

        await MediaLibrary.createAssetAsync(
          downloadResult.uri,
        );

        Alert.alert(
          "Saved",
          "Video saved to your gallery.",
        );
      } catch (error) {
        console.error(
          "[PROJECTS] Failed to save video to gallery:",
          error,
        );

        const errorMessage =
          error instanceof Error
            ? error.message
            : String(error);

        console.error(
          "[PROJECTS] Save error details:",
          errorMessage,
        );

        Alert.alert(
          "Save failed",
          `We couldn't save this video to your gallery.\n\n${errorMessage}`,
        );
      } finally {
        setIsSaving(false);
      }
    }, [
      project?.id,
      videoUrl,
    ]);

  if (!project) {
    return null;
  }

  return (
    <Modal
      visible={project !== null}
      animationType="slide"
      presentationStyle="fullScreen"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View
        style={
          styles.videoModalRoot
        }
      >
        <StatusBar
          barStyle="light-content"
          backgroundColor="#000000"
        />

        <View
          style={
            styles.videoModalHeader
          }
        >
          <Pressable
            onPress={onClose}
            hitSlop={10}
            style={
              styles.videoModalClose
            }
            accessibilityRole="button"
            accessibilityLabel="Close video player"
          >
            <Ionicons
              name="chevron-back"
              size={30}
              color="#FFFFFF"
            />
          </Pressable>

          <Text
            style={
              styles.videoModalTitle
            }
            numberOfLines={1}
          >
            {project.title}
          </Text>

          <Pressable
            onPress={saveToGallery}
            hitSlop={10}
            style={
              styles.videoModalSave
            }
            accessibilityRole="button"
            accessibilityLabel="Save video to gallery"
          >
            {isSaving ? (
              <ActivityIndicator
                size="small"
                color="#FFFFFF"
              />
            ) : (
              <Ionicons
                name="download-outline"
                size={24}
                color="#FFFFFF"
              />
            )}
          </Pressable>
        </View>

        <View
          style={
            styles.videoModalPlayerWrap
          }
        >
          {videoUrl ? (
            <VideoView
              player={player}
              style={
                styles.videoModalPlayer
              }
              nativeControls
              contentFit="contain"
              fullscreenOptions={{ enable: true }}
              allowsPictureInPicture
            />
          ) : (
            <View
              style={
                styles.videoModalEmpty
              }
            >
              <Ionicons
                name="videocam-off-outline"
                size={48}
                color={COLORS.secondary}
              />
              <Text
                style={
                  styles.videoModalEmptyText
                }
              >
                Video unavailable
              </Text>
            </View>
          )}
        </View>

        <View
          style={
            styles.videoModalFooter
          }
        >
          <Text
            style={
              styles.videoModalFooterText
            }
          >
            {project.type} •{" "}
            {project.duration}
          </Text>
        </View>
      </View>
    </Modal>
  );
}

export default function ProjectsScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const isSmall = width <= 375;
  const isLarge = width >= 430;
  const horizontalPadding = isSmall ? 18 : isLarge ? 27 : 22;

  const [projects, setProjects] =
    useState<Project[]>([]);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const loadSavedProjects = async () => {
        try {
          const saved =
            await projectStore.getProjects();

          if (!active) {
            return;
          }

          const savedProjects: Project[] =
            await Promise.all(
              saved.map(
                async (project) => {
                  const thumbnailUrl =
                    await buildProjectThumbnail(
                      project.videoUrl,
                    );

                  return {
                    id: project.id,
                    title: project.title,
                    type: project.type,
                    duration: project.duration,
                    date: project.date,
                    status: "Completed",
                    favorite: Boolean(
                      project.favorite,
                    ),
                    image:
                      thumbnailUrl
                        ? {
                            uri: thumbnailUrl,
                          }
                        : ASSETS.vamikaFeather,
                    thumbnailUrl,
                    videoUrl:
                      project.videoUrl,
                    ratio:
                      project.ratio,
                    style:
                      project.style,
                    language:
                      project.language,
                    voice:
                      project.voice,
                    resolution:
                      project.resolution,
                  };
                },
              ),
            );

          const savedIds =
            new Set(
              savedProjects.map(
                (project) =>
                  project.id,
              ),
            );

          setProjects((current) => [
            ...savedProjects,
            ...current.filter(
              (project) =>
                !savedIds.has(
                  project.id,
                ),
            ),
          ]);
        } catch (error) {
          console.error(
            "[PROJECTS] Failed to load saved projects:",
            error,
          );
        }
      };

      void loadSavedProjects();

      return () => {
        active = false;
      };
    }, []),
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] =
    useState<Filter>("All");
  const [menu, setMenu] = useState<MoreMenuState>({
    visible: false,
    project: null,
  });
  const [detailsProject, setDetailsProject] =
    useState<Project | null>(null);

  const [playingProject, setPlayingProject] =
    useState<Project | null>(null);

  const filteredProjects = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return projects.filter((project) => {
      const matchesQuery =
        !query ||
        project.title.toLowerCase().includes(query) ||
        project.type.toLowerCase().includes(query) ||
        project.status.toLowerCase().includes(query);

      const matchesFilter =
        activeFilter === "All"
          ? true
          : activeFilter === "Favorites"
          ? project.favorite
          : project.type === activeFilter;

      return matchesQuery && matchesFilter;
    });
  }, [projects, searchQuery, activeFilter]);

  const countForFilter = (filter: Filter) => {
    if (filter === "All") return projects.length;
    if (filter === "Favorites") {
      return projects.filter((project) => project.favorite).length;
    }
    return projects.filter((project) => project.type === filter).length;
  };

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/" as any);
    }
  };

  const handleCreateNewVideo = () => {
    router.push("/create-video-screen-t2v");
  };

  const toggleFavorite = async (
    id: string,
  ) => {
    setProjects((current) =>
      current.map((project) =>
        project.id === id
          ? {
              ...project,
              favorite:
                !project.favorite,
            }
          : project,
      ),
    );

    const project =
      projects.find(
        (item) =>
          item.id === id,
      );

    if (project?.videoUrl) {
      try {
        await projectStore.toggleFavorite(
          id,
        );
      } catch (error) {
        console.error(
          "[PROJECTS] Failed to persist favorite:",
          error,
        );
      }
    }
  };


  const openProject = (
    project: Project,
  ) => {
    setMenu({
      visible: false,
      project: null,
    });

    if (project.videoUrl) {
      setDetailsProject(null);
      setMenu({
        visible: false,
        project: null,
      });
      setPlayingProject(project);
      return;
    }

    if (project.status === "Draft") {
      Alert.alert(
        "Draft Project",
        `Continue working on "${project.title}"?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Continue",
            onPress: () => {},
          },
        ]
      );
      return;
    }

    if (project.status === "Processing") {
      Alert.alert(
        "Video Processing",
        `"${project.title}" is still being generated.`
      );
      return;
    }

    setDetailsProject(project);
  };

  const duplicateProject = (project: Project) => {
    setMenu({ visible: false, project: null });

    const duplicate: Project = {
      ...project,
      id: `${project.id}-${Date.now()}`,
      title: `${project.title} Copy`,
      date: "Just now",
      status: "Draft",
      favorite: false,
    };

    setProjects((current) => [duplicate, ...current]);
  };

  const deleteProject = (project: Project) => {
    setMenu({ visible: false, project: null });

    Alert.alert(
      "Delete Project?",
      `Are you sure you want to delete "${project.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setProjects((current) =>
              current.filter(
                (item) =>
                  item.id !==
                  project.id,
              ),
            );

            if (project.videoUrl) {
              try {
                await projectStore.deleteProject(
                  project.id,
                );
              } catch (error) {
                console.error(
                  "[PROJECTS] Failed to delete saved project:",
                  error,
                );
              }
            }
          },
        },
      ]
    );
  };

  const editProject = (project: Project) => {
    setMenu({ visible: false, project: null });

    Alert.alert(
      "Edit Project",
      `Edit flow for "${project.title}" can be connected here.`
    );
  };

  const saveProjectToGallery = async (
    project: Project,
  ) => {
    const videoUrl =
      resolveProjectUrl(
        project.videoUrl,
      );

    if (!videoUrl) {
      Alert.alert(
        "Video unavailable",
        "This project does not have a saved video file.",
      );
      return;
    }

    try {
      const permission =
        await MediaLibrary.requestPermissionsAsync();

      if (
        !permission.granted
      ) {
        Alert.alert(
          "Permission required",
          "Please allow Photos/Gallery access to save the video.",
        );
        return;
      }

      const fileName =
        `${project.id || "shivora-video"}-${Date.now()}.mp4`;

      const targetUri =
        `${FileSystem.cacheDirectory}${fileName}`;

      const downloadResult =
        await FileSystem.downloadAsync(
          videoUrl,
          targetUri,
        );

      if (
        downloadResult.status !== 200
      ) {
        throw new Error(
          `Video download failed with status ${downloadResult.status}.`,
        );
      }

      await MediaLibrary.createAssetAsync(
        downloadResult.uri,
      );

      Alert.alert(
        "Saved",
        "Video saved to your gallery.",
      );
    } catch (error) {
      console.error(
        "[PROJECTS] Failed to save project video:",
        error,
      );

      Alert.alert(
        "Save failed",
        "We couldn't save this video to your gallery.",
      );
    }
  };

  const openMore = (project: Project) => {
    setMenu({ visible: true, project });
  };

  const renderStatus = (status: ProjectStatus) => {
    if (status === "Completed") {
      return (
        <View
          style={[
            styles.statusBadge,
            styles.statusCompleted,
          ]}
        >
          <Ionicons
            name="checkmark-circle"
            size={17}
            color={COLORS.green}
          />
          <Text
            style={[
              styles.statusText,
              { color: COLORS.green },
            ]}
          >
            Completed
          </Text>
        </View>
      );
    }

    if (status === "Processing") {
      return (
        <View
          style={[
            styles.statusBadge,
            styles.statusProcessing,
          ]}
        >
          <Ionicons
            name="ellipse-outline"
            size={18}
            color={COLORS.processing}
          />
          <Text
            style={[
              styles.statusText,
              { color: COLORS.processing },
            ]}
          >
            Processing
          </Text>
        </View>
      );
    }

    return (
      <View
        style={[styles.statusBadge, styles.statusDraft]}
      >
        <Ionicons
          name="time-outline"
          size={17}
          color={COLORS.draft}
        />
        <Text
          style={[
            styles.statusText,
            { color: COLORS.draft },
          ]}
        >
          Draft
        </Text>
      </View>
    );
  };

  const renderProjectCard = (project: Project) => {
    const typeIsImage =
      project.type === "Image to Video";
    const typeColor = typeIsImage
      ? COLORS.purpleBright
      : COLORS.cyan;

    return (
      <Pressable
        key={project.id}
        onPress={() => openProject(project)}
        style={({ pressed }) => [
          styles.projectCard,
          pressed && styles.projectPressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel={`Open ${project.title}`}
      >
        <View style={styles.thumbnailWrap}>
          <Image
            source={project.image}
            resizeMode="cover"
            style={styles.thumbnail}
          />

          <View style={styles.thumbnailShade} />

          <View style={styles.playButton}>
            <Ionicons
              name="play"
              size={19}
              color="#FFFFFF"
            />
          </View>

          <View style={styles.durationBadge}>
            <Ionicons
              name="time-outline"
              size={12}
              color="#FFFFFF"
            />
            <Text style={styles.durationText}>
              {project.duration}
            </Text>
          </View>
        </View>

        <View style={styles.projectInfo}>
          <View style={styles.projectHeaderRow}>
            <Text
              style={styles.projectTitle}
              numberOfLines={1}
            >
              {project.title}
            </Text>

            <Pressable
              onPress={(event) => {
                event.stopPropagation();
                toggleFavorite(project.id);
              }}
              hitSlop={8}
              style={styles.favoriteButton}
              accessibilityRole="button"
              accessibilityLabel={
                project.favorite
                  ? `Remove ${project.title} from favorites`
                  : `Add ${project.title} to favorites`
              }
            >
              <Ionicons
                name={
                  project.favorite
                    ? "star"
                    : "star-outline"
                }
                size={22}
                color={
                  project.favorite
                    ? COLORS.draft
                    : COLORS.secondary
                }
              />
            </Pressable>
          </View>

          <View style={styles.projectMetaRow}>
            <Ionicons
              name={
                typeIsImage
                  ? "image-outline"
                  : "document-text-outline"
              }
              size={17}
              color={typeColor}
            />

            <Text
              style={[
                styles.projectType,
                { color: typeColor },
              ]}
            >
              {project.type}
            </Text>

            <View style={styles.metaDot} />

            <Ionicons
              name="time-outline"
              size={16}
              color={COLORS.secondary}
            />

            <Text style={styles.projectDuration}>
              {project.duration}
            </Text>
          </View>

          <View style={styles.projectDateRow}>
            <Ionicons
              name="calendar-outline"
              size={16}
              color={COLORS.secondary}
            />

            <Text
              style={styles.projectDate}
              numberOfLines={1}
            >
              {project.date}
            </Text>
          </View>

          <View style={styles.projectFooter}>
            {renderStatus(project.status)}

            <Pressable
              onPress={(event) => {
                event.stopPropagation();
                openMore(project);
              }}
              hitSlop={8}
              style={styles.moreButton}
              accessibilityRole="button"
              accessibilityLabel={`More actions for ${project.title}`}
            >
              <Ionicons
                name="ellipsis-horizontal"
                size={22}
                color={COLORS.secondary}
              />
            </Pressable>
          </View>
        </View>
      </Pressable>
    );
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

      <View style={styles.flex}>
        {/* ========================================================
            HEADER
           ======================================================== */}
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
              size={33}
              color={COLORS.text}
            />
          </Pressable>

          <View style={styles.headerTitleWrap}>
            <Text
              style={styles.headerTitle}
              numberOfLines={1}
            >
              My Projects
            </Text>

            <Text
              style={styles.headerSubtitle}
              numberOfLines={1}
            >
              All your created videos in one place
            </Text>
          </View>

          <View
            style={[
              styles.creditPill,
              {
                width: isSmall ? 112 : 124,
              },
            ]}
          >
            <Image
              source={ASSETS.coin}
              resizeMode="contain"
              style={styles.coinIcon}
            />
            <Text style={styles.creditValue}>
              12,450
            </Text>
            <Text style={styles.creditPlus}>+</Text>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingHorizontal: horizontalPadding,
              paddingBottom: 108,
            },
          ]}
        >
          {/* ========================================================
              SEARCH + FILTER
             ======================================================== */}
          <View style={styles.searchRow}>
            <View style={styles.searchBar}>
              <Ionicons
                name="search"
                size={22}
                color={COLORS.secondary}
              />

              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search projects..."
                placeholderTextColor={COLORS.muted}
                selectionColor={COLORS.cyan}
                cursorColor={COLORS.cyan}
                style={styles.searchInput}
                autoCorrect={false}
                autoCapitalize="none"
              />

              {searchQuery.length > 0 && (
                <Pressable
                  onPress={() => setSearchQuery("")}
                  hitSlop={8}
                >
                  <Ionicons
                    name="close-circle"
                    size={19}
                    color={COLORS.muted}
                  />
                </Pressable>
              )}
            </View>

            <Pressable
              onPress={() => {}}
              style={({ pressed }) => [
                styles.filterButton,
                pressed && styles.pressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Project filters"
            >
              <Ionicons
                name="options-outline"
                size={24}
                color={COLORS.text}
              />
            </Pressable>
          </View>

          {/* ========================================================
              CATEGORY CHIPS
             ======================================================== */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            {(
              [
                "All",
                "Text to Video",
                "Image to Video",
                "Favorites",
              ] as Filter[]
            ).map((filter) => {
              const selected =
                activeFilter === filter;
              const count = countForFilter(filter);

              return (
                <Pressable
                  key={filter}
                  onPress={() => setActiveFilter(filter)}
                  style={[
                    styles.filterChip,
                    selected && styles.filterChipSelected,
                  ]}
                >
                  {filter === "Favorites" && (
                    <Ionicons
                      name="star-outline"
                      size={16}
                      color={
                        selected
                          ? COLORS.text
                          : COLORS.secondary
                      }
                      style={styles.filterChipIcon}
                    />
                  )}

                  <Text
                    style={[
                      styles.filterChipText,
                      selected &&
                        styles.filterChipTextSelected,
                    ]}
                  >
                    {filter}
                  </Text>

                  <View
                    style={[
                      styles.filterCount,
                      selected &&
                        styles.filterCountSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterCountText,
                        selected &&
                          styles.filterCountTextSelected,
                      ]}
                    >
                      {count}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* ========================================================
              PROJECTS
             ======================================================== */}
          <View style={styles.projectsList}>
            {filteredProjects.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIcon}>
                  <Ionicons
                    name="videocam-outline"
                    size={34}
                    color={COLORS.cyan}
                  />
                </View>

                <Text style={styles.emptyTitle}>
                  No projects found
                </Text>

                <Text style={styles.emptyDescription}>
                  Try a different search or filter.
                </Text>
              </View>
            ) : (
              filteredProjects.map(renderProjectCard)
            )}
          </View>
        </ScrollView>

        {/* ========================================================
            CREATE CTA
           ======================================================== */}
        <View
          style={[
            styles.fixedBottom,
            { paddingHorizontal: horizontalPadding },
          ]}
        >
          <Pressable
            onPress={handleCreateNewVideo}
            style={({ pressed }) => [
              styles.createButton,
              pressed && styles.createPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Create new video"
          >
            <LinearGradient
              colors={["#00CFFF", "#2C75FF", "#8C2EFF"]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.createGradient}
            >
              <Ionicons
                name="add-circle-outline"
                size={25}
                color="#FFFFFF"
                style={styles.createIcon}
              />

              <Text style={styles.createText}>
                Create New Video
              </Text>
            </LinearGradient>
          </Pressable>
        </View>

        {/* ========================================================
            MORE MENU
           ======================================================== */}
        <Modal
          visible={menu.visible}
          transparent
          animationType="fade"
          statusBarTranslucent
          onRequestClose={() =>
            setMenu({
              visible: false,
              project: null,
            })
          }
        >
          <Pressable
            style={styles.modalRoot}
            onPress={() =>
              setMenu({
                visible: false,
                project: null,
              })
            }
          >
            <Pressable
              style={styles.actionSheet}
              onPress={() => {}}
            >
              <View style={styles.sheetHandle} />

              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>
                  {menu.project?.title}
                </Text>

                <Pressable
                  onPress={() =>
                    setMenu({
                      visible: false,
                      project: null,
                    })
                  }
                  hitSlop={8}
                >
                  <Ionicons
                    name="close"
                    size={24}
                    color={COLORS.secondary}
                  />
                </Pressable>
              </View>

              <Pressable
                style={styles.sheetRow}
                onPress={() => {
                  if (menu.project?.videoUrl) {
                    const projectToPlay =
                      menu.project;

                    setMenu({
                      visible: false,
                      project: null,
                    });

                    setPlayingProject(
                      projectToPlay,
                    );
                    return;
                  }

                  if (menu.project) {
                    openProject(
                      menu.project,
                    );
                  }
                }}
              >
                <Ionicons
                  name="play-circle-outline"
                  size={23}
                  color={COLORS.text}
                />
                <Text style={styles.sheetRowText}>
                  Play Video
                </Text>
              </Pressable>

              <Pressable
                style={styles.sheetRow}
                onPress={() => {
                  const projectToSave =
                    menu.project;

                  setMenu({
                    visible: false,
                    project: null,
                  });

                  if (projectToSave) {
                    void saveProjectToGallery(
                      projectToSave,
                    );
                  }
                }}
              >
                <Ionicons
                  name="download-outline"
                  size={23}
                  color={COLORS.text}
                />
                <Text style={styles.sheetRowText}>
                  Save Video to Gallery
                </Text>
              </Pressable>

              <Pressable
                style={styles.sheetRow}
                onPress={() =>
                  menu.project &&
                  toggleFavorite(menu.project.id)
                }
              >
                <Ionicons
                  name={
                    menu.project?.favorite
                      ? "star"
                      : "star-outline"
                  }
                  size={23}
                  color={
                    menu.project?.favorite
                      ? COLORS.draft
                      : COLORS.text
                  }
                />
                <Text style={styles.sheetRowText}>
                  {menu.project?.favorite
                    ? "Remove from Favorites"
                    : "Add to Favorites"}
                </Text>
              </Pressable>

              <Pressable
                style={styles.sheetRow}
                onPress={() =>
                  menu.project &&
                  duplicateProject(menu.project)
                }
              >
                <Ionicons
                  name="copy-outline"
                  size={23}
                  color={COLORS.text}
                />
                <Text style={styles.sheetRowText}>
                  Duplicate
                </Text>
              </Pressable>

              <Pressable
                style={styles.sheetRow}
                onPress={() =>
                  menu.project &&
                  editProject(menu.project)
                }
              >
                <Ionicons
                  name="create-outline"
                  size={23}
                  color={COLORS.text}
                />
                <Text style={styles.sheetRowText}>
                  Edit Project
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.sheetRow,
                  styles.sheetDeleteRow,
                ]}
                onPress={() =>
                  menu.project &&
                  deleteProject(menu.project)
                }
              >
                <Ionicons
                  name="trash-outline"
                  size={23}
                  color={COLORS.danger}
                />
                <Text
                  style={[
                    styles.sheetRowText,
                    { color: COLORS.danger },
                  ]}
                >
                  Delete Project
                </Text>
              </Pressable>
            </Pressable>
          </Pressable>
        </Modal>

        {/* ========================================================
            PROJECT DETAILS MODAL
           ======================================================== */}
        <Modal
          visible={detailsProject !== null}
          transparent
          animationType="fade"
          statusBarTranslucent
          onRequestClose={() =>
            setDetailsProject(null)
          }
        >
          <Pressable
            style={styles.modalRoot}
            onPress={() => setDetailsProject(null)}
          >
            <Pressable
              style={styles.detailsSheet}
              onPress={() => {}}
            >
              <View style={styles.sheetHandle} />

              {detailsProject && (
                <>
                  <View style={styles.detailsPreview}>
                    <Image
                      source={detailsProject.image}
                      resizeMode="cover"
                      style={styles.detailsImage}
                    />

                    <View style={styles.detailsPlay}>
                      <Ionicons
                        name="play"
                        size={26}
                        color="#FFFFFF"
                      />
                    </View>
                  </View>

                  <Text style={styles.detailsTitle}>
                    {detailsProject.title}
                  </Text>

                  <View style={styles.detailsMetaRow}>
                    <Text
                      style={[
                        styles.detailsType,
                        {
                          color:
                            detailsProject.type ===
                            "Image to Video"
                              ? COLORS.purpleBright
                              : COLORS.cyan,
                        },
                      ]}
                    >
                      {detailsProject.type}
                    </Text>
                    <Text style={styles.detailsDot}>
                      •
                    </Text>
                    <Text style={styles.detailsMeta}>
                      {detailsProject.duration}
                    </Text>
                    <Text style={styles.detailsDot}>
                      •
                    </Text>
                    <Text style={styles.detailsMeta}>
                      {detailsProject.date}
                    </Text>
                  </View>

                  {renderStatus(
                    detailsProject.status
                  )}

                  <Pressable
                    onPress={() =>
                      setDetailsProject(null)
                    }
                    style={styles.detailsCloseButton}
                  >
                    <Text
                      style={styles.detailsCloseText}
                    >
                      Close
                    </Text>
                  </Pressable>
                </>
              )}
            </Pressable>
          </Pressable>
        </Modal>

        <FullScreenVideoModal
          project={playingProject}
          onClose={() =>
            setPlayingProject(null)
          }
        />
      </View>
    </SafeAreaView>
  );
}

/* ============================================================
   STYLES
   ============================================================ */

const styles = StyleSheet.create({
  safeArea: {
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
    width: "100%",
    height: 66,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backButton: {
    width: 48,
    height: 46,
    borderRadius: 15,
    borderWidth: 1.3,
    borderColor: "#154A5D",
    backgroundColor: "#061822",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  headerTitleWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    minWidth: 0,
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
    fontSize: 10.5,
    lineHeight: 14,
    marginTop: 3,
    textAlign: "center",
  },

  creditPill: {
    height: 40,
    borderRadius: 17,
    borderWidth: 1.2,
    borderColor: "#154A5D",
    backgroundColor: "#061822",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 9,
    flexShrink: 0,
  },

  coinIcon: {
    width: 20,
    height: 20,
    marginRight: 4,
  },

  creditValue: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: "600",
  },

  creditPlus: {
    color: COLORS.cyan,
    fontSize: 20,
    lineHeight: 28,
    marginLeft: 6,
  },

  scrollContent: {
    paddingTop: 9,
    paddingBottom: 110,
  },

  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginBottom: 12,
  },

  searchBar: {
    flex: 1,
    height: 48,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
  },

  searchInput: {
    flex: 1,
    minWidth: 0,
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 19,
    marginLeft: 8,
    paddingVertical: 0,
  },

  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 15,
    borderWidth: 1.1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
  },

  filterScroll: {
    paddingRight: 10,
    gap: 10,
    marginBottom: 14,
  },

  filterChip: {
    height: 42,
    borderRadius: 21,
    borderWidth: 1.1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  filterChipSelected: {
    borderColor: COLORS.cyanBorder,
    backgroundColor: "#062933",
  },

  filterChipIcon: {
    marginRight: 5,
  },

  filterChipText: {
    color: COLORS.secondary,
    fontSize: 11.5,
    lineHeight: 15,
    fontWeight: "600",
  },

  filterChipTextSelected: {
    color: COLORS.text,
  },

  filterCount: {
    minWidth: 23,
    height: 22,
    borderRadius: 11,
    marginLeft: 6,
    paddingHorizontal: 6,
    backgroundColor: "#0B2A35",
    alignItems: "center",
    justifyContent: "center",
  },

  filterCountSelected: {
    backgroundColor: "#0B3D4A",
  },

  filterCountText: {
    color: COLORS.secondary,
    fontSize: 9,
    fontWeight: "700",
  },

  filterCountTextSelected: {
    color: COLORS.cyan,
  },

  projectsList: {
    gap: 12,
  },

  projectCard: {
    height: 158,
    minHeight: 158,
    borderRadius: 19,
    borderWidth: 1.25,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    flexDirection: "row",
    overflow: "hidden",
  },

  projectPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.995 }],
  },

  thumbnailWrap: {
    width: 122,
    height: 158,
    minHeight: 158,
    position: "relative",
    backgroundColor: "#020C14",
    overflow: "hidden",
  },

  thumbnail: {
    width: "100%",
    height: "100%",
  },

  thumbnailShade: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.08)",
  },

  playButton: {
    position: "absolute",
    left: 10,
    bottom: 10,
    width: 37,
    height: 37,
    borderRadius: 19,
    backgroundColor: "rgba(0,0,0,0.58)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.65)",
    alignItems: "center",
    justifyContent: "center",
    paddingLeft: 2,
  },

  durationBadge: {
    position: "absolute",
    right: 8,
    bottom: 9,
    minWidth: 47,
    height: 26,
    borderRadius: 13,
    paddingHorizontal: 7,
    backgroundColor: "rgba(0,0,0,0.72)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },

  durationText: {
    color: COLORS.text,
    fontSize: 9.5,
    fontWeight: "700",
  },

  projectInfo: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },

  projectHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  projectTitle: {
    flex: 1,
    minWidth: 0,
    color: COLORS.text,
    fontSize: 14.5,
    lineHeight: 19,
    fontWeight: "800",
  },

  favoriteButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 6,
  },

  projectMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    minWidth: 0,
  },

  projectType: {
    fontSize: 10.5,
    lineHeight: 14,
    fontWeight: "700",
    marginLeft: 5,
    flexShrink: 1,
  },

  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: COLORS.secondary,
    marginHorizontal: 7,
  },

  projectDuration: {
    color: COLORS.secondary,
    fontSize: 10,
    lineHeight: 14,
    marginLeft: 4,
    fontWeight: "500",
  },

  projectDateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },

  projectDate: {
    flex: 1,
    color: COLORS.secondary,
    fontSize: 9.5,
    lineHeight: 14,
    marginLeft: 5,
  },

  projectFooter: {
    marginTop: "auto",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  statusBadge: {
    minWidth: 94,
    height: 31,
    borderRadius: 16,
    paddingHorizontal: 9,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },

  statusCompleted: {
    backgroundColor: COLORS.greenSurface,
    borderWidth: 1,
    borderColor: "#0C644F",
  },

  statusProcessing: {
    backgroundColor: COLORS.processingSurface,
    borderWidth: 1,
    borderColor: "#0F5C88",
  },

  statusDraft: {
    backgroundColor: COLORS.draftSurface,
    borderWidth: 1,
    borderColor: "#76501E",
  },

  statusText: {
    fontSize: 9.5,
    lineHeight: 13,
    fontWeight: "700",
  },

  moreButton: {
    width: 38,
    height: 34,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },

  videoModalRoot: {
    flex: 1,
    backgroundColor: "#000000",
  },

  videoModalHeader: {
    height: Platform.OS === "ios" ? 76 : 64,
    paddingTop: Platform.OS === "ios" ? 18 : 8,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(0,0,0,0.96)",
  },

  videoModalClose: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },

  videoModalTitle: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    marginHorizontal: 8,
  },

  videoModalSave: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },

  videoModalPlayerWrap: {
    flex: 1,
    backgroundColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
  },

  videoModalPlayer: {
    width: "100%",
    height: "100%",
  },

  videoModalEmpty: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  videoModalEmptyText: {
    color: "#FFFFFF",
    marginTop: 12,
    fontSize: 15,
    fontWeight: "600",
  },

  videoModalFooter: {
    minHeight: Platform.OS === "ios" ? 64 : 56,
    paddingHorizontal: 18,
    paddingBottom:
      Platform.OS === "ios" ? 10 : 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000000",
  },

  videoModalFooterText: {
    color: "#AAB6BE",
    fontSize: 11,
    fontWeight: "500",
  },

  emptyState: {
    minHeight: 260,
    borderRadius: 19,
    borderWidth: 1.2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  emptyIcon: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: "#08252D",
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    marginTop: 14,
    color: COLORS.text,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "700",
  },

  emptyDescription: {
    marginTop: 6,
    color: COLORS.secondary,
    fontSize: 11.5,
    lineHeight: 17,
    textAlign: "center",
  },

  fixedBottom: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.background,
    paddingTop: 10,
    paddingBottom: Platform.OS === "ios" ? 24 : 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(18, 62, 77, 0.3)",
    zIndex: 50,
    elevation: 20,
  },

  createButton: {
    width: "100%",
    height: 52,
    borderRadius: 26,
    overflow: "hidden",
    shadowColor: COLORS.cyan,
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 7,
  },

  createGradient: {
    width: "100%",
    height: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  createIcon: {
    marginRight: 8,
  },

  createText: {
    color: "#FFFFFF",
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "700",
  },

  createPressed: {
    transform: [{ scale: 0.985 }],
    opacity: 0.9,
  },

  modalRoot: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.64)",
  },

  actionSheet: {
    backgroundColor: "#071A24",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: "#214A5B",
    paddingHorizontal: 18,
    paddingTop: 9,
    paddingBottom: Platform.OS === "ios" ? 28 : 18,
  },

  sheetHandle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#59717B",
    marginBottom: 14,
  },

  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 13,
  },

  sheetTitle: {
    flex: 1,
    minWidth: 0,
    color: COLORS.text,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "700",
    marginRight: 12,
  },

  sheetRow: {
    height: 52,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#173847",
    backgroundColor: "#06151E",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 9,
  },

  sheetRowText: {
    color: COLORS.text,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
    marginLeft: 11,
  },

  sheetDeleteRow: {
    borderColor: "#40212A",
    backgroundColor: "#1B0D12",
  },

  detailsSheet: {
    backgroundColor: "#071A24",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: "#214A5B",
    paddingHorizontal: 18,
    paddingTop: 9,
    paddingBottom: Platform.OS === "ios" ? 28 : 18,
  },

  detailsPreview: {
    height: 190,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#020C14",
    position: "relative",
  },

  detailsImage: {
    width: "100%",
    height: "100%",
  },

  detailsPlay: {
    position: "absolute",
    left: "50%",
    top: "50%",
    marginLeft: -28,
    marginTop: -28,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(0,0,0,0.56)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.7)",
    alignItems: "center",
    justifyContent: "center",
    paddingLeft: 3,
  },

  detailsTitle: {
    marginTop: 15,
    color: COLORS.text,
    fontSize: 19,
    lineHeight: 24,
    fontWeight: "800",
  },

  detailsMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: 7,
  },

  detailsType: {
    fontSize: 10.5,
    fontWeight: "700",
  },

  detailsDot: {
    color: COLORS.secondary,
    marginHorizontal: 7,
    fontSize: 10,
  },

  detailsMeta: {
    color: COLORS.secondary,
    fontSize: 10.5,
  },

  detailsCloseButton: {
    marginTop: 16,
    height: 45,
    borderRadius: 22.5,
    borderWidth: 1.2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },

  detailsCloseText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "700",
  },
});