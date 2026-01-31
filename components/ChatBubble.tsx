// ============================================================================
// CHAT BUBBLE - Modern AI Chat Style
// Beautiful gradient bubbles with avatar and timestamp
// ============================================================================

import React from 'react';
import { View, Text, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface ChatBubbleProps {
  text: string;
  fromUser?: boolean;
  timestamp?: Date;
  showAvatar?: boolean;
}

export function ChatBubble({ text, fromUser, timestamp, showAvatar = true }: ChatBubbleProps) {
  // Format text with markdown-like styling
  const formatText = (content: string) => {
    // Split by bold markers **text**
    const parts = content.split(/(\*\*[^*]+\*\*)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        // Bold text
        return (
          <Text key={index} className="font-bold text-white">
            {part.slice(2, -2)}
          </Text>
        );
      }
      return <Text key={index}>{part}</Text>;
    });
  };

  if (fromUser) {
    return (
      <View className="flex-row justify-end mb-4">
        <View className="max-w-[85%]">
          <LinearGradient
            colors={['#06b6d4', '#0891b2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="rounded-3xl rounded-br-lg px-4 py-3"
          >
            <Text className="text-white text-[15px] leading-6">
              {text}
            </Text>
          </LinearGradient>
          {timestamp && (
            <Text className="text-slate-500 text-xs mt-1 text-right mr-1">
              {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          )}
        </View>
      </View>
    );
  }

  return (
    <View className="flex-row mb-4">
      {showAvatar && (
        <View className="mr-2 mt-1">
          <View 
            className="w-9 h-9 rounded-full items-center justify-center overflow-hidden"
            style={{
              backgroundColor: '#1a1a2e',
              borderWidth: 1.5,
              borderColor: 'rgba(249, 115, 22, 0.4)',
            }}
          >
            <Image
              source={require('../assets/images/aramonAI.jpg')}
              style={{ width: 36, height: 36 }}
              resizeMode="cover"
            />
          </View>
        </View>
      )}
      <View className={`max-w-[80%] ${!showAvatar ? 'ml-11' : ''}`}>
        <View className="bg-slate-800/80 rounded-3xl rounded-tl-lg px-4 py-3 border border-slate-700/50">
          <Text className="text-slate-100 text-[15px] leading-6">
            {formatText(text)}
          </Text>
        </View>
        {timestamp && (
          <Text className="text-slate-500 text-xs mt-1 ml-1">
            {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        )}
      </View>
    </View>
  );
}

// Typing indicator component
export function TypingIndicator() {
  return (
    <View className="flex-row mb-4">
      <View className="mr-2 mt-1">
        <View 
          className="w-9 h-9 rounded-full items-center justify-center overflow-hidden"
          style={{
            backgroundColor: '#1a1a2e',
            borderWidth: 1.5,
            borderColor: 'rgba(249, 115, 22, 0.4)',
          }}
        >
          <Image
            source={require('../assets/images/aramonAI.jpg')}
            style={{ width: 36, height: 36 }}
            resizeMode="cover"
          />
        </View>
      </View>
      <View className="bg-slate-800/80 rounded-3xl rounded-tl-lg px-5 py-4 border border-slate-700/50">
        <View className="flex-row items-center gap-1.5">
          <View className="w-2 h-2 rounded-full bg-cyan-400" />
          <View className="w-2 h-2 rounded-full bg-cyan-400" style={{ opacity: 0.7 }} />
          <View className="w-2 h-2 rounded-full bg-cyan-400" style={{ opacity: 0.4 }} />
        </View>
      </View>
    </View>
  );
}
