import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView,
  Alert 
} from 'react-native';
import { Key, X, ExternalLink } from 'lucide-react-native';
import { useThemeColors } from '@/hooks/useThemeColors';

interface ApiKeyModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (apiKey: string) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ 
  visible, 
  onClose, 
  onSave 
}) => {
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const colors = useThemeColors();

  const handleSave = async () => {
    if (!apiKey.trim()) {
      Alert.alert('Error', 'Please enter a valid API key');
      return;
    }
    
    setIsLoading(true);
    try {
      await onSave(apiKey.trim());
      setApiKey('');
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to save API key');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setApiKey('');
    onClose();
  };

  const openApiKeyGuide = () => {
    Alert.alert(
      'Get API Key',
      'Visit https://aistudio.google.com/app/apikey to get your free Google AI API key'
    );
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
          <Text style={[styles.title, { color: colors.text }]}>Setup AI</Text>
          <TouchableOpacity 
            onPress={handleSave} 
            style={[
              styles.saveButton, 
              { backgroundColor: colors.primary },
              (!apiKey.trim() || isLoading) && styles.saveButtonDisabled
            ]}
            disabled={!apiKey.trim() || isLoading}
          >
            <Text style={[
              styles.saveButtonText, 
              { color: colors.onPrimary },
              (!apiKey.trim() || isLoading) && styles.saveButtonTextDisabled
            ]}>
              {isLoading ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Key size={48} color={colors.primary} />
          </View>
          
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            To start chatting with your AI tutor, you'll need a Google AI API key. 
            It's free and takes just a minute to set up.
          </Text>
          <TouchableOpacity 
            style={[
              styles.guideButton, 
              { backgroundColor: colors.surface, borderColor: colors.primary }
            ]} 
            onPress={openApiKeyGuide}
          >
            <ExternalLink size={20} color={colors.primary} />
            <Text style={[styles.guideButtonText, { color: colors.primary }]}>Get Free API Key</Text>
          </TouchableOpacity>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Google AI API Key</Text>
            <TextInput
              style={[
                styles.input, 
                { 
                  backgroundColor: colors.inputBackground, 
                  borderColor: colors.inputBorder,
                  color: colors.text 
                }
              ]}
              value={apiKey}
              onChangeText={setApiKey}
              placeholder="AIza..."
              placeholderTextColor={colors.textSecondary}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
            <Text style={[styles.inputHint, { color: colors.textTertiary }]}>
              Your API key is stored locally and never shared
            </Text>
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
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  saveButtonTextDisabled: {
    color: '#9CA3AF',
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  iconContainer: {
    marginTop: 40,
    marginBottom: 24,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  guideButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 32,
  },
  guideButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  inputGroup: {
    width: '100%',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
  },
  inputHint: {
    fontSize: 12,
    marginTop: 6,
    textAlign: 'center',
  },
});
