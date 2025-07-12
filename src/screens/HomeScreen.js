import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
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
import { colors, spacing, typography, borderRadius, shadows } from '../theme';
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
        <TouchableOpacity
          style={[
            styles.providerButton,
            { backgroundColor: provider.backgroundColor },
            !provider.available && styles.disabledProvider,
          ]}
          onPress={() => handleProviderPress(provider)}
          activeOpacity={0.8}
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
        </TouchableOpacity>
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
            <TouchableOpacity
              style={[styles.settingsButton, { backgroundColor: theme.colors.surface }]}
              onPress={handleSettingsPress}
            >
              <Text style={styles.settingsIcon}>⚙️</Text>
            </TouchableOpacity>
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
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.colors.surface }]}
              onPress={handleRefresh}
              disabled={isLoading}
            >
              <Text style={styles.actionIcon}>🔄</Text>
              <Text style={[styles.actionText, { color: theme.colors.text }]}>
                Refresh All
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.colors.surface }]}
              onPress={handlePremiumPress}
            >
              <Text style={styles.actionIcon}>⭐</Text>
              <Text style={[styles.actionText, { color: theme.colors.text }]}>
                {premiumStatus.isPremium ? 'Manage Plan' : 'Go Premium'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Premium Banner */}
        {!premiumStatus.isPremium && (
          <TouchableOpacity
            style={styles.premiumBanner}
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
          </TouchableOpacity>
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
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  greeting: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  settingsIcon: {
    fontSize: typography.fontSize.lg,
  },
  statsContainer: {
    flexDirection: 'row',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.gray[300],
    marginHorizontal: spacing.sm,
  },
  providersContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  providersGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  providerContainer: {
    alignItems: 'center',
  },
  providerButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
    position: 'relative',
  },
  disabledProvider: {
    opacity: 0.6,
  },
  lockOverlay: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.premium.gold,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  lockIcon: {
    fontSize: 12,
  },
  providerIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
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
    width: 24,
    height: 24,
  },
  microsoftSquare: {
    width: 10,
    height: 10,
    margin: 1,
  },
  appleIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: typography.fontSize.xl,
    fontWeight: 'bold',
  },
  providerName: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  sessionCount: {
    fontSize: typography.fontSize.xs,
    opacity: 0.7,
  },
  quickActionsContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    ...shadows.sm,
  },
  actionIcon: {
    fontSize: typography.fontSize.xl,
    marginBottom: spacing.xs,
  },
  actionText: {
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
  },
  premiumBanner: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.md,
  },
  premiumGradient: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  premiumTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: 'bold',
    color: colors.text.white,
    marginBottom: spacing.xs,
  },
  premiumSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.white,
    opacity: 0.9,
    textAlign: 'center',
  },
});

export default HomeScreen;