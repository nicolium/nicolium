import React, { createContext, useContext } from 'react';

import { useAppSelector } from '@/hooks/use-app-selector';

const CurrentAccountContext = createContext<'unauthenticated' | string>('unauthenticated');

interface ICurrentAccountProvider {
  children: React.ReactNode;
}

const DefaultCurrentAccountProvider: React.FC<ICurrentAccountProvider> = ({ children }) => {
  const me = useAppSelector((state) => state.me);

  return (
    <CurrentAccountContext.Provider value={me ? me : 'unauthenticated'}>
      {children}
    </CurrentAccountContext.Provider>
  );
};

const useCurrentAccount = () => useContext(CurrentAccountContext);

export { CurrentAccountContext, DefaultCurrentAccountProvider, useCurrentAccount };
