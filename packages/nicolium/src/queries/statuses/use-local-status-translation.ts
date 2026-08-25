import { translationSchema, type Translation } from 'pl-api';
import * as v from 'valibot';

import { useAppQuery } from '@/queries/query';
import { usePollQuery } from '@/queries/statuses/use-poll';
import { useMinimalStatus } from '@/queries/statuses/use-status';
import { useLanguageModelAvailabilityActions } from '@/stores/language-model-availability';

import { queryKeys } from '../keys';

const useLocalStatusTranslation = (statusId: string, targetLanguage?: string) => {
  const { data: status } = useMinimalStatus(statusId);
  const { data: poll } = usePollQuery(status?.poll_id ?? '');
  const { setLanguageModelAvailability, setLanguageModelDownloadProgress } =
    useLanguageModelAvailabilityActions();

  const sourceLanguage = status?.language;

  return useAppQuery<Translation | false>({
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

        const translate = (text: string) =>
          text ? translator.translate(text, { signal }) : Promise.resolve('');

        const [content, spoilerText, pollOptions, mediaAttachments] = await Promise.all([
          translate(status.content),
          translate(status.spoiler_text),
          Promise.all((poll?.options ?? []).map(({ title }) => translate(title))),
          Promise.all(
            status.media_attachments.map(async ({ id, description }) => ({
              id,
              description: await translate(description ?? ''),
            })),
          ),
        ]);

        return v.parse(translationSchema, {
          id: statusId,
          content,
          spoiler_text: spoilerText,
          poll: poll
            ? {
                id: poll.id,
                options: pollOptions.map((title) => ({ title })),
              }
            : undefined,
          media_attachments: mediaAttachments,
          detected_source_language: sourceLanguage,
        });
      } catch (e) {
        return false;
      }
    },
  });
};

export { useLocalStatusTranslation };
