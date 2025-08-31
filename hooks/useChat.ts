import { useState, useEffect, useCallback, useRef } from 'react';
import { Message } from '@/types';
import { StorageService } from '@/services/storage';
import { AIService } from '@/services/ai';

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);
  const [apiKeySet, setApiKeySet] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const isMounted = useRef(true);
  const streamingMessageId = useRef<string | null>(null);
  const messagesRef = useRef<Message[]>([]);

  useEffect(() => {
    isMounted.current = true;
    loadMessages();
    initializeSession();
    checkApiKey();
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const checkApiKey = async () => {
    try {
      const apiKey = await StorageService.getApiKey();
      if (isMounted.current) {
        setApiKeySet(!!apiKey);
        if (!apiKey) {
          setShowApiKeyModal(true);
        }
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
        messagesRef.current = savedMessages;
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
      throw error;
    }
  };

  const sendMessage = useCallback(async (content: string, quickAction?: string) => {
    if (!content.trim() || !isMounted.current) return;
    if (!apiKeySet) {
      setShowApiKeyModal(true);
      return;
    }
    
    setLoading(true);
    
    try {
      const userMessage: Message = {
        id: Date.now().toString(),
        content: content.trim(),
        role: 'user',
        timestamp: new Date(),
      };
      
      const newMessages = [...messagesRef.current, userMessage];
      if (isMounted.current) {
        setMessages(newMessages);
        messagesRef.current = newMessages;
      }
      
      const aiMessageId = (Date.now() + 1).toString();
      streamingMessageId.current = aiMessageId;
      
      const aiMessage: Message = {
        id: aiMessageId,
        content: '',
        role: 'assistant',
        timestamp: new Date(),
      };
      
      const messagesWithPlaceholder = [...newMessages, aiMessage];
      if (isMounted.current) {
        setMessages(messagesWithPlaceholder);
        messagesRef.current = messagesWithPlaceholder;
      }
      
      let fullResponse = '';
      const conversationHistory = newMessages.slice(-10);
      
      await AIService.generateResponse(
        conversationHistory.map(m => ({ role: m.role, content: m.content })),
        quickAction,
        (streamText) => {
          fullResponse = streamText;
          if (isMounted.current && streamingMessageId.current === aiMessageId) {
            const updatedMessages = messagesRef.current.map(msg => 
              msg.id === aiMessageId ? { ...msg, content: streamText } : msg
            );
            setMessages(updatedMessages);
            messagesRef.current = updatedMessages;
          }
        }
      );
      
      if (isMounted.current) {
        await StorageService.saveMessages(messagesRef.current);
      }
      
      streamingMessageId.current = null;
      
      // Update session
      const session = await StorageService.getCurrentSession();
      if (session) {
        session.messageCount += 2;
        const topic = AIService.extractTopic(content);
        if (!session.topics.includes(topic)) {
          session.topics.push(topic);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      if (!isMounted.current) return;
      
      streamingMessageId.current = null;
      
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: 'Sorry, I encountered an error. Please try again.',
        role: 'assistant',
        timestamp: new Date(),
      };
      const updatedMessages = [...messagesRef.current, errorMessage];
      setMessages(updatedMessages);
      messagesRef.current = updatedMessages;
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [apiKeySet]);

  const clearChat = async () => {
    try {
      await StorageService.endSession();
      await StorageService.clearConversationMemory();
      if (isMounted.current) {
        setMessages([]);
        messagesRef.current = [];
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
        messagesRef.current = [];
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
    clearChat,
    startNewSession,
    setApiKey,
    showApiKeyModal,
    setShowApiKeyModal,
  };
};
