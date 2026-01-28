// ============================================================================
// ARAMON AI SERVICE - Enhanced with Intent Detection & Actions
// The brain of NagaCare's AI-first experience
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
} from '../types/aramon';
import { healthFacilities, HealthFacility } from '../data/healthFacilities';
import {
  appointmentService,
  generateAvailableDates,
} from './appointmentService';

// Initialize Groq client
const groq = new Groq({
  apiKey: GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

// ============================================================================
// ENHANCED SYSTEM PROMPT
// Now includes instructions for intent detection and structured responses
// ============================================================================

const ARAMON_SYSTEM_PROMPT = `You are Aramon AI, the primary interface for NagaCare - a health app for Naga City, Bicol, Philippines.

YOUR CAPABILITIES:
1. Book appointments at health facilities
2. Find nearby health facilities
3. Answer health questions
4. Show/manage existing appointments
5. Provide health tips and advice
6. Handle emergencies (direct to 911)

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
        content: ARAMON_SYSTEM_PROMPT,
        timestamp: new Date(),
      },
    ];
  }

  // ============================================================================
  // MAIN SEND MESSAGE - Returns structured AramonResponse
  // ============================================================================

  async sendMessage(userMessage: string): Promise<AramonResponse> {
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

      // Parse the response for intent
      const parsedResponse = this.parseAIResponse(rawResponse);

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

  private parseAIResponse(rawResponse: string): AramonResponse {
    // Try to extract JSON block from response
    const jsonMatch = rawResponse.match(/```json\n?([\s\S]*?)\n?```/);

    let message = rawResponse.replace(/```json\n?[\s\S]*?\n?```/g, '').trim();
    let action: ActionRequest | undefined;
    let inlineUI: InlineUIComponent | undefined;

    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        const intent = parsed.intent;
        const data = parsed.data || {};

        switch (intent) {
          case 'BOOK_APPOINTMENT':
            return this.initiateBookingFlow(message, data);

          case 'FIND_FACILITIES':
            return this.handleFindFacilities(message, data);

          case 'SHOW_APPOINTMENTS':
            return this.handleShowAppointments(message);

          case 'CANCEL_APPOINTMENT':
            return this.handleCancelAppointment(message, data);

          case 'EMERGENCY':
            return this.handleEmergency(message);
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

    // Find facilities that match the reason
    const facilities = appointmentService.getFacilitiesForReason(reason);

    // Update state
    this.stateManager.setState({
      currentFlow: 'BOOKING_APPOINTMENT',
      bookingData: {
        reason,
        step: 'SELECT_FACILITY',
      },
    });

    return {
      message:
        message ||
        `I'd be happy to help you book an appointment${reason ? ` for ${reason}` : ''}! Here are some nearby facilities:`,
      inlineUI: {
        type: 'FACILITY_PICKER',
        facilities: facilities.slice(0, 5),
      },
      action: {
        type: 'BOOK_APPOINTMENT',
        data: { reason, step: 'SELECT_FACILITY' },
      },
    };
  }

  // Handle facility selection
  handleFacilitySelection(facility: HealthFacility): AramonResponse {
    this.stateManager.setState({
      selectedFacility: facility,
      bookingData: {
        ...this.stateManager.getState().bookingData,
        facilityId: facility.id,
        facilityName: facility.name,
        step: 'SELECT_DATE',
      },
    });

    const dates = generateAvailableDates(14);

    // Add to conversation
    this.conversationHistory.push({
      id: Date.now().toString(),
      role: 'assistant',
      content: `Great choice! ${facility.name} is a well-rated facility. When would you like to go?`,
      timestamp: new Date(),
    });

    return {
      message: `Great choice! **${facility.name}** is a well-rated facility. When would you like to go?`,
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
  handleDateSelection(date: string): AramonResponse {
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

    const timeSlots = appointmentService.getAvailableTimeSlots(
      facilityId,
      date
    );

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

  // Handle time selection
  handleTimeSelection(time: string): AramonResponse {
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

  // Confirm booking
  confirmBooking(): AramonResponse {
    const state = this.stateManager.getState();
    const summary = state.pendingConfirmation;

    if (!summary) {
      return { message: 'No pending appointment to confirm.' };
    }

    // Create the appointment
    const appointment = appointmentService.createAppointment(summary);

    // Reset state
    this.stateManager.reset();

    const formattedDate = appointmentService.formatAppointmentDate(
      appointment.date
    );

    this.conversationHistory.push({
      id: Date.now().toString(),
      role: 'assistant',
      content: `Your appointment has been confirmed!`,
      timestamp: new Date(),
    });

    return {
      message: `✅ **Your appointment is confirmed!**\n\n📍 ${appointment.facilityName}\n📅 ${formattedDate}\n⏰ ${appointment.time}\n\nI'll send you a reminder before your appointment. Don't forget to bring a valid ID!\n\nIs there anything else I can help you with?`,
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

  private handleFindFacilities(
    message: string,
    data: Record<string, unknown>
  ): AramonResponse {
    const query = (data.query as string) || '';
    const type = data.type as HealthFacility['type'] | undefined;
    const service = data.service as string | undefined;

    const facilities = appointmentService.searchFacilities({
      query,
      type,
      service,
      limit: 5,
    });

    return {
      message:
        message ||
        `Here are some health facilities I found${query ? ` for "${query}"` : ''}:`,
      inlineUI: {
        type: 'FACILITY_PICKER',
        facilities,
      },
    };
  }

  private handleShowAppointments(message: string): AramonResponse {
    const appointments = appointmentService.getUpcomingAppointments();

    if (appointments.length === 0) {
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

    return {
      message: `Here are your upcoming appointments:`,
      inlineUI: {
        type: 'APPOINTMENT_LIST',
        appointments,
      },
    };
  }

  private handleCancelAppointment(
    message: string,
    data: Record<string, unknown>
  ): AramonResponse {
    const appointmentId = data.appointmentId as string;

    if (appointmentId) {
      const success = appointmentService.cancelAppointment(appointmentId);
      if (success) {
        return {
          message:
            '✅ Your appointment has been cancelled. Is there anything else I can help with?',
        };
      }
    }

    // Show appointments to let user select which to cancel
    const appointments = appointmentService.getUpcomingAppointments();
    return {
      message: 'Which appointment would you like to cancel?',
      inlineUI: {
        type: 'APPOINTMENT_LIST',
        appointments,
      },
    };
  }

  cancelAppointment(appointmentId: string): AramonResponse {
    const success = appointmentService.cancelAppointment(appointmentId);

    this.conversationHistory.push({
      id: Date.now().toString(),
      role: 'assistant',
      content: success
        ? 'Your appointment has been cancelled.'
        : 'Could not cancel the appointment.',
      timestamp: new Date(),
    });

    if (success) {
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
  getProactiveGreeting(): AramonResponse {
    const tomorrowAppointments = appointmentService.getAppointmentsTomorrow();

    let message = `Hello! 👋 I'm Aramon, your health assistant for Naga City.\n\nI can help you with:\n• 📅 Booking appointments\n• 🏥 Finding health facilities\n• 💊 Health questions & tips\n• 🚨 Emergency guidance`;

    let inlineUI: InlineUIComponent | undefined;

    if (tomorrowAppointments.length > 0) {
      const apt = tomorrowAppointments[0];
      message += `\n\n📌 **Reminder:** You have an appointment tomorrow at ${apt.time} with ${apt.facilityName}.`;

      inlineUI = {
        type: 'APPOINTMENT_CARD',
        appointment: apt,
      };
    } else {
      inlineUI = {
        type: 'QUICK_REPLIES',
        options: [
          { id: '1', label: '📅 Book Appointment', value: 'I want to book an appointment' },
          { id: '2', label: '🏥 Find Facilities', value: 'Find nearby health facilities' },
          { id: '3', label: '💊 Health Tips', value: 'Give me a health tip' },
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
