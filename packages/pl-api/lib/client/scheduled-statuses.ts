import * as v from 'valibot';

import { scheduledStatusSchema } from '@/entities';

import type { PlApiBaseClient } from '@/client-base';
import type { GetScheduledStatusesParams } from '@/params/scheduled-statuses';
import type { EmptyObject } from '@/utils/types';

const scheduledStatuses = (client: PlApiBaseClient) => ({
  /**
   * View scheduled statuses
   * @see {@link https://docs.joinmastodon.org/methods/scheduled_statuses/#get}
   */
  getScheduledStatuses: (params?: GetScheduledStatusesParams) =>
    client.paginatedGet('/api/v1/scheduled_statuses', { params }, scheduledStatusSchema),

  /**
   * View a single scheduled status
   * @see {@link https://docs.joinmastodon.org/methods/scheduled_statuses/#get-one}
   */
  getScheduledStatus: async (scheduledStatusId: string) => {
    const response = await client.request(`/api/v1/scheduled_statuses/${scheduledStatusId}`);

    return v.parse(scheduledStatusSchema, response.json);
  },

  /**
   * Update a scheduled status’s publishing date
   * @see {@link https://docs.joinmastodon.org/methods/scheduled_statuses/#update}
   */
  updateScheduledStatus: async (scheduledStatusId: string, scheduled_at: string) => {
    const response = await client.request(`/api/v1/scheduled_statuses/${scheduledStatusId}`, {
      method: 'PUT',
      body: { scheduled_at },
    });

    return v.parse(scheduledStatusSchema, response.json);
  },

  /**
   * Cancel a scheduled status
   * @see {@link https://docs.joinmastodon.org/methods/scheduled_statuses/#cancel}
   */
  cancelScheduledStatus: async (scheduledStatusId: string) => {
    const response = await client.request<EmptyObject>(
      `/api/v1/scheduled_statuses/${scheduledStatusId}`,
      {
        method: 'DELETE',
      },
    );

    return response.json;
  },
});

export { scheduledStatuses };
