// ============================================================================
// FORM INPUT - Reusable text input for pregnancy forms
// Mirrors the FormInputComponent pattern from YakapFormScreen
// ============================================================================

import React from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';

interface FormInputProps extends Omit<TextInputProps, 'value' | 'onChangeText'> {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  hasError?: boolean;
  errorMessage?: string;
  hint?: string;
  disabled?: boolean;
}

export const FormInput = ({
  label,
  value,
  onChangeText,
  hasError,
  errorMessage,
  hint,
  disabled = false,
  placeholder,
  keyboardType = 'default',
  autoCapitalize = 'words',
  ...rest
}: FormInputProps) => (
  <View className="mb-4">
    <Text className="mb-1.5 ml-1 text-xs text-slate-400">{label}</Text>
    <TextInput
      className={`rounded-xl border bg-slate-800/50 px-4 py-3 text-white ${
        hasError ? 'border-red-500' : 'border-slate-700'
      } ${disabled ? 'opacity-50' : ''}`}
      placeholder={placeholder || label}
      placeholderTextColor="#64748b"
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
      editable={!disabled}
      {...rest}
    />
    {hint && !hasError && <Text className="ml-1 mt-1 text-xs text-slate-500">{hint}</Text>}
    {hasError && errorMessage && (
      <Text className="ml-1 mt-1 text-xs text-red-400">{errorMessage}</Text>
    )}
  </View>
);
