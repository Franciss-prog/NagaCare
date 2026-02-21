// ============================================================================
// CITY HEALTH SEARCH SCREEN
// Staff-only screen to search pregnancy profiles by name/barangay
// and view/update profiles for authorized City Health personnel
// ============================================================================

import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, TextInput } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import {
  ArrowLeft,
  Search,
  Filter,
  Heart,
  Calendar,
  ChevronRight,
  Shield,
  MapPin,
  Users,
} from 'lucide-react-native';

import { usePregnancyProfileSearch } from '../hooks/usePregnancyProfile';
import { authService } from '../services/authService';
import type { PregnancyProfileListItem } from '../types/pregnancyProfile';

// ============================================================================
// BARANGAY FILTER OPTIONS
// ============================================================================

const BARANGAYS = [
  'All Barangays',
  'Abella',
  'Bagumbayan Norte',
  'Bagumbayan Sur',
  'Balatas',
  'Calauag',
  'Cararayan',
  'Carolina',
  'Concepcion Grande',
  'Concepcion Pequeña',
  'Dayangdang',
  'Del Rosario',
  'Dinaga',
  'Igualdad Interior',
  'Lerma',
  'Liboton',
  'Mabolo',
  'Pacol',
  'Panicuason',
  'Peñafrancia',
  'Sabang',
  'San Felipe',
  'San Francisco',
  'San Isidro',
  'Santa Cruz',
  'Tabuco',
  'Tinago',
  'Triangulo',
];

// No status column in actual DB — filter removed

// ============================================================================
// PROFILE RESULT CARD
// ============================================================================

const SearchResultCard = ({
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
    <View className="flex-row items-start justify-between">
      <View className="flex-1 flex-row items-center">
        <View className="mr-3 h-12 w-12 items-center justify-center rounded-full bg-pink-600/20">
          <Heart size={20} {...{ color: '#ec4899' }} />
        </View>
        <View className="flex-1">
          <Text className="text-base font-semibold text-white" numberOfLines={1}>
            {item.resident_name}
          </Text>
          <View className="mt-1 flex-row items-center">
            <MapPin size={12} {...{ color: '#94a3b8' }} />
            <Text className="ml-1 text-xs text-slate-400">{item.barangay}</Text>
          </View>
          <View className="mt-1 flex-row items-center">
            <Text className="text-xs text-slate-500">
              G{item.gravida ?? '–'}P{item.para ?? '–'}
            </Text>
            {item.visit_date && (
              <>
                <Text className="mx-1 text-slate-600">•</Text>
                <Calendar size={10} {...{ color: '#94a3b8' }} />
                <Text className="ml-1 text-xs text-slate-400">Visit: {item.visit_date}</Text>
              </>
            )}
          </View>
        </View>
      </View>
      <View className="items-end">
        <Text className="text-xs text-slate-600">
          {new Date(item.updated_at).toLocaleDateString()}
        </Text>
        <ChevronRight size={16} {...{ color: '#475569' }} />
      </View>
    </View>
  </TouchableOpacity>
);

// ============================================================================
// MAIN SCREEN
// ============================================================================

export default function CityHealthSearchScreen() {
  const navigation = useNavigation<any>();
  const { results, loading, error, searchQuery, search, loadAll, setSearchQuery } =
    usePregnancyProfileSearch();

  const [_statusFilter, _setStatusFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const currentUser = authService.getCurrentUser();
  const isStaff = currentUser?.user_role === 'staff';

  // Load on focus
  useFocusEffect(
    useCallback(() => {
      loadAll();
    }, [loadAll])
  );

  // Access guard
  if (!isStaff) {
    return (
      <View className="flex-1 items-center justify-center bg-[#0b1220] px-6">
        <Shield size={48} {...{ color: '#ef4444' }} />
        <Text className="mt-4 text-lg font-semibold text-red-400">Access Denied</Text>
        <Text className="mt-2 text-center text-slate-400">
          This screen is only accessible to City Health Office staff.
        </Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="mt-6 rounded-xl bg-slate-700 px-6 py-3">
          <Text className="font-medium text-white">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    const timer = setTimeout(() => {
      search(text);
    }, 300);
    return () => clearTimeout(timer);
  };

  // Status filter removed — no status column in actual DB

  const handleProfilePress = (item: PregnancyProfileListItem) => {
    navigation.navigate('PregnancyProfileDetail', { profileId: item.id });
  };

  return (
    <View className="flex-1 bg-[#0b1220]">
      {/* HEADER */}
      <View className="border-b border-slate-800 bg-slate-900/50 px-4 pb-4 pt-12">
        <View className="mb-4 flex-row items-center justify-between">
          <TouchableOpacity onPress={() => navigation.goBack()} className="-ml-2 p-2">
            <ArrowLeft size={24} {...{ color: 'white' }} />
          </TouchableOpacity>
          <View className="flex-row items-center rounded-full bg-pink-600/20 px-3 py-1">
            <Shield size={14} {...{ color: '#ec4899' }} />
            <Text className="ml-1 text-xs font-medium text-pink-400">Staff Access</Text>
          </View>
        </View>

        <View className="mb-3 flex-row items-center">
          <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-cyan-600/20">
            <Users size={20} {...{ color: '#06b6d4' }} />
          </View>
          <View>
            <Text className="text-xl font-bold text-white">City Health Module</Text>
            <Text className="text-sm text-slate-400">Pregnancy Profile Search</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View className="mb-3 flex-row items-center rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3">
          <Search size={18} {...{ color: '#64748b' }} />
          <TextInput
            className="ml-3 flex-1 text-white"
            placeholder="Search by patient name..."
            placeholderTextColor="#64748b"
            value={searchQuery}
            onChangeText={handleSearch}
            autoCapitalize="none"
          />
        </View>

        {/* Results count */}
        <Text className="text-xs text-slate-500">
          {results.length} profile{results.length !== 1 ? 's' : ''} found
        </Text>
      </View>

      {/* RESULTS LIST */}
      {loading && results.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#06b6d4" />
          <Text className="mt-4 text-slate-400">Searching...</Text>
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
          <Search size={48} {...{ color: '#475569' }} />
          <Text className="mb-2 mt-4 text-center text-base text-slate-400">
            {searchQuery ? `No profiles match "${searchQuery}"` : 'No pregnancy profiles found'}
          </Text>
          <Text className="text-center text-sm text-slate-500">
            Try a different search term or adjust filters
          </Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <SearchResultCard item={item} onPress={() => handleProfilePress(item)} />
          )}
          refreshing={loading}
          onRefresh={() => search(searchQuery)}
        />
      )}
    </View>
  );
}
