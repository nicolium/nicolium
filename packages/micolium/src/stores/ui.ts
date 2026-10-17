import { create } from 'zustand';

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

type State = {
  isAccountSwitcherOpen: boolean;
  isComposeOpen: boolean;
  interactAs: InteractAsState | null;
  emojiPicker: EmojiPickerState | null;
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
  };
};

const useUiStore = create<State>((set) => ({
  isAccountSwitcherOpen: false,
  isComposeOpen: false,
  interactAs: null,
  emojiPicker: null,
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
  },
}));

const useUiStoreActions = () => useUiStore((state) => state.actions);
const useIsAccountSwitcherOpen = () => useUiStore((state) => state.isAccountSwitcherOpen);
const useIsComposeOpen = () => useUiStore((state) => state.isComposeOpen);
const useInteractAs = () => useUiStore((state) => state.interactAs);
const useEmojiPicker = () => useUiStore((state) => state.emojiPicker);

export {
  useUiStore,
  useUiStoreActions,
  useIsAccountSwitcherOpen,
  useIsComposeOpen,
  useInteractAs,
  useEmojiPicker,
};
