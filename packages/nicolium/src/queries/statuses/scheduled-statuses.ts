import { useMutation } from '@tanstack/react-query';

import { useClient } from '@/hooks/use-client';
import { removePageItem } from '@/utils/queries';

import { queryKeys } from '../keys';
import { makePaginatedResponseQuery } from '../utils/make-paginated-response-query';
import { makePaginatedResponseQueryOptions } from '../utils/make-paginated-response-query-options';

const useScheduledStatusesQuery = makePaginatedResponseQuery(
  queryKeys.scheduledStatuses.all,
  (client) => client.scheduledStatuses.getScheduledStatuses(),
  undefined,
  'isLoggedIn',
  undefined,
  'scheduledStatuses',
);

const useScheduledStatusesCountQuery = makePaginatedResponseQuery(
  queryKeys.scheduledStatuses.all,
  (client) => client.scheduledStatuses.getScheduledStatuses(),
  (data) => data.pages.flatMap((page) => page.items).length,
  'isLoggedIn',
  undefined,
  'scheduledStatuses',
);

const scheduledStatusesQueryOptions = makePaginatedResponseQueryOptions(
  queryKeys.scheduledStatuses.all,
  (client) => client.scheduledStatuses.getScheduledStatuses(),
);

const useCancelScheduledStatusMutation = (scheduledStatusId: string) => {
  const client = useClient();

  return useMutation({
    mutationKey: ['scheduledStatuses', scheduledStatusId],
    mutationFn: () => client.scheduledStatuses.cancelScheduledStatus(scheduledStatusId),
    onSettled: () => {
      removePageItem(
        queryKeys.scheduledStatuses.all,
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
