import React, { useRef, useEffect, useState } from 'react';
import {
  TouchableOpacity,
  Animated,
  View,
  StyleSheet,
  Platform,
} from 'react-native';
import { colors, animations, createGlowStyle, spacing, borderRadius, shadows } from '../theme';

const InteractiveCard = ({
  children,
  onPress,
  style,
  glowColor = colors.glow.primary,
  disabled = false,
  intensity = 0.3,
  hoverScale = 1.02,
  pressScale = 0.98,
  ...props
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(intensity)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  // Flowing glow animation
  useEffect(() => {
    const glowFlow = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: intensity + 0.2,
          duration: animations.timing.glow,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: intensity,
          duration: animations.timing.glow,
          useNativeDriver: false,
        }),
      ])
    );

    // Subtle rotation animation
    const rotateFlow = Animated.loop(
      Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: animations.timing.glow * 2,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: animations.timing.glow * 2,
          useNativeDriver: true,
        }),
      ])
    );

    glowFlow.start();
    rotateFlow.start();

    return () => {
      glowFlow.stop();
      rotateFlow.stop();
    };
  }, [glowAnim, rotateAnim, intensity]);

  const handlePressIn = () => {
    setIsPressed(true);
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: pressScale,
        useNativeDriver: true,
        tension: 400,
        friction: 8,
      }),
      Animated.timing(glowAnim, {
        toValue: intensity + 0.4,
        duration: animations.timing.quick,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    setIsPressed(false);
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: isHovered ? hoverScale : 1,
        useNativeDriver: true,
        tension: 400,
        friction: 8,
      }),
      Animated.timing(glowAnim, {
        toValue: isHovered ? intensity + 0.3 : intensity,
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
          toValue: hoverScale,
          useNativeDriver: true,
          tension: 400,
          friction: 8,
        }),
        Animated.timing(glowAnim, {
          toValue: intensity + 0.3,
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
          tension: 400,
          friction: 8,
        }),
        Animated.timing(glowAnim, {
          toValue: intensity,
          duration: animations.timing.normal,
          useNativeDriver: false,
        }),
      ]).start();
    }
  };

  const animatedGlowStyle = {
    shadowColor: glowColor,
    shadowOpacity: glowAnim,
    shadowRadius: glowAnim.interpolate({
      inputRange: [intensity, intensity + 0.4],
      outputRange: [6, 16],
    }),
    shadowOffset: {
      width: 0,
      height: 0,
    },
    elevation: glowAnim.interpolate({
      inputRange: [intensity, intensity + 0.4],
      outputRange: [6, 16],
    }),
  };

  const rotateInterpolated = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '2deg'],
  });

  const animatedStyle = {
    transform: [
      { scale: scaleAnim },
      { rotate: rotateInterpolated },
    ],
  };

  const cardStyle = [
    styles.card,
    animatedGlowStyle,
    disabled && styles.disabled,
    style,
  ];

  return (
    <Animated.View style={[cardStyle, animatedStyle]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        disabled={disabled}
        style={styles.touchable}
        activeOpacity={0.9}
        {...props}
      >
        <View style={styles.content}>
          {children}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface.light,
    borderRadius: borderRadius.xl,
    ...shadows.md,
  },
  touchable: {
    width: '100%',
    borderRadius: borderRadius.xl,
  },
  content: {
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
});

export default InteractiveCard;