import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { MapPin, Users, Baby, HeartPulse, X } from 'lucide-react-native';
import Header from '../components/Header';
import Card from '../components/Card';
import { nagaCityHealthData, getCityWideStats, NAGA_CITY_CENTER, BarangayHealthData } from '../data/nagaCityHealthData';

export default function HealthMapScreen() {
  const [selectedBarangay, setSelectedBarangay] = useState<BarangayHealthData | null>(null);
  const [showLegend, setShowLegend] = useState(true);
  const cityStats = getCityWideStats();

  const getMarkerColor = (vaccinationCoverage: number) => {
    if (vaccinationCoverage >= 90) return '#10b981'; // green
    if (vaccinationCoverage >= 85) return '#f59e0b'; // orange
    return '#ef4444'; // red
  };

  return (
    <View className="flex-1 bg-[#0b1220]">
      <Header title="Health Map - Naga City" />
      
      <View className="flex-1">
        {/* Map View */}
        <View className="h-[45%] relative">
          <MapView
            style={StyleSheet.absoluteFillObject}
            provider={PROVIDER_GOOGLE}
            initialRegion={NAGA_CITY_CENTER}
            showsUserLocation={false}
            showsMyLocationButton={false}
          >
            {nagaCityHealthData.map((barangay) => (
              <Marker
                key={barangay.id}
                coordinate={barangay.coordinates}
                onPress={() => setSelectedBarangay(barangay)}
                pinColor={getMarkerColor(barangay.childrenHealth.vaccinationCoverage)}
              />
            ))}
          </MapView>

          {/* Legend */}
          {showLegend && (
            <View className="absolute bottom-4 right-4 rounded-lg bg-slate-900/95 p-3">
              <View className="mb-2 flex-row items-center justify-between">
                <Text className="text-xs font-semibold text-white">Vaccination Coverage</Text>
                <TouchableOpacity onPress={() => setShowLegend(false)}>
                  <X size={16} color="#94a3b8" />
                </TouchableOpacity>
              </View>
              <View className="flex-row items-center gap-2">
                <View className="h-3 w-3 rounded-full bg-green-500" />
                <Text className="text-xs text-slate-300">≥ 90%</Text>
              </View>
              <View className="flex-row items-center gap-2">
                <View className="h-3 w-3 rounded-full bg-orange-500" />
                <Text className="text-xs text-slate-300">85-89%</Text>
              </View>
              <View className="flex-row items-center gap-2">
                <View className="h-3 w-3 rounded-full bg-red-500" />
                <Text className="text-xs text-slate-300">{'< 85%'}</Text>
              </View>
            </View>
          )}

          {!showLegend && (
            <TouchableOpacity
              onPress={() => setShowLegend(true)}
              className="absolute bottom-4 right-4 rounded-lg bg-slate-900/95 px-3 py-2"
            >
              <Text className="text-xs text-white">Show Legend</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Statistics and Data */}
        <ScrollView className="flex-1 px-4 pt-4" contentContainerStyle={{ paddingBottom: 20 }}>
          {/* City-Wide Summary */}
          <Card title="Naga City Health Overview">
            <View className="gap-3">
              <View className="flex-row items-center gap-2">
                <Users size={18} color="#60a5fa" />
                <Text className="text-slate-200">
                  Total Population: <Text className="font-semibold">{cityStats.population.toLocaleString()}</Text>
                </Text>
              </View>
              <View className="flex-row items-center gap-2">
                <Baby size={18} color="#10b981" />
                <Text className="text-slate-200">
                  Children Monitored: <Text className="font-semibold">{cityStats.totalChildren.toLocaleString()}</Text>
                </Text>
              </View>
              <View className="flex-row items-center gap-2">
                <HeartPulse size={18} color="#f472b6" />
                <Text className="text-slate-200">
                  Pregnant Women Enrolled: <Text className="font-semibold">{cityStats.pregnantEnrolled} / {cityStats.totalPregnant}</Text>
                </Text>
              </View>
            </View>
          </Card>

          <View className="h-4" />

          {/* Quick Stats */}
          <View className="flex-row gap-2">
            <View className="flex-1 rounded-lg bg-slate-800 p-4">
              <Text className="text-2xl font-bold text-green-400">{cityStats.averageVaccinationRate}%</Text>
              <Text className="text-xs text-slate-300">Avg. Vaccination Rate</Text>
            </View>
            <View className="flex-1 rounded-lg bg-slate-800 p-4">
              <Text className="text-2xl font-bold text-pink-400">{cityStats.averageEnrollmentRate}%</Text>
              <Text className="text-xs text-slate-300">Avg. Enrollment Rate</Text>
            </View>
          </View>

          <View className="h-4" />

          {/* Instructions */}
          <View className="rounded-lg bg-blue-900/30 border border-blue-800/50 p-3">
            <Text className="text-sm text-blue-300">
              <MapPin size={14} color="#93c5fd" /> Tap any marker on the map to view detailed barangay health data
            </Text>
          </View>
        </ScrollView>
      </View>

      {/* Barangay Details Modal */}
      <Modal
        visible={selectedBarangay !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedBarangay(null)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="max-h-[70%] rounded-t-3xl bg-slate-900 p-6">
            <View className="mb-4 flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <MapPin size={20} color="#60a5fa" />
                <Text className="text-xl font-bold text-white">Brgy. {selectedBarangay?.name}</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedBarangay(null)}>
                <X size={24} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedBarangay && (
                <View className="gap-4">
                  {/* Population */}
                  <View className="rounded-lg bg-slate-800 p-4">
                    <View className="flex-row items-center gap-2 mb-2">
                      <Users size={18} color="#60a5fa" />
                      <Text className="font-semibold text-white">Population</Text>
                    </View>
                    <Text className="text-2xl font-bold text-blue-400">
                      {selectedBarangay.population.toLocaleString()}
                    </Text>
                  </View>

                  {/* Children's Health */}
                  <View className="rounded-lg bg-slate-800 p-4">
                    <View className="flex-row items-center gap-2 mb-3">
                      <Baby size={18} color="#10b981" />
                      <Text className="font-semibold text-white">Children's Health</Text>
                    </View>
                    <View className="gap-2">
                      <View className="flex-row justify-between">
                        <Text className="text-slate-300">Total Children:</Text>
                        <Text className="font-semibold text-white">{selectedBarangay.childrenHealth.totalChildren}</Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text className="text-slate-300">Fully Immunized:</Text>
                        <Text className="font-semibold text-green-400">{selectedBarangay.childrenHealth.fullyImmunized}</Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text className="text-slate-300">Vaccination Coverage:</Text>
                        <Text className="font-semibold text-green-400">{selectedBarangay.childrenHealth.vaccinationCoverage}%</Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text className="text-slate-300">Completion Rate:</Text>
                        <Text className="font-semibold text-green-400">{selectedBarangay.childrenHealth.vaccinationCompletionRate}%</Text>
                      </View>
                    </View>
                  </View>

                  {/* Maternal Health */}
                  <View className="rounded-lg bg-slate-800 p-4">
                    <View className="flex-row items-center gap-2 mb-3">
                      <HeartPulse size={18} color="#f472b6" />
                      <Text className="font-semibold text-white">Maternal Health</Text>
                    </View>
                    <View className="gap-2">
                      <View className="flex-row justify-between">
                        <Text className="text-slate-300">Total Pregnant:</Text>
                        <Text className="font-semibold text-white">{selectedBarangay.maternalHealth.totalPregnant}</Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text className="text-slate-300">Enrolled in Programs:</Text>
                        <Text className="font-semibold text-pink-400">{selectedBarangay.maternalHealth.pregnantEnrolled}</Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text className="text-slate-300">Enrollment Rate:</Text>
                        <Text className="font-semibold text-pink-400">{selectedBarangay.maternalHealth.enrollmentRate}%</Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text className="text-slate-300">Prenatal Visit Compliance:</Text>
                        <Text className="font-semibold text-pink-400">{selectedBarangay.maternalHealth.prenatalVisitCompliance}%</Text>
                      </View>
                    </View>
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
