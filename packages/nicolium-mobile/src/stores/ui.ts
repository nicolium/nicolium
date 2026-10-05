import { create } from 'zustand';

type State = {
  isAccountSwitcherOpen: boolean;
  actions: {
    openAccountSwitcher: () => void;
    closeAccountSwitcher: () => void;
  };
};

const useUiStore = create<State>((set) => ({
  isAccountSwitcherOpen: false,
  actions: {
    openAccountSwitcher: () => {
      set({ isAccountSwitcherOpen: true });
    },
    closeAccountSwitcher: () => {
      set({ isAccountSwitcherOpen: false });
    },
  },
}));

const useIsAccountSwitcherOpen = () => useUiStore((state) => state.isAccountSwitcherOpen);
const useUiStoreActions = () => useUiStore((state) => state.actions);

export { useUiStore, useUiStoreActions, useIsAccountSwitcherOpen };
