import { useQuery } from '@tanstack/react-query';
import { translationSchema, type Translation } from 'pl-api';
import * as v from 'valibot';

import { useAppSelector } from '@/hooks/use-app-selector';
import { useLanguageModelAvailabilityActions } from '@/stores/language-model-availability';

import { queryKeys } from '../keys';

const useLocalStatusTranslation = (statusId: string, targetLanguage?: string) => {
  const status = useAppSelector((state) => state.statuses[statusId]);
  const { setLanguageModelAvailability, setLanguageModelDownloadProgress } =
    useLanguageModelAvailabilityActions();

  const sourceLanguage = status?.language;

  return useQuery<Translation | false>({
    queryKey: queryKeys.statuses.localTranslations(statusId, targetLanguage!),
    queryFn: async ({ signal }) => {
      if (!('Translator' in globalThis)) return false;

      try {
        const translator = await Translator.create({
          sourceLanguage: sourceLanguage!,
          targetLanguage: targetLanguage!,
          monitor: (createMonitor) => {
            createMonitor.addEventListener('downloadprogress', ((e: ProgressEvent) => {
              setLanguageModelDownloadProgress(sourceLanguage!, targetLanguage!, e);

              if (e.loaded === 0) {
                setLanguageModelAvailability(sourceLanguage!, targetLanguage!, 'downloading');
              } else if (e.loaded === e.total) {
                setLanguageModelAvailability(sourceLanguage!, targetLanguage!, 'available');
              }
            }) as EventListener);
          },
          signal,
        });

        return translator.translate(status.content, { signal }).then((translatedText) =>
          v.parse(translationSchema, {
            id: statusId,
            content: translatedText,
            detected_source_language: sourceLanguage,
          }),
        );
      } catch (e) {
        return false;
      }
    },
    enabled: !!sourceLanguage && !!targetLanguage,
  });
};

export { useLocalStatusTranslation };
