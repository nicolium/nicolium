import { create } from 'zustand';
import { mutative } from 'zustand-mutative';

type State = {
  statuses: Record<
    string,
    {
      expanded?: boolean;
      spoilerExpanded?: boolean;
      mediaVisible?: boolean;
      currentLanguage?: string;
      targetLanguage?: string;
      localTargetLanguage?: string;
      showPollResults?: boolean;
      showFiltered?: boolean;
      deleted?: boolean;
    }
  >;
  actions: {
    expandStatus: (stautsId: string) => void;
    collapseStatus: (stautsId: string) => void;
    expandStatusSpoiler: (stautsId: string) => void;
    collapseStatusSpoiler: (stautsId: string) => void;
    revealStatusMedia: (stautsId: string) => void;
    hideStatusMedia: (stautsId: string) => void;
    toggleStatusMediaHidden: (stautsId: string) => void;
    fetchTranslation: (statusId: string, targetLanguage: string) => void;
    hideTranslation: (statusId: string) => void;
    fetchLocalTranslation: (statusId: string, targetLanguage: string) => void;
    hideLocalTranslation: (statusId: string) => void;
    setStatusLanguage: (statusId: string, language: string) => void;
    toggleShowPollResults: (statusId: string) => void;
    unfilterStatus: (statusId: string) => void;
    markStatusDeleted: (statusId: string) => void;
  };
};

const useStatusMetaStore = create<State>()(
  mutative((set) => ({
    statuses: {},
    actions: {
      expandStatus: (statusId) => {
        set((state: State) => {
          if (!state.statuses[statusId]) state.statuses[statusId] = {};

          state.statuses[statusId].expanded = true;
        });
      },
      collapseStatus: (statusId) => {
        set((state: State) => {
          if (!state.statuses[statusId]) state.statuses[statusId] = {};

          state.statuses[statusId].expanded = false;
        });
      },
      expandStatusSpoiler: (statusId) => {
        set((state: State) => {
          if (!state.statuses[statusId]) state.statuses[statusId] = {};

          state.statuses[statusId].spoilerExpanded = true;
        });
      },
      collapseStatusSpoiler: (statusId) => {
        set((state: State) => {
          if (!state.statuses[statusId]) state.statuses[statusId] = {};

          state.statuses[statusId].spoilerExpanded = false;
        });
      },
      revealStatusMedia: (statusId) => {
        set((state: State) => {
          if (!state.statuses[statusId]) state.statuses[statusId] = {};

          state.statuses[statusId].mediaVisible = true;
        });
      },
      hideStatusMedia: (statusId) => {
        set((state: State) => {
          if (!state.statuses[statusId]) state.statuses[statusId] = {};

          state.statuses[statusId].mediaVisible = false;
        });
      },
      toggleStatusMediaHidden: (statusId) => {
        set((state: State) => {
          if (!state.statuses[statusId]) state.statuses[statusId] = {};

          state.statuses[statusId].mediaVisible = !state.statuses[statusId].mediaVisible;
        });
      },
      fetchTranslation: (statusId, targetLanguage) => {
        set((state: State) => {
          if (!state.statuses[statusId]) state.statuses[statusId] = {};

          state.statuses[statusId].targetLanguage = targetLanguage;
        });
      },
      hideTranslation: (statusId) => {
        set((state: State) => {
          if (!state.statuses[statusId]) state.statuses[statusId] = {};

          state.statuses[statusId].targetLanguage = undefined;
        });
      },
      fetchLocalTranslation: (statusId, targetLanguage) => {
        set((state: State) => {
          if (!state.statuses[statusId]) state.statuses[statusId] = {};

          state.statuses[statusId].localTargetLanguage = targetLanguage;
        });
      },
      hideLocalTranslation: (statusId) => {
        set((state: State) => {
          if (!state.statuses[statusId]) state.statuses[statusId] = {};

          state.statuses[statusId].localTargetLanguage = undefined;
        });
      },
      setStatusLanguage: (statusId, language) => {
        set((state: State) => {
          if (!state.statuses[statusId]) state.statuses[statusId] = {};

          state.statuses[statusId].currentLanguage = language;
        });
      },
      toggleShowPollResults: (statusId) => {
        set((state: State) => {
          if (!state.statuses[statusId]) state.statuses[statusId] = {};

          state.statuses[statusId].showPollResults = !state.statuses[statusId].showPollResults;
        });
      },
      unfilterStatus: (statusId) => {
        set((state: State) => {
          if (!state.statuses[statusId]) state.statuses[statusId] = {};

          state.statuses[statusId].showFiltered = true;
        });
      },
      markStatusDeleted: (statusId) => {
        set((state: State) => {
          if (!state.statuses[statusId]) state.statuses[statusId] = {};

          state.statuses[statusId].deleted = true;
        });
      },
    },
  })),
);

const emptyStatusMeta = {};

const useStatusMeta = (statusId: string) =>
  useStatusMetaStore((state) => state.statuses[statusId] || emptyStatusMeta);
const useStatusMetaActions = () => useStatusMetaStore((state) => state.actions);

export { useStatusMetaStore, useStatusMeta, useStatusMetaActions };
