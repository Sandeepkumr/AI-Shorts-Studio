import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

import { createDropdownStyles } from "./Dropdown.styles";
import type { DropdownOption, DropdownProps } from "./Dropdown.types";
import { useTheme } from "../../theme";

export function Dropdown({
  options,
  value,
  defaultValue = null,
  onChange,
  label,
  placeholder = "Select an option",
  helperText,
  errorText,
  successText,
  searchable = false,
  searchPlaceholder = "Search options",
  disabled = false,
  loading = false,
  clearable = false,
  emptyStateText = "No options found",
  onOpenChange,
  containerStyle,
  accessibilityLabel,
  testID,
}: DropdownProps) {
  const theme = useTheme();
  const styles = useMemo(() => createDropdownStyles(theme), [theme]);
  const [internalValue, setInternalValue] = useState<string | null>(
    defaultValue,
  );
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");

  const isControlled = value !== undefined;
  const selectedValue = isControlled ? value : internalValue;
  const selectedOption =
    options.find((option) => option.value === selectedValue) ?? null;
  const isDisabled = disabled || loading;
  const hasError = Boolean(errorText);
  const hasSuccess = Boolean(successText) && !hasError;
  const message = errorText || successText || helperText;

  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return options;
    }

    return options.filter((option) => {
      const content = `${option.label} ${option.description ?? ""}`;
      return content.toLowerCase().includes(normalizedQuery);
    });
  }, [options, query]);

  const openPicker = () => {
    if (isDisabled) {
      return;
    }

    setQuery("");
    setIsOpen(true);
    onOpenChange?.(true);
  };

  const closePicker = () => {
    setIsOpen(false);
    onOpenChange?.(false);
  };

  const selectOption = (option: DropdownOption) => {
    if (option.disabled) {
      return;
    }

    if (!isControlled) {
      setInternalValue(option.value);
    }

    onChange?.(option);
    closePicker();
  };

  const clearSelection = () => {
    if (!isControlled) {
      setInternalValue(null);
    }

    onChange?.(null);
  };

  return (
    <View style={[styles.container, containerStyle]} testID={testID}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <Pressable
        accessibilityHint="Opens a list of options"
        accessibilityLabel={accessibilityLabel ?? label ?? placeholder}
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled, expanded: isOpen }}
        disabled={isDisabled}
        onPress={openPicker}
        style={[
          styles.trigger,
          hasError && styles.triggerError,
          hasSuccess && styles.triggerSuccess,
          isDisabled && styles.triggerDisabled,
        ]}
      >
        <Text
          numberOfLines={1}
          style={[styles.triggerText, !selectedOption && styles.placeholder]}
        >
          {selectedOption?.label ?? placeholder}
        </Text>

        {loading ? (
          <ActivityIndicator color={theme.colors.primary} size="small" />
        ) : (
          <>
            {clearable && selectedOption ? (
              <Pressable
                accessibilityLabel="Clear selection"
                accessibilityRole="button"
                hitSlop={8}
                onPress={(event) => {
                  event.stopPropagation();
                  clearSelection();
                }}
                style={styles.actionButton}
              >
                <Text style={styles.clearText}>×</Text>
              </Pressable>
            ) : null}
            <Text style={styles.chevron}>⌄</Text>
          </>
        )}
      </Pressable>

      {message ? (
        <Text
          accessibilityLiveRegion="polite"
          style={
            hasError
              ? styles.errorText
              : hasSuccess
                ? styles.successText
                : styles.helperText
          }
        >
          {message}
        </Text>
      ) : null}

      <Modal
        animationType="slide"
        onRequestClose={closePicker}
        transparent
        visible={isOpen}
      >
        <KeyboardAvoidingView
          accessibilityViewIsModal
          behavior={Platform.select({ android: undefined, ios: "padding" })}
          style={styles.modalRoot}
        >
          <Pressable
            accessibilityLabel="Close options"
            onPress={closePicker}
            style={styles.backdrop}
          />

          <View style={styles.sheet}>
            <View style={styles.handle} />

            <View style={styles.header}>
              <Text style={styles.sheetTitle}>{label ?? placeholder}</Text>
              <Pressable
                accessibilityLabel="Close options"
                accessibilityRole="button"
                onPress={closePicker}
                style={styles.actionButton}
              >
                <Text style={styles.clearText}>×</Text>
              </Pressable>
            </View>

            {searchable ? (
              <View style={styles.searchContainer}>
                <Text style={styles.chevron}>⌕</Text>
                <TextInput
                  accessibilityLabel="Search options"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoFocus
                  onChangeText={setQuery}
                  placeholder={searchPlaceholder}
                  placeholderTextColor={theme.colors.textSecondary}
                  returnKeyType="search"
                  style={styles.searchInput}
                  value={query}
                />
              </View>
            ) : null}

            <FlatList
              contentContainerStyle={styles.listContent}
              data={filteredOptions}
              keyExtractor={(item) => item.value}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>{emptyStateText}</Text>
                </View>
              }
              renderItem={({ item }) => {
                const selected = item.value === selectedValue;

                return (
                  <Pressable
                    accessibilityRole="radio"
                    accessibilityState={{
                      disabled: item.disabled,
                      selected,
                    }}
                    disabled={item.disabled}
                    onPress={() => selectOption(item)}
                    style={[
                      styles.option,
                      selected && styles.optionSelected,
                      item.disabled && styles.optionDisabled,
                    ]}
                  >
                    <View style={styles.optionTextContainer}>
                      <Text
                        numberOfLines={1}
                        style={[
                          styles.optionLabel,
                          selected && styles.optionLabelSelected,
                        ]}
                      >
                        {item.label}
                      </Text>
                      {item.description ? (
                        <Text style={styles.optionDescription}>
                          {item.description}
                        </Text>
                      ) : null}
                    </View>
                    {selected ? <Text style={styles.checkmark}>✓</Text> : null}
                  </Pressable>
                );
              }}
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
