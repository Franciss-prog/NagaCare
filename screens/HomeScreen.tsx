// ============================================================================
// HOME SCREEN - Aramon AI Chat Experience
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
  Image,
} from 'react-native';
import {
  User,
  Trash2,
  Phone,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { ChatBubble } from '../components/ChatBubble';
import ChatInput from '../components/ChatInput';
import { aramonAI, AramonResponse, Message } from '../services/aramonAI';
import { HealthFacility } from '../services/facilityService';
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
import { InlineUIComponent, ActionRequest } from '../types/aramon';

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
  const navigation = useNavigation<any>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  useEffect(() => {
    // Refresh user context and get proactive greeting from Aramon
    const initGreeting = async () => {
      // Refresh Aramon's knowledge of the current user
      aramonAI.refreshUserContext();
      
      const greeting = await aramonAI.getProactiveGreeting();
      const greetingMessage: ChatMessage = {
        id: 'greeting',
        role: 'assistant',
        content: greeting.message,
        timestamp: new Date(),
        inlineUI: greeting.inlineUI,
      };
      setMessages([greetingMessage]);
    };
    initGreeting();
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
      await addAIResponse(response);
    } catch (error) {
      console.error('Error:', error);
      await addAIResponse({
        message: "I'm having trouble connecting. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addAIResponse = async (response: AramonResponse) => {
    const aiMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response.message,
      timestamp: new Date(),
      inlineUI: response.inlineUI,
    };
    setMessages((prev) => [...prev, aiMessage]);

    // Handle navigation actions
    if (response.action?.type === 'NAVIGATE') {
      const { screen, params } = response.action.data as { screen: string; params?: any };
      setTimeout(() => {
        navigation.navigate(screen, params);
      }, 500); // Small delay so user sees the message first
    }

    // Handle booking appointment action - fetch facilities and update UI
    if (response.action?.type === 'BOOK_APPOINTMENT' && response.action.data.step === 'SELECT_FACILITY') {
      const reason = response.action.data.reason || 'General Consultation';
      try {
        const facilities = await aramonAI.getFacilitiesForBooking(reason);
        if (facilities.length > 0) {
          // Update the message with actual facility picker
          setMessages((prev) => {
            const updated = [...prev];
            const lastIndex = updated.length - 1;
            if (updated[lastIndex]?.role === 'assistant') {
              updated[lastIndex] = {
                ...updated[lastIndex],
                content: `I'd be happy to help you book an appointment${reason !== 'General Consultation' ? ` for ${reason}` : ''}! 🏥\n\nHere are available health facilities near you:`,
                inlineUI: {
                  type: 'FACILITY_PICKER',
                  facilities,
                },
              };
            }
            return updated;
          });
        } else {
          // No facilities found
          setMessages((prev) => {
            const updated = [...prev];
            const lastIndex = updated.length - 1;
            if (updated[lastIndex]?.role === 'assistant') {
              updated[lastIndex] = {
                ...updated[lastIndex],
                content: "I couldn't find any available facilities at the moment. Please try again later or contact a health center directly.",
                inlineUI: undefined,
              };
            }
            return updated;
          });
        }
      } catch (error) {
        console.error('Error fetching facilities:', error);
        setMessages((prev) => {
          const updated = [...prev];
          const lastIndex = updated.length - 1;
          if (updated[lastIndex]?.role === 'assistant') {
            updated[lastIndex] = {
              ...updated[lastIndex],
              content: "I'm having trouble loading facilities. Please try again.",
              inlineUI: undefined,
            };
          }
          return updated;
        });
      }
    }
  };

  // ============================================================================
  // INLINE UI HANDLERS
  // ============================================================================

  const handleFacilitySelect = async (facility: HealthFacility) => {
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

    setIsLoading(true);
    const response = await aramonAI.handleFacilitySelection(facility);
    setIsLoading(false);
    await addAIResponse(response);
  };

  const handleDateSelect = async (date: string) => {
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

    // handleDateSelection is now synchronous
    const response = aramonAI.handleDateSelection(date);
    await addAIResponse(response);
  };

  const handleTimeSelect = async (time: string, slotId?: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role: 'user',
        content: `${time} please`,
        timestamp: new Date(),
      },
    ]);

    const response = aramonAI.handleTimeSelection(time, slotId);
    await addAIResponse(response);
  };

  const handleConfirmBooking = async () => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role: 'user',
        content: 'Yes, confirm my booking',
        timestamp: new Date(),
      },
    ]);

    setIsLoading(true);
    const response = await aramonAI.confirmBooking();
    setIsLoading(false);
    await addAIResponse(response);
  };

  const handleCancelBooking = async () => {
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
    await addAIResponse(response);
  };

  const handleQuickReply = async (value: string) => {
    await handleSendMessage(value);
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role: 'user',
        content: 'Cancel this appointment',
        timestamp: new Date(),
      },
    ]);

    setIsLoading(true);
    const response = await aramonAI.cancelAppointment(appointmentId);
    setIsLoading(false);
    await addAIResponse(response);
  };

  const handleClearChat = async () => {
    aramonAI.clearHistory();
    const greeting = await aramonAI.getProactiveGreeting();
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

      {/* Modern Header with Gradient Accent */}
      <View className="bg-[#0b1220] px-4 pt-12 pb-4">
        <View className="flex-row items-center justify-between">
          {/* Left: Logo & Title */}
          <View className="flex-row items-center">
            {/* Gradient Logo Container */}
            <View className="mr-3">
              <View 
                className="w-11 h-11 rounded-2xl items-center justify-center overflow-hidden"
                style={{
                  backgroundColor: '#1a1a2e',
                  borderWidth: 1.5,
                  borderColor: 'rgba(249, 115, 22, 0.4)',
                }}
              >
                <Image
                  source={require('../assets/images/aramonAI.jpg')}
                  style={{ width: 44, height: 44 }}
                  resizeMode="cover"
                />
              </View>
            </View>
            <View>
              <Text className="text-white text-xl font-bold tracking-tight">Aramon AI</Text>
              <Text className="text-slate-400 text-xs">Your Health Companion</Text>
            </View>
          </View>

          {/* Right: Actions */}
          <View className="flex-row items-center gap-2">
            {/* Clear Chat */}
            <TouchableOpacity
              onPress={handleClearChat}
              activeOpacity={0.7}
              className="bg-slate-800/60 rounded-xl p-2.5 border border-slate-700/50"
            >
              <Trash2 size={18} {...{ color: "#94a3b8" }} />
            </TouchableOpacity>

            {/* Emergency Button */}
            <TouchableOpacity
              onPress={handleEmergencyCall}
              activeOpacity={0.7}
              className="bg-red-500/20 rounded-xl p-2.5 border border-red-500/30"
            >
              <Phone size={18} {...{ color: "#ef4444" }} />
            </TouchableOpacity>

            {/* Profile Button */}
            <TouchableOpacity
              onPress={() => navigation.navigate('Profile')}
              activeOpacity={0.7}
              className="bg-slate-800/60 rounded-xl p-2.5 border border-slate-700/50"
            >
              <User size={18} {...{ color: "#94a3b8" }} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Subtle gradient line */}
        <View className="h-[1px] mt-4 rounded-full overflow-hidden">
          <View 
            className="flex-1"
            style={{
              backgroundColor: 'transparent',
              borderBottomWidth: 1,
              borderBottomColor: 'rgba(100, 116, 139, 0.2)',
            }}
          />
        </View>
      </View>

      {/* Chat Messages */}
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 + keyboardHeight }}
        showsVerticalScrollIndicator={false}
        className="flex-1"
        keyboardShouldPersistTaps="handled"
      >
        {messages.map((message, index) => (
          <View key={message.id}>
            <ChatBubble
              text={message.content}
              fromUser={message.role === 'user'}
              timestamp={message.timestamp}
              showAvatar={
                message.role === 'assistant' &&
                (index === 0 || messages[index - 1]?.role === 'user')
              }
            />
            {/* Render inline UI after assistant messages */}
            {message.role === 'assistant' && message.inlineUI && (
              <View className="ml-11 mb-4">
                {renderInlineUI(message.inlineUI)}
              </View>
            )}
          </View>
        ))}

        {/* Loading Indicator */}
        {isLoading && (
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
              <View className="flex-row items-center">
                <ActivityIndicator color="#f97316" size="small" />
                <Text className="text-slate-400 ml-3 text-sm">
                  Thinking...
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

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
          placeholder="Message Aramon..."
          onSend={handleSendMessage}
          disabled={isLoading}
        />
      </View>
    </View>
  );
}
