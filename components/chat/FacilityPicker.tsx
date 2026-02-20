// ============================================================================
// FACILITY PICKER - Inline facility selection in chat
// Now supports distance display and matched service badges
// ============================================================================

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { MapPin, Star, Clock, ChevronRight, CheckCircle, Navigation } from 'lucide-react-native';
import { HealthFacility, FacilityWithDistance } from '../../services/facilityService';

interface FacilityPickerProps {
  facilities: (HealthFacility | FacilityWithDistance)[];
  onSelect: (facility: HealthFacility) => void;
}

// Type guard to check if facility has distance info
function isFacilityWithDistance(
  f: HealthFacility | FacilityWithDistance
): f is FacilityWithDistance {
  return 'matchedServiceType' in f;
}

// Individual card component so each can track its own expanded state
const FacilityCard: React.FC<{
  facility: HealthFacility | FacilityWithDistance;
  onSelect: (facility: HealthFacility) => void;
  getFacilityIcon: (type: HealthFacility['type']) => string;
  getFacilityTypeLabel: (type: HealthFacility['type']) => string;
  formatDistance: (km: number) => string;
}> = ({ facility, onSelect, getFacilityIcon, getFacilityTypeLabel, formatDistance }) => {
  const [expanded, setExpanded] = useState(false);
  const hasDistance = isFacilityWithDistance(facility);
  const visibleServices = expanded ? facility.services : facility.services.slice(0, 3);
  const hasMore = facility.services.length > 3;

  return (
    <TouchableOpacity
      key={facility.id}
      onPress={() => onSelect(facility)}
      activeOpacity={0.7}
      className="mr-3 w-64 rounded-2xl bg-slate-800 p-4 border border-slate-700 flex-1 justify-between"
      style={{ minHeight: 280 }}
    >
      {/* Top content */}
      <View>
        {/* Matched Service Badge */}
        {hasDistance && facility.matchedServiceType !== 'general' && (
          <View className="flex-row items-center bg-emerald-500/20 rounded-lg px-2 py-1 mb-2 self-start">
            <CheckCircle size={12} {...{ color: "#10b981" }} />
            <Text className="text-emerald-400 text-xs font-medium ml-1">
              {facility.matchedServiceLabel}
            </Text>
          </View>
        )}

        {/* Header */}
        <View className="flex-row items-start justify-between mb-2">
          <View className="flex-1">
            <Text className="text-2xl mb-1">
              {getFacilityIcon(facility.type)}
            </Text>
            <Text className="text-white font-semibold text-base" numberOfLines={2}>
              {facility.name}
            </Text>
          </View>
          <View className="bg-cyan-500/20 rounded-full px-2 py-1">
            <Text className="text-cyan-400 text-xs font-medium">
              {getFacilityTypeLabel(facility.type)}
            </Text>
          </View>
        </View>

        {/* Address */}
        <View className="flex-row items-center mb-2">
          <MapPin size={14} {...{ color: "#22c55e" }} />
          <Text className="text-slate-400 text-xs ml-1 flex-1" numberOfLines={1}>
            {facility.address}
          </Text>
        </View>

        {/* Distance badge */}
        {hasDistance && facility.distanceKm !== null && (
          <View className="flex-row items-center mb-2 bg-blue-500/15 rounded-lg px-2 py-1 self-start">
            <Navigation size={12} {...{ color: "#60a5fa" }} />
            <Text className="text-blue-400 text-xs font-medium ml-1">
              {formatDistance(facility.distanceKm)}
            </Text>
          </View>
        )}

        {/* Rating & Hours */}
        <View className="flex-row items-center justify-between mb-3">
          {facility.yakap_accredited && (
            <View className="flex-row items-center">
              <Star size={14} {...{ color: "#fbbf24", fill: "#fbbf24" }} />
              <Text className="text-amber-400 text-sm ml-1 font-medium">
                YAKAP Accredited
              </Text>
            </View>
          )}
          {facility.operating_hours && (
            <View className="flex-row items-center">
              <Clock size={14} {...{ color: "#94a3b8" }} />
              <Text className="text-slate-400 text-xs ml-1" numberOfLines={1}>
                {facility.operating_hours}
              </Text>
            </View>
          )}
        </View>

        {/* Services — expandable */}
        <View className="flex-row flex-wrap gap-1 mb-3">
          {visibleServices.map((service) => (
            <View
              key={service}
              className="bg-slate-700/50 rounded-full px-2 py-0.5"
            >
              <Text className="text-slate-300 text-xs">{service}</Text>
            </View>
          ))}
          {hasMore && (
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                setExpanded(!expanded);
              }}
              activeOpacity={0.6}
              className="bg-cyan-500/20 rounded-full px-2 py-0.5"
            >
              <Text className="text-cyan-400 text-xs font-medium">
                {expanded ? 'Show less' : `+${facility.services.length - 3} more`}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Select Button — pinned to bottom */}
      <View className="flex-row items-center justify-center bg-cyan-600 rounded-xl py-2 mt-auto">
        <Text className="text-white font-semibold mr-1">Select</Text>
        <ChevronRight size={16} {...{ color: "white" }} />
      </View>
    </TouchableOpacity>
  );
};

export const FacilityPicker: React.FC<FacilityPickerProps> = ({
  facilities,
  onSelect,
}) => {
  const getFacilityIcon = (type: HealthFacility['type']) => {
    switch (type) {
      case 'hospital':
        return '🏥';
      case 'health-center':
        return '🏨';
      case 'clinic':
        return '🩺';
      case 'pharmacy':
        return '💊';
      default:
        return '🏥';
    }
  };

  const getFacilityTypeLabel = (type: HealthFacility['type']) => {
    switch (type) {
      case 'hospital':
        return 'Hospital';
      case 'health-center':
        return 'Health Center';
      case 'clinic':
        return 'Clinic';
      case 'pharmacy':
        return 'Pharmacy';
      default:
        return 'Facility';
    }
  };

  const formatDistance = (km: number): string => {
    if (km < 1) {
      return `${Math.round(km * 1000)}m away`;
    }
    return `${km.toFixed(1)}km away`;
  };

  return (
    <View className="my-2">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 4 }}
      >
        {facilities.map((facility) => (
          <FacilityCard
            key={facility.id}
            facility={facility}
            onSelect={onSelect}
            getFacilityIcon={getFacilityIcon}
            getFacilityTypeLabel={getFacilityTypeLabel}
            formatDistance={formatDistance}
          />
        ))}
      </ScrollView>

      {/* Helper Text */}
      <Text className="text-slate-500 text-xs text-center mt-2">
        Swipe to see more options →
      </Text>
    </View>
  );
};

export default FacilityPicker;
