// ============================================================================
// EMERGENCY CARD - Emergency action in chat
// ============================================================================

import React from 'react';
import { View, Text, TouchableOpacity, Linking, Platform } from 'react-native';
import { Phone, AlertTriangle, MapPin, Info } from 'lucide-react-native';
import { EmergencyData } from '../../types/aramon';

interface EmergencyCardProps {
  data: EmergencyData;
}

export const EmergencyCard: React.FC<EmergencyCardProps> = ({ data }) => {
  const handleCall911 = () => {
    const phoneNumber = Platform.OS === 'ios' ? 'telprompt:911' : 'tel:911';
    Linking.openURL(phoneNumber).catch((err) =>
      console.error('Failed to make call:', err)
    );
  };

  const handleCallLocalEmergency = () => {
    // Naga City local emergency hotline
    const phoneNumber = Platform.OS === 'ios' ? 'telprompt:09998885555' : 'tel:09998885555';
    Linking.openURL(phoneNumber).catch((err) =>
      console.error('Failed to make call:', err)
    );
  };

  return (
    <View className="my-2">
      <View className="bg-red-900/30 rounded-2xl overflow-hidden border-2 border-red-500">
        {/* Header */}
        <View className="bg-red-600 px-4 py-3 flex-row items-center justify-center">
          <AlertTriangle size={24} {...{ color: "white" }} />
          <Text className="text-white text-lg font-bold ml-2">
            EMERGENCY
          </Text>
        </View>

        {/* Content */}
        <View className="p-4">
          <Text className="text-white text-center mb-4">
            {data.message || 'If this is a medical emergency, please call for help immediately.'}
          </Text>

          {/* Call 911 Button */}
          <TouchableOpacity
            onPress={handleCall911}
            activeOpacity={0.8}
            className="flex-row items-center justify-center bg-red-600 rounded-xl py-4 mb-3"
          >
            <Phone size={24} {...{ color: "white" }} />
            <Text className="text-white font-bold text-xl ml-2">
              CALL 911
            </Text>
          </TouchableOpacity>

          {/* Local Emergency */}
          <TouchableOpacity
            onPress={handleCallLocalEmergency}
            activeOpacity={0.8}
            className="flex-row items-center justify-center bg-slate-700 rounded-xl py-3 mb-3"
          >
            <Phone size={18} {...{ color: "#06b6d4" }} />
            <Text className="text-cyan-400 font-semibold ml-2">
              Naga City Emergency Hotline
            </Text>
          </TouchableOpacity>

          {/* Emergency Info */}
          <View className="bg-slate-800/50 rounded-xl p-3">
            <View className="flex-row items-start mb-2">
              <Info size={16} {...{ color: "#94a3b8" }} />
              <Text className="text-slate-300 text-xs ml-2 flex-1">
                While waiting for help:
              </Text>
            </View>
            <View className="ml-6">
              <Text className="text-slate-400 text-xs mb-1">• Stay calm and stay on the line</Text>
              <Text className="text-slate-400 text-xs mb-1">• Provide your exact location</Text>
              <Text className="text-slate-400 text-xs mb-1">• Describe the emergency clearly</Text>
              <Text className="text-slate-400 text-xs">• Follow dispatcher instructions</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default EmergencyCard;
