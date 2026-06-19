import { batcher } from '@/api/batcher';
import { useClient } from '@/hooks/use-client';
import { useFeatures } from '@/hooks/use-features';
import { useAppQuery } from '@/queries/query';

import { queryKeys } from '../keys';

import type { Translation } from 'pl-api';

const useStatusTranslation = (statusId: string, targetLanguage?: string) => {
  const client = useClient();
  const features = useFeatures();

  return useAppQuery<Translation | false>({
    queryKey: queryKeys.statuses.translations(statusId, targetLanguage!),
    queryFn: () =>
      (features.lazyTranslations && targetLanguage
        ? batcher.translations(targetLanguage, client).fetch(statusId)
        : client.statuses.translateStatus(statusId, targetLanguage)
      )
        .then((translation) => translation || false)
        .catch(() => false),
    enabled: !!targetLanguage,
  });
};

export { useStatusTranslation };
