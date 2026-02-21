// ============================================================================
// PREGNANCY PROFILE TYPE DEFINITIONS
// Aligned with actual DB table: pregnancy_profiling_records
// ============================================================================

// ============================================================================
// ENUMS / LITERALS
// ============================================================================

export type YesNo = 'yes' | 'no';

export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export type DiabetesStatus = 'yes' | 'no' | 'do_not_know';

export type DiabetesManagement = 'with_medication' | 'without_medication';

export type RiskLevel = 'lt_10' | '10_to_lt_20' | '20_to_lt_30' | '30_to_lt_40' | 'gte_40';

// ============================================================================
// GENERAL SURVEY SECTION DEFINITIONS
// ============================================================================

export type GeneralSurveySection =
  | 'heent'
  | 'chest_breast_lungs'
  | 'heart'
  | 'abdomen'
  | 'genitourinary'
  | 'digital_rectal'
  | 'skin_extremities'
  | 'neurological';

export interface GeneralSurveySectionData {
  selected: string[];
  others: string;
}

export type GeneralSurveyData = Record<GeneralSurveySection, GeneralSurveySectionData>;

/** Checkbox options for each General Survey section */
export const GENERAL_SURVEY_OPTIONS: Record<GeneralSurveySection, string[]> = {
  heent: [
    'Essentially normal',
    'Abnormal pupillary reaction',
    'Cervical lymphadenopathy',
    'Dry mucous membrane',
    'Icteric sclerae',
    'Pale conjunctiva',
    'Sunken eyeballs',
    'Sunken fontanelle',
  ],
  chest_breast_lungs: [
    'Essentially normal',
    'Asymmetric chest expansion',
    'Barrel chest',
    'Wheezes/rales/crackles',
    'Decreased breath sounds',
    'Intercostal rib retraction',
    'Breast/nipple discharge',
    'Breast mass',
  ],
  heart: [
    'Essentially normal',
    'Displaced apex beat',
    'Heaves/thrills',
    'Irregular rhythm',
    'Murmur',
    'Pericardial bulge',
    'Tachycardia',
  ],
  abdomen: [
    'Essentially normal',
    'Abdominal mass',
    'Abdominal tenderness',
    'Distended abdomen',
    'Hepatomegaly',
    'Splenomegaly',
    'Tympanitic/dull abdomen',
  ],
  genitourinary: [
    'Essentially normal',
    'Blood stained discharge',
    'Cervical abnormality',
    'Foul smelling discharge',
    'Inguinal/scrotal mass',
    'Undescended testes',
    'Vaginal/penile discharge',
  ],
  digital_rectal: [
    'Essentially normal',
    'Enlarged prostate',
    'Hemorrhoids',
    'Mass',
    'Rectal prolapse',
    'Tenderness',
  ],
  skin_extremities: [
    'Essentially normal',
    'Cyanotic nails/lips',
    'Dry skin',
    'Edema',
    'Jaundice',
    'Pale nailbeds',
    'Petechiae/purpura',
    'Poor skin turgor',
    'Rashes/lesions',
    'Weak pulses',
  ],
  neurological: [
    'Essentially normal',
    'Abnormal gait',
    'Abnormal position sense',
    'Altered sensorium',
    'Decreased/absent DTR',
    'Fasciculation',
    'Motor deficit',
    'Sensory deficit',
    'Tremors',
  ],
};

export const GENERAL_SURVEY_LABELS: Record<GeneralSurveySection, string> = {
  heent: 'HEENT',
  chest_breast_lungs: 'Chest / Breast / Lungs',
  heart: 'Heart',
  abdomen: 'Abdomen',
  genitourinary: 'Genitourinary',
  digital_rectal: 'Digital Rectal Examination',
  skin_extremities: 'Skin / Extremities',
  neurological: 'Neurological Examination',
};

// ============================================================================
// NCD CONSTANTS
// ============================================================================

export const NCD_SYMPTOMS = ['Polydipsia', 'Polyuria', 'Polyphagia'] as const;

export const RISK_LEVEL_OPTIONS: { value: RiskLevel; label: string }[] = [
  { value: 'lt_10', label: '< 10%' },
  { value: '10_to_lt_20', label: '10 – < 20%' },
  { value: '20_to_lt_30', label: '20 – < 30%' },
  { value: '30_to_lt_40', label: '30 – < 40%' },
  { value: 'gte_40', label: '≥ 40%' },
];

// ============================================================================
// DELIVERY TYPE OPTIONS
// ============================================================================

export const DELIVERY_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: 'vaginal', label: 'Normal Vaginal Delivery' },
  { value: 'cesarean', label: 'Cesarean Section' },
  { value: 'vacuum_assisted', label: 'Vacuum Assisted' },
  { value: 'forceps_assisted', label: 'Forceps Assisted' },
  { value: 'vbac', label: 'VBAC (Vaginal Birth After Cesarean)' },
];

// ============================================================================
// MAIN PREGNANCY PROFILE TYPE (mirrors pregnancy_profiling_records)
// ============================================================================

export interface PregnancyProfile {
  id: string;
  resident_id: string;
  visit_date: string;
  is_inquirer: boolean;
  inquiry_details: string | null;

  // Section 1: Pregnancy History
  gravida: number | null;
  para: number | null;
  term: number | null;
  pre_term: number | null;
  abortion: number | null;
  living: number | null;
  type_of_delivery: string | null;

  // Section 2: Physical Examination
  blood_pressure: string | null;
  heart_rate: number | null;
  respiratory_rate: number | null;
  height: number | null;
  weight: number | null;
  bmi: number | null;
  temperature: number | null;
  visual_acuity_left: string | null;
  visual_acuity_right: string | null;

  // Section 3: Pediatric 0-24 months
  length: number | null;
  waist_circumference: number | null;
  middle_upper_arm_circumference: number | null;
  head_circumference: number | null;
  hip: number | null;
  skinfold_thickness: number | null;
  limbs: string | null;

  // Section 4: Pediatric 0-60 months
  blood_type: BloodType | null;
  z_score_cm: number | null;

  // Section 5: General Survey (JSONB)
  general_survey: GeneralSurveyData;

  // Section 6: NCD High Risk Assessment (individual columns)
  eats_processed_fast_foods: YesNo | null;
  vegetables_3_servings_daily: YesNo | null;
  fruits_2_3_servings_daily: YesNo | null;
  moderate_activity_2_5hrs_weekly: YesNo | null;
  diagnosed_diabetes: DiabetesStatus | null;
  diabetes_management: DiabetesManagement | null;
  diabetes_symptoms: string[];
  angina_or_heart_attack: YesNo | null;
  chest_pain_pressure: YesNo | null;
  chest_left_arm_pain: YesNo | null;
  chest_pain_with_walking_uphill_hurry: YesNo | null;
  chest_pain_slows_down_walking: YesNo | null;
  chest_pain_relieved_by_rest_or_tablet: YesNo | null;
  chest_pain_gone_under_10mins: YesNo | null;
  chest_pain_severe_30mins_or_more: YesNo | null;
  stroke_or_tia: YesNo | null;
  difficulty_talking_or_one_side_weakness: YesNo | null;
  risk_level: RiskLevel | null;

  // Section 7: Lab Results (individual columns)
  raised_blood_glucose: YesNo | null;
  raised_blood_glucose_date: string | null;
  raised_blood_glucose_result: string | null;
  raised_blood_lipids: YesNo | null;
  raised_blood_lipids_date: string | null;
  raised_blood_lipids_result: string | null;
  urine_ketones_positive: YesNo | null;
  urine_ketones_date: string | null;
  urine_ketones_result: string | null;
  urine_protein_positive: YesNo | null;
  urine_protein_date: string | null;
  urine_protein_result: string | null;

  // Metadata
  notes: string | null;
  recorded_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// FORM DATA (used for create/update — omits server-generated fields)
// ============================================================================

export type PregnancyProfileFormData = Omit<
  PregnancyProfile,
  'id' | 'created_at' | 'updated_at' | 'recorded_by' | 'updated_by'
>;

// ============================================================================
// DEFAULTS
// ============================================================================

export const DEFAULT_GENERAL_SURVEY: GeneralSurveyData = {
  heent: { selected: [], others: '' },
  chest_breast_lungs: { selected: [], others: '' },
  heart: { selected: [], others: '' },
  abdomen: { selected: [], others: '' },
  genitourinary: { selected: [], others: '' },
  digital_rectal: { selected: [], others: '' },
  skin_extremities: { selected: [], others: '' },
  neurological: { selected: [], others: '' },
};

export const DEFAULT_FORM_DATA: PregnancyProfileFormData = {
  resident_id: '',
  visit_date: new Date().toISOString().split('T')[0],
  is_inquirer: false,
  inquiry_details: null,

  // Section 1
  gravida: null,
  para: null,
  term: null,
  pre_term: null,
  abortion: null,
  living: null,
  type_of_delivery: null,

  // Section 2
  blood_pressure: null,
  heart_rate: null,
  respiratory_rate: null,
  height: null,
  weight: null,
  bmi: null,
  temperature: null,
  visual_acuity_left: null,
  visual_acuity_right: null,

  // Section 3
  length: null,
  waist_circumference: null,
  middle_upper_arm_circumference: null,
  head_circumference: null,
  hip: null,
  skinfold_thickness: null,
  limbs: null,

  // Section 4
  blood_type: null,
  z_score_cm: null,

  // Section 5
  general_survey: { ...DEFAULT_GENERAL_SURVEY },

  // Section 6: NCD (individual columns)
  eats_processed_fast_foods: null,
  vegetables_3_servings_daily: null,
  fruits_2_3_servings_daily: null,
  moderate_activity_2_5hrs_weekly: null,
  diagnosed_diabetes: null,
  diabetes_management: null,
  diabetes_symptoms: [],
  angina_or_heart_attack: null,
  chest_pain_pressure: null,
  chest_left_arm_pain: null,
  chest_pain_with_walking_uphill_hurry: null,
  chest_pain_slows_down_walking: null,
  chest_pain_relieved_by_rest_or_tablet: null,
  chest_pain_gone_under_10mins: null,
  chest_pain_severe_30mins_or_more: null,
  stroke_or_tia: null,
  difficulty_talking_or_one_side_weakness: null,
  risk_level: null,

  // Section 7: Lab results (individual columns)
  raised_blood_glucose: null,
  raised_blood_glucose_date: null,
  raised_blood_glucose_result: null,
  raised_blood_lipids: null,
  raised_blood_lipids_date: null,
  raised_blood_lipids_result: null,
  urine_ketones_positive: null,
  urine_ketones_date: null,
  urine_ketones_result: null,
  urine_protein_positive: null,
  urine_protein_date: null,
  urine_protein_result: null,

  // Notes
  notes: null,
};

// ============================================================================
// SEARCH / LIST TYPES
// ============================================================================

export interface PregnancyProfileListItem {
  id: string;
  resident_id: string;
  resident_name: string;
  barangay: string;
  gravida: number | null;
  para: number | null;
  visit_date: string;
  updated_at: string;
}

export interface PregnancyProfileWithResident extends PregnancyProfile {
  resident: {
    id: string;
    full_name: string;
    barangay: string;
    purok: string;
    birth_date: string | null;
    sex: string | null;
    contact_number: string | null;
    philhealth_no: string | null;
  };
}
