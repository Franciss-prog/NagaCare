// ============================================================================
// PREGNANCY PROFILE DETAIL SCREEN
// Shows a read-only (or editable) view of a single pregnancy profile
// Staff can toggle edit mode; residents see read-only by default
// ============================================================================

import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import {
  ArrowLeft,
  Edit3,
  Heart,
  Stethoscope,
  Baby,
  ClipboardList,
  Activity,
  FlaskConical,
  Shield,
  Calendar,
  User,
} from 'lucide-react-native';

import { SectionAccordion } from '../components/pregnancy';
import { usePregnancyProfile } from '../hooks/usePregnancyProfile';
import { authService } from '../services/authService';

import {
  DELIVERY_TYPE_OPTIONS,
  GENERAL_SURVEY_LABELS,
  RISK_LEVEL_OPTIONS,
} from '../types/pregnancyProfile';
import type { PregnancyProfileWithResident, GeneralSurveySection } from '../types/pregnancyProfile';

// ============================================================================
// ROUTE PARAMS
// ============================================================================

type DetailRouteParams = {
  ProfileDetail: { profileId: string };
};

// ============================================================================
// HELPER: Field display row
// ============================================================================

const InfoRow = ({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string | number | null | undefined;
  highlight?: boolean;
}) => (
  <View className="flex-row justify-between border-b border-slate-800/30 py-2">
    <Text className="flex-1 text-sm text-slate-400">{label}</Text>
    <Text
      className={`flex-1 text-right text-sm font-medium ${
        highlight ? 'text-cyan-400' : 'text-white'
      }`}>
      {value != null && value !== '' ? String(value) : '—'}
    </Text>
  </View>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function PregnancyProfileDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<DetailRouteParams, 'ProfileDetail'>>();
  const { profileId } = route.params;

  const { profile, loading, error } = usePregnancyProfile(profileId);
  const currentUser = authService.getCurrentUser();
  const isStaff = currentUser?.user_role === 'staff';

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#0b1220]">
        <ActivityIndicator size="large" color="#06b6d4" />
        <Text className="mt-4 text-slate-400">Loading profile...</Text>
      </View>
    );
  }

  if (error || !profile) {
    return (
      <View className="flex-1 items-center justify-center bg-[#0b1220] px-6">
        <Text className="mb-2 text-lg font-semibold text-red-400">Error</Text>
        <Text className="text-center text-slate-400">{error || 'Profile not found'}</Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="mt-4 rounded-xl bg-slate-700 px-6 py-3">
          <Text className="font-medium text-white">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const deliveryLabel =
    DELIVERY_TYPE_OPTIONS.find((o) => o.value === profile.type_of_delivery)?.label || '—';

  const handleEdit = () => {
    navigation.navigate('PregnancyProfileForm', {
      profileId: profile.id,
      mode: 'edit',
    });
  };

  return (
    <View className="flex-1 bg-[#0b1220]">
      {/* HEADER */}
      <View className="border-b border-slate-800 bg-slate-900/50 px-4 pb-4 pt-12">
        <View className="mb-2 flex-row items-center justify-between">
          <TouchableOpacity onPress={() => navigation.goBack()} className="-ml-2 p-2">
            <ArrowLeft size={24} {...{ color: 'white' }} />
          </TouchableOpacity>
          {isStaff && (
            <TouchableOpacity
              onPress={handleEdit}
              className="flex-row items-center rounded-xl bg-cyan-600/20 px-4 py-2">
              <Edit3 size={16} {...{ color: '#06b6d4' }} />
              <Text className="ml-2 text-sm font-medium text-cyan-400">Edit</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Resident Info Banner */}
        <View className="mt-2 flex-row items-center">
          <View className="mr-3 h-14 w-14 items-center justify-center rounded-full bg-pink-600/20">
            <User size={28} {...{ color: '#ec4899' }} />
          </View>
          <View className="flex-1">
            <Text className="text-xl font-bold text-white">
              {profile.resident?.full_name || 'Unknown'}
            </Text>
            <Text className="text-sm text-slate-400">
              {profile.resident?.barangay}
              {profile.resident?.purok ? `, Purok ${profile.resident.purok}` : ''}
            </Text>
            <View className="mt-1 flex-row items-center">
              <View className="flex-row items-center">
                <Calendar size={12} {...{ color: '#94a3b8' }} />
                <Text className="ml-1 text-xs text-slate-400">Visit: {profile.visit_date}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* BODY */}
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}>
        {/* Section 1: Pregnancy History */}
        <SectionAccordion
          title="Pregnancy History"
          icon={<Heart size={20} {...{ color: '#ec4899' }} />}
          defaultOpen>
          <View className="mt-2">
            <InfoRow label="Gravida" value={profile.gravida} />
            <InfoRow label="Para" value={profile.para} />
            <InfoRow label="Term" value={profile.term} />
            <InfoRow label="Pre-term" value={profile.pre_term} />
            <InfoRow label="Abortion" value={profile.abortion} />
            <InfoRow label="Living" value={profile.living} />
            <InfoRow label="Delivery Type" value={deliveryLabel} />
            <InfoRow label="Visit Date" value={profile.visit_date} />
          </View>
        </SectionAccordion>

        {/* Section 2: Physical Examination */}
        <SectionAccordion
          title="Physical Examination"
          icon={<Stethoscope size={20} {...{ color: '#06b6d4' }} />}>
          <View className="mt-2">
            <InfoRow label="Blood Pressure" value={profile.blood_pressure} />
            <InfoRow
              label="Heart Rate"
              value={profile.heart_rate ? `${profile.heart_rate} bpm` : null}
            />
            <InfoRow
              label="Respiratory Rate"
              value={profile.respiratory_rate ? `${profile.respiratory_rate}/min` : null}
            />
            <InfoRow label="Height" value={profile.height ? `${profile.height} cm` : null} />
            <InfoRow label="Weight" value={profile.weight ? `${profile.weight} kg` : null} />
            <InfoRow label="BMI" value={profile.bmi} highlight />
            <InfoRow
              label="Temperature"
              value={profile.temperature ? `${profile.temperature} °C` : null}
            />
            <InfoRow label="Visual Acuity (L)" value={profile.visual_acuity_left} />
            <InfoRow label="Visual Acuity (R)" value={profile.visual_acuity_right} />
          </View>
        </SectionAccordion>

        {/* Section 3: Pediatric 0-24 */}
        <SectionAccordion
          title="Pediatric (0–24 months)"
          icon={<Baby size={20} {...{ color: '#a78bfa' }} />}>
          <View className="mt-2">
            <InfoRow label="Length" value={profile.length ? `${profile.length} cm` : null} />
            <InfoRow
              label="Waist Circ."
              value={profile.waist_circumference ? `${profile.waist_circumference} cm` : null}
            />
            <InfoRow
              label="MUAC"
              value={
                profile.middle_upper_arm_circumference
                  ? `${profile.middle_upper_arm_circumference} cm`
                  : null
              }
            />
            <InfoRow
              label="Head Circ."
              value={profile.head_circumference ? `${profile.head_circumference} cm` : null}
            />
            <InfoRow label="Hip" value={profile.hip ? `${profile.hip} cm` : null} />
            <InfoRow
              label="Skinfold"
              value={profile.skinfold_thickness ? `${profile.skinfold_thickness} mm` : null}
            />
            <InfoRow label="Limbs" value={profile.limbs} />
          </View>
        </SectionAccordion>

        {/* Section 4: Pediatric 0-60 */}
        <SectionAccordion
          title="Pediatric (0–60 months)"
          icon={<Baby size={20} {...{ color: '#f59e0b' }} />}>
          <View className="mt-2">
            <InfoRow label="Blood Type" value={profile.blood_type} />
            <InfoRow
              label="Z-Score"
              value={profile.z_score_cm ? `${profile.z_score_cm} cm` : null}
            />
          </View>
        </SectionAccordion>

        {/* Section 5: General Survey */}
        <SectionAccordion
          title="General Survey"
          icon={<ClipboardList size={20} {...{ color: '#22c55e' }} />}>
          <View className="mt-2">
            {(Object.keys(GENERAL_SURVEY_LABELS) as GeneralSurveySection[]).map((section) => {
              const data = profile.general_survey?.[section];
              if (!data || (data.selected.length === 0 && !data.others)) return null;
              return (
                <View key={section} className="mb-3">
                  <Text className="mb-1 text-xs font-semibold text-cyan-400">
                    {GENERAL_SURVEY_LABELS[section]}
                  </Text>
                  {data.selected.length > 0 && (
                    <View className="flex-row flex-wrap">
                      {data.selected.map((finding) => (
                        <View
                          key={finding}
                          className="mb-1 mr-1 rounded-lg bg-slate-800/50 px-2 py-1">
                          <Text className="text-xs text-slate-300">{finding}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                  {data.others ? (
                    <Text className="mt-1 text-xs text-slate-400">Others: {data.others}</Text>
                  ) : null}
                </View>
              );
            })}
          </View>
        </SectionAccordion>

        {/* Section 6: NCD Assessment */}
        <SectionAccordion
          title="NCD High Risk Assessment"
          icon={<Activity size={20} {...{ color: '#ef4444' }} />}>
          <View className="mt-2">
            <InfoRow
              label="Eats processed / fast foods"
              value={profile.eats_processed_fast_foods}
            />
            <InfoRow
              label="3 servings vegetables daily"
              value={profile.vegetables_3_servings_daily}
            />
            <InfoRow label="2–3 servings fruits daily" value={profile.fruits_2_3_servings_daily} />
            <InfoRow
              label="Moderate activity ≥ 2.5 hrs/week"
              value={profile.moderate_activity_2_5hrs_weekly}
            />
            <InfoRow label="Diagnosed diabetes" value={profile.diagnosed_diabetes} />
            {profile.diagnosed_diabetes === 'yes' && (
              <InfoRow
                label="Diabetes management"
                value={profile.diabetes_management?.replace(/_/g, ' ')}
              />
            )}
            {profile.diabetes_symptoms && profile.diabetes_symptoms.length > 0 && (
              <InfoRow label="Symptoms" value={profile.diabetes_symptoms.join(', ')} />
            )}
            <InfoRow label="Angina / heart attack" value={profile.angina_or_heart_attack} />
            <InfoRow label="Chest pain / pressure" value={profile.chest_pain_pressure} />
            <InfoRow label="Chest / left arm pain" value={profile.chest_left_arm_pain} />
            <InfoRow
              label="Chest pain walking uphill"
              value={profile.chest_pain_with_walking_uphill_hurry}
            />
            <InfoRow
              label="Chest pain slows walking"
              value={profile.chest_pain_slows_down_walking}
            />
            <InfoRow
              label="Pain relieved by rest"
              value={profile.chest_pain_relieved_by_rest_or_tablet}
            />
            <InfoRow label="Pain gone under 10 mins" value={profile.chest_pain_gone_under_10mins} />
            <InfoRow
              label="Severe pain ≥ 30 mins"
              value={profile.chest_pain_severe_30mins_or_more}
            />
            <InfoRow label="Stroke or TIA" value={profile.stroke_or_tia} />
            <InfoRow
              label="Difficulty talking / weakness"
              value={profile.difficulty_talking_or_one_side_weakness}
            />
            <InfoRow
              label="Risk Level"
              value={
                RISK_LEVEL_OPTIONS.find((r) => r.value === profile.risk_level)?.label ||
                profile.risk_level
              }
              highlight
            />
          </View>
        </SectionAccordion>

        {/* Section 7: Lab Results */}
        <SectionAccordion
          title="Lab Results"
          icon={<FlaskConical size={20} {...{ color: '#8b5cf6' }} />}>
          <View className="mt-2">
            <Text className="mb-1 text-xs font-semibold text-purple-400">Raised Blood Glucose</Text>
            <InfoRow label="Present" value={profile.raised_blood_glucose} />
            <InfoRow label="Date" value={profile.raised_blood_glucose_date} />
            <InfoRow label="Result" value={profile.raised_blood_glucose_result} />

            <Text className="mb-1 mt-2 text-xs font-semibold text-purple-400">
              Raised Blood Lipids
            </Text>
            <InfoRow label="Present" value={profile.raised_blood_lipids} />
            <InfoRow label="Date" value={profile.raised_blood_lipids_date} />
            <InfoRow label="Result" value={profile.raised_blood_lipids_result} />

            <Text className="mb-1 mt-2 text-xs font-semibold text-purple-400">Urine Ketones</Text>
            <InfoRow label="Positive" value={profile.urine_ketones_positive} />
            <InfoRow label="Date" value={profile.urine_ketones_date} />
            <InfoRow label="Result" value={profile.urine_ketones_result} />

            <Text className="mb-1 mt-2 text-xs font-semibold text-purple-400">Urine Protein</Text>
            <InfoRow label="Positive" value={profile.urine_protein_positive} />
            <InfoRow label="Date" value={profile.urine_protein_date} />
            <InfoRow label="Result" value={profile.urine_protein_result} />
          </View>
        </SectionAccordion>

        {/* Notes */}
        {profile.notes && (
          <SectionAccordion title="Notes">
            <Text className="mt-2 text-sm text-slate-300">{profile.notes}</Text>
          </SectionAccordion>
        )}

        {/* Metadata Footer */}
        <View className="mt-4 rounded-xl bg-slate-900/30 p-3">
          <View className="mb-1 flex-row items-center">
            <Shield size={12} {...{ color: '#64748b' }} />
            <Text className="ml-1 text-xs text-slate-500">
              Created: {new Date(profile.created_at).toLocaleDateString()}
            </Text>
          </View>
          <View className="flex-row items-center">
            <Shield size={12} {...{ color: '#64748b' }} />
            <Text className="ml-1 text-xs text-slate-500">
              Updated: {new Date(profile.updated_at).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
