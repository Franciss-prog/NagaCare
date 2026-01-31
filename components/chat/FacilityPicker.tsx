// ============================================================================
// FACILITY PICKER - Inline facility selection in chat
// ============================================================================

import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { MapPin, Star, Clock, ChevronRight } from 'lucide-react-native';
import { HealthFacility } from '../../services/facilityService';

interface FacilityPickerProps {
  facilities: HealthFacility[];
  onSelect: (facility: HealthFacility) => void;
}

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

  return (
    <View className="my-2">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 4 }}
      >
        {facilities.map((facility) => (
          <TouchableOpacity
            key={facility.id}
            onPress={() => onSelect(facility)}
            activeOpacity={0.7}
            className="mr-3 w-64 rounded-2xl bg-slate-800 p-4 border border-slate-700"
          >
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

            {/* Rating & Wait Time */}
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

            {/* Services Preview */}
            <View className="flex-row flex-wrap gap-1 mb-3">
              {facility.services.slice(0, 3).map((service) => (
                <View
                  key={service}
                  className="bg-slate-700/50 rounded-full px-2 py-0.5"
                >
                  <Text className="text-slate-300 text-xs">{service}</Text>
                </View>
              ))}
              {facility.services.length > 3 && (
                <View className="bg-slate-700/50 rounded-full px-2 py-0.5">
                  <Text className="text-slate-400 text-xs">
                    +{facility.services.length - 3} more
                  </Text>
                </View>
              )}
            </View>

            {/* Select Button */}
            <View className="flex-row items-center justify-center bg-cyan-600 rounded-xl py-2">
              <Text className="text-white font-semibold mr-1">Select</Text>
              <ChevronRight size={16} {...{ color: "white" }} />
            </View>
          </TouchableOpacity>
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
