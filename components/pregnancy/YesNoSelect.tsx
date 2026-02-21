// ============================================================================
// YES/NO SELECT - Toggle for boolean questions
// Used for NCD Assessment yes/no questions
// ============================================================================

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface YesNoSelectProps {
  label: string;
  value: boolean | null;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  /** Show a third "Don't Know" option */
  showDontKnow?: boolean;
  onDontKnow?: () => void;
}

export const YesNoSelect = ({
  label,
  value,
  onChange,
  disabled = false,
  showDontKnow = false,
  onDontKnow,
}: YesNoSelectProps) => (
  <View className="mb-4">
    <Text className="mb-2 text-sm text-slate-300">{label}</Text>
    <View className="flex-row gap-2">
      <TouchableOpacity
        onPress={() => !disabled && onChange(true)}
        className={`flex-1 items-center rounded-xl border py-2.5 ${
          value === true ? 'border-green-500 bg-green-600/20' : 'border-slate-700 bg-slate-800/50'
        } ${disabled ? 'opacity-50' : ''}`}
        activeOpacity={disabled ? 1 : 0.7}>
        <Text className={`font-medium ${value === true ? 'text-green-400' : 'text-slate-400'}`}>
          Yes
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => !disabled && onChange(false)}
        className={`flex-1 items-center rounded-xl border py-2.5 ${
          value === false ? 'border-red-500 bg-red-600/20' : 'border-slate-700 bg-slate-800/50'
        } ${disabled ? 'opacity-50' : ''}`}
        activeOpacity={disabled ? 1 : 0.7}>
        <Text className={`font-medium ${value === false ? 'text-red-400' : 'text-slate-400'}`}>
          No
        </Text>
      </TouchableOpacity>
      {showDontKnow && (
        <TouchableOpacity
          onPress={() => !disabled && onDontKnow?.()}
          className={`flex-1 items-center rounded-xl border py-2.5 ${
            value === null ? 'border-amber-500 bg-amber-600/20' : 'border-slate-700 bg-slate-800/50'
          } ${disabled ? 'opacity-50' : ''}`}
          activeOpacity={disabled ? 1 : 0.7}>
          <Text
            className={`text-xs font-medium ${
              value === null ? 'text-amber-400' : 'text-slate-400'
            }`}>
            Don't Know
          </Text>
        </TouchableOpacity>
      )}
    </View>
  </View>
);
