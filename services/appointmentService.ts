// ============================================================================
// APPOINTMENT SERVICE
// Mock appointment management for NagaCare
// ============================================================================

import {
  Appointment,
  AppointmentSummary,
  TimeSlot,
  DateOption,
} from '../types/aramon';
import { healthFacilities, HealthFacility } from '../data/healthFacilities';

// ============================================================================
// MOCK DATA STORAGE
// In a real app, this would be a database
// ============================================================================

let mockAppointments: Appointment[] = [
  {
    id: 'apt-001',
    facilityId: 'hosp-bicol-med',
    facilityName: 'Bicol Medical Center',
    facilityAddress: 'Rizal Avenue, Barangay Triangulo',
    date: '2026-01-29',
    time: '10:30 AM',
    reason: 'General Checkup',
    status: 'confirmed',
    createdAt: new Date('2026-01-25'),
    reminderSent: false,
  },
  {
    id: 'apt-002',
    facilityId: 'bhc-abella',
    facilityName: 'Abella Barangay Health Center',
    facilityAddress: 'Barangay Abella',
    date: '2026-02-05',
    time: '09:00 AM',
    reason: 'Vaccination',
    status: 'pending',
    createdAt: new Date('2026-01-20'),
    reminderSent: false,
  },
];

// ============================================================================
// TIME SLOT GENERATION
// ============================================================================

const generateTimeSlots = (date: string): TimeSlot[] => {
  // Generate realistic time slots
  // Some slots randomly marked as unavailable
  const baseSlots = [
    { time: '08:00 AM', id: '0800' },
    { time: '08:30 AM', id: '0830' },
    { time: '09:00 AM', id: '0900' },
    { time: '09:30 AM', id: '0930' },
    { time: '10:00 AM', id: '1000' },
    { time: '10:30 AM', id: '1030' },
    { time: '11:00 AM', id: '1100' },
    { time: '11:30 AM', id: '1130' },
    { time: '01:00 PM', id: '1300' },
    { time: '01:30 PM', id: '1330' },
    { time: '02:00 PM', id: '1400' },
    { time: '02:30 PM', id: '1430' },
    { time: '03:00 PM', id: '1500' },
    { time: '03:30 PM', id: '1530' },
    { time: '04:00 PM', id: '1600' },
  ];

  // Randomly mark some slots as unavailable based on date hash
  const dateHash = date.split('-').reduce((acc, val) => acc + parseInt(val), 0);
  
  return baseSlots.map((slot, index) => ({
    ...slot,
    available: (dateHash + index) % 3 !== 0, // ~33% unavailable
  }));
};

// ============================================================================
// DATE GENERATION
// ============================================================================

export const generateAvailableDates = (daysAhead: number = 14): DateOption[] => {
  const dates: DateOption[] = [];
  const today = new Date();

  for (let i = 1; i <= daysAhead; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);

    const dayOfWeek = date.getDay();
    // Weekends have limited availability for health centers
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    dates.push({
      date: date.toISOString().split('T')[0],
      dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNumber: date.getDate(),
      monthName: date.toLocaleDateString('en-US', { month: 'short' }),
      available: !isWeekend, // Health centers closed on weekends
    });
  }

  return dates;
};

// ============================================================================
// APPOINTMENT SERVICE CLASS
// ============================================================================

class AppointmentService {
  // Get all appointments for the user
  getAppointments(): Appointment[] {
    return mockAppointments.filter(
      (apt) => apt.status !== 'cancelled'
    ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  // Get upcoming appointments
  getUpcomingAppointments(): Appointment[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.getAppointments().filter((apt) => {
      const aptDate = new Date(apt.date);
      return aptDate >= today && apt.status !== 'completed';
    });
  }

  // Get appointment by ID
  getAppointmentById(id: string): Appointment | undefined {
    return mockAppointments.find((apt) => apt.id === id);
  }

  // Get available time slots for a facility on a date
  getAvailableTimeSlots(facilityId: string, date: string): TimeSlot[] {
    const facility = healthFacilities.find((f) => f.id === facilityId);
    if (!facility) return [];

    // Check if facility is open on this day
    const dayOfWeek = new Date(date).getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // Health centers are typically closed on weekends
    if (facility.type === 'health-center' && isWeekend) {
      return [];
    }

    return generateTimeSlots(date);
  }

  // Create a new appointment
  createAppointment(summary: AppointmentSummary): Appointment {
    const newAppointment: Appointment = {
      id: `apt-${Date.now()}`,
      ...summary,
      status: 'confirmed',
      createdAt: new Date(),
      reminderSent: false,
    };

    mockAppointments.push(newAppointment);
    return newAppointment;
  }

  // Cancel an appointment
  cancelAppointment(appointmentId: string): boolean {
    const index = mockAppointments.findIndex((apt) => apt.id === appointmentId);
    if (index === -1) return false;

    mockAppointments[index].status = 'cancelled';
    return true;
  }

  // Reschedule an appointment
  rescheduleAppointment(
    appointmentId: string,
    newDate: string,
    newTime: string
  ): Appointment | null {
    const index = mockAppointments.findIndex((apt) => apt.id === appointmentId);
    if (index === -1) return null;

    mockAppointments[index] = {
      ...mockAppointments[index],
      date: newDate,
      time: newTime,
      status: 'confirmed',
    };

    return mockAppointments[index];
  }

  // Search facilities based on criteria
  searchFacilities(params: {
    query?: string;
    type?: HealthFacility['type'];
    service?: string;
    limit?: number;
  }): HealthFacility[] {
    let results = [...healthFacilities];

    if (params.query) {
      const query = params.query.toLowerCase();
      results = results.filter(
        (f) =>
          f.name.toLowerCase().includes(query) ||
          f.address.toLowerCase().includes(query) ||
          f.barangay.toLowerCase().includes(query) ||
          f.services.some((s) => s.toLowerCase().includes(query))
      );
    }

    if (params.type) {
      results = results.filter((f) => f.type === params.type);
    }

    if (params.service) {
      const service = params.service.toLowerCase();
      results = results.filter((f) =>
        f.services.some((s) => s.toLowerCase().includes(service))
      );
    }

    // Sort by rating
    results.sort((a, b) => b.rating - a.rating);

    if (params.limit) {
      results = results.slice(0, params.limit);
    }

    return results;
  }

  // Get facilities for a specific service/reason
  getFacilitiesForReason(reason: string): HealthFacility[] {
    const reasonLower = reason.toLowerCase();

    // Map common reasons to facility types and services
    const serviceMapping: Record<string, string[]> = {
      checkup: ['General Checkup', 'Basic Health Consultation', 'Internal Medicine'],
      vaccination: ['Vaccination', 'Child Immunization'],
      prenatal: ['Prenatal Care', 'Maternity', 'Maternal Care'],
      emergency: ['Emergency Room'],
      dental: ['Dental'],
      pediatric: ['Pediatrics', 'Child Immunization'],
      'blood pressure': ['Blood Pressure Monitoring', 'Basic Health Consultation'],
      tb: ['TB DOTS Program'],
      'family planning': ['Family Planning'],
    };

    // Find matching services
    const matchingServices: string[] = [];
    for (const [key, services] of Object.entries(serviceMapping)) {
      if (reasonLower.includes(key)) {
        matchingServices.push(...services);
      }
    }

    if (matchingServices.length === 0) {
      // Default to general facilities
      return this.searchFacilities({ limit: 5 });
    }

    return healthFacilities
      .filter((f) =>
        f.services.some((s) =>
          matchingServices.some((ms) => s.toLowerCase().includes(ms.toLowerCase()))
        )
      )
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 5);
  }

  // Check if user has appointment tomorrow (for proactive reminders)
  getAppointmentsTomorrow(): Appointment[] {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    return this.getAppointments().filter((apt) => apt.date === tomorrowStr);
  }

  // Format appointment for display
  formatAppointmentDate(dateStr: string): string {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (dateStr === today.toISOString().split('T')[0]) {
      return 'Today';
    } else if (dateStr === tomorrow.toISOString().split('T')[0]) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
  }
}

// Export singleton instance
export const appointmentService = new AppointmentService();
