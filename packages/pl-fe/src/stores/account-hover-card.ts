import { create } from 'zustand';

type State = {
  ref: React.MutableRefObject<HTMLDivElement> | null;
  accountId: string | null;
  hovered: boolean;
  actions: {
    openAccountHoverCard: (ref: React.MutableRefObject<HTMLDivElement>, accountId: string) => void;
    updateAccountHoverCard: () => void;
    closeAccountHoverCard: (force?: boolean) => void;
  };
}

const useAccountHoverCardStore = create<State>((set) => ({
  ref: null,
  accountId: null,
  hovered: false,
  actions: {
    openAccountHoverCard: (ref, accountId) => set({
      ref,
      accountId,
    }),
    updateAccountHoverCard: () => set({
      hovered: true,
    }),
    closeAccountHoverCard: (force = false) => set((state) => state.hovered && !force ? {} : {
      ref: null,
      accountId: null,
      hovered: false,
    }),
  },
}));

const useAccountHoverCardActions = () => useAccountHoverCardStore((state) => state.actions);

export { useAccountHoverCardStore, useAccountHoverCardActions };

