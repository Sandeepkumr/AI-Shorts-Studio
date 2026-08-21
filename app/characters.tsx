import React, { useMemo, useState } from "react";
import {
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
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";

/*
 * ============================================================
 * MY CHARACTERS
 * ============================================================
 *
 * This screen intentionally supports TWO modes:
 *
 * 1) Library mode
 *    Opened from the bottom Characters tab.
 *    - Browse / search / filter
 *    - Create new
 *    - View / edit / duplicate / delete
 *    - NO selection UI
 *
 * 2) Selection mode
 *    Opened from Customize Video -> Use Saved Character.
 *    - Select one or more saved characters
 *    - Checkmarks
 *    - Selected tray
 *    - "Use Selected" CTA
 *
 * Route examples:
 *   /characters
 *   /characters?mode=select
 *
 * NOTE:
 * The sample character data below is local UI data for now.
 * Connect it to the app's real character store/API when that
 * data layer is ready. No external package is required here.
 * ============================================================
 */

type CharacterRole = "Main Character" | "Supporting";

type Character = {
  id: string;
  name: string;
  role: CharacterRole;
  description: string;
  image: any;
};

const INITIAL_CHARACTERS: Character[] = [
  {
    id: "alex",
    name: "Alex",
    role: "Main Character",
    description: "Young boy with red hair, fair skin and a blue hoodie.",
    image: require("../assets/ai-character-main.png"),
  },
  {
    id: "shopkeeper",
    name: "Shopkeeper",
    role: "Supporting",
    description: "Friendly man with black hair, beard and an apron.",
    image: require("../assets/ai-character-shopkeeper.png"),
  },
  {
    id: "vamika",
    name: "Vamika",
    role: "Main Character",
    description: "Young girl with a cheerful look and colorful styling.",
    image: require("../assets/vamika-character.png"),
  },
];

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
  purpleBorder: "#7E35D5",
  purpleSurface: "#180B31",
  danger: "#FF5C68",
};

type MoreMenuState = {
  visible: boolean;
  character: Character | null;
};

export default function MyCharactersScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const params = useLocalSearchParams<{ mode?: string }>();

  const selectionMode = params.mode === "select";

  const isSmall = width <= 375;
  const isLarge = width >= 430;

  const horizontalPadding = isSmall ? 18 : isLarge ? 27 : 22;
  const contentWidth = width - horizontalPadding * 2;
  const gridGap = isSmall ? 9 : 12;
  const cardWidth = (contentWidth - gridGap * 2) / 3;

  const [characters, setCharacters] = useState<Character[]>(
    INITIAL_CHARACTERS
  );
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"All" | CharacterRole>("All");
  const [listView, setListView] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [moreMenu, setMoreMenu] = useState<MoreMenuState>({
    visible: false,
    character: null,
  });
  const [filterVisible, setFilterVisible] = useState(false);
  const [detailsCharacter, setDetailsCharacter] =
    useState<Character | null>(null);

  const filteredCharacters = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return characters.filter((character) => {
      const matchesQuery =
        !normalizedQuery ||
        character.name.toLowerCase().includes(normalizedQuery) ||
        character.role.toLowerCase().includes(normalizedQuery);

      const matchesRole =
        roleFilter === "All" || character.role === roleFilter;

      return matchesQuery && matchesRole;
    });
  }, [characters, query, roleFilter]);

  const selectedCharacters = useMemo(
    () =>
      selectedIds
        .map((id) => characters.find((character) => character.id === id))
        .filter(Boolean) as Character[],
    [characters, selectedIds]
  );

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/" as any);
  };

  const toggleSelected = (id: string) => {
    if (!selectionMode) return;

    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  const handleCreateNew = () => {
    Alert.alert(
      "Create New Character",
      "Connect this action to your character creation screen.",
      [{ text: "OK" }]
    );
  };

  const handleUseSelected = () => {
    if (selectedCharacters.length === 0) {
      Alert.alert(
        "Select a character",
        "Choose at least one saved character to continue."
      );
      return;
    }

    /*
     * UI-ready selection flow:
     * The next integration step will return these IDs to
     * Customize Your Video and replace the detected character(s).
     *
     * For now, keep the current navigation stack intact.
     */
    router.back();
  };

  const handleViewDetails = (character: Character) => {
    setMoreMenu({ visible: false, character: null });
    setDetailsCharacter(character);
  };

  const handleEdit = (character: Character) => {
    setMoreMenu({ visible: false, character: null });
    Alert.alert(
      "Edit Character",
      `Edit flow for "${character.name}" will be connected here.`
    );
  };

  const handleDuplicate = (character: Character) => {
    setMoreMenu({ visible: false, character: null });

    const duplicate: Character = {
      ...character,
      id: `${character.id}-${Date.now()}`,
      name: `${character.name} Copy`,
    };

    setCharacters((current) => [duplicate, ...current]);
  };

  const handleDelete = (character: Character) => {
    setMoreMenu({ visible: false, character: null });

    Alert.alert(
      "Delete Character?",
      `Are you sure you want to delete "${character.name}" from your library?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setCharacters((current) =>
              current.filter((item) => item.id !== character.id)
            );
            setSelectedIds((current) =>
              current.filter((id) => id !== character.id)
            );
          },
        },
      ]
    );
  };

  const openMore = (character: Character) => {
    setMoreMenu({
      visible: true,
      character,
    });
  };

  const renderAvatar = (
    character: Character,
    size: number,
    compact = false
  ) => {
    return (
      <View
        style={[
          styles.avatar,
          {
            width: size,
            height: size,
            borderRadius: size * 0.26,
          },
        ]}
      >
        <Image
          source={character.image}
          resizeMode="contain"
          style={[
            styles.avatarImage,
            {
              width: compact ? size * 0.9 : size * 0.96,
              height: compact ? size * 0.9 : size * 0.96,
            },
          ]}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.background}
      />

      <View style={styles.flex}>
        {/* =========================================================
            HEADER
           ========================================================= */}
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

          <View style={styles.headerTitleWrap}>
            <Text
              style={styles.headerTitle}
              numberOfLines={1}
            >
              My Characters
            </Text>
          </View>

          <Pressable
            style={[
              styles.creditPill,
              {
                width: width <= 375 ? 112 : 124,
              },
            ]}
            onPress={() => router.push("/coins")}
          >
            <Image
              source={require("../assets/coin.png")}
              resizeMode="contain"
              style={styles.coinIcon}
            />
            <Text style={styles.creditValue}>12,450</Text>
            <Text style={styles.creditPlus}>+</Text>
          </Pressable>
        </View>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingHorizontal: horizontalPadding,
              paddingBottom: selectionMode
                ? selectedCharacters.length > 0
                  ? 235
                  : 95
                : 100,
            },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        >
          {/* =========================================================
              SEARCH + FILTER
             ========================================================= */}
          <View style={styles.searchRow}>
            <View style={styles.searchBox}>
              <Ionicons
                name="search"
                size={22}
                color={COLORS.secondary}
              />

              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search characters..."
                placeholderTextColor={COLORS.secondary}
                style={styles.searchInput}
                selectionColor={COLORS.cyan}
                cursorColor={COLORS.cyan}
                autoCapitalize="none"
                autoCorrect={false}
              />

              {query.length > 0 && (
                <Pressable
                  onPress={() => setQuery("")}
                  hitSlop={8}
                >
                  <Ionicons
                    name="close-circle"
                    size={20}
                    color={COLORS.muted}
                  />
                </Pressable>
              )}
            </View>

            <Pressable
              onPress={() => setFilterVisible(true)}
              style={({ pressed }) => [
                styles.filterButton,
                roleFilter !== "All" && styles.filterButtonActive,
                pressed && styles.pressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Filter characters"
            >
              <Ionicons
                name="options-outline"
                size={23}
                color={
                  roleFilter !== "All"
                    ? COLORS.cyan
                    : COLORS.text
                }
              />
            </Pressable>
          </View>

          {/* =========================================================
              TOOLBAR
             ========================================================= */}
          <View style={styles.toolbar}>
            <View style={styles.countGroup}>
              <Text style={styles.countTitle}>All Characters</Text>
              <View style={styles.countPill}>
                <Text style={styles.countPillText}>
                  {filteredCharacters.length}
                </Text>
              </View>
            </View>

            <View style={styles.viewToggle}>
              <Pressable
                onPress={() => setListView(false)}
                style={[
                  styles.viewToggleButton,
                  !listView && styles.viewToggleButtonActive,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Grid view"
              >
                <Ionicons
                  name="grid-outline"
                  size={19}
                  color={
                    !listView
                      ? COLORS.cyan
                      : COLORS.secondary
                  }
                />
              </Pressable>

              <Pressable
                onPress={() => setListView(true)}
                style={[
                  styles.viewToggleButton,
                  listView && styles.viewToggleButtonActive,
                ]}
                accessibilityRole="button"
                accessibilityLabel="List view"
              >
                <Ionicons
                  name="list-outline"
                  size={20}
                  color={
                    listView
                      ? COLORS.cyan
                      : COLORS.secondary
                  }
                />
              </Pressable>
            </View>
          </View>

          {/* =========================================================
              CHARACTER LIBRARY
             ========================================================= */}
          {filteredCharacters.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons
                  name="people-outline"
                  size={34}
                  color={COLORS.cyan}
                />
              </View>

              <Text style={styles.emptyTitle}>
                No characters found
              </Text>

              <Text style={styles.emptyDescription}>
                Try a different name or create a new character.
              </Text>

              <Pressable
                onPress={handleCreateNew}
                style={({ pressed }) => [
                  styles.emptyButton,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons
                  name="add"
                  size={20}
                  color={COLORS.cyan}
                />
                <Text style={styles.emptyButtonText}>
                  Create New Character
                </Text>
              </Pressable>
            </View>
          ) : listView ? (
            <View style={styles.listContainer}>
              {filteredCharacters.map((character) => {
                const selected = selectedIds.includes(character.id);

                return (
                  <Pressable
                    key={character.id}
                    onPress={() => toggleSelected(character.id)}
                    style={({ pressed }) => [
                      styles.listCard,
                      selected && selectionMode && styles.listCardSelected,
                      pressed && styles.pressed,
                    ]}
                  >
                    {renderAvatar(character, 58, true)}

                    <View style={styles.listInfo}>
                      <Text style={styles.listName}>
                        {character.name}
                      </Text>

                      <Text style={styles.listRole}>
                        {character.role}
                      </Text>

                      <Text
                        numberOfLines={1}
                        style={styles.listDescription}
                      >
                        {character.description}
                      </Text>
                    </View>

                    {selectionMode ? (
                      <View
                        style={[
                          styles.selectionCircle,
                          selected && styles.selectionCircleSelected,
                        ]}
                      >
                        {selected && (
                          <Ionicons
                            name="checkmark"
                            size={17}
                            color="#031013"
                          />
                        )}
                      </View>
                    ) : (
                      <Pressable
                        onPress={() => openMore(character)}
                        hitSlop={8}
                        style={styles.moreButton}
                      >
                        <Ionicons
                          name="ellipsis-vertical"
                          size={20}
                          color={COLORS.secondary}
                        />
                      </Pressable>
                    )}
                  </Pressable>
                );
              })}
            </View>
          ) : (
            <View
              style={[
                styles.grid,
                {
                  gap: gridGap,
                },
              ]}
            >
              {filteredCharacters.map((character) => {
                const selected = selectedIds.includes(character.id);

                return (
                  <Pressable
                    key={character.id}
                    onPress={() => toggleSelected(character.id)}
                    style={({ pressed }) => [
                      styles.characterCard,
                      {
                        width: cardWidth,
                      },
                      selected &&
                        selectionMode &&
                        styles.characterCardSelected,
                      pressed && styles.pressed,
                    ]}
                  >
                    <View style={styles.cardTop}>
                      {selectionMode ? (
                        <View
                          style={[
                            styles.selectionCircle,
                            selected &&
                              styles.selectionCircleSelected,
                          ]}
                        >
                          {selected && (
                            <Ionicons
                              name="checkmark"
                              size={16}
                              color="#031013"
                            />
                          )}
                        </View>
                      ) : (
                        <View style={styles.cardTopSpacer} />
                      )}

                      {!selectionMode && (
                        <Pressable
                          onPress={() => openMore(character)}
                          hitSlop={8}
                          style={styles.cardMore}
                        >
                          <Ionicons
                            name="ellipsis-vertical"
                            size={18}
                            color={COLORS.secondary}
                          />
                        </Pressable>
                      )}
                    </View>

                    <View style={styles.cardAvatarWrap}>
                      {renderAvatar(character, Math.max(70, cardWidth * 0.68))}
                    </View>

                    <Text
                      numberOfLines={1}
                      style={styles.cardName}
                    >
                      {character.name}
                    </Text>

                    <Text
                      numberOfLines={1}
                      style={[
                        styles.cardRole,
                        character.role === "Main Character" &&
                          styles.cardRoleMain,
                      ]}
                    >
                      {character.role}
                    </Text>
                  </Pressable>
                );
              })}

              {/* CREATE NEW CARD */}
              <Pressable
                onPress={handleCreateNew}
                style={({ pressed }) => [
                  styles.createCard,
                  {
                    width: cardWidth,
                  },
                  pressed && styles.pressed,
                ]}
              >
                <View style={styles.createCardIcon}>
                  <Ionicons
                    name="add"
                    size={28}
                    color={COLORS.cyan}
                  />
                </View>

                <Text style={styles.createCardText}>
                  Create New
                </Text>

                <Text style={styles.createCardSubtext}>
                  Character
                </Text>
              </Pressable>
            </View>
          )}
        </ScrollView>

        {/* =========================================================
            SELECTION BAR — ONLY IN SELECT MODE
           ========================================================= */}
        {selectionMode && selectedCharacters.length > 0 && (
          <View style={styles.selectionDock}>
            <View style={styles.selectionSummaryRow}>
              <View style={styles.selectionCount}>
                <Ionicons
                  name="layers-outline"
                  size={20}
                  color={COLORS.cyan}
                />
                <Text style={styles.selectionCountText}>
                  {selectedCharacters.length} Selected
                </Text>
              </View>

              <Pressable
                onPress={clearSelection}
                hitSlop={8}
              >
                <Text style={styles.clearText}>Clear</Text>
              </Pressable>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.selectedChips}
            >
              {selectedCharacters.map((character) => (
                <View
                  key={character.id}
                  style={styles.selectedChip}
                >
                  {renderAvatar(character, 34, true)}

                  <View style={styles.selectedChipTextWrap}>
                    <Text
                      numberOfLines={1}
                      style={styles.selectedChipName}
                    >
                      {character.name}
                    </Text>

                    <Text
                      numberOfLines={1}
                      style={styles.selectedChipRole}
                    >
                      {character.role}
                    </Text>
                  </View>

                  <Pressable
                    onPress={() => toggleSelected(character.id)}
                    hitSlop={7}
                    style={styles.selectedChipClose}
                  >
                    <Ionicons
                      name="close"
                      size={17}
                      color={COLORS.secondary}
                    />
                  </Pressable>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {selectionMode ? (
          <View
            style={[
              styles.fixedBottom,
              selectedCharacters.length > 0 &&
                styles.fixedBottomWithSelection,
            ]}
          >
            {selectedCharacters.length > 0 && (
              <View style={styles.selectionDock}>
                <View style={styles.selectionSummaryRow}>
                  <View style={styles.selectionCount}>
                    <Ionicons
                      name="layers-outline"
                      size={20}
                      color={COLORS.cyan}
                    />
                    <Text style={styles.selectionCountText}>
                      {selectedCharacters.length} Selected
                    </Text>
                  </View>

                  <Pressable
                    onPress={clearSelection}
                    hitSlop={8}
                  >
                    <Text style={styles.clearText}>Clear</Text>
                  </Pressable>
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.selectedChips}
                >
                  {selectedCharacters.map((character) => (
                    <View
                      key={character.id}
                      style={styles.selectedChip}
                    >
                      {renderAvatar(character, 34, true)}

                      <View style={styles.selectedChipTextWrap}>
                        <Text
                          numberOfLines={1}
                          style={styles.selectedChipName}
                        >
                          {character.name}
                        </Text>

                        <Text
                          numberOfLines={1}
                          style={styles.selectedChipRole}
                        >
                          {character.role}
                        </Text>
                      </View>

                      <Pressable
                        onPress={() => toggleSelected(character.id)}
                        hitSlop={7}
                        style={styles.selectedChipClose}
                      >
                        <Ionicons
                          name="close"
                          size={17}
                          color={COLORS.secondary}
                        />
                      </Pressable>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            <Pressable
              onPress={handleUseSelected}
              style={({ pressed }) => [
                styles.useSelectedButton,
                selectedCharacters.length === 0 &&
                  styles.useSelectedDisabled,
                pressed &&
                  selectedCharacters.length > 0 &&
                  styles.useSelectedPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Use selected characters"
            >
              <LinearGradient
                colors={["#00CFFF", "#2C75FF", "#8C2EFF"]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.useSelectedGradient}
              >
                <Text style={styles.useSelectedText}>
                  Use Selected
                  {selectedCharacters.length > 0
                    ? ` (${selectedCharacters.length})`
                    : ""}
                </Text>

                <Ionicons
                  name="arrow-forward"
                  size={28}
                  color="#FFFFFF"
                />
              </LinearGradient>
            </Pressable>

            <Text style={styles.securityNote}>
              <Ionicons
                name="lock-closed-outline"
                size={13}
                color={COLORS.muted}
              />{" "}
              Saved characters keep their look consistent across videos.
            </Text>
          </View>
        ) : (
          <View style={styles.libraryBottomCta}>
            <Pressable
              onPress={handleCreateNew}
              style={({ pressed }) => [
                styles.libraryCreateButton,
                pressed && styles.libraryCreatePressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Create new character"
            >
              <LinearGradient
                colors={["#00CFFF", "#2C75FF", "#8C2EFF"]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.libraryCreateGradient}
              >
                <Ionicons
                  name="add-circle-outline"
                  size={24}
                  color="#FFFFFF"
                  style={styles.libraryCreateIcon}
                />
                <Text style={styles.libraryCreateText}>
                  Create New Character
                </Text>
              </LinearGradient>
            </Pressable>
          </View>
        )}

        {/* =========================================================
            MORE MENU
           ========================================================= */}
        <Modal
          visible={moreMenu.visible}
          transparent
          animationType="fade"
          statusBarTranslucent
          onRequestClose={() =>
            setMoreMenu({ visible: false, character: null })
          }
        >
          <Pressable
            style={styles.modalRoot}
            onPress={() =>
              setMoreMenu({
                visible: false,
                character: null,
              })
            }
          >
            <Pressable
              style={styles.optionsSheet}
              onPress={() => {}}
            >
              <View style={styles.sheetHandle} />

              <View style={styles.optionsHeader}>
                <View style={styles.optionsHeaderLeft}>
                  {moreMenu.character &&
                    renderAvatar(moreMenu.character, 48, true)}

                  <View style={styles.optionsHeaderText}>
                    <Text style={styles.optionsName}>
                      {moreMenu.character?.name}
                    </Text>

                    <Text style={styles.optionsRole}>
                      {moreMenu.character?.role}
                    </Text>
                  </View>
                </View>

                <Pressable
                  onPress={() =>
                    setMoreMenu({
                      visible: false,
                      character: null,
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
                style={styles.optionRow}
                onPress={() =>
                  moreMenu.character &&
                  handleViewDetails(moreMenu.character)
                }
              >
                <Ionicons
                  name="eye-outline"
                  size={23}
                  color={COLORS.text}
                />
                <Text style={styles.optionText}>
                  View Details
                </Text>
              </Pressable>

              <Pressable
                style={styles.optionRow}
                onPress={() =>
                  moreMenu.character &&
                  handleEdit(moreMenu.character)
                }
              >
                <Ionicons
                  name="create-outline"
                  size={23}
                  color={COLORS.text}
                />
                <Text style={styles.optionText}>
                  Edit Character
                </Text>
              </Pressable>

              <Pressable
                style={styles.optionRow}
                onPress={() =>
                  moreMenu.character &&
                  handleDuplicate(moreMenu.character)
                }
              >
                <Ionicons
                  name="copy-outline"
                  size={23}
                  color={COLORS.text}
                />
                <Text style={styles.optionText}>
                  Duplicate
                </Text>
              </Pressable>

              <Pressable
                style={[styles.optionRow, styles.deleteRow]}
                onPress={() =>
                  moreMenu.character &&
                  handleDelete(moreMenu.character)
                }
              >
                <Ionicons
                  name="trash-outline"
                  size={23}
                  color={COLORS.danger}
                />
                <Text
                  style={[
                    styles.optionText,
                    styles.deleteText,
                  ]}
                >
                  Delete
                </Text>
              </Pressable>
            </Pressable>
          </Pressable>
        </Modal>

        {/* =========================================================
            FILTER MODAL
           ========================================================= */}
        <Modal
          visible={filterVisible}
          transparent
          animationType="fade"
          statusBarTranslucent
          onRequestClose={() => setFilterVisible(false)}
        >
          <Pressable
            style={styles.modalRoot}
            onPress={() => setFilterVisible(false)}
          >
            <Pressable
              style={styles.filterSheet}
              onPress={() => {}}
            >
              <View style={styles.sheetHandle} />

              <View style={styles.filterHeader}>
                <Text style={styles.filterTitle}>
                  Filter Characters
                </Text>

                <Pressable
                  onPress={() => setFilterVisible(false)}
                  hitSlop={8}
                >
                  <Ionicons
                    name="close"
                    size={23}
                    color={COLORS.secondary}
                  />
                </Pressable>
              </View>

              {(
                [
                  "All",
                  "Main Character",
                  "Supporting",
                ] as const
              ).map((item) => {
                const active = roleFilter === item;

                return (
                  <Pressable
                    key={item}
                    onPress={() => {
                      setRoleFilter(item);
                      setFilterVisible(false);
                    }}
                    style={[
                      styles.filterOption,
                      active && styles.filterOptionActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        active &&
                          styles.filterOptionTextActive,
                      ]}
                    >
                      {item === "All"
                        ? "All Characters"
                        : item}
                    </Text>

                    {active && (
                      <Ionicons
                        name="checkmark"
                        size={21}
                        color={COLORS.cyan}
                      />
                    )}
                  </Pressable>
                );
              })}
            </Pressable>
          </Pressable>
        </Modal>

        {/* =========================================================
            DETAILS MODAL
           ========================================================= */}
        <Modal
          visible={detailsCharacter !== null}
          transparent
          animationType="fade"
          statusBarTranslucent
          onRequestClose={() =>
            setDetailsCharacter(null)
          }
        >
          <Pressable
            style={styles.modalRoot}
            onPress={() => setDetailsCharacter(null)}
          >
            <Pressable
              style={styles.detailsSheet}
              onPress={() => {}}
            >
              <View style={styles.sheetHandle} />

              {detailsCharacter && (
                <>
                  <View style={styles.detailsTop}>
                    {renderAvatar(detailsCharacter, 86)}

                    <View style={styles.detailsIdentity}>
                      <Text style={styles.detailsName}>
                        {detailsCharacter.name}
                      </Text>

                      <Text style={styles.detailsRole}>
                        {detailsCharacter.role}
                      </Text>
                    </View>

                    <Pressable
                      onPress={() =>
                        setDetailsCharacter(null)
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

                  <View style={styles.detailBlock}>
                    <Text style={styles.detailLabel}>
                      Character Appearance
                    </Text>

                    <Text style={styles.detailText}>
                      {detailsCharacter.description}
                    </Text>
                  </View>

                  <View style={styles.detailsInfoRow}>
                    <View style={styles.detailsInfoPill}>
                      <Ionicons
                        name="bookmark-outline"
                        size={18}
                        color={COLORS.cyan}
                      />
                      <Text style={styles.detailsInfoText}>
                        Saved Character
                      </Text>
                    </View>

                    <View style={styles.detailsInfoPill}>
                      <Ionicons
                        name="sparkles-outline"
                        size={18}
                        color={COLORS.purple}
                      />
                      <Text style={styles.detailsInfoText}>
                        Reusable
                      </Text>
                    </View>
                  </View>
                </>
              )}
            </Pressable>
          </Pressable>
        </Modal>
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
    height: 50,
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
    paddingTop: 8,
  },

  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginBottom: 15,
  },

  searchBox: {
    flex: 1,
    height: 48,
    borderRadius: 15,
    borderWidth: 1.2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surfaceAlt,
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
    marginLeft: 9,
    paddingVertical: 0,
  },

  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 15,
    borderWidth: 1.2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },

  filterButtonActive: {
    borderColor: COLORS.cyanBorder,
    backgroundColor: "#08262E",
  },

  toolbar: {
    minHeight: 34,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  countGroup: {
    flexDirection: "row",
    alignItems: "center",
  },

  countTitle: {
    color: COLORS.text,
    fontSize: 15.5,
    lineHeight: 20,
    fontWeight: "700",
    letterSpacing: -0.2,
  },

  countPill: {
    minWidth: 30,
    height: 22,
    borderRadius: 11,
    marginLeft: 7,
    paddingHorizontal: 7,
    backgroundColor: "#0B2834",
    alignItems: "center",
    justifyContent: "center",
  },

  countPillText: {
    color: COLORS.secondary,
    fontSize: 10.5,
    lineHeight: 14,
    fontWeight: "700",
  },

  viewToggle: {
    height: 38,
    borderRadius: 13,
    borderWidth: 1.2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surfaceAlt,
    padding: 3,
    flexDirection: "row",
  },

  viewToggleButton: {
    width: 33,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  viewToggleButtonActive: {
    backgroundColor: "#0A2F3A",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
  },

  characterCard: {
    minHeight: 166,
    borderRadius: 18,
    borderWidth: 1.2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 9,
    overflow: "hidden",
    marginBottom: 0,
  },

  characterCardSelected: {
    borderColor: COLORS.cyanBorder,
    backgroundColor: "#08252D",
    shadowColor: COLORS.cyan,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 3,
  },

  cardTop: {
    height: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  cardTopSpacer: {
    width: 24,
    height: 24,
  },

  cardMore: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  selectionCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.3,
    borderColor: "#315362",
    backgroundColor: "#071822",
    alignItems: "center",
    justifyContent: "center",
  },

  selectionCircleSelected: {
    borderColor: COLORS.cyan,
    backgroundColor: COLORS.cyan,
  },

  cardAvatarWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
    marginBottom: 8,
  },

  avatar: {
    borderWidth: 1.15,
    borderColor: "#255A79",
    backgroundColor: "#0A202B",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
  },

  avatarImage: {
    alignSelf: "center",
  },

  cardName: {
    color: COLORS.text,
    fontSize: 13.5,
    lineHeight: 18,
    fontWeight: "700",
    textAlign: "left",
    marginHorizontal: 2,
  },

  cardRole: {
    marginTop: 2,
    color: COLORS.secondary,
    fontSize: 9.5,
    lineHeight: 13,
    fontWeight: "500",
    marginHorizontal: 2,
  },

  cardRoleMain: {
    color: COLORS.cyan,
  },

  createCard: {
    minHeight: 166,
    borderRadius: 18,
    borderWidth: 1.2,
    borderColor: "#214150",
    borderStyle: "dashed",
    backgroundColor: "#06151E",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },

  createCardIcon: {
    width: 52,
    height: 52,
    borderRadius: 17,
    borderWidth: 1.2,
    borderColor: COLORS.cyan,
    backgroundColor: "#07252D",
    alignItems: "center",
    justifyContent: "center",
  },

  createCardText: {
    marginTop: 10,
    color: COLORS.text,
    fontSize: 12.5,
    lineHeight: 16,
    fontWeight: "600",
    textAlign: "center",
  },

  createCardSubtext: {
    color: COLORS.secondary,
    fontSize: 10.5,
    lineHeight: 14,
    marginTop: 1,
    textAlign: "center",
  },

  listContainer: {
    gap: 10,
  },

  listCard: {
    minHeight: 82,
    borderRadius: 18,
    borderWidth: 1.2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  listCardSelected: {
    borderColor: COLORS.cyanBorder,
    backgroundColor: "#08252D",
  },

  listInfo: {
    flex: 1,
    minWidth: 0,
    marginLeft: 12,
    paddingRight: 6,
  },

  listName: {
    color: COLORS.text,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "700",
  },

  listRole: {
    marginTop: 2,
    color: COLORS.cyan,
    fontSize: 10.5,
    lineHeight: 14,
    fontWeight: "600",
  },

  listDescription: {
    marginTop: 4,
    color: COLORS.secondary,
    fontSize: 10.5,
    lineHeight: 14,
  },

  moreButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyState: {
    minHeight: 300,
    borderRadius: 20,
    borderWidth: 1.2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    marginTop: 6,
  },

  emptyIcon: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: "#08252D",
    borderWidth: 1.2,
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

  emptyButton: {
    height: 43,
    borderRadius: 21.5,
    borderWidth: 1.2,
    borderColor: COLORS.cyan,
    backgroundColor: "#08252D",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 16,
  },

  emptyButtonText: {
    color: COLORS.cyan,
    fontSize: 11.5,
    lineHeight: 16,
    fontWeight: "700",
  },

  libraryBottomCta: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.background,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: Platform.OS === "ios" ? 24 : 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(18, 62, 77, 0.3)",
    zIndex: 40,
  },

  libraryCreateButton: {
    width: "100%",
    height: 52,
    borderRadius: 26,
    overflow: "hidden",
  },

  libraryCreateGradient: {
    width: "100%",
    height: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  libraryCreateIcon: {
    marginRight: 8,
  },

  libraryCreateText: {
    color: "#FFFFFF",
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "700",
  },

  libraryCreatePressed: {
    transform: [{ scale: 0.985 }],
    opacity: 0.9,
  },

  selectionDock: {
    width: "100%",
    backgroundColor: "#071822",
    borderWidth: 1,
    borderColor: "#153B4A",
    borderRadius: 17,
    paddingHorizontal: 10,
    paddingTop: 7,
    paddingBottom: 6,
    marginBottom: 8,
  },

  selectionSummaryRow: {
    minHeight: 23,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  selectionCount: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  selectionCountText: {
    color: COLORS.text,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
  },

  clearText: {
    color: COLORS.cyan,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "600",
  },

  selectedChips: {
    paddingTop: 7,
    paddingBottom: 2,
    paddingRight: 4,
    gap: 8,
  },

  selectedChip: {
    minWidth: 150,
    maxWidth: 190,
    height: 50,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#204857",
    backgroundColor: "#06141D",
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
  },

  selectedChipTextWrap: {
    flex: 1,
    minWidth: 0,
    marginLeft: 8,
  },

  selectedChipName: {
    color: COLORS.text,
    fontSize: 10.5,
    lineHeight: 14,
    fontWeight: "700",
  },

  selectedChipRole: {
    marginTop: 1,
    color: COLORS.cyan,
    fontSize: 8.5,
    lineHeight: 12,
    fontWeight: "500",
  },

  selectedChipClose: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  fixedBottom: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.background,
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: Platform.OS === "ios" ? 10 : 8,
    zIndex: 50,
    elevation: 20,
  },

  fixedBottomWithSelection: {
    paddingTop: 7,
  },

  useSelectedButton: {
    width: "100%",
    height: 55,
    borderRadius: 28,
    overflow: "hidden",
    shadowColor: COLORS.cyan,
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 7,
  },

  useSelectedGradient: {
    width: "100%",
    height: 55,
    borderRadius: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  useSelectedText: {
    color: "#FFFFFF",
    fontSize: 16.5,
    lineHeight: 21,
    fontWeight: "700",
    marginRight: 16,
  },

  useSelectedDisabled: {
    opacity: 0.42,
  },

  useSelectedPressed: {
    transform: [{ scale: 0.985 }],
  },

  securityNote: {
    marginTop: 6,
    color: COLORS.muted,
    fontSize: 8.8,
    lineHeight: 13,
    textAlign: "center",
  },

  modalRoot: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.62)",
  },

  optionsSheet: {
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

  filterSheet: {
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

  sheetHandle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#59717B",
    marginBottom: 14,
  },

  optionsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 13,
  },

  optionsHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    minWidth: 0,
  },

  optionsHeaderText: {
    flex: 1,
    minWidth: 0,
    marginLeft: 11,
  },

  optionsName: {
    color: COLORS.text,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "700",
  },

  optionsRole: {
    marginTop: 2,
    color: COLORS.cyan,
    fontSize: 10.5,
    lineHeight: 14,
    fontWeight: "600",
  },

  optionRow: {
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

  optionText: {
    color: COLORS.text,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
    marginLeft: 11,
  },

  deleteRow: {
    borderColor: "#40212A",
    backgroundColor: "#1B0D12",
  },

  deleteText: {
    color: COLORS.danger,
  },

  filterHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  filterTitle: {
    color: COLORS.text,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: "700",
  },

  filterOption: {
    height: 52,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#173847",
    backgroundColor: "#06151E",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 9,
  },

  filterOptionActive: {
    borderColor: COLORS.cyanBorder,
    backgroundColor: "#08252D",
  },

  filterOptionText: {
    color: COLORS.secondary,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "600",
  },

  filterOptionTextActive: {
    color: COLORS.text,
  },

  detailsTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  detailsIdentity: {
    flex: 1,
    minWidth: 0,
    marginLeft: 12,
  },

  detailsName: {
    color: COLORS.text,
    fontSize: 20,
    lineHeight: 25,
    fontWeight: "800",
  },

  detailsRole: {
    marginTop: 3,
    color: COLORS.cyan,
    fontSize: 11.5,
    lineHeight: 15,
    fontWeight: "600",
  },

  detailBlock: {
    marginTop: 18,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#06151E",
    padding: 14,
  },

  detailLabel: {
    color: COLORS.secondary,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "600",
    marginBottom: 7,
  },

  detailText: {
    color: COLORS.text,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "500",
  },

  detailsInfoRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },

  detailsInfoPill: {
    height: 38,
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surfaceAlt,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  detailsInfoText: {
    color: COLORS.secondary,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "600",
  },
});