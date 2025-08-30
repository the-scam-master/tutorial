import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Message } from '@/types';
import { User, Bot, BookmarkPlus } from 'lucide-react-native';

interface ChatBubbleProps {
  message: Message;
  onSaveAsNote?: (messageId: string) => void;
}

// Simple markdown parser for basic formatting
const parseMarkdown = (text: string) => {
  return text
    // Bold text
    .replace(/\*\*(.*?)\*\*/g, '•$1•')
    .replace(/__(.*?)__/g, '•$1•')
    // Italic text
    .replace(/\*(.*?)\*/g, '_$1_')
    .replace(/_(.*?)_/g, '_$1_')
    // Headers
    .replace(/^### (.*$)/gm, '📝 $1')
    .replace(/^## (.*$)/gm, '📋 $1')
    .replace(/^# (.*$)/gm, '📌 $1')
    // Code blocks
    .replace(/```(.*?)```/gs, '💻 $1 💻')
    .replace(/`(.*?)`/g, '⚡$1⚡')
    // Lists
    .replace(/^- (.*$)/gm, '• $1')
    .replace(/^\* (.*$)/gm, '• $1')
    .replace(/^\d+\. (.*$)/gm, '🔢 $1')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '🔗 $1')
    // Blockquotes
    .replace(/^> (.*$)/gm, '💬 $1');
};

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message, onSaveAsNote }) => {
  const isUser = message.role === 'user';

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.aiContainer]}>
      <View style={styles.messageWrapper}>
        <View style={styles.avatarSection}>
          <View style={[styles.avatar, isUser ? styles.userAvatar : styles.aiAvatar]}>
            {isUser ? (
              <User size={16} color="white" />
            ) : (
              <Bot size={16} color="white" />
            )}
          </View>
        </View>
        
        <View style={styles.messageSection}>
          <View style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}>
            <Text style={[styles.messageText, isUser ? styles.userText : styles.aiText]}>
              {parseMarkdown(message.content)}
            </Text>
            
            {message.extractedNotes && message.extractedNotes.length > 0 && (
              <View style={styles.extractedNotesSection}>
                <Text style={styles.extractedNotesTitle}>📝 Key Points:</Text>
                {message.extractedNotes.map((note, index) => (
                  <Text key={index} style={styles.extractedNote}>
                    • {note}
                  </Text>
                ))}
              </View>
            )}
          </View>
          
          {!isUser && onSaveAsNote && message.extractedNotes && message.extractedNotes.length > 0 && (
            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => onSaveAsNote(message.id)}
            >
              <BookmarkPlus size={16} color="#6B7280" />
              <Text style={styles.saveButtonText}>Save to Notes</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      <Text style={styles.timestamp}>
        {new Date(message.timestamp).toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        })}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    paddingHorizontal: 16,
  },
  userContainer: {
    alignItems: 'flex-end',
  },
  aiContainer: {
    alignItems: 'flex-start',
  },
  messageWrapper: {
    flexDirection: 'row',
    maxWidth: '85%',
    alignItems: 'flex-start',
  },
  avatarSection: {
    marginRight: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatar: {
    backgroundColor: '#3B82F6',
  },
  aiAvatar: {
    backgroundColor: '#8B5CF6',
  },
  messageSection: {
    flex: 1,
  },
  bubble: {
    padding: 12,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userBubble: {
    backgroundColor: '#3B82F6',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#FFFFFF',
  },
  aiText: {
    color: '#1F2937',
  },
  extractedNotesSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  extractedNotesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  extractedNote: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 4,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  saveButtonText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  timestamp: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
    marginHorizontal: 8,
  },
});
