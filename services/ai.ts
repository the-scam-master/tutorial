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
      
      // Generate response using Gemma-3
      const result = await this.model.generateContent(fullPrompt);
      const response = result.response;
      
      // Get the full text response (not streaming for now due to compatibility issues)
      const fullText = response.text();
      
      // Simulate streaming by breaking the text into chunks and calling the callback
      if (onStreamUpdate) {
        const words = fullText.split(' ');
        let currentText = '';
        
        for (const word of words) {
          currentText += (currentText ? ' ' : '') + word;
          onStreamUpdate(currentText);
          
          // Add a small delay to simulate streaming
          await new Promise(resolve => setTimeout(resolve, 20));
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

  static extractKeyPoints(content: string): string[] {
    // Improved extraction logic
    const keyPoints: string[] = [];
    
    // Split content into sections by headers
    const sections = content.split(/(?=#{1,6}\s)/);
    
    sections.forEach(section => {
      // Extract headers
      const headerMatch = section.match(/^(#{1,6})\s+(.+)$/m);
      const header = headerMatch ? headerMatch[2] : '';
      
      // Extract lists (both ordered and unordered)
      const listItems = section.match(/^[\s]*[-*+]\s+(.+)$/gm) || 
                       section.match(/^[\s]*\d+\.\s+(.+)$/gm) || [];
      
      // Extract bold or emphasized text
      const boldText = section.match(/\*\*(.+?)\*\*/g) || 
                      section.match(/\_\_(.+?)\_\_/g) || 
                      section.match(/\*(.+?)\*/g) || 
                      section.match(/\_(.+?)\_/g) || [];
      
      // Extract code blocks
      const codeBlocks = section.match(/```[\s\S]*?```/g) || [];
      
      // Extract blockquotes
      const blockquotes = section.match(/^>\s+(.+)$/gm) || [];
      
      // Add header as a key point if it exists
      if (header && header.length > 10) {
        keyPoints.push(header);
      }
      
      // Add list items as key points
      listItems.forEach(item => {
        const cleanedItem = item.replace(/^[\s]*[-*+\d.]\s+/, '');
        if (cleanedItem.length > 10 && cleanedItem.length < 100) {
          keyPoints.push(cleanedItem);
        }
      });
      
      // Add bold text as key points
      boldText.forEach(text => {
        const cleanedText = text.replace(/\*\*|\_\_|\*|\_/g, '');
        if (cleanedText.length > 10 && cleanedText.length < 100) {
          keyPoints.push(cleanedText);
        }
      });
      
      // Add code blocks as key points
      codeBlocks.forEach(block => {
        const cleanedBlock = block.replace(/```[\s]*|```/g, '');
        if (cleanedBlock.length > 10 && cleanedBlock.length < 100) {
          keyPoints.push(`Code: ${cleanedBlock}`);
        }
      });
      
      // Add blockquotes as key points
      blockquotes.forEach(quote => {
        const cleanedQuote = quote.replace(/^>\s+/, '');
        if (cleanedQuote.length > 10 && cleanedQuote.length < 100) {
          keyPoints.push(`Quote: ${cleanedQuote}`);
        }
      });
    });
    
    // If no structured content found, extract sentences with keywords
    if (keyPoints.length === 0) {
      const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 15);
      const keywords = [
        'important', 'key', 'essential', 'critical', 'significant', 
        'remember', 'note', 'concept', 'principle', 'rule', 'definition',
        'must', 'should', 'always', 'never'
      ];
      
      sentences.forEach(sentence => {
        const trimmed = sentence.trim();
        const hasKeyword = keywords.some(keyword => 
          trimmed.toLowerCase().includes(keyword)
        );
        
        if (hasKeyword || trimmed.length > 60) {
          keyPoints.push(trimmed);
        }
      });
    }
    
    // Remove duplicates and limit to 5 key points
    const uniquePoints = [...new Set(keyPoints)];
    return uniquePoints.slice(0, 5);
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
