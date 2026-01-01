import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { User, Settings, Bell, Shield, HelpCircle, LogOut, ChevronRight, Activity, Ruler, Weight } from 'lucide-react-native';
import Header from '../components/Header';
import Card from '../components/Card';

const settingsOptions = [
  {
    title: 'Notifications',
    description: 'Manage alert preferences',
    icon: <Bell size={24} color="#fccb10" />,
    color: '#fccb10',
  },
  {
    title: 'Privacy & Security',
    description: 'Control your data',
    icon: <Shield size={24} color="#643fb3" />,
    color: '#643fb3',
  },
  {
    title: 'Help & Support',
    description: 'Get assistance',
    icon: <HelpCircle size={24} color="#3b82f6" />,
    color: '#3b82f6',
  },
  {
    title: 'Settings',
    description: 'App preferences',
    icon: <Settings size={24} color="#64748b" />,
    color: '#64748b',
  },
];

export default function AccountScreen() {
  return (
    <View className="flex-1 bg-[#0b1220]">
      <Header title="Profile" />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Profile Card */}
        <Card>
          <View className="items-center py-4">
            <View className="mb-4 h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-purple-800" style={{ backgroundColor: '#643fb3' }}>
              <User size={48} color="white" />
            </View>
            <Text className="text-2xl font-bold text-white">Guest User</Text>
            <Text className="mt-1 text-sm text-slate-400">guest@nagacare.ph</Text>
            
            <View className="mt-4 flex-row gap-4">
              <View className="items-center">
                <Text className="text-2xl font-bold text-white">0</Text>
                <Text className="text-xs text-slate-400">Appointments</Text>
              </View>
              <View className="h-12 w-px bg-slate-700" />
              <View className="items-center">
                <Text className="text-2xl font-bold text-white">3</Text>
                <Text className="text-xs text-slate-400">Health Records</Text>
              </View>
              <View className="h-12 w-px bg-slate-700" />
              <View className="items-center">
                <Text className="text-2xl font-bold text-white">12</Text>
                <Text className="text-xs text-slate-400">Checkups</Text>
              </View>
            </View>

            <TouchableOpacity className="mt-6 w-full rounded-xl bg-primary px-6 py-3">
              <Text className="text-center font-semibold text-white">Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Health Information */}
        <View className="mt-6">
          <Text className="mb-3 text-lg font-bold text-white">Health Information</Text>
          <Card>
            <View className="gap-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-slate-400">Blood Type</Text>
                <Text className="font-semibold text-white">O+</Text>
              </View>
              <View className="h-px bg-slate-700" />
              <View className="flex-row items-center justify-between">
                <Text className="text-slate-400">Height</Text>
                <Text className="font-semibold text-white">165 cm</Text>
              </View>
              <View className="h-px bg-slate-700" />
              <View className="flex-row items-center justify-between">
                <Text className="text-slate-400">Weight</Text>
                <Text className="font-semibold text-white">62 kg</Text>
              </View>
              <View className="h-px bg-slate-700" />
              <View className="flex-row items-center justify-between">
                <Text className="text-slate-400">Allergies</Text>
                <Text className="font-semibold text-white">None</Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Settings Options */}
        <View className="mt-6">
          <Text className="mb-3 text-lg font-bold text-white">Settings</Text>
          {settingsOptions.map((option, index) => (
            <TouchableOpacity key={index} className="mb-3" activeOpacity={0.7}>
              <Card>
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-4">
                    <View
                      className="h-12 w-12 items-center justify-center rounded-full"
                      style={{ backgroundColor: option.color + '20' }}
                    >
                      {option.icon}
                    </View>
                    <View className="flex-1">
                      <Text className="font-semibold text-white">{option.title}</Text>
                      <Text className="text-sm text-slate-400">{option.description}</Text>
                    </View>
                  </View>
                  <ChevronRight size={20} color="#64748b" />
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>

        {/* App Info */}
        <View className="mt-6 mb-4">
          <Card>
            <View className="items-center py-2">
              <Text className="text-sm text-slate-400">NagaCare v1.0.0</Text>
              <Text className="mt-1 text-xs text-slate-500">Data-driven community health</Text>
            </View>
          </Card>
        </View>

        {/* Logout Button */}
        <TouchableOpacity className="mb-6 overflow-hidden rounded-xl bg-red-900/20 p-4" activeOpacity={0.7}>
          <View className="flex-row items-center justify-center gap-2">
            <LogOut size={20} color="#ef4444" />
            <Text className="font-semibold text-red-400">Sign Out</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
