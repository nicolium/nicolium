import { create } from 'zustand';

type State = {
  config: {
    onPick: (emoji: string, custom?: boolean) => void;
    selected?: Array<string>;
    withSystem?: boolean;
    withCustom?: boolean;
    scopeUrl?: string;
  } | null;
  actions: {
    showPicker: (
      onPick: (emoji: string, custom?: boolean) => void,
      selected?: Array<string>,
      withSystem?: boolean,
      withCustom?: boolean,
      scopeUrl?: string,
    ) => void;
    dismissPicker: () => void;
  };
};

const useEmojiPickerStore = create<State>((set) => ({
  config: null,
  actions: {
    showPicker: (onPick, selected = [], withSystem = true, withCustom = true, scopeUrl) =>
      set(() => ({
        config: {
          onPick,
          selected,
          withSystem,
          withCustom,
          scopeUrl,
        },
      })),
    dismissPicker: () => set(() => ({ config: null })),
  },
}));

const useEmojiPickerActions = () => useEmojiPickerStore((state) => state.actions);

export { useEmojiPickerStore, useEmojiPickerActions };
