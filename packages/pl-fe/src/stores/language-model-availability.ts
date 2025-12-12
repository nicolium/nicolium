import { create } from 'zustand';
import { mutative } from 'zustand-mutative';

type State = {
  languageModelAvailability: Record<string, Awaited<ReturnType<typeof Translator.availability>>>;
  languageModelDownloadProgress: Record<string, number>;
  actions: {
    setLanguageModelAvailability: (sourceLanguage: string, targetLanguage: string, availability: Awaited<ReturnType<typeof Translator.availability>>) => void;
    setLanguageModelDownloadProgress: (sourceLanguage: string, targetLanguage: string, event: ProgressEvent) => void;
  };
}

const useLanguageModelAvailabilityStore = create<State>()(mutative((set) => ({
  languageModelAvailability: {},
  languageModelDownloadProgress: {},
  actions: {
    setLanguageModelAvailability: (sourceLanguage, targetLanguage, availability) => set((state: State) => {
      state.languageModelAvailability[`${sourceLanguage}-${targetLanguage}`] = availability;
    }),
    setLanguageModelDownloadProgress: (sourceLanguage, targetLanguage, event) => set((state: State) => {
      state.languageModelDownloadProgress[`${sourceLanguage}-${targetLanguage}`] = event.loaded / event.total;
    }),
  },
}), {
  enableAutoFreeze: false,
}));

const useLanguageModelAvailability = (sourceLanguage: string, targetLanguage: string) =>
  useLanguageModelAvailabilityStore((state) => state.languageModelAvailability[`${sourceLanguage}-${targetLanguage}`]);
const useLanguageModelDownloadProgress = (sourceLanguage: string, targetLanguage: string) =>
  useLanguageModelAvailabilityStore((state) => state.languageModelDownloadProgress[`${sourceLanguage}-${targetLanguage}`]);
const useLanguageModelAvailabilityActions = () => useLanguageModelAvailabilityStore((state) => state.actions);

export { useLanguageModelAvailability, useLanguageModelDownloadProgress, useLanguageModelAvailabilityActions };
