import { useMutation } from '@tanstack/react-query';

import { useClient } from '@/hooks/use-client';
import { useScopeUrl } from '@/hooks/use-scope-url';
import { scopedQueryKey, useAppQuery } from '@/queries/query';

import { queryClient } from '../client';
import { queryKeys } from '../keys';

const useBackups = () => {
  const client = useClient();

  return useAppQuery({
    queryKey: queryKeys.settings.backups,
    queryFn: () => client.settings.getBackups(),
    select: (backups) => backups.toSorted((a, b) => b.inserted_at.localeCompare(a.inserted_at)),
  });
};

const useCreateBackupMutation = () => {
  const client = useClient();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationKey: ['settings', 'backups'],
    mutationFn: () => client.settings.createBackup(),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: scopedQueryKey(queryKeys.settings.backups, scopeUrl),
      }),
  });
};

export { useBackups, useCreateBackupMutation };
