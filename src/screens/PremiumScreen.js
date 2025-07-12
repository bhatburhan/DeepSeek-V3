import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { usePremium } from '../context/PremiumContext';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';
import Toast from 'react-native-toast-message';
import ConfettiCannon from 'react-native-confetti-cannon';

const { width } = Dimensions.get('window');

const PremiumScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { theme } = useTheme();
  const { 
    premiumStatus, 
    purchasePremium, 
    restorePurchases, 
    getPlanPrice,
    getPlanFeatures,
    getTimeUntilExpiry,
    isSubscriptionActive,
    PRODUCT_IDS,
    PREMIUM_FEATURES,
    isLoading
  } = usePremium();
  
  const [selectedPlan, setSelectedPlan] = useState('premium');
  const [showConfetti, setShowConfetti] = useState(false);
  const highlightedFeature = route.params?.feature;

  const plans = [
    {
      id: 'lite',
      name: 'Lite Plan',
      price: '$3.99',
      period: 'per month',
      description: 'Perfect for regular users',
      color: colors.primary,
      features: getPlanFeatures('lite'),
      popular: false,
    },
    {
      id: 'premium',
      name: 'Full Plan',
      price: '$6.99',
      period: 'per month',
      description: 'Complete account management',
      color: colors.premium.purple,
      features: getPlanFeatures('premium'),
      popular: true,
    },
  ];

  const handlePlanSelect = (planId) => {
    setSelectedPlan(planId);
  };

  const handlePurchase = async () => {
    try {
      const productId = selectedPlan === 'lite' ? PRODUCT_IDS.lite : PRODUCT_IDS.premium;
      const result = await purchasePremium(productId);
      
      if (result.success) {
        setShowConfetti(true);
        setTimeout(() => {
          navigation.goBack();
        }, 2000);
      }
    } catch (error) {
      console.error('Purchase error:', error);
    }
  };

  const handleRestore = async () => {
    try {
      const result = await restorePurchases();
      if (result.success && result.plan !== 'free') {
        Toast.show({
          type: 'success',
          text1: 'Purchases Restored',
          text2: `Your ${result.plan} subscription has been restored`,
        });
      }
    } catch (error) {
      console.error('Restore error:', error);
    }
  };

  const handleManageSubscription = () => {
    Alert.alert(
      'Manage Subscription',
      'To manage your subscription, go to your device settings > App Store/Play Store > Subscriptions.',
      [
        { text: 'OK' },
        { text: 'Cancel Subscription', style: 'destructive', onPress: handleCancelSubscription },
      ]
    );
  };

  const handleCancelSubscription = () => {
    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your current billing period.',
      [
        { text: 'Keep Subscription', style: 'cancel' },
        { text: 'Cancel', style: 'destructive', onPress: confirmCancelSubscription },
      ]
    );
  };

  const confirmCancelSubscription = () => {
    // This would typically open the subscription management page
    Toast.show({
      type: 'info',
      text1: 'Subscription Management',
      text2: 'Please manage your subscription through your device settings',
    });
  };

  const renderFeatureItem = (feature, planColor, isHighlighted = false) => (
    <View 
      key={feature}
      style={[
        styles.featureItem,
        isHighlighted && styles.highlightedFeature,
        isHighlighted && { backgroundColor: `${planColor}15` }
      ]}
    >
      <View style={[styles.featureIcon, { backgroundColor: planColor }]}>
        <Text style={styles.featureIconText}>✓</Text>
      </View>
      <Text style={[
        styles.featureText, 
        { color: theme.colors.text },
        isHighlighted && styles.highlightedFeatureText
      ]}>
        {getFeatureDisplayName(feature)}
      </Text>
      {isHighlighted && (
        <View style={[styles.highlightBadge, { backgroundColor: planColor }]}>
          <Text style={styles.highlightBadgeText}>NEW</Text>
        </View>
      )}
    </View>
  );

  const getFeatureDisplayName = (feature) => {
    const featureNames = {
      'view_google_sessions': 'View Google sessions',
      'view_microsoft_sessions': 'View Microsoft sessions',
      'view_apple_sessions': 'View Apple ID sessions',
      'one_click_logout': 'One-click logout',
      'multi_session_selection': 'Multi-session selection',
      'mass_logout': 'Mass logout operations',
      'basic_export': 'Basic session export',
      'enhanced_export': 'Enhanced export formats',
      'full_risk_reports': 'Full risk reports',
      'session_health_score': 'Session health score',
      'basic_cleanup_tips': 'Basic cleanup tips',
      'ai_security_suggestions': 'AI security suggestions',
      'auto_cleanup_inactive': 'Auto-cleanup inactive sessions',
      'priority_support': 'Priority support',
    };
    return featureNames[feature] || feature;
  };

  const renderPlanCard = (plan) => (
    <TouchableOpacity
      key={plan.id}
      style={[
        styles.planCard,
        { backgroundColor: theme.colors.surface },
        selectedPlan === plan.id && styles.selectedPlan,
        selectedPlan === plan.id && { borderColor: plan.color },
        plan.popular && styles.popularPlan,
      ]}
      onPress={() => handlePlanSelect(plan.id)}
      activeOpacity={0.9}
    >
      {plan.popular && (
        <View style={[styles.popularBadge, { backgroundColor: plan.color }]}>
          <Text style={styles.popularText}>MOST POPULAR</Text>
        </View>
      )}
      
      <View style={styles.planHeader}>
        <Text style={[styles.planName, { color: plan.color }]}>
          {plan.name}
        </Text>
        <View style={styles.planPricing}>
          <Text style={[styles.planPrice, { color: theme.colors.text }]}>
            {plan.price}
          </Text>
          <Text style={[styles.planPeriod, { color: colors.text.secondary }]}>
            {plan.period}
          </Text>
        </View>
        <Text style={[styles.planDescription, { color: colors.text.secondary }]}>
          {plan.description}
        </Text>
      </View>
      
      <View style={styles.planFeatures}>
        {plan.features.map((feature) => 
          renderFeatureItem(feature, plan.color, feature === highlightedFeature)
        )}
      </View>
    </TouchableOpacity>
  );

  const renderCurrentSubscription = () => {
    if (!premiumStatus.isPremium) return null;

    const timeLeft = getTimeUntilExpiry();
    const isActive = isSubscriptionActive();

    return (
      <View style={[styles.currentSubscriptionCard, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.subscriptionHeader}>
          <Text style={[styles.subscriptionTitle, { color: theme.colors.text }]}>
            Current Subscription
          </Text>
          <View style={[
            styles.subscriptionStatus,
            { backgroundColor: isActive ? colors.success : colors.error }
          ]}>
            <Text style={styles.subscriptionStatusText}>
              {isActive ? 'Active' : 'Expired'}
            </Text>
          </View>
        </View>
        
        <Text style={[styles.subscriptionPlan, { color: colors.premium.purple }]}>
          {premiumStatus.plan.charAt(0).toUpperCase() + premiumStatus.plan.slice(1)} Plan
        </Text>
        
        {timeLeft && (
          <Text style={[styles.subscriptionExpiry, { color: colors.text.secondary }]}>
            {timeLeft.days > 0 
              ? `${timeLeft.days} days remaining`
              : `${timeLeft.hours} hours remaining`
            }
          </Text>
        )}
        
        <TouchableOpacity
          style={[styles.manageButton, { backgroundColor: colors.premium.purple }]}
          onPress={handleManageSubscription}
        >
          <Text style={styles.manageButtonText}>Manage Subscription</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LinearGradient
        colors={[colors.premium.purple, colors.premium.gold]}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>
              {premiumStatus.isPremium ? 'Manage Premium' : 'Go Premium'}
            </Text>
            <Text style={styles.headerSubtitle}>
              {premiumStatus.isPremium 
                ? 'Manage your subscription and features'
                : 'Unlock the full power of Accountrix'
              }
            </Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Current Subscription */}
        {renderCurrentSubscription()}

        {/* Plans */}
        {!premiumStatus.isPremium && (
          <View style={styles.plansSection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Choose Your Plan
            </Text>
            
            <View style={styles.plansContainer}>
              {plans.map(renderPlanCard)}
            </View>
          </View>
        )}

        {/* Features Comparison */}
        <View style={styles.featuresSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            What's Included
          </Text>
          
          <View style={styles.featuresList}>
            <View style={styles.featureCategory}>
              <Text style={[styles.featureCategoryTitle, { color: theme.colors.text }]}>
                Session Management
              </Text>
              {renderFeatureItem('view_google_sessions', colors.google)}
              {renderFeatureItem('view_microsoft_sessions', colors.microsoft)}
              {renderFeatureItem('view_apple_sessions', colors.apple, highlightedFeature === 'view_apple_sessions')}
              {renderFeatureItem('one_click_logout', colors.primary, highlightedFeature === 'one_click_logout')}
              {renderFeatureItem('mass_logout', colors.primary, highlightedFeature === 'mass_logout')}
            </View>
            
            <View style={styles.featureCategory}>
              <Text style={[styles.featureCategoryTitle, { color: theme.colors.text }]}>
                Security & Analytics
              </Text>
              {renderFeatureItem('session_health_score', colors.success)}
              {renderFeatureItem('ai_security_suggestions', colors.premium.purple, highlightedFeature === 'ai_security_suggestions')}
              {renderFeatureItem('full_risk_reports', colors.warning, highlightedFeature === 'full_risk_reports')}
              {renderFeatureItem('auto_cleanup_inactive', colors.primary)}
            </View>
            
            <View style={styles.featureCategory}>
              <Text style={[styles.featureCategoryTitle, { color: theme.colors.text }]}>
                Export & Support
              </Text>
              {renderFeatureItem('enhanced_export', colors.primary, highlightedFeature === 'enhanced_export')}
              {renderFeatureItem('priority_support', colors.premium.gold)}
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        {!premiumStatus.isPremium && (
          <View style={styles.actionsSection}>
            <TouchableOpacity
              style={[styles.purchaseButton, { backgroundColor: colors.premium.purple }]}
              onPress={handlePurchase}
              disabled={isLoading}
            >
              <Text style={styles.purchaseButtonText}>
                {isLoading ? 'Processing...' : `Subscribe to ${selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)}`}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.restoreButton}
              onPress={handleRestore}
            >
              <Text style={[styles.restoreButtonText, { color: colors.premium.purple }]}>
                Restore Purchases
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Terms */}
        <View style={styles.termsSection}>
          <Text style={[styles.termsText, { color: colors.text.tertiary }]}>
            Subscriptions will be charged to your credit card through your iTunes/Google Play account. 
            Your subscription will automatically renew unless cancelled at least 24 hours before the end of the current period.
          </Text>
        </View>
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
  headerGradient: {
    paddingBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginRight: spacing.md,
  },
  backIcon: {
    fontSize: typography.fontSize.lg,
    color: colors.text.white,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: 'bold',
    color: colors.text.white,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.base,
    color: colors.text.white,
    opacity: 0.9,
  },
  content: {
    flex: 1,
  },
  currentSubscriptionCard: {
    margin: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    ...shadows.md,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  subscriptionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
  },
  subscriptionStatus: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  subscriptionStatusText: {
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
    color: colors.text.white,
  },
  subscriptionPlan: {
    fontSize: typography.fontSize.xl,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  subscriptionExpiry: {
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.md,
  },
  manageButton: {
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  manageButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: '600',
    color: colors.text.white,
  },
  plansSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  plansContainer: {
    gap: spacing.md,
  },
  planCard: {
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: 'transparent',
    ...shadows.sm,
  },
  selectedPlan: {
    borderWidth: 2,
    ...shadows.md,
  },
  popularPlan: {
    transform: [{ scale: 1.02 }],
  },
  popularBadge: {
    position: 'absolute',
    top: -1,
    right: spacing.lg,
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
    fontSize: typography.fontSize.xl,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  planPricing: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.sm,
  },
  planPrice: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: 'bold',
    marginRight: spacing.xs,
  },
  planPeriod: {
    fontSize: typography.fontSize.sm,
  },
  planDescription: {
    fontSize: typography.fontSize.sm,
  },
  planFeatures: {
    gap: spacing.sm,
  },
  featuresSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  featuresList: {
    gap: spacing.lg,
  },
  featureCategory: {
    gap: spacing.sm,
  },
  featureCategoryTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
  },
  highlightedFeature: {
    borderWidth: 1,
    borderColor: colors.premium.purple,
  },
  featureIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureIconText: {
    fontSize: typography.fontSize.xs,
    fontWeight: 'bold',
    color: colors.text.white,
  },
  featureText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
  },
  highlightedFeatureText: {
    fontWeight: '600',
  },
  highlightBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  highlightBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: 'bold',
    color: colors.text.white,
  },
  actionsSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  purchaseButton: {
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    ...shadows.md,
  },
  purchaseButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: '600',
    color: colors.text.white,
  },
  restoreButton: {
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.premium.purple,
  },
  restoreButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: '500',
  },
  termsSection: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  termsText: {
    fontSize: typography.fontSize.xs,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.xs,
    textAlign: 'center',
  },
});

export default PremiumScreen;