import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Header from '../components/Header';

export default function EmergencyScreen() {
  return (
    <View className="flex-1 items-center bg-[#0b1220]">
      <Header title="Emergency" />
      <View className="flex-1 items-center justify-center px-6">
        <Text className="mb-4 text-center text-lg text-white">Quick actions for emergencies</Text>
        <TouchableOpacity className="mb-3 rounded-2xl bg-red-600 px-8 py-4">
          <Text className="font-semibold text-white">Call Emergency Services</Text>
        </TouchableOpacity>
        <TouchableOpacity className="rounded-2xl bg-slate-800 px-6 py-3">
          <Text className="text-white">Nearest Emergency Facilities</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
