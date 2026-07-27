import React, { createContext, useContext } from 'react';

const ColumnHeaderContext = createContext<HTMLElement | null>(null);

interface IColumnHeaderProvider {
  slot: HTMLElement | null;
  children: React.ReactNode;
}

const ColumnHeaderProvider: React.FC<IColumnHeaderProvider> = ({ slot, children }) => (
  <ColumnHeaderContext.Provider value={slot}>{children}</ColumnHeaderContext.Provider>
);

const useColumnHeaderSlot = () => useContext(ColumnHeaderContext);

export { ColumnHeaderContext, ColumnHeaderProvider, useColumnHeaderSlot };
