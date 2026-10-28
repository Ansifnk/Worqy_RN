import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { ChevronDown, Check } from 'lucide-react-native';
import { colors } from '../utils/colors';
import BottomSheet from './BottomSheet';

export interface SelectOption {
  label: string;
  value: string;
  icon?: React.ReactNode;
  badgeColor?: string;
  description?: string;
}

export interface SelectDropdownProps {
  label?: string;
  placeholder?: string;
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  sheetTitle?: string;
}

export const SelectDropdown: React.FC<SelectDropdownProps> = ({
  label,
  placeholder = 'Select an option',
  options,
  value,
  onChange,
  error,
  helperText,
  disabled = false,
  leftIcon,
  containerStyle,
  sheetTitle,
}) => {
  const [sheetVisible, setSheetVisible] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value);

  const handleSelect = (optionValue: string) => {
    onChange?.(optionValue);
    setSheetVisible(false);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      {/* Trigger Button */}
      <TouchableOpacity
        style={[
          styles.trigger,
          error ? styles.triggerError : null,
          disabled ? styles.triggerDisabled : null,
        ]}
        onPress={() => !disabled && setSheetVisible(true)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={label || placeholder}
      >
        {leftIcon ? <View style={styles.leftIconWrapper}>{leftIcon}</View> : null}

        <View style={styles.valueWrapper}>
          {selectedOption ? (
            <View style={styles.selectedRow}>
              {selectedOption.icon ? (
                <View style={styles.optionIcon}>{selectedOption.icon}</View>
              ) : null}
              {selectedOption.badgeColor ? (
                <View
                  style={[
                    styles.colorDot,
                    { backgroundColor: selectedOption.badgeColor },
                  ]}
                />
              ) : null}
              <Text style={styles.valueText} numberOfLines={1}>
                {selectedOption.label}
              </Text>
            </View>
          ) : (
            <Text style={styles.placeholderText} numberOfLines={1}>
              {placeholder}
            </Text>
          )}
        </View>

        <ChevronDown size={18} color={colors.textSecondary} strokeWidth={2} />
      </TouchableOpacity>

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : helperText ? (
        <Text style={styles.helperText}>{helperText}</Text>
      ) : null}

      {/* Options Picker Sheet */}
      <BottomSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        title={sheetTitle || label || 'Select Option'}
        maxHeightRatio={0.7}
      >
        <ScrollView
          style={styles.optionsList}
          contentContainerStyle={styles.optionsContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.optionItem,
                  isSelected && styles.optionItemSelected,
                ]}
                onPress={() => handleSelect(option.value)}
                activeOpacity={0.7}
              >
                <View style={styles.optionLeft}>
                  {option.badgeColor ? (
                    <View
                      style={[
                        styles.colorDotLarge,
                        { backgroundColor: option.badgeColor },
                      ]}
                    />
                  ) : null}
                  {option.icon ? (
                    <View style={styles.optionIconLarge}>{option.icon}</View>
                  ) : null}
                  <View>
                    <Text
                      style={[
                        styles.optionLabel,
                        isSelected && styles.optionLabelSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                    {option.description ? (
                      <Text style={styles.optionDesc}>{option.description}</Text>
                    ) : null}
                  </View>
                </View>

                {isSelected ? (
                  <View style={styles.checkWrapper}>
                    <Check size={18} color={colors.primary} strokeWidth={2.5} />
                  </View>
                ) : null}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </BottomSheet>
    </View>
  );
};

export default SelectDropdown;

const styles = StyleSheet.create({
  container: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    marginLeft: 4,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 54,
    borderRadius: 10,
    backgroundColor: '#EEF5F2',
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
  },
  triggerError: {
    borderColor: colors.error,
  },
  triggerDisabled: {
    opacity: 0.6,
  },
  leftIconWrapper: {
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  valueWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  selectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  colorDotLarge: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  optionIcon: {
    marginRight: 8,
  },
  optionIconLarge: {
    marginRight: 12,
  },
  valueText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
  },
  placeholderText: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginTop: 5,
    marginLeft: 8,
    fontWeight: '500',
  },
  helperText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 5,
    marginLeft: 8,
  },
  optionsList: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  optionsContent: {
    paddingBottom: 24,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: 6,
    backgroundColor: '#F8FAFC',
  },
  optionItemSelected: {
    backgroundColor: '#EAF6EE',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
  },
  optionLabelSelected: {
    color: colors.primary,
    fontWeight: '700',
  },
  optionDesc: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  checkWrapper: {
    marginLeft: 10,
  },
});
