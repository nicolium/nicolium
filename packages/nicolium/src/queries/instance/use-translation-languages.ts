import { useClient } from '@/hooks/use-client';
import { useFeatures } from '@/hooks/use-features';
import { useLoggedIn } from '@/hooks/use-logged-in';
import { useAppQuery } from '@/queries/query';
import { useInstance } from '@/stores/instance';

import { queryKeys } from '../keys';

const useTranslationLanguages = () => {
  const client = useClient();
  const { isLoggedIn } = useLoggedIn();
  const features = useFeatures();
  const instance = useInstance();

  const getTranslationLanguages = async () => {
    const metadata = instance.pleroma.metadata;

    if (metadata.translation.source_languages?.length) {
      return Object.fromEntries(
        metadata.translation.source_languages.map((source) => [
          source,
          metadata.translation.target_languages!.filter((lang) => lang !== source),
        ]),
      );
    }

    return await client.instance.getInstanceTranslationLanguages();
  };

  return useAppQuery({
    queryKey: queryKeys.translationLanguages.all,
    queryFn: getTranslationLanguages,
    placeholderData: {},
    enabled: isLoggedIn && features.translations,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
};

export { useTranslationLanguages };
