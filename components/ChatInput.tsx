// ============================================================================
// CHAT INPUT - Modern Floating Input with Gradient Send Button
// ============================================================================

import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Send, Mic } from 'lucide-react-native';

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

  const canSend = message.trim() && !disabled;

  return (
    <View className="px-4 pb-8 pt-3 bg-[#0b1220] border-t border-slate-800/50">
      <View className="flex-row items-end bg-slate-800/60 rounded-3xl border border-slate-700/50 px-4 py-2">
        {/* Input */}
        <TextInput
          className="flex-1 text-white text-[16px] max-h-24 py-2"
          placeholder={placeholder || 'Message Aramon...'}
          placeholderTextColor="#64748b"
          value={message}
          onChangeText={setMessage}
          onSubmitEditing={handleSend}
          editable={!disabled}
          multiline
          maxLength={500}
        />
        
        {/* Send Button */}
        <TouchableOpacity
          onPress={handleSend}
          disabled={!canSend}
          activeOpacity={0.8}
          className="ml-2 mb-0.5"
        >
          {canSend ? (
            <LinearGradient
              colors={['#f97316', '#ec4899']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="w-10 h-10 rounded-full items-center justify-center"
            >
              <Send size={18} {...{ color: "white" }} style={{ marginLeft: 2 }} />
            </LinearGradient>
          ) : (
            <View className="w-10 h-10 rounded-full items-center justify-center bg-slate-700/50">
              <Send size={18} {...{ color: "#475569" }} style={{ marginLeft: 2 }} />
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
