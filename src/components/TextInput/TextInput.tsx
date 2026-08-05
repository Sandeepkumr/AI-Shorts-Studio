import {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput as NativeTextInput,
  View,
} from "react-native";

import { createTextInputStyles } from "./TextInput.styles";
import type { TextInputProps } from "./TextInput.types";
import { useTheme } from "../../theme";

export const TextInput = forwardRef<NativeTextInput, TextInputProps>(
  function TextInput(
    {
      label,
      helperText,
      errorText,
      successText,
      value,
      defaultValue = "",
      onChangeText,
      leftIcon,
      rightIcon,
      passwordToggle = false,
      secureTextEntry = false,
      multiline = false,
      loading = false,
      disabled = false,
      showCharacterCount = false,
      clearable = false,
      onClear,
      containerStyle,
      inputStyle,
      onFocus,
      onBlur,
      placeholderTextColor,
      accessibilityLabel,
      accessibilityState,
      maxLength,
      ...nativeProps
    },
    forwardedRef,
  ) {
    const theme = useTheme();
    const styles = useMemo(() => createTextInputStyles(theme), [theme]);
    const inputRef = useRef<NativeTextInput>(null);
    const [internalValue, setInternalValue] = useState(defaultValue);
    const [passwordVisible, setPasswordVisible] = useState(false);

    const isControlled = value !== undefined;
    const currentValue = isControlled ? value : internalValue;
    const isDisabled = disabled || loading;
    const hasError = Boolean(errorText);
    const hasSuccess = Boolean(successText) && !hasError;
    const message = errorText || successText || helperText;
    const canTogglePassword = passwordToggle || secureTextEntry;

    useImperativeHandle(
      forwardedRef,
      () => inputRef.current as NativeTextInput,
      [],
    );

    const handleChangeText = (nextValue: string) => {
      if (!isControlled) {
        setInternalValue(nextValue);
      }

      onChangeText?.(nextValue);
    };

    const handleClear = () => {
      handleChangeText("");
      onClear?.();
      inputRef.current?.focus();
    };

    return (
      <View style={[styles.container, containerStyle]}>
        {label ? <Text style={styles.label}>{label}</Text> : null}

        <View
          style={[
            styles.inputContainer,
            hasError && styles.inputContainerError,
            hasSuccess && styles.inputContainerSuccess,
            isDisabled && styles.inputContainerDisabled,
            multiline && { alignItems: "flex-start" },
          ]}
        >
          {leftIcon ? (
            <View style={styles.iconContainer}>{leftIcon}</View>
          ) : null}

          <NativeTextInput
            ref={inputRef}
            {...nativeProps}
            accessibilityLabel={accessibilityLabel ?? label}
            accessibilityState={{
              ...accessibilityState,
              disabled: isDisabled,
            }}
            editable={!isDisabled}
            maxLength={maxLength}
            multiline={multiline}
            onBlur={onBlur}
            onChangeText={handleChangeText}
            onFocus={onFocus}
            placeholderTextColor={
              placeholderTextColor ?? theme.colors.textSecondary
            }
            secureTextEntry={
              canTogglePassword ? !passwordVisible : secureTextEntry
            }
            style={[
              styles.input,
              multiline && styles.multilineInput,
              inputStyle,
            ]}
            value={currentValue}
          />

          <View style={styles.rightActions}>
            {loading ? (
              <ActivityIndicator color={theme.colors.primary} size="small" />
            ) : null}

            {clearable && currentValue.length > 0 && !isDisabled ? (
              <Pressable
                accessibilityLabel="Clear text"
                accessibilityRole="button"
                onPress={handleClear}
                style={styles.actionButton}
              >
                <Text style={styles.clearText}>×</Text>
              </Pressable>
            ) : null}

            {canTogglePassword && !loading ? (
              <Pressable
                accessibilityLabel={
                  passwordVisible ? "Hide password" : "Show password"
                }
                accessibilityRole="button"
                onPress={() => setPasswordVisible((visible) => !visible)}
                style={styles.actionButton}
              >
                <Text style={styles.actionText}>
                  {passwordVisible ? "Hide" : "Show"}
                </Text>
              </Pressable>
            ) : null}

            {rightIcon && !loading ? (
              <View style={styles.iconContainer}>{rightIcon}</View>
            ) : null}
          </View>
        </View>

        {message || showCharacterCount ? (
          <View style={styles.footer}>
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
            ) : (
              <View />
            )}

            {showCharacterCount ? (
              <Text style={styles.counter}>
                {currentValue.length}
                {maxLength ? `/${maxLength}` : ""}
              </Text>
            ) : null}
          </View>
        ) : null}
      </View>
    );
  },
);

TextInput.displayName = "TextInput";
