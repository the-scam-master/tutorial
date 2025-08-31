import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, Dimensions } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { Note } from '@/types';
import { Edit3, Trash2, Check, X, Bot, User } from 'lucide-react-native';
import { useThemeColors } from '@/hooks/useThemeColors';

const { width } = Dimensions.get('window');

interface NoteCardProps {
  note: Note;
  onUpdate: (noteId: string, updates: Partial<Note>) => void;
  onDelete: (noteId: string) => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({ note, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(note.content);
  const [editedTopic, setEditedTopic] = useState(note.topic);
  const colors = useThemeColors();

  const handleSave = () => {
    if (editedContent.trim()) {
      onUpdate(note.id, {
        content: editedContent.trim(),
        topic: editedTopic.trim(),
      });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditedContent(note.content);
    setEditedTopic(note.topic);
    setIsEditing(false);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => onDelete(note.id)
        },
      ]
    );
  };

  const markdownStyles = {
    body: {
      fontSize: 16,
      lineHeight: 24,
      color: colors.text,
      margin: 0,
      padding: 0,
    },
    paragraph: {
      fontSize: 16,
      lineHeight: 24,
      color: colors.text,
      marginBottom: 12,
      marginTop: 0,
    },
    strong: {
      fontWeight: '700',
      color: colors.text,
    },
    em: {
      fontStyle: 'italic',
      color: colors.text,
    },
    code_inline: {
      backgroundColor: colors.surfaceVariant,
      color: colors.text,
      padding: 4,
      borderRadius: 6,
      fontFamily: 'monospace',
      fontSize: 14,
    },
    code_block: {
      backgroundColor: colors.surfaceVariant,
      color: colors.text,
      padding: 16,
      borderRadius: 8,
      fontFamily: 'monospace',
      fontSize: 14,
      marginVertical: 12,
    },
    blockquote: {
      backgroundColor: colors.surfaceVariant,
      borderLeftWidth: 4,
      borderLeftColor: colors.primary,
      paddingLeft: 16,
      marginVertical: 12,
      fontStyle: 'italic',
    },
    list_item: {
      fontSize: 16,
      lineHeight: 24,
      color: colors.text,
      marginBottom: 8,
    },
    link: {
      color: colors.primary,
      textDecorationLine: 'underline',
    },
    heading1: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 12,
      marginTop: 12,
    },
    heading2: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
      marginTop: 8,
    },
    heading3: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 6,
      marginTop: 6,
    },
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.header}>
        <View style={styles.topicContainer}>
          {isEditing ? (
            <TextInput
              style={[styles.topicInput, { color: colors.text, borderBottomColor: colors.border }]}
              value={editedTopic}
              onChangeText={setEditedTopic}
              placeholder="Topic"
              placeholderTextColor={colors.textSecondary}
            />
          ) : (
            <Text style={[styles.topic, { color: colors.text }]}>{note.topic}</Text>
          )}
        </View>
        
        <View style={styles.sourceIndicator}>
          {note.source === 'auto' ? (
            <Bot size={14} color={colors.secondary} />
          ) : (
            <User size={14} color={colors.primary} />
          )}
        </View>
      </View>
      
      <View style={styles.content}>
        {isEditing ? (
          <TextInput
            style={[styles.contentInput, { 
              color: colors.text, 
              backgroundColor: colors.inputBackground,
              borderColor: colors.border 
            }]}
            value={editedContent}
            onChangeText={setEditedContent}
            multiline
            placeholder="Note content"
            placeholderTextColor={colors.textSecondary}
            textAlignVertical="top"
          />
        ) : (
          <Markdown style={markdownStyles}>
            {note.content}
          </Markdown>
        )}
      </View>
      
      <View style={styles.footer}>
        <Text style={[styles.timestamp, { color: colors.textTertiary }]}>
          {new Date(note.timestamp).toLocaleDateString([], {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </Text>
        
        <View style={styles.actions}>
          {isEditing ? (
            <>
              <TouchableOpacity onPress={handleCancel} style={[styles.actionButton, { backgroundColor: colors.surfaceVariant }]}>
                <X size={18} color={colors.error} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSave} style={[styles.actionButton, { backgroundColor: colors.surfaceVariant }]}>
                <Check size={18} color={colors.success} />
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity onPress={() => setIsEditing(true)} style={[styles.actionButton, { backgroundColor: colors.surfaceVariant }]}>
                <Edit3 size={16} color={colors.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDelete} style={[styles.actionButton, { backgroundColor: colors.surfaceVariant }]}>
                <Trash2 size={16} color={colors.error} />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderLeftWidth: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  topicContainer: {
    flex: 1,
  },
  topic: {
    fontSize: 16,
    fontWeight: '700',
  },
  topicInput: {
    fontSize: 16,
    fontWeight: '700',
    borderBottomWidth: 2,
    paddingVertical: 4,
  },
  sourceIndicator: {
    marginLeft: 12,
  },
  content: {
    marginBottom: 16,
  },
  contentInput: {
    fontSize: 16,
    lineHeight: 24,
    borderRadius: 12,
    padding: 16,
    textAlignVertical: 'top',
    minHeight: 100,
    borderWidth: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timestamp: {
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
    borderRadius: 8,
  },
});
