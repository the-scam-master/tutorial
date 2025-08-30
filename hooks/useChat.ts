import { useState, useEffect, useCallback, useRef } from 'react';
import { Message, Note } from '@/types';
import { StorageService } from '@/services/storage';
import { AIService } from '@/services/ai';

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);
  const [apiKeySet, setApiKeySet] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    loadMessages();
    initializeSession();
    checkApiKey();

    return () => {
      isMounted.current = false;
    };
  }, []);

  const checkApiKey = async () => {
    try {
      const apiKey = await StorageService.getApiKey();
      if (isMounted.current) {
        setApiKeySet(!!apiKey);
      }
    } catch (error) {
      console.error('Error checking API key:', error);
    }
  };

  const loadMessages = async () => {
    try {
      const savedMessages = await StorageService.getMessages();
      if (isMounted.current) {
        setMessages(savedMessages);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const initializeSession = async () => {
    try {
      let session = await StorageService.getCurrentSession();
      if (!session) {
        session = await StorageService.startSession();
      }
      if (isMounted.current) {
        setCurrentSession(session);
      }
    } catch (error) {
      console.error('Error initializing session:', error);
    }
  };

  const setApiKey = async (apiKey: string) => {
    try {
      await StorageService.setApiKey(apiKey);
      if (isMounted.current) {
        setApiKeySet(true);
      }
    } catch (error) {
      console.error('Error setting API key:', error);
    }
  };

  const sendMessage = useCallback(async (content: string, quickAction?: string) => {
    if (!content.trim() || !isMounted.current) return;

    if (!apiKeySet) {
      return;
    }

    setLoading(true);
    
    try {
      // Create user message
      const userMessage: Message = {
        id: Date.now().toString(),
        content: content.trim(),
        role: 'user',
        timestamp: new Date(),
      };

      // Add user message immediately
      const newMessages = [...messages, userMessage];
      if (isMounted.current) {
        setMessages(newMessages);
      }

      // Generate AI response
      const conversationHistory = newMessages.slice(-10); // Last 10 messages for context
      const aiResponse = await AIService.generateResponse(
        conversationHistory.map(m => ({ role: m.role, content: m.content })),
        quickAction
      );

      if (!isMounted.current) return;

      // Create AI message
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        role: 'assistant',
        timestamp: new Date(),
      };

      // Extract notes from AI response
      const extractedPoints = AIService.extractKeyPoints(aiResponse);
      if (extractedPoints.length > 0) {
        aiMessage.extractedNotes = extractedPoints;
        
        // Auto-save as notes
        const topic = AIService.extractTopic(content);
        for (const point of extractedPoints) {
          const note: Note = {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            content: point,
            topic,
            timestamp: new Date(),
            source: 'auto',
            chatMessageId: aiMessage.id,
          };
          await StorageService.addNote(note);
        }
      }

      // Update messages
      const finalMessages = [...newMessages, aiMessage];
      if (isMounted.current) {
        setMessages(finalMessages);
        await StorageService.saveMessages(finalMessages);
      }

      // Update session analytics
      const session = await StorageService.getCurrentSession();
      if (session) {
        session.messageCount += 2; // User + AI message
        const topic = AIService.extractTopic(content);
        if (!session.topics.includes(topic)) {
          session.topics.push(topic);
        }
      }

    } catch (error) {
      console.error('Error sending message:', error);
      if (!isMounted.current) return;
      
      // Add error message
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: 'Sorry, I encountered an error. Please try again.',
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [messages, apiKeySet]);

  const saveMessageAsNote = async (messageId: string) => {
    try {
      const message = messages.find(m => m.id === messageId);
      if (!message) return;

      const note: Note = {
        id: `note-${Date.now()}`,
        content: message.content,
        topic: AIService.extractTopic(message.content),
        timestamp: new Date(),
        source: 'manual',
        chatMessageId: messageId,
      };

      await StorageService.addNote(note);
    } catch (error) {
      console.error('Error saving message as note:', error);
    }
  };

  const clearChat = async () => {
    try {
      await StorageService.endSession();
      await StorageService.clearConversationMemory();
      if (isMounted.current) {
        setMessages([]);
      }
      await StorageService.saveMessages([]);
      await initializeSession();
    } catch (error) {
      console.error('Error clearing chat:', error);
    }
  };

  const startNewSession = async () => {
    try {
      await StorageService.endSession();
      if (isMounted.current) {
        setMessages([]);
      }
      await StorageService.saveMessages([]);
      await initializeSession();
    } catch (error) {
      console.error('Error starting new session:', error);
    }
  };

  return {
    messages,
    loading,
    apiKeySet,
    sendMessage,
    saveMessageAsNote,
    clearChat,
    startNewSession,
    setApiKey,
  };
};