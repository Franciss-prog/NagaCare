// ============================================================================
// PREGNANCY PROFILE LIST SCREEN
// Shows all pregnancy profiles for logged-in resident (own) or
// for City Health staff (search all)
// ============================================================================

import React, { useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, TextInput } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { ArrowLeft, Search, Plus, Heart, Calendar, ChevronRight } from 'lucide-react-native';

import { usePregnancyProfileSearch } from '../hooks/usePregnancyProfile';
import { authService } from '../services/authService';
import type { PregnancyProfileListItem } from '../types/pregnancyProfile';

// ============================================================================
// PROFILE CARD COMPONENT
// ============================================================================

const ProfileCard = ({
  item,
  onPress,
}: {
  item: PregnancyProfileListItem;
  onPress: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    className="mb-3 rounded-2xl border border-slate-800 bg-slate-900/50 p-4"
    activeOpacity={0.7}>
    <View className="flex-row items-center justify-between">
      <View className="flex-1 flex-row items-center">
        <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-pink-600/20">
          <Heart size={18} {...{ color: '#ec4899' }} />
        </View>
        <View className="flex-1">
          <Text className="text-base font-semibold text-white" numberOfLines={1}>
            {item.resident_name}
          </Text>
          <Text className="mt-0.5 text-xs text-slate-400">
            {item.barangay} • G{item.gravida ?? '–'}P{item.para ?? '–'}
          </Text>
        </View>
      </View>
      <View className="items-end">
        {item.visit_date && (
          <View className="mb-1 flex-row items-center">
            <Calendar size={10} {...{ color: '#94a3b8' }} />
            <Text className="ml-1 text-xs text-slate-500">{item.visit_date}</Text>
          </View>
        )}
        <ChevronRight size={16} {...{ color: '#475569' }} />
      </View>
    </View>
  </TouchableOpacity>
);

// ============================================================================
// MAIN SCREEN
// ============================================================================

export default function PregnancyProfileListScreen() {
  const navigation = useNavigation<any>();
  const { results, loading, error, searchQuery, search, loadAll, setSearchQuery } =
    usePregnancyProfileSearch();

  const currentUser = authService.getCurrentUser();
  const isStaff = currentUser?.user_role === 'staff';

  // Reload on focus
  useFocusEffect(
    useCallback(() => {
      loadAll();
    }, [loadAll])
  );

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    // Debounced search
    const timer = setTimeout(() => search(text), 300);
    return () => clearTimeout(timer);
  };

  const handleProfilePress = (item: PregnancyProfileListItem) => {
    navigation.navigate('PregnancyProfileDetail', { profileId: item.id });
  };

  const handleCreateNew = () => {
    navigation.navigate('PregnancyProfileForm', { mode: 'create' });
  };

  return (
    <View className="flex-1 bg-[#0b1220]">
      {/* HEADER */}
      <View className="border-b border-slate-800 bg-slate-900/50 px-4 pb-4 pt-12">
        <View className="mb-4 flex-row items-center justify-between">
          <TouchableOpacity onPress={() => navigation.goBack()} className="-ml-2 p-2">
            <ArrowLeft size={24} {...{ color: 'white' }} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleCreateNew}
            className="flex-row items-center rounded-xl bg-pink-600 px-4 py-2">
            <Plus size={16} {...{ color: 'white' }} />
            <Text className="ml-1 text-sm font-medium text-white">New Profile</Text>
          </TouchableOpacity>
        </View>

        <Text className="mb-1 text-xl font-bold text-white">
          {isStaff ? 'Pregnancy Profiles' : 'My Pregnancy Profile'}
        </Text>
        <Text className="mb-4 text-sm text-slate-400">
          {isStaff
            ? 'Search and manage pregnancy profiles'
            : 'View and manage your pregnancy profile'}
        </Text>

        {/* Search Bar (visible for staff) */}
        {isStaff && (
          <View className="flex-row items-center rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3">
            <Search size={18} {...{ color: '#64748b' }} />
            <TextInput
              className="ml-3 flex-1 text-white"
              placeholder="Search by name..."
              placeholderTextColor="#64748b"
              value={searchQuery}
              onChangeText={handleSearch}
              autoCapitalize="none"
            />
          </View>
        )}
      </View>

      {/* CONTENT */}
      {loading && results.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#06b6d4" />
          <Text className="mt-4 text-slate-400">Loading profiles...</Text>
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="mb-2 text-red-400">{error}</Text>
          <TouchableOpacity onPress={() => loadAll()} className="rounded-xl bg-slate-700 px-6 py-3">
            <Text className="font-medium text-white">Retry</Text>
          </TouchableOpacity>
        </View>
      ) : results.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-slate-800">
            <Heart size={32} {...{ color: '#475569' }} />
          </View>
          <Text className="mb-2 text-center text-base text-slate-400">
            {searchQuery ? 'No profiles match your search' : 'No pregnancy profiles yet'}
          </Text>
          <Text className="mb-6 text-center text-sm text-slate-500">
            {isStaff
              ? 'Create a new pregnancy profile for a resident'
              : 'Your pregnancy profile will appear here once created'}
          </Text>
          <TouchableOpacity onPress={handleCreateNew} className="rounded-xl bg-pink-600 px-6 py-3">
            <Text className="font-medium text-white">Create Profile</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <ProfileCard item={item} onPress={() => handleProfilePress(item)} />
          )}
          refreshing={loading}
          onRefresh={() => search(searchQuery)}
        />
      )}
    </View>
  );
}
