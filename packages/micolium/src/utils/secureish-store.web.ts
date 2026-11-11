// Secure store on secure platforms, insecure on web.
const SecureishStore = {
  getItem: (key: string) => localStorage.getItem(key),
  getItemAsync: async (key: string) => {
    return localStorage.getItem(key);
  },
  setItem: (key: string, value: string) => localStorage.setItem(key, value),
  setItemAsync: async (key: string, value: string) => {
    return localStorage.setItem(key, value);
  },
  removeItem: (key: string) => localStorage.removeItem(key),
};

export { SecureishStore };
