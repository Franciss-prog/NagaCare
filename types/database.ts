// ============================================================================
// SUPABASE DATABASE TYPES
// Auto-generated from the SQL schema
// ============================================================================

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          username: string;
          password_hash: string;
          user_role: 'staff' | 'residence';
          assigned_barangay: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          username: string;
          password_hash: string;
          user_role?: 'staff' | 'residence';
          assigned_barangay: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          password_hash?: string;
          user_role?: 'staff' | 'residence';
          assigned_barangay?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      residents: {
        Row: {
          id: string;
          auth_id: string | null;
          barangay: string;
          purok: string;
          full_name: string;
          birth_date: string | null;
          sex: 'Male' | 'Female' | 'Other' | null;
          contact_number: string | null;
          philhealth_no: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          auth_id?: string | null;
          barangay: string;
          purok: string;
          full_name: string;
          birth_date?: string | null;
          sex?: 'Male' | 'Female' | 'Other' | null;
          contact_number?: string | null;
          philhealth_no?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          auth_id?: string | null;
          barangay?: string;
          purok?: string;
          full_name?: string;
          birth_date?: string | null;
          sex?: 'Male' | 'Female' | 'Other' | null;
          contact_number?: string | null;
          philhealth_no?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      health_facilities: {
        Row: {
          id: string;
          name: string;
          barangay: string;
          address: string;
          operating_hours: string | null;
          contact_json: ContactJson | null;
          general_services: string | null;
          specialized_services: string | null;
          service_capability: string | null;
          yakap_accredited: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          barangay: string;
          address: string;
          operating_hours?: string | null;
          contact_json?: ContactJson | null;
          general_services?: string | null;
          specialized_services?: string | null;
          service_capability?: string | null;
          yakap_accredited?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          barangay?: string;
          address?: string;
          operating_hours?: string | null;
          contact_json?: ContactJson | null;
          general_services?: string | null;
          specialized_services?: string | null;
          service_capability?: string | null;
          yakap_accredited?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      appointments: {
        Row: {
          id: string;
          facility_id: string;
          resident_id: string | null;
          appointment_date: string;
          time_slot: string;
          service_type: string | null;
          status: 'available' | 'booked' | 'completed' | 'cancelled' | 'no_show';
          booked_at: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          facility_id: string;
          resident_id?: string | null;
          appointment_date: string;
          time_slot: string;
          service_type?: string | null;
          status?: 'available' | 'booked' | 'completed' | 'cancelled' | 'no_show';
          booked_at?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          facility_id?: string;
          resident_id?: string | null;
          appointment_date?: string;
          time_slot?: string;
          service_type?: string | null;
          status?: 'available' | 'booked' | 'completed' | 'cancelled' | 'no_show';
          booked_at?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      disease_cases: {
        Row: {
          id: string;
          resident_id: string;
          disease_name: string;
          case_classification: 'confirmed' | 'probable' | 'suspected' | null;
          date_reported: string;
          date_onset: string | null;
          outcome: 'recovered' | 'ongoing' | 'fatal' | null;
          reported_by: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          resident_id: string;
          disease_name: string;
          case_classification?: 'confirmed' | 'probable' | 'suspected' | null;
          date_reported: string;
          date_onset?: string | null;
          outcome?: 'recovered' | 'ongoing' | 'fatal' | null;
          reported_by: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          resident_id?: string;
          disease_name?: string;
          case_classification?: 'confirmed' | 'probable' | 'suspected' | null;
          date_reported?: string;
          date_onset?: string | null;
          outcome?: 'recovered' | 'ongoing' | 'fatal' | null;
          reported_by?: string;
          notes?: string | null;
          created_at?: string;
        };
      };
      health_indicators: {
        Row: {
          id: string;
          resident_id: string;
          indicator_type:
            | 'blood_pressure'
            | 'temperature'
            | 'weight'
            | 'height'
            | 'bmi'
            | 'heart_rate'
            | 'glucose'
            | 'cholesterol'
            | 'oxygen_saturation'
            | 'respiratory_rate';
          value: number;
          unit: string;
          status: 'normal' | 'warning' | 'critical' | null;
          notes: string | null;
          recorded_by: string;
          recorded_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          resident_id: string;
          indicator_type:
            | 'blood_pressure'
            | 'temperature'
            | 'weight'
            | 'height'
            | 'bmi'
            | 'heart_rate'
            | 'glucose'
            | 'cholesterol'
            | 'oxygen_saturation'
            | 'respiratory_rate';
          value: number;
          unit: string;
          status?: 'normal' | 'warning' | 'critical' | null;
          notes?: string | null;
          recorded_by: string;
          recorded_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          resident_id?: string;
          indicator_type?:
            | 'blood_pressure'
            | 'temperature'
            | 'weight'
            | 'height'
            | 'bmi'
            | 'heart_rate'
            | 'glucose'
            | 'cholesterol'
            | 'oxygen_saturation'
            | 'respiratory_rate';
          value?: number;
          unit?: string;
          status?: 'normal' | 'warning' | 'critical' | null;
          notes?: string | null;
          recorded_by?: string;
          recorded_at?: string;
          created_at?: string;
        };
      };
      health_programs: {
        Row: {
          id: string;
          program_name: string;
          barangay: string;
          description: string | null;
          target_population: string | null;
          start_date: string | null;
          end_date: string | null;
          status: 'active' | 'inactive' | 'completed' | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          program_name: string;
          barangay: string;
          description?: string | null;
          target_population?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          status?: 'active' | 'inactive' | 'completed' | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          program_name?: string;
          barangay?: string;
          description?: string | null;
          target_population?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          status?: 'active' | 'inactive' | 'completed' | null;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      program_beneficiaries: {
        Row: {
          id: string;
          program_id: string;
          resident_id: string;
          enrollment_date: string;
          status: 'active' | 'completed' | 'dropped' | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          program_id: string;
          resident_id: string;
          enrollment_date?: string;
          status?: 'active' | 'completed' | 'dropped' | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          program_id?: string;
          resident_id?: string;
          enrollment_date?: string;
          status?: 'active' | 'completed' | 'dropped' | null;
          notes?: string | null;
          created_at?: string;
        };
      };
      vaccination_records: {
        Row: {
          id: string;
          resident_id: string;
          vaccine_name: string;
          dose_number: number | null;
          vaccine_date: string;
          next_dose_date: string | null;
          vaccination_site: string | null;
          administered_by: string | null;
          batch_number: string | null;
          status: 'completed' | 'pending' | 'overdue' | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          resident_id: string;
          vaccine_name: string;
          dose_number?: number | null;
          vaccine_date: string;
          next_dose_date?: string | null;
          vaccination_site?: string | null;
          administered_by?: string | null;
          batch_number?: string | null;
          status?: 'completed' | 'pending' | 'overdue' | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          resident_id?: string;
          vaccine_name?: string;
          dose_number?: number | null;
          vaccine_date?: string;
          next_dose_date?: string | null;
          vaccination_site?: string | null;
          administered_by?: string | null;
          batch_number?: string | null;
          status?: 'completed' | 'pending' | 'overdue' | null;
          notes?: string | null;
          created_at?: string;
        };
      };
      vital_signs_history: {
        Row: {
          id: string;
          resident_id: string;
          systolic: number;
          diastolic: number;
          temperature: number | null;
          heart_rate: number | null;
          respiratory_rate: number | null;
          oxygen_saturation: number | null;
          weight: number | null;
          height: number | null;
          bmi: number | null;
          recorded_by: string;
          recorded_at: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          resident_id: string;
          systolic: number;
          diastolic: number;
          temperature?: number | null;
          heart_rate?: number | null;
          respiratory_rate?: number | null;
          oxygen_saturation?: number | null;
          weight?: number | null;
          height?: number | null;
          bmi?: number | null;
          recorded_by: string;
          recorded_at?: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          resident_id?: string;
          systolic?: number;
          diastolic?: number;
          temperature?: number | null;
          heart_rate?: number | null;
          respiratory_rate?: number | null;
          oxygen_saturation?: number | null;
          weight?: number | null;
          height?: number | null;
          bmi?: number | null;
          recorded_by?: string;
          recorded_at?: string;
          notes?: string | null;
          created_at?: string;
        };
      };
      yakap_applications: {
        Row: {
          id: string;
          resident_name: string;
          barangay: string;
          membership_type: 'individual' | 'family' | 'senior' | 'pwd';
          philhealth_no: string | null;
          status: 'pending' | 'approved' | 'returned' | 'rejected';
          applied_at: string;
          approved_by: string | null;
          approved_at: string | null;
          remarks: string | null;
          document_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          resident_name: string;
          barangay: string;
          membership_type: 'individual' | 'family' | 'senior' | 'pwd';
          philhealth_no?: string | null;
          status?: 'pending' | 'approved' | 'returned' | 'rejected';
          applied_at?: string;
          approved_by?: string | null;
          approved_at?: string | null;
          remarks?: string | null;
          document_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          resident_name?: string;
          barangay?: string;
          membership_type?: 'individual' | 'family' | 'senior' | 'pwd';
          philhealth_no?: string | null;
          status?: 'pending' | 'approved' | 'returned' | 'rejected';
          applied_at?: string;
          approved_by?: string | null;
          approved_at?: string | null;
          remarks?: string | null;
          document_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}

// ============================================================================
// HELPER TYPES
// ============================================================================

export interface ContactJson {
  phone?: string;
  mobile?: string;
  email?: string;
  [key: string]: string | undefined;
}

// Convenience type aliases
export type User = Database['public']['Tables']['users']['Row'];
export type Resident = Database['public']['Tables']['residents']['Row'];
export type HealthFacility = Database['public']['Tables']['health_facilities']['Row'];
export type Appointment = Database['public']['Tables']['appointments']['Row'];
export type DiseaseCase = Database['public']['Tables']['disease_cases']['Row'];
export type HealthIndicator = Database['public']['Tables']['health_indicators']['Row'];
export type HealthProgram = Database['public']['Tables']['health_programs']['Row'];
export type ProgramBeneficiary = Database['public']['Tables']['program_beneficiaries']['Row'];
export type VaccinationRecord = Database['public']['Tables']['vaccination_records']['Row'];
export type VitalSignsHistory = Database['public']['Tables']['vital_signs_history']['Row'];
export type YakapApplication = Database['public']['Tables']['yakap_applications']['Row'];

// Insert types
export type NewResident = Database['public']['Tables']['residents']['Insert'];
export type NewAppointment = Database['public']['Tables']['appointments']['Insert'];
export type NewYakapApplication = Database['public']['Tables']['yakap_applications']['Insert'];
