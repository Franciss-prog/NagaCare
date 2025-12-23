import React from 'react';
import { View, ScrollView } from 'react-native';
import Header from '../components/Header';
import { ChatBubble } from '../components/ChatBubble';
import ChatInput from '../components/ChatInput';

export default function AIAssistantScreen() {
  return (
    <View className="flex-1 bg-[#0b1220]">
      <Header title="Aramon AI" />

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <ChatBubble text="Hello! I'm Aramon, your health assistant. How can I help?" />
        <ChatBubble text="I have a headache and mild fever." fromUser />
        <ChatBubble text="I'm sorry to hear that. Please rest and monitor temperature. If symptoms worsen, visit nearest clinic." />
      </ScrollView>

      <ChatInput />
    </View>
  );
}
