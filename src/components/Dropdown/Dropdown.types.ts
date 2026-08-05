import type { StyleProp, ViewStyle } from "react-native";

export type DropdownOption = {
  label: string;
  value: string;
  description?: string;
  disabled?: boolean;
};

export type DropdownProps = {
  options: DropdownOption[];
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (option: DropdownOption | null) => void;
  label?: string;
  placeholder?: string;
  helperText?: string;
  errorText?: string;
  successText?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  disabled?: boolean;
  loading?: boolean;
  clearable?: boolean;
  emptyStateText?: string;
  onOpenChange?: (isOpen: boolean) => void;
  containerStyle?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  testID?: string;
};
