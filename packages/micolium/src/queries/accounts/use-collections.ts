import { useMutation } from '@tanstack/react-query';

import { useClient, useFeatures } from '@/contexts/current-account-context';
import { useScopeUrl } from '@/hooks/use-scope-url';
import { useCredentialAccountId } from '@/queries/accounts/use-account-credentials';
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

const useDeleteCollection = () => {
  const client = useClient();
  const scopeUrl = useScopeUrl();
  const { data: me } = useCredentialAccountId();

  return useMutation({
    mutationKey: ['collections', 'delete'],
    mutationFn: (collectionId: string) => client.collections.deleteCollection(collectionId),
    onSuccess: (_, deletedCollectionId) => {
      queryClient.removeQueries({
        queryKey: scopedQueryKey(queryKeys.collections.show(deletedCollectionId), scopeUrl),
      });
      if (me) {
        queryClient.setQueryData(
          scopedQueryKey(queryKeys.collections.byAccount(me), scopeUrl),
          (prevData) => prevData?.filter(({ id }) => id !== deletedCollectionId),
        );
      }
    },
  });
};

const useRevokeCollectionInclusion = () => {
  const client = useClient();
  const scopeUrl = useScopeUrl();
  const { data: me } = useCredentialAccountId();

  return useMutation({
    mutationKey: ['collections', 'revokeInclusion'],
    mutationFn: ({ collectionId, itemId }: { collectionId: string; itemId: string }) =>
      client.collections.revokeCollectionItem(collectionId, itemId),
    onSuccess: (_, { collectionId }) => {
      queryClient.invalidateQueries({
        queryKey: scopedQueryKey(queryKeys.collections.show(collectionId), scopeUrl),
      });
      if (me) {
        queryClient.invalidateQueries({
          queryKey: scopedQueryKey(queryKeys.collections.featuringAccount(me), scopeUrl),
        });
      }
    },
  });
};

export { useCollection, useAccountCollections, useDeleteCollection, useRevokeCollectionInclusion };
