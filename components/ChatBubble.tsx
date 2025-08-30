import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { Message } from '@/types';
import { User, Bot } from 'lucide-react-native';

interface ChatBubbleProps {
  message: Message;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';

  // Custom markdown styles that match our app's design
  const markdownStyles = {
    body: {
      fontSize: 16,
      lineHeight: 22,
      color: isUser ? '#FFFFFF' : '#1F2937',
      margin: 0,
      padding: 0,
    },
    paragraph: {
      fontSize: 16,
      lineHeight: 22,
      color: isUser ? '#FFFFFF' : '#1F2937',
      marginBottom: 8,
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
      backgroundColor: isUser ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
      color: isUser ? '#FFFFFF' : '#1F2937',
      padding: 2,
      borderRadius: 4,
      fontFamily: 'monospace',
      fontSize: 14,
    },
    code_block: {
      backgroundColor: isUser ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
      color: isUser ? '#FFFFFF' : '#1F2937',
      padding: 12,
      borderRadius: 8,
      fontFamily: 'monospace',
      fontSize: 14,
      marginVertical: 8,
    },
    blockquote: {
      backgroundColor: isUser ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
      borderLeftWidth: 4,
      borderLeftColor: isUser ? 'rgba(255,255,255,0.5)' : '#3B82F6',
      paddingLeft: 12,
      marginVertical: 8,
      fontStyle: 'italic',
    },
    list_item: {
      fontSize: 16,
      lineHeight: 22,
      color: isUser ? '#FFFFFF' : '#1F2937',
      marginBottom: 4,
    },
    bullet_list: {
      marginBottom: 8,
    },
    ordered_list: {
      marginBottom: 8,
    },
    link: {
      color: isUser ? '#93C5FD' : '#3B82F6',
      textDecorationLine: 'underline',
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
  timestamp: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
    marginHorizontal: 8,
  },
});
