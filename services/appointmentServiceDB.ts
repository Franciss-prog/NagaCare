// ============================================================================
// APPOINTMENT SERVICE (DATABASE VERSION)
// Handles appointment requests with Supabase - CMS approval workflow
// ============================================================================

import { supabase } from '../lib/supabase';
import { authService } from './authService';
import type { TimeSlot, DateOption, AppointmentSummary } from '../types/aramon';

// Appointment status types (matching database schema)
export type AppointmentStatus = 'available' | 'booked' | 'completed' | 'cancelled' | 'no_show';

// Appointment type from database
export interface DBAppointment {
  id: string;
  facility_id: string;
  resident_id: string | null;
  appointment_date: string;
  time_slot: string;
  service_type: string | null;
  status: AppointmentStatus;
  booked_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Extended appointment type for app use
export interface AppointmentWithFacility extends DBAppointment {
  facility_name: string;
  facility_address: string;
}

class AppointmentServiceDB {
  // ============================================================================
  // GET NEXT 30 DAYS FOR DATE SELECTION
  // User can request any date in the next 30 days
  // ============================================================================
  getAvailableDates(daysAhead = 30): DateOption[] {
    const dates: DateOption[] = [];
    const today = new Date();

    for (let i = 1; i <= daysAhead; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      
      // Skip Sundays (optional - remove if facilities work on Sundays)
      if (date.getDay() === 0) continue;

      const dateStr = date.toISOString().split('T')[0];
      dates.push({
        date: dateStr,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNumber: date.getDate(),
        monthName: date.toLocaleDateString('en-US', { month: 'short' }),
        available: true,
      });
    }

    return dates;
  }

  // ============================================================================
  // GET PREFERRED TIME SLOTS
  // Standard time slots for user to select their preferred time
  // ============================================================================
  getPreferredTimeSlots(): TimeSlot[] {
    const slots: TimeSlot[] = [
      // Morning slots
      { id: 'slot-8am', time: '8:00 AM', available: true },
      { id: 'slot-9am', time: '9:00 AM', available: true },
      { id: 'slot-10am', time: '10:00 AM', available: true },
      { id: 'slot-11am', time: '11:00 AM', available: true },
      // Afternoon slots
      { id: 'slot-1pm', time: '1:00 PM', available: true },
      { id: 'slot-2pm', time: '2:00 PM', available: true },
      { id: 'slot-3pm', time: '3:00 PM', available: true },
      { id: 'slot-4pm', time: '4:00 PM', available: true },
    ];

    return slots;
  }

  // ============================================================================
  // REQUEST AN APPOINTMENT
  // Creates a new appointment with 'booked' status
  // ============================================================================
  async requestAppointment(
    facilityId: string,
    date: string,
    timeSlot: string,
    serviceType?: string,
    notes?: string
  ): Promise<{
    success: boolean;
    appointment?: AppointmentWithFacility;
    error?: string;
  }> {
    const residentId = authService.getResidentId();
    if (!residentId) {
      return { success: false, error: 'Please log in to request an appointment' };
    }

    try {
      // Check if user already has a booked appointment at this facility on this date
      const { data: existing } = await supabase
        .from('appointments')
        .select('id')
        .eq('facility_id', facilityId)
        .eq('resident_id', residentId)
        .eq('appointment_date', date)
        .eq('status', 'booked')
        .maybeSingle();

      if (existing) {
        return { success: false, error: 'You already have a booked appointment at this facility on this date' };
      }

      // Create the appointment request
      const insertData = {
        facility_id: facilityId,
        resident_id: residentId,
        appointment_date: date,
        time_slot: timeSlot,
        service_type: serviceType || 'General Consultation',
        status: 'booked' as const,
        notes: notes,
        booked_at: new Date().toISOString(),
      };

      const { data: newAppointment, error: insertError } = await (supabase
        .from('appointments') as any)
        .insert(insertData)
        .select('*, health_facilities(name, address)')
        .single() as {
          data: (DBAppointment & { health_facilities: { name: string; address: string } | null }) | null;
          error: any;
        };

      if (insertError || !newAppointment) {
        console.error('Error creating appointment request:', insertError);
        return { success: false, error: 'Failed to submit appointment request' };
      }

      const facility = newAppointment.health_facilities;

      return {
        success: true,
        appointment: {
          ...newAppointment,
          facility_name: facility?.name || 'Unknown Facility',
          facility_address: facility?.address || 'Unknown Address',
        } as AppointmentWithFacility,
      };
    } catch (error) {
      console.error('Error requesting appointment:', error);
      return { success: false, error: 'An error occurred while submitting your request' };
    }
  }

  // ============================================================================
  // GET RESIDENT'S APPOINTMENTS (All statuses)
  // ============================================================================
  async getMyAppointments(): Promise<AppointmentWithFacility[]> {
    const residentId = authService.getResidentId();
    if (!residentId) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*, health_facilities(name, address)')
        .eq('resident_id', residentId)
        .in('status', ['booked', 'completed'])
        .order('appointment_date', { ascending: true }) as {
          data: (DBAppointment & { health_facilities: { name: string; address: string } | null })[] | null;
          error: any;
        };

      if (error) {
        console.error('Error fetching appointments:', error);
        return [];
      }

      return (data || []).map(apt => {
        const facility = apt.health_facilities;
        return {
          ...apt,
          facility_name: facility?.name || 'Unknown Facility',
          facility_address: facility?.address || 'Unknown Address',
        } as AppointmentWithFacility;
      });
    } catch (error) {
      console.error('Error fetching appointments:', error);
      return [];
    }
  }

  // ============================================================================
  // GET UPCOMING APPOINTMENTS (Booked)
  // ============================================================================
  async getUpcomingAppointments(): Promise<AppointmentWithFacility[]> {
    const residentId = authService.getResidentId();
    if (!residentId) {
      return [];
    }

    const today = new Date().toISOString().split('T')[0];

    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*, health_facilities(name, address)')
        .eq('resident_id', residentId)
        .eq('status', 'booked')
        .gte('appointment_date', today)
        .order('appointment_date', { ascending: true }) as {
          data: (DBAppointment & { health_facilities: { name: string; address: string } | null })[] | null;
          error: any;
        };

      if (error) {
        console.error('Error fetching upcoming appointments:', error);
        return [];
      }

      return (data || []).map(apt => {
        const facility = apt.health_facilities;
        return {
          ...apt,
          facility_name: facility?.name || 'Unknown Facility',
          facility_address: facility?.address || 'Unknown Address',
        } as AppointmentWithFacility;
      });
    } catch (error) {
      console.error('Error fetching upcoming appointments:', error);
      return [];
    }
  }

  // ============================================================================
  // CANCEL APPOINTMENT
  // User can cancel their own booked appointments
  // ============================================================================
  async cancelAppointment(appointmentId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    const residentId = authService.getResidentId();
    if (!residentId) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const { error } = await (supabase
        .from('appointments') as any)
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString(),
        })
        .eq('id', appointmentId)
        .eq('resident_id', residentId) // Ensure user owns this appointment
        .eq('status', 'booked') as { error: any }; // Can only cancel booked appointments

      if (error) {
        console.error('Error cancelling appointment:', error);
        return { success: false, error: 'Failed to cancel appointment' };
      }

      return { success: true };
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      return { success: false, error: 'An error occurred while cancelling' };
    }
  }

  // ============================================================================
  // GET STATUS DISPLAY INFO
  // ============================================================================
  getStatusDisplay(status: AppointmentStatus): { label: string; color: string; emoji: string } {
    switch (status) {
      case 'available':
        return { label: 'Available', color: '#22c55e', emoji: '📅' };
      case 'booked':
        return { label: 'Booked', color: '#3b82f6', emoji: '✅' };
      case 'completed':
        return { label: 'Completed', color: '#6b7280', emoji: '✔️' };
      case 'cancelled':
        return { label: 'Cancelled', color: '#6b7280', emoji: '🚫' };
      case 'no_show':
        return { label: 'No Show', color: '#ef4444', emoji: '⚠️' };
      default:
        return { label: status, color: '#6b7280', emoji: '❓' };
    }
  }

  // ============================================================================
  // CONVERT TO APP FORMAT (for compatibility with existing UI)
  // ============================================================================
  toAppointmentSummary(apt: AppointmentWithFacility): AppointmentSummary {
    return {
      facilityId: apt.facility_id,
      facilityName: apt.facility_name,
      facilityAddress: apt.facility_address,
      date: apt.appointment_date,
      time: apt.time_slot,
      reason: apt.service_type || 'General Consultation',
    };
  }
}

export const appointmentServiceDB = new AppointmentServiceDB();
