import * as v from 'valibot';

import { interactionRequestSchema } from '../entities';

import type { PlApiBaseClient } from '../client-base';
import type { GetInteractionRequestsParams } from '../params/interaction-requests';

const interactionRequests = (client: PlApiBaseClient) => ({
  /**
   * Get an array of interactions requested on your statuses by other accounts, and pending your approval.
   *
   * Requires features{@link Features.interactionRequests}.
   */
  getInteractionRequests: (params?: GetInteractionRequestsParams) =>
    client.paginatedGet('/api/v1/interaction_requests', { params }, interactionRequestSchema),

  /**
   * Get interaction request with the given ID.
   *
   * Requires features{@link Features.interactionRequests}.
   */
  getInteractionRequest: async (interactionRequestId: string) => {
    const response = await client.request(`/api/v1/interaction_requests/${interactionRequestId}`);

    return v.parse(interactionRequestSchema, response.json);
  },

  /**
   * Accept/authorize/approve an interaction request with the given ID.
   *
   * Requires features{@link Features.interactionRequests}.
   */
  authorizeInteractionRequest: async (interactionRequestId: string) => {
    const response = await client.request(
      `/api/v1/interaction_requests/${interactionRequestId}/authorize`,
      { method: 'POST' },
    );

    return v.parse(interactionRequestSchema, response.json);
  },

  /**
   * Reject an interaction request with the given ID.
   *
   * Requires features{@link Features.interactionRequests}.
   */
  rejectInteractionRequest: async (interactionRequestId: string) => {
    const response = await client.request(
      `/api/v1/interaction_requests/${interactionRequestId}/authorize`,
      { method: 'POST' },
    );

    return v.parse(interactionRequestSchema, response.json);
  },
});

export { interactionRequests };
