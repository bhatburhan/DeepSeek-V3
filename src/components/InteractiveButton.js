import React, { useRef, useEffect, useState } from 'react';
import {
  TouchableOpacity,
  Animated,
  View,
  Text,
  StyleSheet,
  Platform,
} from 'react-native';
import { colors, animations, createGlowStyle, typography, spacing, borderRadius } from '../theme';

const InteractiveButton = ({
  children,
  onPress,
  style,
  textStyle,
  glowColor = colors.glow.primary,
  disabled = false,
  variant = 'primary', // primary, secondary, provider
  provider = null, // google, microsoft, apple
  ...props
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.3)).current;
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  // Continuous glow animation
  useEffect(() => {
    const glowAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 0.8,
          duration: animations.timing.glow,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.3,
          duration: animations.timing.glow,
          useNativeDriver: false,
        }),
      ])
    );

    glowAnimation.start();

    return () => glowAnimation.stop();
  }, [glowAnim]);

  const handlePressIn = () => {
    setIsPressed(true);
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }),
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: animations.timing.quick,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    setIsPressed(false);
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: isHovered ? 1.02 : 1,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }),
      Animated.timing(glowAnim, {
        toValue: isHovered ? 0.6 : 0.3,
        duration: animations.timing.normal,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handleMouseEnter = () => {
    if (Platform.OS === 'web') {
      setIsHovered(true);
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1.02,
          useNativeDriver: true,
          tension: 300,
          friction: 10,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.6,
          duration: animations.timing.normal,
          useNativeDriver: false,
        }),
      ]).start();
    }
  };

  const handleMouseLeave = () => {
    if (Platform.OS === 'web') {
      setIsHovered(false);
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 300,
          friction: 10,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.3,
          duration: animations.timing.normal,
          useNativeDriver: false,
        }),
      ]).start();
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'provider':
        const providerColor = provider ? colors[provider] : colors.primary;
        const providerGlow = provider ? colors.glow[provider] : colors.glow.primary;
        return {
          backgroundColor: colors.surface.light,
          borderWidth: 2,
          borderColor: 'transparent',
          ...createGlowStyle(providerGlow, 0.4),
        };
      case 'secondary':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: colors.primary,
          ...createGlowStyle(colors.glow.primary, 0.2),
        };
      default: // primary
        return {
          backgroundColor: colors.primary,
          ...createGlowStyle(colors.glow.primary, 0.4),
        };
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'provider':
        return provider ? colors[provider] : colors.primary;
      case 'secondary':
        return colors.primary;
      default:
        return colors.text.white;
    }
  };

  const animatedGlowStyle = {
    shadowOpacity: glowAnim,
    shadowRadius: glowAnim.interpolate({
      inputRange: [0.3, 1],
      outputRange: [4, 12],
    }),
  };

  const baseStyle = [
    styles.button,
    getVariantStyles(),
    animatedGlowStyle,
    disabled && styles.disabled,
    style,
  ];

  const animatedStyle = {
    transform: [{ scale: scaleAnim }],
  };

  const textColor = getTextColor();
  const finalTextStyle = [
    styles.buttonText,
    { color: textColor },
    disabled && styles.disabledText,
    textStyle,
  ];

  return (
    <Animated.View style={[baseStyle, animatedStyle]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        disabled={disabled}
        style={styles.touchable}
        activeOpacity={0.8}
        {...props}
      >
        {typeof children === 'string' ? (
          <Text style={finalTextStyle}>{children}</Text>
        ) : (
          children
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  touchable: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: typography.fontSize.base,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    color: colors.text.tertiary,
  },
});

export default InteractiveButton;