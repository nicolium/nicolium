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
    expandStatuses: (statusIds: Array<string>) => void;
    collapseStatuses: (statusIds: Array<string>) => void;
    expandStatusSpoilers: (statusIds: Array<string>) => void;
    collapseStatusSpoilers: (statusIds: Array<string>) => void;
    revealStatusesMedia: (statusIds: Array<string>) => void;
    hideStatusesMedia: (statusIds: Array<string>) => void;
    toggleStatusesMediaHidden: (statusIds: Array<string>) => void;
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
      expandStatuses: (statusIds) => {
        set((state: State) => {
          for (const statusId of statusIds) {
            if (!state.statuses[statusId]) state.statuses[statusId] = {};

            state.statuses[statusId].expanded = true;
          }
        });
      },
      collapseStatuses: (statusIds) => {
        set((state: State) => {
          for (const statusId of statusIds) {
            if (!state.statuses[statusId]) state.statuses[statusId] = {};

            state.statuses[statusId].expanded = false;
          }
        });
      },
      expandStatusSpoilers: (statusIds) => {
        set((state: State) => {
          for (const statusId of statusIds) {
            if (!state.statuses[statusId]) state.statuses[statusId] = {};

            state.statuses[statusId].spoilerExpanded = true;
          }
        });
      },
      collapseStatusSpoilers: (statusIds) => {
        set((state: State) => {
          for (const statusId of statusIds) {
            if (!state.statuses[statusId]) state.statuses[statusId] = {};

            state.statuses[statusId].spoilerExpanded = false;
          }
        });
      },
      revealStatusesMedia: (statusIds) => {
        set((state: State) => {
          for (const statusId of statusIds) {
            if (!state.statuses[statusId]) state.statuses[statusId] = {};

            state.statuses[statusId].mediaVisible = true;
          }
        });
      },
      hideStatusesMedia: (statusIds) => {
        set((state: State) => {
          for (const statusId of statusIds) {
            if (!state.statuses[statusId]) state.statuses[statusId] = {};

            state.statuses[statusId].mediaVisible = false;
          }
        });
      },
      toggleStatusesMediaHidden: (statusIds) => {
        set((state: State) => {
          for (const statusId of statusIds) {
            if (!state.statuses[statusId]) state.statuses[statusId] = {};

            state.statuses[statusId].mediaVisible = !state.statuses[statusId].mediaVisible;
          }
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
