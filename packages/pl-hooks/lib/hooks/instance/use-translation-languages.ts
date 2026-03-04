import { useQuery } from '@tanstack/react-query';

import { usePlHooksApiClient } from '@/contexts/api-client';
import { usePlHooksQueryClient } from '@/contexts/query-client';

import { useInstance } from './use-instance';

const useTranslationLanguages = () => {
  const { client } = usePlHooksApiClient();
  const queryClient = usePlHooksQueryClient();
  const { data: instance } = useInstance();

  const { allow_unauthenticated: allowUnauthenticated } = instance!.pleroma.metadata.translation;

  const getTranslationLanguages = () => {
    const metadata = instance!.pleroma.metadata;

    if (metadata.translation.source_languages?.length) {
      return Object.fromEntries(
        metadata.translation.source_languages.map((source) => [
          source,
          metadata.translation.target_languages!.filter((lang) => lang !== source),
        ]),
      );
    }

    return client.instance.getInstanceTranslationLanguages();
  };

  return useQuery(
    {
      queryKey: ['instance', 'translationLanguages'],
      queryFn: getTranslationLanguages,
      placeholderData: {},
      enabled: allowUnauthenticated && client.features.translations,
    },
    queryClient,
  );
};

export { useTranslationLanguages };
