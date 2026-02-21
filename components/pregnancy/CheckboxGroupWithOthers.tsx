// ============================================================================
// CHECKBOX GROUP WITH OTHERS - Multi-select checkboxes + free text
// Used for General Survey sections (HEENT, Chest, Heart, etc.)
// ============================================================================

import React from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Check } from 'lucide-react-native';

interface CheckboxGroupWithOthersProps {
  label: string;
  options: string[];
  selected: string[];
  others: string;
  onToggle: (option: string) => void;
  onOthersChange: (text: string) => void;
  disabled?: boolean;
}

export const CheckboxGroupWithOthers = ({
  label,
  options,
  selected,
  others,
  onToggle,
  onOthersChange,
  disabled = false,
}: CheckboxGroupWithOthersProps) => (
  <View className="mb-5">
    <Text className="mb-3 text-sm font-semibold text-cyan-400">{label}</Text>
    <View className="flex-row flex-wrap">
      {options.map((option) => {
        const isSelected = selected.includes(option);
        return (
          <TouchableOpacity
            key={option}
            onPress={() => !disabled && onToggle(option)}
            className={`mb-2 mr-2 flex-row items-center rounded-lg border px-3 py-2 ${
              isSelected ? 'border-cyan-500 bg-cyan-600/20' : 'border-slate-700 bg-slate-800/50'
            } ${disabled ? 'opacity-50' : ''}`}
            activeOpacity={disabled ? 1 : 0.7}>
            <View
              className={`mr-2 h-5 w-5 items-center justify-center rounded border ${
                isSelected ? 'border-cyan-500 bg-cyan-600' : 'border-slate-500'
              }`}>
              {isSelected && <Check size={12} {...{ color: 'white' }} />}
            </View>
            <Text className={`text-xs ${isSelected ? 'text-cyan-300' : 'text-slate-300'}`}>
              {option}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>

    {/* Others free-text field */}
    <View className="mt-2">
      <Text className="mb-1.5 ml-1 text-xs text-slate-400">Others (specify)</Text>
      <TextInput
        className="rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-white"
        placeholder="Other findings..."
        placeholderTextColor="#64748b"
        value={others}
        onChangeText={onOthersChange}
        editable={!disabled}
        multiline
      />
    </View>
  </View>
);
