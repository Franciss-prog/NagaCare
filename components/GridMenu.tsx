import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  MapPin,
  Building2,
  Brain,
  Calendar,
  AlertTriangle,
} from 'lucide-react-native';

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  screen?: string;
  tab?: string;
  gradient: string[];
}

const menuItemsConfig: MenuItem[] = [
  { 
    label: 'Health Map', 
    icon: <MapPin size={28} {...{ color: "white" }} />, 
    screen: 'HealthMap',
    gradient: ['#643fb3', '#5533a0']
  },
  { 
    label: 'Health Facilities', 
    icon: <Building2 size={28} {...{ color: "white" }} />, 
    screen: 'Facilities',
    gradient: ['#ff4930', '#e63820']
  },
  { 
    label: 'Appointments', 
    icon: <Calendar size={28} {...{ color: "white" }} />, 
    screen: 'Appointments',
    gradient: ['#fccb10', '#e6b600']
  },
];

const MenuItem = ({ item }: { item: MenuItem }) => {
  const navigation = useNavigation<any>();

  const handlePress = () => {
    if (item.screen) {
      navigation.navigate(item.screen);
    } else if (item.tab) {
      navigation.navigate(item.tab);
    }
  };

  return (
    <TouchableOpacity
      className="m-1.5 flex-1 overflow-hidden rounded-2xl bg-gradient-to-br shadow-lg"
      style={{ 
        backgroundColor: item.gradient[0],
        minHeight: 120,
        shadowColor: item.gradient[0],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
      }}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View className="flex-1 items-center justify-center p-4">
        <View className="mb-3 items-center justify-center">
          {item.icon}
        </View>
        <Text className="text-center text-sm font-semibold text-white" numberOfLines={2}>
          {item.label}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default function GridMenu({ items }: { items?: string[] }) {
  const filteredItems = items 
    ? menuItemsConfig.filter((m) => items.includes(m.label)) 
    : menuItemsConfig;

  return (
    <View className="flex-row flex-wrap">
      {filteredItems.map((item) => (
        <View key={item.label} style={{ width: '50%' }}>
          <MenuItem item={item} />
        </View>
      ))}
    </View>
  );
}
