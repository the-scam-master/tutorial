import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Lightbulb, BookOpenText, CircleHelp as HelpCircle } from 'lucide-react-native';
import { useThemeColors } from '@/hooks/useThemeColors';

interface QuickActionButtonsProps {
  onAction: (action: string, label: string) => void;
  disabled?: boolean;
}

export const QuickActionButtons: React.FC<QuickActionButtonsProps> = ({ 
  onAction, 
  disabled = false 
}) => {
  const colors = useThemeColors();
  const actions = [
    {
      id: 'explain-simply',
      label: 'Explain Simply',
      icon: Lightbulb,
      color: colors.success,
    },
    {
      id: 'give-examples',
      label: 'Give Examples',
      icon: BookOpenText,
      color: colors.secondary,
    },
    {
      id: 'quiz-me',
      label: 'Quiz Me',
      icon: HelpCircle,
      color: colors.warning,
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceVariant }]}>
      {actions.map((action) => (
        <TouchableOpacity
          key={action.id}
          style={[
            styles.button,
            { backgroundColor: colors.surface, borderColor: colors.border },
            disabled && styles.buttonDisabled
          ]}
          onPress={() => onAction(action.id, action.label)}
          disabled={disabled}
        >
          <action.icon size={18} color={action.color} />
          <Text style={[styles.buttonText, { color: colors.text }]}>
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
    borderTopWidth: 1,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
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
