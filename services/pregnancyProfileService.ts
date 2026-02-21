// ============================================================================
// PREGNANCY PROFILE SERVICE
// CRUD operations for pregnancy_profiling_records via Supabase
// Aligned with actual DB table: pregnancy_profiling_records
// ============================================================================

import { supabase } from '../lib/supabase';
import type {
  PregnancyProfile,
  PregnancyProfileFormData,
  PregnancyProfileListItem,
  PregnancyProfileWithResident,
} from '../types/pregnancyProfile';

const TABLE = 'pregnancy_profiling_records';

// ============================================================================
// SERVICE RESULT TYPES
// ============================================================================

interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ============================================================================
// HELPERS
// ============================================================================

function calculateBMI(
  height: number | null | undefined,
  weight: number | null | undefined
): number | null {
  if (!height || !weight || height <= 0) return null;
  const heightM = height / 100;
  return parseFloat((weight / (heightM * heightM)).toFixed(2));
}

function buildPayload(
  formData: PregnancyProfileFormData | Partial<PregnancyProfileFormData>,
  recordedBy?: string,
  updatedBy?: string
): Record<string, unknown> {
  const payload: Record<string, unknown> = {};

  const fieldsToCopy: (keyof PregnancyProfileFormData)[] = [
    'resident_id',
    'visit_date',
    'is_inquirer',
    'inquiry_details',
    // Section 1
    'gravida',
    'para',
    'term',
    'pre_term',
    'abortion',
    'living',
    'type_of_delivery',
    // Section 2
    'blood_pressure',
    'heart_rate',
    'respiratory_rate',
    'height',
    'weight',
    'temperature',
    'visual_acuity_left',
    'visual_acuity_right',
    // Section 3
    'length',
    'waist_circumference',
    'middle_upper_arm_circumference',
    'head_circumference',
    'hip',
    'skinfold_thickness',
    'limbs',
    // Section 4
    'blood_type',
    'z_score_cm',
    // Section 5
    'general_survey',
    // Section 6: NCD (individual columns)
    'eats_processed_fast_foods',
    'vegetables_3_servings_daily',
    'fruits_2_3_servings_daily',
    'moderate_activity_2_5hrs_weekly',
    'diagnosed_diabetes',
    'diabetes_management',
    'diabetes_symptoms',
    'angina_or_heart_attack',
    'chest_pain_pressure',
    'chest_left_arm_pain',
    'chest_pain_with_walking_uphill_hurry',
    'chest_pain_slows_down_walking',
    'chest_pain_relieved_by_rest_or_tablet',
    'chest_pain_gone_under_10mins',
    'chest_pain_severe_30mins_or_more',
    'stroke_or_tia',
    'difficulty_talking_or_one_side_weakness',
    'risk_level',
    // Section 7: Lab results (individual columns)
    'raised_blood_glucose',
    'raised_blood_glucose_date',
    'raised_blood_glucose_result',
    'raised_blood_lipids',
    'raised_blood_lipids_date',
    'raised_blood_lipids_result',
    'urine_ketones_positive',
    'urine_ketones_date',
    'urine_ketones_result',
    'urine_protein_positive',
    'urine_protein_date',
    'urine_protein_result',
    // Notes
    'notes',
  ];

  for (const key of fieldsToCopy) {
    if (key in formData) {
      payload[key] = (formData as Record<string, unknown>)[key];
    }
  }

  // Auto-calculate BMI
  const h = (formData as PregnancyProfileFormData).height ?? null;
  const w = (formData as PregnancyProfileFormData).weight ?? null;
  if (h !== undefined || w !== undefined) {
    payload.bmi = calculateBMI(h, w);
  }

  if (recordedBy) payload.recorded_by = recordedBy;
  if (updatedBy) payload.updated_by = updatedBy;

  return payload;
}

// ============================================================================
// PREGNANCY PROFILE SERVICE CLASS
// ============================================================================

class PregnancyProfileService {
  // ==========================================================================
  // CREATE
  // ==========================================================================
  async createProfile(
    formData: PregnancyProfileFormData,
    recordedBy: string
  ): Promise<ServiceResult<PregnancyProfile>> {
    try {
      const payload = buildPayload(formData, recordedBy);

      const { data, error } = (await (supabase.from(TABLE) as any)
        .insert(payload)
        .select()
        .single()) as { data: PregnancyProfile | null; error: any };

      if (error) {
        console.error('Create pregnancy profile error:', error.message);
        return { success: false, error: error.message || 'Failed to create pregnancy profile' };
      }

      return { success: true, data: data! };
    } catch (err) {
      console.error('Pregnancy profile service error:', err);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  // ==========================================================================
  // UPDATE
  // ==========================================================================
  async updateProfile(
    profileId: string,
    formData: Partial<PregnancyProfileFormData>,
    updatedBy?: string
  ): Promise<ServiceResult<PregnancyProfile>> {
    try {
      const payload = buildPayload(formData, undefined, updatedBy);

      const { data, error } = (await (supabase.from(TABLE) as any)
        .update(payload)
        .eq('id', profileId)
        .select()
        .single()) as { data: PregnancyProfile | null; error: any };

      if (error) {
        console.error('Update pregnancy profile error:', error.message);
        return { success: false, error: error.message || 'Failed to update pregnancy profile' };
      }

      return { success: true, data: data! };
    } catch (err) {
      console.error('Pregnancy profile service error:', err);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  // ==========================================================================
  // UPSERT (uses UNIQUE constraint on resident_id)
  // ==========================================================================
  async upsertProfile(
    formData: PregnancyProfileFormData,
    userId: string
  ): Promise<ServiceResult<PregnancyProfile>> {
    try {
      const payload = buildPayload(formData, userId, userId);

      const { data, error } = (await (supabase.from(TABLE) as any)
        .upsert(payload, { onConflict: 'resident_id' })
        .select()
        .single()) as { data: PregnancyProfile | null; error: any };

      if (error) {
        console.error('Upsert pregnancy profile error:', error.message);
        return { success: false, error: error.message || 'Failed to save pregnancy profile' };
      }

      return { success: true, data: data! };
    } catch (err) {
      console.error('Pregnancy profile service error:', err);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  // ==========================================================================
  // GET BY ID (with resident join)
  // ==========================================================================
  async getProfileById(profileId: string): Promise<ServiceResult<PregnancyProfileWithResident>> {
    try {
      const { data, error } = (await (supabase.from(TABLE) as any)
        .select(
          `
          *,
          resident:residents!resident_id (
            id, full_name, barangay, purok, birth_date, sex, contact_number, philhealth_no
          )
        `
        )
        .eq('id', profileId)
        .single()) as { data: PregnancyProfileWithResident | null; error: any };

      if (error) {
        if (error.code === 'PGRST116') {
          return { success: false, error: 'Pregnancy profile not found' };
        }
        console.error('Get pregnancy profile error:', error.message);
        return { success: false, error: 'Failed to fetch pregnancy profile' };
      }

      return { success: true, data: data! };
    } catch (err) {
      console.error('Pregnancy profile service error:', err);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  // ==========================================================================
  // GET BY RESIDENT ID (single record — UNIQUE constraint)
  // ==========================================================================
  async getProfileByResidentId(
    residentId: string
  ): Promise<ServiceResult<PregnancyProfile | null>> {
    try {
      const { data, error } = (await (supabase.from(TABLE) as any)
        .select('*')
        .eq('resident_id', residentId)
        .maybeSingle()) as { data: PregnancyProfile | null; error: any };

      if (error) {
        console.error('Get profile by resident error:', error.message);
        return { success: false, error: 'Failed to fetch pregnancy profile' };
      }

      return { success: true, data };
    } catch (err) {
      console.error('Pregnancy profile service error:', err);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  // ==========================================================================
  // SEARCH PROFILES (staff search by name, barangay)
  // ==========================================================================
  async searchProfiles(
    query: string,
    options?: { barangay?: string; limit?: number }
  ): Promise<ServiceResult<PregnancyProfileListItem[]>> {
    try {
      const queryBuilder = (supabase.from(TABLE) as any)
        .select(
          `
          id,
          resident_id,
          gravida,
          para,
          visit_date,
          updated_at,
          resident:residents!resident_id (
            full_name,
            barangay
          )
        `
        )
        .order('updated_at', { ascending: false })
        .limit(options?.limit ?? 50);

      const { data, error } = (await queryBuilder) as {
        data: Array<{
          id: string;
          resident_id: string;
          gravida: number | null;
          para: number | null;
          visit_date: string;
          updated_at: string;
          resident: { full_name: string; barangay: string };
        }> | null;
        error: any;
      };

      if (error) {
        console.error('Search profiles error:', error.message);
        return { success: false, error: 'Failed to search profiles' };
      }

      const normalizedQuery = query.toLowerCase().trim();
      const filtered = (data || [])
        .filter((item) => {
          const nameMatch = item.resident?.full_name?.toLowerCase().includes(normalizedQuery);
          const barangayMatch = !options?.barangay || item.resident?.barangay === options.barangay;
          return (normalizedQuery === '' || nameMatch) && barangayMatch;
        })
        .map((item) => ({
          id: item.id,
          resident_id: item.resident_id,
          resident_name: item.resident?.full_name || 'Unknown',
          barangay: item.resident?.barangay || '',
          gravida: item.gravida,
          para: item.para,
          visit_date: item.visit_date,
          updated_at: item.updated_at,
        }));

      return { success: true, data: filtered };
    } catch (err) {
      console.error('Pregnancy profile service error:', err);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }
}

// Export singleton instance
export const pregnancyProfileService = new PregnancyProfileService();
