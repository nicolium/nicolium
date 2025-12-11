import { useQuery } from '@tanstack/react-query';
import { translationSchema, type Translation } from 'pl-api';
import * as v from 'valibot';

import { useAppSelector } from 'pl-fe/hooks/use-app-selector';
import { useLanguageModelAvailabilityActions } from 'pl-fe/stores/language-model-availability';

interface CreateMonitor extends EventTarget {}

interface Translator {
  destroy: () => void;
  measureInputUsage: (input: string, options?: { signal?: AbortSignal }) => Promise<number>;
  translate: (input: string, options?: { signal?: AbortSignal }) => Promise<string>;
  translateStreaming: (input: string, options?: { signal?: AbortSignal }) => ReadableStream<string>;
}

declare global {
  interface Window {
    Translator: {
      availability: (options: { sourceLanguage: string; targetLanguage: string }) => Promise<'available' | 'downloadable' | 'downloading' | 'unavailable'>;
      create: (options: {
        sourceLanguage: string;
        targetLanguage: string;
        monitor?: (monitor: CreateMonitor) => void;
        signal?: AbortSignal;
      }) => Promise<Translator>;
    };
  }
}

const useLocalStatusTranslation = (statusId: string, targetLanguage?: string) => {
  const status = useAppSelector((state) => state.statuses[statusId]);
  const { setLanguageModelAvailability, setLanguageModelDownloadProgress } = useLanguageModelAvailabilityActions();

  const sourceLanguage = status?.language;

  return useQuery<Translation | false>({
    queryKey: ['statuses', 'localTranslations', statusId, targetLanguage],
    queryFn: async ({ signal }) => {
      if (!window.Translator) return false;

      try {
        const translator = await window.Translator.create({
          sourceLanguage: sourceLanguage!,
          targetLanguage: targetLanguage!,
          monitor: (createMonitor) => {
            setLanguageModelAvailability(sourceLanguage!, targetLanguage!, 'downloading');

            createMonitor.addEventListener('progress', ((e: ProgressEvent) => {
              setLanguageModelDownloadProgress(sourceLanguage!, targetLanguage!, e);
              if (e.loaded === e.total) {
                setLanguageModelAvailability(sourceLanguage!, targetLanguage!, 'available');
              }
            }) as EventListener);
          },
          signal,
        });

        return translator.translate(status!.content, { signal }).then((translatedText) => v.parse(translationSchema, {
          id: statusId,
          content: translatedText,
          detected_source_language: sourceLanguage,
        }));
      } catch (e) {
        return false;
      }
    },
    enabled: !!sourceLanguage && !!targetLanguage,
  });
};

export { useLocalStatusTranslation };
