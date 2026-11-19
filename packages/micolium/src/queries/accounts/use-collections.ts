import { useClient, useFeatures } from '@/contexts/current-account-context';
import { useScopeUrl } from '@/hooks/use-scope-url';
import { queryKeys } from '@/queries/keys';
import { scopedQueryKey, useAppQuery } from '@/queries/query';

import { queryClient } from '../client';
import { importEntities } from '../utils/import-entities';

const useCollection = (collectionId?: string) => {
  const client = useClient();
  const features = useFeatures();
  const scopeUrl = useScopeUrl();

  return useAppQuery({
    queryKey: queryKeys.collections.show(collectionId!),
    queryFn: () =>
      client.collections.getCollection(collectionId!).then(({ collection, accounts }) => {
        importEntities(scopeUrl, { accounts });
        return collection;
      }),
    enabled: features.collections && !!collectionId,
  });
};

const useAccountCollections = (accountId?: string) => {
  const client = useClient();
  const features = useFeatures();
  const scopeUrl = useScopeUrl();

  return useAppQuery({
    queryKey: queryKeys.collections.byAccount(accountId!),
    queryFn: () =>
      client.collections.getAccountCollections(accountId!).then((response) => {
        response.items.forEach((collection) => {
          queryClient.setQueryData(
            scopedQueryKey(queryKeys.collections.show(collection.id), scopeUrl),
            collection,
          );
        });
        return response.items;
      }),
    enabled: features.collections && !!accountId,
  });
};

export { useCollection, useAccountCollections };
