import React from 'react';
import { View, Text } from 'react-native';

export function ChatBubble({ text, fromUser }: { text: string; fromUser?: boolean }) {
  return (
    <View className={`${fromUser ? 'items-end' : 'items-start'} mb-3`}>
      <View className={`${fromUser ? 'bg-blue-600' : 'bg-slate-700'} max-w-[80%] rounded-2xl p-3`}>
        <Text className="text-white">{text}</Text>
      </View>
    </View>
  );
}
