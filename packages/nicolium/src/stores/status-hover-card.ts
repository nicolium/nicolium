import { create } from 'zustand';

type State = {
  ref: React.RefObject<HTMLDivElement> | null;
  statusId: string | null;
  columnId: string | null;
  hovered: boolean;
  actions: {
    openStatusHoverCard: (
      ref: React.RefObject<HTMLDivElement | null>,
      statusId: string,
      columnId?: string,
    ) => void;
    updateStatusHoverCard: () => void;
    closeStatusHoverCard: (force?: boolean) => void;
  };
};

const useStatusHoverCardStore = create<State>((set) => ({
  ref: null,
  statusId: null,
  columnId: null,
  hovered: false,
  actions: {
    openStatusHoverCard: (ref, statusId, columnId) => {
      set({
        ref: ref.current ? (ref as React.RefObject<HTMLDivElement>) : null,
        statusId,
        columnId: columnId ?? null,
      });
    },
    updateStatusHoverCard: () => {
      set({
        hovered: true,
      });
    },
    closeStatusHoverCard: (force = false) => {
      set((state) =>
        state.hovered && !force
          ? {}
          : {
              ref: null,
              statusId: null,
              columnId: null,
              hovered: false,
            },
      );
    },
  },
}));

const useStatusHoverCardActions = () => useStatusHoverCardStore((state) => state.actions);

export { useStatusHoverCardStore, useStatusHoverCardActions };
