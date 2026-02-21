// ============================================================================
// ARAMON AI SERVICE - Enhanced with Intent Detection & Actions
// The brain of Aramon AI - Naga City's health companion

// ============================================================================

import Groq from 'groq-sdk';
import Constants from 'expo-constants';

const GROQ_API_KEY = Constants.expoConfig?.extra?.groqApiKey as string;
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
  AppLanguage,
} from '../types/aramon';
import { facilityService, HealthFacility, type FacilityWithDistance, type UserLocation } from './facilityService';
import { classifyServiceNeed, type ServiceClassification } from './serviceClassifier';
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
9. Find the user's current location using GPS (you have access to their device GPS)

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
- GET_LOCATION: User wants to know where they are, their current location, or asks anything about their position/address. You HAVE access to their device GPS — never say you cannot find their location.
- PREGNANCY_PROFILE: User wants to fill out, open, view, or update their pregnancy profile/prenatal form. This covers pregnancy profiling, prenatal records, maternal health forms, and pregnancy history.

BOOKING FLOW:
When booking, extract any information the user provides:
- reason/purpose for visit (be specific — e.g. "x-ray", "dental checkup", "prenatal care", "vaccination")
- preferred facility name
- preferred date
- preferred time

IMPORTANT — SERVICE CLASSIFICATION:
You MUST extract the specific health service the user needs. Be precise with the reason field.
Map the user's need to one of these service types:
- medical_consultation: general checkup, consultation, fever, flu, illness
- dental_service: dental, tooth, teeth, oral health
- vaccination: vaccine, immunization, booster
- maternal_care: prenatal, pregnancy, maternity, postnatal
- laboratory: lab test, blood test, urinalysis, CBC
- mental_health: counseling, therapy, depression, anxiety
- emergency: ER, urgent, accident
- pediatrics: child health, baby, infant, pedia
- surgery: operation, surgical procedure
- radiology: x-ray, CT scan, MRI, ultrasound, dialysis
- pharmacy: medicine, prescription
- family_planning: contraception, birth control
- tb_treatment: TB, tuberculosis, DOTS
- senior_care: elderly, geriatric, senior citizen
- cardiology: heart, blood pressure, hypertension
- ob_gyn: OB-GYN, gynecology, women's health

Use the user's EXACT service need as the "reason" in your JSON — do NOT generalize it.
For example, if the user says "I need an x-ray", use "x-ray" as the reason, NOT "checkup".

Example response for booking:
"I'd be happy to help you book an appointment for an X-ray! Let me find facilities that offer radiology services.
\`\`\`json
{
  "intent": "BOOK_APPOINTMENT",
  "data": {
    "reason": "x-ray",
    "step": "SELECT_FACILITY"
  }
}
\`\`\`"

LOCATION / GPS:
You CAN access the user's device GPS. When a user asks "where am I?", "what's my location?", "find my location", or anything about their current position, ALWAYS respond with a GET_LOCATION intent. NEVER say you are a text-based AI or that you cannot access their location.

Example response for location:
"Let me find your current location! 📍
\`\`\`json
{
  "intent": "GET_LOCATION",
  "data": {}
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

PREGNANCY PROFILE KEYWORDS (trigger pregnancy profiling form):
- pregnancy profile, pregnancy profiling, prenatal profile, prenatal form, maternal profile, pregnancy form, pregnancy record, fill out pregnancy, pregnancy history form, prenatal record

HEALTH DISCLAIMER:
You complement health workers but do NOT replace medical professionals. For emergencies, always direct to 911.

Current date: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`;

// ============================================================================
// LANGUAGE PROMPT INSTRUCTIONS
// ============================================================================

const LANGUAGE_PROMPTS: Record<AppLanguage, string> = {
  english: '',
  tagalog: `

LANGUAGE INSTRUCTION:
You MUST respond in TAGALOG (Filipino) for ALL your messages. Use natural, conversational Tagalog.
Examples:
- Instead of "Hello! How can I help you?" say "Kumusta! Paano kita matutulungan?"
- Instead of "I'd be happy to help you book an appointment" say "Masaya akong makakatulong sa pagpa-book ng appointment mo"
- Keep intent JSON blocks in English (the JSON keys/values stay English), but all conversational text must be in Tagalog.
- Use Tagalog for greetings, explanations, confirmations, health advice, and all other text.`,
  bicolano: `

LANGUAGE INSTRUCTION:
You MUST respond in BICOLANO (Bikol Naga dialect) for ALL your messages. Use natural, conversational Bicolano as spoken in Naga City.
Examples:
- Instead of "Hello! How can I help you?" say "Kumusta! Paano taka matatabangan?"
- Instead of "I'd be happy to help you book an appointment" say "Maugma akong makakatabang saimo sa pagpa-book nin appointment mo"
- Instead of "What can I do for you today?" say "Ano an magigibo ko para saimo ngunyan?"
- Keep intent JSON blocks in English (the JSON keys/values stay English), but all conversational text must be in Bicolano.
- Use Bicolano Naga dialect for greetings, explanations, confirmations, health advice, and all other text.
- Common Bicolano words: tabang (help), marhay (good), ika/saimo (you), ako (I), ngunyan (now/today), digdi (here), duman (there), maray (nice/good), salamat (thanks).`,
};

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
  private currentLanguage: AppLanguage = 'english';

  constructor() {
    this.initializeConversation();
  }

  // Set the active language for AI responses
  setLanguage(language: AppLanguage): void {
    this.currentLanguage = language;
    // Rebuild system prompt with new language
    if (this.conversationHistory.length > 0 && this.conversationHistory[0].role === 'system') {
      this.conversationHistory[0].content = this.buildSystemPrompt();
    }
  }

  getLanguage(): AppLanguage {
    return this.currentLanguage;
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

    return ARAMON_SYSTEM_PROMPT + userContext + LANGUAGE_PROMPTS[this.currentLanguage];
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
      const yakapOpenMsg = {
        english: 'Great! Let me open the Yakap application form for you. 📝',
        tagalog: 'Ayos! Bubuksan ko ang Yakap application form para sa iyo. 📝',
        bicolano: 'Maray! Bubukasan ko an Yakap application form para saimo. 📝',
      };
      return {
        message: yakapOpenMsg[this.currentLanguage],
        action: {
          type: 'NAVIGATE',
          data: { screen: 'YakapForm' },
        },
      };
    }
    
    if (lowerMessage === 'check_yakap_status' || lowerMessage === 'view_yakap_status') {
      return this.handleYakapStatus("Check my Yakap status");
    }

    // Handle Pregnancy Profile quick replies
    if (lowerMessage === 'start_pregnancy_profile' || lowerMessage === 'open pregnancy profile') {
      return this.handlePregnancyProfile(userMessage);
    }

    if (lowerMessage === 'view_pregnancy_profiles' || lowerMessage === 'my pregnancy profiles') {
      const msg = {
        english: 'Opening your pregnancy profiles! 🤰',
        tagalog: 'Binubuksan ang iyong mga pregnancy profile! 🤰',
        bicolano: 'Binubukasan an saimong mga pregnancy profile! 🤰',
      };
      return {
        message: msg[this.currentLanguage],
        action: {
          type: 'NAVIGATE',
          data: { screen: 'PregnancyProfiles' },
        },
      };
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

      // Check for Pregnancy Profile keywords before going to AI
      if (this.isPregnancyProfileRelated(userMessage)) {
        return this.handlePregnancyProfile(userMessage);
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
            return this.handleFindFacilities(message, data);

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

          case 'GET_LOCATION':
            return this.handleGetLocation(message);

          case 'PREGNANCY_PROFILE':
            return this.handlePregnancyProfile(message);
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

  // Async facility search for booking — now includes service classification context
  private handleFacilitySearchAsync(reason: string, message?: string): AramonResponse {
    const classification = classifyServiceNeed(reason);
    const serviceLabel = classification.serviceType !== 'general'
      ? ` for **${classification.label}**`
      : '';

    return {
      message:
        message ||
        `I'd be happy to help you book an appointment${serviceLabel}! Let me find facilities that offer this service...`,
      inlineUI: {
        type: 'QUICK_REPLIES',
        options: [
          { id: 'loading', label: '⏳ Finding matching facilities...', value: 'loading' },
        ],
      },
      action: {
        type: 'BOOK_APPOINTMENT',
        data: { reason, step: 'SELECT_FACILITY' },
      },
    };
  }

  // Called by UI after async facility fetch — now service-aware
  async getFacilitiesForBooking(
    reason: string,
    userLocation?: UserLocation | null
  ): Promise<{
    facilities: FacilityWithDistance[];
    classification: ServiceClassification;
    noMatch: boolean;
  }> {
    const result = await facilityService.findFacilitiesForService(reason, userLocation);

    return {
      facilities: result.facilities.slice(0, 5),
      classification: result.classification,
      noMatch: result.noMatch,
    };
  }

  // Handle facility selection - now shows date picker for any date
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

    // Get next 30 days for date selection (no longer fetching from DB)
    const dates = appointmentServiceDB.getAvailableDates(30);

    // Add to conversation
    this.conversationHistory.push({
      id: Date.now().toString(),
      role: 'assistant',
      content: `Great choice! ${facility.name}. When would you like to request your appointment?`,
      timestamp: new Date(),
    });

    return {
      message: `Great choice! **${facility.name}** 🏥\n\nWhen would you like to request your appointment?`,
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

  // Handle date selection - now shows preferred time slots
  handleDateSelection(date: string): AramonResponse {
    const state = this.stateManager.getState();

    this.stateManager.setState({
      selectedDate: date,
      bookingData: {
        ...state.bookingData,
        date,
        step: 'SELECT_TIME',
      },
    });

    // Get standard time slots (not from DB)
    const timeSlots = appointmentServiceDB.getPreferredTimeSlots();

    const formattedDate = new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });

    this.conversationHistory.push({
      id: Date.now().toString(),
      role: 'assistant',
      content: `What time would you prefer for ${formattedDate}?`,
      timestamp: new Date(),
    });

    return {
      message: `What time would you prefer for **${formattedDate}**?`,
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
  // Handle time selection - stores preferred time
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
        step: 'CONFIRM',
      },
    });

    this.conversationHistory.push({
      id: Date.now().toString(),
      role: 'assistant',
      content: `Perfect! Here's your appointment request summary. Please confirm:`,
      timestamp: new Date(),
    });

    return {
      message: `Perfect! Here's your appointment request:`,
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

  // Confirm booking - submits appointment REQUEST (pending approval)
  async confirmBooking(): Promise<AramonResponse> {
    const state = this.stateManager.getState();
    const summary = state.pendingConfirmation;

    if (!summary) {
      return { message: 'No pending appointment to confirm. Please start over.' };
    }

    // Submit the appointment request (status will be 'pending')
    const result = await appointmentServiceDB.requestAppointment(
      summary.facilityId,
      summary.date,
      summary.time,
      summary.reason,
      undefined // notes
    );

    if (!result.success) {
      return {
        message: `❌ ${result.error || 'Failed to submit appointment request'}. Please try again.`,
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
      content: `Your appointment request has been submitted!`,
      timestamp: new Date(),
    });

    return {
      message: `⏳ **Your appointment request has been submitted!**\n\n📍 ${summary.facilityName}\n📅 ${formattedDate}\n⏰ ${summary.time}\n\n**Status:** Pending Approval\n\nThe health facility will review your request and confirm the appointment. You'll be notified once it's approved.\n\nIs there anything else I can help you with?`,
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

  private handleFindFacilities(
    message: string,
    data: Record<string, unknown>
  ): AramonResponse {
    const query = (data.query as string) || '';
    const service = data.service as string | undefined;
    const searchTerm = query || service || '';

    // Return an action so HomeScreen can fetch GPS first, then search
    return {
      message: message || '📍 Let me find health facilities near you...',
      inlineUI: {
        type: 'QUICK_REPLIES',
        options: [
          { id: 'loading', label: '⏳ Finding nearby facilities...', value: 'loading' },
        ],
      },
      action: {
        type: 'FIND_FACILITIES',
        data: { query: searchTerm, service: searchTerm || undefined },
      },
    };
  }

  // Called by HomeScreen after GPS is fetched — searches with location
  async getFacilitiesForSearch(
    searchTerm: string,
    userLocation?: UserLocation | null
  ): Promise<{
    facilities: FacilityWithDistance[];
    classification: ServiceClassification | null;
    noMatch: boolean;
    isFiltered: boolean; // true when a specific service was searched
  }> {
    if (searchTerm) {
      const result = await facilityService.findFacilitiesForService(searchTerm, userLocation);
      return {
        facilities: result.facilities.slice(0, 5),
        classification: result.classification,
        noMatch: result.noMatch,
        isFiltered: true,
      };
    }

    // No specific query — show all facilities sorted by distance
    const facilities = await facilityService.getAllFacilitiesWithDistance(userLocation);
    return {
      facilities: facilities.slice(0, 5),
      classification: null,
      noMatch: false,
      isFiltered: false,
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
          "You don't have any upcoming appointments. Would you like to request one?",
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
      status: apt.status, // Status types now match between DB and app
      createdAt: new Date(apt.created_at),
    }));

    // Count booked vs completed appointments
    const bookedCount = appointments.filter(a => a.status === 'booked').length;
    const completedCount = appointments.filter(a => a.status === 'completed').length;

    let statusMessage = `Here are your appointments:`;
    if (bookedCount > 0 && completedCount > 0) {
      statusMessage = `Here are your appointments (${bookedCount} upcoming, ${completedCount} completed):`;
    } else if (bookedCount > 0) {
      statusMessage = `Here are your upcoming appointments:`;
    } else if (completedCount > 0) {
      statusMessage = `Here are your completed appointments:`;
    }

    return {
      message: statusMessage,
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
      status: apt.status,
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

  private isPregnancyProfileRelated(message: string): boolean {
    const keywords = [
      'pregnancy profile',
      'pregnancy profiling',
      'prenatal profile',
      'prenatal form',
      'maternal profile',
      'pregnancy form',
      'pregnancy record',
      'fill out pregnancy',
      'pregnancy history form',
      'prenatal record',
      'pregnancy assessment',
      'maternal health form',
      'maternity profile',
    ];

    const lowerMessage = message.toLowerCase();
    return keywords.some((keyword) => lowerMessage.includes(keyword));
  }

  private handlePregnancyProfile(message: string): AramonResponse {
    const lang = this.currentLanguage;

    // -- Localized strings ------------------------------------------------
    const i18n = {
      english: {
        loginRequired: `To access the Pregnancy Profiling form, you'll need to log in first. This ensures your health records are properly secured! 🔐`,
        loginLabel: '🔑 Login',
        registerLabel: '📝 Register',
        staffMessage: `As a City Health staff member, you can manage pregnancy profiles for all residents. 🏥\n\nWould you like to:\n• **Search** for a specific resident's profile\n• **Create** a new pregnancy profile\n• **View all** pregnancy profiles`,
        searchLabel: '🔍 Search Profiles',
        newLabel: '📝 New Profile',
        viewAllLabel: '📋 View All',
        residentMessage: `I can help you with your **Pregnancy Profile**! 🤰\n\nThis form covers:\n• Pregnancy History (Gravida, Para, etc.)\n• Physical Examination & Vitals\n• Pediatric Assessment (0–24 & 0–60 months)\n• General Survey\n• NCD Risk Assessment\n• Lab Results\n\nWould you like to start filling it out?`,
        fillOutLabel: '📝 Fill Out Form',
        viewMineLabel: '📋 View My Profiles',
      },
      tagalog: {
        loginRequired: `Para ma-access ang Pregnancy Profiling form, kailangan mo munang mag-log in. Para masiguradong ligtas ang iyong health records! 🔐`,
        loginLabel: '🔑 Mag-login',
        registerLabel: '📝 Mag-register',
        staffMessage: `Bilang kawani ng City Health, maaari mong i-manage ang pregnancy profiles ng lahat ng residente. 🏥\n\nAno ang gusto mong gawin?\n• **Maghanap** ng profile ng isang residente\n• **Gumawa** ng bagong pregnancy profile\n• **Tingnan lahat** ng pregnancy profiles`,
        searchLabel: '🔍 Maghanap ng Profile',
        newLabel: '📝 Bagong Profile',
        viewAllLabel: '📋 Tingnan Lahat',
        residentMessage: `Matutulungan kita sa iyong **Pregnancy Profile**! 🤰\n\nSaklaw ng form na ito:\n• Kasaysayan ng Pagbubuntis (Gravida, Para, atbp.)\n• Physical Examination at Vitals\n• Pediatric Assessment (0–24 at 0–60 na buwan)\n• General Survey\n• NCD Risk Assessment\n• Lab Results\n\nGusto mo na bang simulan?`,
        fillOutLabel: '📝 Sagutan ang Form',
        viewMineLabel: '📋 Tingnan ang Aking Profiles',
      },
      bicolano: {
        loginRequired: `Para ma-access an Pregnancy Profiling form, kaipuhan mo munang mag-log in. Para segurado na ligtas an saimong health records! 🔐`,
        loginLabel: '🔑 Mag-login',
        registerLabel: '📝 Mag-register',
        staffMessage: `Bilang empleyado kan City Health, pwede mong i-manage an pregnancy profiles kan gabos na residente. 🏥\n\nAno an gusto mong gibuhon?\n• **Maghanap** nin profile nin sarong residente\n• **Maghimo** nin bagong pregnancy profile\n• **Hilingon gabos** na pregnancy profiles`,
        searchLabel: '🔍 Maghanap nin Profile',
        newLabel: '📝 Bagong Profile',
        viewAllLabel: '📋 Hilingon Gabos',
        residentMessage: `Matatabangan taka sa saimong **Pregnancy Profile**! 🤰\n\nSakop kan form na ini:\n• Kasaysayan nin Pagbados (Gravida, Para, etc.)\n• Physical Examination asin Vitals\n• Pediatric Assessment (0–24 asin 0–60 na bulan)\n• General Survey\n• NCD Risk Assessment\n• Lab Results\n\nGusto mo na bang magpoon?`,
        fillOutLabel: '📝 Simbagon an Form',
        viewMineLabel: '📋 Hilingon an Sakuyang Profiles',
      },
    };

    const t = i18n[lang];

    // Check if user is authenticated
    if (!authService.isAuthenticated()) {
      return {
        message: t.loginRequired,
        inlineUI: {
          type: 'QUICK_REPLIES',
          options: [
            { id: '1', label: t.loginLabel, value: 'login' },
            { id: '2', label: t.registerLabel, value: 'register' },
          ],
        },
      };
    }

    const isStaff = authService.getCurrentUser()?.user_role === 'staff';

    if (isStaff) {
      return {
        message: t.staffMessage,
        inlineUI: {
          type: 'QUICK_REPLIES',
          options: [
            { id: '1', label: t.searchLabel, value: 'view_pregnancy_profiles' },
            { id: '2', label: t.newLabel, value: 'start_pregnancy_profile' },
            { id: '3', label: t.viewAllLabel, value: 'view_pregnancy_profiles' },
          ],
        },
        action: {
          type: 'NAVIGATE',
          data: {
            screen: 'CityHealthSearch',
            trigger: 'view_pregnancy_profiles',
          },
        },
      };
    }

    return {
      message: t.residentMessage,
      inlineUI: {
        type: 'QUICK_REPLIES',
        options: [
          { id: '1', label: t.fillOutLabel, value: 'start_pregnancy_profile' },
          { id: '2', label: t.viewMineLabel, value: 'view_pregnancy_profiles' },
        ],
      },
      action: {
        type: 'NAVIGATE',
        data: {
          screen: 'PregnancyProfileForm',
          trigger: 'start_pregnancy_profile',
        },
      },
    };
  }

  private handleEmergency(message: string): AramonResponse {
    const emergencyMsg = {
      english: `🚨 **This sounds like a medical emergency.**\n\nPlease take immediate action:`,
      tagalog: `🚨 **Mukhang ito ay isang medical emergency.**\n\nMangyaring kumilos agad:`,
      bicolano: `🚨 **Garo ini sarong medical emergency.**\n\nPaki-aksyon tulos:`,
    };
    return {
      message: emergencyMsg[this.currentLanguage],
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
    const lang = this.currentLanguage;

    const i18n = {
      english: {
        loginRequired: `To apply for Yakap (PhilHealth Konsulta), you'll need to log in first. This ensures your application is properly linked to your account! 🔐`,
        loginLabel: '🔑 Login',
        registerLabel: '📝 Register',
        mainMessage: `Great! I can help you apply for **Yakap** (PhilHealth Konsulta Package). 🏥\n\nThis program provides you with:\n• Free primary care consultations\n• Basic laboratory tests\n• Essential medicines\n• Annual health assessments\n\nWould you like to start your application now?`,
        startLabel: '📝 Start Application',
        statusLabel: '📋 Check My Status',
        learnLabel: '❓ Learn More',
      },
      tagalog: {
        loginRequired: `Para mag-apply sa Yakap (PhilHealth Konsulta), kailangan mo munang mag-log in. Para ma-link nang maayos ang application mo sa iyong account! 🔐`,
        loginLabel: '🔑 Mag-login',
        registerLabel: '📝 Mag-register',
        mainMessage: `Ayos! Matutulungan kita mag-apply sa **Yakap** (PhilHealth Konsulta Package). 🏥\n\nAng programa na ito ay nagbibigay ng:\n• Libreng primary care consultations\n• Basic na laboratory tests\n• Mahahalagang gamot\n• Taunang health assessments\n\nGusto mo na bang simulan ang application?`,
        startLabel: '📝 Simulan ang Application',
        statusLabel: '📋 Tingnan ang Status',
        learnLabel: '❓ Alamin Pa',
      },
      bicolano: {
        loginRequired: `Para mag-apply sa Yakap (PhilHealth Konsulta), kaipuhan mo munang mag-log in. Para ma-link nin tama an application mo sa saimong account! 🔐`,
        loginLabel: '🔑 Mag-login',
        registerLabel: '📝 Mag-register',
        mainMessage: `Maray! Matatabangan taka mag-apply sa **Yakap** (PhilHealth Konsulta Package). 🏥\n\nAn programa na ini nagtatao nin:\n• Libreng primary care consultations\n• Basic na laboratory tests\n• Importanteng mga bulong\n• Taunang health assessments\n\nGusto mo na bang magpoon sa application?`,
        startLabel: '📝 Magpoon nin Application',
        statusLabel: '📋 Hilingon an Status',
        learnLabel: '❓ Aramon Pa',
      },
    };

    const t = i18n[lang];

    // Check if user is authenticated
    if (!authService.isAuthenticated()) {
      return {
        message: t.loginRequired,
        inlineUI: {
          type: 'QUICK_REPLIES',
          options: [
            { id: '1', label: t.loginLabel, value: 'login' },
            { id: '2', label: t.registerLabel, value: 'register' },
          ],
        },
      };
    }

    return {
      message: t.mainMessage,
      inlineUI: {
        type: 'QUICK_REPLIES',
        options: [
          { id: '1', label: t.startLabel, value: 'start_yakap' },
          { id: '2', label: t.statusLabel, value: 'check_yakap_status' },
          { id: '3', label: t.learnLabel, value: 'yakap_info' },
        ],
      },
      action: {
        type: 'NAVIGATE',
        data: {
          screen: 'YakapForm',
          trigger: 'start_yakap',
        },
      },
    };
  }

  private async handleYakapStatus(message: string): Promise<AramonResponse> {
    const lang = this.currentLanguage;

    const i18n = {
      english: {
        loginRequired: `To check your Yakap application status, please log in first! 🔐`,
        loginLabel: '🔑 Login',
        registerLabel: '📝 Register',
        noProfile: `I couldn't find your profile. Please try logging in again.`,
        statusHeader: `**Yakap Application Status**`,
        statusLabel: 'Status',
        appliedLabel: 'Applied',
        membershipLabel: 'Membership',
        remarksLabel: 'Remarks',
        returnedMsg: `\nYour application has been returned for revision. Would you like to update it?`,
        updateLabel: '📝 Update Application',
        helpLabel: '❓ Need Help',
        backLabel: '🏠 Back to Menu',
        noAppMsg: `You don't have a Yakap application yet. Would you like to apply now? 📝\n\nYakap (PhilHealth Konsulta) provides free primary care consultations, basic lab tests, and essential medicines.`,
        applyLabel: '📝 Apply Now',
        learnLabel: '❓ Learn More',
        errorMsg: `I had trouble checking your application status. Please try again later.`,
      },
      tagalog: {
        loginRequired: `Para makita ang status ng Yakap application mo, mag-log in muna! 🔐`,
        loginLabel: '🔑 Mag-login',
        registerLabel: '📝 Mag-register',
        noProfile: `Hindi ko mahanap ang profile mo. Subukan mong mag-log in ulit.`,
        statusHeader: `**Status ng Yakap Application**`,
        statusLabel: 'Status',
        appliedLabel: 'Nag-apply',
        membershipLabel: 'Uri ng Membership',
        remarksLabel: 'Mga Paalala',
        returnedMsg: `\nAng application mo ay ibinalik para sa rebisyon. Gusto mo bang i-update?`,
        updateLabel: '📝 I-update ang Application',
        helpLabel: '❓ Kailangan ng Tulong',
        backLabel: '🏠 Bumalik sa Menu',
        noAppMsg: `Wala ka pang Yakap application. Gusto mo bang mag-apply ngayon? 📝\n\nAng Yakap (PhilHealth Konsulta) ay nagbibigay ng libreng primary care consultations, basic na lab tests, at mahahalagang gamot.`,
        applyLabel: '📝 Mag-apply Ngayon',
        learnLabel: '❓ Alamin Pa',
        errorMsg: `Nagkaproblema sa pag-check ng status ng application mo. Subukan ulit mamaya.`,
      },
      bicolano: {
        loginRequired: `Para mahiling an status kan Yakap application mo, mag-log in muna! 🔐`,
        loginLabel: '🔑 Mag-login',
        registerLabel: '📝 Mag-register',
        noProfile: `Dai ko makua an profile mo. Subukan mong mag-log in giraray.`,
        statusHeader: `**Status kan Yakap Application**`,
        statusLabel: 'Status',
        appliedLabel: 'Nag-apply',
        membershipLabel: 'Klase nin Membership',
        remarksLabel: 'Mga Paisi',
        returnedMsg: `\nAn application mo ibinalik para sa rebisyon. Gusto mo bang i-update?`,
        updateLabel: '📝 I-update an Application',
        helpLabel: '❓ Kaipuhan nin Tabang',
        backLabel: '🏠 Bumalik sa Menu',
        noAppMsg: `Wara ka pang Yakap application. Gusto mo bang mag-apply ngunyan? 📝\n\nAn Yakap (PhilHealth Konsulta) nagtatao nin libreng primary care consultations, basic na lab tests, asin importanteng mga bulong.`,
        applyLabel: '📝 Mag-apply Ngunyan',
        learnLabel: '❓ Aramon Pa',
        errorMsg: `Nagkaproblema sa pag-check kan status kan application mo. Subukan giraray mamaya.`,
      },
    };

    const t = i18n[lang];

    // Check if user is authenticated
    if (!authService.isAuthenticated()) {
      return {
        message: t.loginRequired,
        inlineUI: {
          type: 'QUICK_REPLIES',
          options: [
            { id: '1', label: t.loginLabel, value: 'login' },
            { id: '2', label: t.registerLabel, value: 'register' },
          ],
        },
      };
    }

    // Fetch actual status from yakapService
    const resident = authService.getCurrentResident();
    if (!resident) {
      return {
        message: t.noProfile,
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

        let statusMessage = `${statusEmoji} ${t.statusHeader}\n\n`;
        statusMessage += `• **${t.statusLabel}:** ${statusText}\n`;
        statusMessage += `• **${t.appliedLabel}:** ${new Date(app.applied_at).toLocaleDateString()}\n`;
        statusMessage += `• **${t.membershipLabel}:** ${app.membership_type}\n`;
        
        if (app.remarks) {
          statusMessage += `• **${t.remarksLabel}:** ${app.remarks}\n`;
        }

        if (app.status === 'returned') {
          return {
            message: statusMessage + t.returnedMsg,
            inlineUI: {
              type: 'QUICK_REPLIES',
              options: [
                { id: '1', label: t.updateLabel, value: 'start_yakap' },
                { id: '2', label: t.helpLabel, value: 'Help with Yakap application' },
              ],
            },
          };
        }

        return {
          message: statusMessage,
          inlineUI: {
            type: 'QUICK_REPLIES',
            options: [
              { id: '1', label: t.backLabel, value: 'What can you help me with?' },
            ],
          },
        };
      } else {
        // No application found
        return {
          message: t.noAppMsg,
          inlineUI: {
            type: 'QUICK_REPLIES',
            options: [
              { id: '1', label: t.applyLabel, value: 'start_yakap' },
              { id: '2', label: t.learnLabel, value: 'What is Yakap?' },
            ],
          },
        };
      }
    } catch (error) {
      console.error('Error fetching Yakap status:', error);
      return {
        message: t.errorMsg,
      };
    }
  }

  // ============================================================================
  // GET LOCATION HANDLER
  // Returns an action that HomeScreen will handle by fetching GPS
  // ============================================================================

  private handleGetLocation(message: string): AramonResponse {
    const locationMsg = {
      english: '📍 Let me find your current location...',
      tagalog: '📍 Hahanapin ko ang kasalukuyan mong lokasyon...',
      bicolano: '📍 Hahanapon ko an presente mong lokasyon...',
    };
    const loadingMsg = {
      english: '📍 Getting your location...',
      tagalog: '📍 Kinukuha ang lokasyon mo...',
      bicolano: '📍 Kinukua an lokasyon mo...',
    };
    return {
      message: message || locationMsg[this.currentLanguage],
      inlineUI: {
        type: 'QUICK_REPLIES',
        options: [
          { id: 'loading', label: loadingMsg[this.currentLanguage], value: 'loading' },
        ],
      },
      action: {
        type: 'GET_LOCATION',
        data: {},
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
  async getProactiveGreeting(): Promise<AramonResponse> {
    // Get user's name if logged in
    const resident = authService.getCurrentResident();
    const userName = resident?.full_name?.split(' ')[0] || ''; // First name only
    
    let message = userName 
      ? `Hello, ${userName}! 👋 I'm Aramon, your health assistant for Naga City.\n\n`
      : `Hello! 👋 I'm Aramon, your health assistant for Naga City.\n\n`;
    
    message += `I can help you with:\n• 📅 Booking appointments\n• 🏥 Finding health facilities\n• 💊 Health questions & tips\n• 📝 Yakap (PhilHealth Konsulta) application\n• 🤰 Pregnancy Profiling\n• 🚨 Emergency guidance`;

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
              status: apt.status,
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
          { id: '4', label: '🤰 Pregnancy Profile', value: 'pregnancy profile' },
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
