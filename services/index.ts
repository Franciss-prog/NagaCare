// ============================================================================
// SERVICES INDEX
// Export all services for easy importing
// ============================================================================

export { supabase } from '../lib/supabase';
export { authService } from './authService';
export { facilityService } from './facilityService';
export { appointmentServiceDB } from './appointmentServiceDB';
export { yakapService } from './yakapService';
export { pregnancyProfileService } from './pregnancyProfileService';
export { locationService } from './locationService';
export {
  classifyServiceNeed,
  facilityMatchesNeed,
  facilitySupportsService,
  getServiceMatchers,
  getServiceLabel,
  getAllServiceTypes,
} from './serviceClassifier';

// Re-export types
export type { AuthState, LoginCredentials, RegisterData } from './authService';
export type { HealthFacility, FacilityWithDistance, UserLocation } from './facilityService';
export type { AppointmentWithFacility } from './appointmentServiceDB';
export type { YakapFormData, YakapApplication } from './yakapService';
export type {
  PregnancyProfile,
  PregnancyProfileFormData,
  PregnancyProfileListItem,
  PregnancyProfileWithResident,
} from '../types/pregnancyProfile';
export type { UserLocation as GPSLocation, LocationStatus } from './locationService';
export type { ServiceType, ServiceClassification } from './serviceClassifier';
