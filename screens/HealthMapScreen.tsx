import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import Header from '../components/Header';
import Card from '../components/Card';

export default function HealthMapScreen() {
  return (
    <View className="flex-1 bg-[#0b1220]">
      <Header title="Health Map" />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View className="mb-4 h-48 items-center justify-center rounded-2xl bg-slate-800">
          <Text className="text-slate-300">[Map placeholder]</Text>
        </View>

        <Card title="Children's Health">
          <Text className="text-slate-200">Immunizations 92% — 1200 children monitored</Text>
        </Card>

        <View className="h-4" />

        <Card title="Maternal Health">
          <Text className="text-slate-200">Antenatal visits: 78% — 320 mothers registered</Text>
        </Card>

        <View className="h-4" />

        <Card title="Senior Citizen Care">
          <Text className="text-slate-200">Home visits available — 180 registered</Text>
        </Card>
      </ScrollView>
    </View>
  );
}
