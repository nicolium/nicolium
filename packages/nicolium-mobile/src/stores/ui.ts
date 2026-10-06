import { create } from 'zustand';

type State = {
  isAccountSwitcherOpen: boolean;
  isComposeOpen: boolean;
  actions: {
    openAccountSwitcher: () => void;
    closeAccountSwitcher: () => void;
    openCompose: () => void;
    closeCompose: () => void;
  };
};

const useUiStore = create<State>((set) => ({
  isAccountSwitcherOpen: false,
  isComposeOpen: false,
  actions: {
    openAccountSwitcher: () => {
      set({ isAccountSwitcherOpen: true });
    },
    closeAccountSwitcher: () => {
      set({ isAccountSwitcherOpen: false });
    },
    openCompose: () => {
      set({ isComposeOpen: true });
    },
    closeCompose: () => {
      set({ isComposeOpen: false });
    },
  },
}));

const useIsAccountSwitcherOpen = () => useUiStore((state) => state.isAccountSwitcherOpen);
const useIsComposeOpen = () => useUiStore((state) => state.isComposeOpen);
const useUiStoreActions = () => useUiStore((state) => state.actions);

export { useUiStore, useUiStoreActions, useIsAccountSwitcherOpen, useIsComposeOpen };
