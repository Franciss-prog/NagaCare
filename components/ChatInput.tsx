import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text } from 'react-native';

interface ChatInputProps {
  placeholder?: string;
  onSend?: (message: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ placeholder, onSend, disabled }: ChatInputProps) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim() && onSend && !disabled) {
      onSend(message);
      setMessage('');
    }
  };

  return (
    <View className="absolute bottom-0 left-0 right-0 flex-row items-center border-t border-slate-800 bg-slate-900 p-3">
      <TextInput
        className="mr-3 flex-1 rounded-full bg-slate-800 px-4 py-2 text-white"
        placeholder={placeholder || 'Type a message'}
        placeholderTextColor="#9CA3AF"
        value={message}
        onChangeText={setMessage}
        onSubmitEditing={handleSend}
        editable={!disabled}
        multiline
        maxLength={500}
      />
      <TouchableOpacity
        className={`h-12 w-12 items-center justify-center rounded-full ${
          disabled || !message.trim() ? 'bg-slate-600' : 'bg-primary'
        }`}
        onPress={handleSend}
        disabled={disabled || !message.trim()}
      >
        <Text className="text-white">➤</Text>
      </TouchableOpacity>
    </View>
  );
}
