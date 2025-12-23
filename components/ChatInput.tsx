import React from 'react';
import { View, TextInput, TouchableOpacity, Text } from 'react-native';

export default function ChatInput({ placeholder }: { placeholder?: string }) {
  return (
    <View className="flex-row items-center bg-slate-900 p-3">
      <TextInput
        className="mr-3 flex-1 rounded-full bg-slate-800 px-4 py-2 text-white"
        placeholder={placeholder || 'Type a message'}
        placeholderTextColor="#9CA3AF"
      />
      <TouchableOpacity className="h-12 w-12 items-center justify-center rounded-full bg-blue-600">
        <Text className="text-white">➤</Text>
      </TouchableOpacity>
    </View>
  );
}
