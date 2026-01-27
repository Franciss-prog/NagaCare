import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { AlertTriangle, Ambulance, Hospital, Cross, Flame, ShieldAlert, Phone } from 'lucide-react-native';

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

export default function EmergencyScreen() {
  const handleCall = (number: string) => {
    Linking.openURL(`tel:${number}`);
  };

  return (
    <View className="flex-1 bg-[#0b1220]">
      <ScrollView 
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="px-6 pt-16 pb-6">
          <Text className="text-4xl font-bold text-white">Emergency</Text>
          <Text className="mt-2 text-sm text-slate-400">Quick access to emergency services</Text>
        </View>

        {/* Quick Dial 911 */}
        <View className="px-6 mb-8">
          <TouchableOpacity
            onPress={() => handleCall('911')}
            className="overflow-hidden rounded-3xl bg-gradient-to-br from-red-600 to-red-700 p-6"
            activeOpacity={0.8}
            style={{
              backgroundColor: '#dc2626',
              shadowColor: '#dc2626',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.4,
              shadowRadius: 16,
              elevation: 12,
            }}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-5xl font-bold text-white">911</Text>
                <Text className="mt-2 text-lg font-semibold text-white">Emergency Hotline</Text>
                <Text className="mt-1 text-sm text-red-100">Tap to call immediately</Text>
              </View>
              <View className="h-16 w-16 items-center justify-center rounded-full bg-white/20">
                <Phone size={32} color="white" />
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Emergency Contacts */}
        <View className="px-6 mb-8">
          <Text className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">All Emergency Contacts</Text>
          {emergencyContacts.map((contact, index) => {
            const IconComponent = contact.icon;
            return (
              <TouchableOpacity
                key={index}
                onPress={() => handleCall(contact.number)}
                className="mb-3 flex-row items-center rounded-2xl bg-slate-800/50 border border-slate-700/50 p-5"
                activeOpacity={0.7}
              >
                <View
                  className="mr-4 h-14 w-14 items-center justify-center rounded-xl"
                  style={{ backgroundColor: contact.color + '20' }}
                >
                  <IconComponent size={26} color={contact.color} strokeWidth={2.5} />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-white">{contact.title}</Text>
                  <Text className="text-sm text-slate-400 mt-0.5">{contact.description}</Text>
                  <Text className="mt-1 text-sm font-medium" style={{ color: contact.color }}>
                    {contact.number}
                  </Text>
                </View>
                <View className="ml-2 h-10 w-10 items-center justify-center rounded-full bg-green-600">
                  <Phone size={20} color="white" strokeWidth={2.5} />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Safety Tips */}
        <View className="px-6 mb-6">
          <View className="rounded-2xl bg-blue-900/20 border border-blue-800/30 p-5">
            <View className="mb-3 flex-row items-center gap-2">
              <AlertTriangle size={20} color="#60a5fa" strokeWidth={2.5} />
              <Text className="font-bold text-blue-300">Emergency Tips</Text>
            </View>
            <Text className="text-sm leading-6 text-slate-300">
              • Stay calm and speak clearly{'\n'}
              • Know your exact location{'\n'}
              • Follow dispatcher instructions{'\n'}
              • Don't hang up until told to do so
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
