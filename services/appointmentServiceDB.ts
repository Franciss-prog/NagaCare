// ============================================================================
// APPOINTMENT SERVICE (DATABASE VERSION)
// Handles real appointment booking with Supabase
// ============================================================================

import { supabase } from '../lib/supabase';
import { authService } from './authService';
import type { TimeSlot, DateOption, AppointmentSummary } from '../types/aramon';

// Appointment type from database
export interface DBAppointment {
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
}

// Extended appointment type for app use
export interface AppointmentWithFacility extends DBAppointment {
  facility_name: string;
  facility_address: string;
}

class AppointmentServiceDB {
  // ============================================================================
  // GET AVAILABLE SLOTS FOR A FACILITY ON A DATE
  // Health workers create slots with status='available', we fetch them
  // ============================================================================
  async getAvailableSlots(facilityId: string, date: string): Promise<TimeSlot[]> {
    try {
      const { data, error } = await supabase
        .from('appointments' as any)
        .select('id, time_slot, status')
        .eq('facility_id', facilityId)
        .eq('appointment_date', date)
        .eq('status', 'available')
        .order('time_slot') as { data: DBAppointment[] | null; error: any };

      if (error) {
        console.error('Error fetching available slots:', error);
        return [];
      }

      return (data || []).map(slot => ({
        id: slot.id,
        time: slot.time_slot,
        available: true,
      }));
    } catch (error) {
      console.error('Error fetching available slots:', error);
      return [];
    }
  }

  // ============================================================================
  // GET AVAILABLE DATES FOR A FACILITY
  // Returns dates that have at least one available slot
  // ============================================================================
  async getAvailableDates(facilityId: string, daysAhead = 14): Promise<DateOption[]> {
    try {
      const today = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + daysAhead);

      const { data, error } = await supabase
        .from('appointments' as any)
        .select('appointment_date')
        .eq('facility_id', facilityId)
        .eq('status', 'available')
        .gte('appointment_date', today.toISOString().split('T')[0])
        .lte('appointment_date', endDate.toISOString().split('T')[0])
        .order('appointment_date') as { data: { appointment_date: string }[] | null; error: any };

      if (error) {
        console.error('Error fetching available dates:', error);
        return [];
      }

      // Group by unique dates
      const uniqueDates = [...new Set((data || []).map(d => d.appointment_date))];

      return uniqueDates.map(dateStr => {
        const date = new Date(dateStr);
        return {
          date: dateStr,
          dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
          dayNumber: date.getDate(),
          monthName: date.toLocaleDateString('en-US', { month: 'short' }),
          available: true,
        };
      });
    } catch (error) {
      console.error('Error fetching available dates:', error);
      return [];
    }
  }

  // ============================================================================
  // BOOK AN APPOINTMENT
  // Updates an available slot to booked status
  // ============================================================================
  async bookAppointment(
    slotId: string,
    serviceType?: string,
    notes?: string
  ): Promise<{
    success: boolean;
    appointment?: AppointmentWithFacility;
    error?: string;
  }> {
    const residentId = authService.getResidentId();
    if (!residentId) {
      return { success: false, error: 'Please log in to book an appointment' };
    }

    try {
      // First check if slot is still available
      const { data: slot, error: slotError } = await supabase
        .from('appointments' as any)
        .select('*, health_facilities(name, address)')
        .eq('id', slotId)
        .single() as { data: (DBAppointment & { health_facilities: { name: string; address: string } }) | null; error: any };

      if (slotError || !slot) {
        return { success: false, error: 'Appointment slot not found' };
      }

      if (slot.status !== 'available') {
        return { success: false, error: 'This slot is no longer available' };
      }

      // Book the slot
      const { data: bookedAppointment, error: bookError } = await (supabase
        .from('appointments' as any) as any)
        .update({
          resident_id: residentId,
          status: 'booked',
          service_type: serviceType,
          notes: notes,
          booked_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', slotId)
        .eq('status', 'available') // Double-check it's still available
        .select('*, health_facilities(name, address)')
        .single() as { data: (DBAppointment & { health_facilities: { name: string; address: string } }) | null; error: any };

      if (bookError || !bookedAppointment) {
        console.error('Error booking appointment:', bookError);
        return { success: false, error: 'Failed to book appointment. It may have been taken.' };
      }

      const facility = bookedAppointment.health_facilities;

      return {
        success: true,
        appointment: {
          ...bookedAppointment,
          facility_name: facility?.name || 'Unknown Facility',
          facility_address: facility?.address || 'Unknown Address',
        },
      };
    } catch (error) {
      console.error('Error booking appointment:', error);
      return { success: false, error: 'An error occurred while booking' };
    }
  }

  // ============================================================================
  // GET RESIDENT'S APPOINTMENTS
  // ============================================================================
  async getMyAppointments(): Promise<AppointmentWithFacility[]> {
    const residentId = authService.getResidentId();
    if (!residentId) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('appointments' as any)
        .select('*, health_facilities(name, address)')
        .eq('resident_id', residentId)
        .in('status', ['booked', 'completed'])
        .order('appointment_date', { ascending: true }) as { 
          data: (DBAppointment & { health_facilities: { name: string; address: string } })[] | null; 
          error: any 
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
        };
      });
    } catch (error) {
      console.error('Error fetching appointments:', error);
      return [];
    }
  }

  // ============================================================================
  // GET UPCOMING APPOINTMENTS
  // ============================================================================
  async getUpcomingAppointments(): Promise<AppointmentWithFacility[]> {
    const residentId = authService.getResidentId();
    if (!residentId) {
      return [];
    }

    const today = new Date().toISOString().split('T')[0];

    try {
      const { data, error } = await supabase
        .from('appointments' as any)
        .select('*, health_facilities(name, address)')
        .eq('resident_id', residentId)
        .eq('status', 'booked')
        .gte('appointment_date', today)
        .order('appointment_date', { ascending: true }) as { 
          data: (DBAppointment & { health_facilities: { name: string; address: string } })[] | null; 
          error: any 
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
        };
      });
    } catch (error) {
      console.error('Error fetching upcoming appointments:', error);
      return [];
    }
  }

  // ============================================================================
  // CANCEL APPOINTMENT
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
      // Make the slot available again
      const { error } = await (supabase
        .from('appointments' as any) as any)
        .update({
          resident_id: null,
          status: 'available',
          service_type: null,
          notes: null,
          booked_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', appointmentId)
        .eq('resident_id', residentId); // Ensure user owns this appointment

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
