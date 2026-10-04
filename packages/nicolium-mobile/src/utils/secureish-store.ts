import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Secure store on secure platforms, insecure on web.
let SecureishStore: {
  getItem: (key: string) => string | null;
  getItemAsync: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => void;
  setItemAsync: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void> | void;
};

if (Platform.OS === 'web') {
  SecureishStore = {
    getItem: (key) => localStorage.getItem(key),
    getItemAsync: async (key) => {
      return localStorage.getItem(key);
    },
    setItem: (key, value) => localStorage.setItem(key, value),
    setItemAsync: async (key, value) => {
      return localStorage.setItem(key, value);
    },
    removeItem: (key) => localStorage.removeItem(key),
  };
} else {
  SecureishStore = {
    getItem: SecureStore.getItem,
    getItemAsync: SecureStore.getItemAsync,
    setItem: SecureStore.setItem,
    setItemAsync: SecureStore.setItemAsync,
    removeItem: (key) => SecureStore.deleteItemAsync(key),
  };
}

export { SecureishStore };
