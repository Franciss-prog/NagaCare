import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { AlertTriangle, Ambulance, Hospital, Cross, Flame, ShieldAlert, Phone, MapPin, FileText } from 'lucide-react-native';
import Header from '../components/Header';
import Card from '../components/Card';

const emergencyContacts = [
  {
    title: 'National Emergency Hotline',
    number: '911',
    description: 'Police, Fire, Medical emergencies',
    icon: AlertTriangle,
    color: '#ef4444',
  },
  {
    title: 'Naga City Rescue',
    number: '(054) 473-8888',
    description: 'Local emergency response team',
    icon: Ambulance,
    color: '#ff4930',
  },
  {
    title: 'Bicol Medical Center ER',
    number: '(054) 811-2350',
    description: '24/7 Emergency Room',
    icon: Hospital,
    color: '#643fb3',
  },
  {
    title: 'Red Cross Naga',
    number: '(054) 473-2316',
    description: 'Disaster response & ambulance',
    icon: Cross,
    color: '#dc2626',
  },
  {
    title: 'Fire Department',
    number: '(054) 473-2222',
    description: 'Fire emergencies',
    icon: Flame,
    color: '#f97316',
  },
  {
    title: 'Police Station',
    number: '(054) 473-3333',
    description: 'Naga City Police',
    icon: ShieldAlert,
    color: '#3b82f6',
  },
];

const quickActions = [
  {
    title: 'Nearest Hospital',
    description: 'Find emergency facilities',
    icon: MapPin,
    action: 'facilities',
  },
  {
    title: 'First Aid Guide',
    description: 'Emergency procedures',
    icon: FileText,
    action: 'guide',
  },
];

export default function EmergencyScreen() {
  const handleCall = (number: string) => {
    Linking.openURL(`tel:${number}`);
  };

  return (
    <View className="flex-1 bg-[#0b1220]">
      <Header title="Emergency" />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Alert Banner */}
        <View className="mb-6 overflow-hidden rounded-2xl bg-red-600/20 p-4">
          <View className="flex-row items-center gap-3">
            <View className="h-12 w-12 items-center justify-center rounded-full bg-red-600">
              <AlertTriangle size={24} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold text-red-400">In case of emergency</Text>
              <Text className="text-sm text-red-200">Call the numbers below immediately</Text>
            </View>
          </View>
        </View>

        {/* Quick Dial 911 */}
        <TouchableOpacity
          onPress={() => handleCall('911')}
          className="mb-6 overflow-hidden rounded-2xl bg-red-600 p-6"
          activeOpacity={0.8}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-4xl font-bold text-white">911</Text>
              <Text className="mt-1 text-lg text-white">National Emergency Hotline</Text>
              <Text className="mt-1 text-sm text-red-100">Tap to call immediately</Text>
            </View>
            <View className="h-16 w-16 items-center justify-center rounded-full bg-white/20">
              <Phone size={32} color="white" />
            </View>
          </View>
        </TouchableOpacity>

        {/* Emergency Contacts */}
        <Text className="mb-3 text-lg font-bold text-white">Emergency Contacts</Text>
        {emergencyContacts.map((contact, index) => {
          const IconComponent = contact.icon;
          return (
            <TouchableOpacity
              key={index}
              onPress={() => handleCall(contact.number)}
              className="mb-3"
              activeOpacity={0.7}
            >
              <Card>
                <View className="flex-row items-center">
                  <View
                    className="mr-4 h-14 w-14 items-center justify-center rounded-full"
                    style={{ backgroundColor: contact.color + '30' }}
                  >
                    <IconComponent size={28} color={contact.color} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-white">{contact.title}</Text>
                    <Text className="text-sm text-slate-400">{contact.description}</Text>
                    <Text className="mt-1 text-base font-medium" style={{ color: contact.color }}>
                      {contact.number}
                    </Text>
                  </View>
                  <View className="ml-2 h-10 w-10 items-center justify-center rounded-full bg-green-600">
                    <Phone size={20} color="white" />
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          );
        })}

        {/* Quick Actions */}
        <Text className="mb-3 mt-4 text-lg font-bold text-white">Quick Actions</Text>
        <View className="flex-row gap-3">
          {quickActions.map((action, index) => {
            const IconComponent = action.icon;
            return (
              <TouchableOpacity
                key={index}
                className="flex-1 overflow-hidden rounded-xl bg-slate-800 p-4"
                activeOpacity={0.7}
              >
                <View className="mb-2 h-12 w-12 items-center justify-center rounded-full bg-blue-600/20">
                  <IconComponent size={24} color="#3b82f6" />
                </View>
                <Text className="font-semibold text-white">{action.title}</Text>
                <Text className="mt-1 text-xs text-slate-400">{action.description}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Safety Tips */}
        <View className="mb-6 mt-6 rounded-xl bg-blue-900/20 p-4">
          <View className="mb-2 flex-row items-center gap-2">
            <AlertTriangle size={20} color="#60a5fa" />
            <Text className="font-bold text-blue-300">Emergency Tips</Text>
          </View>
          <Text className="text-sm leading-5 text-slate-300">
            • Stay calm and speak clearly{('\n')}
            • Know your exact location{('\n')}
            • Follow dispatcher instructions{('\n')}
            • Don't hang up until told to do so
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
