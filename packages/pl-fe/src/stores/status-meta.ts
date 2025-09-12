import { create } from 'zustand';
import { mutative } from 'zustand-mutative';

type State = {
  statuses: Record<string, { expanded?: boolean; mediaVisible?: boolean; currentLanguage?: string; targetLanguage?: string }>;
  expandStatuses: (statusIds: Array<string>) => void;
  collapseStatuses: (statusIds: Array<string>) => void;
  revealStatusesMedia: (statusIds: Array<string>) => void;
  hideStatusesMedia: (statusIds: Array<string>) => void;
  toggleStatusesMediaHidden: (statusIds: Array<string>) => void;
  fetchTranslation: (statusId: string, targetLanguage: string) => void;
  hideTranslation: (statusId: string) => void;
  setStatusLanguage: (statusId: string, language: string) => void;
};

const useStatusMetaStore = create<State>()(mutative((set) => ({
  statuses: {},
  expandStatuses: (statusIds) => set((state: State) => {
    for (const statusId of statusIds) {
      if (!state.statuses[statusId]) state.statuses[statusId] = {};

      state.statuses[statusId].expanded = true;
    }
  }),
  collapseStatuses: (statusIds) => set((state: State) => {
    for (const statusId of statusIds) {
      if (!state.statuses[statusId]) state.statuses[statusId] = {};

      state.statuses[statusId].expanded = false;
    }
  }),
  revealStatusesMedia: (statusIds) => set((state: State) => {
    for (const statusId of statusIds) {
      if (!state.statuses[statusId]) state.statuses[statusId] = {};

      state.statuses[statusId].mediaVisible = true;
    }
  }),
  hideStatusesMedia: (statusIds) => set((state: State) => {
    for (const statusId of statusIds) {
      if (!state.statuses[statusId]) state.statuses[statusId] = {};

      state.statuses[statusId].mediaVisible = false;
    }
  }),
  toggleStatusesMediaHidden: (statusIds) => (state: State) => {
    for (const statusId of statusIds) {
      if (!state.statuses[statusId]) state.statuses[statusId] = {};

      state.statuses[statusId].mediaVisible = !state.statuses[statusId].mediaVisible;
    }
  },
  fetchTranslation: (statusId, targetLanguage) => set((state: State) => {
    if (!state.statuses[statusId]) state.statuses[statusId] = {};

    state.statuses[statusId].targetLanguage = targetLanguage;
  }),
  hideTranslation: (statusId) => set((state: State) => {
    if (!state.statuses[statusId]) state.statuses[statusId] = {};

    state.statuses[statusId].targetLanguage = undefined;
  }),
  setStatusLanguage: (statusId, language) => set((state: State) => {
    if (!state.statuses[statusId]) state.statuses[statusId] = {};

    state.statuses[statusId].currentLanguage = language;
  }),
})));

export { useStatusMetaStore };
