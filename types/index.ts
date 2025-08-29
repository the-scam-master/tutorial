export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  extractedNotes?: string[];
}

export interface Note {
  id: string;
  content: string;
  topic: string;
  timestamp: Date;
  source?: 'auto' | 'manual';
  chatMessageId?: string;
}

export interface StudySession {
  id: string;
  startTime: Date;
  endTime?: Date;
  messageCount: number;
  topics: string[];
}

export interface Analytics {
  totalSessions: number;
  totalMessages: number;
  streakDays: number;
  lastStudyDate?: Date;
  topicFrequency: Record<string, number>;
  dailyActivity: Record<string, number>;
}