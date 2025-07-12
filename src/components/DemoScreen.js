import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import InteractiveButton from './InteractiveButton';
import InteractiveCard from './InteractiveCard';
import { colors, spacing, typography, borderRadius, createGlowStyle } from '../theme';

const { width } = Dimensions.get('window');

const DemoScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#4285F4', '#8B5CF6', '#FF6B35']}
        style={styles.gradient}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>
              ✨ Interactive Demo
            </Text>
            <Text style={styles.subtitle}>
              Hover & Touch Effects with Flowing Glow
            </Text>
          </View>

          {/* Interactive Buttons Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Interactive Buttons</Text>
            
            <View style={styles.buttonGrid}>
              <InteractiveButton
                style={styles.demoButton}
                variant="primary"
                glowColor={colors.glow.primary}
              >
                Primary Button
              </InteractiveButton>
              
              <InteractiveButton
                style={styles.demoButton}
                variant="secondary"
                glowColor={colors.glow.primary}
              >
                Secondary Button
              </InteractiveButton>
              
              <InteractiveButton
                style={styles.demoButton}
                variant="provider"
                provider="google"
                glowColor={colors.glow.google}
              >
                Google Provider
              </InteractiveButton>
              
              <InteractiveButton
                style={styles.demoButton}
                variant="provider"
                provider="microsoft"
                glowColor={colors.glow.microsoft}
              >
                Microsoft Provider
              </InteractiveButton>
            </View>
          </View>

          {/* Interactive Cards Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Interactive Cards</Text>
            
            <View style={styles.cardGrid}>
              <InteractiveCard
                style={styles.demoCard}
                glowColor={colors.glow.google}
                intensity={0.4}
              >
                <View style={[styles.cardIcon, { backgroundColor: colors.google }]}>
                  <Text style={styles.iconText}>G</Text>
                </View>
                <Text style={styles.cardTitle}>Google Card</Text>
                <Text style={styles.cardDescription}>
                  Hover to see the glow effect
                </Text>
              </InteractiveCard>
              
              <InteractiveCard
                style={styles.demoCard}
                glowColor={colors.glow.microsoft}
                intensity={0.4}
              >
                <View style={[styles.cardIcon, { backgroundColor: colors.microsoft }]}>
                  <View style={styles.microsoftSquares}>
                    <View style={[styles.microsoftSquare, { backgroundColor: '#f25022' }]} />
                    <View style={[styles.microsoftSquare, { backgroundColor: '#7fba00' }]} />
                    <View style={[styles.microsoftSquare, { backgroundColor: '#00a4ef' }]} />
                    <View style={[styles.microsoftSquare, { backgroundColor: '#ffb900' }]} />
                  </View>
                </View>
                <Text style={styles.cardTitle}>Microsoft Card</Text>
                <Text style={styles.cardDescription}>
                  Touch for scale animation
                </Text>
              </InteractiveCard>
            </View>
          </View>

          {/* Premium Effects Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Premium Effects</Text>
            
            <InteractiveCard
              style={styles.premiumCard}
              glowColor={colors.glow.premium}
              intensity={0.6}
              hoverScale={1.03}
            >
              <LinearGradient
                colors={colors.premium.gradient}
                style={styles.premiumGradient}
              >
                <Text style={styles.premiumTitle}>Premium Glow</Text>
                <Text style={styles.premiumSubtitle}>
                  Enhanced interactions with flowing animations
                </Text>
              </LinearGradient>
            </InteractiveCard>
          </View>

          {/* Feature Showcase */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Features Showcase</Text>
            
            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>🌟</Text>
                <Text style={styles.featureText}>Hover Effects (Web)</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>📱</Text>
                <Text style={styles.featureText}>Touch Feedback (Mobile)</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>✨</Text>
                <Text style={styles.featureText}>Flowing Glow Animations</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>🎯</Text>
                <Text style={styles.featureText}>Center Aligned Layout</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>📏</Text>
                <Text style={styles.featureText}>Smaller Readable Text</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureIcon}>🎨</Text>
                <Text style={styles.featureText}>Brand Color Glows</Text>
              </View>
            </View>
          </View>

          {/* Instructions */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Try hovering over elements (web) or tapping them (mobile) to see the interactive effects!
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
    padding: spacing.xl,
    alignItems: 'center',
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: 'bold',
    color: colors.text.white,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.text.white,
    opacity: 0.9,
    textAlign: 'center',
  },
  section: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    color: colors.text.white,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  buttonGrid: {
    gap: spacing.md,
    width: '100%',
    alignItems: 'center',
  },
  demoButton: {
    width: '80%',
    minHeight: 50,
  },
  cardGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  demoCard: {
    width: (width - spacing.lg * 3) / 2,
    minHeight: 120,
    alignItems: 'center',
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  iconText: {
    fontSize: typography.fontSize.lg,
    fontWeight: 'bold',
    color: colors.text.white,
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
  cardTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  cardDescription: {
    fontSize: typography.fontSize.xs,
    textAlign: 'center',
    opacity: 0.7,
  },
  premiumCard: {
    width: '90%',
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  premiumGradient: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  premiumTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: 'bold',
    color: colors.text.white,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  premiumSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.white,
    opacity: 0.9,
    textAlign: 'center',
  },
  featuresList: {
    gap: spacing.md,
    width: '100%',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  featureIcon: {
    fontSize: typography.fontSize.lg,
  },
  featureText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.white,
    fontWeight: '500',
  },
  footer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  footerText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.white,
    opacity: 0.8,
    textAlign: 'center',
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.xs,
  },
});

export default DemoScreen;