import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { usePremium } from '../context/PremiumContext';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';
import LocalStorageService from '../services/LocalStorageService';
import Toast from 'react-native-toast-message';

const SettingsScreen = () => {
  const navigation = useNavigation();
  const { theme, themeMode, setTheme } = useTheme();
  const { premiumStatus } = usePremium();
  const { logout, getAuthenticatedProviders } = useAuth();
  
  const [preferences, setPreferences] = useState({
    notifications: true,
    autoCleanup: false,
    exportFormat: 'json',
  });

  const handleThemeToggle = () => {
    const nextTheme = themeMode === 'light' ? 'dark' : themeMode === 'dark' ? 'system' : 'light';
    setTheme(nextTheme);
  };

  const handleExportData = async () => {
    try {
      const exportData = await LocalStorageService.exportUserData();
      if (exportData) {
        await Share.share({
          message: JSON.stringify(exportData, null, 2),
          title: 'Accountrix Export Data',
        });
      }
    } catch (error) {
      console.error('Export failed:', error);
      Toast.show({
        type: 'error',
        text1: 'Export Failed',
        text2: 'Unable to export data',
      });
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your stored session data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear Data', style: 'destructive', onPress: confirmClearData },
      ]
    );
  };

  const confirmClearData = async () => {
    try {
      await LocalStorageService.clear();
      Toast.show({
        type: 'success',
        text1: 'Data Cleared',
        text2: 'All stored data has been removed',
      });
      navigation.navigate('Home');
    } catch (error) {
      console.error('Clear data failed:', error);
      Toast.show({
        type: 'error',
        text1: 'Clear Failed',
        text2: 'Unable to clear data',
      });
    }
  };

  const handleLogoutAll = () => {
    Alert.alert(
      'Logout from All Accounts',
      'This will logout from all connected accounts. You will need to reconnect them.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout All', style: 'destructive', onPress: confirmLogoutAll },
      ]
    );
  };

  const confirmLogoutAll = async () => {
    try {
      const providers = getAuthenticatedProviders();
      const promises = providers.map(provider => logout(provider));
      await Promise.all(promises);
      
      Toast.show({
        type: 'success',
        text1: 'Logged Out',
        text2: 'Successfully logged out from all accounts',
      });
      navigation.navigate('Home');
    } catch (error) {
      console.error('Logout all failed:', error);
      Toast.show({
        type: 'error',
        text1: 'Logout Failed',
        text2: 'Some accounts may still be connected',
      });
    }
  };

  const handlePreferenceChange = async (key, value) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    
    try {
      await LocalStorageService.saveUserPreferences(newPreferences);
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  };

  const SettingItem = ({ title, subtitle, rightComponent, onPress, danger = false }) => (
    <TouchableOpacity
      style={[styles.settingItem, { backgroundColor: theme.colors.surface }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, { color: danger ? colors.error : theme.colors.text }]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles.settingSubtitle, { color: colors.text.secondary }]}>
            {subtitle}
          </Text>
        )}
      </View>
      {rightComponent}
    </TouchableOpacity>
  );

  const SettingSection = ({ title, children }) => (
    <View style={styles.settingSection}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        {title}
      </Text>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Settings
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Account Section */}
        <SettingSection title="Account">
          <SettingItem
            title="Premium Status"
            subtitle={premiumStatus.isPremium ? `${premiumStatus.plan} plan` : 'Free plan'}
            rightComponent={
              <TouchableOpacity
                style={[styles.premiumBadge, { backgroundColor: premiumStatus.isPremium ? colors.premium.purple : colors.gray[300] }]}
                onPress={() => navigation.navigate('Premium')}
              >
                <Text style={[styles.premiumBadgeText, { color: premiumStatus.isPremium ? colors.text.white : colors.text.secondary }]}>
                  {premiumStatus.isPremium ? 'PREMIUM' : 'UPGRADE'}
                </Text>
              </TouchableOpacity>
            }
            onPress={() => navigation.navigate('Premium')}
          />
          
          <SettingItem
            title="Connected Accounts"
            subtitle={`${getAuthenticatedProviders().length} accounts connected`}
            rightComponent={
              <Text style={[styles.settingValue, { color: colors.text.secondary }]}>
                {getAuthenticatedProviders().join(', ')}
              </Text>
            }
          />
        </SettingSection>

        {/* Appearance Section */}
        <SettingSection title="Appearance">
          <SettingItem
            title="Theme"
            subtitle={`Currently using ${themeMode} mode`}
            rightComponent={
              <TouchableOpacity
                style={[styles.themeButton, { backgroundColor: theme.colors.primary }]}
                onPress={handleThemeToggle}
              >
                <Text style={styles.themeButtonText}>
                  {themeMode === 'light' ? '🌙' : themeMode === 'dark' ? '🌍' : '☀️'}
                </Text>
              </TouchableOpacity>
            }
            onPress={handleThemeToggle}
          />
        </SettingSection>

        {/* Preferences Section */}
        <SettingSection title="Preferences">
          <SettingItem
            title="Notifications"
            subtitle="Receive alerts for security recommendations"
            rightComponent={
              <Switch
                value={preferences.notifications}
                onValueChange={(value) => handlePreferenceChange('notifications', value)}
                trackColor={{ false: colors.gray[300], true: colors.primary }}
                thumbColor={preferences.notifications ? colors.text.white : colors.gray[500]}
              />
            }
          />
          
          <SettingItem
            title="Auto Cleanup"
            subtitle="Automatically clean up inactive sessions"
            rightComponent={
              <Switch
                value={preferences.autoCleanup}
                onValueChange={(value) => handlePreferenceChange('autoCleanup', value)}
                trackColor={{ false: colors.gray[300], true: colors.primary }}
                thumbColor={preferences.autoCleanup ? colors.text.white : colors.gray[500]}
              />
            }
          />
          
          <SettingItem
            title="Export Format"
            subtitle="Default format for data export"
            rightComponent={
              <TouchableOpacity
                style={[styles.formatSelector, { backgroundColor: theme.colors.background }]}
                onPress={() => {
                  const nextFormat = preferences.exportFormat === 'json' ? 'csv' : 'json';
                  handlePreferenceChange('exportFormat', nextFormat);
                }}
              >
                <Text style={[styles.formatText, { color: theme.colors.text }]}>
                  {preferences.exportFormat.toUpperCase()}
                </Text>
              </TouchableOpacity>
            }
          />
        </SettingSection>

        {/* Data Section */}
        <SettingSection title="Data Management">
          <SettingItem
            title="Export Data"
            subtitle="Export all your session data"
            rightComponent={
              <Text style={[styles.settingArrow, { color: colors.text.secondary }]}>
                →
              </Text>
            }
            onPress={handleExportData}
          />
          
          <SettingItem
            title="Storage Info"
            subtitle="Local storage usage"
            rightComponent={
              <Text style={[styles.settingValue, { color: colors.text.secondary }]}>
                {LocalStorageService.getStoragePath()}
              </Text>
            }
          />
        </SettingSection>

        {/* Security Section */}
        <SettingSection title="Security">
          <SettingItem
            title="Logout All Accounts"
            subtitle="Disconnect all connected accounts"
            rightComponent={
              <Text style={[styles.settingArrow, { color: colors.error }]}>
                →
              </Text>
            }
            onPress={handleLogoutAll}
            danger
          />
          
          <SettingItem
            title="Clear All Data"
            subtitle="Permanently delete all stored data"
            rightComponent={
              <Text style={[styles.settingArrow, { color: colors.error }]}>
                →
              </Text>
            }
            onPress={handleClearData}
            danger
          />
        </SettingSection>

        {/* About Section */}
        <SettingSection title="About">
          <SettingItem
            title="Version"
            subtitle="App version and build info"
            rightComponent={
              <Text style={[styles.settingValue, { color: colors.text.secondary }]}>
                1.0.0
              </Text>
            }
          />
          
          <SettingItem
            title="Privacy Policy"
            subtitle="How we handle your data"
            rightComponent={
              <Text style={[styles.settingArrow, { color: colors.text.secondary }]}>
                →
              </Text>
            }
            onPress={() => {
              Toast.show({
                type: 'info',
                text1: 'Privacy First',
                text2: 'All data is stored locally on your device',
              });
            }}
          />
        </SettingSection>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    ...shadows.sm,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gray[100],
    marginRight: spacing.md,
  },
  backIcon: {
    fontSize: typography.fontSize.lg,
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  settingSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: '600',
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sectionContent: {
    gap: spacing.xs,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  settingSubtitle: {
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.normal * typography.fontSize.sm,
  },
  settingValue: {
    fontSize: typography.fontSize.sm,
    textAlign: 'right',
    maxWidth: 120,
  },
  settingArrow: {
    fontSize: typography.fontSize.lg,
    fontWeight: 'bold',
  },
  premiumBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  premiumBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: 'bold',
  },
  themeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeButtonText: {
    fontSize: typography.fontSize.lg,
  },
  formatSelector: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.gray[300],
  },
  formatText: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
  },
});

export default SettingsScreen;