import React from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import Header from '../components/Header';
import GridMenu from '../components/GridMenu';
import Card from '../components/Card';

export default function HomeScreen() {
  return (
    <View className="flex-1 bg-[#0b1220]">
      <Header title="City health at your fingertips" />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="px-4">
          <Card>
            <View className="flex-col items-start justify-between  gap-4">
              <View>
                <Text className="text-lg font-semibold text-white">Stay safe, stay healthy</Text>
                <Text className="mt-1 text-slate-300">Find services and assistance around you</Text>
              </View>
              <TouchableOpacity className="rounded-xl bg-primary px-4 py-2">
                <Text className="text-white">Get Started</Text>
              </TouchableOpacity>
            </View>
          </Card>

          <View className="mt-4">
            <Text className="mb-2 text-slate-300">Quick actions</Text>
            <GridMenu />
          </View>

          <View className="mt-6">
            <Text className="mb-2 text-slate-300">Recent updates</Text>
            <Card title="Children's Health Stats">
              <Text className="text-slate-200">Immunization coverage: 92%</Text>
            </Card>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
