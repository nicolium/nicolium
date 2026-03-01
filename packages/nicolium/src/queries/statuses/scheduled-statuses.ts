import { infiniteQueryOptions } from '@tanstack/react-query';

import { getClient } from '@/api';
import { removePageItem } from '@/utils/queries';

import { queryKeys } from '../keys';
import { makePaginatedResponseQueryOptions } from '../utils/make-paginated-response-query-options';
import { mutationOptions } from '../utils/mutation-options';

const scheduledStatusesQueryOptions = makePaginatedResponseQueryOptions(
  queryKeys.scheduledStatuses.all,
  (client) => client.scheduledStatuses.getScheduledStatuses(),
)();

const scheduledStatusesCountQueryOptions = infiniteQueryOptions({
  ...scheduledStatusesQueryOptions,
  select: (data) => data.pages.flatMap((page) => page.items).length,
});

const cancelScheduledStatusMutationOptions = (scheduledStatusId: string) =>
  mutationOptions({
    mutationKey: ['scheduledStatuses', scheduledStatusId],
    mutationFn: () => getClient().scheduledStatuses.cancelScheduledStatus(scheduledStatusId),
    onSettled: () => {
      removePageItem(
        queryKeys.scheduledStatuses.all,
        scheduledStatusId,
        (status: { id: string }, id: string) => status.id === id,
        true,
      );
    },
  });

export {
  scheduledStatusesQueryOptions,
  scheduledStatusesCountQueryOptions,
  cancelScheduledStatusMutationOptions,
};
