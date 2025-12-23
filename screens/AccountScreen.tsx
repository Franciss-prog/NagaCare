import React from 'react';
import { View, Text } from 'react-native';
import Header from '../components/Header';
import Card from '../components/Card';

export default function AccountScreen() {
  return (
    <View className="flex-1 bg-[#0b1220]">
      <Header title="Profile" />
      <View className="px-4">
        <Card>
          <Text className="font-semibold text-white">Guest User</Text>
          <Text className="text-slate-300">No account connected</Text>
        </Card>
      </View>
    </View>
  );
}
