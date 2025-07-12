import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';
import Toast from 'react-native-toast-message';
import ConfettiCannon from 'react-native-confetti-cannon';

const { width } = Dimensions.get('window');

const AuthScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { provider } = route.params;
  const { theme } = useTheme();
  const { login, isLoading } = useAuth();
  
  const [showConfetti, setShowConfetti] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const providerInfo = {
    google: {
      name: 'Google',
      color: colors.google,
      icon: 'G',
      description: 'Connect your Google account to view and manage your active sessions across Gmail, YouTube, Drive, and other Google services.',
      benefits: [
        'View all Google app sessions',
        'See device and location info',
        'Export session data',
        'Security recommendations',
      ],
    },
    microsoft: {
      name: 'Microsoft',
      color: colors.microsoft,
      icon: '⊞',
      description: 'Connect your Microsoft account to manage sessions across Outlook, Teams, OneDrive, and other Microsoft services.',
      benefits: [
        'View all Microsoft app sessions',
        'Monitor Office 365 activity',
        'Track sign-in locations',
        'Enhanced security insights',
      ],
    },
    apple: {
      name: 'Apple',
      color: colors.apple,
      icon: '🍎',
      description: 'Connect your Apple ID to view and manage sessions across iCloud, App Store, and other Apple services.',
      benefits: [
        'View Apple ID sessions',
        'Monitor iCloud activity',
        'Track device access',
        'Premium security features',
      ],
    },
  };

  const info = providerInfo[provider];

  useEffect(() => {
    if (!info) {
      navigation.goBack();
    }
  }, [provider, info, navigation]);

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      const result = await login(provider);
      
      if (result.success) {
        setShowConfetti(true);
        Toast.show({
          type: 'success',
          text1: 'Connected Successfully!',
          text2: `Your ${info.name} account is now connected`,
        });
        
        // Navigate to details after short delay
        setTimeout(() => {
          navigation.replace('Details', { provider });
        }, 2000);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Connection Failed',
          text2: result.error || 'Please try again',
        });
      }
    } catch (error) {
      console.error('Auth error:', error);
      Toast.show({
        type: 'error',
        text1: 'Connection Failed',
        text2: 'Something went wrong. Please try again.',
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  const handlePrivacyInfo = () => {
    Alert.alert(
      'Privacy & Security',
      'Accountrix stores all your data locally on your device. We never send your session data to our servers or third parties. Your authentication tokens are encrypted and stored securely.',
      [
        { text: 'Learn More', onPress: () => {
          Toast.show({
            type: 'info',
            text1: 'Privacy First',
            text2: 'All data stays on your device',
          });
        }},
        { text: 'OK' },
      ]
    );
  };

  if (!info) {
    return null;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LinearGradient
        colors={[info.color, `${info.color}80`]}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleCancel}
          >
            <Text style={styles.backIcon}>×</Text>
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <View style={[styles.providerIcon, { backgroundColor: colors.text.white }]}>
              {provider === 'google' && (
                <Text style={[styles.iconText, { color: info.color }]}>G</Text>
              )}
              {provider === 'microsoft' && (
                <View style={styles.microsoftIcon}>
                  <View style={styles.microsoftSquares}>
                    <View style={[styles.microsoftSquare, { backgroundColor: '#f25022' }]} />
                    <View style={[styles.microsoftSquare, { backgroundColor: '#7fba00' }]} />
                    <View style={[styles.microsoftSquare, { backgroundColor: '#00a4ef' }]} />
                    <View style={[styles.microsoftSquare, { backgroundColor: '#ffb900' }]} />
                  </View>
                </View>
              )}
              {provider === 'apple' && (
                <Text style={styles.iconText}>🍎</Text>
              )}
            </View>
            
            <Text style={styles.headerTitle}>
              Connect {info.name}
            </Text>
            <Text style={styles.headerSubtitle}>
              Secure account authentication
            </Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Description */}
        <View style={styles.descriptionSection}>
          <Text style={[styles.descriptionTitle, { color: theme.colors.text }]}>
            What You'll Get
          </Text>
          <Text style={[styles.descriptionText, { color: colors.text.secondary }]}>
            {info.description}
          </Text>
        </View>

        {/* Benefits */}
        <View style={styles.benefitsSection}>
          <Text style={[styles.benefitsTitle, { color: theme.colors.text }]}>
            Features
          </Text>
          <View style={styles.benefitsList}>
            {info.benefits.map((benefit, index) => (
              <View key={index} style={styles.benefitItem}>
                <View style={[styles.benefitIcon, { backgroundColor: info.color }]}>
                  <Text style={styles.benefitIconText}>✓</Text>
                </View>
                <Text style={[styles.benefitText, { color: theme.colors.text }]}>
                  {benefit}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Security Notice */}
        <View style={[styles.securitySection, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.securityTitle, { color: theme.colors.text }]}>
            🔒 Privacy & Security
          </Text>
          <Text style={[styles.securityText, { color: colors.text.secondary }]}>
            All data is stored locally on your device. We never access or store your personal information.
          </Text>
          <TouchableOpacity
            style={styles.learnMoreButton}
            onPress={handlePrivacyInfo}
          >
            <Text style={[styles.learnMoreText, { color: info.color }]}>
              Learn More
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsSection}>
        <TouchableOpacity
          style={[styles.connectButton, { backgroundColor: info.color }]}
          onPress={handleConnect}
          disabled={isConnecting || isLoading}
        >
          <Text style={styles.connectButtonText}>
            {isConnecting || isLoading ? 'Connecting...' : `Connect ${info.name}`}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleCancel}
        >
          <Text style={[styles.cancelButtonText, { color: colors.text.secondary }]}>
            Cancel
          </Text>
        </TouchableOpacity>
      </View>

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
    paddingBottom: spacing.xl,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.lg,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    zIndex: 1,
  },
  backIcon: {
    fontSize: typography.fontSize.xl,
    color: colors.text.white,
    fontWeight: 'bold',
  },
  headerContent: {
    alignItems: 'center',
    paddingTop: spacing.xl,
  },
  providerIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    ...shadows.lg,
  },
  iconText: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: 'bold',
  },
  microsoftIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  microsoftSquares: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 32,
    height: 32,
  },
  microsoftSquare: {
    width: 14,
    height: 14,
    margin: 1,
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
    paddingHorizontal: spacing.lg,
  },
  descriptionSection: {
    paddingVertical: spacing.xl,
  },
  descriptionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  descriptionText: {
    fontSize: typography.fontSize.base,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
  },
  benefitsSection: {
    paddingBottom: spacing.xl,
  },
  benefitsTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  benefitsList: {
    gap: spacing.md,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  benefitIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitIconText: {
    fontSize: typography.fontSize.sm,
    fontWeight: 'bold',
    color: colors.text.white,
  },
  benefitText: {
    flex: 1,
    fontSize: typography.fontSize.base,
  },
  securitySection: {
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.xl,
    ...shadows.sm,
  },
  securityTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  securityText: {
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.normal * typography.fontSize.sm,
    marginBottom: spacing.md,
  },
  learnMoreButton: {
    alignSelf: 'flex-start',
  },
  learnMoreText: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
  },
  actionsSection: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  connectButton: {
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    ...shadows.md,
  },
  connectButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    color: colors.text.white,
  },
  cancelButton: {
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray[300],
  },
  cancelButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: '500',
  },
});

export default AuthScreen;