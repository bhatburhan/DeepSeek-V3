import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { lightTheme, darkTheme } from '../theme';
import LocalStorageService from '../services/LocalStorageService';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState('system'); // 'light', 'dark', 'system'
  const [currentTheme, setCurrentTheme] = useState(lightTheme);

  useEffect(() => {
    loadThemePreference();
  }, []);

  useEffect(() => {
    updateTheme();
  }, [themeMode, systemColorScheme]);

  const loadThemePreference = async () => {
    try {
      const preferences = await LocalStorageService.getUserPreferences();
      setThemeMode(preferences.theme || 'system');
    } catch (error) {
      console.error('Failed to load theme preference:', error);
    }
  };

  const updateTheme = () => {
    let newTheme;
    
    if (themeMode === 'system') {
      newTheme = systemColorScheme === 'dark' ? darkTheme : lightTheme;
    } else {
      newTheme = themeMode === 'dark' ? darkTheme : lightTheme;
    }
    
    setCurrentTheme(newTheme);
  };

  const setTheme = async (mode) => {
    try {
      setThemeMode(mode);
      
      // Save preference
      const preferences = await LocalStorageService.getUserPreferences();
      await LocalStorageService.saveUserPreferences({
        ...preferences,
        theme: mode,
      });
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  };

  const toggleTheme = () => {
    if (themeMode === 'light') {
      setTheme('dark');
    } else if (themeMode === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  const isDarkMode = currentTheme === darkTheme;

  const value = {
    theme: currentTheme,
    themeMode,
    isDarkMode,
    setTheme,
    toggleTheme,
    colors: currentTheme.colors,
    fonts: currentTheme.fonts,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};