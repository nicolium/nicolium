import { useMutation } from '@tanstack/react-query';

import { useClient } from '@/contexts/current-account-context';
import { useScopeUrl } from '@/hooks/use-scope-url';

import { queryKeys } from '../keys';
import { scopedQueryKey } from '../query';
import { removePageItem } from '../utils';
import { makePaginatedResponseQuery } from '../utils/make-paginated-response-query';
import { makePaginatedResponseQueryOptions } from '../utils/make-paginated-response-query-options';

const useScheduledStatusesQuery = makePaginatedResponseQuery(
  queryKeys.scheduledStatuses.all,
  (client) => client.scheduledStatuses.getScheduledStatuses(),
  undefined,
  undefined,
  undefined,
  'scheduledStatuses',
);

const useScheduledStatusesCountQuery = makePaginatedResponseQuery(
  queryKeys.scheduledStatuses.all,
  (client) => client.scheduledStatuses.getScheduledStatuses(),
  (data) => data.pages.flatMap((page) => page.items).length,
  undefined,
  undefined,
  'scheduledStatuses',
);

const scheduledStatusesQueryOptions = makePaginatedResponseQueryOptions(
  queryKeys.scheduledStatuses.all,
  (client) => client.scheduledStatuses.getScheduledStatuses(),
);

const useCancelScheduledStatusMutation = (scheduledStatusId: string) => {
  const client = useClient();
  const scopeUrl = useScopeUrl();

  return useMutation({
    mutationKey: ['scheduledStatuses', scheduledStatusId],
    mutationFn: () => client.scheduledStatuses.cancelScheduledStatus(scheduledStatusId),
    onSettled: () => {
      removePageItem(
        scopedQueryKey(queryKeys.scheduledStatuses.all, scopeUrl),
        scheduledStatusId,
        (status: { id: string }, id: string) => status.id === id,
        true,
      );
    },
  });
};

export {
  useScheduledStatusesQuery,
  useScheduledStatusesCountQuery,
  scheduledStatusesQueryOptions,
  useCancelScheduledStatusMutation,
};
