import * as SecureStore from 'expo-secure-store';

// Secure store on secure platforms, insecure on web.
const SecureishStore = {
  getItem: SecureStore.getItem,
  getItemAsync: SecureStore.getItemAsync,
  setItem: SecureStore.setItem,
  setItemAsync: SecureStore.setItemAsync,
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

export { SecureishStore };
