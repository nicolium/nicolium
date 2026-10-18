import { create } from 'zustand';

import type { MediaAttachment } from 'pl-api';

type InteractAsState = {
  statusId: string;
  sourceScope: string;
};

type EmojiPickerState = {
  onPick: (emoji: string, custom?: boolean) => void;
  selected?: Array<string>;
  withSystem?: boolean;
  withCustom?: boolean;
  scopeUrl?: string;
};

type MediaViewerState = {
  media: Array<MediaAttachment>;
  index: number;
};

type State = {
  isAccountSwitcherOpen: boolean;
  isComposeOpen: boolean;
  interactAs: InteractAsState | null;
  emojiPicker: EmojiPickerState | null;
  mediaViewer: MediaViewerState | null;
  actions: {
    openAccountSwitcher: () => void;
    closeAccountSwitcher: () => void;
    openCompose: () => void;
    closeCompose: () => void;
    openInteractAs: (statusId: string, sourceScope: string) => void;
    closeInteractAs: () => void;
    openEmojiPicker: (
      onPick: (emoji: string, custom?: boolean) => void,
      selected?: Array<string>,
      withSystem?: boolean,
      withCustom?: boolean,
      scopeUrl?: string,
    ) => void;
    closeEmojiPicker: () => void;
    openMediaViewer: (media: Array<MediaAttachment>, index?: number) => void;
    closeMediaViewer: () => void;
  };
};

const useUiStore = create<State>((set) => ({
  isAccountSwitcherOpen: false,
  isComposeOpen: false,
  interactAs: null,
  emojiPicker: null,
  mediaViewer: null,
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
    openEmojiPicker: (onPick, selected = [], withSystem = true, withCustom = true, scopeUrl) =>
      set(() => ({
        emojiPicker: {
          onPick,
          selected,
          withSystem,
          withCustom,
          scopeUrl,
        },
      })),
    closeEmojiPicker: () => set(() => ({ emojiPicker: null })),
    openMediaViewer: (media, index = 0) => {
      set({ mediaViewer: { media, index } });
    },
    closeMediaViewer: () => {
      set({ mediaViewer: null });
    },
  },
}));

const useUiStoreActions = () => useUiStore((state) => state.actions);
const useIsAccountSwitcherOpen = () => useUiStore((state) => state.isAccountSwitcherOpen);
const useIsComposeOpen = () => useUiStore((state) => state.isComposeOpen);
const useInteractAs = () => useUiStore((state) => state.interactAs);
const useEmojiPicker = () => useUiStore((state) => state.emojiPicker);
const useMediaViewer = () => useUiStore((state) => state.mediaViewer);

export {
  useUiStore,
  useUiStoreActions,
  useIsAccountSwitcherOpen,
  useIsComposeOpen,
  useInteractAs,
  useEmojiPicker,
  useMediaViewer,
};
