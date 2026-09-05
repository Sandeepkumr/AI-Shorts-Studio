import React, { useEffect, useState } from "react";
import {
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { authService } from "../../src/services/auth/authService";

/* =========================================================
   ASSETS
   ========================================================= */

const USER_AVATAR = require("../../assets/user-avatar.png");
const CLAPPERBOARD = require("../../assets/clapperboard-art.png");
const COIN = require("../../assets/coin.png");

const TEXT_TO_VIDEO_BG = require("../../assets/Text to Video BG.png");
const IMAGE_TO_VIDEO_BG = require("../../assets/Image to Video BG.png");

const PROJECT_1 = require("../../assets/project1.png");
const PROJECT_2 = require("../../assets/project2.png");
const PROJECT_3 = require("../../assets/project3.png");

/* =========================================================
   TYPES
   ========================================================= */

type CreationType = "text" | "image";

type ProjectStatus = "Completed" | "Processing" | "Draft";

type Project = {
  id: string;
  title: string;
  scenes: string;
  duration: string;
  date: string;
  status: ProjectStatus;
  image: any;
};

/* =========================================================
   PROJECT DATA
   ========================================================= */

const PROJECTS: Project[] = [
  {
    id: "1",
    title: "Trip to Switzerland",
    scenes: "8 Scenes",
    duration: "1:24 min",
    date: "May 8, 2025",
    status: "Completed",
    image: PROJECT_1,
  },
  {
    id: "2",
    title: "Rome City Tour",
    scenes: "6 Scenes",
    duration: "0:58 min",
    date: "May 7, 2025",
    status: "Processing",
    image: PROJECT_2,
  },
  {
    id: "3",
    title: "Sunset in Goa",
    scenes: "5 Scenes",
    duration: "0:41 min",
    date: "May 5, 2025",
    status: "Draft",
    image: PROJECT_3,
  },
];

/* =========================================================
   COLORS
   ========================================================= */

const COLORS = {
  background: "#020A10",

  surface: "#071923",

  text: "#F5F7F8",
  textSecondary: "#AAB9C3",
  textMuted: "#81939E",

  primary: "#08D9D0",
  primaryBorder: "#079F9C",

  purple: "#8B3DFF",
  purpleSurface: "#170D2A",
  purpleBorder: "#7630C7",

  projectBorder: "#123A48",

  completed: "#064C40",
  processing: "#0A3B59",
  draft: "#142630",
};

/* =========================================================
   HOME SCREEN
   ========================================================= */

export default function HomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const [createModalVisible, setCreateModalVisible] =
    useState(false);

  const [profileName, setProfileName] = useState("Deepak");
  const [profileImageUrl, setProfileImageUrl] =
    useState<string | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      let mounted = true;

      const loadProfile = async () => {
        try {
          const user = await authService.getCurrentUser();

          if (!mounted || !user || user.isGuest) {
            return;
          }

          setProfileName(user.name?.trim() || "Deepak");
          setProfileImageUrl(user.profileImageUrl ?? null);
        } catch (error) {
          console.error("Home profile load error:", error);
        }
      };

      void loadProfile();

      return () => {
        mounted = false;
      };
    }, []),
  );

  /* =======================================================
     RESPONSIVE VALUES
     ======================================================= */

  const isSmallPhone = width <= 375;
  const isLargePhone = width >= 430;

  const horizontalPadding = isSmallPhone
    ? 24
    : isLargePhone
      ? 32
      : 28;

  const cardGap = isSmallPhone ? 12 : 16;

  const creationCardWidth =
    (width - horizontalPadding * 2 - cardGap) / 2;

  /* =======================================================
     NAVIGATION
     ======================================================= */

  const openCreation = (type: CreationType) => {
    setCreateModalVisible(false);
    console.log("openCreation called with type:", type);

    if (type === "text") {
      router.push("/create-video-screen-t2v");
      return;
    }

    router.push("/add-story-image-to-video" as any);
  };

  const goToProjects = () => {
    router.push("/projects");
  };

  const goToCredits = () => {
    router.push("/credits");
  };

  const goToCharacters = () => {
    router.push("/characters");
  };

  const goToProfile = () => {
    router.push("/My Account" as any);
  };

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <View style={styles.root}>
      <SafeAreaView
        edges={["top"]}
        style={styles.safeArea}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingHorizontal: horizontalPadding,
              paddingBottom: 90,
            },
          ]}
        >
          {/* =================================================
              HEADER
             ================================================= */}

          <View style={styles.header}>
            <View style={styles.headerTextContainer}>
              <Text
                numberOfLines={1}
                style={styles.greeting}
              >
                Good morning, {profileName} 👋
              </Text>

              <Text
                numberOfLines={1}
                style={styles.greetingSubtitle}
              >
                Let's create something amazing today!
              </Text>
            </View>

            <View style={styles.headerActions}>
              <Pressable
                style={styles.notificationButton}
                hitSlop={8}
                onPress={() => {}}
              >
                <Ionicons
                  name="notifications-outline"
                  size={27}
                  color={COLORS.text}
                />

                <View style={styles.notificationDot} />
              </Pressable>

              <Pressable
                style={styles.avatarWrapper}
                onPress={goToProfile}
              >
                <Image
                  key={profileImageUrl ?? "default-avatar"}
                  source={
                    profileImageUrl
                      ? { uri: profileImageUrl }
                      : USER_AVATAR
                  }
                  style={styles.avatar}
                  resizeMode="cover"
                />
              </Pressable>
            </View>
          </View>

          {/* =================================================
              HERO CARD
             ================================================= */}

          <View style={styles.heroCard}>
            <View style={styles.heroCircle} />

            <View style={styles.heroCopy}>
              <Text style={styles.heroTitle}>
                Create{" "}
                <Text style={styles.heroTitleAccent}>
                  New Video
                </Text>
              </Text>

              <Text style={styles.heroSubtitle}>
                Turn your ideas into{"\n"}
                stunning AI videos.
              </Text>
            </View>

            <View style={styles.heroArtworkViewport}>
              <Image
                source={CLAPPERBOARD}
                style={styles.heroArtwork}
                resizeMode="contain"
              />
            </View>
          </View>

          {/* =================================================
              CREDITS CARD
             ================================================= */}

          <View style={styles.creditsCard}>
            <View style={styles.coinCircle}>
              <Image
                source={COIN}
                style={styles.coinImage}
                resizeMode="contain"
              />
            </View>

            <View style={styles.creditsInfo}>
              <Text style={styles.creditsLabel}>
                Available Credits
              </Text>

              <Text style={styles.creditsValue}>
                12,450
              </Text>

              <Text style={styles.planText}>
                You're on{" "}
                <Text style={styles.planAccent}>
                  Free Plan
                </Text>
              </Text>
            </View>

            <Pressable
              style={styles.getCreditsButton}
              onPress={goToCredits}
            >
              <Text style={styles.getCreditsText}>
                Get Credits
              </Text>

              <Ionicons
                name="arrow-forward"
                size={23}
                color={COLORS.primary}
              />
            </Pressable>
          </View>

          {/* =================================================
              CREATE WITH AI
             ================================================= */}

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Create with AI
            </Text>
          </View>

          <View style={styles.creationRow}>
            {/* =================================================
                TEXT TO VIDEO
               ================================================= */}

            <Pressable
              style={[
                styles.creationCard,
                styles.textCard,
                {
                  width: creationCardWidth,
                },
              ]}
              onPress={() => router.push('/create-video-screen-t2v')}
            >
              <Image
                source={TEXT_TO_VIDEO_BG}
                style={styles.creationArtwork}
                resizeMode="contain"
              />

              <View style={styles.creationContent}>
                <Text
                  numberOfLines={1}
                  style={styles.creationTitle}
                >
                  Text to Video
                </Text>

                <Text
                  numberOfLines={3}
                  ellipsizeMode="tail"
                  style={styles.creationDescription}
                >
                  Describe your idea and let AI create a complete cartoon video for you.
                </Text>
              </View>

              {/* Arrow is independent from text */}
              <View style={styles.creationArrow}>
                <Ionicons
                  name="arrow-forward"
                  size={20}
                  color="#031013"
                />
              </View>
            </Pressable>

            {/* =================================================
                IMAGE TO VIDEO
               ================================================= */}

            <Pressable
              style={[
                styles.creationCard,
                styles.imageCard,
                {
                  width: creationCardWidth,
                },
              ]}
              onPress={() => openCreation("image")}
            >
              <Image
                source={IMAGE_TO_VIDEO_BG}
                style={styles.creationArtwork}
                resizeMode="contain"
              />

              <View style={styles.creationContent}>
                <Text
                  numberOfLines={1}
                  style={styles.creationTitle}
                >
                  Image to Video
                </Text>

                <Text
                  numberOfLines={3}
                  ellipsizeMode="tail"
                  style={styles.creationDescription}
                >
                  Upload an image, add your story and we'll bring your character to life.
                </Text>
              </View>

              {/* Arrow is independent from text */}
              <View style={styles.creationArrow}>
                <Ionicons
                  name="arrow-forward"
                  size={20}
                  color="#031013"
                />
              </View>
            </Pressable>
          </View>

          {/* =================================================
              RECENT PROJECTS HEADER
             ================================================= */}

          <View style={styles.recentHeader}>
            <Text style={styles.sectionTitle}>
              Recent Projects
            </Text>

            <Pressable
              style={styles.viewAllButton}
              onPress={goToProjects}
            >
              <Text style={styles.viewAllText}>
                View All
              </Text>

              <Ionicons
                name="chevron-forward"
                size={21}
                color={COLORS.primary}
              />
            </Pressable>
          </View>

          {/* =================================================
              PROJECTS
             ================================================= */}

          <View style={styles.projectsContainer}>
            {PROJECTS.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
              />
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* =====================================================
          BOTTOM NAVIGATION
         ===================================================== */}

      <BottomNavigation
        onCreate={() => setCreateModalVisible(true)}
        onProjects={goToProjects}
        onCharacters={goToCharacters}
        onProfile={goToProfile}
      />

      {/* =====================================================
          CREATE MODAL
         ===================================================== */}

      <CreateModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onSelect={openCreation}
      />
    </View>
  );
}

/* =========================================================
   PROJECT CARD
   ========================================================= */

function ProjectCard({
  project,
}: {
  project: Project;
}) {
  return (
    <Pressable style={styles.projectCard}>
      <View style={styles.projectImageWrapper}>
        <Image
          source={project.image}
          style={styles.projectImage}
          resizeMode="cover"
        />

        <View style={styles.playButton}>
          <Ionicons
            name="play"
            size={14}
            color="#FFFFFF"
          />
        </View>
      </View>

      <View style={styles.projectInfo}>
        <Text
          numberOfLines={1}
          style={styles.projectTitle}
        >
          {project.title}
        </Text>

        <Text
          numberOfLines={1}
          style={styles.projectMeta}
        >
          {project.scenes} • {project.duration}
        </Text>

        <Text
          numberOfLines={1}
          style={styles.projectDate}
        >
          {project.date}
        </Text>
      </View>

      <View
        style={[
          styles.statusBadge,
          project.status === "Completed" &&
            styles.completedBadge,
          project.status === "Processing" &&
            styles.processingBadge,
          project.status === "Draft" &&
            styles.draftBadge,
        ]}
      >
        <Text
          style={[
            styles.statusText,
            project.status === "Completed" &&
              styles.completedText,
            project.status === "Processing" &&
              styles.processingText,
            project.status === "Draft" &&
              styles.draftText,
          ]}
        >
          {project.status}
        </Text>
      </View>

      <View style={styles.moreButton}>
        <View style={styles.moreDot} />
        <View style={styles.moreDot} />
        <View style={styles.moreDot} />
      </View>
    </Pressable>
  );
}

/* =========================================================
   BOTTOM NAVIGATION
   ========================================================= */

function BottomNavigation({
  onCreate,
  onProjects,
  onCharacters,
  onProfile,
}: {
  onCreate: () => void;
  onProjects: () => void;
  onCharacters: () => void;
  onProfile: () => void;
}) {
  return (
    <View style={styles.bottomNav}>
      <BottomItem
        icon="home-outline"
        activeIcon="home"
        label="Home"
        active
        onPress={() => {}}
      />

      <BottomItem
        icon="play-circle-outline"
        label="Projects"
        onPress={onProjects}
      />

      <Pressable
        style={styles.createButton}
        onPress={onCreate}
      >
        <Ionicons
          name="add"
          size={35}
          color="#031013"
        />
      </Pressable>

      <BottomItem
        icon="people-outline"
        activeIcon="people"
        label="Characters"
        onPress={onCharacters}
      />

      <BottomItem
        icon="person-outline"
        label="My Account"
        onPress={onProfile}
      />
    </View>
  );
}

/* =========================================================
   BOTTOM NAV ITEM
   ========================================================= */

function BottomItem({
  icon,
  activeIcon,
  label,
  active = false,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon?: keyof typeof Ionicons.glyphMap;
  label: string;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={styles.bottomItem}
      onPress={onPress}
    >
      <Ionicons
        name={
          active && activeIcon
            ? activeIcon
            : icon
        }
        size={22}
        color={
          active
            ? COLORS.primary
            : COLORS.textMuted
        }
      />

      <Text
        style={[
          styles.bottomLabel,
          active && styles.bottomLabelActive,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

/* =========================================================
   CREATE MODAL
   ========================================================= */

function CreateModal({
  visible,
  onClose,
  onSelect,
}: {
  visible: boolean;
  onClose: () => void;
  onSelect: (type: CreationType) => void;
}) {
  const router = useRouter();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.modalRoot}>
        <Pressable
          style={styles.modalOverlay}
          onPress={onClose}
        />

        <View style={styles.createSheet}>
          <View style={styles.sheetHandle} />

          <View style={styles.sheetHeader}>
            <View>
              <Text style={styles.sheetTitle}>
                Create New
              </Text>

              <Text style={styles.sheetSubtitle}>
                What would you like to create?
              </Text>
            </View>

            <Pressable
              style={styles.closeButton}
              onPress={onClose}
            >
              <Ionicons
                name="close"
                size={23}
                color={COLORS.textSecondary}
              />
            </Pressable>
          </View>

          {/* TEXT TO VIDEO */}

          <Pressable
            style={[
              styles.modalOption,
              styles.modalTextOption,
            ]}
            onPress={() => {
              onClose();
              router.push("/create-video-screen-t2v");
            }}
          >
            <View
              style={[
                styles.modalIconBox,
                styles.modalTextIconBox,
              ]}
            >
              <Ionicons
                name="document-text-outline"
                size={28}
                color={COLORS.primary}
              />
            </View>

            <View style={styles.modalOptionText}>
              <Text style={styles.modalOptionTitle}>
                Text to Video
              </Text>

              <Text
                numberOfLines={1}
                style={styles.modalOptionSubtitle}
              >
                Describe your idea and let AI create it
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={28}
              color={COLORS.primary}
            />
          </Pressable>

          {/* IMAGE TO VIDEO */}

          <Pressable
            style={[
              styles.modalOption,
              styles.modalImageOption,
            ]}
            onPress={() => onSelect("image")}
          >
            <View
              style={[
                styles.modalIconBox,
                styles.modalImageIconBox,
              ]}
            >
              <Ionicons
                name="image-outline"
                size={28}
                color="#A66CFF"
              />
            </View>

            <View style={styles.modalOptionText}>
              <Text style={styles.modalOptionTitle}>
                Image to Video
              </Text>

              <Text
                numberOfLines={1}
                style={styles.modalOptionSubtitle}
              >
                Bring your image and character to life
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={28}
              color="#A66CFF"
            />
          </Pressable>

          <Pressable
            style={styles.cancelButton}
            onPress={onClose}
          >
            <Text style={styles.cancelText}>
              Cancel
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

/* =========================================================
   STYLES
   ========================================================= */

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scrollContent: {
    paddingTop: 8,
  },

  /* =======================================================
     HEADER
     ======================================================= */

  header: {
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },

  headerTextContainer: {
    flex: 1,
    minWidth: 0,
    paddingRight: 10,
  },

  greeting: {
    color: COLORS.text,
    fontSize: 20,
    lineHeight: 25,
    fontWeight: "700",
    letterSpacing: -0.4,
  },

  greetingSubtitle: {
    marginTop: 4,
    color: COLORS.textSecondary,
    fontSize: 13.5,
    lineHeight: 18,
  },

  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flexShrink: 0,
  },

  notificationButton: {
    width: 32,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },

  notificationDot: {
    position: "absolute",
    top: 3,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },

  avatarWrapper: {
    width: 50,
    height: 50,
    borderRadius: 25,
    padding: 2,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },

  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 23,
  },

  /* =======================================================
     HERO
     
     UPDATED:
     - Bigger card
     - Bigger title
     - Bigger artwork
     - Text stays above artwork
     ======================================================= */

  heroCard: {
    height: 214,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: COLORS.primaryBorder,
    backgroundColor: "#062B2E",
    overflow: "hidden",
    position: "relative",
    marginBottom: 14,
  },

  heroCircle: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    right: -70,
    top: -60,
    backgroundColor:
      "rgba(0, 216, 207, 0.055)",
  },

  heroCopy: {
    position: "absolute",
    left: 22,
    top: 34,
    width: "55%",
    zIndex: 20,
    elevation: 20,
  },

  heroTitle: {
    color: COLORS.text,
    fontSize: 27,
    lineHeight: 33,
    fontWeight: "800",
    letterSpacing: -0.65,
  },

  heroTitleAccent: {
    color: COLORS.primary,
  },

  heroSubtitle: {
    marginTop: 9,
    color: COLORS.textSecondary,
    fontSize: 15,
    lineHeight: 22,
  },

  /*
   * The artwork itself contains small text on its left side.
   * We only display its right-side visual inside this viewport.
   */
  heroArtworkViewport: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: "59%",
    overflow: "hidden",
    zIndex: 3,
  },

  heroArtwork: {
    position: "absolute",
    width: 355,
    height: 214,
    right: -82,
    bottom: 0,
  },

  /* =======================================================
     CREDITS
     ======================================================= */

  creditsCard: {
    minHeight: 94,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.projectBorder,
    backgroundColor: COLORS.surface,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 24,
  },

  coinCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "#07383E",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  coinImage: {
    width: 42,
    height: 42,
  },

  creditsInfo: {
    flex: 1,
    marginLeft: 14,
    minWidth: 0,
  },

  creditsLabel: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 17,
  },

  creditsValue: {
    marginTop: 1,
    color: COLORS.text,
    fontSize: 27,
    lineHeight: 31,
    fontWeight: "800",
    letterSpacing: -0.6,
  },

  planText: {
    marginTop: 1,
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 16,
  },

  planAccent: {
    color: COLORS.primary,
  },

  getCreditsButton: {
    width: 128,
    height: 46,
    borderRadius: 14,
    borderWidth: 1.7,
    borderColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    flexShrink: 0,
  },

  getCreditsText: {
    color: COLORS.primary,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: "700",
  },

  /* =======================================================
     SECTION
     ======================================================= */

  sectionHeader: {
    marginBottom: 10,
  },

  sectionTitle: {
    color: COLORS.text,
    fontSize: 22,
    lineHeight: 27,
    fontWeight: "700",
    letterSpacing: -0.35,
  },

  /* =======================================================
     CREATE WITH AI
     ======================================================= */

  creationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 22,
  },

  creationCard: {
    height: 176,
    borderRadius: 20,
    borderWidth: 1.6,
    overflow: "hidden",
    position: "relative",
  },

  textCard: {
    backgroundColor: "#04302F",
    borderColor: COLORS.primaryBorder,
  },

  imageCard: {
    backgroundColor: COLORS.purpleSurface,
    borderColor: COLORS.purpleBorder,
  },

  creationArtwork: {
    position: "absolute",
    width: "84%",
    height: 72,
    top: 8,
    alignSelf: "center",
  },

  /*
   * IMPORTANT:
   *
   * Right side is reserved for the arrow.
   * This prevents description text from running
   * underneath the arrow.
   */
  creationContent: {
    position: "absolute",
    left: 14,
    right: 10,
    bottom: 12,
    zIndex: 2,
  },

  creationTitle: {
    color: COLORS.text,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "700",
    letterSpacing: -0.2,
    paddingRight: 2,
  },

  creationDescription: {
    marginTop: 5,
    paddingRight: 42,
    color: COLORS.textSecondary,
    fontSize: 12.5,
    lineHeight: 18,
    fontWeight: "400",
  },

  /*
   * Arrow is now completely independent.
   * It no longer overlaps the description.
   */
  creationArrow: {
    position: "absolute",
    right: 9,
    bottom: 9,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    elevation: 10,
  },

  /* =======================================================
     RECENT HEADER
     ======================================================= */

  recentHeader: {
    minHeight: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 9,
  },

  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },

  viewAllText: {
    color: COLORS.primary,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
  },

  /* =======================================================
     PROJECTS
     ======================================================= */

  projectsContainer: {
    gap: 10,
  },

  projectCard: {
    height: 86,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: COLORS.projectBorder,
    backgroundColor: COLORS.surface,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    position: "relative",
    overflow: "hidden",
  },

  projectImageWrapper: {
    width: 112,
    height: 66,
    borderRadius: 12,
    overflow: "hidden",
    position: "relative",
    flexShrink: 0,
  },

  projectImage: {
    width: "100%",
    height: "100%",
  },

  playButton: {
    position: "absolute",
    left: 7,
    bottom: 7,
    width: 27,
    height: 27,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.65)",
    borderWidth: 1,
    borderColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  projectInfo: {
    flex: 1,
    minWidth: 0,
    marginLeft: 11,
    paddingRight: 4,
  },

  projectTitle: {
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "700",
  },

  projectMeta: {
    marginTop: 2,
    color: COLORS.textSecondary,
    fontSize: 11.5,
    lineHeight: 16,
  },

  projectDate: {
    marginTop: 1,
    color: COLORS.textMuted,
    fontSize: 10.5,
    lineHeight: 14,
  },

  statusBadge: {
    minWidth: 78,
    height: 34,
    borderRadius: 17,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    flexShrink: 0,
  },

  completedBadge: {
    backgroundColor: COLORS.completed,
  },

  processingBadge: {
    backgroundColor: COLORS.processing,
  },

  draftBadge: {
    backgroundColor: COLORS.draft,
  },

  statusText: {
    fontSize: 10.5,
    lineHeight: 14,
    fontWeight: "600",
  },

  completedText: {
    color: COLORS.primary,
  },

  processingText: {
    color: "#08AEEA",
  },

  draftText: {
    color: COLORS.textSecondary,
  },

  moreButton: {
    width: 10,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    flexShrink: 0,
  },

  moreDot: {
    width: 3.5,
    height: 3.5,
    borderRadius: 2,
    backgroundColor: COLORS.textSecondary,
  },

  /* =======================================================
     BOTTOM NAV
     ======================================================= */

  bottomNav: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 64,
    backgroundColor: "#06141D",
    borderTopWidth: 1,
    borderTopColor: "#102D38",
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    paddingBottom:
      Platform.OS === "ios" ? 5 : 4,
    zIndex: 50,
  },

  bottomItem: {
    flex: 1,
    minWidth: 0,
    height: 49,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingHorizontal: 2,
    paddingBottom: 1,
  },

  bottomLabel: {
    marginTop: 2,
    color: COLORS.textMuted,
    fontSize: 9,
    lineHeight: 12,
    fontWeight: "500",
    textAlign: "center",
    width: "100%",
  },

  bottomLabelActive: {
    color: COLORS.primary,
  },

  createButton: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 1,

    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 7,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },

  /* =======================================================
     CREATE MODAL
     ======================================================= */

  modalRoot: {
    flex: 1,
    justifyContent: "flex-end",
  },

  modalOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.72)",
  },

  createSheet: {
    minHeight: 325,
    backgroundColor: "#071A24",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: "#155263",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom:
      Platform.OS === "ios" ? 28 : 18,
  },

  sheetHandle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#59717B",
    marginBottom: 16,
  },

  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },

  sheetTitle: {
    color: COLORS.text,
    fontSize: 23,
    lineHeight: 28,
    fontWeight: "700",
  },

  sheetSubtitle: {
    marginTop: 3,
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },

  closeButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#0A2632",
    alignItems: "center",
    justifyContent: "center",
  },

  modalOption: {
    height: 76,
    borderRadius: 19,
    borderWidth: 1.5,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
    marginBottom: 11,
  },

  modalTextOption: {
    backgroundColor: "#04302F",
    borderColor: COLORS.primaryBorder,
  },

  modalImageOption: {
    backgroundColor: "#170D2A",
    borderColor: COLORS.purpleBorder,
  },

  modalIconBox: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  modalTextIconBox: {
    backgroundColor: "#07504F",
  },

  modalImageIconBox: {
    backgroundColor: "#29164A",
  },

  modalOptionText: {
    flex: 1,
    minWidth: 0,
    marginLeft: 13,
    marginRight: 8,
  },

  modalOptionTitle: {
    color: COLORS.text,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "700",
  },

  modalOptionSubtitle: {
    marginTop: 3,
    color: COLORS.textSecondary,
    fontSize: 11,
    lineHeight: 15,
  },

  cancelButton: {
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },

  cancelText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
  },
});