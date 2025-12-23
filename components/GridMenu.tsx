import React, { useState } from 'react';
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
  ChevronDown,
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
];

// Essential items to show when collapsed
const essentialItems = ['Health Map', 'AI Health Assistant', 'Emergency', 'Appointments'];

const MenuItem = ({ item, onPress }: { item: MenuItem; onPress?: () => void }) => (
  <TouchableOpacity 
    className="m-2 flex-1 items-center rounded-xl bg-slate-800 p-3"
    onPress={onPress}
  >
    <View className="mb-2 h-12 w-12 items-center justify-center rounded-full bg-slate-700">
      {item.icon}
    </View>
    <Text className="text-sm text-slate-200">{item.label}</Text>
  </TouchableOpacity>
);

export default function GridMenu({ items }: { items?: string[] }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const navigation = useNavigation();

  const filteredItems = items 
    ? menuItemsConfig.filter((m) => items.includes(m.label)) 
    : menuItemsConfig;

  const displayItems = isExpanded 
    ? filteredItems 
    : filteredItems.filter((m) => essentialItems.includes(m.label));

  const toggleButton = {
    label: isExpanded ? 'View Less' : 'View More',
    icon: isExpanded ? <ChevronUp size={24} color="white" /> : <ChevronDown size={24} color="white" />,
  };

  const handleMenuPress = (item: MenuItem) => {
    if (item.screen) {
      navigation.navigate(item.screen as never);
    }
  };

  return (
    <View className="ml-3 flex-row flex-wrap px-2">
      {displayItems.map((item) => (
        <View key={item.label} style={{ width: '48%' }}>
          <MenuItem item={item} onPress={() => handleMenuPress(item)} />
        </View>
      ))}
      <View style={{ width: '48%' }}>
        <MenuItem item={toggleButton} onPress={() => setIsExpanded(!isExpanded)} />
      </View>
    </View>
  );
}
