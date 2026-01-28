// ============================================================================
// CONFIRMATION CARD - Appointment confirmation in chat
// ============================================================================

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import {
  MapPin,
  Calendar,
  Clock,
  FileText,
  Check,
  X,
} from 'lucide-react-native';
import { AppointmentSummary } from '../../types/aramon';

interface ConfirmationCardProps {
  appointment: AppointmentSummary;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationCard: React.FC<ConfirmationCardProps> = ({
  appointment,
  onConfirm,
  onCancel,
}) => {
  const formattedDate = new Date(appointment.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <View className="my-2">
      <View className="bg-slate-800 rounded-2xl overflow-hidden border border-slate-700">
        {/* Header */}
        <View className="bg-gradient-to-r from-cyan-600 to-cyan-700 px-4 py-3">
          <Text className="text-white text-lg font-bold text-center">
            📋 Appointment Summary
          </Text>
          <Text className="text-cyan-100 text-xs text-center mt-1">
            Please review and confirm
          </Text>
        </View>

        {/* Details */}
        <View className="p-4">
          {/* Facility */}
          <View className="flex-row items-start mb-4">
            <View className="w-10 h-10 rounded-full bg-green-500/20 items-center justify-center">
              <MapPin size={20} color="#22c55e" />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-slate-400 text-xs">FACILITY</Text>
              <Text className="text-white font-semibold text-base">
                {appointment.facilityName}
              </Text>
              <Text className="text-slate-400 text-xs mt-0.5">
                {appointment.facilityAddress}
              </Text>
            </View>
          </View>

          {/* Date */}
          <View className="flex-row items-start mb-4">
            <View className="w-10 h-10 rounded-full bg-blue-500/20 items-center justify-center">
              <Calendar size={20} color="#3b82f6" />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-slate-400 text-xs">DATE</Text>
              <Text className="text-white font-semibold text-base">
                {formattedDate}
              </Text>
            </View>
          </View>

          {/* Time */}
          <View className="flex-row items-start mb-4">
            <View className="w-10 h-10 rounded-full bg-purple-500/20 items-center justify-center">
              <Clock size={20} color="#a855f7" />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-slate-400 text-xs">TIME</Text>
              <Text className="text-white font-semibold text-base">
                {appointment.time}
              </Text>
            </View>
          </View>

          {/* Reason */}
          <View className="flex-row items-start mb-4">
            <View className="w-10 h-10 rounded-full bg-amber-500/20 items-center justify-center">
              <FileText size={20} color="#f59e0b" />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-slate-400 text-xs">REASON</Text>
              <Text className="text-white font-semibold text-base">
                {appointment.reason}
              </Text>
            </View>
          </View>

          {/* Divider */}
          <View className="h-px bg-slate-700 my-2" />

          {/* Reminder */}
          <View className="bg-slate-700/50 rounded-xl p-3 mb-4">
            <Text className="text-slate-300 text-xs text-center">
              💡 Don't forget to bring a valid ID and arrive 15 minutes early
            </Text>
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={onCancel}
              activeOpacity={0.8}
              className="flex-1 flex-row items-center justify-center bg-slate-700 rounded-xl py-3 border border-slate-600"
            >
              <X size={18} color="#ef4444" />
              <Text className="text-red-400 font-semibold ml-2">Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onConfirm}
              activeOpacity={0.8}
              className="flex-1 flex-row items-center justify-center bg-cyan-600 rounded-xl py-3"
            >
              <Check size={18} color="white" />
              <Text className="text-white font-semibold ml-2">Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

export default ConfirmationCard;
