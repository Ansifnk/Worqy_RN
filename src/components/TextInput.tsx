import React, { useState, forwardRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { colors } from '../utils/colors';

export interface TextInputProps extends RNTextInputProps {
  label?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  rightAccessory?: React.ReactNode;
  isPassword?: boolean;
  error?: string;
  helperText?: string;
  containerStyle?: StyleProp<ViewStyle>;
  inputContainerStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  inputStyle?: StyleProp<TextStyle>;
  errorStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
}

export const TextInput = forwardRef<React.ElementRef<typeof RNTextInput>, TextInputProps>(
  (
    {
      label,
      leftIcon,
      rightIcon,
      rightAccessory,
      isPassword = false,
      error,
      helperText,
      containerStyle,
      inputContainerStyle,
      labelStyle,
      inputStyle,
      errorStyle,
      disabled = false,
      secureTextEntry,
      onFocus,
      onBlur,
      placeholderTextColor = colors.textSecondary,
      style,
      ...restProps
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleFocus: RNTextInputProps['onFocus'] = (e) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur: RNTextInputProps['onBlur'] = (e) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    const isSecure = isPassword ? !showPassword : (secureTextEntry ?? false);

    return (
      <View style={[styles.container, containerStyle]}>
        {label ? <Text style={[styles.label, labelStyle]}>{label}</Text> : null}

        <View
          style={[
            styles.inputContainer,
            isFocused ? styles.inputContainerFocused : null,
            error ? styles.inputContainerError : null,
            disabled ? styles.inputContainerDisabled : null,
            inputContainerStyle,
          ]}
        >
          {leftIcon ? <View style={styles.leftIconContainer}>{leftIcon}</View> : null}

          <RNTextInput
            ref={ref}
            editable={!disabled}
            placeholderTextColor={placeholderTextColor}
            secureTextEntry={isSecure}
            onFocus={handleFocus}
            onBlur={handleBlur}
            style={[
              styles.input,
              isPassword || rightIcon || rightAccessory ? styles.inputWithRightElement : null,
              inputStyle,
              style,
            ]}
            {...restProps}
          />

          {rightAccessory ? (
            <View style={styles.accessoryContainer}>{rightAccessory}</View>
          ) : null}

          {isPassword ? (
            <TouchableOpacity
              style={styles.eyeToggle}
              onPress={() => setShowPassword(!showPassword)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              activeOpacity={0.7}
              disabled={disabled}
            >
              {showPassword ? (
                <Eye size={20} color={colors.textSecondary} strokeWidth={2} />
              ) : (
                <EyeOff size={20} color={colors.textSecondary} strokeWidth={2} />
              )}
            </TouchableOpacity>
          ) : rightIcon ? (
            <View style={styles.rightIconContainer}>{rightIcon}</View>
          ) : null}
        </View>

        {error ? (
          <Text style={[styles.errorText, errorStyle]}>{error}</Text>
        ) : helperText ? (
          <Text style={styles.helperText}>{helperText}</Text>
        ) : null}
      </View>
    );
  }
);

TextInput.displayName = 'TextInput';

export default TextInput;

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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 54,
    borderRadius: 27,
    backgroundColor: '#EEF5F2',
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
  },
  inputContainerFocused: {
    borderColor: colors.primary,
    backgroundColor: '#F3F9F6',
  },
  inputContainerError: {
    borderColor: colors.error,
  },
  inputContainerDisabled: {
    opacity: 0.6,
  },
  leftIconContainer: {
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightIconContainer: {
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  accessoryContainer: {
    marginRight: 6,
  },
  eyeToggle: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    height: '100%',
    paddingVertical: 0,
  },
  inputWithRightElement: {
    paddingRight: 6,
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
});
