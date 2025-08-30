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
      // Create user message
      const userMessage: Message = {
        id: Date.now().toString(),
        content: content.trim(),
        role: 'user',
        timestamp: new Date(),
      };
      
      // Add user message immediately
      const newMessages = [...messagesRef.current, userMessage];
      if (isMounted.current) {
        setMessages(newMessages);
        messagesRef.current = newMessages;
      }
      
      // Create a placeholder AI message for streaming
      const aiMessageId = (Date.now() + 1).toString();
      streamingMessageId.current = aiMessageId;
      
      const aiMessage: Message = {
        id: aiMessageId,
        content: '',
        role: 'assistant',
        timestamp: new Date(),
      };
      
      // Add placeholder AI message
      const messagesWithPlaceholder = [...newMessages, aiMessage];
      if (isMounted.current) {
        setMessages(messagesWithPlaceholder);
        messagesRef.current = messagesWithPlaceholder;
      }
      
      // Generate AI response with streaming
      let fullResponse = '';
      const conversationHistory = newMessages.slice(-10); // Last 10 messages for context
      
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
      
      // Extract key points immediately after response
      let keyPoints: string[] = [];
      try {
        keyPoints = await AIService.extractKeyPoints(fullResponse);
        console.log('Extracted key points:', keyPoints);
      } catch (error) {
        console.error('Error extracting key points:', error);
        keyPoints = [];
      }
      
      // Update the AI message with extracted notes
      if (isMounted.current) {
        const finalMessages = messagesRef.current.map(msg => 
          msg.id === aiMessageId 
            ? { ...msg, extractedNotes: keyPoints } 
            : msg
        );
        setMessages(finalMessages);
        messagesRef.current = finalMessages;
        
        // Save to storage immediately
        await StorageService.saveMessages(finalMessages);
      }
      
      // Clear the streaming message ID
      streamingMessageId.current = null;
      
      // Update session analytics
      const session = await StorageService.getCurrentSession();
      if (session) {
        session.messageCount += 2; // User + AI message
        const topic = AIService.extractTopic(content);
        if (!session.topics.includes(topic)) {
          session.topics.push(topic);
        }
        await StorageService.updateSessionAnalytics(session);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      if (!isMounted.current) return;
      
      // Clear the streaming message ID
      streamingMessageId.current = null;
      
      // Add error message
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

  const saveMessageAsNote = async (messageId: string) => {
    try {
      const message = messagesRef.current.find(m => m.id === messageId);
      if (!message || !message.extractedNotes || message.extractedNotes.length === 0) return;
      
      // Create a single note with all key points
      const topic = AIService.extractTopic(message.content);
      const noteContent = message.extractedNotes.map((note, index) => `${index + 1}. ${note}`).join('\n\n');
      
      const noteData = {
        id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        content: noteContent,
        topic,
        timestamp: new Date().toISOString(),
        source: 'auto',
        chatMessageId: messageId,
      };
      
      // Save to AsyncStorage
      const notes = await StorageService.getNotes();
      notes.push(noteData);
      await StorageService.saveNotes(notes);
      
      console.log('Saved note:', noteData);
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
    saveMessageAsNote,
    clearChat,
    startNewSession,
    setApiKey,
    showApiKeyModal,
    setShowApiKeyModal,
  };
};
