import { useTheme } from '@/contexts/ThemeContext';
import { lightColors, darkColors, Colors } from '@/constants/colors';

export const useThemeColors = (): Colors => {
  const { theme } = useTheme();
  return theme === 'dark' ? darkColors : lightColors;
};
