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
    <View className="flex-row items-center border-t border-slate-700 mb-10 bg-slate-900 px-3 py-3 shadow-2xl" style={{ margin: 0 }}>
      <TextInput
        className="mr-3 flex-1 rounded-full bg-slate-800 px-4 py-2"
        style={{ color: '#ffffff' }}
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
