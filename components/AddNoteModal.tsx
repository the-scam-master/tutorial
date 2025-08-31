import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView 
} from 'react-native';
import { X, Plus } from 'lucide-react-native';
import { useThemeColors } from '@/hooks/useThemeColors';

interface AddNoteModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (content: string, topic: string) => void;
}

export const AddNoteModal: React.FC<AddNoteModalProps> = ({ 
  visible, 
  onClose, 
  onSave 
}) => {
  const [content, setContent] = useState('');
  const [topic, setTopic] = useState('');
  const colors = useThemeColors();

  const handleSave = () => {
    if (content.trim() && topic.trim()) {
      onSave(content.trim(), topic.trim());
      setContent('');
      setTopic('');
      onClose();
    }
  };

  const handleCancel = () => {
    setContent('');
    setTopic('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
            <X size={24} color={colors.textSecondary} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Add Note</Text>
          <TouchableOpacity 
            onPress={handleSave} 
            style={[
              styles.saveButton, 
              (!content.trim() || !topic.trim()) && styles.saveButtonDisabled
            ]}
            disabled={!content.trim() || !topic.trim()}
          >
            <Plus size={20} color={(!content.trim() || !topic.trim()) ? colors.textTertiary : colors.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Topic</Text>
            <TextInput
              style={[
                styles.topicInput, 
                { 
                  backgroundColor: colors.inputBackground, 
                  borderColor: colors.inputBorder,
                  color: colors.text 
                }
              ]}
              value={topic}
              onChangeText={setTopic}
              placeholder="e.g., Mathematics, Science, History"
              placeholderTextColor={colors.textSecondary}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Content</Text>
            <TextInput
              style={[
                styles.contentInput, 
                { 
                  backgroundColor: colors.inputBackground, 
                  borderColor: colors.inputBorder,
                  color: colors.text 
                }
              ]}
              value={content}
              onChangeText={setContent}
              placeholder="Write your note here..."
              placeholderTextColor={colors.textSecondary}
              multiline
              textAlignVertical="top"
            />
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  saveButton: {
    padding: 4,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  form: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  topicInput: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
  },
  contentInput: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    minHeight: 120,
  },
});
