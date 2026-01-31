// ============================================================================
// SERVICES INDEX
// Export all services for easy importing
// ============================================================================

export { supabase } from '../lib/supabase';
export { authService } from './authService';
export { facilityService } from './facilityService';
export { appointmentServiceDB } from './appointmentServiceDB';
export { yakapService } from './yakapService';

// Re-export types
export type { AuthState, LoginCredentials, RegisterData } from './authService';
export type { HealthFacility } from './facilityService';
export type { AppointmentWithFacility } from './appointmentServiceDB';
export type { YakapFormData, YakapApplication } from './yakapService';
