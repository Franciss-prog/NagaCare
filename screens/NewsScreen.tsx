import React from 'react';
import { View, ScrollView, Text } from 'react-native';
import Header from '../components/Header';
import Card from '../components/Card';

const news = [
  {
    title: 'Flu vaccination drive starts',
    excerpt: 'Free clinics available across the city this week.',
  },
  {
    title: 'New mobile clinic launched',
    excerpt: 'Mobile health unit servicing remote neighborhoods.',
  },
];

export default function NewsScreen() {
  return (
    <View className="flex-1 bg-[#0b1220]">
      <Header title="News" />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {news.map((n) => (
          <View key={n.title} className="mb-3">
            <Card title={n.title}>
              <Text className="text-slate-200">{n.excerpt}</Text>
            </Card>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
