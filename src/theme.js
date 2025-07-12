import { DefaultTheme } from 'react-native-paper';

export const colors = {
  // Base colors
  background: {
    light: '#F9FAFB',
    dark: '#1C1C1E',
  },
  surface: {
    light: '#FFFFFF',
    dark: '#2C2C2E',
  },
  
  // Brand colors
  google: '#4285F4',
  microsoft: '#5E5E5E',
  apple: '#000000',
  
  // UI colors
  primary: '#007AFF',
  secondary: '#5856D6',
  accent: '#FF9500',
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  
  // Text colors
  text: {
    primary: '#1D1D1F',
    secondary: '#6E6E73',
    tertiary: '#8E8E93',
    white: '#FFFFFF',
  },
  
  // Surface colors
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  
  // Semantic colors
  premium: {
    gradient: ['#FF9500', '#FF6B35'],
    gold: '#FFD700',
    purple: '#8B5CF6',
  },
  
  // Shadow colors
  shadow: {
    light: 'rgba(0, 0, 0, 0.1)',
    medium: 'rgba(0, 0, 0, 0.15)',
    dark: 'rgba(0, 0, 0, 0.25)',
  },
};

export const typography = {
  // Font families
  fontFamily: {
    regular: 'System', // SF Pro Display on iOS, Roboto on Android
    medium: 'System',
    semiBold: 'System',
    bold: 'System',
  },
  
  // Font sizes
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },
  
  // Line heights
  lineHeight: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
  '4xl': 96,
};

export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: colors.shadow.light,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  md: {
    shadowColor: colors.shadow.medium,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  lg: {
    shadowColor: colors.shadow.dark,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  },
};

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    accent: colors.accent,
    background: colors.background.light,
    surface: colors.surface.light,
    text: colors.text.primary,
    disabled: colors.gray[400],
    placeholder: colors.gray[500],
    backdrop: 'rgba(0, 0, 0, 0.5)',
  },
  fonts: {
    ...DefaultTheme.fonts,
    regular: {
      fontFamily: typography.fontFamily.regular,
      fontWeight: '400',
    },
    medium: {
      fontFamily: typography.fontFamily.medium,
      fontWeight: '500',
    },
    light: {
      fontFamily: typography.fontFamily.regular,
      fontWeight: '300',
    },
    thin: {
      fontFamily: typography.fontFamily.regular,
      fontWeight: '100',
    },
  },
  roundness: borderRadius.lg,
};

export const lightTheme = {
  ...theme,
  colors: {
    ...theme.colors,
    background: colors.background.light,
    surface: colors.surface.light,
    text: colors.text.primary,
  },
};

export const darkTheme = {
  ...theme,
  colors: {
    ...theme.colors,
    background: colors.background.dark,
    surface: colors.surface.dark,
    text: colors.text.white,
  },
};

export const animations = {
  timing: {
    quick: 200,
    normal: 300,
    slow: 500,
  },
  easing: {
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  },
};