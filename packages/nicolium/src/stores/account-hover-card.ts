import { create } from 'zustand';

type State = {
  ref: React.RefObject<HTMLDivElement> | null;
  accountId: string | null;
  columnId: string | null;
  scopeUrl: string | null;
  hovered: boolean;
  actions: {
    openAccountHoverCard: (
      ref: React.RefObject<HTMLDivElement | null>,
      accountId: string,
      columnId?: string,
      scopeUrl?: string,
    ) => void;
    updateAccountHoverCard: () => void;
    closeAccountHoverCard: (force?: boolean) => void;
  };
};

const useAccountHoverCardStore = create<State>((set) => ({
  ref: null,
  accountId: null,
  columnId: null,
  scopeUrl: null,
  hovered: false,
  actions: {
    openAccountHoverCard: (ref, accountId, columnId, scopeUrl) => {
      set({
        ref: ref.current ? (ref as React.RefObject<HTMLDivElement>) : null,
        accountId,
        columnId: columnId ?? null,
        scopeUrl: scopeUrl ?? null,
      });
    },
    updateAccountHoverCard: () => {
      set({
        hovered: true,
      });
    },
    closeAccountHoverCard: (force = false) => {
      set((state) =>
        state.hovered && !force
          ? {}
          : {
              ref: null,
              accountId: null,
              columnId: null,
              scopeUrl: null,
              hovered: false,
            },
      );
    },
  },
}));

const useAccountHoverCardActions = () => useAccountHoverCardStore((state) => state.actions);

export { useAccountHoverCardStore, useAccountHoverCardActions };
