import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, FlatList, Text, SafeAreaView, TouchableOpacity } from 'react-native';
import { useChat } from '@/hooks/useChat';
import { ChatBubble } from '@/components/ChatBubble';
import { ChatInput } from '@/components/ChatInput';
import { QuickActionButtons } from '@/components/QuickActionButtons';
import { ApiKeyModal } from '@/components/ApiKeyModal';
import { MessageCircle, RotateCcw, Settings } from 'lucide-react-native';
import { Message } from '@/types';

export default function ChatScreen() {
  const { 
    messages, 
    loading, 
    apiKeySet, 
    sendMessage, 
    saveMessageAsNote, 
    clearChat, 
    startNewSession,
    setApiKey 
  } = useChat();
  const flatListRef = useRef<FlatList>(null);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);

  useEffect(() => {
    // Show API key modal if not set
    if (!apiKeySet) {
      setShowApiKeyModal(true);
    }
  }, [apiKeySet]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleQuickAction = (action: string, label: string) => {
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    if (lastUserMessage) {
      sendMessage(lastUserMessage.content, action);
    }
  };

  const handleApiKeySave = (apiKey: string) => {
    setApiKey(apiKey);
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <ChatBubble 
      message={item} 
      onSaveAsNote={saveMessageAsNote}
    />
  );

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <MessageCircle size={64} color="#9CA3AF" />
      <Text style={styles.emptyTitle}>Welcome to AI Tutor!</Text>
      <Text style={styles.emptySubtitle}>
        Ask me anything you'd like to learn about. I'll help you understand complex topics and automatically save important notes.
      </Text>
      {!apiKeySet && (
        <TouchableOpacity 
          style={styles.setupButton}
          onPress={() => setShowApiKeyModal(true)}
        >
          <Settings size={20} color="white" />
          <Text style={styles.setupButtonText}>Setup AI</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>AI Tutor</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            onPress={() => setShowApiKeyModal(true)} 
            style={styles.settingsButton}
          >
            <Settings size={20} color="#6B7280" />
          </TouchableOpacity>
          {messages.length > 0 && (
            <TouchableOpacity onPress={startNewSession} style={styles.clearButton}>
              <RotateCcw size={20} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        ListEmptyComponent={EmptyState}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={messages.length === 0 ? styles.emptyListContent : styles.listContent}
      />

      {messages.length > 0 && messages[messages.length - 1]?.role === 'user' && (
        <QuickActionButtons onAction={handleQuickAction} disabled={loading} />
      )}

      <ChatInput onSend={sendMessage} disabled={loading || !apiKeySet} />

      <ApiKeyModal
        visible={showApiKeyModal}
        onClose={() => setShowApiKeyModal(false)}
        onSave={handleApiKeySave}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsButton: {
    padding: 8,
    marginRight: 4,
  },
  clearButton: {
    padding: 8,
  },
  messagesList: {
    flex: 1,
    backgroundColor: '#FAFBFC',
  },
  listContent: {
    paddingVertical: 16,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  setupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  setupButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});