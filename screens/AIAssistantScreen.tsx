import React, { useState, useRef, useEffect } from 'react';
import { View, ScrollView, ActivityIndicator, Text, TouchableOpacity, Keyboard, Platform } from 'react-native';
import Header from '../components/Header';
import { ChatBubble } from '../components/ChatBubble';
import ChatInput from '../components/ChatInput';
import { aramonAI, Message } from '../services/aramonAI';

export default function AIAssistantScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  // Initial greeting
  useEffect(() => {
    const greetingMessage: Message = {
      id: 'greeting',
      role: 'assistant',
      content: "Hello! I'm Aramon, your health assistant for Naga City. I'm here to help with:\n\n• Basic health inquiries (symptoms, prevention)\n• Maternal and elderly care guidance\n• Vaccination reminders\n• Finding the nearest health facility\n\n⚠️ Remember: I complement health workers but don't replace medical professionals. For emergencies, call 911!\n\nHow can I assist you today?",
      timestamp: new Date(),
    };
    setMessages([greetingMessage]);
  }, []);

  // Keyboard event listeners
  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
        setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
      }
    );
    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    // Add user message to UI
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Show loading state
    setIsLoading(true);

    try {
      // Get AI response
      const response = await aramonAI.sendMessage(text);

      // Add AI response to UI
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    aramonAI.clearHistory();
    const greetingMessage: Message = {
      id: 'greeting-' + Date.now(),
      role: 'assistant',
      content: "Chat cleared! I'm Aramon, ready to help you again. What would you like to know?",
      timestamp: new Date(),
    };
    setMessages([greetingMessage]);
  };

  const handleQuickAction = async (action: 'symptoms' | 'prevention' | 'maternal' | 'elderly') => {
    setIsLoading(true);
    try {
      const response = await aramonAI.getHealthTip(action);
      const aiMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error getting health tip:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-[#0b1220]">
      <Header title="Aramon AI" />

      {/* Quick Action Buttons */}
      <View className="border-b border-slate-800 bg-slate-900/50 p-2">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            onPress={() => handleQuickAction('symptoms')}
            className="mr-2 rounded-full bg-blue-600 px-4 py-2"
            disabled={isLoading}
          >
            <Text className="text-xs text-white">💊 Symptoms</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleQuickAction('prevention')}
            className="mr-2 rounded-full bg-green-600 px-4 py-2"
            disabled={isLoading}
          >
            <Text className="text-xs text-white">🛡️ Prevention</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleQuickAction('maternal')}
            className="mr-2 rounded-full bg-pink-600 px-4 py-2"
            disabled={isLoading}
          >
            <Text className="text-xs text-white">🤱 Maternal Care</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleQuickAction('elderly')}
            className="mr-2 rounded-full bg-purple-600 px-4 py-2"
            disabled={isLoading}
          >
            <Text className="text-xs text-white">👴 Elderly Care</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleClearChat}
            className="rounded-full bg-red-600 px-4 py-2"
            disabled={isLoading}
          >
            <Text className="text-xs text-white">🗑️ Clear Chat</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Chat Messages */}
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={{ padding: 16, paddingBottom: 80 + keyboardHeight }}
        showsVerticalScrollIndicator={false}
        className="flex-1"
        keyboardShouldPersistTaps="handled"
      >
        {messages.map((message) => (
          <ChatBubble
            key={message.id}
            text={message.content}
            fromUser={message.role === 'user'}
          />
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <View className="mb-3 items-start">
            <View className="max-w-[80%] rounded-2xl bg-secondary p-3">
              <ActivityIndicator color="#3b82f6" />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Chat Input - positioned absolutely at bottom */}
      <View style={{ position: 'absolute', bottom: keyboardHeight, left: 0, right: 0, elevation: 10, zIndex: 10, margin: 0, padding: 0 }}>
        <ChatInput
          placeholder="Ask about health, symptoms, or facilities..."
          onSend={handleSendMessage}
          disabled={isLoading}
        />
      </View>
    </View>
  );
}
