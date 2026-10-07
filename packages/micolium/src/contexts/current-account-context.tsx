import React, { createContext, useContext } from 'react';

import { useAuthStore } from '@/stores/auth';

type CurrentAccountContextValue = string | null;

const CurrentAccountContext = createContext<CurrentAccountContextValue>(null);

interface IDefaultCurrentAccountProvider {
  children: React.ReactNode;
}

const DefaultCurrentAccountProvider: React.FC<IDefaultCurrentAccountProvider> = ({ children }) => {
  const currentAccount = useAuthStore((state) => state.currentAccount);

  return (
    <CurrentAccountContext.Provider value={currentAccount}>
      {children}
    </CurrentAccountContext.Provider>
  );
};

interface ICurrentAccountProvider {
  value: string;
  children: React.ReactNode;
}

const CurrentAccountProvider: React.FC<ICurrentAccountProvider> = ({ value, children }) => {
  return <CurrentAccountContext.Provider value={value}>{children}</CurrentAccountContext.Provider>;
};

const useCurrentAccount = () => useContext(CurrentAccountContext) || '';

const useClient = () => {
  const currentAccount = useCurrentAccount();
  return useAuthStore((state) => state.clients[currentAccount!]);
};

const useInstance = () => useClient().instanceInformation;
const useFeatures = () => useClient().features;

export {
  CurrentAccountContext,
  DefaultCurrentAccountProvider,
  CurrentAccountProvider,
  useCurrentAccount,
  useClient,
  useInstance,
  useFeatures,
};
