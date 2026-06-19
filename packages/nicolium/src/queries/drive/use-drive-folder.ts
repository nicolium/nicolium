import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useClient } from '@/hooks/use-client';
import { useFeatures } from '@/hooks/use-features';
import { useAppQuery } from '@/queries/query';

import { queryKeys } from '../keys';

const useDriveFolderQuery = (folderId?: string) => {
  const client = useClient();
  const features = useFeatures();

  return useAppQuery({
    queryKey: queryKeys.drive.folders.show(folderId),
    queryFn: () => (folderId ? client.drive.getFolder(folderId) : client.drive.getDrive()),
    enabled: features.drive,
  });
};

const useCreateDriveFolderMutation = () => {
  const client = useClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['drive', 'folders'],
    mutationFn: ({ name, parentId }: { name: string; parentId?: string }) =>
      client.drive.createFolder(name, parentId),
    onSuccess: (folder) => {
      queryClient.setQueryData(queryKeys.drive.folders.show(folder.id || undefined), folder);
      queryClient.invalidateQueries({
        queryKey: queryKeys.drive.folders.show(folder.parent_id ?? undefined),
        exact: true,
      });
    },
  });
};

const useUpdateDriveFolderMutation = (folderId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();

  let previousParentId: string | null;

  return useMutation({
    mutationKey: ['drive', 'folders'],
    mutationFn: (name: string) => {
      const oldFolder = queryClient.getQueryData(queryKeys.drive.folders.show(folderId));
      if (oldFolder) {
        previousParentId = oldFolder.parent_id;
      } else {
        previousParentId = null;
      }
      return client.drive.updateFolder(folderId, name);
    },
    onSuccess: (folder) => {
      queryClient.setQueryData(queryKeys.drive.folders.show(folder.id!), folder);
      if (previousParentId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.drive.folders.show(previousParentId),
          exact: true,
        });
      }
    },
  });
};

const useDeleteDriveFolderMutation = (folderId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();

  let previousParentId: string | null;

  return useMutation({
    mutationKey: ['drive', 'folders'],
    mutationFn: () => {
      const oldFolder = queryClient.getQueryData(queryKeys.drive.folders.show(folderId));
      if (oldFolder) {
        previousParentId = oldFolder.parent_id;
      } else {
        previousParentId = null;
      }
      return client.drive.deleteFolder(folderId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.drive.folders.show(folderId),
        exact: true,
      });
      if (previousParentId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.drive.folders.show(previousParentId),
          exact: true,
        });
      }
    },
  });
};

const useMoveDriveFolderMutation = (folderId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();

  let previousParentId: string | null;

  return useMutation({
    mutationKey: ['drive', 'folders'],
    mutationFn: (targetFolderId?: string) => {
      const oldFolder = queryClient.getQueryData(queryKeys.drive.folders.show(folderId));
      if (oldFolder) {
        previousParentId = oldFolder.parent_id;
      } else {
        previousParentId = null;
      }
      return client.drive.moveFolder(folderId, targetFolderId);
    },
    onSuccess: (_, targetFolderId) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.drive.folders.show(folderId),
        exact: true,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.drive.folders.show(targetFolderId),
        exact: true,
      });
      if (previousParentId)
        queryClient.invalidateQueries({
          queryKey: queryKeys.drive.folders.show(previousParentId || undefined),
          exact: true,
        });
    },
  });
};

export {
  useDriveFolderQuery,
  useCreateDriveFolderMutation,
  useUpdateDriveFolderMutation,
  useDeleteDriveFolderMutation,
  useMoveDriveFolderMutation,
};
