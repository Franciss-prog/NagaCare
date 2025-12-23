import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import Header from '../components/Header';
import Card from '../components/Card';

const facilities = [
  {
    name: 'City General Hospital',
    dist: '1.2km',
    services: 'ER, Maternity, Pharmacy',
    hours: '24/7',
  },
  { name: 'Green Clinic', dist: '3.4km', services: 'Outpatient, Vaccines', hours: '8am - 6pm' },
];

export default function FacilitiesScreen() {
  return (
    <View className="flex-1 bg-[#0b1220]">
      <Header title="Facilities" />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View className="mb-4 h-40 items-center justify-center rounded-2xl bg-slate-800">
          <Text className="text-slate-300">[Map + Locator placeholder]</Text>
        </View>

        {facilities.map((f) => (
          <View key={f.name} className="mb-3">
            <Card>
              <Text className="font-semibold text-white">{f.name}</Text>
              <Text className="text-slate-300">{f.services}</Text>
              <View className="mt-2 flex-row justify-between">
                <Text className="text-slate-400">{f.dist}</Text>
                <Text className="text-slate-400">{f.hours}</Text>
              </View>
            </Card>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
