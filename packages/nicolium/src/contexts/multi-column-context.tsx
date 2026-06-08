import React, { createContext, useContext } from 'react';

const MultiColumnContext = createContext<HTMLElement | null>(null);

interface IMultiColumnProvider {
  /** deck column's scroll container */
  scrollParent: HTMLElement | null;
  children: React.ReactNode;
}

const MultiColumnProvider: React.FC<IMultiColumnProvider> = ({ scrollParent, children }) => (
  <MultiColumnContext.Provider value={scrollParent}>{children}</MultiColumnContext.Provider>
);

const useColumnScrollParent = () => useContext(MultiColumnContext);

export { MultiColumnContext, MultiColumnProvider, useColumnScrollParent };
