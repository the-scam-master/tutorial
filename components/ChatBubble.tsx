import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { Message } from '@/types';
import { User, Bot } from 'lucide-react-native';
import { useThemeColors } from '@/hooks/useThemeColors';

interface ChatBubbleProps {
  message: Message;
}

const ChatBubble = memo(({ message }: ChatBubbleProps) => {
  const colors = useThemeColors();
  const isUser = message.role === 'user';

  const markdownStyles = {
    body: {
      fontSize: 16,
      lineHeight: 24,
      color: isUser ? colors.onPrimary : colors.text,
      margin: 0,
      padding: 0,
    },
    paragraph: {
      fontSize: 16,
      lineHeight: 24,
      color: isUser ? colors.onPrimary : colors.text,
      marginBottom: 12,
      marginTop: 0,
    },
    strong: {
      fontWeight: '700',
      color: isUser ? colors.onPrimary : colors.text,
    },
    em: {
      fontStyle: 'italic',
      color: isUser ? colors.onPrimary : colors.text,
    },
    code_inline: {
      backgroundColor: isUser ? 'rgba(255,255,255,0.2)' : colors.surfaceVariant,
      color: isUser ? colors.onPrimary : colors.text,
      padding: 4,
      borderRadius: 6,
      fontFamily: 'monospace',
      fontSize: 14,
    },
    code_block: {
      backgroundColor: isUser ? 'rgba(255,255,255,0.2)' : colors.surfaceVariant,
      color: isUser ? colors.onPrimary : colors.text,
      padding: 16,
      borderRadius: 8,
      fontFamily: 'monospace',
      fontSize: 14,
      marginVertical: 12,
    },
    blockquote: {
      backgroundColor: isUser ? 'rgba(255,255,255,0.1)' : colors.surfaceVariant,
      borderLeftWidth: 4,
      borderLeftColor: isUser ? 'rgba(255,255,255,0.5)' : colors.primary,
      paddingLeft: 16,
      marginVertical: 12,
      fontStyle: 'italic',
    },
    list_item: {
      fontSize: 16,
      lineHeight: 24,
      color: isUser ? colors.onPrimary : colors.text,
      marginBottom: 8,
    },
    bullet_list: {
      marginBottom: 12,
    },
    ordered_list: {
      marginBottom: 12,
    },
    link: {
      color: isUser ? '#93C5FD' : colors.primary,
      textDecorationLine: 'underline',
    },
    heading1: {
      fontSize: 24,
      fontWeight: '700',
      color: isUser ? colors.onPrimary : colors.text,
      marginBottom: 12,
      marginTop: 12,
    },
    heading2: {
      fontSize: 20,
      fontWeight: '600',
      color: isUser ? colors.onPrimary : colors.text,
      marginBottom: 8,
      marginTop: 8,
    },
    heading3: {
      fontSize: 18,
      fontWeight: '600',
      color: isUser ? colors.onPrimary : colors.text,
      marginBottom: 6,
      marginTop: 6,
    },
    table: {
      borderWidth: 1,
      borderColor: isUser ? 'rgba(255,255,255,0.3)' : colors.border,
      marginVertical: 12,
    },
    table_header: {
      backgroundColor: isUser ? 'rgba(255,255,255,0.1)' : colors.surfaceVariant,
      fontWeight: '600',
    },
    table_cell: {
      borderWidth: 1,
      borderColor: isUser ? 'rgba(255,255,255,0.3)' : colors.border,
      padding: 8,
    },
  };

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.aiContainer]}>
      <View style={styles.messageWrapper}>
        <View style={styles.avatarSection}>
          <View style={[
            styles.avatar, 
            { 
              backgroundColor: isUser ? colors.primary : colors.secondary 
            }
          ]}>
            {isUser ? (
              <User size={16} color={colors.onPrimary} />
            ) : (
              <Bot size={16} color={colors.onSecondary} />
            )}
          </View>
        </View>
        
        <View style={styles.messageSection}>
          <View style={[
            styles.bubble, 
            isUser 
              ? { backgroundColor: colors.chatBubbleUser } 
              : { backgroundColor: colors.chatBubbleAI, borderColor: colors.border }
          ]}>
            <Markdown style={markdownStyles}>
              {message.content}
            </Markdown>
          </View>
        </View>
      </View>
      
      <Text style={[styles.timestamp, { color: colors.textTertiary }]}>
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
  timestamp: {
    fontSize: 11,
    marginTop: 4,
    marginHorizontal: 8,
  },
});

export default ChatBubble;
