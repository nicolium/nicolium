import { create } from 'zustand';

type State = {
  config: {
    onPick: (emoji: string, custom?: boolean) => void;
    selected?: Array<string>;
    withSystem?: boolean;
    withCustom?: boolean;
  } | null;
  actions: {
    showPicker: (
      onPick: (emoji: string, custom?: boolean) => void,
      selected?: Array<string>,
      withSystem?: boolean,
      withCustom?: boolean,
    ) => void;
    dismissPicker: () => void;
  };
};

const useEmojiPickerStore = create<State>((set) => ({
  config: null,
  actions: {
    showPicker: (onPick, selected = [], withSystem = true, withCustom = true) =>
      set(() => ({
        config: {
          onPick,
          selected,
          withSystem,
          withCustom,
        },
      })),
    dismissPicker: () => set(() => ({ config: null })),
  },
}));

const useEmojiPickerActions = () => useEmojiPickerStore((state) => state.actions);

export { useEmojiPickerStore, useEmojiPickerActions };
