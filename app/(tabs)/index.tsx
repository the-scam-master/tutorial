import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, Text, SafeAreaView, TouchableOpacity, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import { useChat } from '@/hooks/useChat';
import { ChatBubble } from '@/components/ChatBubble';
import { ChatInput } from '@/components/ChatInput';
import { QuickActionButtons } from '@/components/QuickActionButtons';
import { ApiKeyModal } from '@/components/ApiKeyModal';
import { MessageCircle, RotateCcw, Settings, Sparkles } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function ChatScreen() {
  const { 
    messages, 
    loading, 
    apiKeySet, 
    sendMessage, 
    clearChat, 
    startNewSession,
    setApiKey,
    showApiKeyModal,
    setShowApiKeyModal
  } = useChat();
  const flatListRef = useRef<FlatList>(null);
  const [contentHeight, setContentHeight] = useState(0);
  const [listHeight, setListHeight] = useState(0);

  useEffect(() => {
    if (!apiKeySet) {
      setShowApiKeyModal(true);
    }
  }, [apiKeySet]);

  // Optimized scroll to bottom
  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      const timeout = setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [messages]);

  const handleQuickAction = useCallback((action: string, label: string) => {
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    if (lastUserMessage) {
      sendMessage(lastUserMessage.content, action);
    }
  }, [messages, sendMessage]);

  const handleApiKeySave = useCallback(async (apiKey: string) => {
    try {
      await setApiKey(apiKey);
      setShowApiKeyModal(false);
    } catch (error) {
      console.error('Failed to save API key:', error);
    }
  }, [setApiKey]);

  const renderMessage = useCallback(({ item }) => (
    <ChatBubble message={item} />
  ), []);

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Sparkles size={64} color="#D1D5DB" />
      </View>
      <Text style={styles.emptyTitle}>Welcome to AI Tutor!</Text>
      <Text style={styles.emptySubtitle}>
        Ask me anything you'd like to learn about. I'll help you understand complex topics with clear explanations.
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

  const handleContentSizeChange = useCallback((contentWidth, contentHeight) => {
    setContentHeight(contentHeight);
  }, []);

  const handleLayout = useCallback((event) => {
    const { height } = event.nativeEvent.layout;
    setListHeight(height);
  }, []);

  // Check if we need to scroll to bottom
  useEffect(() => {
    if (contentHeight > 0 && listHeight > 0 && contentHeight > listHeight) {
      flatListRef.current?.scrollToEnd({ animated: false });
    }
  }, [contentHeight, listHeight]);

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
      
      <View style={styles.messagesContainer}>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          ListEmptyComponent={EmptyState}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={messages.length === 0 ? styles.emptyListContent : styles.listContent}
          onContentSizeChange={handleContentSizeChange}
          onLayout={handleLayout}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
          initialNumToRender={10}
          getItemLayout={(data, index) => (
            { length: 100, offset: 100 * index, index }
          )}
        />
      </View>
      
      {messages.length > 0 && messages[messages.length - 1]?.role === 'user' && (
        <QuickActionButtons onAction={handleQuickAction} disabled={loading} />
      )}
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.inputContainer}
      >
        <ChatInput onSend={sendMessage} disabled={loading || !apiKeySet} />
      </KeyboardAvoidingView>
      
      <ApiKeyModal
        visible={showApiKeyModal}
        onClose={() => setShowApiKeyModal(false)}
        onSave={handleApiKeySave}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
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
  messagesContainer: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
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
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
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
    backgroundColor: '#6366F1',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
  },
  setupButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
});
