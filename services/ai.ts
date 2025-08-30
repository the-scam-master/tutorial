import { GoogleGenerativeAI } from '@google/generative-ai';
import { StorageService } from './storage';

export class AIService {
  private static genAI: GoogleGenerativeAI | null = null;
  private static model: any = null;

  static async initializeAI(): Promise<boolean> {
    try {
      const apiKey = await StorageService.getApiKey();
      if (!apiKey) {
        return false;
      }

      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: 'gemma-3-27b-it' });
      return true;
    } catch (error) {
      console.error('Error initializing AI:', error);
      return false;
    }
  }

  static async generateResponse(
    messages: Array<{ role: string; content: string }>,
    quickAction?: string
  ): Promise<string> {
    try {
      // Check if AI is initialized
      if (!this.model) {
        const initialized = await this.initializeAI();
        if (!initialized) {
          return 'Please set your Google AI API key in the settings to start chatting.';
        }
      }

      // Get conversation memory
      const memory = await StorageService.getConversationMemory();
      
      // Prepare the conversation for the model
      let systemPrompt = 'You are a helpful AI tutor. Provide clear, educational responses that help students learn effectively.';
      
      // Add memory context if available
      if (memory.length > 0) {
        systemPrompt += '\n\nPrevious conversation context:\n' + 
          memory.map(m => `${m.role}: ${m.content}`).join('\n');
      }
      
      if (quickAction) {
        switch (quickAction) {
          case 'explain-simply':
            systemPrompt += '\n\nPlease explain this concept in simple terms that are easy to understand.';
            break;
          case 'give-examples':
            systemPrompt += '\n\nPlease provide practical examples to illustrate this concept.';
            break;
          case 'quiz-me':
            systemPrompt += '\n\nPlease create a quiz question or practice problem based on this topic.';
            break;
        }
      }

      // Format the current conversation
      const conversationText = messages.map(m => `${m.role}: ${m.content}`).join('\n');
      const fullPrompt = `${systemPrompt}\n\nCurrent conversation:\n${conversationText}\n\nassistant:`;

      // Generate response using Gemma-3
      const result = await this.model.generateContent(fullPrompt);
      const response = result.response;
      const text = response.text();

      // Update conversation memory
      await StorageService.updateConversationMemory([...messages, {
        role: 'assistant',
        content: text
      }]);

      return text;
    } catch (error) {
      console.error('Error generating AI response:', error);
      if (error.message?.includes('API_KEY')) {
        return 'Invalid API key. Please check your Google AI API key in the settings.';
      }
      return 'Sorry, I encountered an error. Please try again.';
    }
  }

  static extractKeyPoints(content: string): string[] {
    // Enhanced extraction logic
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 15);
    const keyPoints: string[] = [];

    sentences.forEach(sentence => {
      const trimmed = sentence.trim();
      // Look for educational indicators
      if (trimmed.includes('key') || 
          trimmed.includes('important') || 
          trimmed.includes('remember') ||
          trimmed.includes('concept') ||
          trimmed.includes('principle') ||
          trimmed.includes('rule') ||
          trimmed.length > 60) {
        keyPoints.push(trimmed);
      }
    });

    return keyPoints.slice(0, 3); // Limit to 3 key points
  }

  static extractTopic(content: string): string {
    // Enhanced topic extraction
    const words = content.toLowerCase().split(/\s+/);
    const stopWords = ['the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but', 'can', 'you', 'how', 'what', 'why', 'when', 'where'];
    const meaningfulWords = words.filter(word => 
      word.length > 3 && !stopWords.includes(word)
    );
    
    return meaningfulWords.slice(0, 2).join(' ') || 'General Discussion';
  }
}
