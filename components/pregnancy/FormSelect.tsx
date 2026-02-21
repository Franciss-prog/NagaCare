// ============================================================================
// FORM SELECT - Dropdown selector adapted from YakapFormScreen
// ============================================================================

import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { ChevronDown } from 'lucide-react-native';

interface FormSelectProps {
  label: string;
  value: string;
  options: { value: string; label: string }[] | string[];
  placeholder?: string;
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (value: string) => void;
  hasError?: boolean;
  errorMessage?: string;
  disabled?: boolean;
}

export const FormSelect = ({
  label,
  value,
  options,
  placeholder,
  isOpen,
  onToggle,
  onSelect,
  hasError,
  errorMessage,
  disabled = false,
}: FormSelectProps) => {
  // Normalize options to { value, label } format
  const normalizedOptions = options.map((opt) =>
    typeof opt === 'string' ? { value: opt, label: opt } : opt
  );

  const selectedLabel = normalizedOptions.find((o) => o.value === value)?.label || '';

  return (
    <View className="mb-4">
      <Text className="mb-1.5 ml-1 text-xs text-slate-400">{label}</Text>
      <TouchableOpacity
        onPress={disabled ? undefined : onToggle}
        className={`flex-row items-center justify-between rounded-xl border bg-slate-800/50 px-4 py-3 ${
          hasError ? 'border-red-500' : 'border-slate-700'
        } ${disabled ? 'opacity-50' : ''}`}>
        <Text className={selectedLabel ? 'text-white' : 'text-slate-500'}>
          {selectedLabel || placeholder || `Select ${label}`}
        </Text>
        <ChevronDown size={18} {...{ color: '#64748b' }} />
      </TouchableOpacity>

      {isOpen && (
        <View className="mt-2 max-h-48 rounded-xl border border-slate-700 bg-slate-800">
          <ScrollView nestedScrollEnabled>
            {normalizedOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => onSelect(option.value)}
                className={`border-b border-slate-700/50 px-4 py-3 ${
                  value === option.value ? 'bg-cyan-600/20' : ''
                }`}>
                <Text className={value === option.value ? 'text-cyan-400' : 'text-white'}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
      {hasError && errorMessage && (
        <Text className="ml-1 mt-1 text-xs text-red-400">{errorMessage}</Text>
      )}
    </View>
  );
};
