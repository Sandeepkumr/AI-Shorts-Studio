import type { ReactNode } from "react";
import type {
  StyleProp,
  TextInputProps as NativeTextInputProps,
  TextStyle,
  ViewStyle,
} from "react-native";

export type TextInputProps = Omit<
  NativeTextInputProps,
  | "defaultValue"
  | "editable"
  | "multiline"
  | "onChangeText"
  | "secureTextEntry"
  | "style"
  | "value"
> & {
  label?: string;
  helperText?: string;
  errorText?: string;
  successText?: string;
  value?: string;
  defaultValue?: string;
  onChangeText?: (value: string) => void;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  passwordToggle?: boolean;
  secureTextEntry?: boolean;
  multiline?: boolean;
  loading?: boolean;
  disabled?: boolean;
  showCharacterCount?: boolean;
  clearable?: boolean;
  onClear?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
};
