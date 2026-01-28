import Groq from "groq-sdk";
import { GROQ_API_KEY } from "@env";

// Initialize Groq client with API key from .env
const groq = new Groq({
  apiKey: GROQ_API_KEY,
  dangerouslyAllowBrowser: true, // Enable for React Native
});

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}


const ARAMON_SYSTEM_PROMPT = `You are Aramon AI, an integrated conversational AI health assistant designed for community health support in Naga City Bicol , The Philippines. Your role is to:

1. **Answer basic health inquiries** about:
   - Symptoms and their possible causes
   - Disease prevention methods
   - Maternal care guidance
   - Elderly care support

2. **Provide vaccination reminders and health advisories**:
   - Remind users about scheduled vaccinations
   - Share important health advisories and alerts
   - Provide preventive health information

3. **Guide users to the nearest appropriate health facility**:
   - Recommend suitable health facilities based on the user's needs
   - Provide information about services available at different facilities
   - Help users understand when to visit a health center vs. a hospital

4. **Use localized language support for inclusivity**:
   - Be culturally sensitive and respectful
   - Use simple, clear language that's easy to understand
   - Be supportive and empathetic

**IMPORTANT DISCLAIMER**: You complement health workers—you do NOT replace medical professionals. Always remind users to:
- Seek professional medical help for serious conditions
- Visit a healthcare facility if symptoms worsen
- Call emergency services (911) for life-threatening situations

**Communication Style**:
- Be warm, friendly, and supportive
- Use simple, non-technical language when possible
- Ask clarifying questions when needed
- Show empathy and understanding
- Provide actionable advice
- Always prioritize user safety

Remember: You are a helpful assistant, not a replacement for professional medical care.`;

export class AramonAI {
  private conversationHistory: Message[] = [];

  constructor() {
    // Initialize with system prompt
    this.conversationHistory.push({
      id: "system",
      role: "system",
      content: ARAMON_SYSTEM_PROMPT,
      timestamp: new Date(),
    });
  }

  /**
   * Send a message to Aramon AI and get a response
   */
  async sendMessage(userMessage: string): Promise<string> {
    // Add user message to history
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: userMessage,
      timestamp: new Date(),
    };
    this.conversationHistory.push(userMsg);

    try {
      // Call Groq API
      const chatCompletion = await groq.chat.completions.create({
        messages: this.conversationHistory.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        model: "llama-3.3-70b-versatile", // Using Groq's fast model
        temperature: 0.7,
        max_tokens: 1024,
        top_p: 1,
        stream: false,
      });

      const assistantMessage =
        chatCompletion.choices[0]?.message?.content ||
        "I apologize, but I couldn't process that request. Please try again.";

      // Add assistant response to history
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: assistantMessage,
        timestamp: new Date(),
      };
      this.conversationHistory.push(assistantMsg);

      return assistantMessage;
    } catch (error) {
      console.error("Aramon AI Error:", error);
      return "I'm experiencing technical difficulties. Please try again in a moment. If the issue persists, please contact a healthcare professional directly.";
    }
  }

  /**
   * Get conversation history
   */
  getHistory(): Message[] {
    return this.conversationHistory.filter((msg) => msg.role !== "system");
  }

  /**
   * Clear conversation and start fresh
   */
  clearHistory(): void {
    this.conversationHistory = [
      {
        id: "system",
        role: "system",
        content: ARAMON_SYSTEM_PROMPT,
        timestamp: new Date(),
      },
    ];
  }

  /**
   * Quick health tips for common scenarios
   */
  async getHealthTip(category: "symptoms" | "prevention" | "maternal" | "elderly"): Promise<string> {
    const prompts = {
      symptoms: "Give me a quick tip about common symptom recognition and when to seek medical help.",
      prevention: "Share a daily health prevention tip for staying healthy.",
      maternal: "Provide a helpful tip for maternal health and care during pregnancy.",
      elderly: "Share advice for elderly care and health maintenance.",
    };

    return this.sendMessage(prompts[category]);
  }
}

// Export singleton instance
export const aramonAI = new AramonAI();
