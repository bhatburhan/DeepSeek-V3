import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Alert,
  Share,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { useAuth } from '../context/AuthContext';
import { usePremium } from '../context/PremiumContext';
import { useTheme } from '../context/ThemeContext';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';
import { SessionService } from '../services/SessionService';
import Toast from 'react-native-toast-message';
import { format } from 'date-fns';
import ConfettiCannon from 'react-native-confetti-cannon';

const { width } = Dimensions.get('window');

const DetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { provider } = route.params;
  const { theme } = useTheme();
  const { sessions, refreshSessions, revokeSession, isAuthenticated, login } = useAuth();
  const { hasFeature } = usePremium();
  
  const [index, setIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSessions, setSelectedSessions] = useState([]);
  const [isMultiSelect, setIsMultiSelect] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [healthScore, setHealthScore] = useState(null);

  const [routes] = useState([
    { key: 'devices', title: 'Devices' },
    { key: 'apps', title: 'Apps' },
    { key: 'websites', title: 'Websites' },
  ]);

  const providerSessions = sessions[provider] || [];

  useEffect(() => {
    if (!isAuthenticated(provider)) {
      // Redirect to auth if not authenticated
      navigation.navigate('Auth', { provider });
    } else {
      loadHealthScore();
    }
  }, [provider, isAuthenticated]);

  const loadHealthScore = async () => {
    try {
      const score = await SessionService.getSessionHealthScore(providerSessions);
      setHealthScore(score);
    } catch (error) {
      console.error('Failed to load health score:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshSessions(provider);
      await loadHealthScore();
      Toast.show({
        type: 'success',
        text1: 'Sessions Updated',
        text2: `${provider} sessions have been refreshed`,
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

  const handleSessionPress = (session) => {
    if (isMultiSelect) {
      toggleSessionSelection(session);
    } else {
      // Show session details or open app
      Alert.alert(
        'Session Actions',
        `What would you like to do with ${session.name}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open App', onPress: () => openSession(session) },
          { text: 'Export Data', onPress: () => exportSession(session) },
          ...(hasFeature('one_click_logout') 
            ? [{ text: 'Logout', onPress: () => handleLogout(session), style: 'destructive' }]
            : []
          ),
        ]
      );
    }
  };

  const toggleSessionSelection = (session) => {
    if (selectedSessions.includes(session.id)) {
      setSelectedSessions(prev => prev.filter(id => id !== session.id));
    } else {
      setSelectedSessions(prev => [...prev, session.id]);
    }
  };

  const openSession = (session) => {
    // This would open the app or website
    Toast.show({
      type: 'info',
      text1: 'Opening Session',
      text2: `Launching ${session.name}`,
    });
  };

  const exportSession = async (session) => {
    try {
      const data = {
        provider,
        session,
        exportDate: new Date().toISOString(),
      };
      
      await Share.share({
        message: `Session Data for ${session.name}:\n\n${JSON.stringify(data, null, 2)}`,
        title: `${session.name} Session Data`,
      });
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleLogout = async (session) => {
    if (!hasFeature('one_click_logout')) {
      Toast.show({
        type: 'info',
        text1: 'Premium Feature',
        text2: 'One-click logout is available in premium plans',
      });
      navigation.navigate('Premium', { feature: 'one_click_logout' });
      return;
    }

    Alert.alert(
      'Confirm Logout',
      `Are you sure you want to logout from ${session.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          onPress: () => performLogout(session),
          style: 'destructive' 
        },
      ]
    );
  };

  const performLogout = async (session) => {
    try {
      const result = await revokeSession(provider, session.id);
      
      if (result.success) {
        setShowConfetti(true);
        Toast.show({
          type: 'success',
          text1: 'Logout Successful',
          text2: `You've been logged out from ${session.name}`,
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Logout Failed',
          text2: result.error || 'Please try again',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Logout Failed',
        text2: 'Something went wrong',
      });
    }
  };

  const handleMultiSelect = () => {
    setIsMultiSelect(!isMultiSelect);
    if (!isMultiSelect) {
      setSelectedSessions([]);
    }
  };

  const handleMassLogout = async () => {
    if (!hasFeature('mass_logout')) {
      Toast.show({
        type: 'info',
        text1: 'Premium Feature',
        text2: 'Mass logout is available in premium plans',
      });
      navigation.navigate('Premium', { feature: 'mass_logout' });
      return;
    }

    if (selectedSessions.length === 0) {
      Toast.show({
        type: 'info',
        text1: 'No Sessions Selected',
        text2: 'Please select sessions to logout from',
      });
      return;
    }

    Alert.alert(
      'Confirm Mass Logout',
      `Are you sure you want to logout from ${selectedSessions.length} sessions?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout All', 
          onPress: performMassLogout,
          style: 'destructive' 
        },
      ]
    );
  };

  const performMassLogout = async () => {
    try {
      const promises = selectedSessions.map(sessionId => 
        revokeSession(provider, sessionId)
      );
      
      const results = await Promise.all(promises);
      const successCount = results.filter(r => r.success).length;
      
      if (successCount > 0) {
        setShowConfetti(true);
        Toast.show({
          type: 'success',
          text1: 'Mass Logout Complete',
          text2: `Successfully logged out from ${successCount} sessions`,
        });
      }
      
      setSelectedSessions([]);
      setIsMultiSelect(false);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Mass Logout Failed',
        text2: 'Some sessions may not have been logged out',
      });
    }
  };

  const filterSessionsByType = (type) => {
    return providerSessions.filter(session => {
      switch (type) {
        case 'devices':
          return session.type === 'device' || session.platform !== 'Web';
        case 'apps':
          return session.type === 'app' || session.platform === 'Mobile';
        case 'websites':
          return session.type === 'web' || session.platform === 'Web';
        default:
          return true;
      }
    });
  };

  const renderSessionItem = ({ item: session }) => (
    <TouchableOpacity
      style={[
        styles.sessionCard,
        { backgroundColor: theme.colors.surface },
        selectedSessions.includes(session.id) && styles.selectedCard,
      ]}
      onPress={() => handleSessionPress(session)}
      onLongPress={() => {
        if (!isMultiSelect) {
          setIsMultiSelect(true);
        }
        toggleSessionSelection(session);
      }}
    >
      <View style={styles.sessionIcon}>
        <Text style={styles.sessionIconText}>
          {session.icon === 'web' ? '🌐' : 
           session.icon === 'mail' ? '📧' : 
           session.icon === 'play' ? '▶️' : 
           session.icon === 'folder' ? '📁' : 
           session.icon === 'cloud' ? '☁️' : 
           session.icon === 'shopping-bag' ? '🛍️' : 
           session.icon === 'message-square' ? '💬' : '📱'}
        </Text>
      </View>
      
      <View style={styles.sessionInfo}>
        <Text style={[styles.sessionName, { color: theme.colors.text }]}>
          {session.name}
        </Text>
        <Text style={[styles.sessionDevice, { color: colors.text.secondary }]}>
          {session.device} • {session.platform}
        </Text>
        <Text style={[styles.sessionLastActive, { color: colors.text.tertiary }]}>
          Last active: {format(new Date(session.lastActive), 'MMM d, yyyy h:mm a')}
        </Text>
      </View>
      
      <View style={styles.sessionActions}>
        {isMultiSelect && (
          <View style={[
            styles.checkbox,
            selectedSessions.includes(session.id) && styles.checkboxSelected,
          ]}>
            {selectedSessions.includes(session.id) && (
              <Text style={styles.checkboxText}>✓</Text>
            )}
          </View>
        )}
        
        {session.riskScore && (
          <View style={[
            styles.riskBadge,
            { backgroundColor: session.riskScore > 70 ? colors.success : colors.warning },
          ]}>
            <Text style={styles.riskText}>{session.riskScore}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderScene = ({ route }) => {
    const filteredSessions = filterSessionsByType(route.key);
    
    return (
      <FlatList
        data={filteredSessions}
        renderItem={renderSessionItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.sessionsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📱</Text>
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
              No {route.title} Found
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.text.secondary }]}>
              Pull to refresh or connect your {provider} account
            </Text>
          </View>
        }
      />
    );
  };

  const renderTabBar = (props) => (
    <TabBar
      {...props}
      indicatorStyle={{ backgroundColor: colors[provider] }}
      style={{ backgroundColor: theme.colors.surface }}
      labelStyle={{ color: theme.colors.text, fontSize: typography.fontSize.sm }}
      activeColor={colors[provider]}
      inactiveColor={colors.text.secondary}
    />
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <View>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
              {provider.charAt(0).toUpperCase() + provider.slice(1)} Sessions
            </Text>
            <Text style={[styles.headerSubtitle, { color: colors.text.secondary }]}>
              {providerSessions.length} sessions found
            </Text>
          </View>
        </View>
        
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: colors[provider] }]}
            onPress={handleMultiSelect}
          >
            <Text style={styles.headerButtonText}>
              {isMultiSelect ? '✓' : '⚡'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Health Score */}
      {healthScore && (
        <View style={[styles.healthContainer, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.healthScore}>
            <Text style={[styles.healthScoreValue, { color: theme.colors.text }]}>
              {healthScore.score}
            </Text>
            <Text style={[styles.healthScoreGrade, { color: colors[provider] }]}>
              Grade {healthScore.grade}
            </Text>
          </View>
          <View style={styles.healthRecommendations}>
            <Text style={[styles.healthTitle, { color: theme.colors.text }]}>
              Session Health
            </Text>
            <Text style={[styles.healthRecommendation, { color: colors.text.secondary }]}>
              {healthScore.recommendations[0]}
            </Text>
          </View>
        </View>
      )}

      {/* Multi-select Actions */}
      {isMultiSelect && (
        <View style={[styles.multiSelectBar, { backgroundColor: colors[provider] }]}>
          <Text style={styles.multiSelectText}>
            {selectedSessions.length} selected
          </Text>
          <TouchableOpacity
            style={styles.multiSelectButton}
            onPress={handleMassLogout}
          >
            <Text style={styles.multiSelectButtonText}>Logout All</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Tabs */}
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        renderTabBar={renderTabBar}
        onIndexChange={setIndex}
        initialLayout={{ width }}
      />

      {/* Confetti */}
      {showConfetti && (
        <ConfettiCannon
          count={150}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    ...shadows.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gray[100],
  },
  backIcon: {
    fontSize: typography.fontSize.lg,
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
  },
  headerSubtitle: {
    fontSize: typography.fontSize.sm,
  },
  headerRight: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerButtonText: {
    color: colors.text.white,
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
  },
  healthContainer: {
    flexDirection: 'row',
    padding: spacing.md,
    ...shadows.sm,
  },
  healthScore: {
    alignItems: 'center',
    marginRight: spacing.md,
  },
  healthScoreValue: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: 'bold',
  },
  healthScoreGrade: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
  },
  healthRecommendations: {
    flex: 1,
  },
  healthTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  healthRecommendation: {
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.normal * typography.fontSize.sm,
  },
  multiSelectBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  multiSelectText: {
    color: colors.text.white,
    fontSize: typography.fontSize.base,
    fontWeight: '500',
  },
  multiSelectButton: {
    backgroundColor: colors.text.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  multiSelectButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
  },
  sessionsList: {
    padding: spacing.md,
  },
  sessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  sessionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gray[100],
    marginRight: spacing.md,
  },
  sessionIconText: {
    fontSize: typography.fontSize.lg,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionName: {
    fontSize: typography.fontSize.base,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  sessionDevice: {
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.xs,
  },
  sessionLastActive: {
    fontSize: typography.fontSize.xs,
  },
  sessionActions: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.gray[300],
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxText: {
    color: colors.text.white,
    fontSize: typography.fontSize.sm,
    fontWeight: 'bold',
  },
  riskBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  riskText: {
    color: colors.text.white,
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['4xl'],
  },
  emptyIcon: {
    fontSize: typography.fontSize['4xl'],
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
  },
});

export default DetailsScreen;