// ============================================================================
// HOME SCREEN - AI-First NagaCare Experience
// Aramon AI is the main interface for everything
// ============================================================================

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  ScrollView,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Keyboard,
  Platform,
  StatusBar,
  Linking,
} from 'react-native';
import {
  User,
  Trash2,
  Phone,
} from 'lucide-react-native';
import { ChatBubble } from '../components/ChatBubble';
import ChatInput from '../components/ChatInput';
import { aramonAI, AramonResponse, Message } from '../services/aramonAI';
import { HealthFacility } from '../data/healthFacilities';
import {
  FacilityPicker,
  DatePicker,
  TimeSlotPicker,
  ConfirmationCard,
  AppointmentCard,
  AppointmentList,
  QuickReplies,
  EmergencyCard,
} from '../components/chat';
import { InlineUIComponent } from '../types/aramon';

// ============================================================================
// TYPES
// ============================================================================

interface ChatMessage extends Message {
  inlineUI?: InlineUIComponent;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function HomeScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  useEffect(() => {
    // Get proactive greeting from Aramon
    const greeting = aramonAI.getProactiveGreeting();
    const greetingMessage: ChatMessage = {
      id: 'greeting',
      role: 'assistant',
      content: greeting.message,
      timestamp: new Date(),
      inlineUI: greeting.inlineUI,
    };
    setMessages([greetingMessage]);
  }, []);

  // ============================================================================
  // KEYBOARD HANDLING
  // ============================================================================

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

  // Auto-scroll on new messages
  useEffect(() => {
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages]);

  // ============================================================================
  // MESSAGE HANDLING
  // ============================================================================

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await aramonAI.sendMessage(text);
      addAIResponse(response);
    } catch (error) {
      console.error('Error:', error);
      addAIResponse({
        message: "I'm having trouble connecting. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addAIResponse = (response: AramonResponse) => {
    const aiMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response.message,
      timestamp: new Date(),
      inlineUI: response.inlineUI,
    };
    setMessages((prev) => [...prev, aiMessage]);
  };

  // ============================================================================
  // INLINE UI HANDLERS
  // ============================================================================

  const handleFacilitySelect = (facility: HealthFacility) => {
    // Add user selection as message
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role: 'user',
        content: `I'll go with ${facility.name}`,
        timestamp: new Date(),
      },
    ]);

    const response = aramonAI.handleFacilitySelection(facility);
    addAIResponse(response);
  };

  const handleDateSelect = (date: string) => {
    const formattedDate = new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role: 'user',
        content: `${formattedDate} works for me`,
        timestamp: new Date(),
      },
    ]);

    const response = aramonAI.handleDateSelection(date);
    addAIResponse(response);
  };

  const handleTimeSelect = (time: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role: 'user',
        content: `${time} please`,
        timestamp: new Date(),
      },
    ]);

    const response = aramonAI.handleTimeSelection(time);
    addAIResponse(response);
  };

  const handleConfirmBooking = () => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role: 'user',
        content: 'Yes, confirm my booking',
        timestamp: new Date(),
      },
    ]);

    const response = aramonAI.confirmBooking();
    addAIResponse(response);
  };

  const handleCancelBooking = () => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role: 'user',
        content: 'Cancel booking',
        timestamp: new Date(),
      },
    ]);

    const response = aramonAI.cancelBookingFlow();
    addAIResponse(response);
  };

  const handleQuickReply = async (value: string) => {
    await handleSendMessage(value);
  };

  const handleCancelAppointment = (appointmentId: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role: 'user',
        content: 'Cancel this appointment',
        timestamp: new Date(),
      },
    ]);

    const response = aramonAI.cancelAppointment(appointmentId);
    addAIResponse(response);
  };

  const handleClearChat = () => {
    aramonAI.clearHistory();
    const greeting = aramonAI.getProactiveGreeting();
    const greetingMessage: ChatMessage = {
      id: 'greeting-' + Date.now(),
      role: 'assistant',
      content: "Chat cleared! I'm Aramon, ready to help you again.\n\nWhat would you like to do?",
      timestamp: new Date(),
      inlineUI: greeting.inlineUI,
    };
    setMessages([greetingMessage]);
  };

  const handleEmergencyCall = () => {
    const phoneNumber = Platform.OS === 'ios' ? 'telprompt:911' : 'tel:911';
    Linking.openURL(phoneNumber);
  };

  // ============================================================================
  // RENDER INLINE UI
  // ============================================================================

  const renderInlineUI = (inlineUI: InlineUIComponent) => {
    switch (inlineUI.type) {
      case 'FACILITY_PICKER':
        return (
          <FacilityPicker
            facilities={inlineUI.facilities}
            onSelect={handleFacilitySelect}
          />
        );

      case 'DATE_PICKER':
        return (
          <DatePicker
            dates={inlineUI.availableDates}
            onSelect={handleDateSelect}
          />
        );

      case 'TIME_SLOT_PICKER':
        return (
          <TimeSlotPicker
            slots={inlineUI.slots}
            date={inlineUI.date}
            onSelect={handleTimeSelect}
          />
        );

      case 'CONFIRMATION_CARD':
        return (
          <ConfirmationCard
            appointment={inlineUI.appointment}
            onConfirm={handleConfirmBooking}
            onCancel={handleCancelBooking}
          />
        );

      case 'APPOINTMENT_CARD':
        return (
          <AppointmentCard
            appointment={inlineUI.appointment}
            onCancel={handleCancelAppointment}
            showActions={true}
          />
        );

      case 'APPOINTMENT_LIST':
        return (
          <AppointmentList
            appointments={inlineUI.appointments}
            onCancel={handleCancelAppointment}
          />
        );

      case 'QUICK_REPLIES':
        return (
          <QuickReplies options={inlineUI.options} onSelect={handleQuickReply} />
        );

      case 'EMERGENCY_CARD':
        return <EmergencyCard data={inlineUI.data} />;

      default:
        return null;
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <View className="flex-1 bg-[#0b1220]">
      <StatusBar barStyle="light-content" backgroundColor="#0b1220" />

      {/* Header */}
      <View className="bg-[#0b1220] border-b border-slate-800 px-4 pt-12 pb-4">
        <View className="flex-row items-center justify-between">
          {/* Left: Logo & Title */}
          <View className="flex-row items-center">
            <Text className="text-2xl mr-2">🏥</Text>
            <View>
              <Text className="text-white text-xl font-bold">NagaCare</Text>
              <Text className="text-cyan-400 text-xs">Powered by Aramon AI</Text>
            </View>
          </View>

          {/* Right: Actions */}
          <View className="flex-row items-center gap-2">
            {/* Emergency Button */}
            <TouchableOpacity
              onPress={handleEmergencyCall}
              activeOpacity={0.7}
              className="bg-red-600 rounded-full p-2.5"
            >
              <Phone size={20} color="white" />
            </TouchableOpacity>

            {/* Profile Button */}
            <TouchableOpacity
              activeOpacity={0.7}
              className="bg-slate-800 rounded-full p-2.5"
            >
              <User size={20} color="#94a3b8" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Chat Messages */}
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 + keyboardHeight }}
        showsVerticalScrollIndicator={false}
        className="flex-1"
        keyboardShouldPersistTaps="handled"
      >
        {messages.map((message) => (
          <View key={message.id}>
            <ChatBubble
              text={message.content}
              fromUser={message.role === 'user'}
            />
            {/* Render inline UI after assistant messages */}
            {message.role === 'assistant' && message.inlineUI && (
              <View className="ml-2">
                {renderInlineUI(message.inlineUI)}
              </View>
            )}
          </View>
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <View className="mb-3 items-start">
            <View className="flex-row items-center bg-slate-800 rounded-2xl px-4 py-3">
              <ActivityIndicator color="#06b6d4" size="small" />
              <Text className="text-slate-400 ml-2 text-sm">
                Aramon is thinking...
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Clear Chat Button (floating) */}
      <TouchableOpacity
        onPress={handleClearChat}
        activeOpacity={0.7}
        className="absolute right-4 bg-slate-800 border border-slate-700 rounded-full p-3"
        style={{ bottom: 90 + keyboardHeight }}
      >
        <Trash2 size={18} color="#94a3b8" />
      </TouchableOpacity>

      {/* Chat Input */}
      <View
        style={{
          position: 'absolute',
          bottom: keyboardHeight,
          left: 0,
          right: 0,
          elevation: 10,
          zIndex: 10,
        }}
      >
        <ChatInput
          placeholder="Ask Aramon anything..."
          onSend={handleSendMessage}
          disabled={isLoading}
        />
      </View>
    </View>
  );
}
