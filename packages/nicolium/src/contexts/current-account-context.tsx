import React, { createContext, useContext, useMemo } from 'react';

import { defaultClient, useAuthStore, useMe, type Me } from '@/stores/auth';

import type { PlApiClient } from 'pl-api';

interface CurrentAccountContextValue {
  me: Me;
  client: PlApiClient;
}

const CurrentAccountContext = createContext<CurrentAccountContextValue>({
  me: null,
  client: defaultClient,
});

interface ICurrentAccountProvider {
  children: React.ReactNode;
}

const DefaultCurrentAccountProvider: React.FC<ICurrentAccountProvider> = ({ children }) => {
  const me = useMe();
  const client = useAuthStore((state) => {
    const { me: meUrl, clients, defaultClient } = state;
    if (meUrl && clients[meUrl]) return clients[meUrl];
    return defaultClient;
  });

  const value = useMemo(() => ({ me, client }), [me, client]);

  return <CurrentAccountContext.Provider value={value}>{children}</CurrentAccountContext.Provider>;
};

const useCurrentAccount = () => useContext(CurrentAccountContext)?.me || null;

const useCurrentAccountContext = () => useContext(CurrentAccountContext);

export {
  CurrentAccountContext,
  DefaultCurrentAccountProvider,
  useCurrentAccount,
  useCurrentAccountContext,
};
