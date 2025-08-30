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
    quickAction?: string,
    onStreamUpdate?: (text: string) => void
  ): Promise<string> {
    try {
      if (!this.model) {
        const initialized = await this.initializeAI();
        if (!initialized) {
          return 'Please set your Google AI API key in the settings to start chatting.';
        }
      }
      
      const memory = await StorageService.getConversationMemory();
      let systemPrompt = 'You are a helpful AI tutor. Provide clear, educational responses that help students learn effectively. Use markdown formatting to structure your responses with headings, bold text, lists, and code blocks when appropriate.';
      
      if (memory.length > 0) {
        systemPrompt += '\n\nPrevious conversation context:\n' + 
          memory.map(m => `${m.role}: ${m.content}`).join('\n');
      }
      
      if (messages.length > 0) {
        systemPrompt += '\n\nCurrent conversation:\n' + 
          messages.map(m => `${m.role}: ${m.content}`).join('\n');
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
      
      const fullPrompt = `${systemPrompt}\n\nassistant:`;
      const result = await this.model.generateContentStream(fullPrompt);
      
      let fullText = '';
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullText += chunkText;
        
        if (onStreamUpdate) {
          onStreamUpdate(fullText);
        }
      }
      
      const updatedMemory = [...memory, ...messages, { role: 'assistant', content: fullText }];
      await StorageService.updateConversationMemory(updatedMemory);
      
      return fullText;
    } catch (error) {
      console.error('Error generating AI response:', error);
      if (error.message?.includes('API_KEY')) {
        return 'Invalid API key. Please check your Google AI API key in the settings.';
      }
      return 'Sorry, I encountered an error. Please try again.';
    }
  }
  
  static extractTopic(content: string): string {
    const words = content.toLowerCase().split(/\s+/);
    const stopWords = ['the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but', 'can', 'you', 'how', 'what', 'why', 'when', 'where', 'to', 'of', 'in', 'for', 'with', 'about'];
    const meaningfulWords = words.filter(word => 
      word.length > 3 && !stopWords.includes(word)
    );
    
    const wordFrequency: Record<string, number> = {};
    meaningfulWords.forEach(word => {
      wordFrequency[word] = (wordFrequency[word] || 0) + 1;
    });
    
    const sortedWords = Object.entries(wordFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([word]) => word);
    
    return sortedWords.join(' ') || 'General Discussion';
  }
}
