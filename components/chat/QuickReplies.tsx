// ============================================================================
// QUICK REPLIES - Modern pill buttons for suggested actions
// ============================================================================

import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
    <View className="my-3">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingLeft: 0, paddingRight: 16 }}
      >
        {options.map((option, index) => (
          <TouchableOpacity
            key={option.id}
            onPress={() => onSelect(option.value)}
            activeOpacity={0.8}
            className="mr-2"
          >
            <View 
              className="rounded-2xl px-4 py-2.5 border"
              style={{
                backgroundColor: 'rgba(15, 23, 42, 0.8)',
                borderColor: 'rgba(249, 115, 22, 0.3)',
              }}
            >
              <Text className="text-white font-medium text-sm">
                {option.label}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default QuickReplies;
