import { useMutation } from '@tanstack/react-query';

import { useClient } from '@/hooks/use-client';
import { importEntities } from '@/queries/utils/import-entities';
import { useStatusMetaActions } from '@/stores/status-meta';
import { useTimelinesActions } from '@/stores/timelines';

import type { AdminUpdateStatusParams } from 'pl-api';

const useAdminDeleteStatusMutation = (statusId: string) => {
  const client = useClient();
  const { deleteStatus: deleteTimelineStatus } = useTimelinesActions();
  const { markStatusDeleted } = useStatusMetaActions();

  return useMutation({
    mutationKey: ['admin', 'statuses', statusId],
    mutationFn: () => client.admin.statuses.deleteStatus(statusId),
    onSuccess: () => {
      deleteTimelineStatus(statusId);
      markStatusDeleted(statusId);
    },
  });
};

const useAdminUpdateStatusMutation = (statusId: string) => {
  const client = useClient();

  return useMutation({
    mutationKey: ['admin', 'statuses', statusId, 'sensitivity'],
    mutationFn: (params: AdminUpdateStatusParams) =>
      client.admin.statuses.updateStatus(statusId, params),
    onSuccess: (status) => {
      importEntities({ statuses: [status] });
    },
  });
};

export { useAdminDeleteStatusMutation, useAdminUpdateStatusMutation };
