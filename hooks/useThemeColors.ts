import { useTheme } from '@/contexts/ThemeContext';
import { lightColors, darkColors, Colors } from '@/constants/colors';

export const useThemeColors = (): Colors => {
  const { theme } = useTheme() || { theme: 'light' }; // Fallback to light if context is undefined
  return theme === 'dark' ? darkColors : lightColors;
};
