import { useMutation } from '@tanstack/react-query';

import { useClient } from '@/hooks/use-client';
import { useScopeUrl } from '@/hooks/use-scope-url';
import { queryClient } from '@/queries/client';
import { removePageItem } from '@/utils/queries';

import { queryKeys } from '../keys';
import { scopedQueryKey } from '../query';
import { makePaginatedResponseQuery } from '../utils/make-paginated-response-query';

import type { AdminCreateAnnouncementParams, AdminUpdateAnnouncementParams } from 'pl-api';

const useAnnouncements = makePaginatedResponseQuery(queryKeys.admin.announcements, (client) =>
  client.admin.announcements.getAnnouncements(),
);

const useCreateAnnouncementMutation = () => {
  const client = useClient();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationFn: (params: AdminCreateAnnouncementParams) =>
      client.admin.announcements.createAnnouncement(params),
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: scopedQueryKey(queryKeys.admin.announcements, scopeUrl),
      });
      queryClient.invalidateQueries({
        queryKey: scopedQueryKey(queryKeys.announcements.root, scopeUrl),
      });
    },
  });
};

const useUpdateAnnouncementMutation = () => {
  const client = useClient();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationFn: ({ id, ...params }: AdminUpdateAnnouncementParams & { id: string }) =>
      client.admin.announcements.updateAnnouncement(id, params),
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: scopedQueryKey(queryKeys.admin.announcements, scopeUrl),
      });
      queryClient.invalidateQueries({
        queryKey: scopedQueryKey(queryKeys.announcements.root, scopeUrl),
      });
    },
  });
};

const useDeleteAnnouncementMutation = () => {
  const client = useClient();
  const scopeUrl = useScopeUrl();

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
      queryClient.invalidateQueries({
        queryKey: scopedQueryKey(queryKeys.announcements.root, scopeUrl),
      });
    },
  });
};

export {
  useAnnouncements,
  useCreateAnnouncementMutation,
  useUpdateAnnouncementMutation,
  useDeleteAnnouncementMutation,
};
