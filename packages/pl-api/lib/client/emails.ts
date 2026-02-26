import type { PlApiBaseClient } from '../client-base';

type EmptyObject = Record<string, never>;

const emails = (client: PlApiBaseClient) => ({
  resendConfirmationEmail: async (email: string) => {
    const response = await client.request<EmptyObject>('/api/v1/emails/confirmations', {
      method: 'POST',
      body: { email },
    });

    return response.json;
  },
});

export { emails };
