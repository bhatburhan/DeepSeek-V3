import AsyncStorage from '@react-native-async-storage/async-storage';
import EncryptedStorage from 'react-native-encrypted-storage';
import * as FileSystem from 'expo-file-system';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';

class LocalStorageService {
  constructor() {
    this.isInitialized = false;
    this.userDataPath = '';
    this.encryptionKey = null;
  }

  async init() {
    try {
      // Set up the user data directory path
      if (Platform.OS === 'android') {
        this.userDataPath = `${FileSystem.documentDirectory}Android/data/com.accountrix.app/users/data/`;
      } else {
        this.userDataPath = `${FileSystem.documentDirectory}users/data/`;
      }

      // Create the directory if it doesn't exist
      const dirInfo = await FileSystem.getInfoAsync(this.userDataPath);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(this.userDataPath, { intermediates: true });
      }

      // Initialize encryption key
      await this.initializeEncryptionKey();

      this.isInitialized = true;
      console.log('LocalStorageService initialized successfully');
    } catch (error) {
      console.error('Failed to initialize LocalStorageService:', error);
      throw error;
    }
  }

  async initializeEncryptionKey() {
    try {
      // Try to get existing encryption key
      let key = await EncryptedStorage.getItem('encryption_key');
      
      if (!key) {
        // Generate new encryption key
        key = await Crypto.digestStringAsync(
          Crypto.CryptoDigestAlgorithm.SHA256,
          `accountrix_${Date.now()}_${Math.random()}`,
          { encoding: Crypto.CryptoEncoding.HEX }
        );
        
        // Store the key securely
        await EncryptedStorage.setItem('encryption_key', key);
      }

      this.encryptionKey = key;
    } catch (error) {
      console.error('Failed to initialize encryption key:', error);
      throw error;
    }
  }

  async encrypt(data) {
    try {
      const jsonString = JSON.stringify(data);
      const encrypted = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        jsonString + this.encryptionKey,
        { encoding: Crypto.CryptoEncoding.BASE64 }
      );
      return `${encrypted}:${Buffer.from(jsonString).toString('base64')}`;
    } catch (error) {
      console.error('Encryption failed:', error);
      return JSON.stringify(data); // Fallback to plain text
    }
  }

  async decrypt(encryptedData) {
    try {
      if (!encryptedData.includes(':')) {
        // Not encrypted, return as is
        return JSON.parse(encryptedData);
      }
      
      const [hash, data] = encryptedData.split(':');
      const jsonString = Buffer.from(data, 'base64').toString();
      
      // Verify hash
      const expectedHash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        jsonString + this.encryptionKey,
        { encoding: Crypto.CryptoEncoding.BASE64 }
      );
      
      if (hash !== expectedHash) {
        throw new Error('Data integrity check failed');
      }
      
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Decryption failed:', error);
      try {
        // Try to parse as plain JSON (fallback)
        return JSON.parse(encryptedData);
      } catch {
        return null;
      }
    }
  }

  async setItem(key, value) {
    try {
      if (!this.isInitialized) {
        await this.init();
      }

      const encryptedValue = await this.encrypt(value);
      
      // Store in both encrypted storage and file system
      await EncryptedStorage.setItem(key, encryptedValue);
      
      // Also store in file system for persistence
      const filePath = `${this.userDataPath}${key}.json`;
      await FileSystem.writeAsStringAsync(filePath, encryptedValue);
      
      return true;
    } catch (error) {
      console.error(`Failed to set item ${key}:`, error);
      return false;
    }
  }

  async getItem(key) {
    try {
      if (!this.isInitialized) {
        await this.init();
      }

      // Try to get from encrypted storage first
      let encryptedValue = await EncryptedStorage.getItem(key);
      
      if (!encryptedValue) {
        // Try to get from file system
        const filePath = `${this.userDataPath}${key}.json`;
        const fileInfo = await FileSystem.getInfoAsync(filePath);
        
        if (fileInfo.exists) {
          encryptedValue = await FileSystem.readAsStringAsync(filePath);
        }
      }

      if (!encryptedValue) {
        return null;
      }

      return await this.decrypt(encryptedValue);
    } catch (error) {
      console.error(`Failed to get item ${key}:`, error);
      return null;
    }
  }

  async removeItem(key) {
    try {
      if (!this.isInitialized) {
        await this.init();
      }

      // Remove from encrypted storage
      await EncryptedStorage.removeItem(key);
      
      // Remove from file system
      const filePath = `${this.userDataPath}${key}.json`;
      const fileInfo = await FileSystem.getInfoAsync(filePath);
      
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(filePath);
      }
      
      return true;
    } catch (error) {
      console.error(`Failed to remove item ${key}:`, error);
      return false;
    }
  }

  async clear() {
    try {
      if (!this.isInitialized) {
        await this.init();
      }

      // Clear encrypted storage
      await EncryptedStorage.clear();
      
      // Clear file system directory
      const dirInfo = await FileSystem.getInfoAsync(this.userDataPath);
      if (dirInfo.exists) {
        await FileSystem.deleteAsync(this.userDataPath);
        await FileSystem.makeDirectoryAsync(this.userDataPath, { intermediates: true });
      }
      
      return true;
    } catch (error) {
      console.error('Failed to clear storage:', error);
      return false;
    }
  }

  async getAllKeys() {
    try {
      if (!this.isInitialized) {
        await this.init();
      }

      const files = await FileSystem.readDirectoryAsync(this.userDataPath);
      return files.map(file => file.replace('.json', ''));
    } catch (error) {
      console.error('Failed to get all keys:', error);
      return [];
    }
  }

  async getStorageSize() {
    try {
      if (!this.isInitialized) {
        await this.init();
      }

      const dirInfo = await FileSystem.getInfoAsync(this.userDataPath);
      return dirInfo.size || 0;
    } catch (error) {
      console.error('Failed to get storage size:', error);
      return 0;
    }
  }

  // Session-specific methods
  async saveUserSessions(provider, sessions) {
    const key = `sessions_${provider}`;
    return await this.setItem(key, {
      provider,
      sessions,
      lastUpdated: new Date().toISOString(),
      sessionCount: sessions.length,
    });
  }

  async getUserSessions(provider) {
    const key = `sessions_${provider}`;
    const data = await this.getItem(key);
    return data ? data.sessions : [];
  }

  async saveUserPreferences(preferences) {
    return await this.setItem('user_preferences', preferences);
  }

  async getUserPreferences() {
    return await this.getItem('user_preferences') || {
      theme: 'light',
      notifications: true,
      autoCleanup: false,
      exportFormat: 'json',
      lastCleanup: null,
    };
  }

  async savePremiumStatus(status) {
    return await this.setItem('premium_status', {
      ...status,
      lastUpdated: new Date().toISOString(),
    });
  }

  async getPremiumStatus() {
    return await this.getItem('premium_status') || {
      isPremium: false,
      plan: 'free',
      expiresAt: null,
      features: [],
    };
  }

  async exportUserData() {
    try {
      const keys = await this.getAllKeys();
      const data = {};
      
      for (const key of keys) {
        data[key] = await this.getItem(key);
      }
      
      return {
        exportDate: new Date().toISOString(),
        version: '1.0.0',
        data,
      };
    } catch (error) {
      console.error('Failed to export user data:', error);
      return null;
    }
  }

  async importUserData(exportData) {
    try {
      if (!exportData || !exportData.data) {
        throw new Error('Invalid export data');
      }
      
      for (const [key, value] of Object.entries(exportData.data)) {
        await this.setItem(key, value);
      }
      
      return true;
    } catch (error) {
      console.error('Failed to import user data:', error);
      return false;
    }
  }

  getStoragePath() {
    return this.userDataPath;
  }
}

export default new LocalStorageService();