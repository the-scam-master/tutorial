import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Lightbulb, BookOpenText, CircleHelp as HelpCircle } from 'lucide-react-native';

interface QuickActionButtonsProps {
  onAction: (action: string, label: string) => void;
  disabled?: boolean;
}

export const QuickActionButtons: React.FC<QuickActionButtonsProps> = ({ 
  onAction, 
  disabled = false 
}) => {
  const actions = [
    {
      id: 'explain-simply',
      label: 'Explain Simply',
      icon: Lightbulb,
      color: '#10B981',
    },
    {
      id: 'give-examples',
      label: 'Give Examples',
      icon: BookOpenText,
      color: '#8B5CF6',
    },
    {
      id: 'quiz-me',
      label: 'Quiz Me',
      icon: HelpCircle,
      color: '#F59E0B',
    },
  ];

  return (
    <View style={styles.container}>
      {actions.map((action) => (
        <TouchableOpacity
          key={action.id}
          style={[
            styles.button,
            { borderColor: action.color },
            disabled && styles.buttonDisabled
          ]}
          onPress={() => onAction(action.id, action.label)}
          disabled={disabled}
        >
          <action.icon size={18} color={action.color} />
          <Text style={[styles.buttonText, { color: action.color }]}>
            {action.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F8FAFC',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
});