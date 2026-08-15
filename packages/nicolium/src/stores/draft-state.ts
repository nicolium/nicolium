import { create } from 'zustand';
import { mutative } from 'zustand-mutative';

type DraftState = 'isSubmitting' | 'isError' | undefined;

type State = {
  drafts: Record<string, DraftState>;
  actions: {
    updateDraftState: (draftId: string, draftState: DraftState) => void;
  };
};

const useDraftStateStore = create<State>()(
  mutative((set) => ({
    drafts: {},
    actions: {
      updateDraftState: (draftId, draftState) => {
        set((state: State) => {
          if (draftState === undefined) {
            delete state.drafts[draftId];
            return;
          }
          state.drafts[draftId] = draftState;
        });
      },
    },
  })),
);

const useDraftState = (draftId: string) => useDraftStateStore((state) => state.drafts[draftId]);
const useDraftStateActions = () => useDraftStateStore((state) => state.actions);

export { useDraftStateStore, useDraftState, useDraftStateActions };
