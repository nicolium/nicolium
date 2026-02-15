import { useQuery } from '@tanstack/react-query';

import { useClient } from '@/hooks/use-client';
import { useFeatures } from '@/hooks/use-features';
import { useInstance } from '@/hooks/use-instance';
import { useLoggedIn } from '@/hooks/use-logged-in';

const useTranslationLanguages = () => {
  const client = useClient();
  const { isLoggedIn } = useLoggedIn();
  const features = useFeatures();
  const instance = useInstance();

  const getTranslationLanguages = () => {
    const metadata = instance.pleroma.metadata;

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

  return useQuery({
    queryKey: ['translationLanguages'],
    queryFn: getTranslationLanguages,
    placeholderData: {},
    enabled: isLoggedIn && features.translations,
  });
};

export { useTranslationLanguages };
