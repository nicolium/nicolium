import React, { createContext, useContext, useMemo } from 'react';

import { useAuthStore, useMe, type Me } from '@/stores/auth';

interface CurrentAccountContextValue {
  me: Me;
  meUrl: string | null;
}

const CurrentAccountContext = createContext<CurrentAccountContextValue>({
  me: null,
  meUrl: null,
});

interface IDefaultCurrentAccountProvider {
  children: React.ReactNode;
}

const DefaultCurrentAccountProvider: React.FC<IDefaultCurrentAccountProvider> = ({ children }) => {
  const me = useMe();
  const meUrl = useAuthStore((state) => state.me);

  const value = useMemo(() => ({ me, meUrl }), [me, meUrl]);

  return <CurrentAccountContext.Provider value={value}>{children}</CurrentAccountContext.Provider>;
};

interface ICurrentAccountProvider {
  accountUrl: string;
  children: React.ReactNode;
}

const CurrentAccountProvider: React.FC<ICurrentAccountProvider> = ({ accountUrl, children }) => {
  const accountId = useAuthStore((state) => state.users[accountUrl]?.id);

  const value = useMemo(() => ({ me: accountId, meUrl: accountUrl }), [accountId, accountUrl]);

  return <CurrentAccountContext.Provider value={value}>{children}</CurrentAccountContext.Provider>;
};

const useCurrentAccount = () => {
  const context = useContext(CurrentAccountContext);

  return context ? context.me : null;
};

const useCurrentAccountContext = () => useContext(CurrentAccountContext);

export {
  CurrentAccountContext,
  DefaultCurrentAccountProvider,
  CurrentAccountProvider,
  useCurrentAccount,
  useCurrentAccountContext,
};
