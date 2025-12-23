import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Bell } from 'lucide-react-native';

export default function Header({ title }: { title?: string }) {
  return (
    <View className="flex-row items-center justify-between bg-[#643fb3] px-4 pb-4 pt-8">
      <View>
        <Text className="text-2xl font-semibold text-white">NagaCare</Text>
        {title ? <Text className="text-sm text-slate-300">{title}</Text> : null}
      </View>

      <TouchableOpacity className="h-10 w-10 items-center justify-center rounded-full bg-primary">
        <Bell size={20} color="white" />
      </TouchableOpacity>
    </View>
  );
}
