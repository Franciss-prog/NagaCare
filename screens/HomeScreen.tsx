import React from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MapPin, Building2, Calendar, AlertTriangle, TrendingUp, Users, Activity } from 'lucide-react-native';

export default function HomeScreen() {
  const navigation = useNavigation<any>();

  return (
    <View className="flex-1 bg-[#0b1220]">
      <ScrollView 
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section - Simplified */}
        <View className="px-6 pt-16 pb-8">
          <Text className="text-4xl font-bold text-white">NagaCare</Text>
          <Text className="mt-2 text-lg text-slate-400">
            Your health, our priority
          </Text>
        </View>

        {/* Key Stats - More breathing room */}
        <View className="px-6 mb-8">
          <View className="flex-row gap-4">
            <View className="flex-1 rounded-3xl bg-slate-800/50 p-5 border border-slate-700/50">
              <Activity size={24} color="#643fb3" strokeWidth={2.5} />
              <Text className="mt-3 text-3xl font-bold text-white">92%</Text>
              <Text className="mt-1 text-sm text-slate-400">Vaccination</Text>
            </View>
            <View className="flex-1 rounded-3xl bg-slate-800/50 p-5 border border-slate-700/50">
              <Users size={24} color="#ff4930" strokeWidth={2.5} />
              <Text className="mt-3 text-3xl font-bold text-white">15</Text>
              <Text className="mt-1 text-sm text-slate-400">Facilities</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions - Card Style */}
        <View className="px-6 mb-8">
          <Text className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">
            Quick Actions
          </Text>
          
          <TouchableOpacity
            onPress={() => navigation.navigate('HealthMap')}
            activeOpacity={0.7}
            className="mb-3 flex-row items-center justify-between rounded-2xl bg-slate-800/50 p-5 border border-slate-700/50"
          >
            <View className="flex-row items-center gap-4">
              <View className="h-12 w-12 items-center justify-center rounded-xl bg-purple-600/20">
                <MapPin size={22} color="#643fb3" strokeWidth={2.5} />
              </View>
              <View>
                <Text className="text-base font-semibold text-white">Health Map</Text>
                <Text className="text-sm text-slate-400">Find nearby facilities</Text>
              </View>
            </View>
            <Text className="text-slate-600 text-xl">›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Facilities')}
            activeOpacity={0.7}
            className="mb-3 flex-row items-center justify-between rounded-2xl bg-slate-800/50 p-5 border border-slate-700/50"
          >
            <View className="flex-row items-center gap-4">
              <View className="h-12 w-12 items-center justify-center rounded-xl bg-red-600/20">
                <Building2 size={22} color="#ff4930" strokeWidth={2.5} />
              </View>
              <View>
                <Text className="text-base font-semibold text-white">Health Facilities</Text>
                <Text className="text-sm text-slate-400">Browse all centers</Text>
              </View>
            </View>
            <Text className="text-slate-600 text-xl">›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Appointments')}
            activeOpacity={0.7}
            className="flex-row items-center justify-between rounded-2xl bg-slate-800/50 p-5 border border-slate-700/50"
          >
            <View className="flex-row items-center gap-4">
              <View className="h-12 w-12 items-center justify-center rounded-xl bg-yellow-600/20">
                <Calendar size={22} color="#fccb10" strokeWidth={2.5} />
              </View>
              <View>
                <Text className="text-base font-semibold text-white">Appointments</Text>
                <Text className="text-sm text-slate-400">Schedule a visit</Text>
              </View>
            </View>
            <Text className="text-slate-600 text-xl">›</Text>
          </TouchableOpacity>
        </View>

        {/* Emergency - Prominent but clean */}
        <View className="px-6 mb-6">
          <TouchableOpacity
            onPress={() => navigation.navigate('Emergency')}
            activeOpacity={0.8}
            className="overflow-hidden rounded-2xl bg-gradient-to-br from-red-600 to-red-700 p-6"
            style={{
              backgroundColor: '#dc2626',
              shadowColor: '#dc2626',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <View className="flex-row items-center gap-2 mb-1">
                  <AlertTriangle size={20} color="white" strokeWidth={2.5} />
                  <Text className="text-lg font-bold text-white">Emergency</Text>
                </View>
                <Text className="text-sm text-red-100">Get help immediately</Text>
              </View>
              <View className="h-14 w-14 items-center justify-center rounded-full bg-white/20">
                <Text className="text-xl font-bold text-white">911</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
