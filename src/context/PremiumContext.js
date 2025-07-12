import React, { createContext, useContext, useEffect, useState } from 'react';
import * as InAppPurchases from 'expo-in-app-purchases';
import { Platform } from 'react-native';
import LocalStorageService from '../services/LocalStorageService';
import Toast from 'react-native-toast-message';

const PremiumContext = createContext();

export const usePremium = () => {
  const context = useContext(PremiumContext);
  if (!context) {
    throw new Error('usePremium must be used within a PremiumProvider');
  }
  return context;
};

// Product IDs for in-app purchases
const PRODUCT_IDS = {
  lite: 'com.accountrix.app.lite',
  premium: 'com.accountrix.app.premium',
};

// Premium features mapping
const PREMIUM_FEATURES = {
  free: [
    'view_google_sessions',
    'view_microsoft_sessions',
    'basic_export',
    'session_health_score',
    'basic_cleanup_tips',
  ],
  lite: [
    'view_google_sessions',
    'view_microsoft_sessions',
    'one_click_logout',
    'multi_session_selection',
    'enhanced_export',
    'session_health_score',
    'basic_cleanup_tips',
    'auto_cleanup_inactive',
  ],
  premium: [
    'view_google_sessions',
    'view_microsoft_sessions',
    'view_apple_sessions',
    'one_click_logout',
    'multi_session_selection',
    'mass_logout',
    'enhanced_export',
    'full_risk_reports',
    'session_health_score',
    'ai_security_suggestions',
    'auto_cleanup_inactive',
    'priority_support',
  ],
};

export const PremiumProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [premiumStatus, setPremiumStatus] = useState({
    isPremium: false,
    plan: 'free',
    expiresAt: null,
    features: PREMIUM_FEATURES.free,
  });
  const [products, setProducts] = useState([]);
  const [purchaseHistory, setPurchaseHistory] = useState([]);

  useEffect(() => {
    initializePremium();
  }, []);

  const initializePremium = async () => {
    try {
      setIsLoading(true);
      
      // Initialize IAP
      await InAppPurchases.connectAsync();
      
      // Load stored premium status
      const storedStatus = await LocalStorageService.getPremiumStatus();
      setPremiumStatus(storedStatus);
      
      // Get available products
      const { results } = await InAppPurchases.getProductsAsync(Object.values(PRODUCT_IDS));
      setProducts(results);
      
      // Check for existing purchases
      await checkPurchaseHistory();
      
    } catch (error) {
      console.error('Failed to initialize premium:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkPurchaseHistory = async () => {
    try {
      const { results } = await InAppPurchases.getPurchaseHistoryAsync();
      setPurchaseHistory(results);
      
      // Check for active subscriptions
      const activeSubscriptions = results.filter(purchase => {
        const expiryDate = new Date(purchase.expirationDate);
        return expiryDate > new Date();
      });
      
      if (activeSubscriptions.length > 0) {
        const latestSubscription = activeSubscriptions.sort(
          (a, b) => new Date(b.expirationDate) - new Date(a.expirationDate)
        )[0];
        
        const plan = latestSubscription.productId === PRODUCT_IDS.premium ? 'premium' : 'lite';
        
        await updatePremiumStatus({
          isPremium: true,
          plan,
          expiresAt: latestSubscription.expirationDate,
          features: PREMIUM_FEATURES[plan],
        });
      }
    } catch (error) {
      console.error('Failed to check purchase history:', error);
    }
  };

  const updatePremiumStatus = async (status) => {
    try {
      await LocalStorageService.savePremiumStatus(status);
      setPremiumStatus(status);
    } catch (error) {
      console.error('Failed to update premium status:', error);
    }
  };

  const purchasePremium = async (productId) => {
    try {
      setIsLoading(true);
      
      const { results } = await InAppPurchases.purchaseItemAsync(productId);
      
      if (results && results.length > 0) {
        const purchase = results[0];
        
        if (purchase.acknowledged) {
          const plan = productId === PRODUCT_IDS.premium ? 'premium' : 'lite';
          
          await updatePremiumStatus({
            isPremium: true,
            plan,
            expiresAt: purchase.expirationDate,
            features: PREMIUM_FEATURES[plan],
          });
          
          Toast.show({
            type: 'success',
            text1: 'Purchase Successful!',
            text2: `Welcome to Accountrix ${plan.charAt(0).toUpperCase() + plan.slice(1)}!`,
          });
          
          return { success: true, purchase };
        }
      }
      
      return { success: false, error: 'Purchase not completed' };
    } catch (error) {
      console.error('Purchase failed:', error);
      
      Toast.show({
        type: 'error',
        text1: 'Purchase Failed',
        text2: error.message || 'Something went wrong. Please try again.',
      });
      
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const restorePurchases = async () => {
    try {
      setIsLoading(true);
      
      const { results } = await InAppPurchases.getPurchaseHistoryAsync();
      setPurchaseHistory(results);
      
      // Find the most recent active subscription
      const activeSubscriptions = results.filter(purchase => {
        const expiryDate = new Date(purchase.expirationDate);
        return expiryDate > new Date();
      });
      
      if (activeSubscriptions.length > 0) {
        const latestSubscription = activeSubscriptions.sort(
          (a, b) => new Date(b.expirationDate) - new Date(a.expirationDate)
        )[0];
        
        const plan = latestSubscription.productId === PRODUCT_IDS.premium ? 'premium' : 'lite';
        
        await updatePremiumStatus({
          isPremium: true,
          plan,
          expiresAt: latestSubscription.expirationDate,
          features: PREMIUM_FEATURES[plan],
        });
        
        Toast.show({
          type: 'success',
          text1: 'Purchases Restored!',
          text2: `Your ${plan} subscription has been restored.`,
        });
        
        return { success: true, plan };
      } else {
        Toast.show({
          type: 'info',
          text1: 'No Active Subscriptions',
          text2: 'No active premium subscriptions found.',
        });
        
        return { success: true, plan: 'free' };
      }
    } catch (error) {
      console.error('Failed to restore purchases:', error);
      
      Toast.show({
        type: 'error',
        text1: 'Restore Failed',
        text2: error.message || 'Failed to restore purchases.',
      });
      
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const hasFeature = (featureName) => {
    return premiumStatus.features.includes(featureName);
  };

  const getFeatureGate = (featureName) => {
    if (hasFeature(featureName)) {
      return { allowed: true, plan: premiumStatus.plan };
    }
    
    // Find the minimum plan that includes this feature
    const plans = Object.keys(PREMIUM_FEATURES);
    for (const plan of plans) {
      if (PREMIUM_FEATURES[plan].includes(featureName)) {
        return { allowed: false, requiredPlan: plan };
      }
    }
    
    return { allowed: false, requiredPlan: 'premium' };
  };

  const getPlanPrice = (planId) => {
    const product = products.find(p => p.productId === planId);
    return product ? product.price : null;
  };

  const getPlanFeatures = (planName) => {
    return PREMIUM_FEATURES[planName] || [];
  };

  const isSubscriptionActive = () => {
    if (!premiumStatus.isPremium || !premiumStatus.expiresAt) {
      return false;
    }
    
    const expiryDate = new Date(premiumStatus.expiresAt);
    return expiryDate > new Date();
  };

  const getTimeUntilExpiry = () => {
    if (!premiumStatus.expiresAt) {
      return null;
    }
    
    const expiryDate = new Date(premiumStatus.expiresAt);
    const now = new Date();
    const timeLeft = expiryDate - now;
    
    if (timeLeft <= 0) {
      return null;
    }
    
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    return { days, hours, timeLeft };
  };

  const showUpgradeModal = (featureName) => {
    const gate = getFeatureGate(featureName);
    if (!gate.allowed) {
      // This would trigger the upgrade modal
      return {
        show: true,
        feature: featureName,
        requiredPlan: gate.requiredPlan,
        currentPlan: premiumStatus.plan,
      };
    }
    return { show: false };
  };

  const value = {
    isLoading,
    premiumStatus,
    products,
    purchaseHistory,
    hasFeature,
    getFeatureGate,
    getPlanPrice,
    getPlanFeatures,
    isSubscriptionActive,
    getTimeUntilExpiry,
    showUpgradeModal,
    purchasePremium,
    restorePurchases,
    updatePremiumStatus,
    PRODUCT_IDS,
    PREMIUM_FEATURES,
  };

  return (
    <PremiumContext.Provider value={value}>
      {children}
    </PremiumContext.Provider>
  );
};