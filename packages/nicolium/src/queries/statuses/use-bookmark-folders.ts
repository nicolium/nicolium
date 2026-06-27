import { useMutation, type UseQueryResult } from '@tanstack/react-query';

import { useClient } from '@/hooks/use-client';
import { useFeatures } from '@/hooks/use-features';
import { useScopeUrl } from '@/hooks/use-scope-url';
import { scopedQueryKey, useAppQuery } from '@/queries/query';

import { queryClient } from '../client';
import { queryKeys } from '../keys';

import type { BookmarkFolder } from 'pl-api';

function useBookmarkFolders<T>(
  select: (data: Array<BookmarkFolder>) => T,
  enabled?: boolean,
): UseQueryResult<T, Error>;
function useBookmarkFolders(enabled?: boolean): UseQueryResult<Array<BookmarkFolder>, Error>;
function useBookmarkFolders<T = Array<BookmarkFolder>>(
  select?: ((data: Array<BookmarkFolder>) => T) | boolean,
  enabled = true,
) {
  const client = useClient();
  const features = useFeatures();
  const selectFn = typeof select === 'function' ? select : undefined;
  const isEnabled = typeof select === 'boolean' ? select : enabled;

  return useAppQuery({
    queryKey: queryKeys.bookmarkFolders.all,
    queryFn: () => client.myAccount.getBookmarkFolders(),
    enabled: features.bookmarkFolders && isEnabled,
    select: selectFn,
  });
}

const useBookmarkFolder = (folderId?: string) =>
  useBookmarkFolders(
    (data) => (folderId ? data.find((folder) => folder.id === folderId) : undefined),
    folderId !== undefined,
  );

interface CreateBookmarkFolderParams {
  name: string;
  emoji?: string;
}

const useCreateBookmarkFolder = () => {
  const client = useClient();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationKey: ['bookmarkFolders', 'create'],
    mutationFn: (params: CreateBookmarkFolderParams) =>
      client.myAccount.createBookmarkFolder(params),
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: scopedQueryKey(queryKeys.bookmarkFolders.all, scopeUrl),
      }),
  });
};

const useDeleteBookmarkFolder = () => {
  const client = useClient();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationKey: ['bookmarkFolders', 'delete'],
    mutationFn: (folderId: string) => client.myAccount.deleteBookmarkFolder(folderId),
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: scopedQueryKey(queryKeys.bookmarkFolders.all, scopeUrl),
      }),
  });
};

interface UpdateBookmarkFolderParams {
  name: string;
  emoji?: string;
}

const useUpdateBookmarkFolder = (folderId: string) => {
  const client = useClient();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationKey: ['bookmarkFolders', 'update', folderId],
    mutationFn: (params: UpdateBookmarkFolderParams) =>
      client.myAccount.updateBookmarkFolder(folderId, params),
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: scopedQueryKey(queryKeys.bookmarkFolders.all, scopeUrl),
      }),
  });
};

const useStatusBookmarkFolders = (statusId: string) => {
  const client = useClient();
  const features = useFeatures();

  return useAppQuery({
    queryKey: queryKeys.bookmarkFolders.forStatus(statusId),
    queryFn: () =>
      client.statuses
        .getStatusBookmarkFolders(statusId)
        .then((response) => response.map((folder) => folder.id)),
    enabled: features.bookmarkFoldersMultiple,
  });
};

const useAddBookmarkToFolder = (statusId: string) => {
  const client = useClient();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationKey: ['bookmarkFolders', 'add', statusId],
    mutationFn: (folderId: string) => client.myAccount.addBookmarkToFolder(statusId, folderId),
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: scopedQueryKey(queryKeys.bookmarkFolders.forStatus(statusId), scopeUrl),
      }),
  });
};

const useRemoveBookmarkFromFolder = (statusId: string) => {
  const client = useClient();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationKey: ['bookmarkFolders', 'remove', statusId],
    mutationFn: (folderId: string) => client.myAccount.removeBookmarkFromFolder(statusId, folderId),
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: scopedQueryKey(queryKeys.bookmarkFolders.forStatus(statusId), scopeUrl),
      }),
  });
};

export {
  useBookmarkFolders,
  useBookmarkFolder,
  useCreateBookmarkFolder,
  useDeleteBookmarkFolder,
  useUpdateBookmarkFolder,
  useStatusBookmarkFolders,
  useAddBookmarkToFolder,
  useRemoveBookmarkFromFolder,
};
