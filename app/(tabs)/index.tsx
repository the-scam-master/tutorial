import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, FlatList, Text, SafeAreaView, TouchableOpacity } from 'react-native';
import { useChat } from '@/hooks/useChat';
import { ChatBubble } from '@/components/ChatBubble';
import { ChatInput } from '@/components/ChatInput';
import { QuickActionButtons } from '@/components/QuickActionButtons';
import { MessageCircle, RotateCcw } from 'lucide-react-native';
import { Message } from '@/types';

export default function ChatScreen() {
  const { messages, loading, sendMessage, saveMessageAsNote, clearChat } = useChat();
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (messages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const handleQuickAction = (action: string, label: string) => {
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    if (lastUserMessage) {
      sendMessage(lastUserMessage.content, action);
    }
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
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>AI Tutor</Text>
        {messages.length > 0 && (
          <TouchableOpacity onPress={clearChat} style={styles.clearButton}>
            <RotateCcw size={20} color="#6B7280" />
          </TouchableOpacity>
        )}
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

      <ChatInput onSend={sendMessage} disabled={loading} />
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
  },
});