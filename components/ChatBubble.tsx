import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { Message } from '@/types';
import { User, Bot } from 'lucide-react-native';

interface ChatBubbleProps {
  message: Message;
}

const ChatBubble = memo(({ message }: ChatBubbleProps) => {
  const isUser = message.role === 'user';

  const markdownStyles = {
    body: {
      fontSize: 16,
      lineHeight: 24,
      color: isUser ? '#FFFFFF' : '#1F2937',
      margin: 0,
      padding: 0,
    },
    paragraph: {
      fontSize: 16,
      lineHeight: 24,
      color: isUser ? '#FFFFFF' : '#1F2937',
      marginBottom: 12,
      marginTop: 0,
    },
    strong: {
      fontWeight: '700',
      color: isUser ? '#FFFFFF' : '#1F2937',
    },
    em: {
      fontStyle: 'italic',
      color: isUser ? '#FFFFFF' : '#1F2937',
    },
    code_inline: {
      backgroundColor: isUser ? 'rgba(255,255,255,0.2)' : '#F3F4F6',
      color: isUser ? '#FFFFFF' : '#1F2937',
      padding: 4,
      borderRadius: 6,
      fontFamily: 'monospace',
      fontSize: 14,
    },
    code_block: {
      backgroundColor: isUser ? 'rgba(255,255,255,0.2)' : '#F3F4F6',
      color: isUser ? '#FFFFFF' : '#1F2937',
      padding: 16,
      borderRadius: 8,
      fontFamily: 'monospace',
      fontSize: 14,
      marginVertical: 12,
    },
    blockquote: {
      backgroundColor: isUser ? 'rgba(255,255,255,0.1)' : '#F9FAFB',
      borderLeftWidth: 4,
      borderLeftColor: isUser ? 'rgba(255,255,255,0.5)' : '#6366F1',
      paddingLeft: 16,
      marginVertical: 12,
      fontStyle: 'italic',
    },
    list_item: {
      fontSize: 16,
      lineHeight: 24,
      color: isUser ? '#FFFFFF' : '#1F2937',
      marginBottom: 8,
    },
    bullet_list: {
      marginBottom: 12,
    },
    ordered_list: {
      marginBottom: 12,
    },
    link: {
      color: isUser ? '#93C5FD' : '#6366F1',
      textDecorationLine: 'underline',
    },
    heading1: {
      fontSize: 24,
      fontWeight: '700',
      color: isUser ? '#FFFFFF' : '#1F2937',
      marginBottom: 12,
      marginTop: 12,
    },
    heading2: {
      fontSize: 20,
      fontWeight: '600',
      color: isUser ? '#FFFFFF' : '#1F2937',
      marginBottom: 8,
      marginTop: 8,
    },
    heading3: {
      fontSize: 18,
      fontWeight: '600',
      color: isUser ? '#FFFFFF' : '#1F2937',
      marginBottom: 6,
      marginTop: 6,
    },
    table: {
      borderWidth: 1,
      borderColor: isUser ? 'rgba(255,255,255,0.3)' : '#E5E7EB',
      marginVertical: 12,
    },
    table_header: {
      backgroundColor: isUser ? 'rgba(255,255,255,0.1)' : '#F3F4F6',
      fontWeight: '600',
    },
    table_cell: {
      borderWidth: 1,
      borderColor: isUser ? 'rgba(255,255,255,0.3)' : '#E5E7EB',
      padding: 8,
    },
  };

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
            <Markdown style={markdownStyles}>
              {message.content}
            </Markdown>
          </View>
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
});

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
    backgroundColor: '#6366F1',
  },
  aiAvatar: {
    backgroundColor: '#8B5CF6',
  },
  messageSection: {
    flex: 1,
  },
  bubble: {
    padding: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userBubble: {
    backgroundColor: '#6366F1',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderBottomLeftRadius: 4,
  },
  timestamp: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
    marginHorizontal: 8,
  },
});

export default ChatBubble;
