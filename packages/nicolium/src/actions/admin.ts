import { getClient } from '@/api';
import { queryClient } from '@/queries/client';
import { queryKeys } from '@/queries/keys';
import { useComposeStore } from '@/stores/compose';
import { useModalsStore } from '@/stores/modals';

const promoteToAdmin = (accountId: string) => getClient().admin.accounts.promoteToAdmin(accountId);

const promoteToModerator = (accountId: string) =>
  getClient().admin.accounts.promoteToModerator(accountId);

const demoteToUser = (accountId: string) => getClient().admin.accounts.demoteToUser(accountId);

const setRole = (accountId: string, role: 'user' | 'moderator' | 'admin') => {
  switch (role) {
    case 'user':
      return demoteToUser(accountId);
    case 'moderator':
      return promoteToModerator(accountId);
    case 'admin':
      return promoteToAdmin(accountId);
  }
};

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

export { setRole, redactStatus };
