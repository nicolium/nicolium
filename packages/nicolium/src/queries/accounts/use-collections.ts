import { useMutation } from '@tanstack/react-query';

import { useClient } from '@/hooks/use-client';
import { useFeatures } from '@/hooks/use-features';
import { useLoggedIn } from '@/hooks/use-logged-in';
import { useScopeUrl } from '@/hooks/use-scope-url';
import { queryKeys } from '@/queries/keys';
import { scopedQueryKey, useAppQuery } from '@/queries/query';

import { queryClient } from '../client';
import { importEntities } from '../utils/import-entities';

import type { CreateCollectionParams, UpdateCollectionParams } from 'pl-api';

const MAX_COLLECTION_ACCOUNT_COUNT = 25;

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

const useCollectionsFeaturingAccount = (accountId?: string) => {
  const client = useClient();
  const features = useFeatures();
  const scopeUrl = useScopeUrl();

  return useAppQuery({
    queryKey: queryKeys.collections.featuringAccount(accountId!),
    queryFn: () =>
      client.collections.getAccountInCollections(accountId!).then((response) => {
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

const useCreateCollection = () => {
  const client = useClient();
  const scopeUrl = useScopeUrl();
  const { me } = useLoggedIn();

  return useMutation({
    mutationKey: ['collections', 'create'],
    mutationFn: (params: CreateCollectionParams) => client.collections.createCollection(params),
    onSuccess: (collection) => {
      queryClient.setQueryData(
        scopedQueryKey(queryKeys.collections.show(collection.id), scopeUrl),
        collection,
      );
      if (typeof me === 'string') {
        queryClient.invalidateQueries({
          queryKey: scopedQueryKey(queryKeys.collections.byAccount(me), scopeUrl),
        });
      }
    },
  });
};

const useUpdateCollection = (collectionId: string) => {
  const client = useClient();
  const scopeUrl = useScopeUrl();
  const { me } = useLoggedIn();

  return useMutation({
    mutationKey: ['collections', 'update', collectionId],
    mutationFn: (params: UpdateCollectionParams) =>
      client.collections.updateCollection(collectionId, params),
    onSuccess: (collection) => {
      queryClient.setQueryData(
        scopedQueryKey(queryKeys.collections.show(collection.id), scopeUrl),
        collection,
      );
      if (typeof me === 'string') {
        queryClient.invalidateQueries({
          queryKey: scopedQueryKey(queryKeys.collections.byAccount(me), scopeUrl),
        });
      }
    },
  });
};

const useDeleteCollection = () => {
  const client = useClient();
  const scopeUrl = useScopeUrl();
  const { me } = useLoggedIn();

  return useMutation({
    mutationKey: ['collections', 'delete'],
    mutationFn: (collectionId: string) => client.collections.deleteCollection(collectionId),
    onSuccess: (_, deletedCollectionId) => {
      queryClient.removeQueries({
        queryKey: scopedQueryKey(queryKeys.collections.show(deletedCollectionId), scopeUrl),
      });
      if (typeof me === 'string') {
        queryClient.setQueryData(
          scopedQueryKey(queryKeys.collections.byAccount(me), scopeUrl),
          (prevData) => prevData?.filter(({ id }) => id !== deletedCollectionId),
        );
      }
    },
  });
};

const useAddCollectionItem = (collectionId: string) => {
  const client = useClient();
  const scopeUrl = useScopeUrl();
  const { me } = useLoggedIn();

  return useMutation({
    mutationKey: ['collections', collectionId, 'addItem'],
    mutationFn: (accountId: string) =>
      client.collections.addCollectionItem(collectionId, accountId),
    onSuccess: (item) => {
      queryClient.setQueryData(
        scopedQueryKey(queryKeys.collections.show(collectionId), scopeUrl),
        (prevData) =>
          prevData && {
            ...prevData,
            items: [...prevData.items, item],
            item_count: prevData.item_count + 1,
          },
      );
      if (typeof me === 'string') {
        queryClient.invalidateQueries({
          queryKey: scopedQueryKey(queryKeys.collections.byAccount(me), scopeUrl),
        });
      }
    },
  });
};

const useRemoveCollectionItem = (collectionId: string) => {
  const client = useClient();
  const scopeUrl = useScopeUrl();
  const { me } = useLoggedIn();

  return useMutation({
    mutationKey: ['collections', collectionId, 'removeItem'],
    mutationFn: (itemId: string) => client.collections.removeCollectionItem(collectionId, itemId),
    onSuccess: (_, itemId) => {
      queryClient.setQueryData(
        scopedQueryKey(queryKeys.collections.show(collectionId), scopeUrl),
        (prevData) =>
          prevData && {
            ...prevData,
            items: prevData.items.filter((item) => item.id !== itemId),
            item_count: Math.max(prevData.item_count - 1, 0),
          },
      );
      if (typeof me === 'string') {
        queryClient.invalidateQueries({
          queryKey: scopedQueryKey(queryKeys.collections.byAccount(me), scopeUrl),
        });
      }
    },
  });
};

const useRevokeCollectionInclusion = () => {
  const client = useClient();
  const scopeUrl = useScopeUrl();
  const { me } = useLoggedIn();

  return useMutation({
    mutationKey: ['collections', 'revokeInclusion'],
    mutationFn: ({ collectionId, itemId }: { collectionId: string; itemId: string }) =>
      client.collections.revokeCollectionItem(collectionId, itemId),
    onSuccess: (_, { collectionId }) => {
      queryClient.invalidateQueries({
        queryKey: scopedQueryKey(queryKeys.collections.show(collectionId), scopeUrl),
      });
      if (typeof me === 'string') {
        queryClient.invalidateQueries({
          queryKey: scopedQueryKey(queryKeys.collections.featuringAccount(me), scopeUrl),
        });
      }
    },
  });
};

export {
  MAX_COLLECTION_ACCOUNT_COUNT,
  useCollection,
  useAccountCollections,
  useCollectionsFeaturingAccount,
  useCreateCollection,
  useUpdateCollection,
  useDeleteCollection,
  useAddCollectionItem,
  useRemoveCollectionItem,
  useRevokeCollectionInclusion,
};
