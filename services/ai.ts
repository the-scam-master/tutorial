import { GoogleGenerativeAI } from '@google/generative-ai';
import { StorageService } from './storage';

export class AIService {
  private static genAI: GoogleGenerativeAI | null = null;
  private static model: any = null;
  private static extractionModel: any = null;

  static async initializeAI(): Promise<boolean> {
    try {
      const apiKey = await StorageService.getApiKey();
      if (!apiKey) {
        return false;
      }
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: 'gemma-3-27b-it' });
      this.extractionModel = this.genAI.getGenerativeModel({ model: 'gemma-3n-e2b-it' });
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
      let systemPrompt = 'You are a helpful AI tutor. Provide clear, educational responses that help students learn effectively. Use markdown formatting to structure your responses with headings, bold text, lists, and code blocks when appropriate.';
      
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
      
      // Generate response using Gemma-3 with streaming
      const result = await this.model.generateContentStream(fullPrompt);
      
      let fullText = '';
      
      // Process the streaming response
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullText += chunkText;
        
        // Call the streaming callback if provided
        if (onStreamUpdate) {
          onStreamUpdate(fullText);
        }
      }
      
      // Update conversation memory
      await StorageService.updateConversationMemory([...messages, {
        role: 'assistant',
        content: fullText
      }]);
      
      return fullText;
    } catch (error) {
      console.error('Error generating AI response:', error);
      if (error.message?.includes('API_KEY')) {
        return 'Invalid API key. Please check your Google AI API key in the settings.';
      }
      return 'Sorry, I encountered an error. Please try again.';
    }
  }

  static async extractKeyPoints(content: string): Promise<string[]> {
    try {
      // Check if extraction model is initialized
      if (!this.extractionModel) {
        const initialized = await this.initializeAI();
        if (!initialized) {
          return [];
        }
      }

      // Create a prompt specifically for key point extraction
      const extractionPrompt = `
You are an expert at extracting key points from educational content. 
Analyze the following text and extract the 3-5 most important key points that would be useful for studying.

Requirements:
- Each key point should be a complete sentence or phrase
- Key points should capture the most important concepts
- Focus on definitions, important facts, and critical concepts
- Do not include examples or explanations in the key points
- Return only the key points as a numbered list (1, 2, 3...)

Text to analyze:
${content}

Key Points:
`;

      // Generate key points using the specialized extraction model
      const result = await this.extractionModel.generateContent(extractionPrompt);
      const responseText = result.response.text();
      
      // Parse the numbered list response
      const keyPoints: string[] = [];
      const lines = responseText.split('\n');
      
      for (const line of lines) {
        // Match numbered list items (1., 2., 3., etc.)
        const match = line.match(/^(\d+)\.\s*(.+)$/);
        if (match && match[2]) {
          keyPoints.push(match[2].trim());
        }
      }
      
      // If we didn't get a proper numbered list, try to extract sentences that look important
      if (keyPoints.length === 0) {
        const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 15);
        const keywords = [
          'important', 'key', 'essential', 'critical', 'significant', 
          'remember', 'note', 'concept', 'principle', 'rule', 'definition',
          'must', 'should', 'always', 'never', 'crucial', 'vital'
        ];
        
        sentences.forEach(sentence => {
          const trimmed = sentence.trim();
          const hasKeyword = keywords.some(keyword => 
            trimmed.toLowerCase().includes(keyword)
          );
          
          if (hasKeyword && keyPoints.length < 5) {
            keyPoints.push(trimmed);
          }
        });
      }
      
      return keyPoints.slice(0, 5); // Limit to 5 key points
    } catch (error) {
      console.error('Error extracting key points:', error);
      return [];
    }
  }

  static extractTopic(content: string): string {
    // Enhanced topic extraction
    const words = content.toLowerCase().split(/\s+/);
    const stopWords = ['the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but', 'can', 'you', 'how', 'what', 'why', 'when', 'where', 'to', 'of', 'in', 'for', 'with', 'about'];
    const meaningfulWords = words.filter(word => 
      word.length > 3 && !stopWords.includes(word)
    );
    
    // Count word frequency
    const wordFrequency: Record<string, number> = {};
    meaningfulWords.forEach(word => {
      wordFrequency[word] = (wordFrequency[word] || 0) + 1;
    });
    
    // Get the most frequent words
    const sortedWords = Object.entries(wordFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([word]) => word);
    
    return sortedWords.join(' ') || 'General Discussion';
  }
}
