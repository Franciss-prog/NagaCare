import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  MapPin,
  Building2,
  Brain,
  Calendar,
  Briefcase,
  AlertTriangle,
  Wrench,
  ChevronUp,
} from 'lucide-react-native';

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  screen?: string;
}

const menuItemsConfig: MenuItem[] = [
  { label: 'Health Map', icon: <MapPin size={24} color="white" />, screen: 'HealthMap' },
  { label: 'Health Facilities', icon: <Building2 size={24} color="white" />, screen: 'Facilities' },
  { label: 'AI Health Assistant', icon: <Brain size={24} color="white" />, screen: 'AIAssistant' },
  { label: 'Appointments', icon: <Calendar size={24} color="white" />, screen: 'Appointments' },
  { label: 'Services', icon: <Briefcase size={24} color="white" /> },
  { label: 'Emergency', icon: <AlertTriangle size={24} color="white" /> },
  { label: 'Utilities', icon: <Wrench size={24} color="white" /> },
  { label: 'View Less', icon: <ChevronUp size={24} color="white" /> },
];

const MenuItem = ({ item }: { item: MenuItem }) => {
  const navigation = useNavigation<any>();

  const handlePress = () => {
    if (item.screen) {
      navigation.navigate(item.screen);
    }
  };

  return (
    <TouchableOpacity
      className="m-2 flex-1 items-center rounded-xl bg-slate-900 p-3"
      onPress={handlePress}>
      <View className="mb-2 h-12 w-12 items-center justify-center rounded-full bg-secondary/30">
        {item.icon}
      </View>
      <Text className="text-sm text-slate-200">{item.label}</Text>
    </TouchableOpacity>
  );
};

export default function GridMenu({ items }: { items?: string[] }) {
  const displayItems = items
    ? menuItemsConfig.filter((m) => items.includes(m.label))
    : menuItemsConfig;

  return (
    <View className="-m-2 flex-row flex-wrap px-2">
      {displayItems.map((item) => (
        <View key={item.label} style={{ width: '48%' }}>
          <MenuItem item={item} />
        </View>
      ))}
    </View>
  );
}
