import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { User, Settings, Bell, Shield, HelpCircle, LogOut, ChevronRight } from 'lucide-react-native';

const settingsOptions = [
  {
    title: 'Notifications',
    description: 'Manage alert preferences',
    icon: <Bell size={24} {...{ color: "#fccb10" }} />,
    color: '#fccb10',
  },
  {
    title: 'Privacy & Security',
    description: 'Control your data',
    icon: <Shield size={24} {...{ color: "#643fb3" }} />,
    color: '#643fb3',
  },
  {
    title: 'Help & Support',
    description: 'Get assistance',
    icon: <HelpCircle size={24} {...{ color: "#3b82f6" }} />,
    color: '#3b82f6',
  },
  {
    title: 'Settings',
    description: 'App preferences',
    icon: <Settings size={24} {...{ color: "#64748b" }} />,
    color: '#64748b',
  },
];

export default function AccountScreen() {
  return (
    <View className="flex-1 bg-[#0b1220]">
      <ScrollView 
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="px-6 pt-16 pb-8">
          <Text className="text-4xl font-bold text-white">Profile</Text>
        </View>

        {/* Profile Section */}
        <View className="px-6 mb-8">
          <View className="items-center rounded-3xl bg-slate-800/50 border border-slate-700/50 p-8">
            <View className="mb-4 h-24 w-24 items-center justify-center rounded-full" style={{ backgroundColor: '#643fb3' }}>
              <User size={48} {...{ color: "white", strokeWidth: 2 }} />
            </View>
            <Text className="text-2xl font-bold text-white">Guest User</Text>
            <Text className="mt-1 text-sm text-slate-400">guest@nagacare.ph</Text>
            
            <View className="mt-6 w-full flex-row gap-4">
              <View className="flex-1 items-center rounded-2xl bg-slate-700/30 p-4">
                <Text className="text-2xl font-bold text-white">0</Text>
                <Text className="text-xs text-slate-400 mt-1">Appointments</Text>
              </View>
              <View className="flex-1 items-center rounded-2xl bg-slate-700/30 p-4">
                <Text className="text-2xl font-bold text-white">3</Text>
                <Text className="text-xs text-slate-400 mt-1">Records</Text>
              </View>
              <View className="flex-1 items-center rounded-2xl bg-slate-700/30 p-4">
                <Text className="text-2xl font-bold text-white">12</Text>
                <Text className="text-xs text-slate-400 mt-1">Checkups</Text>
              </View>
            </View>

            <TouchableOpacity className="mt-6 w-full rounded-xl bg-primary px-6 py-3">
              <Text className="text-center font-semibold text-white">Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Health Information */}
        <View className="px-6 mb-8">
          <Text className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">Health Information</Text>
          <View className="rounded-3xl bg-slate-800/50 border border-slate-700/50 p-5">
            <View className="gap-4">
              <View className="flex-row items-center justify-between">
                <Text className="text-slate-400">Blood Type</Text>
                <Text className="font-semibold text-white">O+</Text>
              </View>
              <View className="h-px bg-slate-700/50" />
              <View className="flex-row items-center justify-between">
                <Text className="text-slate-400">Height</Text>
                <Text className="font-semibold text-white">165 cm</Text>
              </View>
              <View className="h-px bg-slate-700/50" />
              <View className="flex-row items-center justify-between">
                <Text className="text-slate-400">Weight</Text>
                <Text className="font-semibold text-white">62 kg</Text>
              </View>
              <View className="h-px bg-slate-700/50" />
              <View className="flex-row items-center justify-between">
                <Text className="text-slate-400">Allergies</Text>
                <Text className="font-semibold text-white">None</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Settings Options */}
        <View className="px-6 mb-8">
          <Text className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">Settings</Text>
          {settingsOptions.map((option, index) => (
            <TouchableOpacity 
              key={index} 
              className="mb-3 flex-row items-center justify-between rounded-2xl bg-slate-800/50 border border-slate-700/50 p-5" 
              activeOpacity={0.7}
            >
              <View className="flex-row items-center gap-4">
                <View
                  className="h-12 w-12 items-center justify-center rounded-xl"
                  style={{ backgroundColor: option.color + '20' }}
                >
                  {option.icon}
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-white">{option.title}</Text>
                  <Text className="text-sm text-slate-400">{option.description}</Text>
                </View>
              </View>
              <Text className="text-slate-600 text-xl">›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <View className="px-6 mb-6">
          <TouchableOpacity className="overflow-hidden rounded-2xl bg-red-900/20 border border-red-800/30 p-4" activeOpacity={0.7}>
            <View className="flex-row items-center justify-center gap-2">
              <LogOut size={20} {...{ color: "#ef4444" }} />
              <Text className="font-semibold text-red-400">Sign Out</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View className="px-6 mb-6">
          <View className="items-center py-4">
            <Text className="text-sm text-slate-500">Aramon AI v1.0.0</Text>
            <Text className="mt-1 text-xs text-slate-600">Naga City's AI Health Companion</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
