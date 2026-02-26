import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useClient } from '@/hooks/use-client';
import { useFeatures } from '@/hooks/use-features';

import { queryKeys } from '../keys';

import type { UpdateFileParams } from 'pl-api';

const useDriveFileQuery = (fileId: string) => {
  const client = useClient();
  const features = useFeatures();

  return useQuery({
    queryKey: queryKeys.drive.files.show(fileId),
    queryFn: () => client.drive.getFile(fileId),
    enabled: features.drive,
  });
};

const useCreateDriveFileMutation = (folderId?: string) => {
  const client = useClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['drive', 'files'],
    mutationFn: (file: File) => client.drive.createFile(file, folderId),
    onSuccess: (file) => {
      queryClient.setQueryData(queryKeys.drive.files.show(file.id), file);
      queryClient.invalidateQueries({
        queryKey: queryKeys.drive.folders.show(folderId),
        exact: true,
      });
    },
  });
};

const useUpdateDriveFileMutation = (fileId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['drive', 'files'],
    mutationFn: (params: UpdateFileParams) => client.drive.updateFile(fileId, params),
    onSuccess: (file) => {
      queryClient.setQueryData(queryKeys.drive.files.show(file.id), file);
      queryClient.invalidateQueries({ queryKey: queryKeys.drive.folders.root, exact: false });
    },
  });
};

const useDeleteDriveFileMutation = (fileId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['drive', 'files'],
    mutationFn: () => client.drive.deleteFile(fileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.drive.folders.root, exact: false });
    },
  });
};

const useMoveDriveFileMutation = (fileId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['drive', 'files'],
    mutationFn: (folderId?: string) => client.drive.moveFile(fileId, folderId),
    onSuccess: (file) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.drive.folders.root, exact: false });
      queryClient.setQueryData(queryKeys.drive.files.show(file.id), file);
    },
  });
};

export {
  useDriveFileQuery,
  useCreateDriveFileMutation,
  useUpdateDriveFileMutation,
  useDeleteDriveFileMutation,
  useMoveDriveFileMutation,
};
