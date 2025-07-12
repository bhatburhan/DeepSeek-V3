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

  // Glow effects
  glow: {
    google: 'rgba(66, 133, 244, 0.3)',
    microsoft: 'rgba(94, 94, 94, 0.3)',
    apple: 'rgba(0, 0, 0, 0.3)',
    primary: 'rgba(0, 122, 255, 0.3)',
    premium: 'rgba(139, 92, 246, 0.3)',
    success: 'rgba(52, 199, 89, 0.3)',
    warning: 'rgba(255, 149, 0, 0.3)',
    error: 'rgba(255, 59, 48, 0.3)',
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
  
  // Updated smaller font sizes for better readability
  fontSize: {
    xs: 10,      // Reduced from 12
    sm: 12,      // Reduced from 14
    base: 14,    // Reduced from 16
    lg: 16,      // Reduced from 18
    xl: 18,      // Reduced from 20
    '2xl': 20,   // Reduced from 24
    '3xl': 24,   // Reduced from 30
    '4xl': 28,   // Reduced from 36
    '5xl': 36,   // Reduced from 48
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
  glow: {
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 12,
  },
};

// Interaction styles for hover and touch effects
export const interactions = {
  button: {
    default: {
      transform: [{ scale: 1 }],
      opacity: 1,
    },
    hover: {
      transform: [{ scale: 1.02 }],
      opacity: 0.9,
    },
    pressed: {
      transform: [{ scale: 0.98 }],
      opacity: 0.8,
    },
  },
  card: {
    default: {
      transform: [{ scale: 1 }],
      opacity: 1,
    },
    hover: {
      transform: [{ scale: 1.01 }],
      opacity: 0.95,
    },
    pressed: {
      transform: [{ scale: 0.99 }],
      opacity: 0.9,
    },
  },
  provider: {
    default: {
      transform: [{ scale: 1 }],
      opacity: 1,
    },
    hover: {
      transform: [{ scale: 1.05 }],
      opacity: 0.9,
    },
    pressed: {
      transform: [{ scale: 0.95 }],
      opacity: 0.8,
    },
  },
};

// Glow animation keyframes
export const glowAnimation = {
  from: {
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  to: {
    shadowOpacity: 0.8,
    shadowRadius: 12,
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
    glow: 1000,
  },
  easing: {
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  },
};

// Helper function to create glow styles
export const createGlowStyle = (color, intensity = 0.3) => ({
  shadowColor: color,
  shadowOffset: {
    width: 0,
    height: 0,
  },
  shadowOpacity: intensity,
  shadowRadius: 8,
  elevation: 12,
});

// Helper function to create hover styles
export const createHoverStyle = (baseStyle, hoverTransform = { scale: 1.02 }) => ({
  ...baseStyle,
  transform: [hoverTransform],
});

// Helper function to create touch feedback
export const createTouchFeedback = (scale = 0.98) => ({
  transform: [{ scale }],
  opacity: 0.8,
});