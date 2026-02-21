// ============================================================================
// PREGNANCY PROFILE FORM SCREEN
// Multi-section accordion form for creating/editing pregnancy profiles
// Aligned with actual DB table: pregnancy_profiling_records
// ============================================================================

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import {
  ArrowLeft,
  Check,
  Save,
  Heart,
  Stethoscope,
  Baby,
  ClipboardList,
  Activity,
  FlaskConical,
  X,
} from 'lucide-react-native';

import {
  FormInput,
  FormSelect,
  NumberInputGroup,
  CheckboxGroupWithOthers,
  YesNoSelect,
  SectionAccordion,
  BMIDisplay,
} from '../components/pregnancy';

import { usePregnancyProfile, usePregnancyFormState } from '../hooks/usePregnancyProfile';
import { authService } from '../services/authService';

import type {
  GeneralSurveySection,
  YesNo,
  RiskLevel,
  DiabetesStatus,
} from '../types/pregnancyProfile';
import {
  DELIVERY_TYPE_OPTIONS,
  GENERAL_SURVEY_OPTIONS,
  GENERAL_SURVEY_LABELS,
  NCD_SYMPTOMS,
  RISK_LEVEL_OPTIONS,
} from '../types/pregnancyProfile';

// ============================================================================
// ROUTE PARAMS
// ============================================================================

type ProfileFormParams = {
  ProfileForm: {
    profileId?: string;
    residentId?: string;
    mode?: 'create' | 'edit';
  };
};

// ============================================================================
// BLOOD TYPE OPTIONS
// ============================================================================

const BLOOD_TYPE_OPTIONS = [
  { value: 'A+', label: 'A+' },
  { value: 'A-', label: 'A-' },
  { value: 'B+', label: 'B+' },
  { value: 'B-', label: 'B-' },
  { value: 'AB+', label: 'AB+' },
  { value: 'AB-', label: 'AB-' },
  { value: 'O+', label: 'O+' },
  { value: 'O-', label: 'O-' },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function PregnancyProfileFormScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<ProfileFormParams, 'ProfileForm'>>();
  const { profileId, residentId, mode = 'create' } = route.params || {};

  const { profile, loading, saving, error, loadProfile, saveProfile, updateProfile } =
    usePregnancyProfile(profileId);

  const {
    formData,
    errors,
    activePicker,
    setActivePicker,
    updateField,
    updateNestedField,
    resetForm,
    populateFromProfile,
    validate,
  } = usePregnancyFormState(residentId ? { resident_id: residentId } : undefined);

  // Populate form when editing existing profile
  useEffect(() => {
    if (profile && mode === 'edit') {
      populateFromProfile(profile);
    }
  }, [profile, mode, populateFromProfile]);

  // If no residentId provided and creating, use logged-in user's resident
  useEffect(() => {
    if (mode === 'create' && !residentId) {
      const resident = authService.getCurrentResident();
      if (resident) {
        updateField('resident_id', resident.id);
      }
    }
  }, [mode, residentId, updateField]);

  // ========================================================================
  // SUBMIT
  // ========================================================================
  const handleSubmit = async () => {
    if (!validate()) {
      Alert.alert('Validation Error', 'Please fix the highlighted fields.');
      return;
    }

    let success: boolean;
    if (mode === 'edit' && profileId) {
      success = await updateProfile(profileId, formData);
    } else {
      success = await saveProfile(formData);
    }

    if (success) {
      Alert.alert(
        mode === 'edit' ? 'Profile Updated' : 'Profile Created',
        'The pregnancy profile has been saved successfully.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } else {
      Alert.alert('Error', error || 'Failed to save profile. Please try again.');
    }
  };

  // ========================================================================
  // GENERAL SURVEY TOGGLE
  // ========================================================================
  const toggleSurveyOption = (section: GeneralSurveySection, option: string) => {
    const current = formData.general_survey[section];
    const isSelected = current.selected.includes(option);
    const nextSelected = isSelected
      ? current.selected.filter((o) => o !== option)
      : [...current.selected, option];

    updateNestedField('general_survey', section, {
      ...current,
      selected: nextSelected,
    });
  };

  const updateSurveyOthers = (section: GeneralSurveySection, text: string) => {
    const current = formData.general_survey[section];
    updateNestedField('general_survey', section, { ...current, others: text });
  };

  // ========================================================================
  // NCD HELPERS
  // ========================================================================
  const toggleDiabetesSymptom = (symptom: string) => {
    const current = formData.diabetes_symptoms ?? [];
    const next = current.includes(symptom)
      ? current.filter((s: string) => s !== symptom)
      : [...current, symptom];
    updateField('diabetes_symptoms', next);
  };

  // ========================================================================
  // LOADING STATE
  // ========================================================================
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#0b1220]">
        <ActivityIndicator size="large" color="#06b6d4" />
        <Text className="mt-4 text-slate-400">Loading profile...</Text>
      </View>
    );
  }

  // ========================================================================
  // RENDER
  // ========================================================================
  return (
    <View className="flex-1 bg-[#0b1220]">
      {/* HEADER */}
      <View className="border-b border-slate-800 bg-slate-900/50 px-4 pb-4 pt-12">
        <View className="mb-2 flex-row items-center justify-between">
          <TouchableOpacity onPress={() => navigation.goBack()} className="-ml-2 p-2">
            <ArrowLeft size={24} {...{ color: 'white' }} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.goBack()} className="-mr-2 p-2">
            <X size={24} {...{ color: '#64748b' }} />
          </TouchableOpacity>
        </View>
        <View className="flex-row items-center">
          <View className="mr-3 h-12 w-12 items-center justify-center rounded-full bg-pink-600/20">
            <Heart size={24} {...{ color: '#ec4899' }} />
          </View>
          <View>
            <Text className="text-xl font-bold text-white">
              {mode === 'edit' ? 'Edit' : 'New'} Pregnancy Profile
            </Text>
            <Text className="text-sm text-slate-400">Complete all applicable sections</Text>
          </View>
        </View>
      </View>

      {/* FORM BODY */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1">
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {/* ================================================================
              SECTION 1: PREGNANCY HISTORY
              ================================================================ */}
          <SectionAccordion
            title="Pregnancy History"
            subtitle="Gravida, Para, Term, etc."
            icon={<Heart size={20} {...{ color: '#ec4899' }} />}
            defaultOpen>
            <View className="mt-3">
              <NumberInputGroup
                fields={[
                  {
                    label: 'Gravida',
                    value: formData.gravida,
                    onChange: (v: number) => updateField('gravida', v),
                  },
                  {
                    label: 'Para',
                    value: formData.para,
                    onChange: (v: number) => updateField('para', v),
                  },
                  {
                    label: 'Term',
                    value: formData.term,
                    onChange: (v: number) => updateField('term', v),
                  },
                ]}
                columns={3}
              />
              <NumberInputGroup
                fields={[
                  {
                    label: 'Pre-term',
                    value: formData.pre_term,
                    onChange: (v: number) => updateField('pre_term', v),
                  },
                  {
                    label: 'Abortion',
                    value: formData.abortion,
                    onChange: (v: number) => updateField('abortion', v),
                  },
                  {
                    label: 'Living',
                    value: formData.living,
                    onChange: (v: number) => updateField('living', v),
                  },
                ]}
                columns={3}
              />
              <FormSelect
                label="Type of Delivery"
                value={formData.type_of_delivery || ''}
                options={DELIVERY_TYPE_OPTIONS}
                isOpen={activePicker === 'type_of_delivery'}
                onToggle={() =>
                  setActivePicker(activePicker === 'type_of_delivery' ? null : 'type_of_delivery')
                }
                onSelect={(v: string) => {
                  updateField('type_of_delivery', v);
                  setActivePicker(null);
                }}
              />

              {/* Visit Date */}
              <FormInput
                label="Visit Date (YYYY-MM-DD)"
                value={formData.visit_date || ''}
                onChangeText={(v: string) =>
                  updateField('visit_date', v || new Date().toISOString().split('T')[0])
                }
                autoCapitalize="none"
                placeholder="2026-01-15"
              />
            </View>
          </SectionAccordion>

          {/* ================================================================
              SECTION 2: PHYSICAL EXAMINATION
              ================================================================ */}
          <SectionAccordion
            title="Physical Examination"
            subtitle="Vitals, height, weight, BMI"
            icon={<Stethoscope size={20} {...{ color: '#06b6d4' }} />}>
            <View className="mt-3">
              <FormInput
                label="Blood Pressure"
                value={formData.blood_pressure || ''}
                onChangeText={(v: string) => updateField('blood_pressure', v || null)}
                placeholder="120/80"
                hasError={!!errors.blood_pressure}
                errorMessage={errors.blood_pressure}
              />

              <View className="flex-row gap-2">
                <View className="flex-1">
                  <FormInput
                    label="Heart Rate (bpm)"
                    value={formData.heart_rate?.toString() || ''}
                    onChangeText={(v: string) =>
                      updateField('heart_rate', v ? parseInt(v, 10) : null)
                    }
                    keyboardType="numeric"
                  />
                </View>
                <View className="flex-1">
                  <FormInput
                    label="Resp. Rate (/min)"
                    value={formData.respiratory_rate?.toString() || ''}
                    onChangeText={(v: string) =>
                      updateField('respiratory_rate', v ? parseInt(v, 10) : null)
                    }
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View className="flex-row gap-2">
                <View className="flex-1">
                  <FormInput
                    label="Height (cm)"
                    value={formData.height?.toString() || ''}
                    onChangeText={(v: string) => updateField('height', v ? parseFloat(v) : null)}
                    keyboardType="numeric"
                  />
                </View>
                <View className="flex-1">
                  <FormInput
                    label="Weight (kg)"
                    value={formData.weight?.toString() || ''}
                    onChangeText={(v: string) => updateField('weight', v ? parseFloat(v) : null)}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              {/* BMI: auto-calculated */}
              <BMIDisplay heightCm={formData.height} weightKg={formData.weight} />

              <FormInput
                label="Temperature (°C)"
                value={formData.temperature?.toString() || ''}
                onChangeText={(v: string) => updateField('temperature', v ? parseFloat(v) : null)}
                keyboardType="numeric"
              />

              <View className="flex-row gap-2">
                <View className="flex-1">
                  <FormInput
                    label="Visual Acuity (Left)"
                    value={formData.visual_acuity_left || ''}
                    onChangeText={(v: string) => updateField('visual_acuity_left', v || null)}
                    placeholder="20/20"
                  />
                </View>
                <View className="flex-1">
                  <FormInput
                    label="Visual Acuity (Right)"
                    value={formData.visual_acuity_right || ''}
                    onChangeText={(v: string) => updateField('visual_acuity_right', v || null)}
                    placeholder="20/20"
                  />
                </View>
              </View>
            </View>
          </SectionAccordion>

          {/* ================================================================
              SECTION 3: PEDIATRIC 0-24 MONTHS
              ================================================================ */}
          <SectionAccordion
            title="Pediatric Client (0–24 months)"
            subtitle="Only if applicable"
            icon={<Baby size={20} {...{ color: '#a78bfa' }} />}>
            <View className="mt-3">
              <View className="flex-row gap-2">
                <View className="flex-1">
                  <FormInput
                    label="Length (cm)"
                    value={formData.length?.toString() || ''}
                    onChangeText={(v: string) => updateField('length', v ? parseFloat(v) : null)}
                    keyboardType="numeric"
                  />
                </View>
                <View className="flex-1">
                  <FormInput
                    label="Waist Circ. (cm)"
                    value={formData.waist_circumference?.toString() || ''}
                    onChangeText={(v: string) =>
                      updateField('waist_circumference', v ? parseFloat(v) : null)
                    }
                    keyboardType="numeric"
                  />
                </View>
              </View>
              <View className="flex-row gap-2">
                <View className="flex-1">
                  <FormInput
                    label="MUAC (cm)"
                    value={formData.middle_upper_arm_circumference?.toString() || ''}
                    onChangeText={(v: string) =>
                      updateField('middle_upper_arm_circumference', v ? parseFloat(v) : null)
                    }
                    keyboardType="numeric"
                  />
                </View>
                <View className="flex-1">
                  <FormInput
                    label="Head Circ. (cm)"
                    value={formData.head_circumference?.toString() || ''}
                    onChangeText={(v: string) =>
                      updateField('head_circumference', v ? parseFloat(v) : null)
                    }
                    keyboardType="numeric"
                  />
                </View>
              </View>
              <View className="flex-row gap-2">
                <View className="flex-1">
                  <FormInput
                    label="Hip (cm)"
                    value={formData.hip?.toString() || ''}
                    onChangeText={(v: string) => updateField('hip', v ? parseFloat(v) : null)}
                    keyboardType="numeric"
                  />
                </View>
                <View className="flex-1">
                  <FormInput
                    label="Skinfold (mm)"
                    value={formData.skinfold_thickness?.toString() || ''}
                    onChangeText={(v: string) =>
                      updateField('skinfold_thickness', v ? parseFloat(v) : null)
                    }
                    keyboardType="numeric"
                  />
                </View>
              </View>
              <FormInput
                label="Limbs Description"
                value={formData.limbs || ''}
                onChangeText={(v: string) => updateField('limbs', v || null)}
                placeholder="Describe limb condition..."
                multiline
              />
            </View>
          </SectionAccordion>

          {/* ================================================================
              SECTION 4: PEDIATRIC 0-60 MONTHS
              ================================================================ */}
          <SectionAccordion
            title="Pediatric Client (0–60 months)"
            subtitle="Blood type and Z-Score"
            icon={<Baby size={20} {...{ color: '#f59e0b' }} />}>
            <View className="mt-3">
              <FormSelect
                label="Blood Type"
                value={formData.blood_type || ''}
                options={BLOOD_TYPE_OPTIONS}
                isOpen={activePicker === 'blood_type'}
                onToggle={() =>
                  setActivePicker(activePicker === 'blood_type' ? null : 'blood_type')
                }
                onSelect={(v: string) => {
                  updateField('blood_type', v as any);
                  setActivePicker(null);
                }}
              />
              <FormInput
                label="Z-Score (cm)"
                value={formData.z_score_cm?.toString() || ''}
                onChangeText={(v: string) => updateField('z_score_cm', v ? parseFloat(v) : null)}
                keyboardType="numeric"
              />
            </View>
          </SectionAccordion>

          {/* ================================================================
              SECTION 5: GENERAL SURVEY
              ================================================================ */}
          <SectionAccordion
            title="General Survey"
            subtitle="Physical examination findings"
            icon={<ClipboardList size={20} {...{ color: '#22c55e' }} />}
            badge={
              Object.values(formData.general_survey).some((s) => s.selected.length > 0)
                ? 'Has data'
                : undefined
            }>
            <View className="mt-3">
              {(Object.keys(GENERAL_SURVEY_OPTIONS) as GeneralSurveySection[]).map((section) => (
                <CheckboxGroupWithOthers
                  key={section}
                  label={GENERAL_SURVEY_LABELS[section]}
                  options={GENERAL_SURVEY_OPTIONS[section]}
                  selected={formData.general_survey[section]?.selected || []}
                  others={formData.general_survey[section]?.others || ''}
                  onToggle={(opt: string) => toggleSurveyOption(section, opt)}
                  onOthersChange={(text: string) => updateSurveyOthers(section, text)}
                />
              ))}
            </View>
          </SectionAccordion>

          {/* ================================================================
              SECTION 6: NCD HIGH RISK ASSESSMENT
              ================================================================ */}
          <SectionAccordion
            title="NCD High Risk Assessment"
            subtitle="Ages 25 and above"
            icon={<Activity size={20} {...{ color: '#ef4444' }} />}>
            <View className="mt-3">
              <YesNoSelect
                label="Eats processed / fast foods?"
                value={
                  formData.eats_processed_fast_foods === 'yes'
                    ? true
                    : formData.eats_processed_fast_foods === 'no'
                      ? false
                      : null
                }
                onChange={(v: boolean) =>
                  updateField('eats_processed_fast_foods', v ? 'yes' : 'no')
                }
              />
              <YesNoSelect
                label="3 servings of vegetables daily?"
                value={
                  formData.vegetables_3_servings_daily === 'yes'
                    ? true
                    : formData.vegetables_3_servings_daily === 'no'
                      ? false
                      : null
                }
                onChange={(v: boolean) =>
                  updateField('vegetables_3_servings_daily', v ? 'yes' : 'no')
                }
              />
              <YesNoSelect
                label="2–3 servings of fruits daily?"
                value={
                  formData.fruits_2_3_servings_daily === 'yes'
                    ? true
                    : formData.fruits_2_3_servings_daily === 'no'
                      ? false
                      : null
                }
                onChange={(v: boolean) =>
                  updateField('fruits_2_3_servings_daily', v ? 'yes' : 'no')
                }
              />
              <YesNoSelect
                label="Moderate activity ≥ 2.5 hrs/week?"
                value={
                  formData.moderate_activity_2_5hrs_weekly === 'yes'
                    ? true
                    : formData.moderate_activity_2_5hrs_weekly === 'no'
                      ? false
                      : null
                }
                onChange={(v: boolean) =>
                  updateField('moderate_activity_2_5hrs_weekly', v ? 'yes' : 'no')
                }
              />

              {/* Diabetes */}
              <Text className="mb-2 mt-2 text-sm font-semibold text-cyan-400">
                Diagnosed with Diabetes?
              </Text>
              <View className="mb-4 flex-row gap-2">
                {(['yes', 'no', 'do_not_know'] as const).map((opt) => (
                  <TouchableOpacity
                    key={opt}
                    onPress={() => updateField('diagnosed_diabetes', opt as DiabetesStatus)}
                    className={`flex-1 items-center rounded-xl border py-2.5 ${
                      formData.diagnosed_diabetes === opt
                        ? 'border-cyan-500 bg-cyan-600/20'
                        : 'border-slate-700 bg-slate-800/50'
                    }`}>
                    <Text
                      className={`text-xs font-medium ${
                        formData.diagnosed_diabetes === opt ? 'text-cyan-400' : 'text-slate-400'
                      }`}>
                      {opt === 'do_not_know' ? "Don't Know" : opt === 'yes' ? 'Yes' : 'No'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {formData.diagnosed_diabetes === 'yes' && (
                <FormSelect
                  label="Diabetes Management"
                  value={formData.diabetes_management || ''}
                  options={[
                    { value: 'with_medication', label: 'With Medication' },
                    { value: 'without_medication', label: 'Without Medication' },
                  ]}
                  isOpen={activePicker === 'diabetes_management'}
                  onToggle={() =>
                    setActivePicker(
                      activePicker === 'diabetes_management' ? null : 'diabetes_management'
                    )
                  }
                  onSelect={(v: string) => {
                    updateField('diabetes_management', v as any);
                    setActivePicker(null);
                  }}
                />
              )}

              {/* Symptoms */}
              <Text className="mb-2 mt-2 text-sm font-semibold text-cyan-400">
                Diabetes Symptoms
              </Text>
              <View className="mb-4 flex-row flex-wrap">
                {NCD_SYMPTOMS.map((symptom) => {
                  const isSelected = (formData.diabetes_symptoms ?? []).includes(symptom);
                  return (
                    <TouchableOpacity
                      key={symptom}
                      onPress={() => toggleDiabetesSymptom(symptom)}
                      className={`mb-2 mr-2 flex-row items-center rounded-lg border px-3 py-2 ${
                        isSelected
                          ? 'border-cyan-500 bg-cyan-600/20'
                          : 'border-slate-700 bg-slate-800/50'
                      }`}>
                      <View
                        className={`mr-2 h-4 w-4 items-center justify-center rounded border ${
                          isSelected ? 'border-cyan-500 bg-cyan-600' : 'border-slate-500'
                        }`}>
                        {isSelected && <Check size={10} {...{ color: 'white' }} />}
                      </View>
                      <Text
                        className={`text-sm ${isSelected ? 'text-cyan-300' : 'text-slate-300'}`}>
                        {symptom}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <YesNoSelect
                label="History of angina or heart attack?"
                value={
                  formData.angina_or_heart_attack === 'yes'
                    ? true
                    : formData.angina_or_heart_attack === 'no'
                      ? false
                      : null
                }
                onChange={(v: boolean) => updateField('angina_or_heart_attack', v ? 'yes' : 'no')}
              />
              <YesNoSelect
                label="Chest pain or pressure?"
                value={
                  formData.chest_pain_pressure === 'yes'
                    ? true
                    : formData.chest_pain_pressure === 'no'
                      ? false
                      : null
                }
                onChange={(v: boolean) => updateField('chest_pain_pressure', v ? 'yes' : 'no')}
              />
              <YesNoSelect
                label="Chest / left arm pain?"
                value={
                  formData.chest_left_arm_pain === 'yes'
                    ? true
                    : formData.chest_left_arm_pain === 'no'
                      ? false
                      : null
                }
                onChange={(v: boolean) => updateField('chest_left_arm_pain', v ? 'yes' : 'no')}
              />
              <YesNoSelect
                label="Chest pain walking uphill / hurry?"
                value={
                  formData.chest_pain_with_walking_uphill_hurry === 'yes'
                    ? true
                    : formData.chest_pain_with_walking_uphill_hurry === 'no'
                      ? false
                      : null
                }
                onChange={(v: boolean) =>
                  updateField('chest_pain_with_walking_uphill_hurry', v ? 'yes' : 'no')
                }
              />
              <YesNoSelect
                label="Chest pain slows down walking?"
                value={
                  formData.chest_pain_slows_down_walking === 'yes'
                    ? true
                    : formData.chest_pain_slows_down_walking === 'no'
                      ? false
                      : null
                }
                onChange={(v: boolean) =>
                  updateField('chest_pain_slows_down_walking', v ? 'yes' : 'no')
                }
              />
              <YesNoSelect
                label="Chest pain relieved by rest / tablet?"
                value={
                  formData.chest_pain_relieved_by_rest_or_tablet === 'yes'
                    ? true
                    : formData.chest_pain_relieved_by_rest_or_tablet === 'no'
                      ? false
                      : null
                }
                onChange={(v: boolean) =>
                  updateField('chest_pain_relieved_by_rest_or_tablet', v ? 'yes' : 'no')
                }
              />
              <YesNoSelect
                label="Chest pain gone under 10 mins?"
                value={
                  formData.chest_pain_gone_under_10mins === 'yes'
                    ? true
                    : formData.chest_pain_gone_under_10mins === 'no'
                      ? false
                      : null
                }
                onChange={(v: boolean) =>
                  updateField('chest_pain_gone_under_10mins', v ? 'yes' : 'no')
                }
              />
              <YesNoSelect
                label="Severe chest pain ≥ 30 mins?"
                value={
                  formData.chest_pain_severe_30mins_or_more === 'yes'
                    ? true
                    : formData.chest_pain_severe_30mins_or_more === 'no'
                      ? false
                      : null
                }
                onChange={(v: boolean) =>
                  updateField('chest_pain_severe_30mins_or_more', v ? 'yes' : 'no')
                }
              />
              <YesNoSelect
                label="History of stroke or TIA?"
                value={
                  formData.stroke_or_tia === 'yes'
                    ? true
                    : formData.stroke_or_tia === 'no'
                      ? false
                      : null
                }
                onChange={(v: boolean) => updateField('stroke_or_tia', v ? 'yes' : 'no')}
              />
              <YesNoSelect
                label="Difficulty talking / one-side weakness?"
                value={
                  formData.difficulty_talking_or_one_side_weakness === 'yes'
                    ? true
                    : formData.difficulty_talking_or_one_side_weakness === 'no'
                      ? false
                      : null
                }
                onChange={(v: boolean) =>
                  updateField('difficulty_talking_or_one_side_weakness', v ? 'yes' : 'no')
                }
              />

              {/* Risk Level */}
              <FormSelect
                label="Calculated Risk Level"
                value={formData.risk_level || ''}
                options={RISK_LEVEL_OPTIONS}
                isOpen={activePicker === 'risk_level'}
                onToggle={() =>
                  setActivePicker(activePicker === 'risk_level' ? null : 'risk_level')
                }
                onSelect={(v: string) => {
                  updateField('risk_level', v as RiskLevel);
                  setActivePicker(null);
                }}
              />
            </View>
          </SectionAccordion>

          {/* ================================================================
              SECTION 7: LAB RESULTS
              ================================================================ */}
          <SectionAccordion
            title="Lab Results"
            subtitle="Blood glucose, lipids, urine tests"
            icon={<FlaskConical size={20} {...{ color: '#8b5cf6' }} />}>
            <View className="mt-3">
              {/* Raised Blood Glucose */}
              <Text className="mb-2 text-sm font-semibold text-purple-400">
                Raised Blood Glucose
              </Text>
              <YesNoSelect
                label="Present?"
                value={
                  formData.raised_blood_glucose === 'yes'
                    ? true
                    : formData.raised_blood_glucose === 'no'
                      ? false
                      : null
                }
                onChange={(v: boolean) => updateField('raised_blood_glucose', v ? 'yes' : 'no')}
              />
              <View className="flex-row gap-2">
                <View className="flex-1">
                  <FormInput
                    label="Date"
                    value={formData.raised_blood_glucose_date || ''}
                    onChangeText={(v: string) =>
                      updateField('raised_blood_glucose_date', v || null)
                    }
                    placeholder="YYYY-MM-DD"
                    autoCapitalize="none"
                  />
                </View>
                <View className="flex-1">
                  <FormInput
                    label="Result"
                    value={formData.raised_blood_glucose_result || ''}
                    onChangeText={(v: string) =>
                      updateField('raised_blood_glucose_result', v || null)
                    }
                    placeholder="Value"
                  />
                </View>
              </View>

              {/* Raised Blood Lipids */}
              <Text className="mb-2 mt-2 text-sm font-semibold text-purple-400">
                Raised Blood Lipids
              </Text>
              <YesNoSelect
                label="Present?"
                value={
                  formData.raised_blood_lipids === 'yes'
                    ? true
                    : formData.raised_blood_lipids === 'no'
                      ? false
                      : null
                }
                onChange={(v: boolean) => updateField('raised_blood_lipids', v ? 'yes' : 'no')}
              />
              <View className="flex-row gap-2">
                <View className="flex-1">
                  <FormInput
                    label="Date"
                    value={formData.raised_blood_lipids_date || ''}
                    onChangeText={(v: string) => updateField('raised_blood_lipids_date', v || null)}
                    placeholder="YYYY-MM-DD"
                    autoCapitalize="none"
                  />
                </View>
                <View className="flex-1">
                  <FormInput
                    label="Result"
                    value={formData.raised_blood_lipids_result || ''}
                    onChangeText={(v: string) =>
                      updateField('raised_blood_lipids_result', v || null)
                    }
                    placeholder="Value"
                  />
                </View>
              </View>

              {/* Urine Ketones */}
              <Text className="mb-2 mt-2 text-sm font-semibold text-purple-400">Urine Ketones</Text>
              <YesNoSelect
                label="Positive?"
                value={
                  formData.urine_ketones_positive === 'yes'
                    ? true
                    : formData.urine_ketones_positive === 'no'
                      ? false
                      : null
                }
                onChange={(v: boolean) => updateField('urine_ketones_positive', v ? 'yes' : 'no')}
              />
              <View className="flex-row gap-2">
                <View className="flex-1">
                  <FormInput
                    label="Date"
                    value={formData.urine_ketones_date || ''}
                    onChangeText={(v: string) => updateField('urine_ketones_date', v || null)}
                    placeholder="YYYY-MM-DD"
                    autoCapitalize="none"
                  />
                </View>
                <View className="flex-1">
                  <FormInput
                    label="Result"
                    value={formData.urine_ketones_result || ''}
                    onChangeText={(v: string) => updateField('urine_ketones_result', v || null)}
                    placeholder="Value"
                  />
                </View>
              </View>

              {/* Urine Protein */}
              <Text className="mb-2 mt-2 text-sm font-semibold text-purple-400">Urine Protein</Text>
              <YesNoSelect
                label="Positive?"
                value={
                  formData.urine_protein_positive === 'yes'
                    ? true
                    : formData.urine_protein_positive === 'no'
                      ? false
                      : null
                }
                onChange={(v: boolean) => updateField('urine_protein_positive', v ? 'yes' : 'no')}
              />
              <View className="flex-row gap-2">
                <View className="flex-1">
                  <FormInput
                    label="Date"
                    value={formData.urine_protein_date || ''}
                    onChangeText={(v: string) => updateField('urine_protein_date', v || null)}
                    placeholder="YYYY-MM-DD"
                    autoCapitalize="none"
                  />
                </View>
                <View className="flex-1">
                  <FormInput
                    label="Result"
                    value={formData.urine_protein_result || ''}
                    onChangeText={(v: string) => updateField('urine_protein_result', v || null)}
                    placeholder="Value"
                  />
                </View>
              </View>
            </View>
          </SectionAccordion>

          {/* ================================================================
              NOTES
              ================================================================ */}
          <SectionAccordion title="Additional Notes" subtitle="Optional remarks">
            <View className="mt-3">
              <FormInput
                label="Notes"
                value={formData.notes || ''}
                onChangeText={(v: string) => updateField('notes', v || null)}
                placeholder="Additional clinical notes..."
                multiline
                numberOfLines={4}
              />
            </View>
          </SectionAccordion>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* BOTTOM ACTION BAR */}
      <View className="absolute bottom-0 left-0 right-0 border-t border-slate-800 bg-slate-900/95 p-4 pb-8">
        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="flex-1 flex-row items-center justify-center rounded-2xl bg-slate-700 py-4">
            <ArrowLeft size={18} {...{ color: 'white' }} />
            <Text className="ml-2 font-semibold text-white">Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={saving}
            className="flex-1 flex-row items-center justify-center rounded-2xl bg-pink-600 py-4"
            style={{ opacity: saving ? 0.7 : 1 }}>
            {saving ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Save size={18} {...{ color: 'white' }} />
                <Text className="ml-2 font-semibold text-white">
                  {mode === 'edit' ? 'Update' : 'Save'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
