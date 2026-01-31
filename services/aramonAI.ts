// ============================================================================
// ARAMON AI SERVICE - Enhanced with Intent Detection & Actions
// The brain of Aramon AI - Naga City's health companion
// Now connected to Supabase for real data!
// ============================================================================

import Groq from 'groq-sdk';
import { GROQ_API_KEY } from '@env';
import {
  Message,
  AramonResponse,
  ConversationState,
  InlineUIComponent,
  ActionRequest,
  BookingStep,
  AppointmentSummary,
  QuickReply,
  Appointment,
} from '../types/aramon';
import { facilityService, HealthFacility } from './facilityService';
import { appointmentServiceDB, AppointmentWithFacility } from './appointmentServiceDB';
import { authService } from './authService';
import { yakapService } from './yakapService';

// Initialize Groq client
const groq = new Groq({
  apiKey: GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

// ============================================================================
// ENHANCED SYSTEM PROMPT
// Now includes instructions for intent detection and structured responses
// ============================================================================

const ARAMON_SYSTEM_PROMPT = `You are Aramon AI, the intelligent health assistant for Naga City, Bicol, Philippines. You are part of the NagaCare health system.

YOUR CAPABILITIES:
1. Book appointments at health facilities
2. Find nearby health facilities
3. Answer health questions
4. Show/manage existing appointments
5. Provide health tips and advice
6. Handle emergencies (direct to 911)
7. Help with Yakap (PhilHealth Konsulta) application
8. Check Yakap application status

INTENT DETECTION - You must identify the user's intent and respond with a JSON block when actions are needed.

When you detect an intent that requires action, include this JSON block in your response:
\`\`\`json
{
  "intent": "INTENT_TYPE",
  "data": { ... }
}
\`\`\`

INTENT TYPES:
- BOOK_APPOINTMENT: User wants to book/schedule an appointment
- FIND_FACILITIES: User wants to find health facilities
- SHOW_APPOINTMENTS: User wants to see their appointments
- CANCEL_APPOINTMENT: User wants to cancel an appointment
- HEALTH_INQUIRY: User asking about health/symptoms (no JSON needed, just answer)
- EMERGENCY: User describes emergency symptoms (include JSON to show emergency options)
- YAKAP_APPLY: User wants to apply for Yakap/PhilHealth Konsulta
- YAKAP_STATUS: User wants to check their Yakap application status

BOOKING FLOW:
When booking, extract any information the user provides:
- reason/purpose for visit
- preferred facility name
- preferred date
- preferred time

Example response for booking:
"I'd be happy to help you book an appointment for a checkup! Let me find nearby facilities for you.
\`\`\`json
{
  "intent": "BOOK_APPOINTMENT",
  "data": {
    "reason": "checkup",
    "step": "SELECT_FACILITY"
  }
}
\`\`\`"

COMMUNICATION STYLE:
- Warm, friendly, conversational
- Use simple language
- Be concise but helpful
- Use emojis sparingly but appropriately
- Always confirm before taking actions
- For serious symptoms, recommend professional care

EMERGENCY KEYWORDS (trigger emergency response):
- chest pain, can't breathe, severe bleeding, unconscious, stroke, heart attack, choking

YAKAP KEYWORDS (trigger Yakap application flow):
- yakap, philhealth konsulta, philhealth registration, konsulta program, apply for philhealth, health insurance

HEALTH DISCLAIMER:
You complement health workers but do NOT replace medical professionals. For emergencies, always direct to 911.

Current date: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`;

// ============================================================================
// CONVERSATION STATE MANAGEMENT
// ============================================================================

class ConversationManager {
  private state: ConversationState = {
    currentFlow: 'IDLE',
  };

  getState(): ConversationState {
    return this.state;
  }

  setState(newState: Partial<ConversationState>): void {
    this.state = { ...this.state, ...newState };
  }

  reset(): void {
    this.state = { currentFlow: 'IDLE' };
  }

  // Update booking progress
  updateBooking(data: Partial<ConversationState['bookingData']>): void {
    this.state.bookingData = { ...this.state.bookingData, ...data };
  }
}

// ============================================================================
// ARAMON AI CLASS
// ============================================================================

export class AramonAI {
  private conversationHistory: Message[] = [];
  private stateManager = new ConversationManager();

  constructor() {
    this.initializeConversation();
  }

  private initializeConversation(): void {
    this.conversationHistory = [
      {
        id: 'system',
        role: 'system',
        content: this.buildSystemPrompt(),
        timestamp: new Date(),
      },
    ];
  }

  // Build system prompt with user context
  private buildSystemPrompt(): string {
    let userContext = '';
    
    if (authService.isAuthenticated()) {
      const resident = authService.getCurrentResident();
      if (resident) {
        userContext = `

CURRENT USER CONTEXT:
- Name: ${resident.full_name}
- Barangay: ${resident.barangay}
- Resident ID: ${resident.id}
The user is logged in. You can address them by name and help them with personalized services.`;
      }
    } else {
      userContext = `

CURRENT USER CONTEXT:
The user is NOT logged in. For booking appointments or applying for Yakap, remind them to log in first.`;
    }

    return ARAMON_SYSTEM_PROMPT + userContext;
  }

  // Refresh the system prompt (call after login/logout)
  refreshUserContext(): void {
    if (this.conversationHistory.length > 0 && this.conversationHistory[0].role === 'system') {
      this.conversationHistory[0].content = this.buildSystemPrompt();
    }
  }

  // ============================================================================
  // MAIN SEND MESSAGE - Returns structured AramonResponse
  // ============================================================================

  async sendMessage(userMessage: string): Promise<AramonResponse> {
    // Handle special quick reply commands first (these don't go to AI)
    const lowerMessage = userMessage.toLowerCase().trim();
    
    // Handle Yakap-related quick replies
    if (lowerMessage === 'start_yakap' || lowerMessage === 'start application') {
      return {
        message: "Great! Let me open the Yakap application form for you. 📝",
        action: {
          type: 'NAVIGATE',
          data: { screen: 'YakapForm' },
        },
      };
    }
    
    if (lowerMessage === 'check_yakap_status' || lowerMessage === 'view_yakap_status') {
      return this.handleYakapStatus("Check my Yakap status");
    }

    // Add user message to history
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    };
    this.conversationHistory.push(userMsg);

    try {
      // Check for emergency keywords first
      if (this.isEmergency(userMessage)) {
        return this.handleEmergency(userMessage);
      }

      // Check for Yakap keywords before going to AI
      if (this.isYakapRelated(userMessage)) {
        if (lowerMessage.includes('status') || lowerMessage.includes('check')) {
          return this.handleYakapStatus(userMessage);
        }
        return this.handleYakapApply(userMessage);
      }

      // Check if this is a response to an ongoing flow
      const currentState = this.stateManager.getState();
      if (currentState.currentFlow !== 'IDLE') {
        return this.handleOngoingFlow(userMessage, currentState);
      }

      // Call Groq API for intent detection
      const chatCompletion = await groq.chat.completions.create({
        messages: this.conversationHistory.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        max_tokens: 1024,
      });

      const rawResponse =
        chatCompletion.choices[0]?.message?.content ||
        "I'm having trouble understanding. Could you rephrase that?";

      // Parse the response for intent (now async)
      const parsedResponse = await this.parseAIResponse(rawResponse);

      // Add to history
      this.conversationHistory.push({
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: parsedResponse.message,
        timestamp: new Date(),
      });

      return parsedResponse;
    } catch (error) {
      console.error('Aramon AI Error:', error);
      return {
        message:
          "I'm experiencing technical difficulties. Please try again in a moment. For urgent matters, please call 911 or visit your nearest health facility.",
      };
    }
  }

  // ============================================================================
  // PARSE AI RESPONSE - Extract intent and create inline UI
  // ============================================================================

  private async parseAIResponse(rawResponse: string): Promise<AramonResponse> {
    // Try to extract JSON block from response
    const jsonMatch = rawResponse.match(/```json\n?([\s\S]*?)\n?```/);

    let message = rawResponse.replace(/```json\n?[\s\S]*?\n?```/g, '').trim();

    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        const intent = parsed.intent;
        const data = parsed.data || {};

        switch (intent) {
          case 'BOOK_APPOINTMENT':
            return this.initiateBookingFlow(message, data);

          case 'FIND_FACILITIES':
            return await this.handleFindFacilities(message, data);

          case 'SHOW_APPOINTMENTS':
            return await this.handleShowAppointments(message);

          case 'CANCEL_APPOINTMENT':
            return await this.handleCancelAppointment(message, data);

          case 'EMERGENCY':
            return this.handleEmergency(message);

          case 'YAKAP_APPLY':
            return this.handleYakapApply(message);

          case 'YAKAP_STATUS':
            return await this.handleYakapStatus(message);
        }
      } catch (e) {
        console.error('Failed to parse AI intent JSON:', e);
      }
    }

    // Check for common patterns even without JSON
    const lowerMessage = rawResponse.toLowerCase();
    if (
      lowerMessage.includes('book') &&
      lowerMessage.includes('appointment')
    ) {
      return this.initiateBookingFlow(message, {});
    }

    // Check for Yakap/PhilHealth registration patterns
    if (
      lowerMessage.includes('yakap') ||
      lowerMessage.includes('philhealth konsulta') ||
      lowerMessage.includes('philhealth registration') ||
      (lowerMessage.includes('register') && lowerMessage.includes('philhealth'))
    ) {
      if (lowerMessage.includes('status') || lowerMessage.includes('check') || lowerMessage.includes('application')) {
        return await this.handleYakapStatus(message);
      }
      return this.handleYakapApply(message);
    }

    return { message };
  }

  // ============================================================================
  // BOOKING FLOW HANDLERS
  // ============================================================================

  private initiateBookingFlow(
    message: string,
    data: Record<string, unknown>
  ): AramonResponse {
    const reason = (data.reason as string) || 'General Consultation';

    // Check if user is authenticated
    if (!authService.isAuthenticated()) {
      return {
        message: `To book an appointment, please log in first. You can create an account if you don't have one yet! 🔐`,
        inlineUI: {
          type: 'QUICK_REPLIES',
          options: [
            { id: '1', label: '🔑 Login', value: 'login' },
            { id: '2', label: '📝 Register', value: 'register' },
          ],
        },
      };
    }

    // Update state - facilities will be loaded async
    this.stateManager.setState({
      currentFlow: 'BOOKING_APPOINTMENT',
      bookingData: {
        reason,
        step: 'SELECT_FACILITY',
      },
    });

    // Return placeholder, actual facilities loaded via handleFacilitySearch
    return this.handleFacilitySearchAsync(reason, message);
  }

  // Async facility search for booking
  private handleFacilitySearchAsync(reason: string, message?: string): AramonResponse {
    // This will be populated by the async call in the UI layer
    // For now, return a loading state
    return {
      message:
        message ||
        `I'd be happy to help you book an appointment${reason ? ` for ${reason}` : ''}! Let me find available facilities...`,
      inlineUI: {
        type: 'QUICK_REPLIES',
        options: [
          { id: 'loading', label: '⏳ Loading facilities...', value: 'loading' },
        ],
      },
      action: {
        type: 'BOOK_APPOINTMENT',
        data: { reason, step: 'SELECT_FACILITY' },
      },
    };
  }

  // Called by UI after async facility fetch
  async getFacilitiesForBooking(reason: string): Promise<HealthFacility[]> {
    const facilities = await facilityService.searchFacilities(reason);
    if (facilities.length > 0) {
      return facilities.slice(0, 5);
    }
    // Fallback to all facilities
    const all = await facilityService.getAllFacilities();
    return all.slice(0, 5);
  }

  // Handle facility selection
  async handleFacilitySelection(facility: HealthFacility): Promise<AramonResponse> {
    this.stateManager.setState({
      selectedFacility: facility,
      bookingData: {
        ...this.stateManager.getState().bookingData,
        facilityId: facility.id,
        facilityName: facility.name,
        step: 'SELECT_DATE',
      },
    });

    // Fetch available dates from database
    const dates = await appointmentServiceDB.getAvailableDates(facility.id, 14);

    // Add to conversation
    this.conversationHistory.push({
      id: Date.now().toString(),
      role: 'assistant',
      content: `Great choice! ${facility.name} is a well-rated facility. When would you like to go?`,
      timestamp: new Date(),
    });

    if (dates.length === 0) {
      return {
        message: `Unfortunately, **${facility.name}** doesn't have any available slots in the next 2 weeks. Would you like to try another facility?`,
        inlineUI: {
          type: 'QUICK_REPLIES',
          options: [
            { id: '1', label: '🏥 Try Another Facility', value: 'book appointment' },
            { id: '2', label: '❌ Cancel', value: 'cancel' },
          ],
        },
      };
    }

    return {
      message: `Great choice! **${facility.name}** has available slots. When would you like to go?`,
      inlineUI: {
        type: 'DATE_PICKER',
        availableDates: dates,
      },
      action: {
        type: 'BOOK_APPOINTMENT',
        data: {
          ...this.stateManager.getState().bookingData,
          step: 'SELECT_DATE',
        } as any,
      },
    };
  }

  // Handle date selection
  async handleDateSelection(date: string): Promise<AramonResponse> {
    const state = this.stateManager.getState();
    const facilityId = state.bookingData?.facilityId || '';

    this.stateManager.setState({
      selectedDate: date,
      bookingData: {
        ...state.bookingData,
        date,
        step: 'SELECT_TIME',
      },
    });

    // Fetch available time slots from database
    const timeSlots = await appointmentServiceDB.getAvailableSlots(facilityId, date);

    const formattedDate = new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });

    this.conversationHistory.push({
      id: Date.now().toString(),
      role: 'assistant',
      content: `Here are the available time slots for ${formattedDate}:`,
      timestamp: new Date(),
    });

    if (timeSlots.length === 0) {
      return {
        message: `No available slots for **${formattedDate}**. Please select another date.`,
        inlineUI: {
          type: 'QUICK_REPLIES',
          options: [
            { id: '1', label: '📅 Pick Another Date', value: 'pick another date' },
            { id: '2', label: '❌ Cancel', value: 'cancel' },
          ],
        },
      };
    }

    return {
      message: `Here are the available time slots for **${formattedDate}**:`,
      inlineUI: {
        type: 'TIME_SLOT_PICKER',
        slots: timeSlots,
        date,
      },
      action: {
        type: 'BOOK_APPOINTMENT',
        data: {
          ...state.bookingData,
          date,
          step: 'SELECT_TIME',
        } as any,
      },
    };
  }

  // Handle time selection - now stores the slot ID for booking
  handleTimeSelection(time: string, slotId?: string): AramonResponse {
    const state = this.stateManager.getState();
    const facility = state.selectedFacility;

    if (!facility) {
      return { message: 'Something went wrong. Please start over.' };
    }

    const appointmentSummary: AppointmentSummary = {
      facilityId: facility.id,
      facilityName: facility.name,
      facilityAddress: facility.address,
      date: state.selectedDate || '',
      time,
      reason: state.bookingData?.reason || 'General Consultation',
    };

    this.stateManager.setState({
      selectedTime: time,
      pendingConfirmation: appointmentSummary,
      bookingData: {
        ...state.bookingData,
        timeSlot: time,
        slotId: slotId, // Store the database slot ID
        step: 'CONFIRM',
      },
    });

    this.conversationHistory.push({
      id: Date.now().toString(),
      role: 'assistant',
      content: `Perfect! Here's your appointment summary. Please confirm:`,
      timestamp: new Date(),
    });

    return {
      message: `Perfect! Here's your appointment summary:`,
      inlineUI: {
        type: 'CONFIRMATION_CARD',
        appointment: appointmentSummary,
      },
      action: {
        type: 'BOOK_APPOINTMENT',
        data: {
          ...state.bookingData,
          timeSlot: time,
          step: 'CONFIRM',
        } as any,
      },
    };
  }

  // Confirm booking - now async and saves to database
  async confirmBooking(): Promise<AramonResponse> {
    const state = this.stateManager.getState();
    const summary = state.pendingConfirmation;
    const slotId = state.bookingData?.slotId;

    if (!summary || !slotId) {
      return { message: 'No pending appointment to confirm. Please start over.' };
    }

    // Book the appointment in the database
    const result = await appointmentServiceDB.bookAppointment(
      slotId,
      summary.reason,
      undefined // notes
    );

    if (!result.success) {
      return {
        message: `❌ ${result.error || 'Failed to book appointment'}. Please try again or select a different time slot.`,
        inlineUI: {
          type: 'QUICK_REPLIES',
          options: [
            { id: '1', label: '🔄 Try Again', value: 'book appointment' },
            { id: '2', label: '❌ Cancel', value: 'cancel' },
          ],
        },
      };
    }

    // Reset state
    this.stateManager.reset();

    const formattedDate = this.formatAppointmentDate(summary.date);

    this.conversationHistory.push({
      id: Date.now().toString(),
      role: 'assistant',
      content: `Your appointment has been confirmed!`,
      timestamp: new Date(),
    });

    return {
      message: `✅ **Your appointment is confirmed!**\n\n📍 ${summary.facilityName}\n📅 ${formattedDate}\n⏰ ${summary.time}\n\nI'll send you a reminder before your appointment. Don't forget to bring a valid ID!\n\nIs there anything else I can help you with?`,
      inlineUI: {
        type: 'QUICK_REPLIES',
        options: [
          { id: '1', label: '📅 View My Appointments', value: 'show appointments' },
          { id: '2', label: '🏥 Find Facilities', value: 'find facilities' },
          { id: '3', label: '💊 Health Tips', value: 'health tips' },
        ],
      },
    };
  }

  // Helper to format date
  private formatAppointmentDate(dateStr: string): string {
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

  // Cancel booking flow
  cancelBookingFlow(): AramonResponse {
    this.stateManager.reset();

    this.conversationHistory.push({
      id: Date.now().toString(),
      role: 'assistant',
      content: 'No problem! Let me know if you need anything else.',
      timestamp: new Date(),
    });

    return {
      message:
        'No problem, booking cancelled. Is there anything else I can help you with?',
      inlineUI: {
        type: 'QUICK_REPLIES',
        options: [
          { id: '1', label: '📅 Book Appointment', value: 'book appointment' },
          { id: '2', label: '🏥 Find Facilities', value: 'find facilities' },
          { id: '3', label: '💊 Health Tips', value: 'health tips' },
        ],
      },
    };
  }

  // ============================================================================
  // OTHER FLOW HANDLERS
  // ============================================================================

  private async handleFindFacilities(
    message: string,
    data: Record<string, unknown>
  ): Promise<AramonResponse> {
    const query = (data.query as string) || '';
    const service = data.service as string | undefined;

    let facilities: HealthFacility[];
    
    if (query || service) {
      facilities = await facilityService.searchFacilities(query || service || '');
    } else {
      facilities = await facilityService.getAllFacilities();
    }

    return {
      message:
        message ||
        `Here are some health facilities I found${query ? ` for "${query}"` : ''}:`,
      inlineUI: {
        type: 'FACILITY_PICKER',
        facilities: facilities.slice(0, 5),
      },
    };
  }

  private async handleShowAppointments(message: string): Promise<AramonResponse> {
    if (!authService.isAuthenticated()) {
      return {
        message: `Please log in to view your appointments. 🔐`,
        inlineUI: {
          type: 'QUICK_REPLIES',
          options: [
            { id: '1', label: '🔑 Login', value: 'login' },
            { id: '2', label: '📝 Register', value: 'register' },
          ],
        },
      };
    }

    const dbAppointments = await appointmentServiceDB.getUpcomingAppointments();

    if (dbAppointments.length === 0) {
      return {
        message:
          "You don't have any upcoming appointments. Would you like to book one?",
        inlineUI: {
          type: 'QUICK_REPLIES',
          options: [
            { id: '1', label: '📅 Book Appointment', value: 'book appointment' },
            { id: '2', label: '🏥 Find Facilities', value: 'find facilities' },
          ],
        },
      };
    }

    // Convert to app format
    const appointments: Appointment[] = dbAppointments.map(apt => ({
      id: apt.id,
      facilityId: apt.facility_id,
      facilityName: apt.facility_name,
      facilityAddress: apt.facility_address,
      date: apt.appointment_date,
      time: apt.time_slot,
      reason: apt.service_type || 'General Consultation',
      status: apt.status === 'booked' ? 'confirmed' : apt.status as any,
      createdAt: new Date(apt.created_at),
    }));

    return {
      message: `Here are your upcoming appointments:`,
      inlineUI: {
        type: 'APPOINTMENT_LIST',
        appointments,
      },
    };
  }

  private async handleCancelAppointment(
    message: string,
    data: Record<string, unknown>
  ): Promise<AramonResponse> {
    if (!authService.isAuthenticated()) {
      return {
        message: `Please log in to manage your appointments. 🔐`,
        inlineUI: {
          type: 'QUICK_REPLIES',
          options: [
            { id: '1', label: '🔑 Login', value: 'login' },
          ],
        },
      };
    }

    const appointmentId = data.appointmentId as string;

    if (appointmentId) {
      const result = await appointmentServiceDB.cancelAppointment(appointmentId);
      if (result.success) {
        return {
          message:
            '✅ Your appointment has been cancelled. Is there anything else I can help with?',
        };
      }
    }

    // Show appointments to let user select which to cancel
    const dbAppointments = await appointmentServiceDB.getUpcomingAppointments();
    const appointments: Appointment[] = dbAppointments.map(apt => ({
      id: apt.id,
      facilityId: apt.facility_id,
      facilityName: apt.facility_name,
      facilityAddress: apt.facility_address,
      date: apt.appointment_date,
      time: apt.time_slot,
      reason: apt.service_type || 'General Consultation',
      status: 'confirmed',
      createdAt: new Date(apt.created_at),
    }));

    return {
      message: 'Which appointment would you like to cancel?',
      inlineUI: {
        type: 'APPOINTMENT_LIST',
        appointments,
      },
    };
  }

  async cancelAppointment(appointmentId: string): Promise<AramonResponse> {
    const result = await appointmentServiceDB.cancelAppointment(appointmentId);

    this.conversationHistory.push({
      id: Date.now().toString(),
      role: 'assistant',
      content: result.success
        ? 'Your appointment has been cancelled.'
        : 'Could not cancel the appointment.',
      timestamp: new Date(),
    });

    if (result.success) {
      return {
        message:
          '✅ Your appointment has been cancelled successfully. Would you like to book a new one?',
        inlineUI: {
          type: 'QUICK_REPLIES',
          options: [
            { id: '1', label: '📅 Book New Appointment', value: 'book appointment' },
            { id: '2', label: "No, that's all", value: "no thanks" },
          ],
        },
      };
    }

    return {
      message:
        "I couldn't cancel that appointment. Please try again or contact the facility directly.",
    };
  }

  // ============================================================================
  // EMERGENCY HANDLER
  // ============================================================================

  private isEmergency(message: string): boolean {
    const emergencyKeywords = [
      'chest pain',
      "can't breathe",
      'cannot breathe',
      'difficulty breathing',
      'severe bleeding',
      'unconscious',
      'stroke',
      'heart attack',
      'choking',
      'seizure',
      'suicidal',
      'overdose',
      'severe injury',
      'emergency',
    ];

    const lowerMessage = message.toLowerCase();
    return emergencyKeywords.some((keyword) => lowerMessage.includes(keyword));
  }

  // Check if message is related to Yakap
  private isYakapRelated(message: string): boolean {
    const yakapKeywords = [
      'yakap',
      'philhealth konsulta',
      'philhealth registration',
      'konsulta program',
      'apply for philhealth',
      'health insurance',
      'philhealth application',
      'register philhealth',
      'fill up yakap',
      'yakap form',
    ];

    const lowerMessage = message.toLowerCase();
    return yakapKeywords.some((keyword) => lowerMessage.includes(keyword));
  }

  private handleEmergency(message: string): AramonResponse {
    return {
      message: `🚨 **This sounds like a medical emergency.**\n\nPlease take immediate action:`,
      inlineUI: {
        type: 'EMERGENCY_CARD',
        data: {
          type: 'CALL_911',
          message:
            'If you or someone is in immediate danger, please call emergency services right away.',
        },
      },
      action: {
        type: 'EMERGENCY_ALERT',
        data: {
          type: 'CALL_911',
          message: 'Emergency detected',
        },
      },
    };
  }

  // ============================================================================
  // YAKAP HANDLERS (PhilHealth Konsulta Registration)
  // ============================================================================

  private handleYakapApply(message: string): AramonResponse {
    // Check if user is authenticated
    if (!authService.isAuthenticated()) {
      return {
        message: `To apply for Yakap (PhilHealth Konsulta), you'll need to log in first. This ensures your application is properly linked to your account! 🔐`,
        inlineUI: {
          type: 'QUICK_REPLIES',
          options: [
            { id: '1', label: '🔑 Login', value: 'login' },
            { id: '2', label: '📝 Register', value: 'register' },
          ],
        },
      };
    }

    return {
      message: `Great! I can help you apply for **Yakap** (PhilHealth Konsulta Package). 🏥\n\nThis program provides you with:\n• Free primary care consultations\n• Basic laboratory tests\n• Essential medicines\n• Annual health assessments\n\nWould you like to start your application now?`,
      inlineUI: {
        type: 'QUICK_REPLIES',
        options: [
          { id: '1', label: '📝 Start Application', value: 'start_yakap' },
          { id: '2', label: '📋 Check My Status', value: 'check_yakap_status' },
          { id: '3', label: '❓ Learn More', value: 'yakap_info' },
        ],
      },
      action: {
        type: 'NAVIGATE',
        data: {
          screen: 'YakapForm',
          trigger: 'start_yakap', // This will trigger navigation when user clicks "Start Application"
        },
      },
    };
  }

  private async handleYakapStatus(message: string): Promise<AramonResponse> {
    // Check if user is authenticated
    if (!authService.isAuthenticated()) {
      return {
        message: `To check your Yakap application status, please log in first! 🔐`,
        inlineUI: {
          type: 'QUICK_REPLIES',
          options: [
            { id: '1', label: '🔑 Login', value: 'login' },
            { id: '2', label: '📝 Register', value: 'register' },
          ],
        },
      };
    }

    // Fetch actual status from yakapService
    const resident = authService.getCurrentResident();
    if (!resident) {
      return {
        message: `I couldn't find your profile. Please try logging in again.`,
      };
    }

    try {
      const result = await yakapService.getApplicationStatus(resident.id);
      
      if (result.application) {
        const app = result.application;
        const statusEmoji = {
          pending: '⏳',
          approved: '✅',
          returned: '🔄',
          rejected: '❌',
        }[app.status] || '📋';

        const statusText = {
          pending: 'Pending Review',
          approved: 'Approved',
          returned: 'Returned for Revision',
          rejected: 'Rejected',
        }[app.status] || app.status;

        let statusMessage = `${statusEmoji} **Yakap Application Status**\n\n`;
        statusMessage += `• **Status:** ${statusText}\n`;
        statusMessage += `• **Applied:** ${new Date(app.applied_at).toLocaleDateString()}\n`;
        statusMessage += `• **Membership:** ${app.membership_type}\n`;
        
        if (app.remarks) {
          statusMessage += `• **Remarks:** ${app.remarks}\n`;
        }

        if (app.status === 'returned') {
          return {
            message: statusMessage + `\nYour application has been returned for revision. Would you like to update it?`,
            inlineUI: {
              type: 'QUICK_REPLIES',
              options: [
                { id: '1', label: '📝 Update Application', value: 'start_yakap' },
                { id: '2', label: '❓ Need Help', value: 'Help with Yakap application' },
              ],
            },
          };
        }

        return {
          message: statusMessage,
          inlineUI: {
            type: 'QUICK_REPLIES',
            options: [
              { id: '1', label: '🏠 Back to Menu', value: 'What can you help me with?' },
            ],
          },
        };
      } else {
        // No application found
        return {
          message: `You don't have a Yakap application yet. Would you like to apply now? 📝\n\nYakap (PhilHealth Konsulta) provides free primary care consultations, basic lab tests, and essential medicines.`,
          inlineUI: {
            type: 'QUICK_REPLIES',
            options: [
              { id: '1', label: '📝 Apply Now', value: 'start_yakap' },
              { id: '2', label: '❓ Learn More', value: 'What is Yakap?' },
            ],
          },
        };
      }
    } catch (error) {
      console.error('Error fetching Yakap status:', error);
      return {
        message: `I had trouble checking your application status. Please try again later.`,
      };
    }
  }

  // ============================================================================
  // ONGOING FLOW HANDLER
  // ============================================================================

  private handleOngoingFlow(
    userMessage: string,
    state: ConversationState
  ): AramonResponse {
    const lowerMessage = userMessage.toLowerCase();

    // Check for cancellation
    if (
      lowerMessage.includes('cancel') ||
      lowerMessage.includes('never mind') ||
      lowerMessage.includes('stop')
    ) {
      return this.cancelBookingFlow();
    }

    // For booking flow, the UI handles selections
    // This is for text responses during a flow
    if (state.currentFlow === 'BOOKING_APPOINTMENT') {
      // User might be providing additional info
      return {
        message:
          'Please use the options above to make your selection, or say "cancel" to start over.',
      };
    }

    // Default: reset and process normally
    this.stateManager.reset();
    // Return a prompt to continue - the actual message will be processed fresh
    return {
      message: "Let me help you with that. What would you like to do?",
      inlineUI: {
        type: 'QUICK_REPLIES',
        options: [
          { id: '1', label: '📅 Book Appointment', value: 'book appointment' },
          { id: '2', label: '🏥 Find Facilities', value: 'find facilities' },
          { id: '3', label: '💊 Health Tips', value: 'health tips' },
        ],
      },
    };
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  getHistory(): Message[] {
    return this.conversationHistory.filter((msg) => msg.role !== 'system');
  }

  clearHistory(): void {
    this.initializeConversation();
    this.stateManager.reset();
  }

  getCurrentState(): ConversationState {
    return this.stateManager.getState();
  }

  // Get proactive greeting based on user context
  async getProactiveGreeting(): Promise<AramonResponse> {
    // Get user's name if logged in
    const resident = authService.getCurrentResident();
    const userName = resident?.full_name?.split(' ')[0] || ''; // First name only
    
    let message = userName 
      ? `Hello, ${userName}! 👋 I'm Aramon, your health assistant for Naga City.\n\n`
      : `Hello! 👋 I'm Aramon, your health assistant for Naga City.\n\n`;
    
    message += `I can help you with:\n• 📅 Booking appointments\n• 🏥 Finding health facilities\n• 💊 Health questions & tips\n• 📝 Yakap (PhilHealth Konsulta) application\n• 🚨 Emergency guidance`;

    let inlineUI: InlineUIComponent | undefined;

    // Check if user is authenticated and has upcoming appointments
    if (authService.isAuthenticated()) {
      const upcomingAppointments = await appointmentServiceDB.getUpcomingAppointments();
      
      if (upcomingAppointments.length > 0) {
        const apt = upcomingAppointments[0];
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];

        if (apt.appointment_date === tomorrowStr) {
          message += `\n\n📌 **Reminder:** You have an appointment tomorrow at ${apt.time_slot} with ${apt.facility_name}.`;

          inlineUI = {
            type: 'APPOINTMENT_CARD',
            appointment: {
              id: apt.id,
              facilityId: apt.facility_id,
              facilityName: apt.facility_name,
              facilityAddress: apt.facility_address,
              date: apt.appointment_date,
              time: apt.time_slot,
              reason: apt.service_type || 'General Consultation',
              status: 'confirmed',
              createdAt: new Date(apt.created_at),
            },
          };
        }
      }
    }

    if (!inlineUI) {
      inlineUI = {
        type: 'QUICK_REPLIES',
        options: [
          { id: '1', label: '📅 Book Appointment', value: 'I want to book an appointment' },
          { id: '2', label: '🏥 Find Facilities', value: 'Find nearby health facilities' },
          { id: '3', label: '📝 Apply for Yakap', value: 'I want to apply for yakap' },
        ],
      };
    }

    message += `\n\nHow can I help you today?`;

    return { message, inlineUI };
  }
}

// Export singleton instance
export const aramonAI = new AramonAI();

// Re-export types
export type { Message, AramonResponse };
