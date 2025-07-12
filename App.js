import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-url-polyfill/auto';
import 'react-native-get-random-values';

// Screens
import OnboardingScreen from './src/screens/OnboardingScreen';
import HomeScreen from './src/screens/HomeScreen';
import DetailsScreen from './src/screens/DetailsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import PremiumScreen from './src/screens/PremiumScreen';
import AuthScreen from './src/screens/AuthScreen';

// Services
import { ThemeProvider } from './src/context/ThemeContext';
import { AuthProvider } from './src/context/AuthContext';
import { PremiumProvider } from './src/context/PremiumContext';
import { LocalStorageService } from './src/services/LocalStorageService';
import { theme } from './src/theme';

const Stack = createStackNavigator();

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(true);

  useEffect(() => {
    async function prepare() {
      try {
        // Check if user has completed onboarding
        const hasOnboarded = await LocalStorageService.getItem('hasOnboarded');
        setShowOnboarding(!hasOnboarded);
        
        // Initialize app services
        await LocalStorageService.init();
        
        // Pre-load any resources here
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (e) {
        console.warn(e);
      } finally {
        setIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = React.useCallback(async () => {
    if (isReady) {
      await SplashScreen.hideAsync();
    }
  }, [isReady]);

  if (!isReady) {
    return null;
  }

  return (
    <View style={styles.container} onLayout={onLayoutRootView}>
      <ThemeProvider>
        <PaperProvider theme={theme}>
          <AuthProvider>
            <PremiumProvider>
              <NavigationContainer>
                <Stack.Navigator
                  screenOptions={{
                    headerShown: false,
                    cardStyle: { backgroundColor: '#F9FAFB' },
                    cardStyleInterpolator: ({ current, layouts }) => {
                      return {
                        cardStyle: {
                          transform: [
                            {
                              translateX: current.progress.interpolate({
                                inputRange: [0, 1],
                                outputRange: [layouts.screen.width, 0],
                              }),
                            },
                          ],
                        },
                      };
                    },
                  }}
                >
                  {showOnboarding ? (
                    <Stack.Screen name="Onboarding" component={OnboardingScreen} />
                  ) : (
                    <>
                      <Stack.Screen name="Home" component={HomeScreen} />
                      <Stack.Screen name="Details" component={DetailsScreen} />
                      <Stack.Screen name="Settings" component={SettingsScreen} />
                      <Stack.Screen name="Premium" component={PremiumScreen} />
                      <Stack.Screen name="Auth" component={AuthScreen} />
                    </>
                  )}
                </Stack.Navigator>
              </NavigationContainer>
              <Toast />
            </PremiumProvider>
          </AuthProvider>
        </PaperProvider>
      </ThemeProvider>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
});