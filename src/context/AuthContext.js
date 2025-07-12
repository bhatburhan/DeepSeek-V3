import React, { createContext, useContext, useEffect, useState } from 'react';
import { authorize, refresh, revoke } from 'react-native-app-auth';
import { Platform } from 'react-native';
import LocalStorageService from '../services/LocalStorageService';
import { SessionService } from '../services/SessionService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// OAuth configurations
const authConfigs = {
  google: {
    issuer: 'https://accounts.google.com',
    clientId: 'YOUR_GOOGLE_CLIENT_ID',
    redirectUrl: 'com.accountrix.app://oauth/google',
    scopes: ['openid', 'profile', 'email', 'https://www.googleapis.com/auth/userinfo.profile'],
    additionalParameters: {
      access_type: 'offline',
      prompt: 'consent',
    },
  },
  microsoft: {
    issuer: 'https://login.microsoftonline.com/common/v2.0',
    clientId: 'YOUR_MICROSOFT_CLIENT_ID',
    redirectUrl: 'com.accountrix.app://oauth/microsoft',
    scopes: ['openid', 'profile', 'email', 'User.Read', 'Directory.AccessAsUser.All'],
    additionalParameters: {
      prompt: 'consent',
    },
  },
  apple: Platform.OS === 'ios' ? {
    issuer: 'https://appleid.apple.com',
    clientId: 'YOUR_APPLE_CLIENT_ID',
    redirectUrl: 'com.accountrix.app://oauth/apple',
    scopes: ['openid', 'email', 'name'],
  } : null,
};

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [authTokens, setAuthTokens] = useState({
    google: null,
    microsoft: null,
    apple: null,
  });
  const [userInfo, setUserInfo] = useState({
    google: null,
    microsoft: null,
    apple: null,
  });
  const [sessions, setSessions] = useState({
    google: [],
    microsoft: [],
    apple: [],
  });

  useEffect(() => {
    loadStoredTokens();
  }, []);

  const loadStoredTokens = async () => {
    try {
      const storedTokens = await LocalStorageService.getItem('auth_tokens');
      const storedUserInfo = await LocalStorageService.getItem('user_info');
      
      if (storedTokens) {
        setAuthTokens(storedTokens);
      }
      
      if (storedUserInfo) {
        setUserInfo(storedUserInfo);
      }

      // Load sessions for each provider
      const googleSessions = await LocalStorageService.getUserSessions('google');
      const microsoftSessions = await LocalStorageService.getUserSessions('microsoft');
      const appleSessions = await LocalStorageService.getUserSessions('apple');

      setSessions({
        google: googleSessions,
        microsoft: microsoftSessions,
        apple: appleSessions,
      });
    } catch (error) {
      console.error('Failed to load stored tokens:', error);
    }
  };

  const saveTokens = async (provider, tokens, user) => {
    try {
      const newTokens = { ...authTokens, [provider]: tokens };
      const newUserInfo = { ...userInfo, [provider]: user };
      
      await LocalStorageService.setItem('auth_tokens', newTokens);
      await LocalStorageService.setItem('user_info', newUserInfo);
      
      setAuthTokens(newTokens);
      setUserInfo(newUserInfo);
    } catch (error) {
      console.error('Failed to save tokens:', error);
    }
  };

  const login = async (provider) => {
    try {
      setIsLoading(true);
      
      const config = authConfigs[provider];
      if (!config) {
        throw new Error(`Auth config not found for provider: ${provider}`);
      }

      const result = await authorize(config);
      
      // Get user info
      const userInfo = await SessionService.getUserInfo(provider, result.accessToken);
      
      // Save tokens and user info
      await saveTokens(provider, result, userInfo);
      
      // Fetch sessions
      await refreshSessions(provider);
      
      return { success: true, data: result };
    } catch (error) {
      console.error(`Login failed for ${provider}:`, error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (provider) => {
    try {
      setIsLoading(true);
      
      const tokens = authTokens[provider];
      if (!tokens) {
        return { success: true };
      }

      const config = authConfigs[provider];
      if (config && tokens.accessToken) {
        await revoke(config, {
          tokenToRevoke: tokens.accessToken,
        });
      }

      // Clear stored data
      const newTokens = { ...authTokens, [provider]: null };
      const newUserInfo = { ...userInfo, [provider]: null };
      const newSessions = { ...sessions, [provider]: [] };
      
      await LocalStorageService.setItem('auth_tokens', newTokens);
      await LocalStorageService.setItem('user_info', newUserInfo);
      await LocalStorageService.saveUserSessions(provider, []);
      
      setAuthTokens(newTokens);
      setUserInfo(newUserInfo);
      setSessions(newSessions);
      
      return { success: true };
    } catch (error) {
      console.error(`Logout failed for ${provider}:`, error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSessions = async (provider) => {
    try {
      const tokens = authTokens[provider];
      if (!tokens) {
        return;
      }

      const fetchedSessions = await SessionService.getUserSessions(provider, tokens.accessToken);
      
      // Save sessions
      await LocalStorageService.saveUserSessions(provider, fetchedSessions);
      
      // Update state
      setSessions(prev => ({
        ...prev,
        [provider]: fetchedSessions,
      }));
      
      return fetchedSessions;
    } catch (error) {
      console.error(`Failed to refresh sessions for ${provider}:`, error);
      return [];
    }
  };

  const refreshAllSessions = async () => {
    try {
      setIsLoading(true);
      
      const providers = Object.keys(authTokens).filter(provider => authTokens[provider]);
      
      await Promise.all(
        providers.map(provider => refreshSessions(provider))
      );
      
      return { success: true };
    } catch (error) {
      console.error('Failed to refresh all sessions:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const revokeSession = async (provider, sessionId) => {
    try {
      const tokens = authTokens[provider];
      if (!tokens) {
        throw new Error('No authentication tokens found');
      }

      const result = await SessionService.revokeSession(provider, tokens.accessToken, sessionId);
      
      if (result.success) {
        // Refresh sessions to get updated list
        await refreshSessions(provider);
      }
      
      return result;
    } catch (error) {
      console.error(`Failed to revoke session for ${provider}:`, error);
      return { success: false, error: error.message };
    }
  };

  const getTotalSessions = () => {
    return Object.values(sessions).reduce((total, providerSessions) => total + providerSessions.length, 0);
  };

  const getAuthenticatedProviders = () => {
    return Object.keys(authTokens).filter(provider => authTokens[provider]);
  };

  const isAuthenticated = (provider) => {
    return !!authTokens[provider];
  };

  const value = {
    isLoading,
    authTokens,
    userInfo,
    sessions,
    login,
    logout,
    refreshSessions,
    refreshAllSessions,
    revokeSession,
    getTotalSessions,
    getAuthenticatedProviders,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};