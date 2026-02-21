// ============================================================================
// NUMBER INPUT GROUP - Row of labeled numeric inputs
// Used for Pregnancy History (Gravida, Para, Term, etc.)
// ============================================================================

import React from 'react';
import { View, Text, TextInput } from 'react-native';

interface NumberField {
  label: string;
  value: number | null;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

interface NumberInputGroupProps {
  title?: string;
  fields: NumberField[];
  columns?: 2 | 3 | 4;
}

export const NumberInputGroup = ({ title, fields, columns = 3 }: NumberInputGroupProps) => {
  const widthClass = columns === 2 ? 'w-1/2' : columns === 3 ? 'w-1/3' : 'w-1/4';

  return (
    <View className="mb-4">
      {title && <Text className="mb-3 text-sm font-semibold text-cyan-400">{title}</Text>}
      <View className="-mx-1 flex-row flex-wrap">
        {fields.map((field) => (
          <View key={field.label} className={`${widthClass} mb-3 px-1`}>
            <Text className="mb-1.5 ml-1 text-xs text-slate-400">{field.label}</Text>
            <TextInput
              className="rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3 text-center text-white"
              keyboardType="numeric"
              value={(field.value ?? 0).toString()}
              onChangeText={(text) => {
                const num = parseInt(text, 10);
                if (isNaN(num)) {
                  field.onChange(0);
                  return;
                }
                const clamped = Math.max(field.min ?? 0, Math.min(field.max ?? 99, num));
                field.onChange(clamped);
              }}
              placeholderTextColor="#64748b"
              placeholder="0"
            />
          </View>
        ))}
      </View>
    </View>
  );
};
