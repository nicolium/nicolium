import { useMutation, useQuery, type UseQueryResult } from '@tanstack/react-query';

import { useClient } from '@/hooks/use-client';
import { useFeatures } from '@/hooks/use-features';

import { queryClient } from '../client';

import type { BookmarkFolder } from 'pl-api';

function useBookmarkFolders<T>(
  select: (data: Array<BookmarkFolder>) => T,
): UseQueryResult<T, Error>;
function useBookmarkFolders(): UseQueryResult<Array<BookmarkFolder>, Error>;
function useBookmarkFolders<T = Array<BookmarkFolder>>(
  select?: (data: Array<BookmarkFolder>) => T,
) {
  const client = useClient();
  const features = useFeatures();

  return useQuery({
    queryKey: ['bookmarkFolders'],
    queryFn: () => client.myAccount.getBookmarkFolders(),
    enabled: features.bookmarkFolders,
    select,
  });
}

const useBookmarkFolder = (folderId?: string) =>
  useBookmarkFolders((data) =>
    folderId ? data.find((folder) => folder.id === folderId) : undefined,
  );

interface CreateBookmarkFolderParams {
  name: string;
  emoji?: string;
}

const useCreateBookmarkFolder = () => {
  const client = useClient();

  return useMutation({
    mutationKey: ['bookmarkFolders', 'create'],
    mutationFn: (params: CreateBookmarkFolderParams) =>
      client.myAccount.createBookmarkFolder(params),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['bookmarkFolders'] }),
  });
};

const useDeleteBookmarkFolder = () => {
  const client = useClient();

  return useMutation({
    mutationKey: ['bookmarkFolders', 'delete'],
    mutationFn: (folderId: string) => client.myAccount.deleteBookmarkFolder(folderId),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['bookmarkFolders'] }),
  });
};

interface UpdateBookmarkFolderParams {
  name: string;
  emoji?: string;
}

const useUpdateBookmarkFolder = (folderId: string) => {
  const client = useClient();

  return useMutation({
    mutationKey: ['bookmarkFolders', 'update', folderId],
    mutationFn: (params: UpdateBookmarkFolderParams) =>
      client.myAccount.updateBookmarkFolder(folderId, params),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['bookmarkFolders'] }),
  });
};

const useStatusBookmarkFolders = (statusId: string) => {
  const client = useClient();
  const features = useFeatures();

  return useQuery({
    queryKey: ['bookmarkFolders', 'status', statusId],
    queryFn: () =>
      client.statuses
        .getStatusBookmarkFolders(statusId)
        .then((response) => response.map((folder) => folder.id)),
    enabled: features.bookmarkFoldersMultiple,
  });
};

const useAddBookmarkToFolder = (statusId: string) => {
  const client = useClient();

  return useMutation({
    mutationKey: ['bookmarkFolders', 'add', statusId],
    mutationFn: (folderId: string) => client.myAccount.addBookmarkToFolder(statusId, folderId),
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: ['bookmarkFolders', 'status', statusId] }),
  });
};

const useRemoveBookmarkFromFolder = (statusId: string) => {
  const client = useClient();

  return useMutation({
    mutationKey: ['bookmarkFolders', 'remove', statusId],
    mutationFn: (folderId: string) => client.myAccount.removeBookmarkFromFolder(statusId, folderId),
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: ['bookmarkFolders', 'status', statusId] }),
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
