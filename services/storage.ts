import AsyncStorage from '@react-native-async-storage/async-storage';
import { Message, Note, StudySession, Analytics } from '@/types';

const KEYS = {
  MESSAGES: 'tutor_messages',
  NOTES: 'tutor_notes',
  SESSIONS: 'tutor_sessions',
  ANALYTICS: 'tutor_analytics',
  CURRENT_SESSION: 'tutor_current_session',
  API_KEY: 'tutor_api_key',
  CONVERSATION_MEMORY: 'tutor_conversation_memory',
};

export class StorageService {
  // API Key Management
  static async getApiKey(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(KEYS.API_KEY);
    } catch (error) {
      console.error('Error getting API key:', error);
      return null;
    }
  }

  static async setApiKey(apiKey: string): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.API_KEY, apiKey);
    } catch (error) {
      console.error('Error setting API key:', error);
      throw error;
    }
  }

  // Conversation Memory Management
  static async getConversationMemory(): Promise<Array<{ role: string; content: string }>> {
    try {
      const data = await AsyncStorage.getItem(KEYS.CONVERSATION_MEMORY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting conversation memory:', error);
      return [];
    }
  }

  static async updateConversationMemory(messages: Array<{ role: string; content: string }>): Promise<void> {
    try {
      // Keep only last 20 messages for memory efficiency
      const recentMessages = messages.slice(-20);
      await AsyncStorage.setItem(KEYS.CONVERSATION_MEMORY, JSON.stringify(recentMessages));
    } catch (error) {
      console.error('Error updating conversation memory:', error);
    }
  }

  static async clearConversationMemory(): Promise<void> {
    try {
      await AsyncStorage.removeItem(KEYS.CONVERSATION_MEMORY);
    } catch (error) {
      console.error('Error clearing conversation memory:', error);
    }
  }

  // Messages
  static async getMessages(): Promise<Message[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.MESSAGES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting messages:', error);
      return [];
    }
  }

  static async saveMessages(messages: Message[]): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.MESSAGES, JSON.stringify(messages));
    } catch (error) {
      console.error('Error saving messages:', error);
    }
  }

  // Notes
  static async getNotes(): Promise<Note[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.NOTES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting notes:', error);
      return [];
    }
  }

  static async saveNotes(notes: Note[]): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.NOTES, JSON.stringify(notes));
    } catch (error) {
      console.error('Error saving notes:', error);
    }
  }

  static async addNote(note: Note): Promise<void> {
    try {
      const notes = await this.getNotes();
      notes.push(note);
      await this.saveNotes(notes);
    } catch (error) {
      console.error('Error adding note:', error);
    }
  }

  static async updateNote(noteId: string, updates: Partial<Note>): Promise<void> {
    try {
      const notes = await this.getNotes();
      const index = notes.findIndex(n => n.id === noteId);
      if (index !== -1) {
        notes[index] = { ...notes[index], ...updates };
        await this.saveNotes(notes);
      }
    } catch (error) {
      console.error('Error updating note:', error);
    }
  }

  static async deleteNote(noteId: string): Promise<void> {
    try {
      const notes = await this.getNotes();
      const filtered = notes.filter(n => n.id !== noteId);
      await this.saveNotes(filtered);
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  }

  // Analytics
  static async getAnalytics(): Promise<Analytics> {
    try {
      const data = await AsyncStorage.getItem(KEYS.ANALYTICS);
      const defaultAnalytics: Analytics = {
        totalSessions: 0,
        totalMessages: 0,
        streakDays: 0,
        topicFrequency: {},
        dailyActivity: {},
      };
      
      if (!data) {
        await this.updateAnalytics(defaultAnalytics);
        return defaultAnalytics;
      }
      
      return JSON.parse(data);
    } catch (error) {
      console.error('Error getting analytics:', error);
      return {
        totalSessions: 0,
        totalMessages: 0,
        streakDays: 0,
        topicFrequency: {},
        dailyActivity: {},
      };
    }
  }

  static async updateAnalytics(updates: Partial<Analytics>): Promise<void> {
    try {
      const current = await this.getAnalytics();
      const updated = { ...current, ...updates };
      await AsyncStorage.setItem(KEYS.ANALYTICS, JSON.stringify(updated));
    } catch (error) {
      console.error('Error updating analytics:', error);
    }
  }

  // Study Sessions
  static async getCurrentSession(): Promise<StudySession | null> {
    try {
      const data = await AsyncStorage.getItem(KEYS.CURRENT_SESSION);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting current session:', error);
      return null;
    }
  }

  static async startSession(): Promise<StudySession> {
    try {
      const session: StudySession = {
        id: Date.now().toString(),
        startTime: new Date(),
        messageCount: 0,
        topics: [],
      };
      await AsyncStorage.setItem(KEYS.CURRENT_SESSION, JSON.stringify(session));
      return session;
    } catch (error) {
      console.error('Error starting session:', error);
      throw error;
    }
  }

  static async endSession(): Promise<void> {
    try {
      const session = await this.getCurrentSession();
      if (session) {
        session.endTime = new Date();
        
        // Save to sessions history
        const sessions = await this.getSessions();
        sessions.push(session);
        await AsyncStorage.setItem(KEYS.SESSIONS, JSON.stringify(sessions));
        
        // Clear current session
        await AsyncStorage.removeItem(KEYS.CURRENT_SESSION);
        
        // Update analytics
        await this.updateSessionAnalytics(session);
      }
    } catch (error) {
      console.error('Error ending session:', error);
    }
  }

  static async getSessions(): Promise<StudySession[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.SESSIONS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting sessions:', error);
      return [];
    }
  }

  static async updateSessionAnalytics(session: StudySession): Promise<void> {
    try {
      const analytics = await this.getAnalytics();
      const dateKey = new Date().toISOString().split('T')[0];
      
      // Update analytics
      analytics.totalSessions += 1;
      analytics.totalMessages += session.messageCount;
      analytics.lastStudyDate = new Date();
      analytics.dailyActivity[dateKey] = (analytics.dailyActivity[dateKey] || 0) + 1;
      
      // Update topic frequency
      session.topics.forEach(topic => {
        analytics.topicFrequency[topic] = (analytics.topicFrequency[topic] || 0) + 1;
      });
      
      // Calculate streak
      analytics.streakDays = this.calculateStreak(analytics.dailyActivity);
      
      await this.updateAnalytics(analytics);
    } catch (error) {
      console.error('Error updating session analytics:', error);
    }
  }

  private static calculateStreak(dailyActivity: Record<string, number>): number {
    const today = new Date();
    let streak = 0;
    
    // Only check the last 30 days to improve performance
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      
      if (dailyActivity[dateKey] > 0) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    
    return streak;
  }
}
