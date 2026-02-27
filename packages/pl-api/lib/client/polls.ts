import * as v from 'valibot';

import { pollSchema } from '@/entities';

import type { PlApiBaseClient } from '@/client-base';

const polls = (client: PlApiBaseClient) => ({
  /**
   * View a poll
   * View a poll attached to a status.
   * @see {@link https://docs.joinmastodon.org/methods/polls/#get}
   */
  getPoll: async (pollId: string) => {
    const response = await client.request(`/api/v1/polls/${pollId}`);

    return v.parse(pollSchema, response.json);
  },

  /**
   * Vote on a poll
   * Vote on a poll attached to a status.
   * @see {@link https://docs.joinmastodon.org/methods/polls/#vote}
   */
  vote: async (pollId: string, choices: number[]) => {
    const response = await client.request(`/api/v1/polls/${pollId}/votes`, {
      method: 'POST',
      body: { choices },
    });

    return v.parse(pollSchema, response.json);
  },
});

export { polls };
