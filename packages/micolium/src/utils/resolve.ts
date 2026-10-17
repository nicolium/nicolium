import { queryClient } from '@/queries/client';
import { queryKeys } from '@/queries/keys';
import { scopedQueryKey } from '@/queries/query';
import { importEntities } from '@/queries/utils/import-entities';
import { useAuthStore } from '@/stores/auth';

const isSameInstance = (sourceScope: string, targetScope: string) => {
  const { sessions } = useAuthStore.getState();

  const sourceInstance = sessions[sourceScope]?.instance;
  const targetInstance = sessions[targetScope]?.instance;

  if (!sourceInstance || !targetInstance) return false;

  return new URL(sourceInstance).origin === new URL(targetInstance).origin;
};

const resolveStatus = async (statusId: string, sourceScope: string, targetScope: string) => {
  const status = queryClient.getQueryData(
    scopedQueryKey(queryKeys.statuses.show(statusId), sourceScope),
  );
  const client = useAuthStore.getState().clients[targetScope];

  if (isSameInstance(sourceScope, targetScope)) {
    if (client) {
      const fetchedStatus = await client.statuses.getStatus(statusId);
      importEntities(targetScope, { statuses: [fetchedStatus] });
    }
    return statusId;
  }

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

export { resolveStatus };
