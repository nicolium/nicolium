import { queryClient } from '@/queries/client';
import { queryKeys } from '@/queries/keys';
import { scopedQueryKey } from '@/queries/query';
import { importEntities } from '@/queries/utils/import-entities';
import { useAuthStore } from '@/stores/auth';

const resolveAccount = async (accountId: string, sourceScope: string, targetScope: string) => {
  if (new URL(sourceScope).origin === new URL(targetScope).origin) {
    return accountId;
  }

  const clients = useAuthStore.getState().clients;

  const account = queryClient.getQueryData(
    scopedQueryKey(queryKeys.accounts.show(accountId), sourceScope),
  );
  const client = clients[targetScope];

  if (!account || !client) return undefined;

  const resolvedId = await client.search
    .search(`@${account.fqn}`, { type: 'accounts', limit: 1, resolve: true })
    .then((response) => {
      const account = response.accounts[0];
      if (account) {
        importEntities(targetScope, response);

        return account.id;
      }
    });

  return resolvedId;
};

const resolveStatus = async (statusId: string, sourceScope: string, targetScope: string) => {
  if (new URL(sourceScope).origin === new URL(targetScope).origin) {
    return statusId;
  }

  const clients = useAuthStore.getState().clients;

  const status = queryClient.getQueryData(
    scopedQueryKey(queryKeys.statuses.show(statusId), sourceScope),
  );
  const client = clients[targetScope];

  if (!status || !client) return undefined;

  const resolvedId = await client.search
    .search(status.uri, { type: 'statuses', limit: 1, resolve: true })
    .then((response) => {
      const status = response.statuses[0];
      if (status) {
        importEntities(targetScope, response);

        return status.id;
      }
    });

  return resolvedId;
};

export { resolveAccount, resolveStatus };
