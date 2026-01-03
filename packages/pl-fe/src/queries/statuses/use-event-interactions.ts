import { useMutation, useQueryClient } from '@tanstack/react-query';
import { defineMessages } from 'react-intl';

import { EventsAction } from 'pl-fe/actions/events';
import { importEntities } from 'pl-fe/actions/importer';
import { useAppDispatch } from 'pl-fe/hooks/use-app-dispatch';
import { useClient } from 'pl-fe/hooks/use-client';
import toast from 'pl-fe/toast';

import type { Status } from 'pl-api';

const messages = defineMessages({
  joinSuccess: { id: 'join_event.success', defaultMessage: 'Joined the event' },
  joinRequestSuccess: { id: 'join_event.request_success', defaultMessage: 'Requested to join the event' },
  view: { id: 'toast.view', defaultMessage: 'View' },
});

const useJoinEventMutation = (statusId: string, withToast = true) => {
  const client = useClient();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  let previousState: Exclude<Status['event'], null>['join_state'] | null;

  return useMutation({
    mutationKey: ['statuses', 'joinEvent', statusId],
    mutationFn: (participationMessage?: string) => {
      dispatch((_, getState) => {
        previousState = getState().statuses[statusId]?.event?.join_state!;
      });
      return client.events.joinEvent(statusId, participationMessage);
    },
    onMutate: () => dispatch<EventsAction>({ type: 'EVENT_JOIN_REQUEST', statusId }),
    onError: (error) => dispatch<EventsAction>({ type: 'EVENT_JOIN_FAIL', statusId, error, previousState }),
    onSettled: (status) => {
      if (!status) return;
      dispatch(importEntities({ statuses: [status] }));
      queryClient.invalidateQueries({ queryKey: ['accountsLists', 'joinedEvents'] });

      if (withToast) {
        toast.success(
          status.event?.join_state === 'pending' ? messages.joinRequestSuccess : messages.joinSuccess,
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
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  let previousState: Exclude<Status['event'], null>['join_state'] | null;

  return useMutation({
    mutationKey: ['statuses', 'leaveEvent', statusId],
    mutationFn: () => {
      dispatch((_, getState) => {
        previousState = getState().statuses[statusId]?.event?.join_state!;
      });
      return client.events.leaveEvent(statusId);
    },
    onMutate: () => dispatch<EventsAction>({ type: 'EVENT_LEAVE_REQUEST', statusId }),
    onError: (error) => dispatch<EventsAction>({ type: 'EVENT_LEAVE_FAIL', statusId, error, previousState }),
    onSettled: (status) => {
      if (!status) return;
      dispatch(importEntities({ statuses: [status] }));
      queryClient.invalidateQueries({ queryKey: ['accountsLists', 'joinedEvents'] });
    },
  });
};

export { useJoinEventMutation, useLeaveEventMutation };
