import { create } from 'zustand';

type InteractAsState = {
  statusId: string;
  sourceScope: string;
};

type State = {
  isAccountSwitcherOpen: boolean;
  isComposeOpen: boolean;
  interactAs: InteractAsState | null;
  actions: {
    openAccountSwitcher: () => void;
    closeAccountSwitcher: () => void;
    openCompose: () => void;
    closeCompose: () => void;
    openInteractAs: (statusId: string, sourceScope: string) => void;
    closeInteractAs: () => void;
  };
};

const useUiStore = create<State>((set) => ({
  isAccountSwitcherOpen: false,
  isComposeOpen: false,
  interactAs: null,
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
    openInteractAs: (statusId, sourceScope) => {
      set({ interactAs: { statusId, sourceScope } });
    },
    closeInteractAs: () => {
      set({ interactAs: null });
    },
  },
}));

const useIsAccountSwitcherOpen = () => useUiStore((state) => state.isAccountSwitcherOpen);
const useIsComposeOpen = () => useUiStore((state) => state.isComposeOpen);
const useInteractAs = () => useUiStore((state) => state.interactAs);
const useUiStoreActions = () => useUiStore((state) => state.actions);

export { useUiStore, useUiStoreActions, useIsAccountSwitcherOpen, useIsComposeOpen, useInteractAs };
