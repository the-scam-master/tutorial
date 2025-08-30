import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, Dimensions } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { Note } from '@/types';
import { Edit3, Trash2, Check, X, Bot, User } from 'lucide-react-native';

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
      color: '#1F2937',
      margin: 0,
      padding: 0,
    },
    paragraph: {
      fontSize: 16,
      lineHeight: 24,
      color: '#1F2937',
      marginBottom: 12,
      marginTop: 0,
    },
    strong: {
      fontWeight: '700',
      color: '#1F2937',
    },
    em: {
      fontStyle: 'italic',
      color: '#1F2937',
    },
    code_inline: {
      backgroundColor: '#F3F4F6',
      color: '#1F2937',
      padding: 4,
      borderRadius: 6,
      fontFamily: 'monospace',
      fontSize: 14,
    },
    code_block: {
      backgroundColor: '#F3F4F6',
      color: '#1F2937',
      padding: 16,
      borderRadius: 8,
      fontFamily: 'monospace',
      fontSize: 14,
      marginVertical: 12,
    },
    blockquote: {
      backgroundColor: '#F9FAFB',
      borderLeftWidth: 4,
      borderLeftColor: '#3B82F6',
      paddingLeft: 16,
      marginVertical: 12,
      fontStyle: 'italic',
    },
    list_item: {
      fontSize: 16,
      lineHeight: 24,
      color: '#1F2937',
      marginBottom: 8,
    },
    link: {
      color: '#3B82F6',
      textDecorationLine: 'underline',
    },
    heading1: {
      fontSize: 24,
      fontWeight: '700',
      color: '#1F2937',
      marginBottom: 12,
      marginTop: 12,
    },
    heading2: {
      fontSize: 20,
      fontWeight: '600',
      color: '#1F2937',
      marginBottom: 8,
      marginTop: 8,
    },
    heading3: {
      fontSize: 18,
      fontWeight: '600',
      color: '#1F2937',
      marginBottom: 6,
      marginTop: 6,
    },
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.topicContainer}>
          {isEditing ? (
            <TextInput
              style={styles.topicInput}
              value={editedTopic}
              onChangeText={setEditedTopic}
              placeholder="Topic"
              placeholderTextColor="#9CA3AF"
            />
          ) : (
            <Text style={styles.topic}>{note.topic}</Text>
          )}
        </View>
        
        <View style={styles.sourceIndicator}>
          {note.source === 'auto' ? (
            <Bot size={14} color="#8B5CF6" />
          ) : (
            <User size={14} color="#3B82F6" />
          )}
        </View>
      </View>
      
      <View style={styles.content}>
        {isEditing ? (
          <TextInput
            style={styles.contentInput}
            value={editedContent}
            onChangeText={setEditedContent}
            multiline
            placeholder="Note content"
            placeholderTextColor="#9CA3AF"
            textAlignVertical="top"
          />
        ) : (
          <Markdown style={markdownStyles}>
            {note.content}
          </Markdown>
        )}
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.timestamp}>
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
              <TouchableOpacity onPress={handleCancel} style={styles.actionButton}>
                <X size={18} color="#EF4444" />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSave} style={styles.actionButton}>
                <Check size={18} color="#10B981" />
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.actionButton}>
                <Edit3 size={16} color="#6B7280" />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDelete} style={styles.actionButton}>
                <Trash2 size={16} color="#EF4444" />
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
    backgroundColor: 'white',
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
    borderLeftColor: '#3B82F6',
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
    color: '#1F2937',
  },
  topicInput: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    borderBottomWidth: 2,
    borderBottomColor: '#D1D5DB',
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
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 16,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timestamp: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
  },
});
