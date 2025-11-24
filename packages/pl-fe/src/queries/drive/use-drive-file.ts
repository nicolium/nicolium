import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useClient } from 'pl-fe/hooks/use-client';
import { useFeatures } from 'pl-fe/hooks/use-features';

import type { UpdateFileParams } from 'pl-api';

const useDriveFileQuery = (fileId: string) => {
  const client = useClient();
  const features = useFeatures();

  return useQuery({
    queryKey: ['drive', 'files', fileId],
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
      queryClient.setQueryData(['drive', 'files', file.id], file);
      queryClient.invalidateQueries({ queryKey: ['drive', 'folders', folderId], exact: true });
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
      queryClient.setQueryData(['drive', 'files', file.id], file);
      queryClient.invalidateQueries({ queryKey: ['drive', 'folders'], exact: false });
    },
  });
};

const useDeleteDriveFileMutation = (fileId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['drive', 'files'],
    mutationFn: () => client.drive.deleteFile(fileId),
    onSuccess: (file) => {
      queryClient.invalidateQueries({ queryKey: ['drive', 'folders'], exact: false });
    },
  });
};

const useMoveDriveFileMutation = (fileId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['drive', 'files'],
    mutationFn: (folderId: string) => client.drive.moveFile(fileId, folderId),
    onSuccess: (file) => {
      queryClient.invalidateQueries({ queryKey: ['drive', 'folders'], exact: false });
      queryClient.setQueryData(['drive', 'files', file.id], file);
    },
  });
};

export { useDriveFileQuery, useCreateDriveFileMutation, useUpdateDriveFileMutation, useDeleteDriveFileMutation, useMoveDriveFileMutation };
