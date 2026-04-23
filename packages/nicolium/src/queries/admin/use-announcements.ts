import { useMutation } from '@tanstack/react-query';

import { useClient } from '@/hooks/use-client';
import { queryClient } from '@/queries/client';
import { removePageItem } from '@/utils/queries';

import { queryKeys } from '../keys';
import { makePaginatedResponseQuery } from '../utils/make-paginated-response-query';

import type { AdminCreateAnnouncementParams, AdminUpdateAnnouncementParams } from 'pl-api';

const useAnnouncements = makePaginatedResponseQuery(queryKeys.admin.announcements, (client) =>
  client.admin.announcements.getAnnouncements(),
);

const useCreateAnnouncementMutation = () => {
  const client = useClient();

  return useMutation({
    mutationFn: (params: AdminCreateAnnouncementParams) =>
      client.admin.announcements.createAnnouncement(params),
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.announcements });
      queryClient.invalidateQueries({ queryKey: queryKeys.announcements.root });
    },
  });
};

const useUpdateAnnouncementMutation = () => {
  const client = useClient();

  return useMutation({
    mutationFn: ({ id, ...params }: AdminUpdateAnnouncementParams & { id: string }) =>
      client.admin.announcements.updateAnnouncement(id, params),
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.announcements });
      queryClient.invalidateQueries({ queryKey: queryKeys.announcements.root });
    },
  });
};

const useDeleteAnnouncementMutation = () => {
  const client = useClient();

  return useMutation({
    mutationFn: (id: string) => client.admin.announcements.deleteAnnouncement(id),
    retry: false,
    onSuccess: (_, deletedAnnouncementId) => {
      removePageItem(
        queryKeys.admin.announcements,
        deletedAnnouncementId,
        (announcement: { id: string }, id: string) => announcement.id === id,
        true,
      );
      queryClient.invalidateQueries({ queryKey: queryKeys.announcements.root });
    },
  });
};

export {
  useAnnouncements,
  useCreateAnnouncementMutation,
  useUpdateAnnouncementMutation,
  useDeleteAnnouncementMutation,
};
