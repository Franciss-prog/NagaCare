import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, Linking } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Header from '../components/Header';
import Card from '../components/Card';
import { healthFacilities, HealthFacility, FacilityType } from '../data/healthFacilities';

const NAGA_CENTER = {
  latitude: 13.6218,
  longitude: 123.1948,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

const FACILITY_COLORS = {
  hospital: '#ef4444',
  'health-center': '#3b82f6',
  clinic: '#8b5cf6',
  pharmacy: '#10b981',
};

const FACILITY_ICONS = {
  hospital: '🏥',
  'health-center': '⚕️',
  clinic: '🩺',
  pharmacy: '💊',
};

export default function FacilitiesScreen() {
  const [selectedType, setSelectedType] = useState<FacilityType | 'all'>('all');
  const [selectedFacility, setSelectedFacility] = useState<HealthFacility | null>(null);
  const [showMap, setShowMap] = useState(true);

  const filteredFacilities =
    selectedType === 'all'
      ? healthFacilities
      : healthFacilities.filter((f) => f.type === selectedType);

  const openDirections = (facility: HealthFacility) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${facility.coordinates.latitude},${facility.coordinates.longitude}`;
    Linking.openURL(url);
  };

  const callFacility = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  return (
    <View className="flex-1 bg-[#0b1220]">
      <Header title="Health Facilities" />

      {/* Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="max-h-16 border-b border-slate-700"
        contentContainerStyle={{ padding: 12, gap: 8 }}
      >
        {(['all', 'hospital', 'health-center', 'clinic', 'pharmacy'] as const).map((type) => (
          <TouchableOpacity
            key={type}
            onPress={() => setSelectedType(type)}
            className={`rounded-full px-4 py-2 ${
              selectedType === type ? 'bg-blue-600' : 'bg-slate-800'
            }`}
          >
            <Text className="font-medium text-white">
              {type === 'all'
                ? '🌐 All'
                : type === 'hospital'
                  ? '🏥 Hospitals'
                  : type === 'health-center'
                    ? '⚕️ Health Centers'
                    : type === 'clinic'
                      ? '🩺 Clinics'
                      : '💊 Pharmacies'}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Map Toggle */}
      <View className="flex-row items-center justify-between border-b border-slate-700 px-4 py-2">
        <Text className="text-slate-300">
          {filteredFacilities.length} facilities found
        </Text>
        <TouchableOpacity
          onPress={() => setShowMap(!showMap)}
          className="rounded-lg bg-slate-800 px-3 py-1.5"
        >
          <Text className="text-sm text-white">{showMap ? '📋 List' : '🗺️ Map'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Map View */}
        {showMap && (
          <View className="mb-4 h-64 overflow-hidden rounded-2xl">
            <MapView
              provider={PROVIDER_GOOGLE}
              style={{ flex: 1 }}
              initialRegion={NAGA_CENTER}
            >
              {filteredFacilities.map((facility) => (
                <Marker
                  key={facility.id}
                  coordinate={facility.coordinates}
                  pinColor={FACILITY_COLORS[facility.type]}
                  onPress={() => setSelectedFacility(facility)}
                  title={facility.name}
                  description={facility.type.replace('-', ' ').toUpperCase()}
                />
              ))}
            </MapView>
          </View>
        )}

        {/* Emergency Facilities Quick Access */}
        <View className="mb-4">
          <Text className="mb-2 text-lg font-bold text-white">🚨 Emergency Services</Text>
          {healthFacilities
            .filter((f) => f.emergencyServices)
            .map((facility) => (
              <TouchableOpacity
                key={facility.id}
                onPress={() => setSelectedFacility(facility)}
                className="mb-2"
              >
                <Card>
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2">
                        <Text className="text-2xl">{FACILITY_ICONS[facility.type]}</Text>
                        <Text className="flex-1 font-semibold text-white">{facility.name}</Text>
                      </View>
                      <Text className="mt-1 text-sm text-slate-400">{facility.address}</Text>
                      {facility.estimatedWaitTime && (
                        <Text className="mt-1 text-sm text-amber-400">
                          ⏱️ ~{facility.estimatedWaitTime} min wait
                        </Text>
                      )}
                    </View>
                    <TouchableOpacity
                      onPress={() => callFacility(facility.contact)}
                      className="ml-2 rounded-lg bg-red-600 px-4 py-2"
                    >
                      <Text className="font-bold text-white">📞 Call</Text>
                    </TouchableOpacity>
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
        </View>

        {/* All Facilities */}
        <Text className="mb-2 text-lg font-bold text-white">All Facilities</Text>
        {filteredFacilities.map((facility) => (
          <TouchableOpacity
            key={facility.id}
            onPress={() => setSelectedFacility(facility)}
            className="mb-3"
          >
            <Card>
              <View className="flex-row items-start justify-between">
                <View className="flex-1">
                  <View className="flex-row items-center gap-2">
                    <Text className="text-2xl">{FACILITY_ICONS[facility.type]}</Text>
                    <View className="flex-1">
                      <Text className="font-semibold text-white">{facility.name}</Text>
                      <Text className="text-xs text-slate-500">
                        {facility.type.replace('-', ' ').toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  <Text className="mt-2 text-sm text-slate-400">{facility.address}</Text>

                  <View className="mt-2 flex-row flex-wrap gap-1">
                    {facility.services.slice(0, 3).map((service, idx) => (
                      <View key={idx} className="rounded-md bg-slate-700 px-2 py-1">
                        <Text className="text-xs text-slate-300">{service}</Text>
                      </View>
                    ))}
                    {facility.services.length > 3 && (
                      <View className="rounded-md bg-slate-700 px-2 py-1">
                        <Text className="text-xs text-slate-300">
                          +{facility.services.length - 3} more
                        </Text>
                      </View>
                    )}
                  </View>

                  <View className="mt-2 flex-row items-center gap-4">
                    <Text className="text-sm text-slate-400">
                      🕒 {facility.operatingHours.weekdays}
                    </Text>
                    <Text className="text-sm text-amber-400">⭐ {facility.rating}</Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => openDirections(facility)}
                  className="ml-2 rounded-lg bg-blue-600 px-3 py-2"
                >
                  <Text className="text-sm font-medium text-white">📍</Text>
                </TouchableOpacity>
              </View>
            </Card>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Facility Detail Modal */}
      <Modal
        visible={selectedFacility !== null}
        animationType="slide"
        transparent
        onRequestClose={() => setSelectedFacility(null)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="max-h-[80%] rounded-t-3xl bg-[#1a2332] p-6">
            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedFacility && (
                <>
                  <View className="mb-4 flex-row items-start justify-between">
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2">
                        <Text className="text-3xl">{FACILITY_ICONS[selectedFacility.type]}</Text>
                        <Text className="flex-1 text-xl font-bold text-white">
                          {selectedFacility.name}
                        </Text>
                      </View>
                      <Text className="mt-1 text-sm text-slate-400">
                        {selectedFacility.type.replace('-', ' ').toUpperCase()}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => setSelectedFacility(null)}
                      className="rounded-lg bg-slate-700 p-2"
                    >
                      <Text className="text-white">✕</Text>
                    </TouchableOpacity>
                  </View>

                  {selectedFacility.emergencyServices && (
                    <View className="mb-4 rounded-lg bg-red-900/30 p-3">
                      <Text className="font-bold text-red-400">
                        🚨 Emergency Services Available
                      </Text>
                    </View>
                  )}

                  {selectedFacility.estimatedWaitTime && (
                    <View className="mb-4 rounded-lg bg-amber-900/30 p-3">
                      <Text className="text-amber-300">
                        ⏱️ Estimated Wait Time: ~{selectedFacility.estimatedWaitTime} minutes
                      </Text>
                    </View>
                  )}

                  <View className="mb-4">
                    <Text className="mb-2 font-semibold text-slate-300">📍 Location</Text>
                    <Text className="text-white">{selectedFacility.address}</Text>
                    <Text className="text-sm text-slate-400">
                      Barangay {selectedFacility.barangay}
                    </Text>
                  </View>

                  <View className="mb-4">
                    <Text className="mb-2 font-semibold text-slate-300">🕒 Operating Hours</Text>
                    <Text className="text-white">
                      Weekdays: {selectedFacility.operatingHours.weekdays}
                    </Text>
                    <Text className="text-white">
                      Weekends: {selectedFacility.operatingHours.weekends}
                    </Text>
                  </View>

                  <View className="mb-4">
                    <Text className="mb-2 font-semibold text-slate-300">
                      🩺 Services Offered
                    </Text>
                    <View className="flex-row flex-wrap gap-2">
                      {selectedFacility.services.map((service, idx) => (
                        <View key={idx} className="rounded-lg bg-blue-900/30 px-3 py-2">
                          <Text className="text-sm text-blue-300">{service}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  <View className="mb-4">
                    <Text className="mb-2 font-semibold text-slate-300">📞 Contact</Text>
                    <Text className="text-white">{selectedFacility.contact}</Text>
                  </View>

                  <View className="mb-6">
                    <Text className="mb-2 font-semibold text-slate-300">⭐ Rating</Text>
                    <Text className="text-2xl text-amber-400">
                      {selectedFacility.rating} / 5.0
                    </Text>
                  </View>

                  <View className="flex-row gap-3">
                    <TouchableOpacity
                      onPress={() => callFacility(selectedFacility.contact)}
                      className="flex-1 rounded-lg bg-green-600 py-3"
                    >
                      <Text className="text-center font-bold text-white">📞 Call</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => openDirections(selectedFacility)}
                      className="flex-1 rounded-lg bg-blue-600 py-3"
                    >
                      <Text className="text-center font-bold text-white">🗺️ Directions</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
