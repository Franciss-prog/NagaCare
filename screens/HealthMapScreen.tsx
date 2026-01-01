import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, StyleSheet, TextInput } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { MapPin, Users, Baby, HeartPulse, X, Stethoscope, Search, Layers } from 'lucide-react-native';
import Header from '../components/Header';
import Card from '../components/Card';
import {
  nagaCityHealthData,
  getCityWideStats,
  NAGA_CITY_CENTER,
  BarangayHealthData,
} from '../data/nagaCityHealthData';

type HealthLayer = 'vaccination' | 'maternal' | 'senior';

export default function HealthMapScreen() {
  const [selectedBarangay, setSelectedBarangay] = useState<BarangayHealthData | null>(null);
  const [showLegend, setShowLegend] = useState(true);
  const [activeLayer, setActiveLayer] = useState<HealthLayer>('vaccination');
  const [searchQuery, setSearchQuery] = useState('');
  const [showLayerSelector, setShowLayerSelector] = useState(false);
  
  const cityStats = getCityWideStats();

  const getMarkerColor = (barangay: BarangayHealthData, layer: HealthLayer) => {
    let value = 0;
    switch (layer) {
      case 'vaccination':
        value = barangay.childrenHealth.vaccinationCoverage;
        break;
      case 'maternal':
        value = barangay.maternalHealth.enrollmentRate;
        break;
      case 'senior':
        value = barangay.seniorCitizen.coverageRate;
        break;
    }
    
    if (value >= 85) return '#22c55e'; // green - good coverage
    if (value >= 70) return '#FCD34D'; // yellow - moderate
    return '#FF6B35'; // orange/red - needs attention
  };

  const getLegendTitle = (layer: HealthLayer) => {
    switch (layer) {
      case 'vaccination':
        return 'Vaccination Coverage';
      case 'maternal':
        return 'Maternal Care Enrollment';
      case 'senior':
        return 'Senior Citizen Assistance';
    }
  };

  const filteredBarangays = searchQuery.trim()
    ? nagaCityHealthData.filter(b => 
        b.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : nagaCityHealthData;

  return (
    <View className="flex-1 bg-[#0b1220]">
      <Header title="Health Map - Naga City" />

      <View className="flex-1">
        {/* Search Bar */}
        <View className="border-b border-slate-800 bg-slate-900/50 px-4 py-2">
          <View className="flex-row items-center gap-2 rounded-lg bg-slate-800 px-3 py-2">
            <Search size={18} color="#94a3b8" />
            <TextInput
              placeholder="Search barangay..."
              placeholderTextColor="#64748b"
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="flex-1 text-white"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={18} color="#94a3b8" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Map View */}
        <View className="relative h-[45%]">
          <MapView
            style={StyleSheet.absoluteFillObject}
            provider={PROVIDER_GOOGLE}
            initialRegion={NAGA_CITY_CENTER}
            showsUserLocation={false}
            showsMyLocationButton={false}>
            {filteredBarangays.map((barangay) => (
              <Marker
                key={barangay.id}
                coordinate={barangay.coordinates}
                onPress={() => setSelectedBarangay(barangay)}
                pinColor={getMarkerColor(barangay, activeLayer)}
              />
            ))}
          </MapView>

          {/* Layer Selector Button */}
          <TouchableOpacity
            onPress={() => setShowLayerSelector(!showLayerSelector)}
            className="absolute left-4 top-4 flex-row items-center gap-2 rounded-lg bg-slate-900/95 px-3 py-2">
            <Layers size={18} color="#06b6d4" />
            <Text className="text-sm font-semibold text-white">{getLegendTitle(activeLayer)}</Text>
          </TouchableOpacity>

          {/* Layer Selector Dropdown */}
          {showLayerSelector && (
            <View className="absolute left-4 top-14 rounded-lg bg-slate-900/95 p-2">
              <TouchableOpacity
                onPress={() => { setActiveLayer('vaccination'); setShowLayerSelector(false); }}
                className={`flex-row items-center gap-2 rounded-lg px-3 py-2 ${activeLayer === 'vaccination' ? 'bg-cyan-500/20' : ''}`}>
                <Baby size={16} color={activeLayer === 'vaccination' ? '#06b6d4' : '#94a3b8'} />
                <Text className={`text-sm ${activeLayer === 'vaccination' ? 'font-semibold text-cyan-400' : 'text-slate-300'}`}>
                  Vaccination Coverage
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => { setActiveLayer('maternal'); setShowLayerSelector(false); }}
                className={`flex-row items-center gap-2 rounded-lg px-3 py-2 ${activeLayer === 'maternal' ? 'bg-pink-500/20' : ''}`}>
                <HeartPulse size={16} color={activeLayer === 'maternal' ? '#ec4899' : '#94a3b8'} />
                <Text className={`text-sm ${activeLayer === 'maternal' ? 'font-semibold text-pink-400' : 'text-slate-300'}`}>
                  Maternal Care
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => { setActiveLayer('senior'); setShowLayerSelector(false); }}
                className={`flex-row items-center gap-2 rounded-lg px-3 py-2 ${activeLayer === 'senior' ? 'bg-purple-500/20' : ''}`}>
                <Stethoscope size={16} color={activeLayer === 'senior' ? '#a855f7' : '#94a3b8'} />
                <Text className={`text-sm ${activeLayer === 'senior' ? 'font-semibold text-purple-400' : 'text-slate-300'}`}>
                  Senior Citizen Care
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Legend */}
          {showLegend && (
            <View className="absolute bottom-4 right-4 rounded-lg bg-slate-900/95 p-3">
              <View className="mb-2 flex-row items-center justify-between">
                <Text className="text-xs font-semibold text-white">{getLegendTitle(activeLayer)}</Text>
                <TouchableOpacity onPress={() => setShowLegend(false)}>
                  <X size={16} color="#94a3b8" />
                </TouchableOpacity>
              </View>
              <View className="flex-row items-center gap-2">
                <View className="h-3 w-3 rounded-full" style={{ backgroundColor: '#22c55e' }} />
                <Text className="text-xs text-slate-300">≥ 85% (Good)</Text>
              </View>
              <View className="flex-row items-center gap-2">
                <View className="h-3 w-3 rounded-full" style={{ backgroundColor: '#FCD34D' }} />
                <Text className="text-xs text-slate-300">70-84% (Fair)</Text>
              </View>
              <View className="flex-row items-center gap-2">
                <View className="h-3 w-3 rounded-full" style={{ backgroundColor: '#FF6B35' }} />
                <Text className="text-xs text-slate-300">{'< 70% (Needs Attention)'}</Text>
              </View>
            </View>
          )}

          {!showLegend && (
            <TouchableOpacity
              onPress={() => setShowLegend(true)}
              className="absolute bottom-4 right-4 rounded-lg bg-slate-900/95 px-3 py-2">
              <Text className="text-xs text-white">Show Legend</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Statistics and Data */}
        <ScrollView className="flex-1 px-4 pt-4" contentContainerStyle={{ paddingBottom: 20 }}>
          {/* Active Layer Statistics */}
          {activeLayer === 'vaccination' && (
            <Card title="Children's Health Overview">
              <View className="gap-3">
                <View className="flex-row items-center justify-between">
                  <Text className="text-slate-300">Total Children Monitored</Text>
                  <Text className="text-lg font-bold text-green-400">
                    {cityStats.totalChildren.toLocaleString()}
                  </Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-slate-300">Avg. Vaccination Rate</Text>
                  <Text className="text-lg font-bold text-green-400">
                    {cityStats.averageVaccinationRate}%
                  </Text>
                </View>
                <View className="rounded-lg bg-green-900/20 border border-green-500/30 p-2">
                  <Text className="text-xs text-green-300">
                    🎯 Target: 95% vaccination coverage citywide
                  </Text>
                </View>
              </View>
            </Card>
          )}

          {activeLayer === 'maternal' && (
            <Card title="Maternal Health Overview">
              <View className="gap-3">
                <View className="flex-row items-center justify-between">
                  <Text className="text-slate-300">Pregnant Women Enrolled</Text>
                  <Text className="text-lg font-bold text-pink-400">
                    {cityStats.pregnantEnrolled} / {cityStats.totalPregnant}
                  </Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-slate-300">Avg. Enrollment Rate</Text>
                  <Text className="text-lg font-bold text-pink-400">
                    {cityStats.averageEnrollmentRate}%
                  </Text>
                </View>
                <View className="rounded-lg bg-pink-900/20 border border-pink-500/30 p-2">
                  <Text className="text-xs text-pink-300">
                    🎯 Ensure all pregnant women receive prenatal care
                  </Text>
                </View>
              </View>
            </Card>
          )}

          {activeLayer === 'senior' && (
            <Card title="Senior Citizen Care Overview">
              <View className="gap-3">
                <View className="flex-row items-center justify-between">
                  <Text className="text-slate-300">Total Senior Citizens</Text>
                  <Text className="text-lg font-bold text-purple-400">
                    {nagaCityHealthData.reduce((sum, b) => sum + b.seniorCitizen.total, 0).toLocaleString()}
                  </Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-slate-300">Receiving Assistance</Text>
                  <Text className="text-lg font-bold text-purple-400">
                    {nagaCityHealthData.reduce((sum, b) => sum + b.seniorCitizen.receivingAssistance, 0).toLocaleString()}
                  </Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-slate-300">Avg. Coverage Rate</Text>
                  <Text className="text-lg font-bold text-purple-400">
                    {Math.round(nagaCityHealthData.reduce((sum, b) => sum + b.seniorCitizen.coverageRate, 0) / nagaCityHealthData.length)}%
                  </Text>
                </View>
                <View className="rounded-lg bg-purple-900/20 border border-purple-500/30 p-2">
                  <Text className="text-xs text-purple-300">
                    🎯 Expand assistance programs for elderly care
                  </Text>
                </View>
              </View>
            </Card>
          )}

          <View className="h-4" />

          {/* Priority Areas Alert */}
          <Card title="Priority Areas">
            <View className="gap-2">
              {nagaCityHealthData
                .filter(b => {
                  switch(activeLayer) {
                    case 'vaccination':
                      return b.childrenHealth.vaccinationCoverage < 85;
                    case 'maternal':
                      return b.maternalHealth.enrollmentRate < 85;
                    case 'senior':
                      return b.seniorCitizen.coverageRate < 70;
                  }
                })
                .slice(0, 5)
                .map(b => (
                  <TouchableOpacity
                    key={b.id}
                    onPress={() => setSelectedBarangay(b)}
                    className="flex-row items-center justify-between rounded-lg bg-orange-900/20 border border-orange-500/30 p-2">
                    <Text className="font-medium text-orange-300">{b.name}</Text>
                    <Text className="text-sm text-orange-400">
                      {activeLayer === 'vaccination' && `${b.childrenHealth.vaccinationCoverage}%`}
                      {activeLayer === 'maternal' && `${b.maternalHealth.enrollmentRate}%`}
                      {activeLayer === 'senior' && `${b.seniorCitizen.coverageRate}%`}
                    </Text>
                  </TouchableOpacity>
                ))}
            </View>
          </Card>

          <View className="h-4" />

          {/* Instructions */}
          <View className="rounded-lg border border-secondary/50 bg-secondary/20 p-3">
            <Text className="text-sm text-purple-300">
              <MapPin size={14} color="#A78BFA" /> Tap any marker on the map to view detailed barangay health data
            </Text>
          </View>
        </ScrollView>
      </View>

      {/* Barangay Details Modal */}
      <Modal
        visible={selectedBarangay !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedBarangay(null)}>
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
                    <View className="mb-2 flex-row items-center gap-2">
                      <Users size={18} color="#06b6d4" />
                      <Text className="font-semibold text-white">Population</Text>
                    </View>
                    <Text className="text-2xl font-bold text-cyan-400">
                      {selectedBarangay.population.toLocaleString()}
                    </Text>
                  </View>

                  {/* Children's Health */}
                  <View className="rounded-lg bg-slate-800 p-4">
                    <View className="mb-3 flex-row items-center gap-2">
                      <Baby size={18} color="#22c55e" />
                      <Text className="font-semibold text-white">Children's Health</Text>
                    </View>
                    <View className="gap-2">
                      <View className="flex-row justify-between">
                        <Text className="text-slate-300">Total Children:</Text>
                        <Text className="font-semibold text-white">
                          {selectedBarangay.childrenHealth.totalChildren}
                        </Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text className="text-slate-300">Fully Immunized:</Text>
                        <Text className="font-semibold text-green-400">
                          {selectedBarangay.childrenHealth.fullyImmunized}
                        </Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text className="text-slate-300">Vaccination Coverage:</Text>
                        <Text className="font-semibold text-green-400">
                          {selectedBarangay.childrenHealth.vaccinationCoverage}%
                        </Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text className="text-slate-300">Completion Rate:</Text>
                        <Text className="font-semibold text-green-400">
                          {selectedBarangay.childrenHealth.vaccinationCompletionRate}%
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Maternal Health */}
                  <View className="rounded-lg bg-slate-800 p-4">
                    <View className="mb-3 flex-row items-center gap-2">
                      <HeartPulse size={18} color="#ec4899" />
                      <Text className="font-semibold text-white">Maternal Health</Text>
                    </View>
                    <View className="gap-2">
                      <View className="flex-row justify-between">
                        <Text className="text-slate-300">Total Pregnant:</Text>
                        <Text className="font-semibold text-white">
                          {selectedBarangay.maternalHealth.totalPregnant}
                        </Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text className="text-slate-300">Enrolled in Programs:</Text>
                        <Text className="font-semibold text-pink-400">
                          {selectedBarangay.maternalHealth.pregnantEnrolled}
                        </Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text className="text-slate-300">Enrollment Rate:</Text>
                        <Text className="font-semibold text-pink-400">
                          {selectedBarangay.maternalHealth.enrollmentRate}%
                        </Text>
                      </View>
                      
                      {/* Trimester Breakdown */}
                      <View className="mt-2 rounded-lg bg-slate-900 p-2">
                        <Text className="mb-1 text-xs font-semibold text-slate-400">Trimester Breakdown</Text>
                        <View className="gap-1">
                          <View className="flex-row justify-between">
                            <Text className="text-xs text-slate-400">1st Trimester:</Text>
                            <Text className="text-xs font-semibold text-white">
                              {selectedBarangay.maternalHealth.trimesterBreakdown.firstTrimester}
                            </Text>
                          </View>
                          <View className="flex-row justify-between">
                            <Text className="text-xs text-slate-400">2nd Trimester:</Text>
                            <Text className="text-xs font-semibold text-white">
                              {selectedBarangay.maternalHealth.trimesterBreakdown.secondTrimester}
                            </Text>
                          </View>
                          <View className="flex-row justify-between">
                            <Text className="text-xs text-slate-400">3rd Trimester:</Text>
                            <Text className="text-xs font-semibold text-white">
                              {selectedBarangay.maternalHealth.trimesterBreakdown.thirdTrimester}
                            </Text>
                          </View>
                        </View>
                      </View>

                      <View className="flex-row justify-between">
                        <Text className="text-slate-300">Prenatal Checkups:</Text>
                        <Text className="font-semibold text-pink-400">
                          {selectedBarangay.maternalHealth.completedCheckups} / {selectedBarangay.maternalHealth.scheduledCheckups}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Senior Citizen Care */}
                  <View className="rounded-lg bg-slate-800 p-4">
                    <View className="mb-3 flex-row items-center gap-2">
                      <Stethoscope size={18} color="#a855f7" />
                      <Text className="font-semibold text-white">Senior Citizen Care</Text>
                    </View>
                    <View className="gap-2">
                      <View className="flex-row justify-between">
                        <Text className="text-slate-300">Total Senior Citizens:</Text>
                        <Text className="font-semibold text-white">
                          {selectedBarangay.seniorCitizen.total}
                        </Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text className="text-slate-300">Receiving Assistance:</Text>
                        <Text className="font-semibold text-purple-400">
                          {selectedBarangay.seniorCitizen.receivingAssistance}
                        </Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text className="text-slate-300">Coverage Rate:</Text>
                        <Text className="font-semibold text-purple-400">
                          {selectedBarangay.seniorCitizen.coverageRate}%
                        </Text>
                      </View>
                      
                      {/* Assistance Types */}
                      <View className="mt-2 rounded-lg bg-slate-900 p-2">
                        <Text className="mb-1 text-xs font-semibold text-slate-400">Assistance Provided</Text>
                        <View className="gap-1">
                          <View className="flex-row justify-between">
                            <Text className="text-xs text-slate-400">💊 Medicines:</Text>
                            <Text className="text-xs font-semibold text-white">
                              {selectedBarangay.seniorCitizen.assistanceTypes.medicines}
                            </Text>
                          </View>
                          <View className="flex-row justify-between">
                            <Text className="text-xs text-slate-400">🩺 Consultations:</Text>
                            <Text className="text-xs font-semibold text-white">
                              {selectedBarangay.seniorCitizen.assistanceTypes.consultations}
                            </Text>
                          </View>
                          <View className="flex-row justify-between">
                            <Text className="text-xs text-slate-400">💰 Financial Aid:</Text>
                            <Text className="text-xs font-semibold text-white">
                              {selectedBarangay.seniorCitizen.assistanceTypes.financialAid}
                            </Text>
                          </View>
                          <View className="flex-row justify-between">
                            <Text className="text-xs text-slate-400">🏠 Home Visits:</Text>
                            <Text className="text-xs font-semibold text-white">
                              {selectedBarangay.seniorCitizen.assistanceTypes.homeVisits}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* Priority Indicator */}
                  {(selectedBarangay.childrenHealth.vaccinationCoverage < 85 ||
                    selectedBarangay.maternalHealth.enrollmentRate < 85 ||
                    selectedBarangay.seniorCitizen.coverageRate < 70) && (
                    <View className="rounded-lg bg-orange-900/30 border border-orange-500/50 p-3">
                      <Text className="text-sm font-semibold text-orange-400">⚠️ Priority Area</Text>
                      <Text className="mt-1 text-xs text-orange-300">
                        This barangay requires increased health intervention focus
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
