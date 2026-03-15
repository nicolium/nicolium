import { getClient } from '@/api';
import { queryClient } from '@/queries/client';
import { queryKeys } from '@/queries/keys';
import { useComposeStore } from '@/stores/compose';
import { useModalsStore } from '@/stores/modals';

const redactStatus = (statusId: string) => {
  const status = queryClient.getQueryData(queryKeys.statuses.show(statusId));
  if (!status) return;

  const poll = status.poll_id
    ? queryClient.getQueryData(queryKeys.statuses.polls.show(status.poll_id))
    : undefined;

  return getClient()
    .statuses.getStatusSource(statusId)
    .then((source) => {
      useComposeStore
        .getState()
        .actions.setComposeToStatus(status, poll, source, false, null, null, true);
      useModalsStore.getState().actions.openModal('COMPOSE');
    });
};

export { redactStatus };
