import React from 'react';
import { View, ScrollView, Text } from 'react-native';
import Header from '../components/Header';
import Card from '../components/Card';

export default function ServicesScreen() {
  return (
    <View className="flex-1 bg-[#0b1220]">
      <Header title="Services" />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Card title="Immunization">
          <Text className="text-slate-200">Schedule and reminders for childhood vaccines</Text>
        </Card>

        <View className="h-3" />

        <Card title="Telemedicine">
          <Text className="text-slate-200">Connect with on-call clinicians</Text>
        </Card>
      </ScrollView>
    </View>
  );
}
