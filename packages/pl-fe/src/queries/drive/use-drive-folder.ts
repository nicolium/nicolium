
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useClient } from 'pl-fe/hooks/use-client';
import { useFeatures } from 'pl-fe/hooks/use-features';

import type { DriveFolder } from 'pl-api';

const useDriveFolder = (folderId?: string) => {
  const client = useClient();
  const features = useFeatures();

  return useQuery({
    queryKey: ['drive', 'folders', folderId],
    queryFn: () => folderId ? client.drive.getFolder(folderId) : client.drive.getDrive(),
    enabled: features.drive,
  });
};

const useCreateDriveFolder = () => {
  const client = useClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['drive', 'folders'],
    mutationFn: ({ name, parentId }: { name: string; parentId?: string }) => client.drive.createFolder(name, parentId),
    onSuccess: (folder) => {
      queryClient.setQueryData(['drive', 'folders', folder.id], folder);
      queryClient.invalidateQueries({ queryKey: ['drive', 'folders', folder.parent_id || undefined], exact: true });
    },
  });
};

const useUpdateDriveFolder = (folderId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['drive', 'folders'],
    mutationFn: (name: string) => client.drive.updateFolder(folderId, name),
    onSuccess: (folder) => {
      queryClient.setQueryData(['drive', 'folders', folder.id], folder);
    },
  });
};

const useDeleteDriveFolder = (folderId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();

  let previousParentId: string | null;

  return useMutation({
    mutationKey: ['drive', 'folders'],
    mutationFn: () => {
      const oldFolder = queryClient.getQueryData<DriveFolder>(['drive', 'folders', folderId]);
      if (oldFolder) {
        previousParentId = oldFolder.parent_id;
      } else {
        previousParentId = null;
      }
      return client.drive.deleteFolder(folderId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drive', 'folders', folderId], exact: true });
      if (previousParentId) queryClient.invalidateQueries({ queryKey: ['drive', 'folders', previousParentId || undefined], exact: true });
    },
  });
};

const useMoveDriveFolder = (folderId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();

  let previousParentId: string | null;

  return useMutation({
    mutationKey: ['drive', 'folders'],
    mutationFn: (targetFolderId: string) => {
      const oldFolder = queryClient.getQueryData<DriveFolder>(['drive', 'folders', folderId]);
      if (oldFolder) {
        previousParentId = oldFolder.parent_id;
      } else {
        previousParentId = null;
      }
      return client.drive.moveFolder(folderId, targetFolderId);
    },
    onSuccess: (_, targetFolderId) => {
      queryClient.invalidateQueries({ queryKey: ['drive', 'folders', folderId], exact: true });
      queryClient.invalidateQueries({ queryKey: ['drive', 'folders', targetFolderId], exact: true });
      if (previousParentId) queryClient.invalidateQueries({ queryKey: ['drive', 'folders', previousParentId || undefined], exact: true });
    },
  });
};

export { useDriveFolder, useCreateDriveFolder, useUpdateDriveFolder, useDeleteDriveFolder, useMoveDriveFolder };
