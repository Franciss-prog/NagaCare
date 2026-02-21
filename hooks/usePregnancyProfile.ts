// ============================================================================
// USE PREGNANCY PROFILE HOOK
// Manages state, loading, and CRUD for pregnancy profiles
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import { pregnancyProfileService } from '../services/pregnancyProfileService';
import { authService } from '../services/authService';
import type {
  PregnancyProfile,
  PregnancyProfileFormData,
  PregnancyProfileListItem,
  PregnancyProfileWithResident,
} from '../types/pregnancyProfile';
import { DEFAULT_FORM_DATA as defaultFormData } from '../types/pregnancyProfile';

// ============================================================================
// HOOK: usePregnancyProfile – single profile CRUD
// ============================================================================

export function usePregnancyProfile(profileId?: string) {
  const [profile, setProfile] = useState<PregnancyProfileWithResident | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load profile by ID
  const loadProfile = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await pregnancyProfileService.getProfileById(id);
      if (result.success && result.data) {
        setProfile(result.data);
      } else {
        setError(result.error || 'Profile not found');
      }
    } catch {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load own profile (for logged-in resident)
  const loadOwnProfile = useCallback(async () => {
    const resident = authService.getCurrentResident();
    if (!resident) {
      setError('Not logged in');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await pregnancyProfileService.getProfileByResidentId(resident.id);
      if (result.success) {
        if (result.data) {
          // Re-load with resident join
          const full = await pregnancyProfileService.getProfileById(result.data.id);
          if (full.success && full.data) {
            setProfile(full.data);
          }
        } else {
          setProfile(null); // No profile yet
        }
      } else {
        setError(result.error || 'Failed to load profile');
      }
    } catch {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, []);

  // Save (upsert) profile
  const saveProfile = useCallback(
    async (formData: PregnancyProfileFormData): Promise<boolean> => {
      const user = authService.getCurrentUser();
      if (!user) {
        setError('Not logged in');
        return false;
      }

      setSaving(true);
      setError(null);
      try {
        const result = await pregnancyProfileService.upsertProfile(formData, user.id);
        if (result.success && result.data) {
          // Reload the full profile with resident data
          await loadProfile(result.data.id);
          return true;
        } else {
          setError(result.error || 'Failed to save profile');
          return false;
        }
      } catch {
        setError('Failed to save profile');
        return false;
      } finally {
        setSaving(false);
      }
    },
    [loadProfile]
  );

  // Update existing profile
  const updateProfile = useCallback(
    async (id: string, formData: Partial<PregnancyProfileFormData>): Promise<boolean> => {
      setSaving(true);
      setError(null);
      try {
        const result = await pregnancyProfileService.updateProfile(id, formData);
        if (result.success && result.data) {
          await loadProfile(result.data.id);
          return true;
        } else {
          setError(result.error || 'Failed to update profile');
          return false;
        }
      } catch {
        setError('Failed to update profile');
        return false;
      } finally {
        setSaving(false);
      }
    },
    [loadProfile]
  );

  // Auto-load if profileId is provided
  useEffect(() => {
    if (profileId) {
      loadProfile(profileId);
    }
  }, [profileId, loadProfile]);

  return {
    profile,
    loading,
    saving,
    error,
    loadProfile,
    loadOwnProfile,
    saveProfile,
    updateProfile,
    setError,
  };
}

// ============================================================================
// HOOK: usePregnancyProfileSearch – search/list for City Health
// ============================================================================

export function usePregnancyProfileSearch() {
  const [results, setResults] = useState<PregnancyProfileListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const search = useCallback(
    async (query: string, options?: { barangay?: string; status?: string }) => {
      setLoading(true);
      setError(null);
      setSearchQuery(query);
      try {
        const result = await pregnancyProfileService.searchProfiles(query, options);
        if (result.success && result.data) {
          setResults(result.data);
        } else {
          setError(result.error || 'Search failed');
          setResults([]);
        }
      } catch {
        setError('Search failed');
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Load all profiles (initial load)
  const loadAll = useCallback(
    async (options?: { barangay?: string; status?: string }) => {
      return search('', options);
    },
    [search]
  );

  return {
    results,
    loading,
    error,
    searchQuery,
    search,
    loadAll,
    setSearchQuery,
  };
}

// ============================================================================
// HOOK: usePregnancyFormState – local form state management
// ============================================================================

export function usePregnancyFormState(initialData?: Partial<PregnancyProfileFormData>) {
  const [formData, setFormData] = useState<PregnancyProfileFormData>({
    ...defaultFormData,
    ...initialData,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activePicker, setActivePicker] = useState<string | null>(null);

  // Generic field updater
  const updateField = useCallback(
    <K extends keyof PregnancyProfileFormData>(field: K, value: PregnancyProfileFormData[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      // Clear field error on change
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field as string];
        return next;
      });
    },
    []
  );

  // Nested field updater (for general_survey and other nested objects)
  const updateNestedField = useCallback(
    <K extends keyof PregnancyProfileFormData>(
      parentField: K,
      childKey: string,
      value: unknown
    ) => {
      setFormData((prev) => ({
        ...prev,
        [parentField]: {
          ...(prev[parentField] as Record<string, unknown>),
          [childKey]: value,
        },
      }));
    },
    []
  );

  // Reset form
  const resetForm = useCallback((data?: Partial<PregnancyProfileFormData>) => {
    setFormData({ ...defaultFormData, ...data });
    setErrors({});
    setActivePicker(null);
  }, []);

  // Populate from existing profile
  const populateFromProfile = useCallback((profile: PregnancyProfile) => {
    setFormData({
      resident_id: profile.resident_id,
      visit_date: profile.visit_date,
      is_inquirer: profile.is_inquirer,
      inquiry_details: profile.inquiry_details,

      gravida: profile.gravida,
      para: profile.para,
      term: profile.term,
      pre_term: profile.pre_term,
      abortion: profile.abortion,
      living: profile.living,
      type_of_delivery: profile.type_of_delivery,

      blood_pressure: profile.blood_pressure,
      heart_rate: profile.heart_rate,
      respiratory_rate: profile.respiratory_rate,
      height: profile.height,
      weight: profile.weight,
      bmi: profile.bmi,
      temperature: profile.temperature,
      visual_acuity_left: profile.visual_acuity_left,
      visual_acuity_right: profile.visual_acuity_right,

      length: profile.length,
      waist_circumference: profile.waist_circumference,
      middle_upper_arm_circumference: profile.middle_upper_arm_circumference,
      head_circumference: profile.head_circumference,
      hip: profile.hip,
      skinfold_thickness: profile.skinfold_thickness,
      limbs: profile.limbs,

      blood_type: profile.blood_type,
      z_score_cm: profile.z_score_cm,

      general_survey: profile.general_survey,

      eats_processed_fast_foods: profile.eats_processed_fast_foods,
      vegetables_3_servings_daily: profile.vegetables_3_servings_daily,
      fruits_2_3_servings_daily: profile.fruits_2_3_servings_daily,
      moderate_activity_2_5hrs_weekly: profile.moderate_activity_2_5hrs_weekly,
      diagnosed_diabetes: profile.diagnosed_diabetes,
      diabetes_management: profile.diabetes_management,
      diabetes_symptoms: profile.diabetes_symptoms ?? [],
      angina_or_heart_attack: profile.angina_or_heart_attack,
      chest_pain_pressure: profile.chest_pain_pressure,
      chest_left_arm_pain: profile.chest_left_arm_pain,
      chest_pain_with_walking_uphill_hurry: profile.chest_pain_with_walking_uphill_hurry,
      chest_pain_slows_down_walking: profile.chest_pain_slows_down_walking,
      chest_pain_relieved_by_rest_or_tablet: profile.chest_pain_relieved_by_rest_or_tablet,
      chest_pain_gone_under_10mins: profile.chest_pain_gone_under_10mins,
      chest_pain_severe_30mins_or_more: profile.chest_pain_severe_30mins_or_more,
      stroke_or_tia: profile.stroke_or_tia,
      difficulty_talking_or_one_side_weakness: profile.difficulty_talking_or_one_side_weakness,
      risk_level: profile.risk_level,

      raised_blood_glucose: profile.raised_blood_glucose,
      raised_blood_glucose_date: profile.raised_blood_glucose_date,
      raised_blood_glucose_result: profile.raised_blood_glucose_result,
      raised_blood_lipids: profile.raised_blood_lipids,
      raised_blood_lipids_date: profile.raised_blood_lipids_date,
      raised_blood_lipids_result: profile.raised_blood_lipids_result,
      urine_ketones_positive: profile.urine_ketones_positive,
      urine_ketones_date: profile.urine_ketones_date,
      urine_ketones_result: profile.urine_ketones_result,
      urine_protein_positive: profile.urine_protein_positive,
      urine_protein_date: profile.urine_protein_date,
      urine_protein_result: profile.urine_protein_result,

      notes: profile.notes,
    });
    setErrors({});
  }, []);

  // Basic validation
  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.resident_id) {
      newErrors.resident_id = 'Resident is required';
    }
    if (formData.blood_pressure && !/^\d{2,3}\/\d{2,3}$/.test(formData.blood_pressure)) {
      newErrors.blood_pressure = 'Format: 120/80';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  return {
    formData,
    errors,
    activePicker,
    setActivePicker,
    updateField,
    updateNestedField,
    resetForm,
    populateFromProfile,
    validate,
    setFormData,
    setErrors,
  };
}
