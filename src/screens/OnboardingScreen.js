import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { usePremium } from '../context/PremiumContext';
import LocalStorageService from '../services/LocalStorageService';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';
import Toast from 'react-native-toast-message';

const { width, height } = Dimensions.get('window');

const OnboardingScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { purchasePremium, getPlanPrice, PRODUCT_IDS } = usePremium();
  const [selectedPlan, setSelectedPlan] = useState('free');
  const [isLoading, setIsLoading] = useState(false);

  const plans = [
    {
      id: 'free',
      name: 'Free Plan',
      price: 'Free',
      description: 'Perfect for getting started',
      features: [
        'View Google sessions',
        'View Microsoft sessions',
        'Basic session export',
        'Session health score',
        'Basic cleanup tips',
      ],
      color: colors.gray[600],
      popular: false,
    },
    {
      id: 'lite',
      name: 'Lite Plan',
      price: '$3.99/month',
      description: 'Great for regular users',
      features: [
        'Everything in Free',
        'One-click logout',
        'Multi-session selection',
        'Enhanced export formats',
        'Auto-cleanup inactive sessions',
      ],
      color: colors.primary,
      popular: true,
    },
    {
      id: 'premium',
      name: 'Full Plan',
      price: '$6.99/month',
      description: 'Complete account management',
      features: [
        'Everything in Lite',
        'Apple ID session viewer',
        'Mass logout operations',
        'AI security suggestions',
        'Full risk reports',
        'Priority support',
      ],
      color: colors.premium.purple,
      popular: false,
    },
  ];

  const handlePlanSelect = (planId) => {
    setSelectedPlan(planId);
  };

  const handleGetStarted = async () => {
    try {
      setIsLoading(true);

      if (selectedPlan !== 'free') {
        const productId = selectedPlan === 'lite' ? PRODUCT_IDS.lite : PRODUCT_IDS.premium;
        const result = await purchasePremium(productId);
        
        if (!result.success) {
          Toast.show({
            type: 'error',
            text1: 'Purchase Failed',
            text2: 'Please try again or select Free plan to continue.',
          });
          return;
        }
      }

      // Mark onboarding as complete
      await LocalStorageService.setItem('hasOnboarded', true);
      
      // Navigate to home screen
      navigation.replace('Home');
    } catch (error) {
      console.error('Onboarding error:', error);
      Toast.show({
        type: 'error',
        text1: 'Something went wrong',
        text2: 'Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = async () => {
    try {
      await LocalStorageService.setItem('hasOnboarded', true);
      navigation.replace('Home');
    } catch (error) {
      console.error('Skip onboarding error:', error);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LinearGradient
        colors={['#4285F4', '#8B5CF6', '#FF6B35']}
        style={styles.gradient}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text.white }]}>
              Welcome to Accountrix
            </Text>
            <Text style={[styles.subtitle, { color: colors.text.white }]}>
              Take control of your digital identity{'\n'}Choose your plan to get started
            </Text>
          </View>

          {/* Plan Cards */}
          <View style={styles.plansContainer}>
            {plans.map((plan) => (
              <TouchableOpacity
                key={plan.id}
                style={[
                  styles.planCard,
                  selectedPlan === plan.id && styles.selectedPlan,
                  plan.popular && styles.popularPlan,
                ]}
                onPress={() => handlePlanSelect(plan.id)}
                activeOpacity={0.9}
              >
                <BlurView intensity={20} tint="light" style={styles.cardBlur}>
                  {plan.popular && (
                    <View style={styles.popularBadge}>
                      <Text style={styles.popularText}>MOST POPULAR</Text>
                    </View>
                  )}
                  
                  <View style={styles.planHeader}>
                    <Text style={[styles.planName, { color: plan.color }]}>
                      {plan.name}
                    </Text>
                    <Text style={[styles.planPrice, { color: plan.color }]}>
                      {plan.price}
                    </Text>
                  </View>
                  
                  <Text style={styles.planDescription}>
                    {plan.description}
                  </Text>
                  
                  <View style={styles.featuresContainer}>
                    {plan.features.map((feature, index) => (
                      <View key={index} style={styles.featureItem}>
                        <View style={[styles.checkIcon, { backgroundColor: plan.color }]}>
                          <Text style={styles.checkText}>✓</Text>
                        </View>
                        <Text style={styles.featureText}>{feature}</Text>
                      </View>
                    ))}
                  </View>
                </BlurView>
              </TouchableOpacity>
            ))}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: colors.text.white }]}
              onPress={handleGetStarted}
              disabled={isLoading}
            >
              <Text style={[styles.primaryButtonText, { color: colors.primary }]}>
                {isLoading ? 'Setting up...' : 'Get Started'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleSkip}
            >
              <Text style={[styles.secondaryButtonText, { color: colors.text.white }]}>
                Skip for now
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.text.white }]}>
              Privacy-first • Local storage only • No cloud sync
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    alignItems: 'center',
  },
  title: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subtitle: {
    fontSize: typography.fontSize.lg,
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.lg,
  },
  plansContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  planCard: {
    marginBottom: spacing.md,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedPlan: {
    borderColor: colors.text.white,
    ...shadows.lg,
  },
  popularPlan: {
    transform: [{ scale: 1.02 }],
  },
  cardBlur: {
    padding: spacing.lg,
  },
  popularBadge: {
    position: 'absolute',
    top: -1,
    right: spacing.md,
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    transform: [{ translateY: -spacing.xs }],
  },
  popularText: {
    fontSize: typography.fontSize.xs,
    fontWeight: 'bold',
    color: colors.text.white,
  },
  planHeader: {
    marginBottom: spacing.md,
  },
  planName: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  planPrice: {
    fontSize: typography.fontSize.xl,
    fontWeight: '600',
  },
  planDescription: {
    fontSize: typography.fontSize.base,
    color: colors.gray[700],
    marginBottom: spacing.md,
  },
  featuresContainer: {
    gap: spacing.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  checkIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: {
    color: colors.text.white,
    fontSize: typography.fontSize.sm,
    fontWeight: 'bold',
  },
  featureText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.gray[700],
  },
  actionsContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  primaryButton: {
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    ...shadows.md,
  },
  primaryButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
  },
  secondaryButton: {
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.text.white,
  },
  secondaryButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    alignItems: 'center',
  },
  footerText: {
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
    opacity: 0.8,
  },
});

export default OnboardingScreen;