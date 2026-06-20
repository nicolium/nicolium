import { useMutation, useQueryClient } from '@tanstack/react-query';
import { defineMessages } from 'react-intl';

import { useClient } from '@/hooks/use-client';
import { useImportEntities } from '@/queries/utils/import-entities';
import toast from '@/toast';

import { queryKeys } from '../keys';

import { restorePreviousStatus, updateStatus } from './use-status-interactions';

const messages = defineMessages({
  joinSuccess: { id: 'join_event.success', defaultMessage: 'Joined the event' },
  joinRequestSuccess: {
    id: 'join_event.request.success',
    defaultMessage: 'Requested to join the event',
  },
  view: { id: 'toast.view', defaultMessage: 'View' },
});

const useJoinEventMutation = (statusId: string, withToast = true) => {
  const client = useClient();
  const queryClient = useQueryClient();
  const importEntities = useImportEntities();

  return useMutation({
    mutationKey: ['statuses', 'joinEvent', statusId],
    mutationFn: (participationMessage?: string) =>
      client.events.joinEvent(statusId, participationMessage),
    onMutate: () =>
      updateStatus(
        statusId,
        (status) => ({
          ...status,
          event: status.event ? { ...status.event, join_state: 'pending' as const } : null,
        }),
        queryClient,
      ),
    onError: (_, __, context) => restorePreviousStatus(statusId, context, queryClient),
    onSettled: (status) => {
      if (!status) return;
      importEntities({ statuses: [status] });
      queryClient.invalidateQueries({ queryKey: queryKeys.accountsLists.joinedEvents });

      if (withToast) {
        toast.success(
          status.event?.join_state === 'pending'
            ? messages.joinRequestSuccess
            : messages.joinSuccess,
          {
            actionLabel: messages.view,
            actionLinkOptions: {
              to: '/@{$username}/events/$statusId',
              params: { username: status.account.acct, statusId: status.id },
            },
          },
        );
      }
    },
  });
};

const useLeaveEventMutation = (statusId: string) => {
  const client = useClient();
  const queryClient = useQueryClient();
  const importEntities = useImportEntities();

  return useMutation({
    mutationKey: ['statuses', 'leaveEvent', statusId],
    mutationFn: () => client.events.leaveEvent(statusId),
    onMutate: () =>
      updateStatus(
        statusId,
        (status) => ({
          ...status,
          event: status.event ? { ...status.event, join_state: null } : null,
        }),
        queryClient,
      ),
    onError: (_, __, context) => restorePreviousStatus(statusId, context, queryClient),
    onSettled: (status) => {
      if (!status) return;
      importEntities({ statuses: [status] });
      queryClient.invalidateQueries({ queryKey: queryKeys.accountsLists.joinedEvents });
    },
  });
};

export { useJoinEventMutation, useLeaveEventMutation };
