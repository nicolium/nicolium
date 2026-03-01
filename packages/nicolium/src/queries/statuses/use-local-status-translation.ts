import { useQuery } from '@tanstack/react-query';
import { translationSchema, type Translation } from 'pl-api';
import * as v from 'valibot';

import { useMinimalStatus } from '@/queries/statuses/use-status';
import { useLanguageModelAvailabilityActions } from '@/stores/language-model-availability';

import { queryKeys } from '../keys';

const useLocalStatusTranslation = (statusId: string, targetLanguage?: string) => {
  const { data: status } = useMinimalStatus(statusId);
  const { setLanguageModelAvailability, setLanguageModelDownloadProgress } =
    useLanguageModelAvailabilityActions();

  const sourceLanguage = status?.language;

  return useQuery<Translation | false>({
    queryKey: queryKeys.statuses.localTranslations(statusId, targetLanguage!),
    enabled: !!status && !!sourceLanguage && !!targetLanguage,
    queryFn: async ({ signal }) => {
      if (!('Translator' in globalThis) || !status) return false;

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
  });
};

export { useLocalStatusTranslation };
