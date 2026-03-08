import { create } from 'zustand';

type State = {
  isDropdownMenuOpen: boolean;
  isSidebarOpen: boolean;
  isSledzikRemoved: boolean;
  actions: {
    openDropdownMenu: () => void;
    closeDropdownMenu: () => void;
    openSidebar: () => void;
    closeSidebar: () => void;
    removeSledzik: () => void;
  };
};

const useUiStore = create<State>((set) => ({
  isDropdownMenuOpen: false,
  isSidebarOpen: false,
  isSledzikRemoved: false,
  actions: {
    openDropdownMenu: () => {
      set({ isDropdownMenuOpen: true });
    },
    closeDropdownMenu: () => {
      set({ isDropdownMenuOpen: false });
    },
    openSidebar: () => {
      set({ isSidebarOpen: true });
    },
    closeSidebar: () => {
      set({ isSidebarOpen: false });
    },
    removeSledzik: () => {
      set({ isSledzikRemoved: true });
    },
  },
}));

const useIsDropdownMenuOpen = () => useUiStore((state) => state.isDropdownMenuOpen);
const useIsSidebarOpen = () => useUiStore((state) => state.isSidebarOpen);
const useUiStoreActions = () => useUiStore((state) => state.actions);

export { useUiStore, useUiStoreActions, useIsDropdownMenuOpen, useIsSidebarOpen };
