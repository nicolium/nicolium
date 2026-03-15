import { infiniteQueryOptions, useMutation } from '@tanstack/react-query';

import { useClient } from '@/hooks/use-client';
import { removePageItem } from '@/utils/queries';

import { queryKeys } from '../keys';
import { makePaginatedResponseQueryOptions } from '../utils/make-paginated-response-query-options';

import type { PlApiClient } from 'pl-api';

const scheduledStatusesQueryOptions = makePaginatedResponseQueryOptions(
  queryKeys.scheduledStatuses.all,
  (client) => client.scheduledStatuses.getScheduledStatuses(),
);

const scheduledStatusesCountQueryOptions = (client: PlApiClient) =>
  infiniteQueryOptions({
    ...scheduledStatusesQueryOptions(client),
    select: (data) => data.pages.flatMap((page) => page.items).length,
  });

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
  scheduledStatusesQueryOptions,
  scheduledStatusesCountQueryOptions,
  useCancelScheduledStatusMutation,
};
