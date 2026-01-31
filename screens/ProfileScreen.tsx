// ============================================================================
// PROFILE SCREEN - User Profile & Settings
// Shows logged in user details with logout functionality
// ============================================================================

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  Alert,
  StatusBar,
} from 'react-native';
import { 
  Settings, 
  Bell, 
  Shield, 
  HelpCircle, 
  LogOut, 
  ChevronLeft,
  MapPin,
  Phone,
  Calendar,
  CreditCard,
  FileText,
  Edit3,
  Users,
} from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { authService } from '../services/authService';
import type { Resident } from '../types/database';

interface ProfileScreenProps {
  onLogout: () => void;
}

export default function ProfileScreen({ onLogout }: ProfileScreenProps) {
  const navigation = useNavigation();
  const [resident, setResident] = useState<Resident | null>(null);
  const [username, setUsername] = useState<string>('');

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = () => {
    const currentResident = authService.getCurrentResident();
    const currentUser = authService.getCurrentUser();
    setResident(currentResident);
    setUsername(currentUser?.username || 'User');
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: onLogout,
        },
      ]
    );
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const settingsOptions = [
    {
      title: 'Notifications',
      description: 'Manage alert preferences',
      icon: Bell,
      color: '#f97316',
    },
    {
      title: 'Privacy & Security',
      description: 'Control your data',
      icon: Shield,
      color: '#8b5cf6',
    },
    {
      title: 'Help & Support',
      description: 'Get assistance',
      icon: HelpCircle,
      color: '#06b6d4',
    },
    {
      title: 'App Settings',
      description: 'Preferences',
      icon: Settings,
      color: '#64748b',
    },
  ];

  return (
    <View className="flex-1 bg-[#0b1220]">
      <StatusBar barStyle="light-content" backgroundColor="#0b1220" />
      
      <ScrollView 
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Back Button */}
        <View className="px-4 pt-12 pb-4 flex-row items-center">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
            className="bg-slate-800/60 rounded-xl p-2.5 border border-slate-700/50 mr-4"
          >
            <ChevronLeft size={22} {...{ color: "#94a3b8" }} />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-white">Profile</Text>
        </View>

        {/* Profile Card */}
        <View className="px-4 mb-6">
          <View className="rounded-3xl bg-slate-800/50 border border-slate-700/50 overflow-hidden">
            {/* Gradient Header */}
            <LinearGradient
              colors={['#f97316', '#ec4899', '#8b5cf6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="h-24"
            />
            
            {/* Profile Content */}
            <View className="px-6 pb-6" style={{ marginTop: -40 }}>
              {/* Avatar */}
              <View className="items-center mb-4">
                <View 
                  className="w-20 h-20 rounded-full items-center justify-center overflow-hidden border-4"
                  style={{ 
                    borderColor: '#0b1220',
                    backgroundColor: '#1e293b',
                  }}
                >
                  <Image
                    source={require('../assets/images/aramonAI.jpg')}
                    style={{ width: 80, height: 80 }}
                    resizeMode="cover"
                  />
                </View>
              </View>

              {/* Name & Username */}
              <View className="items-center mb-6">
                <Text className="text-2xl font-bold text-white">
                  {resident?.full_name || 'User'}
                </Text>
                <Text className="text-slate-400 mt-1">@{username}</Text>
              </View>

              {/* Quick Stats */}
              <View className="flex-row gap-3">
                <View className="flex-1 items-center rounded-2xl bg-slate-700/30 p-4">
                  <Text className="text-2xl font-bold text-white">0</Text>
                  <Text className="text-xs text-slate-400 mt-1">Appointments</Text>
                </View>
                <View className="flex-1 items-center rounded-2xl bg-slate-700/30 p-4">
                  <Text className="text-2xl font-bold text-cyan-400">Active</Text>
                  <Text className="text-xs text-slate-400 mt-1">Status</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Personal Information */}
        <View className="px-4 mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              Personal Information
            </Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Edit3 size={16} {...{ color: "#f97316" }} />
            </TouchableOpacity>
          </View>
          
          <View className="rounded-3xl bg-slate-800/50 border border-slate-700/50 p-5">
            {/* Location */}
            <View className="flex-row items-center mb-4">
              <View className="w-10 h-10 rounded-xl bg-orange-500/20 items-center justify-center mr-3">
                <MapPin size={18} {...{ color: "#f97316" }} />
              </View>
              <View className="flex-1">
                <Text className="text-xs text-slate-500 uppercase">Location</Text>
                <Text className="text-white font-medium">
                  {resident?.purok ? `${resident.purok}, ` : ''}
                  {resident?.barangay || 'Not set'}
                </Text>
              </View>
            </View>

            <View className="h-px bg-slate-700/50 mb-4" />

            {/* Contact */}
            <View className="flex-row items-center mb-4">
              <View className="w-10 h-10 rounded-xl bg-cyan-500/20 items-center justify-center mr-3">
                <Phone size={18} {...{ color: "#06b6d4" }} />
              </View>
              <View className="flex-1">
                <Text className="text-xs text-slate-500 uppercase">Contact Number</Text>
                <Text className="text-white font-medium">
                  {resident?.contact_number || 'Not set'}
                </Text>
              </View>
            </View>

            <View className="h-px bg-slate-700/50 mb-4" />

            {/* Birthday */}
            <View className="flex-row items-center mb-4">
              <View className="w-10 h-10 rounded-xl bg-pink-500/20 items-center justify-center mr-3">
                <Calendar size={18} {...{ color: "#ec4899" }} />
              </View>
              <View className="flex-1">
                <Text className="text-xs text-slate-500 uppercase">Birthday</Text>
                <Text className="text-white font-medium">
                  {formatDate(resident?.birth_date)}
                </Text>
              </View>
            </View>

            <View className="h-px bg-slate-700/50 mb-4" />

            {/* Sex */}
            <View className="flex-row items-center mb-4">
              <View className="w-10 h-10 rounded-xl bg-purple-500/20 items-center justify-center mr-3">
                <Users size={18} {...{ color: "#8b5cf6" }} />
              </View>
              <View className="flex-1">
                <Text className="text-xs text-slate-500 uppercase">Sex</Text>
                <Text className="text-white font-medium">
                  {resident?.sex || 'Not set'}
                </Text>
              </View>
            </View>

            <View className="h-px bg-slate-700/50 mb-4" />

            {/* PhilHealth */}
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-xl bg-green-500/20 items-center justify-center mr-3">
                <CreditCard size={18} {...{ color: "#22c55e" }} />
              </View>
              <View className="flex-1">
                <Text className="text-xs text-slate-500 uppercase">PhilHealth No.</Text>
                <Text className="text-white font-medium">
                  {resident?.philhealth_no || 'Not registered'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Yakap Status */}
        <View className="px-4 mb-6">
          <Text className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">
            Yakap Program
          </Text>
          <TouchableOpacity 
            activeOpacity={0.7}
            className="rounded-3xl bg-slate-800/50 border border-slate-700/50 p-5"
          >
            <View className="flex-row items-center">
              <View className="w-12 h-12 rounded-xl bg-cyan-500/20 items-center justify-center mr-4">
                <FileText size={24} {...{ color: "#06b6d4" }} />
              </View>
              <View className="flex-1">
                <Text className="text-white font-semibold">PhilHealth Konsulta</Text>
                <Text className="text-slate-400 text-sm mt-0.5">
                  {resident?.philhealth_no ? 'Enrolled' : 'Not yet enrolled'}
                </Text>
              </View>
              <View 
                className="px-3 py-1 rounded-full"
                style={{ 
                  backgroundColor: resident?.philhealth_no ? 'rgba(34, 197, 94, 0.2)' : 'rgba(251, 191, 36, 0.2)',
                }}
              >
                <Text 
                  className="text-xs font-medium"
                  style={{ color: resident?.philhealth_no ? '#22c55e' : '#fbbf24' }}
                >
                  {resident?.philhealth_no ? 'Active' : 'Pending'}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Settings */}
        <View className="px-4 mb-6">
          <Text className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">
            Settings
          </Text>
          {settingsOptions.map((option, index) => {
            const IconComponent = option.icon;
            return (
              <TouchableOpacity 
                key={index} 
                className="mb-3 flex-row items-center justify-between rounded-2xl bg-slate-800/50 border border-slate-700/50 p-4" 
                activeOpacity={0.7}
              >
                <View className="flex-row items-center flex-1">
                  <View
                    className="h-10 w-10 items-center justify-center rounded-xl mr-3"
                    style={{ backgroundColor: option.color + '20' }}
                  >
                    <IconComponent size={20} {...{ color: option.color }} />
                  </View>
                  <View className="flex-1">
                    <Text className="font-medium text-white">{option.title}</Text>
                    <Text className="text-xs text-slate-400">{option.description}</Text>
                  </View>
                </View>
                <Text className="text-slate-600 text-xl">›</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Logout Button */}
        <View className="px-4 mb-6">
          <TouchableOpacity 
            onPress={handleLogout}
            className="overflow-hidden rounded-2xl bg-red-900/20 border border-red-800/30 p-4" 
            activeOpacity={0.7}
          >
            <View className="flex-row items-center justify-center gap-2">
              <LogOut size={20} {...{ color: "#ef4444" }} />
              <Text className="font-semibold text-red-400">Sign Out</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View className="px-4">
          <View className="items-center py-4">
            <Text className="text-sm text-slate-500">Aramon AI v1.0.0</Text>
            <Text className="mt-1 text-xs text-slate-600">NagaCare Health Ecosystem</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
