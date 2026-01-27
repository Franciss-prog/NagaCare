import React, { useState } from 'react';
import { TouchableOpacity, View, Animated, Modal } from 'react-native';
import { Bot, X } from 'lucide-react-native';
import AIAssistantScreen from '../screens/AIAssistantScreen';

export default function FloatingChatBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Bubble Button */}
      <Animated.View
        style={{
          position: 'absolute',
          bottom: 100,
          right: 20,
          transform: [{ scale: scaleAnim }],
          zIndex: 1000,
        }}
      >
        <TouchableOpacity
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.9}
          className="h-16 w-16 items-center justify-center rounded-full shadow-2xl"
          style={{
            backgroundColor: '#643fb3',
            shadowColor: '#643fb3',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.5,
            shadowRadius: 16,
            elevation: 12,
          }}
        >
          <Bot size={32} color="white" />
          {/* Pulse Animation Indicator */}
          <View
            className="absolute -inset-1 rounded-full"
            style={{
              backgroundColor: '#643fb3',
              opacity: 0.3,
            }}
          />
        </TouchableOpacity>
      </Animated.View>

      {/* Chat Modal */}
      <Modal
        visible={isOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleClose}
      >
        <View className="flex-1 bg-[#0b1220]">
          {/* Header with Close Button */}
          <View className="flex-row items-center justify-between border-b border-slate-800 bg-slate-900 px-4 pt-12 pb-4">
            <View className="flex-row items-center gap-3">
              <View className="h-10 w-10 items-center justify-center rounded-full bg-purple-600">
                <Bot size={24} color="white" />
              </View>
              <View>
                <View className="text-xl font-bold text-white">Aramon AI</View>
                <View className="text-sm text-slate-400">Your Health Assistant</View>
              </View>
            </View>
            <TouchableOpacity
              onPress={handleClose}
              className="h-10 w-10 items-center justify-center rounded-full bg-slate-800"
              activeOpacity={0.7}
            >
              <X size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* AI Assistant Content */}
          <AIAssistantScreen showHeader={false} />
        </View>
      </Modal>
    </>
  );
}
