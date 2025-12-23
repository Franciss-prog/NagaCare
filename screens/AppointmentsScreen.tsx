import React from 'react';
import { View, ScrollView, Text, TouchableOpacity } from 'react-native';
import Header from '../components/Header';
import Card from '../components/Card';

const appointments = [
  { date: '2025-12-24', facility: 'City General Hospital', status: 'Confirmed' },
  { date: '2026-01-05', facility: 'Green Clinic', status: 'Pending' },
];

export default function AppointmentsScreen() {
  return (
    <View className="flex-1 bg-[#0b1220]">
      <Header title="Appointments" />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {appointments.map((a) => (
          <View key={a.date} className="mb-3">
            <Card>
              <Text className="font-semibold text-white">{a.facility}</Text>
              <Text className="text-slate-300">Date: {a.date}</Text>
              <Text className="text-slate-300">Status: {a.status}</Text>
            </Card>
          </View>
        ))}

        <TouchableOpacity className="mt-4 items-center rounded-xl bg-blue-600 py-3">
          <Text className="text-white">Book Appointment</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
