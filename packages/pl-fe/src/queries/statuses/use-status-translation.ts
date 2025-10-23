import { useQuery } from '@tanstack/react-query';

import { batcher } from 'pl-fe/api/batcher';
import { useClient } from 'pl-fe/hooks/use-client';
import { useFeatures } from 'pl-fe/hooks/use-features';

import type { Translation } from 'pl-api';

const useStatusTranslation = (statusId: string, targetLanguage?: string) => {
  const client = useClient();
  const features = useFeatures();

  return useQuery<Translation | false>({
    queryKey: ['statuses', 'translations', statusId, targetLanguage],
    queryFn: () => (features.lazyTranslations && targetLanguage
      ? batcher.translations(targetLanguage, client).fetch(statusId)
      : client.statuses.translateStatus(statusId, targetLanguage))
      .then(translation => translation || false).catch(() => false),
    enabled: !!targetLanguage,
  });
};

export { useStatusTranslation };
