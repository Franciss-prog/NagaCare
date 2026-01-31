// ============================================================================
// APPOINTMENT CARD - Single appointment display in chat
// ============================================================================

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import {
  MapPin,
  Calendar,
  Clock,
  FileText,
  X,
  RotateCcw,
  Navigation,
} from 'lucide-react-native';
import { Appointment } from '../../types/aramon';
import { appointmentService } from '../../services/appointmentService';

interface AppointmentCardProps {
  appointment: Appointment;
  onCancel?: (id: string) => void;
  onReschedule?: (id: string) => void;
  onGetDirections?: (facilityId: string) => void;
  showActions?: boolean;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  onCancel,
  onReschedule,
  onGetDirections,
  showActions = true,
}) => {
  const formattedDate = appointmentService.formatAppointmentDate(
    appointment.date
  );

  const getStatusColor = () => {
    switch (appointment.status) {
      case 'confirmed':
        return { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Confirmed' };
      case 'pending':
        return { bg: 'bg-amber-500/20', text: 'text-amber-400', label: 'Pending' };
      case 'completed':
        return { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Completed' };
      case 'cancelled':
        return { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Cancelled' };
      case 'rescheduled':
        return { bg: 'bg-purple-500/20', text: 'text-purple-400', label: 'Rescheduled' };
      default:
        return { bg: 'bg-slate-500/20', text: 'text-slate-400', label: 'Unknown' };
    }
  };

  const status = getStatusColor();

  return (
    <View className="my-2">
      <View className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
        {/* Header with Status */}
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <Text className="text-2xl mr-2">🏥</Text>
            <View>
              <Text className="text-white font-semibold text-base" numberOfLines={1}>
                {appointment.facilityName}
              </Text>
              <Text className="text-slate-400 text-xs">
                {appointment.reason}
              </Text>
            </View>
          </View>
          <View className={`${status.bg} rounded-full px-3 py-1`}>
            <Text className={`${status.text} text-xs font-medium`}>
              {status.label}
            </Text>
          </View>
        </View>

        {/* Date & Time Row */}
        <View className="flex-row bg-slate-700/50 rounded-xl p-3 mb-3">
          <View className="flex-1 flex-row items-center">
            <Calendar size={16} {...{ color: "#3b82f6" }} />
            <Text className="text-white ml-2 font-medium">{formattedDate}</Text>
          </View>
          <View className="w-px bg-slate-600 mx-3" />
          <View className="flex-1 flex-row items-center">
            <Clock size={16} {...{ color: "#a855f7" }} />
            <Text className="text-white ml-2 font-medium">{appointment.time}</Text>
          </View>
        </View>

        {/* Address */}
        <View className="flex-row items-center mb-4">
          <MapPin size={14} {...{ color: "#22c55e" }} />
          <Text className="text-slate-400 text-xs ml-1 flex-1">
            {appointment.facilityAddress}
          </Text>
        </View>

        {/* Actions */}
        {showActions && appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
          <View className="flex-row gap-2">
            {onGetDirections && (
              <TouchableOpacity
                onPress={() => onGetDirections(appointment.facilityId)}
                activeOpacity={0.8}
                className="flex-1 flex-row items-center justify-center bg-green-600/20 rounded-xl py-2.5 border border-green-600/30"
              >
                <Navigation size={16} {...{ color: "#22c55e" }} />
                <Text className="text-green-400 font-medium ml-1.5 text-sm">
                  Directions
                </Text>
              </TouchableOpacity>
            )}

            {onReschedule && (
              <TouchableOpacity
                onPress={() => onReschedule(appointment.id)}
                activeOpacity={0.8}
                className="flex-1 flex-row items-center justify-center bg-blue-600/20 rounded-xl py-2.5 border border-blue-600/30"
              >
                <RotateCcw size={16} {...{ color: "#3b82f6" }} />
                <Text className="text-blue-400 font-medium ml-1.5 text-sm">
                  Reschedule
                </Text>
              </TouchableOpacity>
            )}

            {onCancel && (
              <TouchableOpacity
                onPress={() => onCancel(appointment.id)}
                activeOpacity={0.8}
                className="flex-1 flex-row items-center justify-center bg-red-600/20 rounded-xl py-2.5 border border-red-600/30"
              >
                <X size={16} {...{ color: "#ef4444" }} />
                <Text className="text-red-400 font-medium ml-1.5 text-sm">
                  Cancel
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

export default AppointmentCard;
