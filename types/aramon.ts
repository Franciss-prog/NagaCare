// ============================================================================
// ARAMON AI TYPE DEFINITIONS
// Core types for the AI-first NagaCare experience
// ============================================================================

import { HealthFacility } from '../services/facilityService';

// ============================================================================
// MESSAGE TYPES
// ============================================================================

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  action?: ActionRequest;
  inlineUI?: InlineUIComponent;
}

// ============================================================================
// ACTION SYSTEM
// Actions that Aramon can trigger based on user intent
// ============================================================================

export type ActionType =
  | 'BOOK_APPOINTMENT'
  | 'FIND_FACILITIES'
  | 'SHOW_APPOINTMENTS'
  | 'CANCEL_APPOINTMENT'
  | 'RESCHEDULE_APPOINTMENT'
  | 'HEALTH_INQUIRY'
  | 'EMERGENCY_ALERT'
  | 'SHOW_DIRECTIONS'
  | 'NAVIGATE'
  | 'CHECK_YAKAP_STATUS';

export type ActionRequest =
  | { type: 'BOOK_APPOINTMENT'; data: BookAppointmentData }
  | { type: 'FIND_FACILITIES'; data: FacilitySearchData }
  | { type: 'SHOW_APPOINTMENTS'; data?: null }
  | { type: 'CANCEL_APPOINTMENT'; data: { appointmentId: string } }
  | { type: 'RESCHEDULE_APPOINTMENT'; data: { appointmentId: string } }
  | { type: 'HEALTH_INQUIRY'; data: HealthInquiryData }
  | { type: 'EMERGENCY_ALERT'; data: EmergencyData }
  | { type: 'SHOW_DIRECTIONS'; data: { facilityId: string } }
  | { type: 'NAVIGATE'; data: NavigateData }
  | { type: 'CHECK_YAKAP_STATUS'; data: Record<string, unknown> };

export interface BookAppointmentData {
  facilityId?: string;
  facilityName?: string;
  date?: string;
  timeSlot?: string;
  slotId?: string; // Database appointment slot ID for booking
  reason?: string;
  step: BookingStep;
}

export type BookingStep =
  | 'SELECT_FACILITY'
  | 'SELECT_DATE'
  | 'SELECT_TIME'
  | 'CONFIRM'
  | 'COMPLETED';

export interface FacilitySearchData {
  query?: string;
  type?: 'hospital' | 'health-center' | 'clinic' | 'pharmacy';
  service?: string;
  nearbyOnly?: boolean;
}

export interface HealthInquiryData {
  topic: string;
  symptoms?: string[];
  severity?: 'mild' | 'moderate' | 'severe';
}

export interface EmergencyData {
  type: 'CALL_911' | 'SHOW_EMERGENCY_INFO' | 'FIND_ER';
  message?: string;
}

export interface NavigateData {
  screen: string;
  trigger?: string;
  params?: Record<string, unknown>;
}

// ============================================================================
// INLINE UI COMPONENTS
// UI elements that appear within the chat
// ============================================================================

export type InlineUIComponent =
  | { type: 'FACILITY_PICKER'; facilities: HealthFacility[] }
  | { type: 'DATE_PICKER'; availableDates: DateOption[] }
  | { type: 'TIME_SLOT_PICKER'; slots: TimeSlot[]; date: string }
  | { type: 'CONFIRMATION_CARD'; appointment: AppointmentSummary }
  | { type: 'APPOINTMENT_LIST'; appointments: Appointment[] }
  | { type: 'APPOINTMENT_CARD'; appointment: Appointment }
  | { type: 'FACILITY_CARD'; facility: HealthFacility }
  | { type: 'QUICK_REPLIES'; options: QuickReply[] }
  | { type: 'EMERGENCY_CARD'; data: EmergencyData };

export interface DateOption {
  date: string; // ISO format: YYYY-MM-DD
  dayName: string; // "Mon", "Tue", etc.
  dayNumber: number;
  monthName: string;
  available: boolean;
}

export interface TimeSlot {
  id: string;
  time: string; // "09:00 AM"
  available: boolean;
}

export interface QuickReply {
  id: string;
  label: string;
  value: string;
  icon?: string;
}

// ============================================================================
// APPOINTMENT TYPES
// ============================================================================

export interface Appointment {
  id: string;
  facilityId: string;
  facilityName: string;
  facilityAddress: string;
  date: string; // ISO format
  time: string;
  reason: string;
  status: AppointmentStatus;
  createdAt: Date;
  reminderSent?: boolean;
}

export type AppointmentStatus =
  | 'available'  // Appointment slot is available for booking
  | 'booked'     // Appointment is booked by a resident
  | 'completed'  // Appointment completed
  | 'cancelled'  // Appointment was cancelled
  | 'no_show';   // Resident didn't show up

export interface AppointmentSummary {
  facilityId: string;
  facilityName: string;
  facilityAddress: string;
  date: string;
  time: string;
  reason: string;
}

// ============================================================================
// CONVERSATION STATE
// Tracks the current state of the conversation
// ============================================================================

export interface ConversationState {
  currentFlow: ConversationFlow;
  bookingData?: Partial<BookAppointmentData>;
  selectedFacility?: HealthFacility;
  selectedDate?: string;
  selectedTime?: string;
  pendingConfirmation?: AppointmentSummary;
}

export type ConversationFlow =
  | 'IDLE'
  | 'BOOKING_APPOINTMENT'
  | 'FINDING_FACILITIES'
  | 'HEALTH_INQUIRY'
  | 'MANAGING_APPOINTMENTS'
  | 'EMERGENCY';

// ============================================================================
// AI RESPONSE FORMAT
// Structure returned by the AI service
// ============================================================================

export interface AramonResponse {
  message: string;
  action?: ActionRequest;
  inlineUI?: InlineUIComponent;
  conversationState?: Partial<ConversationState>;
}

// ============================================================================
// USER CONTEXT
// Information about the user for personalization
// ============================================================================

export interface UserContext {
  name?: string;
  contactNumber?: string;
  email?: string;
  barangay?: string;
  preferredFacilities?: string[];
  healthConditions?: string[];
}
