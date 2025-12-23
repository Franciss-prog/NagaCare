import React from 'react';
import { View, Text } from 'react-native';

export default function Card({ children, title }: { children?: React.ReactNode; title?: string }) {
  return (
    <View className="rounded-2xl bg-slate-900 p-4">
      {title ? <Text className="mb-2 font-medium text-white">{title}</Text> : null}
      {children}
    </View>
  );
}
