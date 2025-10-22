import { create } from 'zustand';

type State = {
  isDropdownMenuOpen: boolean;
  isSidebarOpen: boolean;
  actions: {
  openDropdownMenu: () => void;
  closeDropdownMenu: () => void;
  openSidebar: () => void;
  closeSidebar: () => void;
  };
}

const useUiStore = create<State>((set) => ({
  isDropdownMenuOpen: false,
  isSidebarOpen: false,
  actions: {
    openDropdownMenu: () => set({ isDropdownMenuOpen: true }),
    closeDropdownMenu: () => set({ isDropdownMenuOpen: false }),
    openSidebar: () => set({ isSidebarOpen: true }),
    closeSidebar: () => set({ isSidebarOpen: false }),
  },
}));

const useIsDropdownMenuOpen = () => useUiStore((state) => state.isDropdownMenuOpen);
const useIsSidebarOpen = () => useUiStore((state) => state.isSidebarOpen);
const useUiStoreActions = () => useUiStore((state) => state.actions);

export { useUiStore, useUiStoreActions, useIsDropdownMenuOpen, useIsSidebarOpen };

