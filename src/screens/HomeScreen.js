import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  RefreshControl,
  Animated,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { usePremium } from '../context/PremiumContext';
import { useTheme } from '../context/ThemeContext';
import { colors, spacing, typography, borderRadius, shadows, createGlowStyle } from '../theme';
import InteractiveButton from '../components/InteractiveButton';
import InteractiveCard from '../components/InteractiveCard';
import Toast from 'react-native-toast-message';
import ConfettiCannon from 'react-native-confetti-cannon';

const { width, height } = Dimensions.get('window');

const HomeScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { 
    sessions, 
    getTotalSessions, 
    getAuthenticatedProviders, 
    refreshAllSessions,
    isLoading 
  } = useAuth();
  const { hasFeature, premiumStatus } = usePremium();
  
  const [refreshing, setRefreshing] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [animatedValues] = useState({
    google: new Animated.Value(0),
    microsoft: new Animated.Value(0),
    apple: new Animated.Value(0),
  });

  useEffect(() => {
    // Animate provider buttons on mount
    Animated.stagger(200, [
      Animated.spring(animatedValues.google, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 5,
      }),
      Animated.spring(animatedValues.microsoft, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 5,
      }),
      Animated.spring(animatedValues.apple, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 5,
      }),
    ]).start();
  }, []);

  const providers = [
    {
      id: 'google',
      name: 'Google',
      color: colors.google,
      backgroundColor: colors.surface.light,
      icon: 'G',
      sessions: sessions.google.length,
      available: true,
      animatedValue: animatedValues.google,
    },
    {
      id: 'microsoft',
      name: 'Microsoft',
      color: colors.microsoft,
      backgroundColor: colors.surface.light,
      icon: '⊞',
      sessions: sessions.microsoft.length,
      available: true,
      animatedValue: animatedValues.microsoft,
    },
    {
      id: 'apple',
      name: 'Apple',
      color: colors.apple,
      backgroundColor: colors.surface.light,
      icon: '',
      sessions: sessions.apple.length,
      available: hasFeature('view_apple_sessions'),
      isPremium: true,
      animatedValue: animatedValues.apple,
    },
  ];

  const handleProviderPress = (provider) => {
    if (!provider.available) {
      // Show premium modal
      Toast.show({
        type: 'info',
        text1: 'Premium Feature',
        text2: 'Apple ID sessions are available in premium plans',
      });
      navigation.navigate('Premium', { feature: 'view_apple_sessions' });
      return;
    }

    // Navigate to details screen
    navigation.navigate('Details', { provider: provider.id });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshAllSessions();
      Toast.show({
        type: 'success',
        text1: 'Sessions Updated',
        text2: 'All sessions have been refreshed',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Refresh Failed',
        text2: 'Please try again',
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handleSettingsPress = () => {
    navigation.navigate('Settings');
  };

  const handlePremiumPress = () => {
    navigation.navigate('Premium');
  };

  const renderProviderButton = (provider) => {
    const scale = provider.animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0.8, 1],
    });

    const opacity = provider.animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });

    return (
      <Animated.View
        key={provider.id}
        style={[
          styles.providerContainer,
          {
            transform: [{ scale }],
            opacity,
          },
        ]}
      >
        <InteractiveCard
          style={[
            styles.providerButton,
            !provider.available && styles.disabledProvider,
          ]}
          glowColor={colors.glow[provider.id]}
          intensity={0.4}
          hoverScale={1.05}
          pressScale={0.95}
          onPress={() => handleProviderPress(provider)}
          disabled={!provider.available}
        >
          {/* Lock overlay for premium features */}
          {!provider.available && (
            <View style={styles.lockOverlay}>
              <Text style={styles.lockIcon}>🔒</Text>
            </View>
          )}
          
          {/* Provider icon */}
          <View style={[styles.providerIcon, { backgroundColor: provider.color }]}>
            {provider.id === 'google' && (
              <View style={styles.googleIcon}>
                <Text style={[styles.iconText, { color: colors.text.white }]}>G</Text>
              </View>
            )}
            {provider.id === 'microsoft' && (
              <View style={styles.microsoftIcon}>
                <View style={styles.microsoftSquares}>
                  <View style={[styles.microsoftSquare, { backgroundColor: '#f25022' }]} />
                  <View style={[styles.microsoftSquare, { backgroundColor: '#7fba00' }]} />
                  <View style={[styles.microsoftSquare, { backgroundColor: '#00a4ef' }]} />
                  <View style={[styles.microsoftSquare, { backgroundColor: '#ffb900' }]} />
                </View>
              </View>
            )}
            {provider.id === 'apple' && (
              <View style={styles.appleIcon}>
                <Text style={[styles.iconText, { color: colors.text.white }]}>🍎</Text>
              </View>
            )}
          </View>
          
          {/* Provider name */}
          <Text style={[styles.providerName, { color: theme.colors.text }]}>
            {provider.name}
          </Text>
          
          {/* Session count */}
          <Text style={[styles.sessionCount, { color: theme.colors.text }]}>
            {provider.sessions} sessions
          </Text>
        </InteractiveCard>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={[styles.greeting, { color: theme.colors.text }]}>
                Welcome back
              </Text>
              <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
                Manage your digital sessions
              </Text>
            </View>
            <InteractiveButton
              style={[styles.settingsButton, { backgroundColor: theme.colors.surface }]}
              variant="secondary"
              onPress={handleSettingsPress}
            >
              <Text style={styles.settingsIcon}>⚙️</Text>
            </InteractiveButton>
          </View>
          
          {/* Stats */}
          <View style={[styles.statsContainer, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>
                {getTotalSessions()}
              </Text>
              <Text style={[styles.statLabel, { color: colors.text.secondary }]}>
                Total Sessions
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>
                {getAuthenticatedProviders().length}
              </Text>
              <Text style={[styles.statLabel, { color: colors.text.secondary }]}>
                Connected
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.success }]}>
                {premiumStatus.plan === 'free' ? 'Free' : 'Premium'}
              </Text>
              <Text style={[styles.statLabel, { color: colors.text.secondary }]}>
                Plan
              </Text>
            </View>
          </View>
        </View>

        {/* Provider Buttons */}
        <View style={styles.providersContainer}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Account Providers
          </Text>
          
          <View style={styles.providersGrid}>
            {providers.map(renderProviderButton)}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Quick Actions
          </Text>
          
          <View style={styles.actionsGrid}>
            <InteractiveCard
              style={[styles.actionButton, { backgroundColor: theme.colors.surface }]}
              glowColor={colors.glow.primary}
              onPress={handleRefresh}
              disabled={isLoading}
            >
              <Text style={styles.actionIcon}>🔄</Text>
              <Text style={[styles.actionText, { color: theme.colors.text }]}>
                Refresh All
              </Text>
            </InteractiveCard>
            
            <InteractiveCard
              style={[styles.actionButton, { backgroundColor: theme.colors.surface }]}
              glowColor={colors.glow.premium}
              onPress={handlePremiumPress}
            >
              <Text style={styles.actionIcon}>⭐</Text>
              <Text style={[styles.actionText, { color: theme.colors.text }]}>
                {premiumStatus.isPremium ? 'Manage Plan' : 'Go Premium'}
              </Text>
            </InteractiveCard>
          </View>
        </View>

        {/* Premium Banner */}
        {!premiumStatus.isPremium && (
          <InteractiveCard
            style={styles.premiumBanner}
            glowColor={colors.glow.premium}
            intensity={0.5}
            onPress={handlePremiumPress}
          >
            <LinearGradient
              colors={colors.premium.gradient}
              style={styles.premiumGradient}
            >
              <Text style={styles.premiumTitle}>Unlock Premium Features</Text>
              <Text style={styles.premiumSubtitle}>
                Get one-click logout, Apple ID sessions, and more
              </Text>
            </LinearGradient>
          </InteractiveCard>
        )}
      </ScrollView>

      {/* Confetti */}
      {showConfetti && (
        <ConfettiCannon
          count={200}
          origin={{ x: width / 2, y: 0 }}
          autoStart={true}
          fadeOut={true}
          onAnimationEnd={() => setShowConfetti(false)}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
    width: '100%',
  },
  greeting: {
    fontSize: typography.fontSize.xl,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    ...createGlowStyle(colors.glow.primary, 0.3),
  },
  settingsIcon: {
    fontSize: typography.fontSize.base,
  },
  statsContainer: {
    flexDirection: 'row',
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...createGlowStyle(colors.glow.primary, 0.2),
    width: '100%',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.gray[300],
    marginHorizontal: spacing.sm,
  },
  providersContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: '600',
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  providersGrid: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.lg,
  },
  providerContainer: {
    alignItems: 'center',
  },
  providerButton: {
    width: 90,
    height: 110,
    borderRadius: borderRadius['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    padding: spacing.sm,
  },
  disabledProvider: {
    opacity: 0.6,
  },
  lockOverlay: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.premium.gold,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    ...createGlowStyle(colors.glow.warning, 0.6),
  },
  lockIcon: {
    fontSize: typography.fontSize.xs,
  },
  providerIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    ...createGlowStyle(colors.shadow.medium, 0.4),
  },
  googleIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  microsoftIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  microsoftSquares: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 20,
    height: 20,
  },
  microsoftSquare: {
    width: 8,
    height: 8,
    margin: 1,
  },
  appleIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: typography.fontSize.lg,
    fontWeight: 'bold',
  },
  providerName: {
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  sessionCount: {
    fontSize: 10,
    opacity: 0.7,
    textAlign: 'center',
  },
  quickActionsContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    alignItems: 'center',
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  actionButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    minHeight: 80,
  },
  actionIcon: {
    fontSize: typography.fontSize.lg,
    marginBottom: spacing.sm,
  },
  actionText: {
    fontSize: typography.fontSize.xs,
    fontWeight: '500',
    textAlign: 'center',
  },
  premiumBanner: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  premiumGradient: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  premiumTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: 'bold',
    color: colors.text.white,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  premiumSubtitle: {
    fontSize: typography.fontSize.xs,
    color: colors.text.white,
    opacity: 0.9,
    textAlign: 'center',
  },
});

export default HomeScreen;