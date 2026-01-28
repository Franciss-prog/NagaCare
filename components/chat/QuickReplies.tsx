// ============================================================================
// QUICK REPLIES - Suggested actions in chat
// ============================================================================

import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { QuickReply } from '../../types/aramon';

interface QuickRepliesProps {
  options: QuickReply[];
  onSelect: (value: string) => void;
}

export const QuickReplies: React.FC<QuickRepliesProps> = ({
  options,
  onSelect,
}) => {
  return (
    <View className="my-2">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 4 }}
      >
        {options.map((option) => (
          <TouchableOpacity
            key={option.id}
            onPress={() => onSelect(option.value)}
            activeOpacity={0.7}
            className="mr-2 bg-slate-800 border border-cyan-600/50 rounded-full px-4 py-2.5"
          >
            <Text className="text-cyan-400 font-medium text-sm">
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default QuickReplies;
