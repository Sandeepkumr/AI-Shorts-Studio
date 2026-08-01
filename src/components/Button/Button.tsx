import { useMemo } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { createButtonStyles } from "./Button.styles";
import type { ButtonProps } from "./Button.types";
import { useTheme } from "../../theme";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button({
  children,
  variant = "primary",
  size = "medium",
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  style,
  textStyle,
  onPressIn,
  onPressOut,
  accessibilityState,
  ...pressableProps
}: ButtonProps) {
  const theme = useTheme();
  const buttonStyles = useMemo(() => createButtonStyles(theme), [theme]);
  const scale = useSharedValue(1);
  const isDisabled = disabled || loading;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn: NonNullable<ButtonProps["onPressIn"]> = (event) => {
    if (!isDisabled) {
      scale.value = withSpring(0.97, { damping: 18, stiffness: 400 });
    }

    onPressIn?.(event);
  };

  const handlePressOut: NonNullable<ButtonProps["onPressOut"]> = (event) => {
    scale.value = withSpring(1, { damping: 18, stiffness: 400 });
    onPressOut?.(event);
  };

  return (
    <AnimatedPressable
      {...pressableProps}
      accessibilityRole="button"
      accessibilityState={{
        ...accessibilityState,
        busy: loading,
        disabled: isDisabled,
      }}
      disabled={isDisabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        buttonStyles.styles.button,
        buttonStyles.variants[variant],
        buttonStyles.sizes[size],
        fullWidth && buttonStyles.styles.fullWidth,
        isDisabled && buttonStyles.styles.disabled,
        animatedStyle,
        style,
      ]}
    >
      <View style={buttonStyles.styles.content}>
        {loading ? (
          <ActivityIndicator
            accessibilityLabel="Loading"
            color={buttonStyles.textVariants[variant].color}
          />
        ) : (
          <>
            {leftIcon ? (
              <View style={buttonStyles.styles.leftIcon}>{leftIcon}</View>
            ) : null}

            <Text
              style={[
                buttonStyles.textSizes[size],
                buttonStyles.textVariants[variant],
                textStyle,
              ]}
            >
              {children}
            </Text>

            {rightIcon ? (
              <View style={buttonStyles.styles.rightIcon}>{rightIcon}</View>
            ) : null}
          </>
        )}
      </View>
    </AnimatedPressable>
  );
}
