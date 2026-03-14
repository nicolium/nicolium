import React, { createContext, useContext } from 'react';

import { useMe, type Me } from '@/stores/auth';

const CurrentAccountContext = createContext<Me>(null);

interface ICurrentAccountProvider {
  children: React.ReactNode;
}

const DefaultCurrentAccountProvider: React.FC<ICurrentAccountProvider> = ({ children }) => {
  const me = useMe();

  return <CurrentAccountContext.Provider value={me}>{children}</CurrentAccountContext.Provider>;
};

const useCurrentAccount = () => useContext(CurrentAccountContext);

export { CurrentAccountContext, DefaultCurrentAccountProvider, useCurrentAccount };
