import { useMutation } from '@tanstack/react-query';
import { create } from 'mutative';
import {
  adminAnnouncementSchema,
  type AdminCreateAnnouncementParams,
  type AdminUpdateAnnouncementParams,
} from 'pl-api';
import * as v from 'valibot';

import { useClient } from '@/hooks/use-client';
import { queryClient } from '@/queries/client';

import { queryKeys } from '../keys';
import { makePaginatedResponseQuery } from '../utils/make-paginated-response-query';

const useAnnouncements = makePaginatedResponseQuery(queryKeys.admin.announcements, (client) =>
  client.admin.announcements.getAnnouncements(),
);

const useCreateAnnouncementMutation = () => {
  const client = useClient();

  return useMutation({
    mutationFn: (params: AdminCreateAnnouncementParams) =>
      client.admin.announcements.createAnnouncement(params),
    retry: false,
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.admin.announcements, (prevData) =>
        create(prevData, (draft) => {
          if (draft?.pages.length)
            draft.pages[0].items = [
              v.parse(adminAnnouncementSchema, data),
              ...draft.pages[0].items,
            ];
        }),
      );
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
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.admin.announcements, (prevData) =>
        create(prevData, (draft) => {
          draft?.pages.forEach(({ items }) => {
            const index = items.findIndex(({ id }) => id === data.id);
            if (index !== -1) items[index] = v.parse(adminAnnouncementSchema, data);
          });
        }),
      );
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
      queryClient.setQueryData(queryKeys.admin.announcements, (prevData) =>
        create(prevData, (draft) => {
          draft?.pages.forEach(
            (page) => (page.items = page.items.filter(({ id }) => id !== deletedAnnouncementId)),
          );
        }),
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
