// ============================================================================
// APPOINTMENT LIST - List of appointments in chat
// ============================================================================

import React from 'react';
import { View, Text } from 'react-native';
import { Calendar } from 'lucide-react-native';
import { Appointment } from '../../types/aramon';
import { AppointmentCard } from './AppointmentCard';

interface AppointmentListProps {
  appointments: Appointment[];
  onCancel?: (id: string) => void;
  onReschedule?: (id: string) => void;
  onGetDirections?: (facilityId: string) => void;
}

export const AppointmentList: React.FC<AppointmentListProps> = ({
  appointments,
  onCancel,
  onReschedule,
  onGetDirections,
}) => {
  if (appointments.length === 0) {
    return (
      <View className="my-2">
        <View className="bg-slate-800 rounded-2xl p-6 border border-slate-700 items-center">
          <View className="w-16 h-16 rounded-full bg-slate-700 items-center justify-center mb-3">
            <Calendar size={32} color="#64748b" />
          </View>
          <Text className="text-white font-semibold text-lg mb-1">
            No Appointments
          </Text>
          <Text className="text-slate-400 text-sm text-center">
            You don't have any upcoming appointments scheduled.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="my-2">
      {/* Header */}
      <View className="flex-row items-center mb-2 px-1">
        <Calendar size={16} color="#06b6d4" />
        <Text className="text-cyan-400 font-medium ml-1.5 text-sm">
          {appointments.length} Upcoming Appointment{appointments.length > 1 ? 's' : ''}
        </Text>
      </View>

      {/* Appointment Cards */}
      {appointments.map((appointment) => (
        <AppointmentCard
          key={appointment.id}
          appointment={appointment}
          onCancel={onCancel}
          onReschedule={onReschedule}
          onGetDirections={onGetDirections}
        />
      ))}
    </View>
  );
};

export default AppointmentList;
