import React from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Bot, MessageCircle, Hospital, Syringe, Baby, Lightbulb, AlertTriangle } from 'lucide-react-native';
import Header from '../components/Header';
import GridMenu from '../components/GridMenu';
import Card from '../components/Card';

export default function HomeScreen() {
  const navigation = useNavigation<any>();

  return (
    <View className="flex-1 bg-[#0b1220]">
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Hero Section */}
        <View className="px-4 pt-6">
          <Text className="text-3xl font-bold text-white">Welcome to</Text>
          <Text className="text-4xl font-bold text-primary">NagaCare</Text>
          <Text className="mt-2 text-base text-slate-400">
            Your health companion for Naga City
          </Text>
        </View>

        {/* Featured Card - AI Assistant */}
        <TouchableOpacity
          onPress={() => navigation.navigate('AIAssistant')}
          activeOpacity={0.9}
          className="mx-4 mt-6 overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 to-purple-800 p-6"
          style={{
            backgroundColor: '#643fb3',
            shadowColor: '#643fb3',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 8,
          }}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <View className="mb-2 flex-row items-center gap-2">
                <Bot size={28} color="white" />
                <Text className="text-xl font-bold text-white">Aramon AI</Text>
              </View>
              <Text className="text-base text-purple-100">
                Get instant health advice and guidance
              </Text>
              <View className="mt-3 flex-row items-center gap-2">
                <Text className="font-semibold text-white">Ask me anything</Text>
                <Text className="text-xl">→</Text>
              </View>
            </View>
            <View className="h-20 w-20 items-center justify-center rounded-full bg-white/20">
              <MessageCircle size={36} color="white" />
            </View>
          </View>
        </TouchableOpacity>

        {/* Quick Stats */}
        <View className="mx-4 mt-6">
          <Text className="mb-3 text-lg font-bold text-white">Health Overview</Text>
          <View className="flex-row gap-3">
            <View className="flex-1 rounded-2xl bg-slate-800 p-4">
              <Hospital size={28} color="#ff4930" />
              <Text className="mt-2 text-2xl font-bold text-white">15</Text>
              <Text className="text-sm text-slate-400">Health Facilities</Text>
            </View>
            <View className="flex-1 rounded-2xl bg-slate-800 p-4">
              <Syringe size={28} color="#643fb3" />
              <Text className="mt-2 text-2xl font-bold text-white">92%</Text>
              <Text className="text-sm text-slate-400">Vaccination Rate</Text>
            </View>
            <View className="flex-1 rounded-2xl bg-slate-800 p-4">
              <Baby size={28} color="#fccb10" />
              <Text className="mt-2 text-2xl font-bold text-white">89%</Text>
              <Text className="text-sm text-slate-400">Maternal Care</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions Grid */}
        <View className="mx-4 mt-6">
          <Text className="mb-3 text-lg font-bold text-white">Quick Access</Text>
          <GridMenu />
        </View>

        {/* Health Tips Card */}
        <View className="mx-4 mt-6">
          <Card>
            <View className="flex-row items-start gap-3">
              <View className="h-12 w-12 items-center justify-center rounded-full bg-yellow-500/20">
                <Lightbulb size={24} color="#fccb10" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-white">Health Tip of the Day</Text>
                <Text className="mt-1 leading-5 text-slate-300">
                  Stay hydrated! Drink at least 8 glasses of water daily to maintain good health
                  and boost your immune system.
                </Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Emergency Banner */}
        <TouchableOpacity
          onPress={() => navigation.navigate('Emergency')}
          activeOpacity={0.8}
          className="mx-4 mt-6 overflow-hidden rounded-2xl bg-red-600 p-5"
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <View className="flex-row items-center gap-2">
                <AlertTriangle size={24} color="white" />
                <Text className="text-xl font-bold text-white">Emergency?</Text>
              </View>
              <Text className="mt-1 text-red-100">Tap for emergency contacts</Text>
            </View>
            <View className="h-14 w-14 items-center justify-center rounded-full bg-white/20">
              <Text className="text-2xl font-bold text-white">911</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Footer Info */}
        <View className="mx-4 mt-8 mb-4">
          <Text className="text-center text-sm text-slate-500">
            Data-driven community health for Naga City
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
